import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { auth, firebaseAuth } from '../../services/firebase';

export default function ResetPasswordFromLink({ oobCode, onDone }) {
  const { t, language } = useLanguage();
  const isRTL = language === 'he' || language === 'ar';

  const [verifying, setVerifying] = useState(true);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invalidCode, setInvalidCode] = useState(false);

  useEffect(() => {
    firebaseAuth.verifyPasswordResetCode(auth, oobCode)
      .then(email => {
        setEmail(email);
        setVerifying(false);
      })
      .catch(() => {
        setInvalidCode(true);
        setVerifying(false);
      });
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError(t('resetPasswordTooShort'));
      return;
    }
    if (newPassword !== confirmPass) {
      setError(t('resetPasswordMismatch'));
      return;
    }

    try {
      setLoading(true);
      await firebaseAuth.confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
      // Sign out after password reset
      try {
        await firebaseAuth.signOut(auth);
      } catch (e) {
        // ignore signout errors
      }
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Auto-redirect after 3 seconds
      setTimeout(() => onDone(), 3000);
    } catch (err) {
      setError(t('error') + ': ' + (err.message || err.code));
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="text-center space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-6xl animate-spin">⏳</div>
        <p className="text-gray-600 dark:text-gray-400">{t('resetLinkVerifying')}</p>
      </div>
    );
  }

  if (invalidCode) {
    return (
      <div className="text-center space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-6xl">❌</div>
        <h2 className="text-xl font-bold text-red-600">{t('resetInvalidCode')}</h2>
        <button
          onClick={onDone}
          className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
        >
          {t('resetBackToLogin')}
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-6xl">✅</div>
        <h2 className="text-xl font-bold text-green-600">{t('resetSuccess')}</h2>
        <p className="text-gray-500 text-sm">{t('resetAutoSignout')}</p>
        <button
          onClick={onDone}
          className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
        >
          {t('resetBackToLogin')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-2">
        {t('resetNewPassword')}
      </h2>
      <p className="text-center text-gray-500 text-sm">{email}</p>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('resetNewPassword')}
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:border-indigo-500 transition-colors"
          required
          minLength={8}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('confirmPassword')}
        </label>
        <input
          type="password"
          value={confirmPass}
          onChange={e => setConfirmPass(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:border-indigo-500 transition-colors"
          required
          minLength={8}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
      >
        {loading ? t('resetSettingPassword') : t('resetPassword')}
      </button>
    </form>
  );
}
