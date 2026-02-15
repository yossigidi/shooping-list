import { createContext, useContext, useState, useEffect } from 'react';
import { db, firestore } from '../services/firebase';

const ChildAuthContext = createContext(null);

export function ChildAuthProvider({ children }) {
  const [childUser, setChildUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load child session from localStorage on mount
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('childSession');
      if (savedSession) {
        const session = JSON.parse(savedSession);
        // Check if session is still valid (24 hours)
        if (session.expiresAt && new Date(session.expiresAt) > new Date()) {
          setChildUser(session);
        } else {
          localStorage.removeItem('childSession');
        }
      }
    } catch (e) {
      localStorage.removeItem('childSession');
    }
    setLoading(false);
  }, []);

  // Hash PIN with family code as salt
  const hashPin = async (pin, salt) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Login child with PIN
  const loginChild = async (familyId, familyCode, childId, childName, pin) => {
    try {
      // Get family document to validate PIN
      const familyDoc = await firestore.getDoc(
        firestore.doc(db, 'families', familyId)
      );

      if (!familyDoc.exists()) {
        return { success: false, error: 'familyNotFound' };
      }

      const familyData = familyDoc.data();
      const childAccount = familyData.childAccounts?.find(c => c.childId === childId);

      if (!childAccount) {
        return { success: false, error: 'childNotFound' };
      }

      // Verify PIN
      const pinHash = await hashPin(pin, familyCode);

      if (pinHash !== childAccount.pinHash) {
        return { success: false, error: 'invalidPin' };
      }

      // Create session (24 hour expiry)
      const session = {
        childId: childId,
        displayName: childAccount.displayName,
        familyId: familyId,
        familyName: familyData.name,
        familyCode: familyCode,
        role: 'limited',
        familyRole: 'child',
        isChildAccount: true,
        loginAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      // Try to update lastLoginAt in Firestore
      try {
        const updatedChildAccounts = familyData.childAccounts.map(c =>
          c.childId === childId ? { ...c, lastLoginAt: new Date() } : c
        );
        await firestore.updateDoc(
          firestore.doc(db, 'families', familyId),
          { childAccounts: updatedChildAccounts }
        );
      } catch (updateError) {
        console.warn('Could not update lastLoginAt:', updateError);
      }

      localStorage.setItem('childSession', JSON.stringify(session));
      setChildUser(session);
      return { success: true };
    } catch (error) {
      console.error('Child login error:', error);
      return { success: false, error: 'loginFailed', details: error.message };
    }
  };

  // Login child with QR token
  const loginChildWithToken = async (token, displayName) => {
    try {
      // Query families for matching token
      const familiesRef = firestore.collection(db, 'families');
      const snapshot = await firestore.getDocs(familiesRef);

      let targetFamily = null;
      let targetToken = null;

      snapshot.forEach(doc => {
        const data = doc.data();
        const foundToken = data.childInviteTokens?.find(t =>
          t.token === token &&
          !t.usedAt &&
          new Date(t.expiresAt.toDate ? t.expiresAt.toDate() : t.expiresAt) > new Date()
        );
        if (foundToken) {
          targetFamily = { id: doc.id, ...data };
          targetToken = foundToken;
        }
      });

      if (!targetFamily || !targetToken) {
        return { success: false, error: 'invalidToken' };
      }

      // Create child account
      const childId = crypto.randomUUID ? crypto.randomUUID() :
        'child_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      const newChildAccount = {
        childId: childId,
        displayName: displayName,
        pinHash: null,
        createdAt: new Date(),
        createdBy: targetToken.createdBy,
        lastLoginAt: new Date(),
        role: 'limited',
        familyRole: 'child',
        isChildAccount: true
      };

      // Mark token as used and add child account
      const updatedTokens = targetFamily.childInviteTokens.map(t =>
        t.token === token ? { ...t, usedAt: new Date() } : t
      );

      await firestore.updateDoc(
        firestore.doc(db, 'families', targetFamily.id),
        {
          childAccounts: firestore.arrayUnion(newChildAccount),
          childInviteTokens: updatedTokens
        }
      );

      // Create session
      const session = {
        childId: childId,
        displayName: displayName,
        familyId: targetFamily.id,
        familyName: targetFamily.name,
        familyCode: targetFamily.code,
        role: 'limited',
        familyRole: 'child',
        isChildAccount: true,
        loginAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      localStorage.setItem('childSession', JSON.stringify(session));
      setChildUser(session);
      return { success: true };
    } catch (error) {
      console.error('Child token login error:', error);
      return { success: false, error: 'loginFailed' };
    }
  };

  // Logout child
  const logoutChild = () => {
    localStorage.removeItem('childSession');
    setChildUser(null);
  };

  const value = {
    childUser,
    loading,
    loginChild,
    loginChildWithToken,
    logoutChild,
    hashPin
  };

  return <ChildAuthContext.Provider value={value}>{children}</ChildAuthContext.Provider>;
}

export function useChildAuth() {
  const context = useContext(ChildAuthContext);
  if (!context) {
    throw new Error('useChildAuth must be used within a ChildAuthProvider');
  }
  return context;
}

export default ChildAuthContext;
