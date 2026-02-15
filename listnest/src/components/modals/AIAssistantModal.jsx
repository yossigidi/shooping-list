import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CATEGORIES } from '../../data/categories';

export function AIAssistantModal({ isOpen, onClose, onAddItems, currentItems = [] }) {
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [prompt, setPrompt] = useState('');

  const quickPrompts = [
    { icon: '🍳', text: 'ארוחת בוקר', query: 'ארוחת בוקר' },
    { icon: '🥗', text: 'סלט טרי', query: 'סלט ירקות' },
    { icon: '🍝', text: 'ארוחת פסטה', query: 'פסטה ברוטב עגבניות' },
    { icon: '🎂', text: 'עוגת יום הולדת', query: 'עוגה ביתית' },
    { icon: '🍔', text: 'ארוחת המבורגר', query: 'המבורגר ביתי' },
    { icon: '🥘', text: 'תבשיל חורפי', query: 'תבשיל בשר' },
    { icon: '🥪', text: 'סנדוויצ\'ים', query: 'כריכים' },
    { icon: '🍲', text: 'מרק', query: 'מרק ירקות' }
  ];

  const generateSuggestions = async (query) => {
    setLoading(true);
    setSuggestions([]);

    try {
      // Try API first
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query, currentItems })
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } else {
        // Fallback to local suggestions
        const localSuggestions = getLocalSuggestions(query);
        setSuggestions(localSuggestions);
      }
    } catch (error) {
      console.warn('AI API failed, using local suggestions:', error);
      const localSuggestions = getLocalSuggestions(query);
      setSuggestions(localSuggestions);
    }

    setLoading(false);
  };

  // Local fallback suggestions based on query
  const getLocalSuggestions = (query) => {
    const queryLower = query.toLowerCase();
    const suggestions = [];

    // Recipe-based suggestions
    const recipes = {
      'ארוחת בוקר': ['ביצים', 'לחם', 'חמאה', 'גבינה צהובה', 'עגבניות', 'מלפפונים', 'חלב', 'קפה'],
      'סלט': ['חסה', 'עגבניות', 'מלפפונים', 'בצל סגול', 'שמן זית', 'לימון', 'מלח'],
      'פסטה': ['פסטה', 'רוטב עגבניות', 'שום', 'בצל', 'שמן זית', 'פרמזן', 'בזיליקום'],
      'עוגה': ['קמח', 'סוכר', 'ביצים', 'חמאה', 'שמרים', 'וניל', 'שוקולד'],
      'המבורגר': ['בשר טחון', 'לחמניות המבורגר', 'בצל', 'עגבניות', 'חסה', 'מלפפון חמוץ', 'קטשופ', 'חרדל'],
      'תבשיל': ['בשר', 'תפוחי אדמה', 'גזר', 'בצל', 'שום', 'עגבניות', 'תבלינים'],
      'כריכים': ['לחם', 'גבינה צהובה', 'חזה הודו', 'חסה', 'עגבניות', 'מיונז'],
      'מרק': ['עוף', 'גזר', 'סלרי', 'בצל', 'אטריות', 'מלח', 'פלפל']
    };

    // Find matching recipe
    for (const [recipeName, ingredients] of Object.entries(recipes)) {
      if (queryLower.includes(recipeName) || recipeName.includes(queryLower)) {
        ingredients.forEach(item => {
          // Skip items already in list
          if (!currentItems.some(ci => ci.name.toLowerCase().includes(item.toLowerCase()))) {
            suggestions.push({
              name: item,
              quantity: 1,
              unit: 'pcs',
              reason: recipeName
            });
          }
        });
        break;
      }
    }

    // If no recipe match, suggest from categories
    if (suggestions.length === 0) {
      Object.entries(CATEGORIES).forEach(([key, category]) => {
        const categoryProducts = category.products || [];
        categoryProducts.slice(0, 3).forEach(product => {
          if (product.toLowerCase().includes(queryLower) || queryLower.includes(product.toLowerCase())) {
            if (!currentItems.some(ci => ci.name.toLowerCase() === product.toLowerCase())) {
              suggestions.push({
                name: product,
                quantity: 1,
                unit: category.defaultUnit || 'pcs',
                reason: 'התאמה לחיפוש'
              });
            }
          }
        });
      });
    }

    return suggestions.slice(0, 10);
  };

  const toggleSuggestion = (suggestion) => {
    setSelectedSuggestions(prev => {
      const exists = prev.find(s => s.name === suggestion.name);
      if (exists) {
        return prev.filter(s => s.name !== suggestion.name);
      }
      return [...prev, suggestion];
    });
  };

  const handleAddSelected = () => {
    if (selectedSuggestions.length === 0) return;
    onAddItems(selectedSuggestions);
    onClose();
  };

  const handleQuickPrompt = (query) => {
    setPrompt(query);
    generateSuggestions(query);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      generateSuggestions(prompt.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
         onClick={onClose}>
      <div className={`bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl ${isRTL ? 'rtl' : 'ltr'}`}
           onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              {t('aiAssistant')}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-white/80 text-sm mt-1">{t('aiDescription')}</p>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-200px)]">
          {/* Quick Prompts */}
          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('quickSuggestions')}:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(qp.query)}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-colors flex items-center gap-1">
                  <span>{qp.icon}</span>
                  <span>{qp.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt Input */}
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('whatToCook')}
                className="flex-1 p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-violet-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={!prompt.trim() || loading}
                className="px-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50">
                {loading ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>
            </div>
          </form>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t('thinking')}...</p>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {!loading && suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('suggestedItems')}:</p>
              {suggestions.map((suggestion, idx) => {
                const isSelected = selectedSuggestions.find(s => s.name === suggestion.name);
                return (
                  <button
                    key={idx}
                    onClick={() => toggleSuggestion(suggestion)}
                    className={`w-full p-3 rounded-xl transition-all text-right flex items-center justify-between ${
                      isSelected
                        ? 'bg-violet-100 dark:bg-violet-900/30 border-2 border-violet-500'
                        : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:border-violet-300'
                    }`}>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'bg-violet-500 border-violet-500' : 'border-gray-300 dark:border-gray-500'
                    }`}>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 mr-3">
                      <span className="font-medium text-gray-900 dark:text-white">{suggestion.name}</span>
                      {suggestion.reason && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">({suggestion.reason})</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* No Suggestions */}
          {!loading && suggestions.length === 0 && prompt && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <span className="text-4xl mb-2 block">🤔</span>
              <p>{t('noSuggestions')}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedSuggestions.length > 0 && (
          <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
            <button
              onClick={handleAddSelected}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all">
              {t('addSelected')} ({selectedSuggestions.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIAssistantModal;
