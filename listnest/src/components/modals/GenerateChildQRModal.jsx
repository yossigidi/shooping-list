import React, { useState, useEffect } from 'react';
import { useFamily } from '../../contexts/FamilyContext';
import { useLanguage } from '../../contexts/LanguageContext';
import qrcode from 'qrcode-generator';

function GenerateChildQRModal({ onClose }) {
    const { generateChildInviteToken, family } = useFamily();
    const { t, language } = useLanguage();
    const [token, setToken] = useState(null);
    const [expiresAt, setExpiresAt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const isRTL = language === 'he' || language === 'ar';

    // Generate token on mount
    useEffect(() => {
        const generateToken = async () => {
            const result = await generateChildInviteToken();
            if (result.success) {
                setToken(result.token);
                setExpiresAt(result.expiresAt);

                // Generate QR code
                const joinUrl = `${window.location.origin}${window.location.pathname}?childToken=${result.token}`;
                try {
                    const qr = qrcode(0, 'M');
                    qr.addData(joinUrl);
                    qr.make();
                    setQrCodeUrl(qr.createDataURL(6, 0));
                } catch (e) {
                    console.error('QR generation error:', e);
                }
            } else {
                setError(t('error'));
            }
            setLoading(false);
        };
        generateToken();
    }, []);

    // Countdown timer
    useEffect(() => {
        if (!expiresAt) return;

        const updateTimer = () => {
            const now = new Date();
            const expires = new Date(expiresAt);
            const diff = Math.max(0, Math.floor((expires - now) / 1000));
            setTimeLeft(diff);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [expiresAt]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const copyLink = () => {
        const joinUrl = `${window.location.origin}${window.location.pathname}?childToken=${token}`;
        navigator.clipboard.writeText(joinUrl);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="glass rounded-3xl p-6 max-w-md w-full shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-2xl">📱</span>
                        <span className="text-gradient">{t('childInviteQR')}</span>
                    </h2>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center glass rounded-full text-gray-500 hover:text-red-500 text-2xl hover:scale-110 transition-all">×</button>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-4 animate-pulse">📱</div>
                        <p className="text-gray-600 dark:text-gray-400">{t('loading')}</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-4">❌</div>
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                ) : timeLeft === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-4">⏰</div>
                        <p className="text-teal-600 dark:text-teal-400 font-medium">{t('qrExpired')}</p>
                        <button
                            onClick={onClose}
                            className="mt-4 glass py-2 px-6 rounded-xl font-semibold"
                        >
                            {t('close')}
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        {/* QR Code */}
                        {qrCodeUrl && (
                            <div className="flex justify-center mb-4">
                                <div className="bg-white p-4 rounded-xl shadow-lg">
                                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                                </div>
                            </div>
                        )}

                        {/* Timer */}
                        <div className="mb-4">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'} font-mono font-bold text-lg`}>
                                <span>⏱️</span>
                                <span>{formatTime(timeLeft)}</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                {t('qrValidFor').replace('{minutes}', '10')}
                            </p>
                        </div>

                        {/* Copy link button */}
                        <button
                            onClick={copyLink}
                            className="w-full glass py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <span>🔗</span>
                            <span>{t('copyLink')}</span>
                        </button>

                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                            {t('scanToJoin')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GenerateChildQRModal;
