import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

export function VoiceInput({ onResult, onClose, isOpen }) {
  const { t, language, isRTL } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceLang, setVoiceLang] = useState(language === 'he' ? 'he-IL' : 'en-US');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if (!isOpen) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(t('speechNotSupported'));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = voiceLang;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const text = result[0].transcript;
      setTranscript(text);

      if (result.isFinal) {
        onResult(text);
        setIsListening(false);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);

      if (event.error === 'no-speech') {
        setError(t('noSpeechDetected'));
      } else if (event.error === 'not-allowed') {
        setError(t('microphoneNotAllowed'));
      } else {
        setError(t('speechError'));
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Auto-start when opened
    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start recognition:', e);
    }

    return () => {
      try {
        recognition.stop();
      } catch (e) {
        // Ignore
      }
    };
  }, [isOpen, voiceLang, onResult, t]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      setError(null);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    }
  }, [isListening]);

  const toggleLanguage = useCallback(() => {
    const newLang = voiceLang === 'he-IL' ? 'en-US' : 'he-IL';
    setVoiceLang(newLang);

    if (recognitionRef.current) {
      recognitionRef.current.lang = newLang;
      if (isListening) {
        recognitionRef.current.stop();
        setTimeout(() => {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error('Failed to restart recognition:', e);
          }
        }, 100);
      }
    }
  }, [voiceLang, isListening]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
         onClick={onClose}>
      <div className={`bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm p-8 shadow-2xl ${isRTL ? 'rtl' : 'ltr'}`}
           onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Microphone Animation */}
        <div className="flex flex-col items-center">
          <button
            onClick={toggleListening}
            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-gradient-to-br from-red-500 to-pink-500 animate-pulse shadow-lg shadow-red-500/50'
                : 'bg-gradient-to-br from-teal-500 to-emerald-500 hover:shadow-lg hover:shadow-teal-500/50'
            }`}>
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          {/* Status Text */}
          <div className="mt-6 text-center">
            {isListening ? (
              <p className="text-lg font-medium text-gray-900 dark:text-white animate-pulse">
                {t('listening')}...
              </p>
            ) : (
              <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
                {t('tapToSpeak')}
              </p>
            )}
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl w-full">
              <p className="text-center text-gray-900 dark:text-white font-medium">
                "{transcript}"
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 rounded-xl w-full">
              <p className="text-center text-red-600 dark:text-red-400 text-sm">
                {error}
              </p>
            </div>
          )}

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="mt-6 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            {voiceLang === 'he-IL' ? '🇮🇱 עברית' : '🇺🇸 English'}
          </button>

          {/* Visual Feedback */}
          {isListening && (
            <div className="mt-6 flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-teal-500 rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 24 + 8}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VoiceInput;
