import React, { useState } from 'react';
import { useFamily } from '../../contexts/FamilyContext';
import { useLanguage } from '../../contexts/LanguageContext';

function CreateChildAccountModal({ onClose, onSuccess }) {
    const { createChildAccount, family } = useFamily();
    const { t, language } = useLanguage();
    const [step, setStep] = useState('choose'); // choose, young, teen
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const isRTL = language === 'he' || language === 'ar';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError(t('enterDisplayName'));
            return;
        }

        if (!/^\d{4}$/.test(pin)) {
            setError(t('invalidPin'));
            return;
        }

        if (pin !== confirmPin) {
            setError(t('pinMismatch'));
            return;
        }

        setLoading(true);
        const result = await createChildAccount(name.trim(), pin);

        if (result.success) {
            onSuccess?.();
            onClose();
        } else {
            setError(t('error'));
        }
        setLoading(false);
    };

    const copyCode = () => {
        navigator.clipboard.writeText(family?.code || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="glass rounded-3xl p-6 max-w-md w-full shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-2xl">{step === 'teen' ? '🧑' : '👦'}</span>
                        <span className="text-gradient">{t('addChildAccount')}</span>
                    </h2>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center glass rounded-full text-gray-500 hover:text-red-500 text-2xl hover:scale-110 transition-all">×</button>
                </div>

                {/* Step 1: Choose child type */}
                {step === 'choose' && (
                    <div className="space-y-4">
                        <p className="text-center text-gray-600 dark:text-gray-400 mb-4">{t('selectChildType')}</p>

                        {/* Young child option */}
                        <button
                            onClick={() => setStep('young')}
                            className="w-full glass rounded-xl p-4 flex items-start gap-4 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-right"
                        >
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center text-white text-3xl flex-shrink-0">
                                👦
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-lg dark:text-white">{t('youngChild')}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{t('youngChildDesc')}</div>
                                <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                                    <span>⚠️</span>
                                    {t('youngChildPerms')}
                                </div>
                            </div>
                        </button>

                        {/* Older teen option */}
                        <button
                            onClick={() => setStep('teen')}
                            className="w-full glass rounded-xl p-4 flex items-start gap-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-right"
                        >
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-3xl flex-shrink-0">
                                🧑
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-lg dark:text-white">{t('olderTeen')}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{t('olderTeenDesc')}</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                                    <span>✨</span>
                                    {t('olderTeenPerms')}
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full text-gray-500 dark:text-gray-400 text-sm hover:underline mt-2"
                        >
                            {t('cancel')}
                        </button>
                    </div>
                )}

                {/* Step 2a: Young child - PIN form */}
                {step === 'young' && (
                    <>
                        {error && (
                            <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('childName')}</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder={t('displayNamePlaceholder')}
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:border-indigo-500 transition-colors"
                                    required
                                />
                            </div>

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
                                    onClick={() => { setStep('choose'); setError(''); setName(''); setPin(''); setConfirmPin(''); }}
                                    className="flex-1 glass py-3 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {t('back')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 btn-gradient text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                                >
                                    {loading ? t('loading') : t('add')}
                                </button>
                            </div>
                        </form>
                    </>
                )}

                {/* Step 2b: Older teen - Instructions */}
                {step === 'teen' && (
                    <div className="space-y-4">
                        <div className="text-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-3xl mx-auto mb-3">
                                🧑
                            </div>
                            <h3 className="font-bold text-lg dark:text-white">{t('howToAddTeen')}</h3>
                        </div>

                        <div className="glass rounded-xl p-4 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">{t('teenInstructions1')}</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">{t('teenInstructions2')}</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">{t('teenInstructions3')}</p>
                            </div>
                        </div>

                        {/* Family code display */}
                        <div className="glass rounded-xl p-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 text-center">{t('familyCode')}</p>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-indigo-100 dark:bg-indigo-900/50 px-4 py-3 rounded-lg text-center">
                                    <span className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-widest">{family?.code}</span>
                                </div>
                                <button
                                    onClick={copyCode}
                                    className="btn-gradient text-white px-4 py-3 rounded-lg hover:scale-105 transition-all"
                                >
                                    {copied ? '✓' : '📋'}
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setStep('choose')}
                                className="flex-1 glass py-3 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                {t('back')}
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 btn-gradient text-white py-3 rounded-xl font-semibold"
                            >
                                {t('gotIt')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CreateChildAccountModal;
