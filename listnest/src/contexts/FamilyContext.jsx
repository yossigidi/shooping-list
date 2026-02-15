import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, firestore } from '../services/firebase';
import { useAuth } from './AuthContext';
import { useChildAuth } from './ChildAuthContext';

const FamilyContext = createContext(null);

export function FamilyProvider({ children }) {
  const { user } = useAuth();
  const { childUser } = useChildAuth();
  const [family, setFamily] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [lists, setLists] = useState([]);
  const [currentList, setCurrentList] = useState(null);
  const [activities, setActivities] = useState([]);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'syncing', 'offline'

  // Get the current active user (either parent or child)
  const activeUser = user || (childUser ? {
    uid: childUser.childId,
    displayName: childUser.displayName,
    isChild: true,
    familyId: childUser.familyId
  } : null);

  // Load family data when user logs in (matching original implementation)
  useEffect(() => {
    console.log('FamilyContext: useEffect triggered', { user: user?.uid, childUser: childUser?.childId });

    if (!user && !childUser) {
      console.log('FamilyContext: No user, setting loading false');
      setFamily(null);
      setFamilyMembers([]);
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let unsubscribeProducts = null;

    // For child users with known familyId
    if (childUser?.familyId) {
      console.log('FamilyContext: Loading child user family:', childUser.familyId);
      const unsubscribeFamily = firestore.onSnapshot(
        firestore.doc(db, 'families', childUser.familyId),
        (doc) => {
          console.log('FamilyContext: Child family doc received', doc.exists());
          if (doc.exists()) {
            const data = doc.data();
            setFamily({ id: doc.id, ...data });
            setFamilyMembers(data.memberDetails || data.members || []);
          } else {
            setFamily(null);
            setFamilyMembers([]);
          }
          setLoading(false);
        },
        (error) => {
          console.error('FamilyContext: Child family error:', error);
          setLoading(false);
        }
      );

      return () => unsubscribeFamily();
    }

    // For regular users - query all families and find membership
    console.log('FamilyContext: Loading families for user:', user?.uid);

    // Timeout fallback - if Firebase doesn't respond in 10 seconds, stop loading
    const timeoutId = setTimeout(() => {
      console.warn('FamilyContext: Timeout reached, setting loading to false');
      setLoading(false);
    }, 10000);

    const familiesRef = firestore.collection(db, 'families');
    const q = firestore.query(familiesRef);

    const unsubscribeFamily = firestore.onSnapshot(q, (snapshot) => {
      clearTimeout(timeoutId);
      console.log('FamilyContext: Families snapshot received, count:', snapshot.size);
      let userFamily = null;

      snapshot.forEach((doc) => {
        const data = doc.data();
        // Check if user is a member (members can be array of objects with userId)
        const isMember = data.members?.some(m => m.userId === user?.uid) ||
                         data.memberIds?.includes(user?.uid);
        console.log('FamilyContext: Checking family', doc.id, 'isMember:', isMember);
        if (isMember) {
          userFamily = { id: doc.id, ...data };
        }
      });

      console.log('FamilyContext: User family found:', userFamily?.id || 'none');

      if (userFamily) {
        setFamily(userFamily);
        setFamilyMembers(userFamily.memberDetails || userFamily.members || []);

        // Subscribe to lists for this family
        console.log('FamilyContext: Family found, subscribing to lists');
        const listsRef = firestore.collection(db, 'lists');
        const listsQuery = firestore.query(
          listsRef,
          firestore.where('familyId', '==', userFamily.id)
        );

        unsubscribeProducts = firestore.onSnapshot(
          listsQuery,
          (listsSnapshot) => {
            const listsData = [];
            listsSnapshot.forEach(doc => {
              listsData.push({ id: doc.id, ...doc.data() });
            });
            console.log('FamilyContext: Lists loaded:', listsData.length);
            setLists(listsData);

            // Set current list to default or first list
            const defaultList = listsData.find(l => l.isDefault) || listsData[0];
            if (defaultList && !currentList) {
              setCurrentList(defaultList);
            }
            setSyncStatus('synced');
          },
          (error) => {
            console.error('FamilyContext: Lists subscription error:', error);
            if (error.code === 'unavailable') {
              setSyncStatus('offline');
            }
          }
        );
      } else {
        setFamily(null);
        setFamilyMembers([]);
        setProducts([]);
        setLists([]);
        setCurrentList(null);
      }

      setLoading(false);
    }, (error) => {
      clearTimeout(timeoutId);
      console.error('FamilyContext: Families query error:', error);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribeFamily();
      if (unsubscribeProducts) unsubscribeProducts();
    };
  }, [user, childUser]);

  // Create a new family
  const createFamily = async (name, role) => {
    if (!user) throw new Error('Must be logged in to create family');

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const isParent = role === 'parent_father' || role === 'parent_mother';
    const newMember = {
      userId: user.uid,
      email: user.email,
      displayName: user.displayName || user.email || 'אנונימי',
      joinedAt: new Date(),
      role: isParent ? 'admin' : 'member',
      familyRole: role,
      isParent: isParent
    };

    const familyData = {
      name,
      code,
      createdAt: firestore.serverTimestamp(),
      createdBy: user.uid,
      adminId: user.uid,
      members: [newMember],
      memberIds: [user.uid],
      childAccounts: [],
      childInviteTokens: []
    };

    const docRef = await firestore.addDoc(
      firestore.collection(db, 'families'),
      familyData
    );

    return { id: docRef.id, code };
  };

  // Join an existing family
  const joinFamily = async (code, role) => {
    if (!user) return { success: false, error: 'לא מחובר' };

    try {
      const familiesRef = firestore.collection(db, 'families');
      const q = firestore.query(familiesRef, firestore.where('code', '==', code.toUpperCase()));
      const snapshot = await firestore.getDocs(q);

      if (snapshot.empty) {
        return { success: false, error: 'קוד לא נמצא' };
      }

      const familyDoc = snapshot.docs[0];
      const familyData = familyDoc.data();

      // Check if already a member
      if (familyData.members?.some(m => m.userId === user.uid) ||
          familyData.memberIds?.includes(user.uid)) {
        return { success: false, error: 'כבר חבר במשפחה זו' };
      }

      const isParent = role.startsWith('parent');
      const isTeen = role === 'teen';

      const newMember = {
        userId: user.uid,
        email: user.email,
        displayName: user.displayName || user.email || 'אנונימי',
        joinedAt: new Date(),
        role: isParent ? 'admin' : (isTeen ? 'teen' : 'member'),
        familyRole: role,
        isParent: isParent,
        isTeen: isTeen
      };

      await firestore.updateDoc(firestore.doc(db, 'families', familyDoc.id), {
        members: firestore.arrayUnion(newMember),
        memberIds: firestore.arrayUnion(user.uid)
      });

      return { success: true, id: familyDoc.id, name: familyData.name };
    } catch (err) {
      console.error('joinFamily error:', err);
      return { success: false, error: err.message || 'שגיאה בהצטרפות למשפחה' };
    }
  };

  // Add product to shopping list
  const addProduct = async (product) => {
    if (!family) throw new Error('No family selected');

    setSyncStatus('syncing');

    const productData = {
      name: product.name,
      quantity: product.quantity || 1,
      unit: product.unit || 'pcs',
      category: product.category || 'other',
      purchased: false,
      note: product.note || '',
      addedBy: activeUser?.displayName || 'Unknown',
      addedByUid: activeUser?.uid || activeUser?.childId,
      createdAt: firestore.serverTimestamp(),
      updatedAt: firestore.serverTimestamp()
    };

    await firestore.addDoc(
      firestore.collection(db, 'families', family.id, 'products'),
      productData
    );
  };

  // Update product
  const updateProduct = async (productId, updates) => {
    if (!family) throw new Error('No family selected');

    setSyncStatus('syncing');

    await firestore.updateDoc(
      firestore.doc(db, 'families', family.id, 'products', productId),
      {
        ...updates,
        updatedAt: firestore.serverTimestamp()
      }
    );
  };

  // Delete product
  const deleteProduct = async (productId) => {
    if (!family) throw new Error('No family selected');

    setSyncStatus('syncing');

    await firestore.deleteDoc(
      firestore.doc(db, 'families', family.id, 'products', productId)
    );
  };

  // Toggle product purchased status
  const togglePurchased = async (productId, purchased) => {
    if (!family) throw new Error('No family selected');

    await updateProduct(productId, {
      purchased,
      purchasedBy: purchased ? (activeUser?.displayName || 'Unknown') : null,
      purchasedAt: purchased ? new Date().toISOString() : null
    });
  };

  // Clear all purchased products
  const clearPurchased = async () => {
    if (!family) throw new Error('No family selected');

    const purchasedProducts = products.filter(p => p.purchased);
    for (const product of purchasedProducts) {
      await deleteProduct(product.id);
    }
  };

  // Delete all products
  const deleteAllProducts = async () => {
    if (!family) throw new Error('No family selected');

    for (const product of products) {
      await deleteProduct(product.id);
    }
  };

  // Log activity
  const logActivity = async (type, details = {}, overrideFamilyId = null) => {
    const activeUid = user?.uid || childUser?.childId;
    if (!activeUid) return;
    const fid = overrideFamilyId || family?.id;
    if (!fid) return;

    try {
      await firestore.addDoc(
        firestore.collection(db, 'activity'),
        {
          familyId: fid,
          listId: currentList?.id || null,
          type: type,
          userId: activeUid,
          userName: user?.displayName || childUser?.displayName || user?.email || 'אנונימי',
          timestamp: new Date(),
          ...details
        }
      );
    } catch (err) {
      console.warn('Failed to log activity:', err);
    }
  };

  // Create a new list
  const createList = async (name) => {
    if (!family) throw new Error('No family selected');

    const listData = {
      name,
      familyId: family.id,
      createdAt: firestore.serverTimestamp(),
      createdBy: user?.uid || childUser?.childId,
      isDefault: lists.length === 0
    };

    const docRef = await firestore.addDoc(
      firestore.collection(db, 'lists'),
      listData
    );

    await logActivity('list_created', { listName: name });

    return { id: docRef.id, ...listData };
  };

  // Check if user is admin
  const isAdmin = family?.adminId === user?.uid ||
                  family?.members?.some(m => m.userId === user?.uid && m.role === 'admin');

  // Check if user can invite
  const canInvite = isAdmin || family?.members?.some(m => m.userId === user?.uid && m.isTeen);

  // Check if user is teen
  const isTeen = family?.members?.some(m => m.userId === user?.uid && m.isTeen);

  // Leave family
  const leaveFamily = async () => {
    if (!family || !user) return;

    const memberToRemove = family.members.find(m => m.userId === user.uid);
    if (!memberToRemove) return;

    await firestore.updateDoc(firestore.doc(db, 'families', family.id), {
      members: firestore.arrayRemove(memberToRemove),
      memberIds: firestore.arrayRemove(user.uid)
    });

    await logActivity('member_left', { memberName: user.displayName || user.email });
  };

  // Remove member (admin only)
  const removeMember = async (memberId) => {
    if (!family || !isAdmin) return;

    const memberToRemove = family.members.find(m => m.userId === memberId);
    if (!memberToRemove) return;

    await firestore.updateDoc(firestore.doc(db, 'families', family.id), {
      members: firestore.arrayRemove(memberToRemove),
      memberIds: firestore.arrayRemove(memberId)
    });
  };

  // Delete child account
  const deleteChildAccount = async (childId) => {
    if (!family || !isAdmin) return;

    const childToRemove = family.childAccounts?.find(c => c.id === childId);
    if (!childToRemove) return;

    await firestore.updateDoc(firestore.doc(db, 'families', family.id), {
      childAccounts: firestore.arrayRemove(childToRemove)
    });
  };

  const value = {
    family,
    familyMembers,
    products,
    lists,
    currentList,
    setCurrentList,
    loading,
    syncStatus,
    activeUser,
    isAdmin,
    canInvite,
    isTeen,
    createFamily,
    joinFamily,
    createList,
    addProduct,
    updateProduct,
    deleteProduct,
    togglePurchased,
    clearPurchased,
    deleteAllProducts,
    logActivity,
    leaveFamily,
    removeMember,
    deleteChildAccount,
    hasFamily: !!family
  };

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}

export default FamilyContext;
