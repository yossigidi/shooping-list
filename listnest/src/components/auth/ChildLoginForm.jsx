import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useChildAuth } from '../../contexts/ChildAuthContext';
import { db, firestore } from '../../services/firebase';

export default function ChildLoginForm({ onSwitchToLogin }) {
  const { t, language } = useLanguage();
  const { loginChild } = useChildAuth();
  const [familyCode, setFamilyCode] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [childAccounts, setChildAccounts] = useState([]);
  const [familyData, setFamilyData] = useState(null);
  const [step, setStep] = useState(1); // 1: enter code, 2: select child, 3: enter PIN
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [autoSubmitting, setAutoSubmitting] = useState(false);
  const isRTL = language === 'he' || language === 'ar';

  // Check for childJoin URL parameter and auto-populate family code
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const childJoinCode = urlParams.get('childJoin');
    if (childJoinCode && /^[A-Z0-9]{6}$/.test(childJoinCode.toUpperCase())) {
      setFamilyCode(childJoinCode.toUpperCase());
      setAutoSubmitting(true);
      // Clean URL after reading parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Auto-submit when we have the family code from URL
  useEffect(() => {
    if (autoSubmitting && familyCode.length === 6 && step === 1) {
      const autoSubmit = async () => {
        setLoading(true);
        try {
          const q = firestore.query(
            firestore.collection(db, 'families'),
            firestore.where('code', '==', familyCode.toUpperCase())
          );
          const snapshot = await firestore.getDocs(q);

          if (snapshot.empty) {
            setError(t('codeNotFound'));
            setAutoSubmitting(false);
            setLoading(false);
            return;
          }

          const doc = snapshot.docs[0];
          const data = doc.data();

          if (!data.childAccounts || data.childAccounts.length === 0) {
            setError(t('noChildAccounts'));
            setAutoSubmitting(false);
            setLoading(false);
            return;
          }

          // Filter to only show children with PIN
          const childrenWithPin = data.childAccounts.filter(c => c.pinHash);
          if (childrenWithPin.length === 0) {
            setError(t('noChildAccounts'));
            setAutoSubmitting(false);
            setLoading(false);
            return;
          }

          setFamilyData({ id: doc.id, ...data });
          setChildAccounts(childrenWithPin);
          setStep(2);
        } catch (err) {
          console.error('Auto family lookup error:', err);
          setError(t('error'));
        }
        setAutoSubmitting(false);
        setLoading(false);
      };
      autoSubmit();
    }
  }, [autoSubmitting, familyCode, step, t]);

  // Check rate limit from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('childLoginAttempts');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.lockedUntil && new Date(data.lockedUntil) > new Date()) {
        setLockedUntil(new Date(data.lockedUntil));
        setAttempts(data.attempts);
      } else if (new Date() - new Date(data.firstAttempt) > 15 * 60 * 1000) {
        // Reset after 15 minutes
        localStorage.removeItem('childLoginAttempts');
      } else {
        setAttempts(data.attempts);
      }
    }
  }, []);

  // Update lockout timer
  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      if (new Date() >= lockedUntil) {
        setLockedUntil(null);
        setAttempts(0);
        localStorage.removeItem('childLoginAttempts');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const recordAttempt = () => {
    const saved = localStorage.getItem('childLoginAttempts');
    let data = saved ? JSON.parse(saved) : { attempts: 0, firstAttempt: new Date().toISOString() };
    data.attempts++;

    if (data.attempts >= 5) {
      data.lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      setLockedUntil(new Date(data.lockedUntil));
    }

    localStorage.setItem('childLoginAttempts', JSON.stringify(data));
    setAttempts(data.attempts);
  };

  const handleFamilyCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^[A-Z0-9]{6}$/.test(familyCode.toUpperCase())) {
      setError(t('enterCode'));
      return;
    }

    setLoading(true);

    try {
      const q = firestore.query(
        firestore.collection(db, 'families'),
        firestore.where('code', '==', familyCode.toUpperCase())
      );
      const snapshot = await firestore.getDocs(q);

      if (snapshot.empty) {
        setError(t('codeNotFound'));
        setLoading(false);
        return;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();

      if (!data.childAccounts || data.childAccounts.length === 0) {
        setError(t('noChildAccounts'));
        setLoading(false);
        return;
      }

      // Filter to only show children with PIN (not QR-only)
      const childrenWithPin = data.childAccounts.filter(c => c.pinHash);
      if (childrenWithPin.length === 0) {
        setError(t('noChildAccounts'));
        setLoading(false);
        return;
      }

      setFamilyData({ id: doc.id, ...data });
      setChildAccounts(childrenWithPin);
      setStep(2);
    } catch (err) {
      console.error('Family lookup error:', err);
      setError(t('error'));
    }

    setLoading(false);
  };

  const handleChildSelect = (child) => {
    setSelectedChild(child);
    setStep(3);
    setPin('');
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (lockedUntil) {
      const mins = Math.ceil((lockedUntil - new Date()) / 60000);
      setError(t('tooManyAttempts').replace('{minutes}', mins));
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setError(t('invalidPin'));
      return;
    }

    setLoading(true);

    const result = await loginChild(
      familyData.id,
      familyData.code,
      selectedChild.childId,
      selectedChild.displayName,
      pin
    );

    if (result.success) {
      // Clear rate limit on success
      localStorage.removeItem('childLoginAttempts');
      // Reload to trigger auth state change
      window.location.reload();
    } else {
      recordAttempt();
      console.error('Child login failed:', result.error);
      if (result.error === 'invalidPin') {
        setError(t('invalidPin'));
      } else if (result.error === 'familyNotFound') {
        setError(t('familyNotFound') || 'Family not found');
      } else if (result.error === 'childNotFound') {
        setError(t('childNotFound') || 'Child account not found');
      } else {
        setError(t('loginError') || 'Login error - please try again');
      }
    }

    setLoading(false);
  };

  const getLockedMinutes = () => {
    if (!lockedUntil) return 0;
    return Math.ceil((lockedUntil - new Date()) / 60000);
  };

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-6 flex items-center justify-center gap-2">
        <span>&#128102;</span>
        {t('childLogin')}
      </h2>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {lockedUntil && (
        <div className="bg-teal-100 dark:bg-teal-900/30 border-2 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 px-4 py-3 rounded-lg text-sm text-center">
          {t('tooManyAttempts').replace('{minutes}', getLockedMinutes())}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleFamilyCodeSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('familyCode')}</label>
            <input
              type="text"
              value={familyCode}
              onChange={e => setFamilyCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="XXXXXX"
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:border-indigo-500 transition-colors text-center text-2xl tracking-widest font-mono"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || familyCode.length !== 6}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
          >
            {loading ? t('loading') : t('next')}
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">{t('selectChild')}</p>
          <div className="space-y-2">
            {childAccounts.map((child, idx) => (
              <button
                key={idx}
                onClick={() => handleChildSelect(child)}
                className="w-full glass rounded-xl p-4 flex items-center gap-4 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-2xl">
                  &#128102;
                </div>
                <span className="font-medium text-lg dark:text-white">{child.displayName}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => { setStep(1); setFamilyCode(''); }}
            className="w-full text-gray-600 dark:text-gray-400 text-sm hover:underline"
          >
            {t('back')}
          </button>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div className="text-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-3xl mx-auto mb-2">
              &#128102;
            </div>
            <p className="font-medium text-lg dark:text-white">{selectedChild.displayName}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('enterPin')}</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="****"
              className="w-full px-4 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:border-indigo-500 transition-colors text-center text-3xl tracking-widest"
              autoFocus
              required
              disabled={!!lockedUntil}
            />
          </div>

          <button
            type="submit"
            disabled={loading || pin.length !== 4 || !!lockedUntil}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
          >
            {loading ? t('loading') : t('login')}
          </button>

          <button
            type="button"
            onClick={() => { setStep(2); setPin(''); setError(''); }}
            className="w-full text-gray-600 dark:text-gray-400 text-sm hover:underline"
          >
            {t('back')}
          </button>
        </form>
      )}

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onSwitchToLogin}
          className="w-full text-indigo-600 dark:text-indigo-400 text-sm hover:underline"
        >
          {t('backToLogin')}
        </button>
      </div>
    </div>
  );
}
