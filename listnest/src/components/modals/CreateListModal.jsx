import React, { useState } from 'react';
import { useFamily } from '../../contexts/FamilyContext';
import { useLanguage } from '../../contexts/LanguageContext';

function CreateListModal({ onClose }) {
    const { createList } = useFamily();
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('📝');
    const [loading, setLoading] = useState(false);

    const icons = ['📝', '🛒', '🎉', '🏠', '💊', '🐾', '👶', '🍽️', '🧹', '✈️'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        await createList(name.trim(), icon);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass rounded-3xl p-8 max-w-sm w-full shadow-2xl">
                <div className="text-5xl text-center mb-4">📋</div>
                <h2 className="text-xl font-bold text-center text-gradient mb-6">{t('newList')}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('listName')}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder={t('listNamePlaceholder')}
                            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:border-indigo-500"
                            autoFocus
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('selectIcon')}</label>
                        <div className="flex flex-wrap gap-2">
                            {icons.map(i => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setIcon(i)}
                                    className={`text-2xl p-2 rounded-lg transition-all ${icon === i ? 'bg-indigo-100 dark:bg-indigo-900/50 scale-110' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    {i}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={loading} className="flex-1 btn-gradient text-white py-3 rounded-xl font-semibold disabled:opacity-50">
                            {loading ? t('creating') : t('createList')}
                        </button>
                        <button type="button" onClick={onClose} className="px-6 py-3 glass border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700">
                            {t('cancel')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateListModal;
