// Product name translations (Hebrew to other languages)
// This is a simplified version - full translations can be added as needed

const PRODUCT_TRANSLATIONS = {
  // Common dairy products
  'חלב 3%': { en: 'Milk 3%', ru: 'Молоко 3%', ar: 'حليب 3%' },
  'חלב 1%': { en: 'Milk 1%', ru: 'Молоко 1%', ar: 'حليب 1%' },
  'גבינה צהובה': { en: 'Yellow Cheese', ru: 'Жёлтый сыр', ar: 'جبنة صفراء' },
  'ביצים': { en: 'Eggs', ru: 'Яйца', ar: 'بيض' },
  'חמאה': { en: 'Butter', ru: 'Масло', ar: 'زبدة' },
  'יוגורט': { en: 'Yogurt', ru: 'Йогурт', ar: 'زبادي' },

  // Common vegetables
  'עגבניות': { en: 'Tomatoes', ru: 'Помидоры', ar: 'طماطم' },
  'מלפפונים': { en: 'Cucumbers', ru: 'Огурцы', ar: 'خيار' },
  'בצל': { en: 'Onion', ru: 'Лук', ar: 'بصل' },
  'שום': { en: 'Garlic', ru: 'Чеснок', ar: 'ثوم' },
  'גזר': { en: 'Carrot', ru: 'Морковь', ar: 'جزر' },
  'תפו״א': { en: 'Potato', ru: 'Картофель', ar: 'بطاطا' },

  // Common fruits
  'תפוחים': { en: 'Apples', ru: 'Яблоки', ar: 'تفاح' },
  'בננות': { en: 'Bananas', ru: 'Бананы', ar: 'موز' },
  'תפוזים': { en: 'Oranges', ru: 'Апельсины', ar: 'برتقال' },

  // Common bread/bakery
  'לחם': { en: 'Bread', ru: 'Хлеб', ar: 'خبز' },
  'חלה': { en: 'Challah', ru: 'Хала', ar: 'خبز الحلة' },
  'פיתות': { en: 'Pita Bread', ru: 'Пита', ar: 'خبز بيتا' },

  // Common pantry items
  'אורז': { en: 'Rice', ru: 'Рис', ar: 'أرز' },
  'פסטה': { en: 'Pasta', ru: 'Паста', ar: 'باستا' },
  'שמן זית': { en: 'Olive Oil', ru: 'Оливковое масло', ar: 'زيت زيتون' },
  'סוכר': { en: 'Sugar', ru: 'Сахар', ar: 'سكر' },
  'מלח': { en: 'Salt', ru: 'Соль', ar: 'ملح' },

  // Common drinks
  'מים': { en: 'Water', ru: 'Вода', ar: 'ماء' },
  'קולה': { en: 'Cola', ru: 'Кола', ar: 'كولا' },
  'מיץ תפוזים': { en: 'Orange Juice', ru: 'Апельсиновый сок', ar: 'عصير برتقال' },
  'קפה': { en: 'Coffee', ru: 'Кофе', ar: 'قهوة' },
  'תה': { en: 'Tea', ru: 'Чай', ar: 'شاي' },
};

/**
 * Get translated product name based on language
 * @param {string} productName - Product name in Hebrew
 * @param {string} language - Target language code (he, en, ru, ar)
 * @returns {string} Translated product name or original if no translation
 */
export function getProductTranslation(productName, language) {
  if (!productName) return '';

  // If Hebrew or no language specified, return original
  if (!language || language === 'he') return productName;

  // Look for exact match
  const translation = PRODUCT_TRANSLATIONS[productName];
  if (translation && translation[language]) {
    return translation[language];
  }

  // Try to find partial match (for product names with quantities/sizes)
  for (const [key, value] of Object.entries(PRODUCT_TRANSLATIONS)) {
    if (productName.includes(key) && value[language]) {
      // Replace the Hebrew part with translation
      return productName.replace(key, value[language]);
    }
  }

  // Return original if no translation found
  return productName;
}

export { PRODUCT_TRANSLATIONS };
