import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useFamily } from '../../contexts/FamilyContext';
import { useAuth } from '../../contexts/AuthContext';
import { useChildAuth } from '../../contexts/ChildAuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import SwipeableItem from '../common/SwipeableItem';
import ConfettiBurst from '../common/ConfettiBurst';
import VoiceInput from '../common/VoiceInput';
import { CATEGORIES, PRODUCTS, CATEGORY_TO_TRANSLATION } from '../../data/categories';
import { ISRAELI_HOLIDAYS, getUpcomingHolidays, getHolidayRecommendations } from '../../data/holidays';
import { db, firestore, firebaseAuth, PriceComparisonAPI, loadTesseract, loadQuagga, fetchProductByBarcode } from '../../services/firebase';
import { getEstimatedPrice, calculateItemPrice, getPriceSearchSuggestions } from '../../utils/priceUtils';
import {
  PriceComparisonModal,
  PromotionsModal,
  CalendarModal,
  AIAssistantModal,
  SavedListsModal,
  AccessibilityModal,
  CreateListModal,
  ItemNoteModal,
  ReminderModal,
  BarcodeScannerModal,
  ImportWhatsAppModal
} from '../modals';
import { FamilyChat } from '../chat';
import { FamilySettingsModal } from '../family';

// English to Hebrew product translations
const ENGLISH_TO_HEBREW = {
  'milk': 'חלב', 'eggs': 'ביצים', 'egg': 'ביצים', 'cheese': 'גבינה', 'butter': 'חמאה',
  'yogurt': 'יוגורט', 'cream': 'שמנת', 'cottage': 'קוטג\'', 'bread': 'לחם', 'pita': 'פיתה',
  'apple': 'תפוח', 'banana': 'בננה', 'orange': 'תפוז', 'tomato': 'עגבניה', 'cucumber': 'מלפפון',
  'onion': 'בצל', 'garlic': 'שום', 'potato': 'תפוח אדמה', 'carrot': 'גזר', 'pepper': 'פלפל',
  'chicken': 'עוף', 'beef': 'בקר', 'fish': 'דג', 'rice': 'אורז', 'pasta': 'פסטה',
  'oil': 'שמן', 'sugar': 'סוכר', 'salt': 'מלח', 'coffee': 'קפה', 'tea': 'תה',
  'water': 'מים', 'juice': 'מיץ', 'wine': 'יין', 'beer': 'בירה'
};

// Get numeric quantity from string or number
const getQuantityNumber = (qty) => {
  if (typeof qty === 'number') return qty;
  const match = String(qty).match(/^([\d.]+)/);
  return match ? parseFloat(match[1]) : 1;
};

function ShoppingList() {
  const { user } = useAuth();
  const { childUser } = useChildAuth();
  const { family, lists, currentList, setCurrentList, logActivity } = useFamily();
  const { language, changeLanguage, t } = useLanguage();

  // Expose changeLanguage to window for accessibility modal buttons
  useEffect(() => {
    window.changeAppLanguage = changeLanguage;
  }, [changeLanguage]);

  // Helper function to get translated category name
  const getCategoryName = useCallback((categoryKey) => {
    return t(CATEGORY_TO_TRANSLATION[categoryKey]) || CATEGORIES[categoryKey]?.name || categoryKey;
  }, [t]);

  // Core state
  const [items, setItems] = useState([]);
  const prevItemIdsRef = useRef(new Set());
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategories, setShowCategories] = useState(true);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [pickerCategory, setPickerCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Shopping flow state
  const [showFinishShopping, setShowFinishShopping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [totalAmount, setTotalAmount] = useState('');
  const [receiptPhoto, setReceiptPhoto] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const receiptInputRef = useRef(null);
  const [history, setHistory] = useState([]);

  // Item management state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [openItemMenu, setOpenItemMenu] = useState(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemName, setEditingItemName] = useState('');

  // Animation state
  const [confetti, setConfetti] = useState(null);
  const [animatingItems, setAnimatingItems] = useState(new Set());
  const [exitingItems, setExitingItems] = useState(new Set());
  const addBarInputRef = useRef(null);

  // Modal state
  const [showFamilySettings, setShowFamilySettings] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPriceComparison, setShowPriceComparison] = useState(false);
  const [showPromotions, setShowPromotions] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showSavedListsModal, setShowSavedListsModal] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [priceCompareProduct, setPriceCompareProduct] = useState('');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showImportWhatsApp, setShowImportWhatsApp] = useState(false);

  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const lastMessageIdRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Quantity selector state
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState('יח\'');
  const [selectedNote, setSelectedNote] = useState('');

  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceLang, setVoiceLang] = useState(() => localStorage.getItem('voiceLang') || 'he-IL');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('');
  const recognitionRef = useRef(null);
  const voiceTimeoutRef = useRef(null);

  // Shopping mode state
  const [shoppingMode, setShoppingMode] = useState(false);
  const [wakeLock, setWakeLock] = useState(null);

  // Offline mode state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingOperations, setPendingOperations] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pendingOps') || '[]'); } catch { return []; }
  });
  const [syncStatus, setSyncStatus] = useState('synced');

  // Templates state
  const [templates, setTemplates] = useState(() => {
    try { return JSON.parse(localStorage.getItem('shoppingTemplates') || '[]'); } catch { return []; }
  });
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  // Price editing state
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editingPriceValue, setEditingPriceValue] = useState('');

  // Saved lists state
  const [savedLists, setSavedLists] = useState([]);
  const [showSavedLists, setShowSavedLists] = useState(false);

  // Real-time editing indicator
  const [activeEditors, setActiveEditors] = useState([]);

  // Supabase product suggestions
  const [supabaseSuggestions, setSupabaseSuggestions] = useState([]);

  // ====================
  // Effects
  // ====================

  // Check voice support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
    }
  }, []);

  // Online/offline handling
  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); syncPendingOperations(); };
    const handleOffline = () => { setIsOnline(false); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Dark mode initialization
  useEffect(() => {
    const savedDark = localStorage.getItem('darkMode') === 'true';
    if (savedDark) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Load items from Firestore
  useEffect(() => {
    if (!family || !currentList) {
      setLoading(false);
      return;
    }

    const itemsQuery = firestore.query(
      firestore.collection(db, 'shopping-items'),
      firestore.where('familyId', '==', family.id),
      firestore.where('listId', '==', currentList.id)
    );

    const unsubscribe = firestore.onSnapshot(itemsQuery, (snapshot) => {
      const newItems = [];
      snapshot.forEach(doc => {
        newItems.push({ id: doc.id, ...doc.data() });
      });

      // Sort by category and then by createdAt
      newItems.sort((a, b) => {
        if (a.category !== b.category) {
          return (a.category || '').localeCompare(b.category || '');
        }
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });

      setItems(newItems);
      setLoading(false);
    }, (error) => {
      console.error('Error loading items:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [family, currentList]);

  // ====================
  // Computed Values
  // ====================

  const purchasedCount = useMemo(() => items.filter(i => i.purchased).length, [items]);
  const totalItems = items.length;

  const estimatedTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = item.estimatedPrice || getEstimatedPrice(item.name);
      const qty = getQuantityNumber(item.quantity);
      return sum + (price * qty);
    }, 0);
  }, [items]);

  const groupedItems = useMemo(() => {
    const groups = {};
    items.forEach(item => {
      const cat = item.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [items]);

  const suggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    const term = searchTerm.toLowerCase();
    const results = [];

    Object.entries(PRODUCTS).forEach(([category, products]) => {
      products.forEach(product => {
        if (product.name.toLowerCase().includes(term) ||
            product.keywords?.some(k => k.toLowerCase().includes(term))) {
          results.push({ ...product, category });
        }
      });
    });

    return results.slice(0, 8);
  }, [searchTerm]);

  // ====================
  // Item Operations
  // ====================

  const queueOperation = useCallback((op) => {
    const ops = [...pendingOperations, { ...op, timestamp: Date.now() }];
    setPendingOperations(ops);
    localStorage.setItem('pendingOps', JSON.stringify(ops));
    setSyncStatus('pending');
  }, [pendingOperations]);

  const syncPendingOperations = useCallback(async () => {
    if (pendingOperations.length === 0) return;
    setSyncStatus('syncing');

    for (const op of pendingOperations) {
      try {
        if (op.type === 'add') {
          await firestore.addDoc(firestore.collection(db, 'shopping-items'), op.data);
        } else if (op.type === 'update') {
          await firestore.updateDoc(firestore.doc(db, 'shopping-items', op.id), op.data);
        } else if (op.type === 'delete') {
          await firestore.deleteDoc(firestore.doc(db, 'shopping-items', op.id));
        }
      } catch (error) {
        console.error('Sync error:', error);
      }
    }

    setPendingOperations([]);
    localStorage.removeItem('pendingOps');
    setSyncStatus('synced');
  }, [pendingOperations]);

  const addProduct = useCallback(async (name, quantity = 1, unit = 'יח\'', note = '') => {
    if (!family || !currentList || !name.trim()) return;

    // Detect category
    let detectedCategory = 'other';
    const lowerName = name.toLowerCase();
    for (const [category, products] of Object.entries(PRODUCTS)) {
      if (products.some(p =>
        p.name.toLowerCase().includes(lowerName) ||
        lowerName.includes(p.name.toLowerCase()) ||
        p.keywords?.some(k => k.toLowerCase().includes(lowerName))
      )) {
        detectedCategory = category;
        break;
      }
    }

    const itemData = {
      name: name.trim(),
      quantity,
      unit,
      note,
      category: detectedCategory,
      purchased: false,
      familyId: family.id,
      listId: currentList.id,
      createdAt: new Date(),
      addedBy: childUser?.displayName || user?.displayName || user?.email || 'אנונימי',
      addedByUid: childUser?.childId || user?.uid,
      estimatedPrice: getEstimatedPrice(name.trim())
    };

    // Optimistic update
    const tempId = 'temp-' + Date.now();
    setItems(prev => [{ id: tempId, ...itemData }, ...prev]);
    setSearchTerm('');

    if (!isOnline) {
      queueOperation({ type: 'add', data: itemData });
      return;
    }

    try {
      const docRef = await firestore.addDoc(firestore.collection(db, 'shopping-items'), itemData);
      setItems(prev => prev.map(i => i.id === tempId ? { ...i, id: docRef.id } : i));
      await logActivity?.('item_added', { itemName: name });
    } catch (error) {
      console.error('Error adding item:', error);
      setItems(prev => prev.filter(i => i.id !== tempId));
    }
  }, [family, currentList, childUser, user, isOnline, queueOperation, logActivity]);

  const togglePurchased = useCallback(async (id, currentStatus) => {
    const item = items.find(i => i.id === id);
    const updateData = {
      purchased: !currentStatus,
      purchasedBy: !currentStatus ? (childUser?.displayName || user?.displayName || user?.email || 'אנונימי') : null,
      purchasedByUid: !currentStatus ? (childUser?.childId || user?.uid) : null,
      purchasedAt: !currentStatus ? new Date() : null
    };

    // Optimistically update
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updateData } : i));

    if (!isOnline) {
      queueOperation({ type: 'update', id, data: updateData });
      return;
    }

    try {
      await firestore.updateDoc(firestore.doc(db, 'shopping-items', id), updateData);
      if (!currentStatus && item) {
        await logActivity?.('item_purchased', { itemName: item.name });
      }
    } catch (error) {
      console.error('Error updating item:', error);
      setItems(prev => prev.map(i => i.id === id ? item : i));
    }
  }, [items, childUser, user, isOnline, queueOperation, logActivity]);

  const togglePurchasedWithAnimation = useCallback(async (id, currentStatus, event) => {
    if (!currentStatus) {
      const rect = event?.currentTarget?.getBoundingClientRect();
      if (rect) {
        setConfetti({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
        setTimeout(() => setConfetti(null), 600);
      }
      setAnimatingItems(prev => new Set([...prev, id]));
      setTimeout(() => {
        setAnimatingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 400);
    }
    await togglePurchased(id, currentStatus);
  }, [togglePurchased]);

  const deleteItem = useCallback(async (id, skipAnimation = false) => {
    const item = items.find(i => i.id === id);

    if (!skipAnimation) {
      setExitingItems(prev => new Set([...prev, id]));
      await new Promise(resolve => setTimeout(resolve, 280));
    }

    setItems(prev => prev.filter(i => i.id !== id));
    setShowDeleteConfirm(null);
    setExitingItems(prev => { const next = new Set(prev); next.delete(id); return next; });

    if (!isOnline) {
      queueOperation({ type: 'delete', id, itemName: item?.name });
      return;
    }

    try {
      await firestore.deleteDoc(firestore.doc(db, 'shopping-items', id));
      if (item) {
        await logActivity?.('item_deleted', { itemName: item.name });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      setItems(prev => item ? [...prev, item] : prev);
    }
  }, [items, isOnline, queueOperation, logActivity]);

  const updateQuantity = useCallback(async (id, newQuantity) => {
    if (newQuantity < 1) {
      setShowDeleteConfirm(id);
      return;
    }

    const item = items.find(i => i.id === id);
    const updateData = {
      quantity: newQuantity,
      updatedAt: new Date(),
      updatedBy: childUser?.displayName || user?.displayName || user?.email || 'אנונימי',
      updatedByUid: childUser?.childId || user?.uid
    };

    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updateData } : i));

    if (!isOnline) {
      queueOperation({ type: 'update', id, data: updateData });
      return;
    }

    try {
      await firestore.updateDoc(firestore.doc(db, 'shopping-items', id), updateData);
    } catch (error) {
      console.error('Error updating quantity:', error);
      setItems(prev => prev.map(i => i.id === id ? item : i));
    }
  }, [items, childUser, user, isOnline, queueOperation]);

  // ====================
  // UI Handlers
  // ====================

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('darkMode', newValue);
      if (newValue) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newValue;
    });
  }, []);

  const toggleShoppingMode = useCallback(async () => {
    if (!shoppingMode) {
      try {
        if ('wakeLock' in navigator) {
          const lock = await navigator.wakeLock.request('screen');
          setWakeLock(lock);
        }
        setShoppingMode(true);
      } catch (err) {
        console.error('Wake lock error:', err);
        setShoppingMode(true);
      }
    } else {
      if (wakeLock) {
        wakeLock.release();
        setWakeLock(null);
      }
      setShoppingMode(false);
    }
  }, [shoppingMode, wakeLock]);

  const handleLogout = useCallback(async () => {
    try {
      await firebaseAuth.signOut(firebaseAuth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const exportToWhatsApp = useCallback(async () => {
    const unpurchased = items.filter(item => !item.purchased);
    let text = '🛒 רשימת קניות:\n\n';
    Object.entries(CATEGORIES).forEach(([key, cat]) => {
      const categoryItems = unpurchased.filter(item => item.category === key);
      if (categoryItems.length > 0) {
        text += `${cat.icon} ${getCategoryName(key)}:\n`;
        categoryItems.forEach(item => {
          text += `  ✓ ${item.name} (${item.quantity})\n`;
        });
        text += '\n';
      }
    });

    if (navigator.share) {
      try {
        await navigator.share({ title: 'רשימת קניות', text: text });
      } catch (err) {
        if (err.name !== 'AbortError') {
          await navigator.clipboard.writeText(text);
          alert('הרשימה הועתקה ללוח!');
        }
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert('הרשימה הועתקה ללוח!');
    }
  }, [items, getCategoryName]);

  // Back button handler
  useEffect(() => {
    const handleBackButton = () => {
      if (showChat) { setShowChat(false); return; }
      if (showSettings) { setShowSettings(false); return; }
      if (selectedCategory) { setSelectedCategory(null); return; }
    };

    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, [showChat, showSettings, selectedCategory]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🛒</div>
          <p className="text-white text-lg">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen gradient-bg pb-32 ${darkMode ? 'dark' : ''}`}>
      {/* Confetti Effect */}
      {confetti && <ConfettiBurst x={confetti.x} y={confetti.y} />}

      {/* Sync Status Indicator */}
      {!isOnline && (
        <div className="fixed top-4 left-4 z-50 px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-semibold flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          אופליין
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Header Card */}
        <div className="glass rounded-3xl p-5 mb-6 shadow-xl border-t-4 border-teal-400">
          {/* Top Row: Logo & Family Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🛒</div>
              <div>
                <h1 className="text-2xl font-bold text-teal-600 dark:text-teal-400">ListNest</h1>
                {family && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    🏠 {family.name} | 👤 {childUser?.displayName || user?.displayName || user?.email}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              ⚙️
            </button>
          </div>

          {/* List Tabs */}
          {lists && lists.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {lists.map(list => (
                <button
                  key={list.id}
                  onClick={() => setCurrentList(list)}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                    currentList?.id === list.id
                      ? 'bg-teal-500 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {list.icon || '🛒'} {list.name}
                </button>
              ))}
              <button
                onClick={() => setShowCreateList(true)}
                className="px-4 py-2 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 whitespace-nowrap hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-all"
              >
                + {t('newList')}
              </button>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>{t('shoppingProgress') || 'התקדמות קנייה'}</span>
              <span>{purchasedCount} / {totalItems}</span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-green-500 transition-all duration-500 rounded-full"
                style={{ width: `${totalItems > 0 ? (purchasedCount / totalItems) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            <button
              onClick={() => setShowFinishShopping(true)}
              disabled={purchasedCount === 0}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 transition-all disabled:opacity-50"
            >
              <span className="text-2xl">✅</span>
              <span className="text-xs">{t('finishShopping') || 'סיום קנייה'}</span>
            </button>
            <button
              onClick={() => setShowImportWhatsApp(true)}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 transition-all"
            >
              <span className="text-2xl">📥</span>
              <span className="text-xs">{t('importList') || 'ייבוא'}</span>
            </button>
            <button
              onClick={exportToWhatsApp}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all"
            >
              <span className="text-2xl">📤</span>
              <span className="text-xs">{t('exportList') || 'ייצוא'}</span>
            </button>
            <button
              onClick={() => setShowSavedListsModal(true)}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all"
            >
              <span className="text-2xl">📋</span>
              <span className="text-xs">{t('savedLists') || 'רשימות'}</span>
            </button>
            <button
              onClick={() => setShowBarcodeScanner(true)}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-all"
            >
              <span className="text-2xl">📸</span>
              <span className="text-xs">{t('scanBarcode') || 'סריקה'}</span>
            </button>
          </div>

          {/* Second Row: More Actions */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setShowReminder(true)}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-all"
            >
              <span className="text-2xl">🔔</span>
              <span className="text-xs">{t('reminder') || 'תזכורת'}</span>
            </button>
            <button
              onClick={() => setShowChat(true)}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all relative"
            >
              <span className="text-2xl">💬</span>
              <span className="text-xs">{t('familyChat') || 'צ\'אט'}</span>
            </button>
            <button
              onClick={() => setShowCalendar(true)}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/50 transition-all"
            >
              <span className="text-2xl">📅</span>
              <span className="text-xs">{t('calendar') || 'לוח שנה'}</span>
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
            >
              <span className="text-2xl">📊</span>
              <span className="text-xs">{t('history') || 'היסטוריה'}</span>
            </button>
          </div>
        </div>

        {/* AI Assistant Banner */}
        <button
          onClick={() => setShowAIAssistant(true)}
          className="w-full mb-4 p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🤖</span>
            <div className="text-right">
              <div className="font-bold">{t('smartAssistant') || 'עוזר קניות חכם'}</div>
              <div className="text-sm opacity-80">{t('aiDescription') || 'המלצות חכמות לרשימה שלך'}</div>
            </div>
          </div>
          <span className="text-2xl">✨</span>
        </button>

        {/* Promotions Banner */}
        <button
          onClick={() => setShowPromotions(true)}
          className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">🔥</span>
            <div className="text-right">
              <div className="font-bold flex items-center gap-2">
                {t('hotDeals') || 'מבצעים חמים!'}
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">חדש!</span>
              </div>
              <div className="text-sm opacity-80">{t('hotDealsDesc') || 'צפה במבצעים הכי טובים בכל הרשתות'}</div>
            </div>
          </div>
          <span className="text-2xl">→</span>
        </button>

        {/* Category Grid - Always visible for adding products */}
        <div className="glass rounded-2xl p-4 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📁</span>
              <span className="font-semibold text-gray-800 dark:text-white">{t('categories') || 'קטגוריות'}</span>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {Object.entries(CATEGORIES).map(([key, cat]) => {
              const itemCount = items.filter(i => i.category === key && !i.purchased).length;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setPickerCategory(key);
                    setShowProductPicker(true);
                  }}
                  className="p-2 rounded-xl text-center transition-all relative bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 hover:border-teal-400 hover:shadow-md active:scale-95"
                >
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {itemCount}
                    </span>
                  )}
                  <span className="text-2xl block mb-1">{cat.icon}</span>
                  <span className="text-[10px] leading-tight text-gray-600 dark:text-gray-300 line-clamp-2">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Picker Modal */}
        {showProductPicker && pickerCategory && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
            <div className="bg-white dark:bg-gray-900 rounded-t-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl animate-slide-up">
              {/* Header */}
              <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{CATEGORIES[pickerCategory]?.icon}</span>
                  <h2 className="text-xl font-bold text-white">{CATEGORIES[pickerCategory]?.name}</h2>
                </div>
                <button
                  onClick={() => setShowProductPicker(false)}
                  className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Products Grid */}
              <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {PRODUCTS[pickerCategory]?.map((product, idx) => {
                    const productName = typeof product === 'string' ? product : product.name;
                    const isInList = items.some(i => i.name === productName && !i.purchased);
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          addProduct(productName);
                          // Visual feedback
                        }}
                        className={`p-3 rounded-xl text-center transition-all border-2 ${
                          isInList
                            ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-400 text-teal-700 dark:text-teal-300'
                            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-teal-300 hover:shadow-md'
                        } active:scale-95`}
                      >
                        <span className="text-sm font-medium text-gray-800 dark:text-white">{productName}</span>
                        {isInList && (
                          <span className="block text-xs text-teal-500 mt-1">✓ ברשימה</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Custom product input */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">לא מצאת? הוסף מוצר חדש:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && searchTerm.trim()) {
                          addProduct(searchTerm.trim());
                          setSearchTerm('');
                        }
                      }}
                      placeholder="שם המוצר..."
                      className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:border-teal-500 transition-all"
                    />
                    <button
                      onClick={() => {
                        if (searchTerm.trim()) {
                          addProduct(searchTerm.trim());
                          setSearchTerm('');
                        }
                      }}
                      className="px-6 py-3 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition-all"
                    >
                      הוסף
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My List Section */}
        <div className="glass rounded-2xl p-4 shadow-lg">
          {/* List Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📝</span>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('shoppingList') || 'הרשימה שלי'}</h2>
              <span className="px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full text-sm font-semibold">
                {items.filter(i => !i.purchased).length}
              </span>
            </div>
          </div>

          {/* Price Comparison Button */}
          {items.length > 0 && (
            <button
              onClick={() => setShowPriceComparison(true)}
              className="w-full mb-4 p-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <span>📊</span>
              {t('comparePricesFullList') || 'השווה מחירים - כל הרשימה'}
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{items.length}</span>
            </button>
          )}

          {/* Estimated Total */}
          {estimatedTotal > 0 && (
            <div className="mb-4 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">💰</span>
                <span className="text-gray-600 dark:text-gray-400">{t('estimatedTotal') || 'סה"כ משוער'}:</span>
              </div>
              <span className="text-xl font-bold text-teal-600 dark:text-teal-400">₪{estimatedTotal.toFixed(2)}</span>
            </div>
          )}

          {/* Items List */}
          <div className="space-y-2">
            {Object.entries(groupedItems)
              .filter(([category]) => !selectedCategory || category === selectedCategory)
              .map(([category, categoryItems]) => (
                <div key={category} className="mb-4">
                  {/* Category Header */}
                  <div className="flex items-center gap-2 mb-2 px-2">
                    <span className="text-xl">{CATEGORIES[category]?.icon || '📦'}</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{getCategoryName(category)}</span>
                    <span className="text-xs text-gray-400">({categoryItems.length})</span>
                  </div>

                  {/* Category Items */}
                  <div className="space-y-2">
                    {categoryItems.map((item) => (
                      <SwipeableItem
                        key={item.id}
                        onSwipeRight={() => togglePurchased(item.id, item.purchased)}
                        onSwipeLeft={() => deleteItem(item.id)}
                        purchased={item.purchased}
                        className={exitingItems.has(item.id) ? 'item-exit' : ''}
                      >
                        <div
                          className={`p-3 rounded-xl border transition-all ${
                            item.purchased
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                          } ${animatingItems.has(item.id) ? 'scale-95 opacity-80' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Checkbox */}
                            <button
                              onClick={(e) => togglePurchasedWithAnimation(item.id, item.purchased, e)}
                              className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                item.purchased
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                              }`}
                            >
                              {item.purchased && <span className="text-sm">✓</span>}
                            </button>

                            {/* Item Info */}
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium ${item.purchased ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-white'}`}>
                                {item.name}
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.note && (
                                  <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
                                    📝 {item.note}
                                  </span>
                                )}
                                {item.addedBy && (
                                  <span className="text-xs text-gray-400">
                                    👤 {item.addedBy}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Price */}
                            {item.estimatedPrice > 0 && (
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                ₪{(item.estimatedPrice * getQuantityNumber(item.quantity)).toFixed(2)}
                              </span>
                            )}

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                              <button
                                onClick={() => updateQuantity(item.id, getQuantityNumber(item.quantity) - 1)}
                                className="w-7 h-7 rounded-lg bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-500 transition-all text-lg font-bold"
                              >
                                -
                              </button>
                              <span className="w-10 text-center text-sm font-semibold text-gray-700 dark:text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, getQuantityNumber(item.quantity) + 1)}
                                className="w-7 h-7 rounded-lg bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-500 transition-all text-lg font-bold"
                              >
                                +
                              </button>
                            </div>

                            {/* Menu Button */}
                            <button
                              onClick={() => setOpenItemMenu(item.id)}
                              className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                            >
                              ⋮
                            </button>
                          </div>
                        </div>
                      </SwipeableItem>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {/* Empty State */}
          {items.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{t('emptyList')}</h3>
              <p className="text-gray-500 dark:text-gray-400">{t('addFirstProduct')}</p>
            </div>
          )}
        </div>
      </main>

      {/* Sticky Add Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 p-4 pb-safe z-40">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2">
            <input
              ref={addBarInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && searchTerm.trim()) {
                  addProduct(searchTerm.trim());
                }
              }}
              placeholder={t('searchOrAddProduct') || 'חפש או הוסף מוצר...'}
              className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:border-teal-500 transition-all"
            />
            {voiceSupported && (
              <button
                onClick={() => setShowVoiceInput(true)}
                className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                🎤
              </button>
            )}
            <button
              onClick={() => setShowAIAssistant(true)}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all"
            >
              ✨
            </button>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    addProduct(suggestion.name);
                    setSearchTerm('');
                  }}
                  className="px-3 py-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-lg text-sm hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-all"
                >
                  {CATEGORIES[suggestion.category]?.icon} {suggestion.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-teal-600 dark:text-teal-400">{t('settings')}</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Shopping Mode */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛒</span>
                  <span className="font-medium text-gray-800 dark:text-white">{t('shoppingMode')}</span>
                </div>
                <button
                  onClick={toggleShoppingMode}
                  className={`w-14 h-8 rounded-full transition-all ${
                    shoppingMode ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-all ${
                    shoppingMode ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Dark Mode */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{darkMode ? '🌙' : '☀️'}</span>
                  <span className="font-medium text-gray-800 dark:text-white">{t('darkMode')}</span>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`w-14 h-8 rounded-full transition-all ${
                    darkMode ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-all ${
                    darkMode ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Language */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🌍</span>
                  <span className="font-medium text-gray-800 dark:text-white">{t('language')}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => changeLanguage('he')}
                    className={`flex-1 py-2 px-4 rounded-xl transition-all ${
                      language === 'he' ? 'bg-teal-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    עברית
                  </button>
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`flex-1 py-2 px-4 rounded-xl transition-all ${
                      language === 'en' ? 'bg-teal-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Family Settings */}
              <button
                onClick={() => { setShowSettings(false); setShowFamilySettings(true); }}
                className="w-full py-4 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all flex items-center justify-center gap-2"
              >
                👨‍👩‍👧‍👦 {t('familySettings') || 'הגדרות משפחה'}
              </button>

              {/* Accessibility */}
              <button
                onClick={() => { setShowSettings(false); setShowAccessibility(true); }}
                className="w-full py-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all flex items-center justify-center gap-2"
              >
                ♿ {t('accessibility')}
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full py-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all flex items-center justify-center gap-2"
              >
                🚪 {t('logout')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Actions Menu */}
      {openItemMenu && (() => {
        const menuItem = items.find(i => i.id === openItemMenu);
        if (!menuItem) return null;
        return (
          <div className="fixed inset-0 z-[9999]">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpenItemMenu(null)} />
            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl animate-slide-up pb-safe">
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              </div>
              <div className="px-5 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{menuItem.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('selectAction')}</p>
              </div>
              <div className="py-2">
                <button
                  onClick={() => {
                    setPriceCompareProduct(menuItem.name);
                    setShowPriceComparison(true);
                    setOpenItemMenu(null);
                  }}
                  className="w-full px-5 py-4 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-xl">📊</span>
                  <span className="text-gray-800 dark:text-white">{t('comparePrices') || 'השווה מחירים'}</span>
                </button>
                {!menuItem.note && (
                  <button
                    onClick={() => { setEditingNote(menuItem); setOpenItemMenu(null); }}
                    className="w-full px-5 py-4 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-xl">📝</span>
                    <span className="text-gray-800 dark:text-white">{t('addNote')}</span>
                  </button>
                )}
                <button
                  onClick={() => { setShowDeleteConfirm(menuItem.id); setOpenItemMenu(null); }}
                  className="w-full px-5 py-4 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600"
                >
                  <span className="text-xl">🗑️</span>
                  <span>{t('deleteItem') || 'מחק פריט'}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <div className="text-5xl text-center mb-4">🗑️</div>
            <h2 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-2">{t('deleteProduct')}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">{t('confirmDelete')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteItem(showDeleteConfirm)}
                className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:shadow-lg font-semibold transition-all"
              >
                {t('delete')}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-6 py-3 glass border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <PriceComparisonModal
        isOpen={showPriceComparison}
        onClose={() => { setShowPriceComparison(false); setPriceCompareProduct(''); }}
        items={items}
        initialProduct={priceCompareProduct}
      />

      <PromotionsModal
        isOpen={showPromotions}
        onClose={() => setShowPromotions(false)}
        items={items}
      />

      <CalendarModal
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        onAddItems={(newItems) => {
          newItems.forEach(item => addProduct(item.name, item.quantity, item.unit));
        }}
      />

      <AIAssistantModal
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        onAddItems={(newItems) => {
          newItems.forEach(item => addProduct(item.name, item.quantity, item.unit));
        }}
        currentItems={items}
      />

      <SavedListsModal
        isOpen={showSavedListsModal}
        onClose={() => setShowSavedListsModal(false)}
        onLoadList={(loadedItems) => {
          loadedItems.forEach(item => addProduct(item.name, item.quantity, item.unit));
        }}
        currentItems={items}
      />

      <AccessibilityModal
        isOpen={showAccessibility}
        onClose={() => setShowAccessibility(false)}
        onDarkModeChange={setDarkMode}
      />

      <VoiceInput
        isOpen={showVoiceInput}
        onClose={() => setShowVoiceInput(false)}
        onResult={(text) => {
          if (text) {
            addProduct(text);
            setShowVoiceInput(false);
          }
        }}
      />

      <FamilyChat
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />

      {showFamilySettings && (
        <FamilySettingsModal
          isOpen={showFamilySettings}
          onClose={() => setShowFamilySettings(false)}
        />
      )}

      {showCreateList && (
        <CreateListModal
          isOpen={showCreateList}
          onClose={() => setShowCreateList(false)}
        />
      )}

      {showReminder && (
        <ReminderModal
          isOpen={showReminder}
          onClose={() => setShowReminder(false)}
        />
      )}

      <BarcodeScannerModal
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onProductFound={(product) => {
          if (product.name) {
            addProduct(product.name);
          }
        }}
      />

      <ImportWhatsAppModal
        isOpen={showImportWhatsApp}
        onClose={() => setShowImportWhatsApp(false)}
        onImport={(importedItems) => {
          importedItems.forEach(item => addProduct(item.name, item.quantity, item.unit));
        }}
      />
    </div>
  );
}

export default ShoppingList;
