// Categories and products data for ListNest

export const CATEGORIES = {
  fruits: {
    name: 'פירות וירקות',
    nameHe: 'פירות וירקות',
    icon: '🥬',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=200&fit=crop',
    unit: 'kg',
    unitOptions: ['ק"ג', 'יח\'', 'גרם']
  },
  dairy: {
    name: 'מוצרי חלב',
    nameHe: 'מוצרי חלב',
    icon: '🥛',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&h=200&fit=crop',
    unit: 'יח\'',
    unitOptions: ['יח\'', 'גרם', 'מ"ל', 'ליטר']
  },
  desserts: {
    name: 'קינוחי חלב',
    nameHe: 'קינוחי חלב',
    icon: '🍮',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop',
    unit: 'יח\'',
    unitOptions: ['יח\'', 'גרם']
  },
  meat: {
    name: 'בשר ועוף',
    nameHe: 'בשר ועוף',
    icon: '🍗',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&h=200&fit=crop',
    unit: 'ק"ג',
    unitOptions: ['ק"ג', 'גרם', 'יח\'']
  },
  fish: {
    name: 'דגים',
    nameHe: 'דגים',
    icon: '🐟',
    image: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=200&h=200&fit=crop',
    unit: 'ק"ג',
    unitOptions: ['ק"ג', 'גרם', 'יח\'']
  },
  deli: {
    name: 'נקניקים ומעדנייה',
    nameHe: 'נקניקים ומעדנייה',
    icon: '🥓',
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=200&h=200&fit=crop',
    unit: 'גרם',
    unitOptions: ['גרם', 'ק"ג', 'יח\'']
  },
  salads: {
    name: 'סלטים מוכנים',
    nameHe: 'סלטים מוכנים',
    icon: '🥗',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop',
    unit: 'יח\'',
    unitOptions: ['יח\'', 'גרם']
  },
  bakery: {
    name: 'לחם ומאפים',
    nameHe: 'לחם ומאפים',
    icon: '🍞',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop',
    unit: 'יח\'',
    unitOptions: ['יח\'']
  },
  spreads: {
    name: 'ממרחים',
    nameHe: 'ממרחים',
    icon: '🫙',
    image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=200&h=200&fit=crop',
    unit: 'יח\'',
    unitOptions: ['יח\'', 'גרם']
  },
  baking: {
    name: 'מוצרי אפייה',
    nameHe: 'מוצרי אפייה',
    icon: '🧁',
    image: 'https://images.unsplash.com/photo-1607478900766-efe13248b125?w=200&h=200&fit=crop',
    unit: 'יח\'',
    unitOptions: ['יח\'', 'גרם', 'ק"ג']
  },
  cereals: {
    name: 'דגנים',
    nameHe: 'דגנים',
    icon: '🥣',
    image: 'https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=200&h=200&fit=crop',
    unit: 'יח\'',
    unitOptions: ['יח\'', 'גרם']
  },
  canned: {
    name: 'שימורים ומזון יבש',
    nameHe: 'שימורים ומזון יבש',
    icon: '🥫',
    image: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=200&h=200&fit=crop',
    unit: 'יח\'',
    unitOptions: ['יח\'', 'גרם']
  },
  spices: {
    name: 'תבלינים ובישול',
    nameHe: 'תבלינים ובישול',
    icon: '🧂',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200&h=200&fit=crop',
    unit: 'גרם',
    unitOptions: ['גרם', 'יח\'']
  },
  coffee: {
    name: 'קפה ותה',
    nameHe: 'קפה ותה',
    icon: '☕',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&h=200&fit=crop',
    unit: 'יח\'',
    unitOptions: ['יח\'', 'גרם']
  },
  drinks: {
    name: 'משקאות',
    nameHe: 'משקאות',
    icon: '🥤',
    image: 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=200&h=200&fit=crop',
    unit: 'יח\'',
    unitOptions: ['יח\'', 'ליטר', 'מ"ל']
  },
  wine: {
    name: 'יין ואלכוהול',
    nameHe: 'יין ואלכוהול',
    icon: '🍷',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200&h=200&fit=crop',
    unit: 'יח\'',
    unitOptions: ['יח\'', 'מ"ל']
  },
  snacks: {
    name: 'חטיפים וממתקים',
    nameHe: 'חטיפים וממתקים',
    icon: '🍿',
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=200&h=200&fit=crop',
    unit: 'יח\'',
    unitOptions: ['יח\'', 'גרם']
  },
  frozen: {
    name: 'קפואים',
    nameHe: 'קפואים',
    icon: '🧊',
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=200&h=200&fit=crop',
    unit: 'יח\'',
    unitOptions: ['יח\'', 'ק"ג', 'גרם']
  },
  health: {
    name: 'דיאטה וחלבון',
    nameHe: 'דיאטה וחלבון',
    icon: '💪',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200&h=200&fit=crop',
    unit: 'יח\'',
    unitOptions: ['יח\'', 'גרם']
  },
  glutenFree: {
    name: 'ללא גלוטן',
    nameHe: 'ללא גלוטן',
    icon: '🌾',
    image: 'https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=200&h=200&fit=crop',
    unit: 'יח\'',
    unitOptions: ['יח\'', 'גרם']
  },
  hygiene: {
    name: 'היגיינה ורחצה',
    nameHe: 'היגיינה ורחצה',
    icon: '🧴',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop',
    unit: 'יח\'',
    unitOptions: ['יח\'']
  },
  cleaning: {
    name: 'ניקיון',
    nameHe: 'ניקיון',
    icon: '🧹',
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=200&h=200&fit=crop',
    unit: 'יח\'',
    unitOptions: ['יח\'', 'ליטר']
  },
  candles: {
    name: 'נרות',
    nameHe: 'נרות',
    icon: '🕯️',
    image: 'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=200&h=200&fit=crop',
    unit: 'יח\'',
    unitOptions: ['יח\'']
  },
  baby: {
    name: 'תינוקות וילדים',
    nameHe: 'תינוקות וילדים',
    icon: '👶',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&h=200&fit=crop',
    unit: 'יח\'',
    unitOptions: ['יח\'']
  },
  pets: {
    name: 'בעלי חיים',
    nameHe: 'בעלי חיים',
    icon: '🐾',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop',
    unit: 'יח\'',
    unitOptions: ['יח\'', 'ק"ג']
  }
};

// Category key to translation key mapping
export const CATEGORY_TO_TRANSLATION = {
  fruits: 'fruitsVeg',
  dairy: 'dairyProducts',
  desserts: 'dairyDesserts',
  meat: 'meat',
  fish: 'fish',
  deli: 'deli',
  salads: 'readySalads',
  bakery: 'breadBakery',
  spreads: 'spreads',
  baking: 'bakingProducts',
  cereals: 'cereals',
  canned: 'cannedDry',
  spices: 'spices',
  coffee: 'coffeeTea',
  drinks: 'drinks',
  wine: 'wineAlcohol',
  snacks: 'snacks',
  frozen: 'frozen',
  health: 'dietProtein',
  glutenFree: 'glutenFree',
  hygiene: 'hygiene',
  cleaning: 'cleaning',
  candles: 'candlesOil',
  baby: 'babyKids',
  pets: 'pets'
};

// Products by category - Hebrew names
export const PRODUCTS = {
  dairy: [
    { name: 'חלב 3%', keywords: ['חלב', 'milk'] },
    { name: 'חלב 1%', keywords: ['חלב דל', 'low fat'] },
    { name: 'חלב סויה', keywords: ['סויה', 'soy'] },
    { name: 'חלב שקדים', keywords: ['שקדים', 'almond'] },
    { name: 'יוגורט', keywords: ['יוגורט', 'yogurt'] },
    { name: 'יוגורט יווני', keywords: ['יווני', 'greek'] },
    { name: 'קוטג׳ 5%', keywords: ['קוטג', 'cottage'] },
    { name: 'קוטג׳ 3%', keywords: ['קוטג דל', 'cottage'] },
    { name: 'גבינה לבנה 5%', keywords: ['גבינה לבנה', 'white cheese'] },
    { name: 'גבינה לבנה 9%', keywords: ['גבינה שמנה'] },
    { name: 'גבינה צהובה עמק', keywords: ['עמק', 'צהובה'] },
    { name: 'גבינה צהובה גלבוע', keywords: ['גלבוע'] },
    { name: 'מוצרלה', keywords: ['מוצרלה', 'mozzarella'] },
    { name: 'פרמזן', keywords: ['פרמזן', 'parmesan'] },
    { name: 'ביצים L 12 יח׳', keywords: ['ביצים', 'eggs'] },
    { name: 'ביצים XL 12 יח׳', keywords: ['ביצים גדולות'] },
    { name: 'חמאה', keywords: ['חמאה', 'butter'] },
    { name: 'שמנת מתוקה', keywords: ['שמנת', 'cream'] },
    { name: 'שמנת חמוצה', keywords: ['שמנת חמוצה', 'sour cream'] },
    { name: 'לבן', keywords: ['לבן', 'leben'] },
    { name: 'גבינת שמנת', keywords: ['פילדלפיה', 'cream cheese'] },
    { name: 'גבינה בולגרית', keywords: ['בולגרית', 'bulgarian'] },
    { name: 'צפתית', keywords: ['צפתית', 'tzfatit'] }
  ],
  fruits: [
    { name: 'עגבניות', keywords: ['עגבניה', 'tomato'] },
    { name: 'עגבניות שרי', keywords: ['שרי', 'cherry tomato'] },
    { name: 'מלפפונים', keywords: ['מלפפון', 'cucumber'] },
    { name: 'בצל', keywords: ['בצל', 'onion'] },
    { name: 'בצל סגול', keywords: ['בצל אדום'] },
    { name: 'שום', keywords: ['שום', 'garlic'] },
    { name: 'פלפל אדום', keywords: ['פלפל', 'pepper'] },
    { name: 'פלפל ירוק', keywords: ['פלפל ירוק'] },
    { name: 'פלפל צהוב', keywords: ['פלפל צהוב'] },
    { name: 'חסה', keywords: ['חסה', 'lettuce'] },
    { name: 'כרוב', keywords: ['כרוב', 'cabbage'] },
    { name: 'גזר', keywords: ['גזר', 'carrot'] },
    { name: 'תפו״א אדום', keywords: ['תפוח אדמה', 'potato'] },
    { name: 'בטטה', keywords: ['בטטה', 'sweet potato'] },
    { name: 'קישוא', keywords: ['קישוא', 'zucchini'] },
    { name: 'חציל', keywords: ['חציל', 'eggplant'] },
    { name: 'ברוקולי', keywords: ['ברוקולי', 'broccoli'] },
    { name: 'כרובית', keywords: ['כרובית', 'cauliflower'] },
    { name: 'תרד', keywords: ['תרד', 'spinach'] },
    { name: 'פטרוזיליה', keywords: ['פטרוזיליה', 'parsley'] },
    { name: 'כוסברה', keywords: ['כוסברה', 'cilantro'] },
    { name: 'נענע', keywords: ['נענע', 'mint'] },
    { name: 'בננות', keywords: ['בננה', 'banana'] },
    { name: 'תפוחים אדומים', keywords: ['תפוח', 'apple'] },
    { name: 'תפוחים ירוקים', keywords: ['גרני סמית'] },
    { name: 'תפוזים', keywords: ['תפוז', 'orange'] },
    { name: 'לימון', keywords: ['לימון', 'lemon'] },
    { name: 'אבוקדו', keywords: ['אבוקדו', 'avocado'] },
    { name: 'מנגו', keywords: ['מנגו', 'mango'] },
    { name: 'ענבים ירוקים', keywords: ['ענבים', 'grapes'] },
    { name: 'תותים', keywords: ['תות', 'strawberry'] },
    { name: 'אבטיח', keywords: ['אבטיח', 'watermelon'] }
  ],
  bakery: [
    { name: 'לחם', keywords: ['לחם', 'bread'] },
    { name: 'לחם מלא', keywords: ['לחם מלא', 'whole wheat'] },
    { name: 'לחם שיפון', keywords: ['שיפון', 'rye'] },
    { name: 'חלה', keywords: ['חלה', 'challah'] },
    { name: 'פיתות', keywords: ['פיתה', 'pita'] },
    { name: 'פיתות מלאות', keywords: ['פיתה מלאה'] },
    { name: 'לחמניות', keywords: ['לחמניה', 'roll'] },
    { name: 'לחמניות המבורגר', keywords: ['המבורגר', 'burger bun'] },
    { name: 'בגט', keywords: ['בגט', 'baguette'] },
    { name: 'טורטייה', keywords: ['טורטיה', 'tortilla'] },
    { name: 'לאפה', keywords: ['לאפה', 'laffa'] },
    { name: 'קרואסון', keywords: ['קרואסון', 'croissant'] },
    { name: 'בורקס גבינה', keywords: ['בורקס', 'bourekas'] },
    { name: 'בורקס תפו״א', keywords: ['בורקס תפוח אדמה'] },
    { name: 'עוגיות', keywords: ['עוגיה', 'cookie'] },
    { name: 'עוגיות שוקולד צ\'יפס', keywords: ['שוקולד צ\'יפס'] },
    { name: 'מצות', keywords: ['מצה', 'matza'] },
    { name: 'קרקרים', keywords: ['קרקר', 'cracker'] }
  ],
  meat: [
    { name: 'עוף שלם טרי', keywords: ['עוף', 'chicken'] },
    { name: 'חזה עוף טרי', keywords: ['חזה עוף', 'chicken breast'] },
    { name: 'חזה עוף קפוא', keywords: ['חזה קפוא'] },
    { name: 'כרעיים עוף', keywords: ['כרעיים', 'drumsticks'] },
    { name: 'שוקיים עוף', keywords: ['שוקיים', 'thighs'] },
    { name: 'כנפיים עוף', keywords: ['כנפיים', 'wings'] },
    { name: 'עוף טחון', keywords: ['עוף טחון', 'ground chicken'] },
    { name: 'פרגית', keywords: ['פרגית'] },
    { name: 'חזה הודו', keywords: ['הודו', 'turkey'] },
    { name: 'הודו טחון', keywords: ['הודו טחון', 'ground turkey'] },
    { name: 'בשר טחון טרי', keywords: ['בשר טחון', 'ground beef'] },
    { name: 'אנטריקוט', keywords: ['אנטריקוט', 'ribeye'] },
    { name: 'סינטה', keywords: ['סינטה', 'sirloin'] },
    { name: 'צלעות בקר', keywords: ['צלעות', 'ribs'] },
    { name: 'גולש', keywords: ['גולש', 'stew'] },
    { name: 'שניצל עוף', keywords: ['שניצל', 'schnitzel'] },
    { name: 'המבורגר', keywords: ['המבורגר', 'burger'] },
    { name: 'קבב', keywords: ['קבב', 'kebab'] },
    { name: 'נקניקיות עוף', keywords: ['נקניקיות', 'sausage'] }
  ],
  fish: [
    { name: 'סלמון טרי', keywords: ['סלמון', 'salmon'] },
    { name: 'פילה סלמון', keywords: ['פילה סלמון'] },
    { name: 'סלמון מעושן', keywords: ['סלמון מעושן', 'smoked salmon'] },
    { name: 'פילה אמנון', keywords: ['אמנון', 'tilapia'] },
    { name: 'דניס', keywords: ['דניס', 'sea bream'] },
    { name: 'לברק', keywords: ['לברק', 'sea bass'] },
    { name: 'פילה בקלה', keywords: ['בקלה', 'cod'] },
    { name: 'טונה', keywords: ['טונה', 'tuna'] },
    { name: 'טונה בשמן', keywords: ['טונה בשמן'] },
    { name: 'סרדינים', keywords: ['סרדין', 'sardines'] }
  ],
  deli: [
    { name: 'פסטרמה', keywords: ['פסטרמה', 'pastrami'] },
    { name: 'סלמי', keywords: ['סלמי', 'salami'] },
    { name: 'חזה הודו מעושן', keywords: ['הודו מעושן', 'smoked turkey'] },
    { name: 'רוסטביף', keywords: ['רוסטביף', 'roast beef'] },
    { name: 'נקניק', keywords: ['נקניק'] },
    { name: 'מורטדלה', keywords: ['מורטדלה', 'mortadella'] }
  ],
  spreads: [
    { name: 'נוטלה', keywords: ['נוטלה', 'nutella'] },
    { name: 'ממרח שוקולד', keywords: ['ממרח שוקולד', 'chocolate spread'] },
    { name: 'חמאת בוטנים', keywords: ['חמאת בוטנים', 'peanut butter'] },
    { name: 'טחינה', keywords: ['טחינה', 'tahini'] },
    { name: 'חלווה', keywords: ['חלוה', 'halva'] },
    { name: 'ריבה תות', keywords: ['ריבה', 'jam'] },
    { name: 'דבש', keywords: ['דבש', 'honey'] },
    { name: 'סילאן', keywords: ['סילאן', 'date syrup'] },
    { name: 'חומוס מוכן', keywords: ['חומוס', 'hummus'] }
  ],
  drinks: [
    { name: 'קולה 1.5 ליטר', keywords: ['קולה', 'cola'] },
    { name: 'קולה זירו 1.5 ליטר', keywords: ['קולה זירו', 'coke zero'] },
    { name: 'ספרייט 1.5 ליטר', keywords: ['ספרייט', 'sprite'] },
    { name: 'פאנטה 1.5 ליטר', keywords: ['פאנטה', 'fanta'] },
    { name: 'מיץ תפוזים 1 ליטר', keywords: ['מיץ תפוזים', 'orange juice'] },
    { name: 'מיץ תפוחים 1 ליטר', keywords: ['מיץ תפוחים', 'apple juice'] },
    { name: 'מים מינרליים 1.5 ליטר', keywords: ['מים', 'water'] },
    { name: 'סודה 1.5 ליטר', keywords: ['סודה', 'soda'] },
    { name: 'XL פחית', keywords: ['אקסל', 'xl', 'energy'] },
    { name: 'רד בול', keywords: ['רד בול', 'red bull'] }
  ],
  snacks: [
    { name: 'במבה', keywords: ['במבה', 'bamba'] },
    { name: 'במבה נוגט', keywords: ['במבה נוגט'] },
    { name: 'ביסלי', keywords: ['ביסלי', 'bisli'] },
    { name: 'תפוצ\'יפס', keywords: ['תפוצ\'יפס', 'chips'] },
    { name: 'דוריטוס', keywords: ['דוריטוס', 'doritos'] },
    { name: 'פרינגלס', keywords: ['פרינגלס', 'pringles'] },
    { name: 'בייגלה', keywords: ['בייגלה', 'pretzel'] },
    { name: 'שוקולד פרה', keywords: ['פרה', 'para'] },
    { name: 'שוקולד מריר', keywords: ['שוקולד מריר', 'dark chocolate'] },
    { name: 'סניקרס', keywords: ['סניקרס', 'snickers'] },
    { name: 'קיטקט', keywords: ['קיטקט', 'kitkat'] },
    { name: 'קינדר בואנו', keywords: ['קינדר', 'kinder'] },
    { name: 'עוגיות אוראו', keywords: ['אוראו', 'oreo'] }
  ],
  coffee: [
    { name: 'קפה נמס', keywords: ['נמס', 'instant coffee'] },
    { name: 'קפה טורקי', keywords: ['טורקי', 'turkish coffee'] },
    { name: 'קפה טחון', keywords: ['קפה טחון', 'ground coffee'] },
    { name: 'קפסולות נספרסו', keywords: ['נספרסו', 'nespresso'] },
    { name: 'תה שחור', keywords: ['תה', 'tea'] },
    { name: 'תה ירוק', keywords: ['תה ירוק', 'green tea'] },
    { name: 'תה צמחים', keywords: ['תה צמחים', 'herbal tea'] },
    { name: 'תה עם נענע', keywords: ['תה נענע'] }
  ],
  cereals: [
    { name: 'קורנפלקס', keywords: ['קורנפלקס', 'cornflakes'] },
    { name: 'גרנולה', keywords: ['גרנולה', 'granola'] },
    { name: 'מוזלי', keywords: ['מוזלי', 'muesli'] },
    { name: 'שיבולת שועל', keywords: ['שיבולת שועל', 'oatmeal'] }
  ],
  canned: [
    { name: 'עגבניות מרוסקות', keywords: ['עגבניות מרוסקות', 'crushed tomatoes'] },
    { name: 'רסק עגבניות', keywords: ['רסק', 'tomato paste'] },
    { name: 'רוטב עגבניות', keywords: ['רוטב', 'tomato sauce'] },
    { name: 'תירס', keywords: ['תירס', 'corn'] },
    { name: 'אפונה', keywords: ['אפונה', 'peas'] },
    { name: 'שעועית', keywords: ['שעועית', 'beans'] },
    { name: 'חומוס', keywords: ['חומוס', 'chickpeas'] },
    { name: 'עדשים', keywords: ['עדשים', 'lentils'] },
    { name: 'אורז', keywords: ['אורז', 'rice'] },
    { name: 'אורז בסמטי', keywords: ['בסמטי', 'basmati'] },
    { name: 'פסטה', keywords: ['פסטה', 'pasta'] },
    { name: 'פסטה ספגטי', keywords: ['ספגטי', 'spaghetti'] },
    { name: 'שמן זית', keywords: ['שמן זית', 'olive oil'] },
    { name: 'שמן קנולה', keywords: ['שמן קנולה', 'canola oil'] }
  ],
  spices: [
    { name: 'מלח', keywords: ['מלח', 'salt'] },
    { name: 'פלפל שחור', keywords: ['פלפל שחור', 'black pepper'] },
    { name: 'פפריקה', keywords: ['פפריקה', 'paprika'] },
    { name: 'כמון', keywords: ['כמון', 'cumin'] },
    { name: 'כורכום', keywords: ['כורכום', 'turmeric'] },
    { name: 'קינמון', keywords: ['קינמון', 'cinnamon'] },
    { name: 'אבקת שום', keywords: ['אבקת שום', 'garlic powder'] },
    { name: 'אבקת בצל', keywords: ['אבקת בצל', 'onion powder'] }
  ],
  frozen: [
    { name: 'פיצה קפואה', keywords: ['פיצה', 'pizza'] },
    { name: 'ירקות קפואים', keywords: ['ירקות קפואים', 'frozen vegetables'] },
    { name: 'גלידה', keywords: ['גלידה', 'ice cream'] },
    { name: 'גלידה וניל', keywords: ['וניל', 'vanilla'] },
    { name: 'גלידה שוקולד', keywords: ['שוקולד', 'chocolate'] },
    { name: 'שניצל קפוא', keywords: ['שניצל קפוא'] },
    { name: 'נאגטס', keywords: ['נאגטס', 'nuggets'] },
    { name: 'בצק עלים', keywords: ['בצק עלים', 'puff pastry'] },
    { name: 'בצק פילו', keywords: ['פילו', 'phyllo'] }
  ],
  hygiene: [
    { name: 'שמפו', keywords: ['שמפו', 'shampoo'] },
    { name: 'מרכך שיער', keywords: ['מרכך', 'conditioner'] },
    { name: 'סבון גוף', keywords: ['סבון', 'body wash'] },
    { name: 'משחת שיניים', keywords: ['משחת שיניים', 'toothpaste'] },
    { name: 'מברשת שיניים', keywords: ['מברשת שיניים', 'toothbrush'] },
    { name: 'דאודורנט', keywords: ['דאודורנט', 'deodorant'] },
    { name: 'קרם גוף', keywords: ['קרם', 'lotion'] }
  ],
  cleaning: [
    { name: 'נייר טואלט', keywords: ['נייר טואלט', 'toilet paper'] },
    { name: 'מגבות נייר', keywords: ['מגבות נייר', 'paper towels'] },
    { name: 'סבון כלים', keywords: ['סבון כלים', 'dish soap'] },
    { name: 'טבליות למדיח', keywords: ['טבליות', 'dishwasher tablets'] },
    { name: 'אבקת כביסה', keywords: ['אבקת כביסה', 'laundry detergent'] },
    { name: 'מרכך כביסה', keywords: ['מרכך', 'fabric softener'] },
    { name: 'אקונומיקה', keywords: ['אקונומיקה', 'bleach'] },
    { name: 'שקיות אשפה', keywords: ['שקיות אשפה', 'trash bags'] },
    { name: 'ספוגים', keywords: ['ספוג', 'sponge'] }
  ],
  baby: [
    { name: 'חיתולים מידה 3', keywords: ['חיתולים', 'diapers'] },
    { name: 'חיתולים מידה 4', keywords: ['חיתולים'] },
    { name: 'חיתולים מידה 5', keywords: ['חיתולים'] },
    { name: 'מגבונים לתינוקות', keywords: ['מגבונים', 'wipes'] },
    { name: 'שמפו לתינוקות', keywords: ['שמפו תינוקות', 'baby shampoo'] },
    { name: 'מזון תינוקות', keywords: ['מזון תינוקות', 'baby food'] },
    { name: 'מטרנה', keywords: ['מטרנה', 'formula'] }
  ],
  pets: [
    { name: 'אוכל לכלבים', keywords: ['אוכל כלבים', 'dog food'] },
    { name: 'אוכל לחתולים', keywords: ['אוכל חתולים', 'cat food'] },
    { name: 'חול לחתולים', keywords: ['חול', 'cat litter'] },
    { name: 'חטיפים לכלבים', keywords: ['חטיפים', 'dog treats'] }
  ],
  wine: [
    { name: 'יין אדום', keywords: ['יין אדום', 'red wine'] },
    { name: 'יין לבן', keywords: ['יין לבן', 'white wine'] },
    { name: 'בירה', keywords: ['בירה', 'beer'] },
    { name: 'וודקה', keywords: ['וודקה', 'vodka'] },
    { name: 'וויסקי', keywords: ['וויסקי', 'whiskey'] }
  ],
  candles: [
    { name: 'נרות שבת', keywords: ['נרות שבת', 'shabbat candles'] },
    { name: 'נרות חנוכה', keywords: ['נרות חנוכה', 'hanukkah candles'] },
    { name: 'נר נשמה', keywords: ['נר נשמה', 'memorial candle'] },
    { name: 'גפרורים', keywords: ['גפרורים', 'matches'] },
    { name: 'מצית', keywords: ['מצית', 'lighter'] }
  ],
  glutenFree: [
    { name: 'לחם ללא גלוטן', keywords: ['לחם ללא גלוטן', 'gluten free bread'] },
    { name: 'פסטה ללא גלוטן', keywords: ['פסטה ללא גלוטן', 'gluten free pasta'] },
    { name: 'קמח ללא גלוטן', keywords: ['קמח ללא גלוטן', 'gluten free flour'] }
  ],
  health: [
    { name: 'אבקת חלבון', keywords: ['אבקת חלבון', 'protein powder'] },
    { name: 'חטיפי חלבון', keywords: ['חטיף חלבון', 'protein bar'] },
    { name: 'ויטמינים', keywords: ['ויטמין', 'vitamins'] }
  ],
  salads: [
    { name: 'חומוס מוכן', keywords: ['חומוס', 'hummus'] },
    { name: 'טחינה מוכנה', keywords: ['טחינה', 'tahini salad'] },
    { name: 'סלט חצילים', keywords: ['חצילים', 'eggplant salad'] },
    { name: 'קולסלאו', keywords: ['קולסלאו', 'coleslaw'] }
  ],
  desserts: [
    { name: 'מילקי', keywords: ['מילקי', 'milky'] },
    { name: 'מילקי שוקולד', keywords: ['מילקי שוקולד'] },
    { name: 'גמדים', keywords: ['גמדים'] },
    { name: 'דנונה', keywords: ['דנונה', 'danone'] },
    { name: 'מעדן וניל', keywords: ['מעדן', 'pudding'] },
    { name: 'פודינג', keywords: ['פודינג', 'pudding'] },
    { name: 'ג\'לי', keywords: ['ג\'לי', 'jello'] }
  ],
  baking: [
    { name: 'קמח', keywords: ['קמח', 'flour'] },
    { name: 'קמח מלא', keywords: ['קמח מלא', 'whole wheat flour'] },
    { name: 'סוכר', keywords: ['סוכר', 'sugar'] },
    { name: 'סוכר חום', keywords: ['סוכר חום', 'brown sugar'] },
    { name: 'אבקת אפייה', keywords: ['אבקת אפייה', 'baking powder'] },
    { name: 'שמרים', keywords: ['שמרים', 'yeast'] },
    { name: 'וניל', keywords: ['וניל', 'vanilla'] },
    { name: 'קקאו', keywords: ['קקאו', 'cocoa'] },
    { name: 'שוקולד צ\'יפס', keywords: ['שוקולד צ\'יפס', 'chocolate chips'] }
  ]
};

export default CATEGORIES;
