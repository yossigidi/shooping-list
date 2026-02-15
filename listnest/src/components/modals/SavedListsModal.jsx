import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const SAVED_LISTS_KEY = 'listnest_saved_lists';
const TEMPLATES_KEY = 'listnest_templates';

export function SavedListsModal({ isOpen, onClose, onLoadList, currentItems = [], mode = 'saved' }) {
  const { t, isRTL } = useLanguage();
  const [savedLists, setSavedLists] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [activeTab, setActiveTab] = useState(mode);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [listName, setListName] = useState('');

  // Load saved lists and templates from localStorage
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(SAVED_LISTS_KEY);
      const temps = localStorage.getItem(TEMPLATES_KEY);
      setSavedLists(saved ? JSON.parse(saved) : []);
      setTemplates(temps ? JSON.parse(temps) : []);
    }
  }, [isOpen]);

  const saveCurrentList = () => {
    if (!listName.trim() || currentItems.length === 0) return;

    const newList = {
      id: Date.now().toString(),
      name: listName.trim(),
      items: currentItems,
      savedAt: new Date().toISOString()
    };

    if (activeTab === 'saved') {
      const updated = [...savedLists, newList];
      localStorage.setItem(SAVED_LISTS_KEY, JSON.stringify(updated));
      setSavedLists(updated);
    } else {
      const updated = [...templates, newList];
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
      setTemplates(updated);
    }

    setListName('');
    setShowSaveDialog(false);
  };

  const deleteList = (id) => {
    if (activeTab === 'saved') {
      const updated = savedLists.filter(list => list.id !== id);
      localStorage.setItem(SAVED_LISTS_KEY, JSON.stringify(updated));
      setSavedLists(updated);
    } else {
      const updated = templates.filter(list => list.id !== id);
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
      setTemplates(updated);
    }
  };

  const loadList = (list) => {
    onLoadList(list.items);
    onClose();
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentList = activeTab === 'saved' ? savedLists : templates;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
         onClick={onClose}>
      <div className={`bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl ${isRTL ? 'rtl' : 'ltr'}`}
           onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">{activeTab === 'saved' ? '📋' : '📑'}</span>
              {activeTab === 'saved' ? t('savedLists') : t('templates')}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'saved' ? 'bg-white text-amber-600' : 'bg-white/20 text-white'
              }`}>
              {t('savedLists')}
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'templates' ? 'bg-white text-amber-600' : 'bg-white/20 text-white'
              }`}>
              {t('templates')}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-200px)]">
          {/* Save Current List Button */}
          {currentItems.length > 0 && !showSaveDialog && (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="w-full mb-4 p-4 border-2 border-dashed border-amber-400 dark:border-amber-600 rounded-xl text-amber-600 dark:text-amber-400 font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {activeTab === 'saved' ? t('saveCurrentList') : t('saveAsTemplate')}
            </button>
          )}

          {/* Save Dialog */}
          {showSaveDialog && (
            <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder={t('listName')}
                className="w-full p-3 border-2 border-amber-300 dark:border-amber-600 rounded-xl focus:border-amber-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  {t('cancel')}
                </button>
                <button
                  onClick={saveCurrentList}
                  disabled={!listName.trim()}
                  className="flex-1 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50">
                  {t('save')}
                </button>
              </div>
            </div>
          )}

          {/* Lists */}
          {currentList.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <span className="text-5xl mb-4 block">{activeTab === 'saved' ? '📋' : '📑'}</span>
              <p className="text-lg font-medium">
                {activeTab === 'saved' ? t('noSavedLists') : t('noTemplates')}
              </p>
              <p className="text-sm">{t('saveListHint')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentList.map((list) => (
                <div
                  key={list.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1" onClick={() => loadList(list)}>
                      <h4 className="font-bold text-gray-900 dark:text-white cursor-pointer hover:text-amber-600 dark:hover:text-amber-400">
                        {list.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {list.items.length} {t('items')} • {formatDate(list.savedAt)}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {list.items.slice(0, 5).map((item, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full text-xs text-gray-600 dark:text-gray-300">
                            {item.name}
                          </span>
                        ))}
                        {list.items.length > 5 && (
                          <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full text-xs text-gray-600 dark:text-gray-300">
                            +{list.items.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mr-3">
                      <button
                        onClick={() => loadList(list)}
                        className="p-2 text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                        title={t('load')}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteList(list.id)}
                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title={t('delete')}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SavedListsModal;
