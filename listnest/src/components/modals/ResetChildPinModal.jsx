import React, { useState } from 'react';
import { useFamily } from '../../contexts/FamilyContext';
import { useLanguage } from '../../contexts/LanguageContext';

function ResetChildPinModal({ child, onClose, onSuccess }) {
    const { resetChildPin } = useFamily();
    const { t, language } = useLanguage();
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const isRTL = language === 'he' || language === 'ar';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!/^\d{4}$/.test(pin)) {
            setError(t('invalidPin'));
            return;
        }

        if (pin !== confirmPin) {
            setError(t('pinMismatch'));
            return;
        }

        setLoading(true);
        const result = await resetChildPin(child.childId, pin);

        if (result.success) {
            onSuccess?.();
            onClose();
        } else {
            setError(t('error'));
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="glass rounded-3xl p-6 max-w-md w-full shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-2xl">🔑</span>
                        <span className="text-gradient">{t('resetPin')}</span>
                    </h2>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center glass rounded-full text-gray-500 hover:text-red-500 text-2xl hover:scale-110 transition-all">×</button>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {t('resetPin')} - {child.displayName}
                </p>

                {error && (
                    <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('pinCode')}</label>
                        <input
                            type="password"
                            inputMode="numeric"
                            pattern="\d{4}"
                            maxLength={4}
                            value={pin}
                            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="****"
                            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:border-indigo-500 transition-colors text-center text-2xl tracking-widest"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('confirmPin')}</label>
                        <input
                            type="password"
                            inputMode="numeric"
                            pattern="\d{4}"
                            maxLength={4}
                            value={confirmPin}
                            onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="****"
                            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:border-indigo-500 transition-colors text-center text-2xl tracking-widest"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 glass py-3 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 btn-gradient text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                        >
                            {loading ? t('loading') : t('save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ResetChildPinModal;
