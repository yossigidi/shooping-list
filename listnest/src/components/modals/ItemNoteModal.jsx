import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getProductTranslation } from '../../utils/productTranslations';

function ItemNoteModal({ item, onClose, onSave }) {
    const { t, language } = useLanguage();
    const [note, setNote] = useState(item.note || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        await onSave(note);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass rounded-3xl p-8 max-w-sm w-full shadow-2xl">
                <div className="text-5xl text-center mb-4">📝</div>
                <h2 className="text-xl font-bold text-center text-gradient mb-2">{t('noteForProduct')}</h2>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-4">{getProductTranslation(item.name, language)}</p>

                <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder={t('notePlaceholder')}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:border-indigo-500 resize-none h-24 mb-4"
                    autoFocus
                />

                <div className="flex gap-3">
                    <button onClick={handleSave} disabled={loading} className="flex-1 btn-gradient text-white py-3 rounded-xl font-semibold disabled:opacity-50">
                        {loading ? t('saving') : t('save')}
                    </button>
                    <button onClick={onClose} className="px-6 py-3 glass border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700">
                        {t('cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ItemNoteModal;
