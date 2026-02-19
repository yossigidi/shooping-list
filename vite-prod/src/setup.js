// Setup global variables that the production app code expects
// This replaces the CDN-loaded Firebase module script

import qrcode from 'qrcode-generator';
import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
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
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  indexedDBLocalPersistence,
  setPersistence
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD3pwFMmo4mMjxgzUz5oPynt0D68Yy3Iz0",
  authDomain: "shooping-list-d846b.firebaseapp.com",
  projectId: "shooping-list-d846b",
  storageBucket: "shooping-list-d846b.firebasestorage.app",
  messagingSenderId: "1099114666122",
  appId: "1:1099114666122:web:5c704bf2da52aa3ca63573"
};

const app = initializeApp(firebaseConfig);

// Enable offline persistence with multi-tab support
window.db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

window.auth = getAuth(app);

// Set explicit persistence for TWA compatibility
setPersistence(window.auth, indexedDBLocalPersistence).then(() => {
  console.log('Firebase Auth persistence set to IndexedDB');
}).catch((err) => {
  console.warn('Could not set IndexedDB persistence, using default:', err);
});

window.firestore = {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot,
  query, orderBy, getDocs, where, serverTimestamp,
  arrayUnion, arrayRemove, getDoc, setDoc
};

window.firebaseAuth = {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset
};

// Lazy load Tesseract.js only when scanning is initiated
window.loadTesseract = function() {
  return new Promise((resolve, reject) => {
    if (window.Tesseract) { resolve(window.Tesseract); return; }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/tesseract.js@5.0.4/dist/tesseract.min.js';
    script.onload = () => resolve(window.Tesseract);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Lazy load QuaggaJS for barcode scanning
window.loadQuagga = function() {
  return new Promise((resolve, reject) => {
    if (window.Quagga) { resolve(window.Quagga); return; }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@ericblade/quagga2@1.8.4/dist/quagga.min.js';
    script.onload = () => resolve(window.Quagga);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Fetch product info from Open Food Facts by barcode
window.fetchProductByBarcode = async function(barcode) {
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

// PriceComparisonAPI
window.PriceComparisonAPI = {
  BASE_URL: '/api/compare',
  SUPABASE_URL: '/api/prices',
  async getChains() {
    try {
      const response = await fetch(`${this.SUPABASE_URL}?action=chains`);
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      return data.chains || [];
    } catch (e) { console.warn('Chains API error:', e); return []; }
  },
  async searchProductPrices(productName) {
    try {
      const response = await fetch(`${this.BASE_URL}?action=search&q=${encodeURIComponent(productName)}`);
      if (!response.ok) throw new Error('API Error');
      return await response.json();
    } catch (e) { console.warn('Price API error:', e); return this._fallbackProductSearch(productName); }
  },
  async compareShoppingList(items) {
    try {
      const response = await fetch(`${this.BASE_URL}?action=compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map(i => ({ name: i.name, quantity: i.quantity || 1 })) })
      });
      if (!response.ok) throw new Error('API Error');
      return await response.json();
    } catch (e) { console.warn('Price API error:', e); return this._fallbackListComparison(items); }
  },
  async optimizeBasket(items, maxChains = 2, strategy = 'optimal') {
    try {
      const response = await fetch(`${this.BASE_URL}?action=optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map(i => ({ name: i.name, quantity: i.quantity || 1 })), max_chains: maxChains, strategy })
      });
      if (!response.ok) throw new Error('API Error');
      return await response.json();
    } catch (e) { console.warn('Price API error:', e); return this._fallbackOptimization(items); }
  },
  _fallbackProductSearch(productName) {
    const encoded = encodeURIComponent(productName);
    return {
      fallback: true, product: { name: productName },
      prices: [
        { chain_name_he: 'שופרסל', price: null, url: `https://www.shufersal.co.il/online/he/search?text=${encoded}` },
        { chain_name_he: 'רמי לוי', price: null, url: `https://www.rami-levy.co.il/he/online/search?q=${encoded}` },
        { chain_name_he: 'ויקטורי', price: null, url: `https://www.victoryonline.co.il/search?q=${encoded}` },
        { chain_name_he: 'יינות ביתן', price: null, url: `https://www.ybitan.co.il/search?q=${encoded}` },
        { chain_name_he: 'חצי חינם', price: null, url: `https://shop.hazi-hinam.co.il/search?q=${encoded}` }
      ]
    };
  },
  _fallbackListComparison(items) {
    return {
      fallback: true,
      comparison: [
        { chain_id: 1, chain_name_he: 'שופרסל', color: '#dc2626', url: 'https://www.shufersal.co.il', total: null, items_found: 0 },
        { chain_id: 2, chain_name_he: 'רמי לוי', color: '#2563eb', url: 'https://www.rami-levy.co.il', total: null, items_found: 0 },
        { chain_id: 3, chain_name_he: 'ויקטורי', color: '#ea580c', url: 'https://www.victoryonline.co.il', total: null, items_found: 0 },
        { chain_id: 4, chain_name_he: 'יינות ביתן', color: '#7c3aed', url: 'https://www.ybitan.co.il', total: null, items_found: 0 },
        { chain_id: 5, chain_name_he: 'חצי חינם', color: '#16a34a', url: 'https://shop.hazi-hinam.co.il', total: null, items_found: 0 }
      ],
      items_analyzed: items.length,
      message: 'לא ניתן להשוות כרגע'
    };
  },
  _fallbackOptimization(items) {
    return { fallback: true, strategy: 'fallback', message: 'לא ניתן לייעל כרגע', shopping_plan: [] };
  }
};

// Remove loading skeleton
window.hideLoadingSkeleton = function() {
  const skeleton = document.getElementById('loading-skeleton');
  if (skeleton && !skeleton.hiding) {
    skeleton.hiding = true;
    setTimeout(() => {
      skeleton.style.transition = 'opacity 1s ease-out';
      skeleton.style.opacity = '0';
      setTimeout(() => skeleton.remove(), 1000);
    }, 2000);
  }
};

// QR Code generator (used by family sharing)
window.qrcode = qrcode;

// Performance timing
window.appLoadStart = performance.now();
