import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const A11Y_SETTINGS_KEY = 'listnest_accessibility';

const defaultSettings = {
  highContrast: false,
  largeCursor: false,
  largeText: false,
  linkHighlight: false,
  reducedMotion: false,
  darkMode: false
};

export function AccessibilityModal({ isOpen, onClose, onDarkModeChange }) {
  const { t, isRTL } = useLanguage();
  const [settings, setSettings] = useState(defaultSettings);

  // Load settings from localStorage
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(A11Y_SETTINGS_KEY);
      if (saved) {
        setSettings(JSON.parse(saved));
      }
      // Check current dark mode
      const isDark = document.documentElement.classList.contains('dark');
      setSettings(prev => ({ ...prev, darkMode: isDark }));
    }
  }, [isOpen]);

  // Apply settings when they change
  useEffect(() => {
    applySettings(settings);
    localStorage.setItem(A11Y_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const applySettings = (newSettings) => {
    const html = document.documentElement;
    const body = document.body;

    // High Contrast
    if (newSettings.highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }

    // Large Cursor
    if (newSettings.largeCursor) {
      body.classList.add('large-cursor');
    } else {
      body.classList.remove('large-cursor');
    }

    // Large Text
    if (newSettings.largeText) {
      html.style.fontSize = '120%';
    } else {
      html.style.fontSize = '';
    }

    // Link Highlight
    if (newSettings.linkHighlight) {
      body.classList.add('link-highlight');
    } else {
      body.classList.remove('link-highlight');
    }

    // Reduced Motion
    if (newSettings.reducedMotion) {
      body.classList.add('reduce-motion');
    } else {
      body.classList.remove('reduce-motion');
    }

    // Dark Mode
    if (newSettings.darkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    // Notify parent of dark mode change
    if (onDarkModeChange) {
      onDarkModeChange(newSettings.darkMode);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const settingsConfig = [
    {
      key: 'darkMode',
      icon: '🌙',
      title: t('darkMode'),
      description: t('darkModeDesc')
    },
    {
      key: 'highContrast',
      icon: '🔲',
      title: t('highContrast'),
      description: t('highContrastDesc')
    },
    {
      key: 'largeText',
      icon: '🔤',
      title: t('largeText'),
      description: t('largeTextDesc')
    },
    {
      key: 'largeCursor',
      icon: '👆',
      title: t('largeCursor'),
      description: t('largeCursorDesc')
    },
    {
      key: 'linkHighlight',
      icon: '🔗',
      title: t('linkHighlight'),
      description: t('linkHighlightDesc')
    },
    {
      key: 'reducedMotion',
      icon: '⏸️',
      title: t('reducedMotion'),
      description: t('reducedMotionDesc')
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
         onClick={onClose}>
      <div className={`bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl ${isRTL ? 'rtl' : 'ltr'}`}
           onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">♿</span>
              {t('accessibility')}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-white/80 text-sm mt-1">{t('accessibilityDesc')}</p>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-180px)]">
          <div className="space-y-3">
            {settingsConfig.map((setting) => (
              <div
                key={setting.key}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{setting.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{setting.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => updateSetting(setting.key, !settings[setting.key])}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    settings[setting.key] ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      settings[setting.key] ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Reset Button */}
          <button
            onClick={resetSettings}
            className="w-full mt-6 p-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            {t('resetToDefault')}
          </button>

          {/* Accessibility Statement */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2">{t('accessibilityStatement')}</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {t('accessibilityStatementText')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccessibilityModal;
