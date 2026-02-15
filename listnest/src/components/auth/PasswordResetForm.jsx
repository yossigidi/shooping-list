import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage } from '../../utils/authErrors';

export default function PasswordResetForm({ onSwitchToLogin }) {
  const { t, language } = useLanguage();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const isRTL = language === 'he' || language === 'ar';

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-6xl">&#128231;</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('sent')}</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('resetLinkSent')}<br/>
          <span className="font-semibold" dir="ltr">{email}</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">{t('checkSpam')}</p>
        <button
          onClick={onSwitchToLogin}
          className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
        >
          {t('backToLogin')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleReset} className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-2">{t('resetPassword')}</h2>
      <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-6">
        {t('enterEmailForReset')}
      </p>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="example@email.com"
          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
          dir="ltr"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t('sending') : t('sendResetLink')}
      </button>

      <button
        type="button"
        onClick={onSwitchToLogin}
        className="w-full text-indigo-600 dark:text-indigo-400 text-sm hover:underline"
      >
        {t('backToLogin')}
      </button>
    </form>
  );
}
