import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { comparePrices, getPriceSearchSuggestions, formatPrice, getChainColor, optimizeBasket } from '../../utils/priceUtils';

export function PriceComparisonModal({ isOpen, onClose, items = [], initialProduct = '' }) {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState(initialProduct);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [priceResults, setPriceResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('single'); // 'single' or 'full'
  const [basketResults, setBasketResults] = useState(null);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const results = getPriceSearchSuggestions(searchTerm, 8);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (initialProduct) {
      setSearchTerm(initialProduct);
      handleSearch(initialProduct);
    }
  }, [initialProduct]);

  const handleSearch = async (productName) => {
    setLoading(true);
    setSelectedProduct(productName);
    setSuggestions([]);

    const results = await comparePrices(productName);
    setPriceResults(results.sort((a, b) => a.price - b.price));
    setLoading(false);
  };

  const handleFullComparison = async () => {
    if (items.length === 0) return;

    setLoading(true);
    setMode('full');

    const results = await optimizeBasket(items);
    setBasketResults(results);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
         onClick={onClose}>
      <div className={`bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl ${isRTL ? 'rtl' : 'ltr'}`}
           onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">💰</span>
              {t('priceComparison')}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setMode('single')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                mode === 'single' ? 'bg-white text-emerald-600' : 'bg-white/20 text-white'
              }`}>
              {t('singleProduct')}
            </button>
            <button
              onClick={() => setMode('full')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                mode === 'full' ? 'bg-white text-emerald-600' : 'bg-white/20 text-white'
              }`}>
              {t('fullList')}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-180px)]">
          {mode === 'single' ? (
            <>
              {/* Search Input */}
              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('searchProduct')}
                  className="w-full p-4 pr-12 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-emerald-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {searchTerm && (
                  <button
                    onClick={() => { setSearchTerm(''); setSuggestions([]); setPriceResults([]); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="mb-4 bg-gray-50 dark:bg-gray-700 rounded-xl p-2 space-y-1">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearch(suggestion.name)}
                      className="w-full p-3 text-right hover:bg-emerald-100 dark:hover:bg-emerald-800 rounded-lg transition-colors flex justify-between items-center">
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {formatPrice(suggestion.price)}
                        {suggestion.type === 'weight' && <span className="text-xs mr-1">/ק"ג</span>}
                      </span>
                      <span className="text-gray-900 dark:text-white">{suggestion.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
                </div>
              )}

              {/* Price Results */}
              {!loading && priceResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                    {selectedProduct}
                  </h3>
                  {priceResults.map((result, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        idx === 0 ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30' : 'border-gray-200 dark:border-gray-600'
                      }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xl font-bold ${idx === 0 ? 'text-emerald-600' : 'text-gray-900 dark:text-white'}`}>
                          {formatPrice(result.price)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className="px-3 py-1 rounded-full text-white text-sm font-medium"
                            style={{ backgroundColor: getChainColor(result.chain) }}>
                            {result.chain}
                          </span>
                          {idx === 0 && (
                            <span className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-full">
                              {t('cheapest')}
                            </span>
                          )}
                        </div>
                      </div>
                      {result.isEstimate && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('estimatedPrice')}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* No Results */}
              {!loading && selectedProduct && priceResults.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <span className="text-4xl mb-2 block">🔍</span>
                  <p>{t('noResults')}</p>
                </div>
              )}
            </>
          ) : (
            /* Full List Comparison */
            <>
              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <span className="text-4xl mb-2 block">📝</span>
                  <p>{t('emptyList')}</p>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleFullComparison}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-xl font-bold mb-4 hover:shadow-lg transition-all disabled:opacity-50">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                        {t('comparing')}
                      </span>
                    ) : (
                      `${t('compareList')} (${items.length} ${t('items')})`
                    )}
                  </button>

                  {basketResults && (
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                        <h4 className="font-bold text-emerald-600 dark:text-emerald-400 mb-2">{t('recommendation')}</h4>
                        <p className="text-gray-900 dark:text-white">{basketResults.recommendation}</p>
                      </div>

                      {basketResults.stores && basketResults.stores.map((store, idx) => (
                        <div key={idx} className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                              {formatPrice(store.total)}
                            </span>
                            <span
                              className="px-3 py-1 rounded-full text-white text-sm font-medium"
                              style={{ backgroundColor: getChainColor(store.name) }}>
                              {store.name}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {store.itemsAvailable} / {items.length} {t('itemsAvailable')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PriceComparisonModal;
