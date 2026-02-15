import { createContext, useContext, useState, useEffect } from 'react';
import { auth, firebaseAuth } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email, password, displayName) => {
    const result = await firebaseAuth.createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await firebaseAuth.updateProfile(result.user, { displayName });
    }
    return result;
  };

  const signIn = async (email, password) => {
    return firebaseAuth.signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    return firebaseAuth.signOut(auth);
  };

  const resetPassword = async (email) => {
    return firebaseAuth.sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (updates) => {
    if (auth.currentUser) {
      return firebaseAuth.updateProfile(auth.currentUser, updates);
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    logout,
    resetPassword,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
