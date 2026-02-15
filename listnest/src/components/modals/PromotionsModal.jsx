import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { fetchPromotions, isPromotionRelevant, getChainColor } from '../../utils/priceUtils';

export function PromotionsModal({ isOpen, onClose, items = [] }) {
  const { t, isRTL } = useLanguage();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'relevant', 'chain'
  const [selectedChain, setSelectedChain] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadPromotions();
    }
  }, [isOpen]);

  const loadPromotions = async () => {
    setLoading(true);
    const promos = await fetchPromotions();
    setPromotions(promos);
    setLoading(false);
  };

  const getFilteredPromotions = () => {
    let filtered = promotions;

    if (filter === 'relevant' && items.length > 0) {
      filtered = promotions.filter(promo => isPromotionRelevant(promo, items));
    } else if (filter === 'chain' && selectedChain) {
      filtered = promotions.filter(promo => promo.chain === selectedChain);
    }

    return filtered;
  };

  const getChains = () => {
    const chains = [...new Set(promotions.map(p => p.chain))];
    return chains;
  };

  const filteredPromotions = getFilteredPromotions();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
         onClick={onClose}>
      <div className={`bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl ${isRTL ? 'rtl' : 'ltr'}`}
           onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">🏷️</span>
              {t('promotions')}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            <button
              onClick={() => { setFilter('all'); setSelectedChain(null); }}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                filter === 'all' ? 'bg-white text-orange-600' : 'bg-white/20 text-white'
              }`}>
              {t('allPromotions')}
            </button>
            {items.length > 0 && (
              <button
                onClick={() => { setFilter('relevant'); setSelectedChain(null); }}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                  filter === 'relevant' ? 'bg-white text-orange-600' : 'bg-white/20 text-white'
                }`}>
                {t('relevantToList')}
              </button>
            )}
          </div>

          {/* Chain Filter */}
          {promotions.length > 0 && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
              {getChains().map(chain => (
                <button
                  key={chain}
                  onClick={() => { setFilter('chain'); setSelectedChain(chain); }}
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedChain === chain ? 'bg-white text-orange-600' : 'bg-white/20 text-white'
                  }`}>
                  {chain}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
          ) : filteredPromotions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <span className="text-5xl mb-4 block">🏷️</span>
              <p className="text-lg font-medium">{t('noPromotions')}</p>
              <p className="text-sm">{t('checkBackLater')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPromotions.map((promo, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {promo.productName}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {promo.description}
                      </p>
                      {promo.validUntil && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {t('validUntil')}: {promo.validUntil}
                        </p>
                      )}
                    </div>
                    <div className="text-left">
                      <span
                        className="px-3 py-1 rounded-full text-white text-xs font-medium"
                        style={{ backgroundColor: getChainColor(promo.chain) }}>
                        {promo.chain}
                      </span>
                      {promo.discount && (
                        <div className="mt-2 text-center">
                          <span className="text-2xl font-bold text-red-500">
                            {promo.discount}%
                          </span>
                          <span className="text-xs text-red-500 block">{t('off')}</span>
                        </div>
                      )}
                      {promo.price && (
                        <div className="mt-2 text-center">
                          <span className="text-xl font-bold text-green-600">
                            ₪{promo.price}
                          </span>
                        </div>
                      )}
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

export default PromotionsModal;
