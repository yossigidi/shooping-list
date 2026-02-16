import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import PasswordResetForm from './PasswordResetForm';
import ChildLoginForm from './ChildLoginForm';
import ChildQRJoinScreen from './ChildQRJoinScreen';
import ResetPasswordFromLink from './ResetPasswordFromLink';

export default function AuthScreen() {
  const { t, language } = useLanguage();
  const [mode, setMode] = useState('login');
  const [darkMode, setDarkMode] = useState(false);
  const [childToken, setChildToken] = useState(null);
  const [resetOobCode, setResetOobCode] = useState(null);
  const isRTL = language === 'he' || language === 'ar';

  useEffect(() => {
    const savedDark = localStorage.getItem('darkMode') === 'true';
    if (savedDark) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Check for invite link - save join code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    if (joinCode && joinCode.length === 6) {
      localStorage.setItem('pendingJoinCode', joinCode);
      // Switch to signup mode for new users coming from invite
      setMode('signup');
      // Clean URL without reloading
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Check for child token from QR code
    const token = urlParams.get('childToken');
    if (token) {
      setChildToken(token);
      setMode('child-qr');
      // Clean URL without reloading
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Check for child join link (direct link to child login)
    const childJoinCode = urlParams.get('childJoin');
    if (childJoinCode && /^[A-Z0-9]{6}$/i.test(childJoinCode)) {
      // Switch directly to child login mode - ChildLoginForm will handle the code
      setMode('child-login');
      // Don't clean URL here - ChildLoginForm needs to read it
    }

    // Check for password reset link
    const resetMode = urlParams.get('mode');
    const oobCode = urlParams.get('oobCode');
    if (resetMode === 'resetPassword' && oobCode) {
      setResetOobCode(oobCode);
      setMode('reset-from-link');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="glass rounded-3xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <button
          onClick={toggleDarkMode}
          className="absolute top-6 left-6 p-2.5 rounded-xl bg-white/50 dark:bg-gray-700/50 text-2xl hover:scale-110 transition-all duration-300 shadow-lg"
        >
          {darkMode ? '\u2600\uFE0F' : '\uD83C\uDF19'}
        </button>

        <div className="text-center mb-8 pt-4">
          <div className="text-7xl mb-4 float">{mode === 'child-login' || mode === 'child-qr' ? '\uD83D\uDC66' : '\uD83D\uDED2'}</div>
          <h1 className="text-3xl font-bold text-gradient mb-2">ListNest</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('smartShoppingList')}</p>
        </div>

        {mode === 'login' && (
          <>
            <LoginForm
              onSwitchToSignUp={() => setMode('signup')}
              onSwitchToReset={() => setMode('reset')}
            />
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setMode('child-login')}
                className="w-full flex items-center justify-center gap-2 py-2 text-purple-600 dark:text-purple-400 font-medium hover:underline"
              >
                <span>&#128102;</span>
                {t('childLogin')}
              </button>
            </div>
          </>
        )}
        {mode === 'signup' && (
          <SignUpForm onSwitchToLogin={() => setMode('login')} />
        )}
        {mode === 'reset' && (
          <PasswordResetForm onSwitchToLogin={() => setMode('login')} />
        )}
        {mode === 'child-login' && (
          <ChildLoginForm onSwitchToLogin={() => setMode('login')} />
        )}
        {mode === 'child-qr' && childToken && (
          <ChildQRJoinScreen
            token={childToken}
            onBack={() => { setMode('login'); setChildToken(null); }}
          />
        )}
        {mode === 'reset-from-link' && resetOobCode && (
          <ResetPasswordFromLink
            oobCode={resetOobCode}
            onDone={() => { setResetOobCode(null); setMode('login'); }}
          />
        )}
      </div>
    </div>
  );
}
