import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useChildAuth } from '../../contexts/ChildAuthContext';
import { db, firestore } from '../../services/firebase';

export default function ChildQRJoinScreen({ token, onBack }) {
  const { t, language } = useLanguage();
  const { loginChildWithToken } = useChildAuth();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [error, setError] = useState('');
  const isRTL = language === 'he' || language === 'ar';

  // Validate token on mount
  useEffect(() => {
    const validate = async () => {
      try {
        // Query families for matching token directly
        const familiesRef = firestore.collection(db, 'families');
        const snapshot = await firestore.getDocs(familiesRef);

        let found = null;
        snapshot.forEach(doc => {
          const data = doc.data();
          const matchingToken = data.childInviteTokens?.find(t =>
            t.token === token &&
            !t.usedAt &&
            new Date(t.expiresAt.toDate ? t.expiresAt.toDate() : t.expiresAt) > new Date()
          );
          if (matchingToken) {
            found = { familyId: doc.id, familyName: data.name, familyCode: data.code };
          }
        });

        if (found) {
          setTokenInfo(found);
        } else {
          setError(t('invalidToken'));
        }
      } catch (err) {
        console.error('Token validation error:', err);
        setError(t('error'));
      }
      setValidating(false);
    };
    validate();
  }, [token, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError(t('enterDisplayName'));
      return;
    }

    setLoading(true);
    const result = await loginChildWithToken(token, displayName.trim());

    if (result.success) {
      window.location.reload();
    } else {
      setError(t(result.error) || t('error'));
    }
    setLoading(false);
  };

  if (validating) {
    return (
      <div className="text-center py-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-4xl mb-4 animate-pulse">&#128241;</div>
        <p className="text-gray-600 dark:text-gray-400">{t('loading')}</p>
      </div>
    );
  }

  if (error && !tokenInfo) {
    return (
      <div className="text-center py-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-4xl mb-4">&#10060;</div>
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={onBack}
          className="text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {t('backToLogin')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-2 flex items-center justify-center gap-2">
        <span>&#128102;</span>
        {t('joinViaQR')}
      </h2>

      <div className="text-center mb-4">
        <p className="text-gray-600 dark:text-gray-400">
          {t('joinFamily')}: <strong className="text-indigo-600 dark:text-indigo-400">{tokenInfo?.familyName}</strong>
        </p>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('enterYourName')}</label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder={t('displayNamePlaceholder')}
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:border-indigo-500 transition-colors"
            autoFocus
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
        >
          {loading ? t('joining') : t('joinFamily')}
        </button>
      </form>

      <button
        onClick={onBack}
        className="w-full text-gray-600 dark:text-gray-400 text-sm hover:underline"
      >
        {t('cancel')}
      </button>
    </div>
  );
}
