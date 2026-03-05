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
import { getEstimatedPrice, calculateItemPrice, getPriceSearchSuggestions, comparePrices } from '../../utils/priceUtils';
import {
  PriceComparisonModal,
  PromotionsModal,
  CalendarModal,
  AIAssistantModal,
  SavedListsModal,
  AccessibilityModal,
  CreateListModal,
  ItemNoteModal,
  ReminderModal
} from '../modals';
import { FamilyChat } from '../chat';
import { FamilySettingsModal } from '../family';

// Note: ISRAELI_HOLIDAYS imported from '../../data/holidays'

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

// Note: getEstimatedPrice and calculateItemPrice imported from '../../utils/priceUtils'

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
  const [showCategories, setShowCategories] = useState(false);
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

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');
  const toastTimerRef = useRef(null);
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(''), 2500);
  }, []);

  // Quantity selector state
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState(t('unitPieces'));
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
  const [showImportWhatsApp, setShowImportWhatsApp] = useState(false);
  const [whatsAppText, setWhatsAppText] = useState('');

  // Real-time editing indicator
  const [activeEditors, setActiveEditors] = useState([]);

  // Supabase product suggestions
  const [supabaseSuggestions, setSupabaseSuggestions] = useState([]);

  // Barcode scanner state
  const [barcodeScanning, setBarcodeScanning] = useState(false);
  const [barcodeResult, setBarcodeResult] = useState(null);
  const [scannedProductName, setScannedProductName] = useState(null);
  const [barcodePriceResults, setBarcodePriceResults] = useState(null);
  const [barcodePriceLoading, setBarcodePriceLoading] = useState(false);
  const [barcodeProductLoading, setBarcodeProductLoading] = useState(false);
  const barcodeVideoRef = useRef(null);
  const barcodeStreamRef = useRef(null);
  const barcodeScanIntervalRef = useRef(null);
  const barcodeLastDetectedRef = useRef(null);
  const barcodeIsMountedRef = useRef(true);
  const [userLocation, setUserLocation] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('lastUserLocation'));
      if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) {
        return { lat: cached.lat, lng: cached.lng };
      }
    } catch {}
    return null;
  });

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
      setItems([]);
      setLoading(false);
      return;
    }

    // Load cached items for faster display
    const cached = loadCachedItems();
    if (cached && cached.length > 0) {
      setItems(cached);
    }

    const q = firestore.query(
      firestore.collection(db, 'shopping-items'),
      firestore.where('familyId', '==', family.id),
      firestore.where('listId', '==', currentList.id)
    );

    const unsubscribe = firestore.onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        const itemsData = [];
        snapshot.forEach((doc) => {
          itemsData.push({ id: doc.id, ...doc.data() });
        });
        // Sort client-side (newest first)
        itemsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });

        // Check for new items added by other users
        const currentIds = new Set(itemsData.map(item => item.id));
        itemsData.forEach(item => {
          if (!prevItemIdsRef.current.has(item.id) && prevItemIdsRef.current.size > 0) {
            if (item.addedByUid && item.addedByUid !== user?.uid) {
              showProductNotification(item, item.addedBy || 'מישהו');
            }
          }
        });
        prevItemIdsRef.current = currentIds;

        setItems(itemsData);
        setLoading(false);

        // Cache items for offline use
        if (!snapshot.metadata.fromCache) {
          cacheItems(itemsData);
        }
      },
      (error) => {
        console.error('Error loading items:', error);
        const cached = loadCachedItems();
        if (cached) setItems(cached);
        setLoading(false);
      }
    );

    loadHistory();
    return () => unsubscribe();
  }, [family, currentList, user?.uid]);

  // Load chat messages
  useEffect(() => {
    if (!family) {
      setChatMessages([]);
      return;
    }

    const q = firestore.query(
      firestore.collection(db, 'family-chat'),
      firestore.where('familyId', '==', family.id)
    );

    const unsubscribe = firestore.onSnapshot(q, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      messages.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateA - dateB;
      });

      // Check for new messages and send notification
      if (messages.length > 0 && user) {
        const latestMessage = messages[messages.length - 1];
        if (latestMessage.id !== lastMessageIdRef.current &&
            latestMessage.senderUid !== user?.uid &&
            lastMessageIdRef.current !== null) {
          showChatNotification(latestMessage);
        }
        lastMessageIdRef.current = latestMessage.id;
      }

      setChatMessages(messages);
    });

    return () => unsubscribe();
  }, [family, user]);

  // Request notification permission
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          setNotificationsEnabled(true);
        } else if (Notification.permission !== 'denied') {
          const permission = await Notification.requestPermission();
          setNotificationsEnabled(permission === 'granted');
        }
      }
    };
    requestNotificationPermission();
  }, []);

  // Fetch product suggestions when typing
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setSupabaseSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`/api/prices?action=suggest&q=${encodeURIComponent(searchTerm)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.suggestions) {
            setSupabaseSuggestions(data.suggestions);
          }
        }
      } catch (e) {
        console.warn('Suggestions fetch error:', e);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Load saved lists
  useEffect(() => {
    const savedListsData = localStorage.getItem(`savedLists_${family?.id}`);
    if (savedListsData) setSavedLists(JSON.parse(savedListsData));
  }, [family?.id]);

  // Escape key handler for closing modals
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        if (showQuantitySelector) { setShowQuantitySelector(false); return; }
        if (showChat) { setShowChat(false); return; }
        if (showSettings) { setShowSettings(false); return; }
        if (showFamilySettings) { setShowFamilySettings(false); return; }
        if (showCreateList) { setShowCreateList(false); return; }
        if (showFinishShopping) { setShowFinishShopping(false); return; }
        if (showHistory) { setShowHistory(false); return; }
        if (showDeleteAllConfirm) { setShowDeleteAllConfirm(false); return; }
        if (showSavedLists) { setShowSavedLists(false); return; }
        if (showImportWhatsApp) { setShowImportWhatsApp(false); return; }
        if (showTemplates) { setShowTemplates(false); return; }
        if (showSaveTemplate) { setShowSaveTemplate(false); return; }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [showQuantitySelector, showChat, showSettings, showFamilySettings, showCreateList,
      showFinishShopping, showHistory, showDeleteAllConfirm, showSavedLists,
      showImportWhatsApp, showTemplates, showSaveTemplate]);

  // Wake lock cleanup
  useEffect(() => {
    return () => {
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, [wakeLock]);

  // ====================
  // Cache Functions
  // ====================

  const getCacheKey = useCallback(() => `items_${family?.id}_${currentList?.id}`, [family?.id, currentList?.id]);

  const cacheItems = useCallback((itemsData) => {
    try {
      const cacheData = itemsData.map(item => ({
        ...item,
        createdAt: item.createdAt?.toDate?.()?.toISOString() || item.createdAt,
        updatedAt: item.updatedAt?.toDate?.()?.toISOString() || item.updatedAt
      }));
      localStorage.setItem(getCacheKey(), JSON.stringify(cacheData));
    } catch (e) { console.warn('Failed to cache items:', e); }
  }, [getCacheKey]);

  const loadCachedItems = useCallback(() => {
    try {
      const cached = localStorage.getItem(getCacheKey());
      if (cached) {
        const items = JSON.parse(cached);
        return items.map(item => ({
          ...item,
          createdAt: item.createdAt ? { toDate: () => new Date(item.createdAt) } : null
        }));
      }
    } catch (e) { console.warn('Failed to load cached items:', e); }
    return null;
  }, [getCacheKey]);

  // ====================
  // Offline Operations
  // ====================

  const queueOperation = useCallback((operation) => {
    const ops = [...pendingOperations, { ...operation, timestamp: Date.now() }];
    localStorage.setItem('pendingOps', JSON.stringify(ops));
    setPendingOperations(ops);
    setSyncStatus('pending');
  }, [pendingOperations]);

  const syncPendingOperations = useCallback(async () => {
    if (pendingOperations.length === 0) return;
    setSyncStatus('syncing');

    const failedOps = [];
    for (const op of pendingOperations) {
      try {
        if (op.type === 'add') {
          await firestore.addDoc(firestore.collection(db, 'shopping-items'), {
            name: op.name,
            category: op.category,
            quantity: op.quantity,
            unit: op.unit || t('unitPieces'),
            purchased: false,
            familyId: family?.id,
            listId: currentList?.id,
            addedBy: childUser?.displayName || user?.displayName || user?.email || 'אופליין',
            addedByUid: childUser?.childId || user?.uid,
            note: op.note || '',
            price: op.price || null,
            priceSource: op.price ? 'estimated' : null,
            createdAt: new Date(op.timestamp || Date.now())
          });
        } else if (op.type === 'delete') {
          await firestore.deleteDoc(firestore.doc(db, 'shopping-items', op.id));
        } else if (op.type === 'update') {
          await firestore.updateDoc(firestore.doc(db, 'shopping-items', op.id), op.data);
        }
      } catch (e) {
        console.error('Failed to sync operation:', op, e);
        failedOps.push(op);
      }
    }

    if (failedOps.length === 0) {
      localStorage.removeItem('pendingOps');
      setPendingOperations([]);
      setSyncStatus('synced');
    } else {
      localStorage.setItem('pendingOps', JSON.stringify(failedOps));
      setPendingOperations(failedOps);
      setSyncStatus('pending');
    }
  }, [pendingOperations, family?.id, currentList?.id, childUser, user]);

  // ====================
  // Notification Functions
  // ====================

  const showChatNotification = useCallback((message) => {
    if (!notificationsEnabled || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    if (showChat && document.visibilityState === 'visible') return;

    const isReminder = message.type === 'reminder';
    const title = isReminder ? `🔔 ${t('reminderFromFamily')}` : `💬 ${message.senderName || 'הודעה חדשה'}`;
    const body = isReminder ? message.text || t('dontForgetToAdd') : (message.photoUrl ? '📷 שלח/ה תמונה' : message.text || 'הודעה חדשה');

    try {
      const notification = new Notification(title, {
        body: body,
        icon: isReminder ? '🔔' : '🛒',
        tag: isReminder ? 'reminder-message' : 'chat-message',
        renotify: true
      });

      notification.onclick = () => {
        window.focus();
        setShowChat(true);
        notification.close();
      };

      setTimeout(() => notification.close(), isReminder ? 8000 : 5000);
    } catch (error) {
      console.error('Notification error:', error);
    }
  }, [notificationsEnabled, showChat, t]);

  const showProductNotification = useCallback((item, addedByName) => {
    if (!notificationsEnabled || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    if (document.visibilityState === 'visible') return;

    try {
      const notification = new Notification('🛒 מוצר נוסף לרשימה', {
        body: `${addedByName} הוסיף/ה: ${item.name}`,
        icon: '🛒',
        tag: 'product-added',
        renotify: true
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => notification.close(), 4000);
    } catch (error) {
      console.error('Notification error:', error);
    }
  }, [notificationsEnabled]);

  // ====================
  // Category Detection
  // ====================

  const detectCategory = useCallback((productName) => {
    const name = productName.trim().toLowerCase();

    // First try exact match
    for (const [cat, products] of Object.entries(PRODUCTS)) {
      if (products.some(p => p === productName || p.toLowerCase() === name)) {
        return cat;
      }
    }

    // Then try partial match
    for (const [cat, products] of Object.entries(PRODUCTS)) {
      if (products.some(p => p.includes(productName) || productName.includes(p) ||
          p.toLowerCase().includes(name) || name.includes(p.toLowerCase()))) {
        return cat;
      }
    }

    // Keyword-based detection
    const keywords = {
      fruits: ['תפוח', 'בננ', 'עגבני', 'מלפפון', 'גזר', 'בצל', 'שום', 'פלפל'],
      meat: ['בשר', 'עוף', 'חזה', 'שניצל', 'סלמון', 'דג', 'טונה'],
      dairy: ['חלב', 'גבינ', 'יוגורט', 'ביצ', 'קוטג', 'שמנת', 'חמאה'],
      bakery: ['לחם', 'חלה', 'פיתה', 'לחמני', 'עוגי'],
      drinks: ['מים', 'קולה', 'מיץ', 'סודה'],
      cleaning: ['נייר טואלט', 'סבון', 'אבקת כביסה'],
      snacks: ['במבה', 'ביסלי', 'שוקולד', 'חטיף']
    };

    for (const [cat, words] of Object.entries(keywords)) {
      if (words.some(word => name.includes(word) || productName.includes(word))) {
        return cat;
      }
    }

    return 'canned'; // Default fallback
  }, []);

  // ====================
  // Barcode Scanner Operations
  // ====================

  // Track mounted for barcode async
  useEffect(() => {
    barcodeIsMountedRef.current = true;
    return () => { barcodeIsMountedRef.current = false; };
  }, []);

  const stopBarcodeScanner = useCallback((clearResults = true) => {
    if (barcodeScanIntervalRef.current) {
      clearInterval(barcodeScanIntervalRef.current);
      barcodeScanIntervalRef.current = null;
    }
    if (barcodeStreamRef.current) {
      barcodeStreamRef.current.getTracks().forEach(track => track.stop());
      barcodeStreamRef.current = null;
    }
    if (barcodeVideoRef.current) {
      barcodeVideoRef.current.srcObject = null;
    }
    setBarcodeScanning(false);
    if (clearResults) {
      setBarcodeResult(null);
      setScannedProductName(null);
      setBarcodePriceResults(null);
      setBarcodePriceLoading(false);
      setBarcodeProductLoading(false);
    }
  }, []);

  const handleBarcodeDetected = useCallback(async (barcode) => {
    stopBarcodeScanner(false);
    try { navigator.vibrate?.(100); } catch {}
    if (!barcodeIsMountedRef.current) return;
    setBarcodeProductLoading(true);

    try {
      const productInfo = await fetchProductByBarcode(barcode);
      if (!barcodeIsMountedRef.current) return;

      if (productInfo.found && productInfo.name) {
        setBarcodeResult({ ...productInfo, barcode });
        setScannedProductName(productInfo.name);
        setBarcodeProductLoading(false);
        // Auto-fetch prices
        setBarcodePriceLoading(true);
        try {
          const prices = await comparePrices(productInfo.name);
          if (!barcodeIsMountedRef.current) return;
          setBarcodePriceResults(prices.sort((a, b) => a.price - b.price));
        } catch (err) {
          console.warn('Barcode price fetch failed:', err);
          if (barcodeIsMountedRef.current) setBarcodePriceResults([]);
        } finally {
          if (barcodeIsMountedRef.current) setBarcodePriceLoading(false);
        }
      } else {
        setBarcodeResult({ found: false, barcode });
        setBarcodeProductLoading(false);
      }
    } catch (err) {
      console.warn('Barcode product lookup failed:', err);
      if (barcodeIsMountedRef.current) {
        setBarcodeResult({ found: false, barcode });
        setBarcodeProductLoading(false);
      }
    }
  }, [stopBarcodeScanner]);

  const startBarcodeScanner = useCallback(async () => {
    setBarcodeResult(null);
    setScannedProductName(null);
    setBarcodePriceResults(null);
    setBarcodePriceLoading(false);
    setBarcodeProductLoading(false);
    barcodeLastDetectedRef.current = null;

    // Request location in parallel (non-blocking)
    if (!userLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          try { localStorage.setItem('lastUserLocation', JSON.stringify({ ...loc, timestamp: Date.now() })); } catch {}
        },
        () => {},
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    }

    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280, max: 1920 }, height: { ideal: 720, max: 1080 } }
      });
      if (!barcodeIsMountedRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
      barcodeStreamRef.current = stream;

      // Wait for video element to be rendered
      setBarcodeScanning(true);
      await new Promise(r => setTimeout(r, 100));

      if (barcodeVideoRef.current) {
        barcodeVideoRef.current.srcObject = stream;
        await barcodeVideoRef.current.play();
      }

      // Try native BarcodeDetector (Chrome/Edge, not Safari)
      if ('BarcodeDetector' in window) {
        try {
          const detector = new window.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']
          });
          if (barcodeScanIntervalRef.current) clearInterval(barcodeScanIntervalRef.current);
          barcodeScanIntervalRef.current = setInterval(async () => {
            if (!barcodeVideoRef.current || barcodeVideoRef.current.readyState < 2) return;
            try {
              const barcodes = await detector.detect(barcodeVideoRef.current);
              if (barcodes.length > 0) {
                const code = barcodes[0].rawValue;
                if (code && code !== barcodeLastDetectedRef.current) {
                  barcodeLastDetectedRef.current = code;
                  handleBarcodeDetected(code);
                }
              }
            } catch {}
          }, 300);
        } catch (e) {
          console.warn('BarcodeDetector init failed:', e);
        }
      } else {
        // Try Quagga fallback for Safari/iOS
        try {
          const Quagga = await loadQuagga();
          if (!barcodeIsMountedRef.current || !barcodeVideoRef.current) return;
          Quagga.init({
            inputStream: {
              type: 'LiveStream',
              target: barcodeVideoRef.current.parentElement,
              constraints: { facingMode: 'environment' },
            },
            decoder: {
              readers: ['ean_reader', 'ean_8_reader', 'upc_reader', 'code_128_reader']
            },
            locate: true,
          }, (err) => {
            if (err) {
              console.warn('Quagga init failed:', err);
              return;
            }
            Quagga.start();
            Quagga.onDetected((result) => {
              const code = result?.codeResult?.code;
              if (code && code !== barcodeLastDetectedRef.current) {
                barcodeLastDetectedRef.current = code;
                Quagga.stop();
                handleBarcodeDetected(code);
              }
            });
          });
        } catch (e) {
          console.warn('Quagga load failed:', e);
        }
      }
    } catch (err) {
      console.error('Camera error:', err);
      if (stream) stream.getTracks().forEach(t => t.stop());
      setBarcodeScanning(false);
    }
  }, [userLocation, handleBarcodeDetected]);

  // Cleanup barcode scanner on unmount
  useEffect(() => {
    return () => {
      if (barcodeScanIntervalRef.current) clearInterval(barcodeScanIntervalRef.current);
      if (barcodeStreamRef.current) barcodeStreamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const navigateToStore = useCallback((chainName) => {
    if (!userLocation) return;
    const url = `https://www.google.com/maps/search/${encodeURIComponent(chainName)}/@${userLocation.lat},${userLocation.lng},14z`;
    window.open(url, '_blank');
  }, [userLocation]);

  // ====================
  // Product Operations
  // ====================

  const addProduct = useCallback((product) => {
    const category = selectedCategory || detectCategory(product);
    let unit = CATEGORIES[category]?.unit || t('unitPieces');
    let unitOptions = CATEGORIES[category]?.unitOptions || [t('unitPieces')];

    // Check if product name already contains size (packaged product)
    const hasPackagedSize = /\d+\s*(גרם|מ"ל|מ״ל|ליטר|ק"ג|ק״ג|יח'|יח׳)/.test(product);
    if (hasPackagedSize) {
      unit = t('unitPieces');
      unitOptions = [t('unitPieces')];
    }

    // Check if product already exists
    const existing = items.find(item => item.name === product && !item.purchased);
    const existingQty = existing ? getQuantityNumber(existing.quantity) : 0;
    const existingUnit = existing?.unit || unit;

    setSelectedProduct({ name: product, category, unitOptions, existingId: existing?.id, existingQty });
    setSelectedQuantity(existingQty);
    setSelectedUnit(existingQty > 0 ? existingUnit : unit);
    setShowQuantitySelector(true);
  }, [selectedCategory, detectCategory, items]);

  const addProductWithQuantity = useCallback(async () => {
    if (!selectedProduct) return;

    const { name: product, category } = selectedProduct;
    const existing = items.find(item => item.name === product && !item.purchased);
    const estimatedPrice = getEstimatedPrice(product);

    const tempId = `temp_${Date.now()}`;
    const newItem = {
      id: tempId,
      name: product,
      category: category,
      quantity: existing ? (getQuantityNumber(existing.quantity) + selectedQuantity) : selectedQuantity,
      unit: selectedUnit,
      purchased: false,
      familyId: family.id,
      listId: currentList.id,
      addedBy: childUser?.displayName || user?.displayName || user?.email || t('anonymous'),
      addedByUid: childUser?.childId || user?.uid,
      note: selectedNote || '',
      price: estimatedPrice || null,
      priceSource: estimatedPrice ? 'estimated' : null,
      createdAt: { toDate: () => new Date() },
      _isTemp: true
    };

    // Optimistically update local state
    if (existing) {
      setItems(prev => prev.map(i => i.id === existing.id ? { ...i, quantity: newItem.quantity, note: selectedNote ? (i.note ? `${i.note}, ${selectedNote}` : selectedNote) : i.note } : i));
    } else {
      setItems(prev => [newItem, ...prev]);
    }

    const addedProductName = product;
    setSearchTerm('');
    setShowQuantitySelector(false);
    setSelectedNote('');
    setSelectedProduct(null);

    // If offline, queue operation
    if (!isOnline) {
      if (existing) {
        queueOperation({ type: 'update', id: existing.id, data: { quantity: newItem.quantity, note: selectedNote || existing.note } });
      } else {
        queueOperation({ type: 'add', name: product, category, quantity: selectedQuantity, unit: selectedUnit, note: selectedNote, price: estimatedPrice });
      }
      showToast(`${addedProductName} ${t('productAdded')}`);
      return;
    }

    try {
      if (existing) {
        const updateData = {
          quantity: newItem.quantity,
          unit: selectedUnit,
          updatedAt: new Date(),
          updatedBy: user?.displayName || user?.email || t('anonymous')
        };
        if (selectedNote) {
          updateData.note = existing.note ? `${existing.note}, ${selectedNote}` : selectedNote;
        }
        await firestore.updateDoc(firestore.doc(db, 'shopping-items', existing.id), updateData);
        await logActivity?.('quantity_changed', { itemName: product });
      } else {
        const docRef = await firestore.addDoc(firestore.collection(db, 'shopping-items'), {
          name: product,
          category: category,
          quantity: selectedQuantity,
          unit: selectedUnit,
          purchased: false,
          familyId: family.id,
          listId: currentList.id,
          addedBy: childUser?.displayName || user?.displayName || user?.email || t('anonymous'),
          addedByUid: childUser?.childId || user?.uid,
          note: selectedNote || '',
          price: estimatedPrice || null,
          priceSource: estimatedPrice ? 'estimated' : null,
          createdAt: new Date()
        });
        setItems(prev => prev.map(i => i.id === tempId ? { ...i, id: docRef.id, _isTemp: false } : i));
        await logActivity?.('item_added', { itemName: product });
      }
      showToast(`✓ ${addedProductName} ${t('productAdded')}`);
    } catch (error) {
      console.error('Error adding product:', error);
      showToast(`✗ שגיאה בהוספת ${addedProductName}`);
      if (!navigator.onLine) {
        if (existing) {
          queueOperation({ type: 'update', id: existing.id, data: { quantity: newItem.quantity } });
        } else {
          queueOperation({ type: 'add', name: product, category, quantity: selectedQuantity, unit: selectedUnit, note: selectedNote, price: estimatedPrice });
        }
      }
    }
  }, [selectedProduct, items, family, currentList, childUser, user, selectedQuantity, selectedUnit, selectedNote, isOnline, queueOperation, logActivity, showToast]);

  const togglePurchased = useCallback(async (id, currentStatus) => {
    const item = items.find(i => i.id === id);
    const updateData = {
      purchased: !currentStatus,
      purchasedBy: !currentStatus ? (childUser?.displayName || user?.displayName || user?.email || t('anonymous')) : null,
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
      updatedBy: childUser?.displayName || user?.displayName || user?.email || t('anonymous'),
      updatedByUid: childUser?.childId || user?.uid
    };

    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updateData } : i));

    if (!isOnline) {
      queueOperation({ type: 'update', id, data: updateData });
      return;
    }

    try {
      await firestore.updateDoc(firestore.doc(db, 'shopping-items', id), updateData);
      if (item) {
        await logActivity?.('quantity_changed', { itemName: item.name });
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      setItems(prev => prev.map(i => i.id === id ? item : i));
    }
  }, [items, childUser, user, isOnline, queueOperation, logActivity]);

  // ====================
  // History Functions
  // ====================

  const loadHistory = useCallback(async () => {
    if (!family) return;
    try {
      const historyQuery = firestore.query(
        firestore.collection(db, 'shopping-history'),
        firestore.where('familyId', '==', family.id)
      );
      const snapshot = await firestore.getDocs(historyQuery);
      const historyData = [];
      snapshot.forEach(doc => {
        historyData.push({ id: doc.id, ...doc.data() });
      });
      historyData.sort((a, b) => {
        const dateA = a.completedAt?.toDate?.() || new Date(0);
        const dateB = b.completedAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  }, [family]);

  const finishShopping = useCallback(async () => {
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      alert('נא להזין סכום תקין');
      return;
    }

    const purchasedItems = items.filter(item => item.purchased);
    if (purchasedItems.length === 0) {
      alert('לא נבחרו מוצרים שנקנו');
      return;
    }

    try {
      await firestore.addDoc(firestore.collection(db, 'shopping-history'), {
        items: purchasedItems,
        totalAmount: parseFloat(totalAmount),
        completedAt: new Date(),
        completedBy: user?.displayName || user?.email || t('anonymous'),
        completedByUid: user?.uid,
        familyId: family.id,
        listId: currentList.id,
        receiptPhoto: receiptPhoto || null
      });

      for (const item of purchasedItems) {
        await firestore.deleteDoc(firestore.doc(db, 'shopping-items', item.id));
      }

      setShowFinishShopping(false);
      setTotalAmount('');
      setReceiptPhoto(null);
      loadHistory();
    } catch (error) {
      console.error('Error finishing shopping:', error);
      alert('שגיאה בשמירת הקנייה. נסה שוב.');
    }
  }, [totalAmount, items, user, family, currentList, receiptPhoto, loadHistory]);

  // ====================
  // Export Functions
  // ====================

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
      try {
        await navigator.clipboard.writeText(text);
        alert('הרשימה הועתקה ללוח! הדבק בווטסאפ או בכל אפליקציה אחרת.');
      } catch (err) {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      }
    }
  }, [items, getCategoryName]);

  // ====================
  // Chat Functions
  // ====================

  const sendChatMessage = useCallback(async (text, photoUrl = null) => {
    if (!text.trim() && !photoUrl) return;

    const senderName = childUser?.displayName || user?.displayName || user?.email || t('anonymous');
    const senderUid = childUser?.childId || user?.uid || 'anonymous';

    try {
      await firestore.addDoc(firestore.collection(db, 'family-chat'), {
        text: text.trim(),
        photoUrl: photoUrl,
        senderName: senderName,
        senderUid: senderUid,
        isChildAccount: !!childUser && !user,
        familyId: family.id,
        createdAt: firestore.serverTimestamp()
      });
      setChatInput('');
      setCapturedPhoto(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [childUser, user, family]);

  // ====================
  // Dark Mode & Settings
  // ====================

  const toggleDarkMode = useCallback(() => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    document.documentElement.classList.toggle('dark');
  }, [darkMode]);

  const handleLogout = useCallback(async () => {
    try {
      await firebaseAuth.signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  // ====================
  // Shopping Mode
  // ====================

  const toggleShoppingMode = useCallback(async () => {
    if (shoppingMode) {
      if (wakeLock) {
        await wakeLock.release();
        setWakeLock(null);
      }
      setShoppingMode(false);
    } else {
      try {
        if ('wakeLock' in navigator) {
          const lock = await navigator.wakeLock.request('screen');
          setWakeLock(lock);
        }
        setShoppingMode(true);
      } catch (err) {
        console.log('Wake Lock not supported:', err);
        setShoppingMode(true);
      }
    }
  }, [shoppingMode, wakeLock]);

  // ====================
  // Computed Values
  // ====================

  const filteredItems = items;
  const groupedItems = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [filteredItems]);

  const totalItems = items.length;
  const purchasedCount = items.filter(item => item.purchased).length;

  const estimatedTotal = useMemo(() => {
    return items
      .filter(i => !i.purchased)
      .reduce((sum, i) => sum + calculateItemPrice(i), 0);
  }, [items]);

  // Product suggestions based on search
  const suggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    const term = searchTerm.toLowerCase();
    const results = [];

    // Search in all product categories
    for (const [category, products] of Object.entries(PRODUCTS)) {
      for (const product of products) {
        if (product.toLowerCase().includes(term) || term.includes(product.toLowerCase())) {
          results.push({ name: product, category });
          if (results.length >= 10) return results;
        }
      }
    }

    return results;
  }, [searchTerm]);

  // ====================
  // Loading State
  // ====================

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 float">🛒</div>
          <div className="text-xl text-white font-medium">{t('loadingApp')}</div>
          <div className="mt-4 w-32 h-1 bg-white/20 rounded-full overflow-hidden mx-auto">
            <div className="h-full w-1/2 progress-animate rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // ====================
  // Render
  // ====================

  return (
    <div className="min-h-screen gradient-bg p-4 pb-4" role="application" aria-label="ListNest - רשימת קניות">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-2xl bg-gray-800 text-white text-sm font-medium shadow-xl animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Confetti Animation */}
      {confetti && <ConfettiBurst x={confetti.x} y={confetti.y} />}

      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-red-500 to-teal-500 text-white py-3 px-4 z-50 shadow-lg">
          <div className="flex items-center justify-center gap-3 max-w-lg mx-auto">
            <span className="text-xl">📡</span>
            <div className="text-center">
              <div className="font-bold">{t('noInternet')}</div>
              <div className="text-xs opacity-90">
                {pendingOperations.length > 0
                  ? `${pendingOperations.length} שינויים ממתינים לסנכרון`
                  : 'השינויים יישמרו ויסונכרנו כשהחיבור יחזור'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync Status Indicator */}
      {isOnline && (pendingOperations.length > 0 || syncStatus === 'syncing') && (
        <div className={`sync-indicator ${syncStatus === 'syncing' ? 'syncing' : 'online'}`}>
          {syncStatus === 'syncing' ? (
            <><span className="sync-spin">🔄</span><span>{t('syncing')}</span></>
          ) : (
            <><span>🟡</span><span>{t('waiting')} ({pendingOperations.length})</span></>
          )}
        </div>
      )}

      {/* Main Content */}
      <main id="main-content" role="main" aria-label="תוכן ראשי">
        {/* Header */}
        <div className="glass rounded-3xl p-6 mb-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gradient">{currentList?.name || t('shoppingList')}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {purchasedCount}/{totalItems} {t('items')}
                {estimatedTotal > 0 && ` • ~₪${estimatedTotal.toFixed(0)}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Shopping Mode Button */}
              <button
                onClick={toggleShoppingMode}
                className={`p-3 rounded-xl transition-all ${
                  shoppingMode
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
                title={shoppingMode ? 'מצב קניות פעיל' : 'הפעל מצב קניות'}
              >
                🛒
              </button>
              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                ⚙️
              </button>
              {/* Chat Button */}
              <button
                onClick={() => setShowChat(true)}
                className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900 transition-all relative"
              >
                💬
                {chatMessages.filter(m => m.senderUid !== user?.uid && (!m.readBy || !m.readBy.includes(user?.uid))).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {chatMessages.filter(m => m.senderUid !== user?.uid && (!m.readBy || !m.readBy.includes(user?.uid))).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${totalItems > 0 ? (purchasedCount / totalItems) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Add Product Bar */}
        <div className="glass rounded-2xl p-4 mb-6 shadow-lg">
          <div className="flex gap-3">
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
              placeholder={t('searchOrAddProduct')}
              className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="px-4 py-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-all"
              title={t('categories')}
            >
              📁
            </button>
            {voiceSupported && (
              <button
                onClick={() => {/* Voice recognition handler */}}
                className={`px-4 py-3 rounded-xl transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={isListening ? 'הפסק האזנה' : 'הוסף בקול'}
              >
                🎤
              </button>
            )}
            {/* Barcode Scanner Button */}
            <button
              onClick={() => barcodeScanning ? stopBarcodeScanner() : startBarcodeScanner()}
              className={`px-4 py-3 rounded-xl transition-all ${
                barcodeScanning
                  ? 'bg-teal-500 text-white animate-pulse'
                  : 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-900'
              }`}
              title={t('barcodeTab')}
            >
              📷
            </button>
          </div>

          {/* Product Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    addProduct(suggestion.name);
                    setSearchTerm('');
                  }}
                  className="px-3 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"
                >
                  {CATEGORIES[suggestion.category]?.icon} {suggestion.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Barcode Scanner Area */}
        {barcodeScanning && (
          <div className="glass rounded-2xl overflow-hidden mb-6 shadow-lg">
            <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
              <video
                ref={barcodeVideoRef}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                playsInline muted autoPlay
              />
              {/* Scan overlay */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '70%', height: '50%', border: '3px solid rgba(16,185,129,0.8)', borderRadius: 12, boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 4, right: 4, height: 2, background: 'linear-gradient(90deg, transparent, #10b981, transparent)', animation: 'barcodeScanLine 2s ease-in-out infinite', top: '50%' }} />
                </div>
                <p style={{ color: 'white', marginTop: 12, fontSize: 13, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                  {t('scanBarcodeInstruction')}
                </p>
              </div>
              {/* Close button */}
              <button
                onClick={() => stopBarcodeScanner()}
                style={{ position: 'absolute', top: 10, right: 10, width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}
              >
                ✕
              </button>
            </div>
            {/* iOS/Safari fallback notice */}
            {!('BarcodeDetector' in window) && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-center text-sm text-amber-700 dark:text-amber-300">
                {t('barcodeTip')}
              </div>
            )}
            {/* Manual entry while scanning */}
            <div className="p-3 flex gap-2">
              <input
                type="text" inputMode="numeric" pattern="[0-9]*"
                placeholder={t('barcodeLabel') + '...'}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm"
                style={{ direction: 'ltr' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && /^\d{8,14}$/.test(e.target.value.trim())) {
                    handleBarcodeDetected(e.target.value.trim());
                    e.target.value = '';
                  }
                }}
              />
            </div>
            <style>{`@keyframes barcodeScanLine { 0%,100% { top: 10%; opacity: .5; } 50% { top: 90%; opacity: 1; } }`}</style>
          </div>
        )}

        {/* Barcode Product Loading */}
        {barcodeProductLoading && (
          <div className="glass rounded-2xl p-6 mb-6 text-center shadow-lg">
            <div className="inline-block w-8 h-8 border-3 border-gray-200 border-t-teal-500 rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('searchingInDB')}</p>
          </div>
        )}

        {/* Barcode Product Result */}
        {barcodeResult?.found && (
          <div className="glass rounded-2xl p-4 mb-4 shadow-lg border-2 border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
            <div className="flex items-center gap-3">
              {barcodeResult.image && (
                <img src={barcodeResult.image} alt={barcodeResult.name} className="w-16 h-16 rounded-xl object-cover bg-white border border-gray-200" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-0.5">{t('productFoundFromBarcode')}</p>
                <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">{barcodeResult.name}</h3>
                {barcodeResult.brand && <p className="text-xs text-gray-500">{barcodeResult.brand}</p>}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => { addProduct(scannedProductName); stopBarcodeScanner(); }}
                className="flex-1 py-3 min-h-[44px] rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-1.5"
              >
                ➕ {t('addToList')}
              </button>
              <button
                onClick={() => { stopBarcodeScanner(); }}
                className="py-3 px-4 min-h-[44px] rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm"
              >
                {t('newSearch')}
              </button>
            </div>
          </div>
        )}

        {/* Barcode Product Not Found */}
        {barcodeResult && !barcodeResult.found && (
          <div className="glass rounded-2xl p-4 mb-4 shadow-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-center">
            <p className="text-sm text-amber-700 dark:text-amber-300 font-semibold mb-1">{t('productNotFound')}</p>
            <p className="text-xs text-amber-600 dark:text-amber-400" dir="ltr">{barcodeResult.barcode}</p>
            <button
              onClick={() => { stopBarcodeScanner(); }}
              className="mt-3 py-3 px-4 min-h-[44px] rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold"
            >
              {t('newSearch')}
            </button>
          </div>
        )}

        {/* Barcode Price Loading */}
        {barcodePriceLoading && (
          <div className="glass rounded-2xl p-6 mb-4 text-center shadow-lg">
            <div className="inline-block w-8 h-8 border-3 border-gray-200 border-t-teal-500 rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('comparingPrices')}</p>
          </div>
        )}

        {/* Barcode Price Results */}
        {barcodePriceResults && barcodePriceResults.length > 0 && (
          <div className="glass rounded-2xl p-4 mb-6 shadow-lg">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">💰 {t('priceComparison')}</h3>
            <div className="space-y-2">
              {barcodePriceResults.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    idx === 0 ? 'bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700' : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">{item.chain}</span>
                      {idx === 0 && (
                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{t('cheapestBadge')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-lg font-bold ${idx === 0 ? 'text-emerald-600' : 'text-gray-700 dark:text-gray-300'}`} dir="ltr">
                      ₪{item.price?.toFixed(2) || '?'}
                    </span>
                    {userLocation && !item.isEstimate && (
                      <button
                        onClick={() => navigateToStore(item.chain)}
                        className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0"
                        title={t('navigateToStore')}
                      >
                        📍
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Savings */}
            {barcodePriceResults.length >= 2 && (barcodePriceResults[barcodePriceResults.length - 1].price - barcodePriceResults[0].price) > 0 && (
              <div className="mt-3 p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-center">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {t('possibleSavings')}: ₪{(barcodePriceResults[barcodePriceResults.length - 1].price - barcodePriceResults[0].price).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Barcode No Prices */}
        {barcodePriceResults && barcodePriceResults.length === 0 && barcodeResult?.found && (
          <div className="glass rounded-2xl p-4 mb-6 text-center shadow-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t('noDataFound')}</p>
            <button
              onClick={() => { setPriceCompareProduct(scannedProductName); setShowPriceComparison(true); }}
              className="py-3 px-4 min-h-[44px] rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold border border-blue-200 dark:border-blue-800"
            >
              🔍 {t('newSearch')}
            </button>
          </div>
        )}

        {/* Category Filter */}
        {showCategories && (
          <div className="glass rounded-2xl p-4 mb-6 shadow-lg overflow-x-auto">
            <div className="flex gap-2 pb-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === null
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {t('all')}
              </button>
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                    selectedCategory === key
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {cat.icon} {getCategoryName(key)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-4">
          {Object.entries(groupedItems)
            .filter(([category]) => !selectedCategory || category === selectedCategory)
            .map(([category, categoryItems]) => (
              <div key={category} className="glass rounded-2xl overflow-hidden shadow-lg">
                {/* Category Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{CATEGORIES[category]?.icon}</span>
                    <span className="font-semibold text-gray-800 dark:text-white">{getCategoryName(category)}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">({categoryItems.length})</span>
                  </div>
                </div>

                {/* Category Items */}
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {categoryItems.map((item) => (
                    <SwipeableItem
                      key={item.id}
                      onSwipeRight={() => togglePurchased(item.id, item.purchased)}
                      onSwipeLeft={() => deleteItem(item.id)}
                      purchased={item.purchased}
                      className={exitingItems.has(item.id) ? 'item-exit' : ''}
                    >
                      <div
                        className={`p-4 flex items-center gap-4 transition-all ${
                          item.purchased ? 'bg-green-50 dark:bg-green-900/20' : 'bg-white dark:bg-gray-800'
                        } ${animatingItems.has(item.id) ? 'scale-95 opacity-80' : ''}`}
                      >
                        {/* Checkbox */}
                        <button
                          onClick={(e) => togglePurchasedWithAnimation(item.id, item.purchased, e)}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            item.purchased
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                          }`}
                        >
                          {item.purchased && '✓'}
                        </button>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium ${item.purchased ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-white'}`}>
                            {item.name}
                          </div>
                          {item.note && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                              📝 {item.note}
                            </div>
                          )}
                          {item.addedBy && (
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              {t('addedBy')}: {item.addedBy}
                            </div>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, getQuantityNumber(item.quantity) - 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-medium text-gray-800 dark:text-white">
                            {item.quantity} {item.unit}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, getQuantityNumber(item.quantity) + 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                          >
                            +
                          </button>
                        </div>

                        {/* Menu Button */}
                        <button
                          onClick={() => setOpenItemMenu(item.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                        >
                          ⋮
                        </button>
                      </div>
                    </SwipeableItem>
                  ))}
                </div>
              </div>
            ))}
        </div>

        {/* Empty State */}
        {items.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{t('emptyList')}</h3>
            <p className="text-gray-500 dark:text-gray-400">{t('addFirstProduct')}</p>
          </div>
        )}

        {/* Action Buttons */}
        {items.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              onClick={exportToWhatsApp}
              className="py-4 px-6 bg-green-500 text-white rounded-2xl font-semibold shadow-lg hover:bg-green-600 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              📤 {t('shareList')}
            </button>
            <button
              onClick={() => setShowFinishShopping(true)}
              disabled={purchasedCount === 0}
              className="py-4 px-6 btn-gradient text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              ✓ {t('finishShopping')}
            </button>
          </div>
        )}
      </main>

      {/* Quantity Selector Modal */}
      {showQuantitySelector && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">{CATEGORIES[selectedProduct.category]?.icon}</div>
              <h2 className="text-xl font-bold text-gradient">{selectedProduct.name}</h2>
              {selectedProduct.existingQty > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('currentlyInCart')}: {selectedProduct.existingQty}
                </p>
              )}
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={() => setSelectedQuantity(Math.max(0, selectedQuantity - 1))}
                className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 text-2xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                -
              </button>
              <div className="text-center">
                <span className="text-4xl font-bold text-gradient">{selectedQuantity}</span>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="block w-full mt-2 text-center bg-transparent border-none text-gray-500 dark:text-gray-400"
                >
                  {selectedProduct.unitOptions.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 text-2xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                +
              </button>
            </div>

            {/* Note Input */}
            <input
              type="text"
              value={selectedNote}
              onChange={(e) => setSelectedNote(e.target.value)}
              placeholder={t('addNoteOptional')}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white mb-4 focus:border-indigo-500 transition-all"
            />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowQuantitySelector(false);
                  setSelectedProduct(null);
                  setSelectedNote('');
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                {t('cancel')}
              </button>
              <button
                onClick={addProductWithQuantity}
                disabled={selectedQuantity === 0 && !selectedProduct.existingId}
                className="flex-1 py-3 px-4 btn-gradient text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {selectedProduct.existingQty > 0 ? t('update') : t('add')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <div className="text-5xl text-center mb-4">🗑️</div>
            <h2 className="text-xl font-bold text-center text-gradient mb-2">{t('deleteProduct')}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">{t('confirmDelete')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteItem(showDeleteConfirm)}
                className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 font-semibold transition-all"
              >
                {t('delete')}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-6 py-3 glass border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105 transition-all"
              >
                {t('cancel')}
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
            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl animate-slide-up">
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              </div>
              <div className="px-5 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{menuItem.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('selectAction')}</p>
              </div>
              <div className="py-2">
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
                  <span>{t('deleteItem')}</span>
                </button>
              </div>
              <div className="p-4 pb-8 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setOpenItemMenu(null)}
                  className="w-full py-4 text-center font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-lg"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Finish Shopping Modal */}
      {showFinishShopping && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-4xl text-center mb-3">🎉</div>
            <h2 className="text-2xl font-bold text-center text-gradient mb-4">{t('finishShopping')}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
              {purchasedCount} {t('itemsPurchased')}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('totalAmount')} (₪)
              </label>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:border-indigo-500 transition-all text-2xl font-bold text-center"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFinishShopping(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                {t('cancel')}
              </button>
              <button
                onClick={finishShopping}
                className="flex-1 py-3 px-4 btn-gradient text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gradient">{t('settings')}</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{darkMode ? '🌙' : '☀️'}</span>
                  <span className="font-medium text-gray-800 dark:text-white">{t('darkMode')}</span>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`w-14 h-8 rounded-full transition-all ${
                    darkMode ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-all ${
                    darkMode ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Language Selector */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🌍</span>
                  <span className="font-medium text-gray-800 dark:text-white">{t('language')}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => changeLanguage('he')}
                    className={`flex-1 py-2 px-4 rounded-xl transition-all ${
                      language === 'he' ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    עברית
                  </button>
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`flex-1 py-2 px-4 rounded-xl transition-all ${
                      language === 'en' ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Logout Button */}
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

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col z-50">
          {/* Header */}
          <div className="p-4 flex items-center justify-between bg-white/10">
            <button
              onClick={() => setShowChat(false)}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-xl hover:bg-white/30 transition-all"
            >
              ✕
            </button>
            <h2 className="text-white font-bold text-lg">💬 {t('familyChat')}</h2>
            <div className="w-10"></div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[80%] ${
                  msg.senderUid === user?.uid ? 'ml-auto' : 'mr-auto'
                }`}
              >
                <div className={`p-3 rounded-2xl ${
                  msg.senderUid === user?.uid
                    ? 'bg-indigo-500 text-white rounded-br-none'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-bl-none'
                }`}>
                  {msg.senderUid !== user?.uid && (
                    <div className="text-xs font-semibold mb-1 opacity-70">{msg.senderName}</div>
                  )}
                  {msg.photoUrl && (
                    <img src={msg.photoUrl} alt="" className="rounded-lg mb-2 max-w-full" />
                  )}
                  <div>{msg.text}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 bg-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    sendChatMessage(chatInput);
                  }
                }}
                placeholder={t('typeMessage')}
                className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => sendChatMessage(chatInput)}
                disabled={!chatInput.trim()}
                className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-indigo-600 transition-all"
              >
                📤
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Modals */}
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
    </div>
  );
}

export default ShoppingList;
