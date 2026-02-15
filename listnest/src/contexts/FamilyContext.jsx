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
    if (!user && !childUser) {
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
      const unsubscribeFamily = firestore.onSnapshot(
        firestore.doc(db, 'families', childUser.familyId),
        (doc) => {
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
          console.error('Family subscription error:', error);
          setLoading(false);
        }
      );

      return () => unsubscribeFamily();
    }

    // For regular users - query all families and find membership
    const familiesRef = firestore.collection(db, 'families');
    const q = firestore.query(familiesRef);

    const unsubscribeFamily = firestore.onSnapshot(q, (snapshot) => {
      let userFamily = null;

      snapshot.forEach((doc) => {
        const data = doc.data();
        // Check if user is a member (members can be array of objects with userId)
        const isMember = data.members?.some(m => m.userId === user?.uid) ||
                         data.memberIds?.includes(user?.uid);
        if (isMember) {
          userFamily = { id: doc.id, ...data };
        }
      });

      if (userFamily) {
        setFamily(userFamily);
        setFamilyMembers(userFamily.memberDetails || userFamily.members || []);

        // Subscribe to products for this family
        const productsRef = firestore.collection(db, 'families', userFamily.id, 'products');
        const productsQuery = firestore.query(productsRef, firestore.orderBy('createdAt', 'desc'));

        unsubscribeProducts = firestore.onSnapshot(
          productsQuery,
          (snapshot) => {
            const productsList = [];
            snapshot.forEach(doc => {
              productsList.push({ id: doc.id, ...doc.data() });
            });
            setProducts(productsList);
            setSyncStatus('synced');
          },
          (error) => {
            console.error('Products subscription error:', error);
            if (error.code === 'unavailable') {
              setSyncStatus('offline');
            }
          }
        );
      } else {
        setFamily(null);
        setFamilyMembers([]);
        setProducts([]);
      }

      setLoading(false);
    }, (error) => {
      console.error('Families query error:', error);
      setLoading(false);
    });

    return () => {
      unsubscribeFamily();
      if (unsubscribeProducts) unsubscribeProducts();
    };
  }, [user, childUser]);

  // Create a new family
  const createFamily = async (name, role) => {
    if (!user) throw new Error('Must be logged in to create family');

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const familyData = {
      name,
      code,
      createdAt: firestore.serverTimestamp(),
      createdBy: user.uid,
      members: [user.uid],
      memberDetails: [{
        uid: user.uid,
        displayName: user.displayName || user.email,
        email: user.email,
        role: role,
        familyRole: role === 'father' || role === 'mother' ? 'admin' : 'limited',
        joinedAt: new Date().toISOString()
      }],
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
    if (!user) throw new Error('Must be logged in to join family');

    const familiesRef = firestore.collection(db, 'families');
    const q = firestore.query(familiesRef, firestore.where('code', '==', code.toUpperCase()));
    const snapshot = await firestore.getDocs(q);

    if (snapshot.empty) {
      throw new Error('Family not found');
    }

    const familyDoc = snapshot.docs[0];
    const familyData = familyDoc.data();

    if (familyData.members.includes(user.uid)) {
      throw new Error('Already a member of this family');
    }

    const newMember = {
      uid: user.uid,
      displayName: user.displayName || user.email,
      email: user.email,
      role: role,
      familyRole: role === 'father' || role === 'mother' ? 'admin' : 'limited',
      joinedAt: new Date().toISOString()
    };

    await firestore.updateDoc(firestore.doc(db, 'families', familyDoc.id), {
      members: firestore.arrayUnion(user.uid),
      memberDetails: firestore.arrayUnion(newMember)
    });

    return { id: familyDoc.id, name: familyData.name };
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

  const value = {
    family,
    familyMembers,
    products,
    loading,
    syncStatus,
    activeUser,
    createFamily,
    joinFamily,
    addProduct,
    updateProduct,
    deleteProduct,
    togglePurchased,
    clearPurchased,
    deleteAllProducts,
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
