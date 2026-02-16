import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

function ImportWhatsAppModal({ isOpen, onClose, onImport }) {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const [parsedItems, setParsedItems] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // Parse WhatsApp text into shopping list items
  const parseWhatsAppText = (inputText) => {
    if (!inputText.trim()) {
      setParsedItems([]);
      setShowPreview(false);
      return;
    }

    const lines = inputText.split('\n').filter(line => line.trim());
    const items = [];

    for (const line of lines) {
      // Skip common headers/footers
      if (line.includes('רשימת קניות') ||
          line.includes('Shopping List') ||
          line.startsWith('---') ||
          line.startsWith('===')) {
        continue;
      }

      // Clean up the line
      let cleanLine = line
        .replace(/^[\s\-\*\•\✓\✔\☐\☑\→\➤\▸]+/, '') // Remove bullets/checkmarks
        .replace(/^\d+[\.\)]\s*/, '') // Remove numbered list prefix
        .replace(/\s*[\(\[].*?[\)\]]$/, '') // Remove trailing parentheses content
        .trim();

      if (!cleanLine) continue;

      // Try to extract quantity
      let quantity = 1;
      let unit = 'יח\'';
      let name = cleanLine;

      // Pattern: "2 חלב" or "חלב 2" or "חלב x2" or "2x חלב"
      const qtyMatch = cleanLine.match(/^(\d+(?:\.\d+)?)\s*[xX]?\s*(.+)/) ||
                       cleanLine.match(/(.+?)\s*[xX]?\s*(\d+(?:\.\d+)?)$/);

      if (qtyMatch) {
        const num = parseFloat(qtyMatch[1]);
        if (!isNaN(num) && num > 0 && num < 100) {
          quantity = num;
          name = qtyMatch[2]?.trim() || qtyMatch[1]?.trim();
        }
      }

      // Extract unit if present
      const unitPatterns = [
        { pattern: /(\d+)\s*(ק"ג|קילו|kg)/i, unit: 'ק"ג' },
        { pattern: /(\d+)\s*(גרם|גר\'|g)/i, unit: 'גרם' },
        { pattern: /(\d+)\s*(ליטר|ל\'|l)/i, unit: 'ליטר' },
        { pattern: /(\d+)\s*(מ"ל|ml)/i, unit: 'מ"ל' },
        { pattern: /(\d+)\s*(יחידות|יח\'|pcs)/i, unit: 'יח\'' },
        { pattern: /(\d+)\s*(חבילות|חבי\')/i, unit: 'חבי\'' },
      ];

      for (const { pattern, unit: extractedUnit } of unitPatterns) {
        const match = cleanLine.match(pattern);
        if (match) {
          quantity = parseFloat(match[1]);
          unit = extractedUnit;
          name = cleanLine.replace(pattern, '').trim();
          break;
        }
      }

      // Clean up the name
      name = name.replace(/[,;:]+$/, '').trim();

      if (name && name.length > 1 && name.length < 50) {
        items.push({ name, quantity, unit });
      }
    }

    setParsedItems(items);
    setShowPreview(items.length > 0);
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    parseWhatsAppText(newText);
  };

  const handleImport = () => {
    if (parsedItems.length > 0) {
      onImport(parsedItems);
      setText('');
      setParsedItems([]);
      setShowPreview(false);
      onClose();
    }
  };

  const removeItem = (index) => {
    setParsedItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItemName = (index, newName) => {
    setParsedItems(prev => prev.map((item, i) =>
      i === index ? { ...item, name: newName } : item
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-between flex-shrink-0">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <span className="text-2xl">📱</span>
            {t('importFromWhatsApp') || 'ייבוא מ-WhatsApp'}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Instructions */}
          <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-3 mb-4">
            <p className="text-sm text-green-700 dark:text-green-300">
              {t('whatsappImportInstructions') || 'העתק רשימת קניות מ-WhatsApp והדבק כאן. נזהה אוטומטית את המוצרים.'}
            </p>
          </div>

          {/* Text Input */}
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder={t('pasteWhatsappText') || 'הדבק כאן טקסט מ-WhatsApp...'}
            className="w-full h-32 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-green-500 transition-all resize-none"
            dir="auto"
          />

          {/* Preview */}
          {showPreview && parsedItems.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <span>📋</span>
                {t('foundItems') || 'מוצרים שנמצאו'} ({parsedItems.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {parsedItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItemName(index, e.target.value)}
                      className="flex-1 px-2 py-1 bg-transparent border-b border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white focus:border-green-500 outline-none"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {item.quantity} {item.unit}
                    </span>
                    <button
                      onClick={() => removeItem(index)}
                      className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No items found */}
          {text.trim() && parsedItems.length === 0 && (
            <div className="mt-4 text-center py-4">
              <p className="text-gray-500 dark:text-gray-400">
                {t('noItemsFound') || 'לא נמצאו מוצרים. נסה להדביק רשימה אחרת.'}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            {t('cancel') || 'ביטול'}
          </button>
          <button
            onClick={handleImport}
            disabled={parsedItems.length === 0}
            className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-green-600 transition-all flex items-center justify-center gap-2"
          >
            <span>📥</span>
            {t('import') || 'ייבא'} {parsedItems.length > 0 && `(${parsedItems.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportWhatsAppModal;
