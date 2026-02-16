// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  where,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  getDoc,
  setDoc
} from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset
} from 'firebase/auth';

// Firebase configuration - using environment variables in production
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD3pwFMmo4mMjxgzUz5oPynt0D68Yy3Iz0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "shooping-list-d846b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "shooping-list-d846b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "shooping-list-d846b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1099114666122",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1099114666122:web:5c704bf2da52aa3ca63573"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with offline persistence (with fallback)
let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
  console.log('Firestore initialized with persistence');
} catch (e) {
  console.warn('Firestore persistence failed, using simple mode:', e);
  db = getFirestore(app);
}
export { db };

// Initialize Auth
export const auth = getAuth(app);

// Export Firestore functions for convenience
export const firestore = {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  where,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  getDoc,
  setDoc
};

// Export Auth functions for convenience
export const firebaseAuth = {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset
};

// Price Comparison API Service
export const PriceComparisonAPI = {
  BASE_URL: '/api/compare',
  SUPABASE_URL: '/api/prices',

  async getChains() {
    try {
      const response = await fetch(`${this.SUPABASE_URL}?action=chains`);
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      return data.chains || [];
    } catch (e) {
      console.warn('Chains API error:', e);
      return [];
    }
  },

  async searchProductPrices(productName) {
    try {
      const response = await fetch(
        `${this.BASE_URL}?action=search&q=${encodeURIComponent(productName)}`
      );
      if (!response.ok) throw new Error('API Error');
      return await response.json();
    } catch (e) {
      console.warn('Price API error:', e);
      return this._fallbackProductSearch(productName);
    }
  },

  async compareShoppingList(items) {
    try {
      const response = await fetch(`${this.BASE_URL}?action=compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            name: i.name,
            quantity: i.quantity || 1
          }))
        })
      });
      if (!response.ok) throw new Error('API Error');
      return await response.json();
    } catch (e) {
      console.warn('Price API error:', e);
      return this._fallbackListComparison(items);
    }
  },

  async optimizeBasket(items, maxChains = 2, strategy = 'optimal') {
    try {
      const response = await fetch(`${this.BASE_URL}?action=optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            name: i.name,
            quantity: i.quantity || 1
          })),
          max_chains: maxChains,
          strategy: strategy
        })
      });
      if (!response.ok) throw new Error('API Error');
      return await response.json();
    } catch (e) {
      console.warn('Price API error:', e);
      return this._fallbackOptimization(items);
    }
  },

  _fallbackProductSearch(productName) {
    const encoded = encodeURIComponent(productName);
    return {
      fallback: true,
      product: { name: productName },
      prices: [
        { chain_name_he: 'Shufersal', price: null, url: `https://www.shufersal.co.il/online/he/search?text=${encoded}` },
        { chain_name_he: 'Rami Levy', price: null, url: `https://www.rami-levy.co.il/he/online/search?q=${encoded}` },
        { chain_name_he: 'Victory', price: null, url: `https://www.victoryonline.co.il/search?q=${encoded}` }
      ]
    };
  },

  _fallbackListComparison(items) {
    const chains = [
      { id: 1, name: 'Shufersal', color: '#dc2626', url: 'https://www.shufersal.co.il' },
      { id: 2, name: 'Rami Levy', color: '#2563eb', url: 'https://www.rami-levy.co.il' },
      { id: 3, name: 'Victory', color: '#ea580c', url: 'https://www.victoryonline.co.il' }
    ];
    return {
      fallback: true,
      comparison: chains.map(c => ({
        chain_id: c.id,
        chain_name_he: c.name,
        color: c.color,
        url: c.url,
        total: null,
        items_found: 0
      })),
      items_analyzed: items.length,
      message: 'Unable to compare at this time'
    };
  },

  _fallbackOptimization(items) {
    return {
      fallback: true,
      strategy: 'fallback',
      message: 'Unable to optimize at this time',
      shopping_plan: []
    };
  }
};

// Lazy loaders for external libraries
export const loadTesseract = () => {
  return new Promise((resolve, reject) => {
    if (window.Tesseract) {
      resolve(window.Tesseract);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/tesseract.js@5.0.4/dist/tesseract.min.js';
    script.onload = () => resolve(window.Tesseract);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export const loadQuagga = () => {
  return new Promise((resolve, reject) => {
    if (window.Quagga) {
      resolve(window.Quagga);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@ericblade/quagga2@1.8.4/dist/quagga.min.js';
    script.onload = () => resolve(window.Quagga);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Fetch product info from Open Food Facts by barcode
export const fetchProductByBarcode = async (barcode) => {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    const data = await response.json();
    if (data.status === 1 && data.product) {
      return {
        name: data.product.product_name_he || data.product.product_name || data.product.generic_name || null,
        brand: data.product.brands || null,
        image: data.product.image_front_small_url || null,
        categories: data.product.categories_tags || [],
        found: true
      };
    }
    return { found: false };
  } catch (err) {
    console.error('Open Food Facts API error:', err);
    return { found: false };
  }
};

export default app;
