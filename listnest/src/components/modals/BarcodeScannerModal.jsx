import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { loadQuagga, fetchProductByBarcode } from '../../services/firebase';

function BarcodeScannerModal({ isOpen, onClose, onProductFound }) {
  const { t } = useLanguage();
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [lastScanned, setLastScanned] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);
  const scannerRef = useRef(null);
  const quaggaRef = useRef(null);

  // Start barcode scanner
  const startScanner = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      // Check camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission(true);

      // Load Quagga library
      const Quagga = await loadQuagga();
      quaggaRef.current = Quagga;

      // Initialize scanner
      Quagga.init({
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: scannerRef.current,
          constraints: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        },
        decoder: {
          readers: [
            'ean_reader',
            'ean_8_reader',
            'code_128_reader',
            'code_39_reader',
            'upc_reader',
            'upc_e_reader'
          ]
        },
        locate: true,
        locator: {
          halfSample: true,
          patchSize: 'medium'
        }
      }, (err) => {
        setLoading(false);
        if (err) {
          console.error('Quagga init error:', err);
          setError(t('cameraError') || 'שגיאה בגישה למצלמה');
          return;
        }
        Quagga.start();
        setScanning(true);
      });

      // Handle detected barcodes
      Quagga.onDetected(async (result) => {
        const code = result.codeResult.code;
        if (code && code !== lastScanned) {
          setLastScanned(code);
          // Vibrate if supported
          if (navigator.vibrate) {
            navigator.vibrate(100);
          }
          // Stop scanning and look up product
          Quagga.stop();
          setScanning(false);
          await lookupProduct(code);
        }
      });

    } catch (err) {
      setLoading(false);
      console.error('Scanner error:', err);
      if (err.name === 'NotAllowedError') {
        setCameraPermission(false);
        setError(t('cameraPermissionDenied') || 'נדרשת הרשאה למצלמה');
      } else {
        setError(t('cameraError') || 'שגיאה בגישה למצלמה');
      }
    }
  }, [lastScanned, t]);

  // Stop scanner
  const stopScanner = useCallback(() => {
    if (quaggaRef.current && scanning) {
      quaggaRef.current.stop();
      setScanning(false);
    }
  }, [scanning]);

  // Look up product by barcode
  const lookupProduct = async (barcode) => {
    setLoading(true);
    setError(null);

    try {
      const product = await fetchProductByBarcode(barcode);
      setLoading(false);

      if (product.found && product.name) {
        onProductFound({
          name: product.name,
          brand: product.brand,
          image: product.image,
          barcode: barcode
        });
        onClose();
      } else {
        setError(t('productNotFound') || 'המוצר לא נמצא במאגר');
        // Allow manual entry or rescan
        setManualBarcode(barcode);
      }
    } catch (err) {
      setLoading(false);
      console.error('Product lookup error:', err);
      setError(t('lookupError') || 'שגיאה בחיפוש המוצר');
    }
  };

  // Handle manual barcode entry
  const handleManualSubmit = async () => {
    if (manualBarcode.trim()) {
      await lookupProduct(manualBarcode.trim());
    }
  };

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  // Start scanner when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setManualBarcode('');
      setLastScanned(null);
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        startScanner();
      }, 300);
    } else {
      stopScanner();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <span className="text-2xl">📷</span>
            {t('scanBarcode') || 'סרוק ברקוד'}
          </h2>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Scanner Area */}
        <div className="relative">
          {/* Camera Preview */}
          <div
            ref={scannerRef}
            className="w-full h-64 bg-gray-900 relative overflow-hidden"
          >
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
              </div>
            )}

            {/* Scan Frame Overlay */}
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-32 border-2 border-green-400 rounded-lg relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
                  {/* Scanning line animation */}
                  <div className="absolute left-2 right-2 h-0.5 bg-green-400 animate-pulse" style={{ top: '50%' }}></div>
                </div>
              </div>
            )}

            {/* Permission Denied */}
            {cameraPermission === false && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-center">
                <span className="text-4xl mb-4">🚫</span>
                <p className="mb-4">{t('cameraPermissionDenied') || 'נדרשת הרשאה למצלמה'}</p>
                <p className="text-sm text-gray-400">{t('enableCameraInSettings') || 'הפעל את המצלמה בהגדרות הדפדפן'}</p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border-t border-red-100 dark:border-red-900">
              <p className="text-red-600 dark:text-red-400 text-center text-sm">{error}</p>
              <button
                onClick={startScanner}
                className="mt-2 w-full py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-all"
              >
                {t('tryAgain') || 'נסה שוב'}
              </button>
            </div>
          )}
        </div>

        {/* Manual Entry */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 text-center">
            {t('orEnterManually') || 'או הכנס ברקוד ידנית'}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleManualSubmit();
              }}
              placeholder={t('barcodeNumber') || 'מספר ברקוד'}
              className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-indigo-500 transition-all text-center text-lg tracking-wider"
              inputMode="numeric"
              pattern="[0-9]*"
            />
            <button
              onClick={handleManualSubmit}
              disabled={!manualBarcode.trim() || loading}
              className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-indigo-600 transition-all"
            >
              {t('search') || 'חפש'}
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('scanTip') || 'כוון את המצלמה לברקוד של המוצר'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default BarcodeScannerModal;
