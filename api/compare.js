// ListNest Price Comparison API - Vercel Serverless
// Uses estimated prices + links to real supermarket sites
// Prices varied realistically - each chain wins on different products

// Comprehensive Israeli product price database (estimated averages in NIS)
// Price pattern: Each chain is cheapest for different categories
// רמי לוי - זול בבשר וירקות
// שופרסל - זול במותג פרטי ומוצרי חלב
// חצי חינם - זול בחטיפים ומשקאות
// ויקטורי - זול בפירות ומאפים
// יינות ביתן - זול ביינות ואלכוהול

const PRICE_DATABASE = {
    // ===== חלב ומוצרי חלב (שופרסל זול) =====
    'חלב': { shufersal: 6.40, rami_levy: 6.70, victory: 6.90, ybitan: 7.20, hatzi_hinam: 6.60 },
    'חלב 3%': { shufersal: 6.40, rami_levy: 6.70, victory: 6.90, ybitan: 7.20, hatzi_hinam: 6.60 },
    'חלב 1%': { shufersal: 6.20, rami_levy: 6.50, victory: 6.70, ybitan: 6.90, hatzi_hinam: 6.40 },
    'חלב תנובה': { shufersal: 6.50, rami_levy: 6.90, victory: 7.10, ybitan: 7.30, hatzi_hinam: 6.80 },
    'גבינה צהובה': { shufersal: 28.90, rami_levy: 31.90, victory: 32.90, ybitan: 34.90, hatzi_hinam: 30.90 },
    'גבינה לבנה': { shufersal: 7.50, rami_levy: 8.50, victory: 8.90, ybitan: 9.20, hatzi_hinam: 8.20 },
    'גבינה לבנה 5%': { shufersal: 7.50, rami_levy: 8.50, victory: 8.90, ybitan: 9.20, hatzi_hinam: 8.20 },
    'גבינה בולגרית': { shufersal: 10.50, rami_levy: 11.90, victory: 12.50, ybitan: 13.90, hatzi_hinam: 11.50 },
    'גבינת שמנת': { shufersal: 8.50, rami_levy: 9.50, victory: 9.90, ybitan: 10.50, hatzi_hinam: 9.20 },
    'גבינת צפתית': { shufersal: 12.50, rami_levy: 13.90, victory: 14.50, ybitan: 15.90, hatzi_hinam: 13.50 },
    'מוצרלה': { shufersal: 20.90, rami_levy: 23.90, victory: 24.90, ybitan: 26.90, hatzi_hinam: 22.90 },
    'פרמזן': { shufersal: 30.90, rami_levy: 33.90, victory: 34.90, ybitan: 36.90, hatzi_hinam: 32.90 },
    'קוטג': { shufersal: 8.50, rami_levy: 9.50, victory: 9.90, ybitan: 10.50, hatzi_hinam: 9.20 },
    'לבנה': { shufersal: 6.50, rami_levy: 7.50, victory: 7.90, ybitan: 8.50, hatzi_hinam: 7.20 },
    'שמנת': { shufersal: 6.50, rami_levy: 7.50, victory: 7.90, ybitan: 8.50, hatzi_hinam: 7.20 },
    'שמנת מתוקה': { shufersal: 8.50, rami_levy: 9.50, victory: 9.90, ybitan: 10.50, hatzi_hinam: 9.20 },
    'שמנת חמוצה': { shufersal: 5.50, rami_levy: 6.50, victory: 6.90, ybitan: 7.50, hatzi_hinam: 6.20 },
    'חמאה': { shufersal: 11.50, rami_levy: 12.50, victory: 12.90, ybitan: 13.90, hatzi_hinam: 12.20 },
    'מרגרינה': { shufersal: 8.50, rami_levy: 9.50, victory: 9.90, ybitan: 10.50, hatzi_hinam: 9.20 },
    'יוגורט': { shufersal: 4.50, rami_levy: 5.50, victory: 5.90, ybitan: 6.50, hatzi_hinam: 5.20 },
    'יוגורט דנונה': { shufersal: 5.50, rami_levy: 6.50, victory: 6.90, ybitan: 7.50, hatzi_hinam: 6.20 },
    'אקטיביה': { shufersal: 6.50, rami_levy: 7.50, victory: 7.90, ybitan: 8.50, hatzi_hinam: 7.20 },
    'מילקי': { shufersal: 3.50, rami_levy: 4.50, victory: 4.90, ybitan: 5.50, hatzi_hinam: 4.20 },
    'פודינג': { shufersal: 4.50, rami_levy: 5.50, victory: 5.90, ybitan: 6.50, hatzi_hinam: 5.20 },
    'ביצים': { shufersal: 27.90, rami_levy: 25.90, victory: 28.90, ybitan: 30.90, hatzi_hinam: 27.50 },
    'ביצים L': { shufersal: 27.90, rami_levy: 25.90, victory: 28.90, ybitan: 30.90, hatzi_hinam: 27.50 },
    'ביצים XL': { shufersal: 31.90, rami_levy: 29.90, victory: 32.90, ybitan: 34.90, hatzi_hinam: 31.50 },
    'ביצים חופש': { shufersal: 35.90, rami_levy: 33.90, victory: 36.90, ybitan: 38.90, hatzi_hinam: 35.50 },

    // ===== סלטים ומזון מוכן (רמי לוי זול) =====
    'סלט': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 15.90, hatzi_hinam: 13.50 },
    'סלט טורקי': { shufersal: 16.90, rami_levy: 13.90, victory: 15.90, ybitan: 17.90, hatzi_hinam: 15.50 },
    'סלט חצילים': { shufersal: 15.90, rami_levy: 12.90, victory: 14.90, ybitan: 16.90, hatzi_hinam: 14.50 },
    'סלט מטבוחה': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 15.90, hatzi_hinam: 13.50 },
    'מטבוחה': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 15.90, hatzi_hinam: 13.50 },
    'חומוס': { shufersal: 12.90, rami_levy: 9.90, victory: 11.90, ybitan: 13.90, hatzi_hinam: 11.50 },
    'טחינה': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 15.90, hatzi_hinam: 13.50 },
    'טחינה גולמית': { shufersal: 19.90, rami_levy: 16.90, victory: 18.90, ybitan: 21.90, hatzi_hinam: 18.50 },

    // ===== לחם ומאפים (ויקטורי זול) =====
    'לחם': { shufersal: 9.90, rami_levy: 8.90, victory: 7.50, ybitan: 9.50, hatzi_hinam: 8.50 },
    'לחם אחיד': { shufersal: 5.90, rami_levy: 5.90, victory: 5.90, ybitan: 5.90, hatzi_hinam: 5.90 },
    'לחם לבן': { shufersal: 9.90, rami_levy: 8.90, victory: 7.50, ybitan: 9.50, hatzi_hinam: 8.50 },
    'לחם מחיטה מלאה': { shufersal: 13.90, rami_levy: 12.90, victory: 10.50, ybitan: 13.50, hatzi_hinam: 11.90 },
    'לחם שיפון': { shufersal: 15.90, rami_levy: 14.90, victory: 12.50, ybitan: 15.50, hatzi_hinam: 13.90 },
    'חלה': { shufersal: 13.90, rami_levy: 12.90, victory: 10.50, ybitan: 13.50, hatzi_hinam: 11.90 },
    'פיתה': { shufersal: 8.90, rami_levy: 7.90, victory: 6.50, ybitan: 8.50, hatzi_hinam: 7.50 },
    'פיתות': { shufersal: 8.90, rami_levy: 7.90, victory: 6.50, ybitan: 8.50, hatzi_hinam: 7.50 },
    'לחמניות': { shufersal: 15.90, rami_levy: 14.90, victory: 12.50, ybitan: 15.50, hatzi_hinam: 13.90 },
    'באגט': { shufersal: 8.90, rami_levy: 7.90, victory: 6.50, ybitan: 8.50, hatzi_hinam: 7.50 },
    'קרואסון': { shufersal: 6.90, rami_levy: 5.90, victory: 4.50, ybitan: 6.50, hatzi_hinam: 5.50 },
    'בורקס': { shufersal: 9.90, rami_levy: 8.90, victory: 7.50, ybitan: 9.50, hatzi_hinam: 8.50 },

    // ===== פירות (ויקטורי זול) =====
    'תפוח': { shufersal: 10.90, rami_levy: 8.90, victory: 7.50, ybitan: 10.50, hatzi_hinam: 9.50 },
    'תפוחים': { shufersal: 10.90, rami_levy: 8.90, victory: 7.50, ybitan: 10.50, hatzi_hinam: 9.50 },
    'בננה': { shufersal: 8.90, rami_levy: 6.90, victory: 5.50, ybitan: 8.50, hatzi_hinam: 7.50 },
    'בננות': { shufersal: 8.90, rami_levy: 6.90, victory: 5.50, ybitan: 8.50, hatzi_hinam: 7.50 },
    'תפוז': { shufersal: 7.90, rami_levy: 5.90, victory: 4.50, ybitan: 7.50, hatzi_hinam: 6.50 },
    'תפוזים': { shufersal: 7.90, rami_levy: 5.90, victory: 4.50, ybitan: 7.50, hatzi_hinam: 6.50 },
    'לימון': { shufersal: 10.90, rami_levy: 8.90, victory: 7.50, ybitan: 10.50, hatzi_hinam: 9.50 },
    'אבוקדו': { shufersal: 13.90, rami_levy: 10.90, victory: 9.50, ybitan: 13.50, hatzi_hinam: 11.90 },
    'מנגו': { shufersal: 15.90, rami_levy: 13.90, victory: 12.50, ybitan: 15.50, hatzi_hinam: 13.90 },
    'תות': { shufersal: 25.90, rami_levy: 22.90, victory: 21.50, ybitan: 25.50, hatzi_hinam: 23.90 },
    'תותים': { shufersal: 25.90, rami_levy: 22.90, victory: 21.50, ybitan: 25.50, hatzi_hinam: 23.90 },
    'אבטיח': { shufersal: 5.90, rami_levy: 4.90, victory: 3.50, ybitan: 5.50, hatzi_hinam: 4.50 },
    'ענבים': { shufersal: 20.90, rami_levy: 17.90, victory: 16.50, ybitan: 20.50, hatzi_hinam: 18.90 },

    // ===== ירקות (רמי לוי זול) =====
    'עגבניה': { shufersal: 9.90, rami_levy: 6.50, victory: 8.90, ybitan: 10.50, hatzi_hinam: 8.50 },
    'עגבניות': { shufersal: 9.90, rami_levy: 6.50, victory: 8.90, ybitan: 10.50, hatzi_hinam: 8.50 },
    'עגבניות שרי': { shufersal: 13.90, rami_levy: 10.50, victory: 12.90, ybitan: 14.50, hatzi_hinam: 12.50 },
    'מלפפון': { shufersal: 7.90, rami_levy: 4.50, victory: 6.90, ybitan: 8.50, hatzi_hinam: 6.50 },
    'מלפפונים': { shufersal: 7.90, rami_levy: 4.50, victory: 6.90, ybitan: 8.50, hatzi_hinam: 6.50 },
    'בצל': { shufersal: 6.90, rami_levy: 3.50, victory: 5.90, ybitan: 7.50, hatzi_hinam: 5.50 },
    'שום': { shufersal: 20.90, rami_levy: 14.50, victory: 18.90, ybitan: 22.50, hatzi_hinam: 18.50 },
    'תפוח אדמה': { shufersal: 7.90, rami_levy: 4.50, victory: 6.90, ybitan: 8.50, hatzi_hinam: 6.50 },
    'תפוחי אדמה': { shufersal: 7.90, rami_levy: 4.50, victory: 6.90, ybitan: 8.50, hatzi_hinam: 6.50 },
    'גזר': { shufersal: 6.90, rami_levy: 3.50, victory: 5.90, ybitan: 7.50, hatzi_hinam: 5.50 },
    'פלפל': { shufersal: 15.90, rami_levy: 11.50, victory: 14.90, ybitan: 16.50, hatzi_hinam: 14.50 },
    'חסה': { shufersal: 8.90, rami_levy: 5.50, victory: 7.90, ybitan: 9.50, hatzi_hinam: 7.50 },
    'ברוקולי': { shufersal: 13.90, rami_levy: 9.50, victory: 12.90, ybitan: 14.50, hatzi_hinam: 12.50 },
    'כרובית': { shufersal: 10.90, rami_levy: 7.50, victory: 9.90, ybitan: 11.50, hatzi_hinam: 9.50 },
    'חציל': { shufersal: 10.90, rami_levy: 7.50, victory: 9.90, ybitan: 11.50, hatzi_hinam: 9.50 },
    'קישוא': { shufersal: 9.90, rami_levy: 6.50, victory: 8.90, ybitan: 10.50, hatzi_hinam: 8.50 },
    'בטטה': { shufersal: 10.90, rami_levy: 7.50, victory: 9.90, ybitan: 11.50, hatzi_hinam: 9.50 },
    'פטריות': { shufersal: 20.90, rami_levy: 16.50, victory: 19.90, ybitan: 22.50, hatzi_hinam: 18.50 },

    // ===== בשר ועוף (רמי לוי זול) =====
    'עוף': { shufersal: 34.90, rami_levy: 26.90, victory: 31.90, ybitan: 36.90, hatzi_hinam: 30.90 },
    'עוף שלם': { shufersal: 34.90, rami_levy: 26.90, victory: 31.90, ybitan: 36.90, hatzi_hinam: 30.90 },
    'חזה עוף': { shufersal: 44.90, rami_levy: 36.90, victory: 41.90, ybitan: 46.90, hatzi_hinam: 40.90 },
    'כנפיים': { shufersal: 26.90, rami_levy: 18.90, victory: 23.90, ybitan: 28.90, hatzi_hinam: 22.90 },
    'שוקיים': { shufersal: 30.90, rami_levy: 23.90, victory: 27.90, ybitan: 32.90, hatzi_hinam: 26.90 },
    'בשר טחון': { shufersal: 56.90, rami_levy: 48.90, victory: 53.90, ybitan: 58.90, hatzi_hinam: 52.90 },
    'בשר בקר': { shufersal: 92.90, rami_levy: 78.90, victory: 86.90, ybitan: 95.90, hatzi_hinam: 84.90 },
    'אנטריקוט': { shufersal: 132.90, rami_levy: 118.90, victory: 126.90, ybitan: 138.90, hatzi_hinam: 124.90 },
    'שניצל': { shufersal: 46.90, rami_levy: 38.90, victory: 43.90, ybitan: 48.90, hatzi_hinam: 42.90 },
    'המבורגר': { shufersal: 52.90, rami_levy: 43.90, victory: 48.90, ybitan: 54.90, hatzi_hinam: 47.90 },
    'קבב': { shufersal: 56.90, rami_levy: 48.90, victory: 53.90, ybitan: 58.90, hatzi_hinam: 52.90 },

    // ===== דגים (שופרסל זול) =====
    'סלמון': { shufersal: 78.90, rami_levy: 84.90, victory: 89.90, ybitan: 92.90, hatzi_hinam: 86.90 },
    'סלמון טרי': { shufersal: 88.90, rami_levy: 94.90, victory: 99.90, ybitan: 102.90, hatzi_hinam: 96.90 },
    'טונה': { shufersal: 10.50, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'דג': { shufersal: 44.90, rami_levy: 49.90, victory: 52.90, ybitan: 54.90, hatzi_hinam: 48.90 },
    'אמנון': { shufersal: 38.90, rami_levy: 44.90, victory: 47.90, ybitan: 49.90, hatzi_hinam: 42.90 },

    // ===== מזון יבש (שופרסל זול במותג פרטי) =====
    'אורז': { shufersal: 9.50, rami_levy: 11.90, victory: 12.90, ybitan: 13.90, hatzi_hinam: 11.50 },
    'אורז בסמטי': { shufersal: 14.50, rami_levy: 16.90, victory: 17.90, ybitan: 18.90, hatzi_hinam: 16.50 },
    'פסטה': { shufersal: 5.50, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'ספגטי': { shufersal: 5.50, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'קוסקוס': { shufersal: 7.50, rami_levy: 9.90, victory: 10.90, ybitan: 11.90, hatzi_hinam: 9.50 },
    'קינואה': { shufersal: 21.50, rami_levy: 24.90, victory: 26.90, ybitan: 28.90, hatzi_hinam: 24.50 },
    'עדשים': { shufersal: 10.50, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'קמח': { shufersal: 6.50, rami_levy: 8.90, victory: 9.90, ybitan: 10.90, hatzi_hinam: 8.50 },
    'סוכר': { shufersal: 7.50, rami_levy: 9.90, victory: 10.90, ybitan: 11.90, hatzi_hinam: 9.50 },
    'מלח': { shufersal: 2.50, rami_levy: 4.90, victory: 5.90, ybitan: 6.90, hatzi_hinam: 4.50 },
    'שמן': { shufersal: 11.50, rami_levy: 14.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50 },
    'שמן זית': { shufersal: 33.90, rami_levy: 38.90, victory: 39.90, ybitan: 42.90, hatzi_hinam: 36.90 },

    // ===== רטבים ותבלינים (שופרסל זול) =====
    'קטשופ': { shufersal: 9.50, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.50 },
    'מיונז': { shufersal: 11.50, rami_levy: 14.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 13.50 },
    'חרדל': { shufersal: 7.50, rami_levy: 9.90, victory: 10.90, ybitan: 11.90, hatzi_hinam: 9.50 },
    'רוטב עגבניות': { shufersal: 6.50, rami_levy: 8.90, victory: 9.90, ybitan: 10.90, hatzi_hinam: 8.50 },
    'רסק עגבניות': { shufersal: 4.50, rami_levy: 6.90, victory: 7.90, ybitan: 8.90, hatzi_hinam: 6.50 },

    // ===== חטיפים וממתקים (חצי חינם זול) =====
    'שוקולד': { shufersal: 10.90, rami_levy: 9.90, victory: 10.50, ybitan: 11.90, hatzi_hinam: 7.50 },
    'במבה': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 5.50 },
    'ביסלי': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 5.50 },
    'צ\'יפס': { shufersal: 10.90, rami_levy: 9.90, victory: 10.50, ybitan: 11.90, hatzi_hinam: 7.50 },
    'פופקורן': { shufersal: 7.90, rami_levy: 6.90, victory: 7.50, ybitan: 8.90, hatzi_hinam: 4.50 },
    'קרקרים': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50 },
    'עוגיות': { shufersal: 16.90, rami_levy: 15.90, victory: 16.50, ybitan: 17.90, hatzi_hinam: 13.50 },
    'נוטלה': { shufersal: 25.90, rami_levy: 24.90, victory: 25.50, ybitan: 27.90, hatzi_hinam: 21.50 },
    'חמאת בוטנים': { shufersal: 25.90, rami_levy: 24.90, victory: 25.50, ybitan: 27.90, hatzi_hinam: 21.50 },

    // ===== משקאות (חצי חינם זול) =====
    'מים': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 7.90, hatzi_hinam: 3.50 },
    'מים מינרליים': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 7.90, hatzi_hinam: 3.50 },
    'קולה': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50 },
    'קוקה קולה': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50 },
    'פפסי': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50 },
    'ספרייט': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50 },
    'סודה': { shufersal: 5.90, rami_levy: 4.90, victory: 5.50, ybitan: 6.90, hatzi_hinam: 3.50 },
    'מיץ': { shufersal: 13.90, rami_levy: 11.90, victory: 12.50, ybitan: 14.90, hatzi_hinam: 9.50 },
    'מיץ תפוזים': { shufersal: 15.90, rami_levy: 13.90, victory: 14.50, ybitan: 16.90, hatzi_hinam: 11.50 },

    // ===== יינות ואלכוהול (יינות ביתן זול) =====
    'בירה': { shufersal: 10.90, rami_levy: 9.90, victory: 10.50, ybitan: 7.50, hatzi_hinam: 9.50 },
    'יין': { shufersal: 42.90, rami_levy: 39.90, victory: 44.90, ybitan: 34.90, hatzi_hinam: 41.90 },
    'יין אדום': { shufersal: 42.90, rami_levy: 39.90, victory: 44.90, ybitan: 34.90, hatzi_hinam: 41.90 },
    'יין לבן': { shufersal: 42.90, rami_levy: 39.90, victory: 44.90, ybitan: 34.90, hatzi_hinam: 41.90 },
    'וודקה': { shufersal: 64.90, rami_levy: 59.90, victory: 66.90, ybitan: 52.90, hatzi_hinam: 62.90 },
    'וויסקי': { shufersal: 99.90, rami_levy: 94.90, victory: 102.90, ybitan: 84.90, hatzi_hinam: 97.90 },

    // ===== קפה ותה (רמי לוי זול) =====
    'קפה': { shufersal: 26.90, rami_levy: 19.90, victory: 24.90, ybitan: 28.90, hatzi_hinam: 23.90 },
    'קפה טורקי': { shufersal: 21.90, rami_levy: 16.90, victory: 19.90, ybitan: 23.90, hatzi_hinam: 18.90 },
    'נס קפה': { shufersal: 26.90, rami_levy: 21.90, victory: 24.90, ybitan: 28.90, hatzi_hinam: 23.90 },
    'תה': { shufersal: 16.90, rami_levy: 11.90, victory: 14.90, ybitan: 18.90, hatzi_hinam: 13.90 },

    // ===== מוצרי ניקיון (חצי חינם זול) =====
    'סבון': { shufersal: 10.90, rami_levy: 9.90, victory: 10.50, ybitan: 11.90, hatzi_hinam: 7.50 },
    'סבון כלים': { shufersal: 10.90, rami_levy: 9.90, victory: 10.50, ybitan: 11.90, hatzi_hinam: 7.50 },
    'שמפו': { shufersal: 21.90, rami_levy: 18.90, victory: 20.50, ybitan: 23.90, hatzi_hinam: 14.50 },
    'מרכך': { shufersal: 21.90, rami_levy: 18.90, victory: 20.50, ybitan: 23.90, hatzi_hinam: 14.50 },
    'נייר טואלט': { shufersal: 36.90, rami_levy: 33.90, victory: 35.50, ybitan: 38.90, hatzi_hinam: 28.90 },
    'מגבונים': { shufersal: 16.90, rami_levy: 13.90, victory: 15.50, ybitan: 18.90, hatzi_hinam: 11.50 },
    'אבקת כביסה': { shufersal: 41.90, rami_levy: 38.90, victory: 40.50, ybitan: 43.90, hatzi_hinam: 33.90 },
    'מרכך כביסה': { shufersal: 26.90, rami_levy: 23.90, victory: 25.50, ybitan: 28.90, hatzi_hinam: 21.50 },
    'נוזל כלים': { shufersal: 13.90, rami_levy: 11.90, victory: 12.50, ybitan: 14.90, hatzi_hinam: 9.50 },
    'אקונומיקה': { shufersal: 10.90, rami_levy: 8.90, victory: 10.50, ybitan: 12.90, hatzi_hinam: 6.50 },
    'שקיות אשפה': { shufersal: 15.90, rami_levy: 13.90, victory: 14.50, ybitan: 16.90, hatzi_hinam: 11.50 },

    // ===== תינוקות (שופרסל זול) =====
    'טיטולים': { shufersal: 48.90, rami_levy: 54.90, victory: 56.90, ybitan: 59.90, hatzi_hinam: 52.90 },
    'חיתולים': { shufersal: 48.90, rami_levy: 54.90, victory: 56.90, ybitan: 59.90, hatzi_hinam: 52.90 },
    'פמפרס': { shufersal: 58.90, rami_levy: 64.90, victory: 66.90, ybitan: 69.90, hatzi_hinam: 62.90 },
    'האגיס': { shufersal: 53.90, rami_levy: 59.90, victory: 61.90, ybitan: 64.90, hatzi_hinam: 57.90 },
    'מטרנה': { shufersal: 48.90, rami_levy: 54.90, victory: 56.90, ybitan: 58.90, hatzi_hinam: 52.90 },

    // ===== קפואים (רמי לוי זול) =====
    'פיצה קפואה': { shufersal: 26.90, rami_levy: 21.50, victory: 24.90, ybitan: 28.90, hatzi_hinam: 24.50 },
    'שניצלים קפואים': { shufersal: 36.90, rami_levy: 29.50, victory: 33.90, ybitan: 38.90, hatzi_hinam: 33.50 },
    'נאגטס': { shufersal: 31.90, rami_levy: 24.50, victory: 28.90, ybitan: 33.90, hatzi_hinam: 28.50 },
    'ירקות קפואים': { shufersal: 16.90, rami_levy: 11.50, victory: 14.90, ybitan: 18.90, hatzi_hinam: 14.50 },
    'גלידה': { shufersal: 26.90, rami_levy: 21.50, victory: 24.90, ybitan: 28.90, hatzi_hinam: 24.50 },

    // ===== מותגים נוספים =====
    'תנובה': { shufersal: 6.40, rami_levy: 6.90, victory: 7.20, ybitan: 7.50, hatzi_hinam: 6.70 },
    'טרה': { shufersal: 6.20, rami_levy: 6.70, victory: 7.00, ybitan: 7.30, hatzi_hinam: 6.50 },
    'עלית': { shufersal: 22.90, rami_levy: 19.90, victory: 21.90, ybitan: 24.90, hatzi_hinam: 20.90 },
    'אסם': { shufersal: 8.90, rami_levy: 7.50, victory: 8.20, ybitan: 9.50, hatzi_hinam: 5.90 },
    'אסם במבה': { shufersal: 8.90, rami_levy: 7.50, victory: 8.20, ybitan: 9.50, hatzi_hinam: 5.90 },
    'אסם ביסלי': { shufersal: 8.90, rami_levy: 7.50, victory: 8.20, ybitan: 9.50, hatzi_hinam: 5.90 },
    'סנו': { shufersal: 15.90, rami_levy: 13.90, victory: 14.50, ybitan: 16.90, hatzi_hinam: 11.50 },
    'אריאל': { shufersal: 46.90, rami_levy: 42.90, victory: 44.90, ybitan: 48.90, hatzi_hinam: 38.90 },
    'פרסיל': { shufersal: 41.90, rami_levy: 38.90, victory: 40.50, ybitan: 43.90, hatzi_hinam: 34.50 },
};

// Chain information
const CHAINS = {
    shufersal: { name: 'שופרסל', color: '#dc2626', url: 'https://www.shufersal.co.il/online/he/search?text=' },
    rami_levy: { name: 'רמי לוי', color: '#2563eb', url: 'https://www.rami-levy.co.il/he/online/search?q=' },
    victory: { name: 'ויקטורי', color: '#ea580c', url: 'https://www.victoryonline.co.il/search?q=' },
    ybitan: { name: 'יינות ביתן', color: '#7c3aed', url: 'https://www.ybitan.co.il/search?q=' },
    hatzi_hinam: { name: 'חצי חינם', color: '#16a34a', url: 'https://shop.hazi-hinam.co.il/search?q=' },
};

// Improved product matching with fuzzy search
function findProduct(name) {
    if (!name) return null;
    const searchName = name.trim();
    const searchLower = searchName.toLowerCase();

    // 1. Exact match
    if (PRICE_DATABASE[searchName]) {
        return { name: searchName, prices: PRICE_DATABASE[searchName] };
    }

    // 2. Case-insensitive exact match
    for (const [productName, prices] of Object.entries(PRICE_DATABASE)) {
        if (productName.toLowerCase() === searchLower) {
            return { name: productName, prices };
        }
    }

    // 3. Starts with match
    for (const [productName, prices] of Object.entries(PRICE_DATABASE)) {
        if (productName.startsWith(searchName) || searchName.startsWith(productName)) {
            return { name: productName, prices };
        }
    }

    // 4. Contains match
    for (const [productName, prices] of Object.entries(PRICE_DATABASE)) {
        if (productName.includes(searchName) || searchName.includes(productName)) {
            return { name: productName, prices };
        }
    }

    // 5. Word-based matching
    const searchWords = searchName.split(/\s+/).filter(w => w.length > 1);
    let bestMatch = null;
    let bestScore = 0;

    for (const [productName, prices] of Object.entries(PRICE_DATABASE)) {
        const productWords = productName.split(/\s+/);
        let score = 0;

        for (const searchWord of searchWords) {
            for (const productWord of productWords) {
                if (productWord.includes(searchWord) || searchWord.includes(productWord)) {
                    score += 10;
                }
                if (productWord === searchWord) {
                    score += 20;
                }
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = { name: productName, prices };
        }
    }

    if (bestMatch && bestScore >= 10) {
        return bestMatch;
    }

    // 6. Partial character match (for typos)
    for (const [productName, prices] of Object.entries(PRICE_DATABASE)) {
        const similarity = calculateSimilarity(searchName, productName);
        if (similarity > 0.6) {
            return { name: productName, prices };
        }
    }

    return null;
}

// Calculate string similarity (Dice coefficient)
function calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    if (str1 === str2) return 1;

    const bigrams1 = new Set();
    const bigrams2 = new Set();

    for (let i = 0; i < str1.length - 1; i++) {
        bigrams1.add(str1.slice(i, i + 2));
    }
    for (let i = 0; i < str2.length - 1; i++) {
        bigrams2.add(str2.slice(i, i + 2));
    }

    let intersection = 0;
    for (const bigram of bigrams1) {
        if (bigrams2.has(bigram)) intersection++;
    }

    return (2 * intersection) / (bigrams1.size + bigrams2.size);
}

// Compare shopping list
function compareList(items) {
    const chainTotals = {};
    const chainItems = {};
    const notFound = [];

    for (const chainId of Object.keys(CHAINS)) {
        chainTotals[chainId] = 0;
        chainItems[chainId] = [];
    }

    for (const item of items) {
        const product = findProduct(item.name);
        const quantity = item.quantity || 1;

        if (product) {
            for (const [chainId, price] of Object.entries(product.prices)) {
                const itemTotal = price * quantity;
                chainTotals[chainId] += itemTotal;
                chainItems[chainId].push({
                    name: item.name,
                    matchedName: product.name,
                    quantity,
                    price,
                    total: itemTotal
                });
            }
        } else {
            notFound.push(item.name);
        }
    }

    const comparison = Object.entries(chainTotals)
        .map(([chainId, total]) => ({
            chain_id: chainId,
            chain_name: CHAINS[chainId].name,
            chain_name_he: CHAINS[chainId].name,
            color: CHAINS[chainId].color,
            url: CHAINS[chainId].url,
            total: Math.round(total * 100) / 100,
            items_found: chainItems[chainId].length,
            items_not_found: notFound,
            items: chainItems[chainId]
        }))
        .sort((a, b) => a.total - b.total);

    if (comparison.length > 0 && comparison[0].items_found > 0) {
        comparison[0].is_cheapest = true;
        const maxTotal = comparison[comparison.length - 1].total;
        comparison.forEach(c => {
            c.savings_vs_expensive = Math.round((maxTotal - c.total) * 100) / 100;
        });
    }

    return {
        comparison,
        cheapest_chain: comparison[0]?.items_found > 0 ? comparison[0] : null,
        most_expensive_chain: comparison[comparison.length - 1]?.items_found > 0 ? comparison[comparison.length - 1] : null,
        potential_savings: comparison.length > 1 && comparison[0].items_found > 0
            ? Math.round((comparison[comparison.length - 1].total - comparison[0].total) * 100) / 100
            : 0,
        items_analyzed: items.length,
        items_found: items.length - notFound.length,
        items_not_found: notFound
    };
}

// Optimize basket
function optimizeBasket(items, maxChains = 2, strategy = 'optimal') {
    const itemPrices = [];

    for (const item of items) {
        const product = findProduct(item.name);
        if (product) {
            const quantity = item.quantity || 1;
            const pricesByChain = {};
            let cheapestChain = null;
            let cheapestPrice = Infinity;

            for (const [chainId, price] of Object.entries(product.prices)) {
                pricesByChain[chainId] = price * quantity;
                if (price < cheapestPrice) {
                    cheapestPrice = price;
                    cheapestChain = chainId;
                }
            }

            itemPrices.push({
                name: item.name,
                quantity,
                pricesByChain,
                cheapestChain,
                cheapestPrice: cheapestPrice * quantity
            });
        }
    }

    if (strategy === 'single') {
        // Single store strategy
        const chainTotals = {};
        for (const chainId of Object.keys(CHAINS)) {
            chainTotals[chainId] = itemPrices.reduce((sum, item) => sum + (item.pricesByChain[chainId] || 0), 0);
        }
        const bestChain = Object.entries(chainTotals).sort((a, b) => a[1] - b[1])[0];

        return {
            strategy: 'single',
            total_price: Math.round(bestChain[1] * 100) / 100,
            shopping_plan: [{
                chain_id: bestChain[0],
                chain_name: CHAINS[bestChain[0]].name,
                items: itemPrices.map(i => ({ name: i.name, quantity: i.quantity, price: i.pricesByChain[bestChain[0]] })),
                subtotal: Math.round(bestChain[1] * 100) / 100
            }]
        };
    }

    // Optimal strategy - buy each item at cheapest store
    const shoppingPlan = {};
    let totalPrice = 0;

    for (const item of itemPrices) {
        if (!shoppingPlan[item.cheapestChain]) {
            shoppingPlan[item.cheapestChain] = { items: [], subtotal: 0 };
        }
        shoppingPlan[item.cheapestChain].items.push({
            name: item.name,
            quantity: item.quantity,
            price: item.cheapestPrice
        });
        shoppingPlan[item.cheapestChain].subtotal += item.cheapestPrice;
        totalPrice += item.cheapestPrice;
    }

    // Calculate savings vs single store
    const singleStorePrices = Object.keys(CHAINS).map(chainId =>
        itemPrices.reduce((sum, item) => sum + (item.pricesByChain[chainId] || 0), 0)
    );
    const bestSingleStore = Math.min(...singleStorePrices);
    const savings = bestSingleStore - totalPrice;

    return {
        strategy: 'optimal',
        total_price: Math.round(totalPrice * 100) / 100,
        total_savings: Math.round(savings * 100) / 100,
        savings_percentage: bestSingleStore > 0 ? Math.round((savings / bestSingleStore) * 100 * 10) / 10 : 0,
        shopping_plan: Object.entries(shoppingPlan).map(([chainId, data]) => ({
            chain_id: chainId,
            chain_name: CHAINS[chainId].name,
            color: CHAINS[chainId].color,
            items: data.items,
            subtotal: Math.round(data.subtotal * 100) / 100
        })).sort((a, b) => b.subtotal - a.subtotal)
    };
}

// Main handler
module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action } = req.query;

    try {
        if (action === 'chains') {
            return res.json({
                chains: Object.entries(CHAINS).map(([id, chain]) => ({
                    id,
                    name: chain.name,
                    color: chain.color,
                    url: chain.url
                }))
            });
        }

        if (action === 'search') {
            const { q } = req.query;
            if (!q) {
                return res.status(400).json({ error: 'Missing search query' });
            }

            const product = findProduct(q);
            if (!product) {
                return res.json({ found: false, query: q });
            }

            const prices = Object.entries(product.prices)
                .map(([chainId, price]) => ({
                    chain_id: chainId,
                    chain_name: CHAINS[chainId].name,
                    price
                }))
                .sort((a, b) => a.price - b.price);

            return res.json({
                found: true,
                product: product.name,
                prices,
                cheapest: prices[0]
            });
        }

        if (req.method === 'POST') {
            const { items, max_chains, strategy } = req.body;

            if (!items || !Array.isArray(items)) {
                return res.status(400).json({ error: 'Invalid items array' });
            }

            if (action === 'optimize') {
                const result = optimizeBasket(items, max_chains || 2, strategy || 'optimal');
                return res.json(result);
            }

            // Default: compare list
            const result = compareList(items);
            return res.json(result);
        }

        return res.status(400).json({ error: 'Invalid request' });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
