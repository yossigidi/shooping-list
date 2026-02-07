// ListNest Price Comparison API - Vercel Serverless
// Uses estimated prices + links to real supermarket sites

// Comprehensive Israeli product price database (estimated averages in NIS)
const PRICE_DATABASE = {
    // ===== חלב ומוצרי חלב =====
    'חלב': { shufersal: 6.90, rami_levy: 6.50, victory: 6.70, ybitan: 6.80, hatzi_hinam: 6.40 },
    'חלב 3%': { shufersal: 6.90, rami_levy: 6.50, victory: 6.70, ybitan: 6.80, hatzi_hinam: 6.40 },
    'חלב 1%': { shufersal: 6.70, rami_levy: 6.30, victory: 6.50, ybitan: 6.60, hatzi_hinam: 6.20 },
    'חלב תנובה': { shufersal: 6.90, rami_levy: 6.50, victory: 6.70, ybitan: 6.80, hatzi_hinam: 6.40 },
    'גבינה צהובה': { shufersal: 32.90, rami_levy: 29.90, victory: 31.90, ybitan: 33.90, hatzi_hinam: 28.90 },
    'גבינה לבנה': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 8.90, hatzi_hinam: 7.50 },
    'גבינה לבנה 5%': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 8.90, hatzi_hinam: 7.50 },
    'גבינה בולגרית': { shufersal: 12.90, rami_levy: 10.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 10.50 },
    'גבינת שמנת': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 9.90, hatzi_hinam: 8.50 },
    'גבינת צפתית': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'מוצרלה': { shufersal: 24.90, rami_levy: 21.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 20.90 },
    'פרמזן': { shufersal: 34.90, rami_levy: 31.90, victory: 33.90, ybitan: 34.90, hatzi_hinam: 30.90 },
    'קוטג': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 9.90, hatzi_hinam: 8.50 },
    'קוטג\'': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 9.90, hatzi_hinam: 8.50 },
    'לבנה': { shufersal: 7.90, rami_levy: 6.90, victory: 7.50, ybitan: 7.90, hatzi_hinam: 6.50 },
    'שמנת': { shufersal: 7.90, rami_levy: 6.90, victory: 7.50, ybitan: 7.90, hatzi_hinam: 6.50 },
    'שמנת מתוקה': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 9.90, hatzi_hinam: 8.50 },
    'שמנת חמוצה': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 6.90, hatzi_hinam: 5.50 },
    'חמאה': { shufersal: 12.90, rami_levy: 11.90, victory: 12.50, ybitan: 12.90, hatzi_hinam: 11.50 },
    'מרגרינה': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 9.90, hatzi_hinam: 8.50 },
    'יוגורט': { shufersal: 5.90, rami_levy: 4.90, victory: 5.50, ybitan: 5.90, hatzi_hinam: 4.50 },
    'יוגורט דנונה': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 6.90, hatzi_hinam: 5.50 },
    'אקטיביה': { shufersal: 7.90, rami_levy: 6.90, victory: 7.50, ybitan: 7.90, hatzi_hinam: 6.50 },
    'מילקי': { shufersal: 4.90, rami_levy: 3.90, victory: 4.50, ybitan: 4.90, hatzi_hinam: 3.50 },
    'פודינג': { shufersal: 5.90, rami_levy: 4.90, victory: 5.50, ybitan: 5.90, hatzi_hinam: 4.50 },
    'ביצים': { shufersal: 28.90, rami_levy: 26.90, victory: 27.90, ybitan: 29.90, hatzi_hinam: 25.90 },
    'ביצים L': { shufersal: 28.90, rami_levy: 26.90, victory: 27.90, ybitan: 29.90, hatzi_hinam: 25.90 },
    'ביצים XL': { shufersal: 32.90, rami_levy: 30.90, victory: 31.90, ybitan: 33.90, hatzi_hinam: 29.90 },
    'ביצים חופש': { shufersal: 36.90, rami_levy: 34.90, victory: 35.90, ybitan: 37.90, hatzi_hinam: 33.90 },

    // ===== סלטים ומזון מוכן =====
    'סלט': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'סלט טורקי': { shufersal: 16.90, rami_levy: 14.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50 },
    'סלט חצילים': { shufersal: 15.90, rami_levy: 13.90, victory: 14.90, ybitan: 15.90, hatzi_hinam: 13.50 },
    'סלט מטבוחה': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'מטבוחה': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'סלט חומוס': { shufersal: 12.90, rami_levy: 10.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 10.50 },
    'חומוס': { shufersal: 12.90, rami_levy: 10.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 10.50 },
    'טחינה': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'טחינה גולמית': { shufersal: 19.90, rami_levy: 17.90, victory: 18.90, ybitan: 19.90, hatzi_hinam: 17.50 },
    'סלט ביצים': { shufersal: 18.90, rami_levy: 16.90, victory: 17.90, ybitan: 18.90, hatzi_hinam: 16.50 },
    'סלט טונה': { shufersal: 22.90, rami_levy: 19.90, victory: 21.90, ybitan: 22.90, hatzi_hinam: 19.50 },
    'סלט תפוחי אדמה': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'סלט כרוב': { shufersal: 11.90, rami_levy: 9.90, victory: 10.90, ybitan: 11.90, hatzi_hinam: 9.50 },
    'סלט קולסלאו': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'קולסלאו': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'סלט ירקות': { shufersal: 16.90, rami_levy: 14.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50 },
    'סלט גזר': { shufersal: 12.90, rami_levy: 10.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 10.50 },
    'סלט סלק': { shufersal: 13.90, rami_levy: 11.90, victory: 12.90, ybitan: 13.90, hatzi_hinam: 11.50 },
    'סלט קינואה': { shufersal: 24.90, rami_levy: 22.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 22.50 },
    'סלט בורגול': { shufersal: 18.90, rami_levy: 16.90, victory: 17.90, ybitan: 18.90, hatzi_hinam: 16.50 },
    'סלט פסטה': { shufersal: 19.90, rami_levy: 17.90, victory: 18.90, ybitan: 19.90, hatzi_hinam: 17.50 },
    'סלט יווני': { shufersal: 22.90, rami_levy: 19.90, victory: 21.90, ybitan: 22.90, hatzi_hinam: 19.50 },
    'סלט קיסר': { shufersal: 24.90, rami_levy: 22.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 22.50 },
    'ממרח': { shufersal: 12.90, rami_levy: 10.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 10.50 },
    'ממרח אבוקדו': { shufersal: 16.90, rami_levy: 14.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50 },
    'גואקמולי': { shufersal: 18.90, rami_levy: 16.90, victory: 17.90, ybitan: 18.90, hatzi_hinam: 16.50 },
    'פסטו': { shufersal: 19.90, rami_levy: 17.90, victory: 18.90, ybitan: 19.90, hatzi_hinam: 17.50 },
    'זיתים': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'זיתים ירוקים': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'זיתים שחורים': { shufersal: 16.90, rami_levy: 14.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50 },
    'חמוצים': { shufersal: 12.90, rami_levy: 10.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 10.50 },
    'מלפפון חמוץ': { shufersal: 12.90, rami_levy: 10.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 10.50 },

    // ===== דליקטסן ונקניקים =====
    'נקניק': { shufersal: 24.90, rami_levy: 21.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 21.50 },
    'נקניקיות': { shufersal: 29.90, rami_levy: 24.90, victory: 27.90, ybitan: 29.90, hatzi_hinam: 24.50 },
    'נקניקיות הודו': { shufersal: 32.90, rami_levy: 28.90, victory: 30.90, ybitan: 32.90, hatzi_hinam: 28.50 },
    'נקניקייה': { shufersal: 29.90, rami_levy: 24.90, victory: 27.90, ybitan: 29.90, hatzi_hinam: 24.50 },
    'פסטרמה': { shufersal: 44.90, rami_levy: 39.90, victory: 42.90, ybitan: 44.90, hatzi_hinam: 39.50 },
    'פסטרמה הודו': { shufersal: 49.90, rami_levy: 44.90, victory: 47.90, ybitan: 49.90, hatzi_hinam: 44.50 },
    'סלמי': { shufersal: 49.90, rami_levy: 44.90, victory: 47.90, ybitan: 49.90, hatzi_hinam: 44.50 },
    'חזה הודו': { shufersal: 54.90, rami_levy: 49.90, victory: 52.90, ybitan: 54.90, hatzi_hinam: 48.90 },
    'רוסטביף': { shufersal: 64.90, rami_levy: 59.90, victory: 62.90, ybitan: 64.90, hatzi_hinam: 58.90 },
    'קבנוס': { shufersal: 39.90, rami_levy: 34.90, victory: 37.90, ybitan: 39.90, hatzi_hinam: 34.50 },
    'חזה עוף מעושן': { shufersal: 49.90, rami_levy: 44.90, victory: 47.90, ybitan: 49.90, hatzi_hinam: 44.50 },

    // ===== לחם ומאפים =====
    'לחם': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 8.90, hatzi_hinam: 7.50 },
    'לחם אחיד': { shufersal: 5.90, rami_levy: 5.90, victory: 5.90, ybitan: 5.90, hatzi_hinam: 5.90 },
    'לחם לבן': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 8.90, hatzi_hinam: 7.50 },
    'לחם מחיטה מלאה': { shufersal: 12.90, rami_levy: 10.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 10.50 },
    'לחם שיפון': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'לחם פרוס': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 9.90, hatzi_hinam: 8.50 },
    'לחם קל': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'חלה': { shufersal: 12.90, rami_levy: 10.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 10.50 },
    'פיתה': { shufersal: 7.90, rami_levy: 6.90, victory: 7.50, ybitan: 7.90, hatzi_hinam: 6.50 },
    'פיתות': { shufersal: 7.90, rami_levy: 6.90, victory: 7.50, ybitan: 7.90, hatzi_hinam: 6.50 },
    'לאפה': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 9.90, hatzi_hinam: 8.50 },
    'טורטייה': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'לחמניות': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'לחמניה': { shufersal: 2.90, rami_levy: 2.50, victory: 2.70, ybitan: 2.90, hatzi_hinam: 2.50 },
    'באגט': { shufersal: 7.90, rami_levy: 6.90, victory: 7.50, ybitan: 7.90, hatzi_hinam: 6.50 },
    'קרואסון': { shufersal: 5.90, rami_levy: 4.90, victory: 5.50, ybitan: 5.90, hatzi_hinam: 4.50 },
    'בורקס': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 8.90, hatzi_hinam: 7.50 },
    'בורקס גבינה': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 9.90, hatzi_hinam: 8.50 },
    'בורקס תפוא': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 8.90, hatzi_hinam: 7.50 },
    'עוגיות': { shufersal: 15.90, rami_levy: 13.90, victory: 14.90, ybitan: 15.90, hatzi_hinam: 13.50 },
    'עוגה': { shufersal: 29.90, rami_levy: 26.90, victory: 28.90, ybitan: 29.90, hatzi_hinam: 26.50 },
    'מאפין': { shufersal: 7.90, rami_levy: 6.90, victory: 7.50, ybitan: 7.90, hatzi_hinam: 6.50 },
    'דונאט': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 6.90, hatzi_hinam: 5.50 },

    // ===== פירות =====
    'תפוח': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'תפוחים': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'תפוח עץ': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'בננה': { shufersal: 7.90, rami_levy: 5.90, victory: 6.90, ybitan: 7.90, hatzi_hinam: 5.50 },
    'בננות': { shufersal: 7.90, rami_levy: 5.90, victory: 6.90, ybitan: 7.90, hatzi_hinam: 5.50 },
    'תפוז': { shufersal: 6.90, rami_levy: 4.90, victory: 5.90, ybitan: 6.90, hatzi_hinam: 4.50 },
    'תפוזים': { shufersal: 6.90, rami_levy: 4.90, victory: 5.90, ybitan: 6.90, hatzi_hinam: 4.50 },
    'לימון': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'לימונים': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'אבוקדו': { shufersal: 12.90, rami_levy: 9.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 9.50 },
    'מנגו': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'אננס': { shufersal: 16.90, rami_levy: 14.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50 },
    'אפרסק': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'נקטרינה': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'אגס': { shufersal: 12.90, rami_levy: 10.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 10.50 },
    'שזיף': { shufersal: 16.90, rami_levy: 14.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50 },
    'ענבים': { shufersal: 19.90, rami_levy: 16.90, victory: 18.90, ybitan: 19.90, hatzi_hinam: 16.50 },
    'תות': { shufersal: 24.90, rami_levy: 21.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 21.50 },
    'תותים': { shufersal: 24.90, rami_levy: 21.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 21.50 },
    'אבטיח': { shufersal: 4.90, rami_levy: 3.90, victory: 4.50, ybitan: 4.90, hatzi_hinam: 3.50 },
    'מלון': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 6.90, hatzi_hinam: 5.50 },
    'קיווי': { shufersal: 19.90, rami_levy: 16.90, victory: 18.90, ybitan: 19.90, hatzi_hinam: 16.50 },
    'רימון': { shufersal: 12.90, rami_levy: 9.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 9.50 },
    'אשכולית': { shufersal: 6.90, rami_levy: 4.90, victory: 5.90, ybitan: 6.90, hatzi_hinam: 4.50 },
    'קלמנטינות': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'פומלה': { shufersal: 7.90, rami_levy: 5.90, victory: 6.90, ybitan: 7.90, hatzi_hinam: 5.50 },

    // ===== ירקות =====
    'עגבניה': { shufersal: 8.90, rami_levy: 6.90, victory: 7.90, ybitan: 8.90, hatzi_hinam: 6.50 },
    'עגבניות': { shufersal: 8.90, rami_levy: 6.90, victory: 7.90, ybitan: 8.90, hatzi_hinam: 6.50 },
    'עגבניות שרי': { shufersal: 12.90, rami_levy: 10.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 10.50 },
    'מלפפון': { shufersal: 6.90, rami_levy: 4.90, victory: 5.90, ybitan: 6.90, hatzi_hinam: 4.50 },
    'מלפפונים': { shufersal: 6.90, rami_levy: 4.90, victory: 5.90, ybitan: 6.90, hatzi_hinam: 4.50 },
    'בצל': { shufersal: 5.90, rami_levy: 3.90, victory: 4.90, ybitan: 5.90, hatzi_hinam: 3.50 },
    'בצל יבש': { shufersal: 5.90, rami_levy: 3.90, victory: 4.90, ybitan: 5.90, hatzi_hinam: 3.50 },
    'בצל ירוק': { shufersal: 4.90, rami_levy: 3.90, victory: 4.50, ybitan: 4.90, hatzi_hinam: 3.50 },
    'בצל סגול': { shufersal: 7.90, rami_levy: 5.90, victory: 6.90, ybitan: 7.90, hatzi_hinam: 5.50 },
    'שום': { shufersal: 19.90, rami_levy: 14.90, victory: 17.90, ybitan: 19.90, hatzi_hinam: 14.50 },
    'תפוח אדמה': { shufersal: 6.90, rami_levy: 4.90, victory: 5.90, ybitan: 6.90, hatzi_hinam: 4.50 },
    'תפוחי אדמה': { shufersal: 6.90, rami_levy: 4.90, victory: 5.90, ybitan: 6.90, hatzi_hinam: 4.50 },
    'גזר': { shufersal: 5.90, rami_levy: 3.90, victory: 4.90, ybitan: 5.90, hatzi_hinam: 3.50 },
    'פלפל': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.50 },
    'פלפל אדום': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.50 },
    'פלפל ירוק': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'פלפל צהוב': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.50 },
    'חסה': { shufersal: 7.90, rami_levy: 5.90, victory: 6.90, ybitan: 7.90, hatzi_hinam: 5.50 },
    'חסה רומית': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'כרוב': { shufersal: 4.90, rami_levy: 2.90, victory: 3.90, ybitan: 4.90, hatzi_hinam: 2.50 },
    'כרוב לבן': { shufersal: 4.90, rami_levy: 2.90, victory: 3.90, ybitan: 4.90, hatzi_hinam: 2.50 },
    'כרוב סגול': { shufersal: 6.90, rami_levy: 4.90, victory: 5.90, ybitan: 6.90, hatzi_hinam: 4.50 },
    'ברוקולי': { shufersal: 12.90, rami_levy: 9.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 9.50 },
    'כרובית': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'חציל': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'חצילים': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'קישוא': { shufersal: 8.90, rami_levy: 6.90, victory: 7.90, ybitan: 8.90, hatzi_hinam: 6.50 },
    'קישואים': { shufersal: 8.90, rami_levy: 6.90, victory: 7.90, ybitan: 8.90, hatzi_hinam: 6.50 },
    'תרד': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'סלרי': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'פטריות': { shufersal: 19.90, rami_levy: 16.90, victory: 18.90, ybitan: 19.90, hatzi_hinam: 16.50 },
    'שמפיניון': { shufersal: 19.90, rami_levy: 16.90, victory: 18.90, ybitan: 19.90, hatzi_hinam: 16.50 },
    'בטטה': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'סלק': { shufersal: 6.90, rami_levy: 4.90, victory: 5.90, ybitan: 6.90, hatzi_hinam: 4.50 },
    'צנון': { shufersal: 5.90, rami_levy: 3.90, victory: 4.90, ybitan: 5.90, hatzi_hinam: 3.50 },
    'תירס': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 6.90, hatzi_hinam: 5.50 },
    'שעועית ירוקה': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'אפונה': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'כוסברה': { shufersal: 4.90, rami_levy: 3.90, victory: 4.50, ybitan: 4.90, hatzi_hinam: 3.50 },
    'פטרוזיליה': { shufersal: 4.90, rami_levy: 3.90, victory: 4.50, ybitan: 4.90, hatzi_hinam: 3.50 },
    'שמיר': { shufersal: 4.90, rami_levy: 3.90, victory: 4.50, ybitan: 4.90, hatzi_hinam: 3.50 },
    'נענע': { shufersal: 4.90, rami_levy: 3.90, victory: 4.50, ybitan: 4.90, hatzi_hinam: 3.50 },
    'בזיליקום': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 6.90, hatzi_hinam: 5.50 },

    // ===== בשר ועוף =====
    'עוף': { shufersal: 32.90, rami_levy: 27.90, victory: 29.90, ybitan: 32.90, hatzi_hinam: 26.90 },
    'עוף שלם': { shufersal: 32.90, rami_levy: 27.90, victory: 29.90, ybitan: 32.90, hatzi_hinam: 26.90 },
    'חזה עוף': { shufersal: 42.90, rami_levy: 37.90, victory: 39.90, ybitan: 42.90, hatzi_hinam: 36.90 },
    'כנפיים': { shufersal: 24.90, rami_levy: 19.90, victory: 22.90, ybitan: 24.90, hatzi_hinam: 19.50 },
    'שוקיים': { shufersal: 28.90, rami_levy: 24.90, victory: 26.90, ybitan: 28.90, hatzi_hinam: 24.50 },
    'ירכיים': { shufersal: 26.90, rami_levy: 22.90, victory: 24.90, ybitan: 26.90, hatzi_hinam: 22.50 },
    'כבד עוף': { shufersal: 29.90, rami_levy: 24.90, victory: 27.90, ybitan: 29.90, hatzi_hinam: 24.50 },
    'עוף טחון': { shufersal: 36.90, rami_levy: 32.90, victory: 34.90, ybitan: 36.90, hatzi_hinam: 32.50 },
    'הודו': { shufersal: 44.90, rami_levy: 39.90, victory: 42.90, ybitan: 44.90, hatzi_hinam: 38.90 },
    'בשר טחון': { shufersal: 54.90, rami_levy: 49.90, victory: 52.90, ybitan: 54.90, hatzi_hinam: 48.90 },
    'בשר בקר': { shufersal: 89.90, rami_levy: 79.90, victory: 84.90, ybitan: 89.90, hatzi_hinam: 78.90 },
    'אנטריקוט': { shufersal: 129.90, rami_levy: 119.90, victory: 124.90, ybitan: 129.90, hatzi_hinam: 118.90 },
    'סטייק': { shufersal: 89.90, rami_levy: 79.90, victory: 84.90, ybitan: 89.90, hatzi_hinam: 78.90 },
    'צלעות': { shufersal: 69.90, rami_levy: 64.90, victory: 67.90, ybitan: 69.90, hatzi_hinam: 63.90 },
    'שניצל': { shufersal: 44.90, rami_levy: 39.90, victory: 42.90, ybitan: 44.90, hatzi_hinam: 38.90 },
    'המבורגר': { shufersal: 49.90, rami_levy: 44.90, victory: 47.90, ybitan: 49.90, hatzi_hinam: 43.90 },
    'קבב': { shufersal: 54.90, rami_levy: 49.90, victory: 52.90, ybitan: 54.90, hatzi_hinam: 48.90 },
    'קציצות': { shufersal: 44.90, rami_levy: 39.90, victory: 42.90, ybitan: 44.90, hatzi_hinam: 38.90 },

    // ===== דגים =====
    'סלמון': { shufersal: 89.90, rami_levy: 79.90, victory: 84.90, ybitan: 89.90, hatzi_hinam: 78.90 },
    'סלמון טרי': { shufersal: 99.90, rami_levy: 89.90, victory: 94.90, ybitan: 99.90, hatzi_hinam: 88.90 },
    'פילה סלמון': { shufersal: 109.90, rami_levy: 99.90, victory: 104.90, ybitan: 109.90, hatzi_hinam: 98.90 },
    'טונה': { shufersal: 12.90, rami_levy: 10.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 10.50 },
    'טונה בשמן': { shufersal: 12.90, rami_levy: 10.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 10.50 },
    'טונה במים': { shufersal: 11.90, rami_levy: 9.90, victory: 10.90, ybitan: 11.90, hatzi_hinam: 9.50 },
    'דג': { shufersal: 49.90, rami_levy: 44.90, victory: 47.90, ybitan: 49.90, hatzi_hinam: 43.90 },
    'דג טרי': { shufersal: 59.90, rami_levy: 54.90, victory: 57.90, ybitan: 59.90, hatzi_hinam: 53.90 },
    'פילה דג': { shufersal: 54.90, rami_levy: 49.90, victory: 52.90, ybitan: 54.90, hatzi_hinam: 48.90 },
    'אמנון': { shufersal: 44.90, rami_levy: 39.90, victory: 42.90, ybitan: 44.90, hatzi_hinam: 38.90 },
    'דניס': { shufersal: 54.90, rami_levy: 49.90, victory: 52.90, ybitan: 54.90, hatzi_hinam: 48.90 },
    'לברק': { shufersal: 64.90, rami_levy: 59.90, victory: 62.90, ybitan: 64.90, hatzi_hinam: 58.90 },
    'שרימפס': { shufersal: 79.90, rami_levy: 74.90, victory: 77.90, ybitan: 79.90, hatzi_hinam: 73.90 },

    // ===== מזון יבש =====
    'אורז': { shufersal: 12.90, rami_levy: 9.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 9.50 },
    'אורז בסמטי': { shufersal: 16.90, rami_levy: 14.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50 },
    'אורז יסמין': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'פסטה': { shufersal: 7.90, rami_levy: 5.90, victory: 6.90, ybitan: 7.90, hatzi_hinam: 5.50 },
    'ספגטי': { shufersal: 7.90, rami_levy: 5.90, victory: 6.90, ybitan: 7.90, hatzi_hinam: 5.50 },
    'פנה': { shufersal: 7.90, rami_levy: 5.90, victory: 6.90, ybitan: 7.90, hatzi_hinam: 5.50 },
    'אטריות': { shufersal: 8.90, rami_levy: 6.90, victory: 7.90, ybitan: 8.90, hatzi_hinam: 6.50 },
    'קוסקוס': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'בורגול': { shufersal: 11.90, rami_levy: 9.90, victory: 10.90, ybitan: 11.90, hatzi_hinam: 9.50 },
    'קינואה': { shufersal: 24.90, rami_levy: 21.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 21.50 },
    'עדשים': { shufersal: 12.90, rami_levy: 10.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 10.50 },
    'חומוס יבש': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'שעועית': { shufersal: 11.90, rami_levy: 9.90, victory: 10.90, ybitan: 11.90, hatzi_hinam: 9.50 },
    'קמח': { shufersal: 8.90, rami_levy: 6.90, victory: 7.90, ybitan: 8.90, hatzi_hinam: 6.50 },
    'קמח לבן': { shufersal: 8.90, rami_levy: 6.90, victory: 7.90, ybitan: 8.90, hatzi_hinam: 6.50 },
    'קמח מלא': { shufersal: 12.90, rami_levy: 10.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 10.50 },
    'סוכר': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'מלח': { shufersal: 4.90, rami_levy: 2.90, victory: 3.90, ybitan: 4.90, hatzi_hinam: 2.50 },
    'שמן': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.50 },
    'שמן חמניות': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.50 },
    'שמן קנולה': { shufersal: 16.90, rami_levy: 14.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50 },
    'שמן זית': { shufersal: 39.90, rami_levy: 34.90, victory: 37.90, ybitan: 39.90, hatzi_hinam: 33.90 },

    // ===== רטבים ותבלינים =====
    'קטשופ': { shufersal: 12.90, rami_levy: 9.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 9.50 },
    'מיונז': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.50 },
    'חרדל': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'חומץ': { shufersal: 7.90, rami_levy: 5.90, victory: 6.90, ybitan: 7.90, hatzi_hinam: 5.50 },
    'חומץ בלסמי': { shufersal: 19.90, rami_levy: 16.90, victory: 18.90, ybitan: 19.90, hatzi_hinam: 16.50 },
    'רוטב סויה': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'רוטב צילי': { shufersal: 12.90, rami_levy: 10.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 10.50 },
    'רוטב עגבניות': { shufersal: 8.90, rami_levy: 6.90, victory: 7.90, ybitan: 8.90, hatzi_hinam: 6.50 },
    'רסק עגבניות': { shufersal: 6.90, rami_levy: 4.90, victory: 5.90, ybitan: 6.90, hatzi_hinam: 4.50 },
    'פלפל שחור': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'כורכום': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'פפריקה': { shufersal: 8.90, rami_levy: 6.90, victory: 7.90, ybitan: 8.90, hatzi_hinam: 6.50 },
    'כמון': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'אורגנו': { shufersal: 8.90, rami_levy: 6.90, victory: 7.90, ybitan: 8.90, hatzi_hinam: 6.50 },
    'קינמון': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'בהרט': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'זעתר': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'סומק': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },

    // ===== ממתקים וחטיפים =====
    'שוקולד': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'שוקולד מריר': { shufersal: 12.90, rami_levy: 10.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 10.50 },
    'שוקולד חלב': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'במבה': { shufersal: 7.90, rami_levy: 5.90, victory: 6.90, ybitan: 7.90, hatzi_hinam: 5.50 },
    'ביסלי': { shufersal: 7.90, rami_levy: 5.90, victory: 6.90, ybitan: 7.90, hatzi_hinam: 5.50 },
    'צ\'יפס': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'פופקורן': { shufersal: 6.90, rami_levy: 4.90, victory: 5.90, ybitan: 6.90, hatzi_hinam: 4.50 },
    'קרקרים': { shufersal: 8.90, rami_levy: 6.90, victory: 7.90, ybitan: 8.90, hatzi_hinam: 6.50 },
    'פרצלים': { shufersal: 7.90, rami_levy: 5.90, victory: 6.90, ybitan: 7.90, hatzi_hinam: 5.50 },
    'אגוזים': { shufersal: 34.90, rami_levy: 29.90, victory: 32.90, ybitan: 34.90, hatzi_hinam: 29.50 },
    'שקדים': { shufersal: 39.90, rami_levy: 34.90, victory: 37.90, ybitan: 39.90, hatzi_hinam: 34.50 },
    'בוטנים': { shufersal: 19.90, rami_levy: 16.90, victory: 18.90, ybitan: 19.90, hatzi_hinam: 16.50 },
    'חלווה': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'דבש': { shufersal: 29.90, rami_levy: 24.90, victory: 27.90, ybitan: 29.90, hatzi_hinam: 24.50 },
    'ריבה': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.50 },
    'ממרח שוקולד': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'נוטלה': { shufersal: 24.90, rami_levy: 21.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 21.50 },
    'חמאת בוטנים': { shufersal: 24.90, rami_levy: 21.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 21.50 },

    // ===== משקאות =====
    'מים': { shufersal: 5.90, rami_levy: 3.90, victory: 4.90, ybitan: 5.90, hatzi_hinam: 3.50 },
    'מים מינרליים': { shufersal: 5.90, rami_levy: 3.90, victory: 4.90, ybitan: 5.90, hatzi_hinam: 3.50 },
    'מי עדן': { shufersal: 5.90, rami_levy: 3.90, victory: 4.90, ybitan: 5.90, hatzi_hinam: 3.50 },
    'קולה': { shufersal: 8.90, rami_levy: 6.90, victory: 7.90, ybitan: 8.90, hatzi_hinam: 6.50 },
    'קוקה קולה': { shufersal: 8.90, rami_levy: 6.90, victory: 7.90, ybitan: 8.90, hatzi_hinam: 6.50 },
    'פפסי': { shufersal: 8.90, rami_levy: 6.90, victory: 7.90, ybitan: 8.90, hatzi_hinam: 6.50 },
    'ספרייט': { shufersal: 8.90, rami_levy: 6.90, victory: 7.90, ybitan: 8.90, hatzi_hinam: 6.50 },
    'פאנטה': { shufersal: 8.90, rami_levy: 6.90, victory: 7.90, ybitan: 8.90, hatzi_hinam: 6.50 },
    'שוופס': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'סודה': { shufersal: 4.90, rami_levy: 3.90, victory: 4.50, ybitan: 4.90, hatzi_hinam: 3.50 },
    'מיץ': { shufersal: 12.90, rami_levy: 9.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 9.50 },
    'מיץ תפוזים': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.50 },
    'מיץ תפוחים': { shufersal: 12.90, rami_levy: 9.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 9.50 },
    'בירה': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'יין': { shufersal: 39.90, rami_levy: 34.90, victory: 37.90, ybitan: 39.90, hatzi_hinam: 33.90 },
    'יין אדום': { shufersal: 39.90, rami_levy: 34.90, victory: 37.90, ybitan: 39.90, hatzi_hinam: 33.90 },
    'יין לבן': { shufersal: 39.90, rami_levy: 34.90, victory: 37.90, ybitan: 39.90, hatzi_hinam: 33.90 },
    'קפה': { shufersal: 24.90, rami_levy: 19.90, victory: 22.90, ybitan: 24.90, hatzi_hinam: 19.50 },
    'קפה טורקי': { shufersal: 19.90, rami_levy: 16.90, victory: 18.90, ybitan: 19.90, hatzi_hinam: 16.50 },
    'נס קפה': { shufersal: 24.90, rami_levy: 21.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 21.50 },
    'תה': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.50 },

    // ===== מוצרי ניקיון =====
    'סבון': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'סבון ידיים': { shufersal: 12.90, rami_levy: 9.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 9.50 },
    'סבון כלים': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'שמפו': { shufersal: 19.90, rami_levy: 14.90, victory: 17.90, ybitan: 19.90, hatzi_hinam: 14.50 },
    'מרכך': { shufersal: 19.90, rami_levy: 14.90, victory: 17.90, ybitan: 19.90, hatzi_hinam: 14.50 },
    'סבון גוף': { shufersal: 19.90, rami_levy: 14.90, victory: 17.90, ybitan: 19.90, hatzi_hinam: 14.50 },
    'משחת שיניים': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.50 },
    'מברשת שיניים': { shufersal: 12.90, rami_levy: 9.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 9.50 },
    'נייר טואלט': { shufersal: 34.90, rami_levy: 29.90, victory: 32.90, ybitan: 34.90, hatzi_hinam: 28.90 },
    'מגבונים': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.50 },
    'טישו': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'אבקת כביסה': { shufersal: 39.90, rami_levy: 34.90, victory: 37.90, ybitan: 39.90, hatzi_hinam: 33.90 },
    'מרכך כביסה': { shufersal: 24.90, rami_levy: 21.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 21.50 },
    'נוזל כלים': { shufersal: 12.90, rami_levy: 9.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 9.50 },
    'אקונומיקה': { shufersal: 9.90, rami_levy: 6.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 6.50 },
    'מסיר שומנים': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.50 },
    'מטליות': { shufersal: 12.90, rami_levy: 9.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 9.50 },
    'שקיות אשפה': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.50 },
    'נייר סופג': { shufersal: 16.90, rami_levy: 13.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 13.50 },
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

    // 3. Starts with match (e.g., "סלט" matches "סלט טורקי")
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
    const chainBaskets = {};
    let total = 0;
    let singleChainTotal = Infinity;
    let cheapestSingleChain = '';

    const singleChainTotals = {};
    for (const chainId of Object.keys(CHAINS)) {
        singleChainTotals[chainId] = 0;
    }

    for (const item of items) {
        const product = findProduct(item.name);
        if (product) {
            const quantity = item.quantity || 1;
            for (const [chainId, price] of Object.entries(product.prices)) {
                singleChainTotals[chainId] += price * quantity;
            }
        }
    }

    for (const [chainId, chainTotal] of Object.entries(singleChainTotals)) {
        if (chainTotal < singleChainTotal && chainTotal > 0) {
            singleChainTotal = chainTotal;
            cheapestSingleChain = chainId;
        }
    }

    if (strategy === 'single') {
        const chainId = cheapestSingleChain;
        const basket = { items: [], subtotal: 0, item_count: 0 };

        for (const item of items) {
            const product = findProduct(item.name);
            if (product && product.prices[chainId]) {
                const quantity = item.quantity || 1;
                const price = product.prices[chainId];
                basket.items.push({ name: item.name, quantity, price, total: price * quantity });
                basket.subtotal += price * quantity;
                basket.item_count++;
            }
        }

        return {
            strategy: 'single',
            total_price: Math.round(basket.subtotal * 100) / 100,
            total_savings: 0,
            savings_percentage: 0,
            shopping_plan: [{
                chain_id: chainId,
                chain_name: CHAINS[chainId]?.name,
                chain_name_he: CHAINS[chainId]?.name,
                ...basket,
                subtotal: Math.round(basket.subtotal * 100) / 100
            }],
            single_chain_comparison: {
                cheapest: CHAINS[chainId]?.name,
                total: Math.round(singleChainTotal * 100) / 100
            }
        };
    }

    for (const item of items) {
        const product = findProduct(item.name);
        if (product) {
            const quantity = item.quantity || 1;
            let cheapestChain = null;
            let cheapestPrice = Infinity;

            for (const [chainId, price] of Object.entries(product.prices)) {
                if (price < cheapestPrice) {
                    cheapestPrice = price;
                    cheapestChain = chainId;
                }
            }

            if (cheapestChain) {
                if (!chainBaskets[cheapestChain]) {
                    chainBaskets[cheapestChain] = {
                        chain_id: cheapestChain,
                        chain_name: CHAINS[cheapestChain].name,
                        chain_name_he: CHAINS[cheapestChain].name,
                        items: [],
                        subtotal: 0,
                        item_count: 0
                    };
                }

                const itemTotal = cheapestPrice * quantity;
                chainBaskets[cheapestChain].items.push({ name: item.name, quantity, price: cheapestPrice, total: itemTotal });
                chainBaskets[cheapestChain].subtotal += itemTotal;
                chainBaskets[cheapestChain].item_count++;
                total += itemTotal;
            }
        }
    }

    let shoppingPlan = Object.values(chainBaskets)
        .map(b => ({ ...b, subtotal: Math.round(b.subtotal * 100) / 100 }))
        .sort((a, b) => b.subtotal - a.subtotal);

    if (strategy === 'optimal' && shoppingPlan.length > maxChains) {
        const keptChains = shoppingPlan.slice(0, maxChains);
        const removedChains = shoppingPlan.slice(maxChains);

        for (const removed of removedChains) {
            keptChains[0].items.push(...removed.items);
            keptChains[0].subtotal += removed.subtotal;
            keptChains[0].item_count += removed.item_count;
        }

        shoppingPlan = keptChains;
        total = shoppingPlan.reduce((sum, c) => sum + c.subtotal, 0);
    }

    const savings = Math.round((singleChainTotal - total) * 100) / 100;
    const savingsPercent = singleChainTotal > 0 ? Math.round((savings / singleChainTotal) * 10000) / 100 : 0;

    return {
        strategy,
        total_price: Math.round(total * 100) / 100,
        total_savings: Math.max(0, savings),
        savings_percentage: Math.max(0, savingsPercent),
        shopping_plan: shoppingPlan,
        single_chain_comparison: {
            cheapest: CHAINS[cheapestSingleChain]?.name || 'לא נמצא',
            total: Math.round(singleChainTotal * 100) / 100
        }
    };
}

// API Handler
export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { action } = req.query;

    try {
        if (action === 'health') {
            return res.status(200).json({ status: 'healthy', service: 'ListNest Price Comparison', products: Object.keys(PRICE_DATABASE).length });
        }

        if (action === 'compare' && req.method === 'POST') {
            const { items } = req.body;
            if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'Items array required' });
            return res.status(200).json(compareList(items));
        }

        if (action === 'optimize' && req.method === 'POST') {
            const { items, max_chains = 2, strategy = 'optimal' } = req.body;
            if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'Items array required' });
            return res.status(200).json(optimizeBasket(items, max_chains, strategy));
        }

        if (action === 'search') {
            const query = req.query.q || '';
            const product = findProduct(query);
            if (product) {
                const prices = Object.entries(product.prices)
                    .map(([chainId, price]) => ({
                        chain_id: chainId,
                        chain_name_he: CHAINS[chainId].name,
                        price,
                        url: CHAINS[chainId].url + encodeURIComponent(query)
                    }))
                    .sort((a, b) => a.price - b.price);
                return res.status(200).json({ product: { name: product.name }, prices, cheapest: prices[0] || null });
            }
            return res.status(404).json({ error: 'Product not found', query });
        }

        if (action === 'chains') {
            return res.status(200).json(Object.entries(CHAINS).map(([id, data]) => ({ id, name: data.name, name_he: data.name, color: data.color })));
        }

        return res.status(200).json({
            name: 'ListNest Price Comparison API',
            version: '2.0.0',
            products: Object.keys(PRICE_DATABASE).length,
            endpoints: { health: '?action=health', chains: '?action=chains', search: '?action=search&q=<product>', compare: 'POST ?action=compare', optimize: 'POST ?action=optimize' }
        });
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
