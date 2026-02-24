// ListNest Price Comparison API - Vercel Serverless
// Complete Israeli product price database with ALL products (7 chains)
// Prices varied realistically - each chain wins on different products
// רמי לוי - זול בבשר וירקות | שופרסל - זול במותג פרטי ומוצרי חלב
// חצי חינם - זול בחטיפים ומשקאות | ויקטורי - זול בפירות ומאפים
// יינות ביתן - זול ביינות ואלכוהול | קארפור - זול במוצרים מיובאים
// יוחננוף - מחירים תחרותיים בפירות וירקות

// Hebrew synonym dictionary for better product matching
const HEBREW_SYNONYMS = {
    'קולה': ['קוקה קולה', 'coca cola', 'קוקה'],
    'קוקה קולה': ['קולה', 'קוקה'],
    'פפסי': ['pepsi'],
    'חלב': ['חלב טרי'],
    'יוגורט': ['לבן'],
    'גבינה צהובה': ['עמק', 'גאודה'],
    'קוטג': ['קוטג\'', 'cottage'],
    'מטרנה': ['materna'],
    'סימילאק': ['similac'],
    'נוטרילון': ['nutrilon'],
    'חיתולים': ['חיתול', 'טיטולים'],
    'אבקת מרק עוף': ['מרק עוף', 'אבקת מרק עוף פרווה', 'אבקת מרק בטעם עוף'],
    'אבקת מרק פטריות': ['מרק פטריות'],
    'אבקת מרק בצל': ['מרק בצל'],
    'אבקת מרק ירקות': ['מרק ירקות'],
    'אבקת מרק בקר': ['מרק בקר'],
};

// Get all synonyms for a word
function getSynonyms(word) {
    const wordLower = word.toLowerCase();
    const synonyms = [wordLower];
    for (const [key, values] of Object.entries(HEBREW_SYNONYMS)) {
        if (key.toLowerCase() === wordLower || values.some(v => v.toLowerCase() === wordLower)) {
            synonyms.push(key.toLowerCase());
            values.forEach(v => synonyms.push(v.toLowerCase()));
        }
    }
    return [...new Set(synonyms)];
}

const PRICE_DATABASE = {
    // ===== חלב ומוצרי חלב (מחירים מפוקחים לקרטון) =====
    // חלב בקרטון - מחיר מפוקח 7.28 ש"ח
    'חלב 3% קרטון 1 ליטר': { shufersal: 7.28, rami_levy: 7.28, victory: 7.28, ybitan: 7.28, hatzi_hinam: 7.28, carrefour: 7.28, yochananof: 7.28 },
    'חלב 1% קרטון 1 ליטר': { shufersal: 7.28, rami_levy: 7.28, victory: 7.28, ybitan: 7.28, hatzi_hinam: 7.28, carrefour: 7.28, yochananof: 7.28 },
    'חלב 3% 1 ליטר': { shufersal: 7.28, rami_levy: 7.28, victory: 7.28, ybitan: 7.28, hatzi_hinam: 7.28, carrefour: 7.28, yochananof: 7.28 },
    'חלב 1% 1 ליטר': { shufersal: 7.28, rami_levy: 7.28, victory: 7.28, ybitan: 7.28, hatzi_hinam: 7.28, carrefour: 7.28, yochananof: 7.28 },
    // חלב בשקית - זול יותר
    'חלב 3% שקית 1 ליטר': { shufersal: 6.50, rami_levy: 6.40, victory: 6.60, ybitan: 6.70, hatzi_hinam: 6.45, carrefour: 6.55, yochananof: 6.51 },
    'חלב 1% שקית 1 ליטר': { shufersal: 6.40, rami_levy: 6.30, victory: 6.50, ybitan: 6.60, hatzi_hinam: 6.35, carrefour: 6.45, yochananof: 6.48 },
    'חלב דל שומן 1 ליטר': { shufersal: 7.28, rami_levy: 7.28, victory: 7.28, ybitan: 7.28, hatzi_hinam: 7.28, carrefour: 7.28, yochananof: 7.28 },
    'חלב 3% 0.5 ליטר': { shufersal: 4.90, rami_levy: 4.85, victory: 4.95, ybitan: 5.00, hatzi_hinam: 4.90, carrefour: 4.90, yochananof: 4.73 },
    'חלב 1% 0.5 ליטר': { shufersal: 4.80, rami_levy: 4.75, victory: 4.85, ybitan: 4.90, hatzi_hinam: 4.80, carrefour: 4.80, yochananof: 4.68 },
    'חלב סויה 1 ליטר': { shufersal: 11.90, rami_levy: 12.50, victory: 12.90, ybitan: 13.50, hatzi_hinam: 12.20, carrefour: 13.10, yochananof: 12.08 },
    'חלב שקדים 1 ליטר': { shufersal: 13.90, rami_levy: 14.50, victory: 14.90, ybitan: 15.50, hatzi_hinam: 14.20, carrefour: 12.50, yochananof: 14.20 },
    'חלב קוקוס 1 ליטר': { shufersal: 13.90, rami_levy: 14.50, victory: 14.90, ybitan: 15.50, hatzi_hinam: 14.20, carrefour: 13.50, yochananof: 14.34 },
    'חלב שיבולת שועל 1 ליטר': { shufersal: 12.90, rami_levy: 13.50, victory: 13.90, ybitan: 14.50, hatzi_hinam: 13.20, carrefour: 14.10, yochananof: 13.46 },
    // לבן ויוגורט
    'לבן 500 גרם': { shufersal: 5.50, rami_levy: 5.90, victory: 6.20, ybitan: 6.50, hatzi_hinam: 5.80, carrefour: 5.10, yochananof: 5.87 },
    'לבן 200 גרם': { shufersal: 3.20, rami_levy: 3.50, victory: 3.70, ybitan: 3.90, hatzi_hinam: 3.40, carrefour: 3.10, yochananof: 3.25 },
    'לבן עז 500 גרם': { shufersal: 8.50, rami_levy: 8.90, victory: 9.20, ybitan: 9.50, hatzi_hinam: 8.80, carrefour: 8.50, yochananof: 8.53 },
    'יוגורט 150 גרם': { shufersal: 5.50, rami_levy: 5.90, victory: 6.20, ybitan: 6.50, hatzi_hinam: 5.80, carrefour: 5.50, yochananof: 5.64 },
    'יוגורט יווני 150 גרם': { shufersal: 8.50, rami_levy: 8.90, victory: 9.20, ybitan: 9.50, hatzi_hinam: 8.80, carrefour: 8.50, yochananof: 8.70 },
    'יוגורט יווני 0% 150 גרם': { shufersal: 9.50, rami_levy: 9.90, victory: 10.20, ybitan: 10.50, hatzi_hinam: 9.80, carrefour: 10.10, yochananof: 9.80 },
    'יוגורט תנובה 150 גרם': { shufersal: 5.50, rami_levy: 5.90, victory: 6.20, ybitan: 6.50, hatzi_hinam: 5.80, carrefour: 6.10, yochananof: 5.81 },
    'יוגורט אקטיביה 150 גרם': { shufersal: 7.50, rami_levy: 7.90, victory: 8.20, ybitan: 8.50, hatzi_hinam: 7.80, carrefour: 7.90, yochananof: 7.93 },
    'יוגורט 500 גרם': { shufersal: 12.50, rami_levy: 12.90, victory: 13.20, ybitan: 13.50, hatzi_hinam: 12.80, carrefour: 13.90, yochananof: 12.32 },
    'יוגורט יווני 500 גרם': { shufersal: 18.50, rami_levy: 18.90, victory: 19.20, ybitan: 19.50, hatzi_hinam: 18.80, carrefour: 18.50, yochananof: 18.33 },
    // גבינות צהובות
    'גבינה צהובה עמק 200 גרם': { shufersal: 31.90, rami_levy: 33.90, victory: 34.90, ybitan: 35.90, hatzi_hinam: 32.90, carrefour: 35.10, yochananof: 32.57 },
    'גבינה צהובה עמק 400 גרם': { shufersal: 58.90, rami_levy: 61.90, victory: 63.90, ybitan: 65.90, hatzi_hinam: 59.90, carrefour: 61.90, yochananof: 60.40 },
    'גבינה צהובה גלבוע 200 גרם': { shufersal: 27.90, rami_levy: 29.90, victory: 30.90, ybitan: 31.90, hatzi_hinam: 28.90, carrefour: 28.50, yochananof: 29.19 },
    'גבינה צהובה 9% 200 גרם': { shufersal: 23.90, rami_levy: 25.90, victory: 26.90, ybitan: 27.90, hatzi_hinam: 24.90, carrefour: 24.90, yochananof: 25.40 },
    'גבינה צהובה 22% 200 גרם': { shufersal: 27.90, rami_levy: 29.90, victory: 30.90, ybitan: 31.90, hatzi_hinam: 28.90, carrefour: 28.10, yochananof: 29.77 },
    // קוטג וגבינה לבנה
    'קוטג׳ 5% 250 גרם': { shufersal: 6.70, rami_levy: 6.50, victory: 7.20, ybitan: 7.50, hatzi_hinam: 6.90, carrefour: 6.90, yochananof: 6.40 },
    'קוטג׳ 3% 250 גרם': { shufersal: 6.40, rami_levy: 6.20, victory: 6.90, ybitan: 7.20, hatzi_hinam: 6.60, carrefour: 6.60, yochananof: 6.10 },
    'גבינה לבנה 5% 250 גרם': { shufersal: 5.90, rami_levy: 6.20, victory: 6.50, ybitan: 6.90, hatzi_hinam: 6.10, carrefour: 5.90, yochananof: 5.80 },
    'גבינה לבנה 9% 250 גרם': { shufersal: 7.50, rami_levy: 7.90, victory: 8.20, ybitan: 8.50, hatzi_hinam: 7.80, carrefour: 7.50, yochananof: 7.40 },
    // גבינות מיוחדות
    'גבינה בולגרית 200 גרם': { shufersal: 18.50, rami_levy: 19.50, victory: 20.50, ybitan: 21.50, hatzi_hinam: 19.00, carrefour: 19.10, yochananof: 19.19 },
    'צפתית 200 גרם': { shufersal: 22.50, rami_levy: 23.50, victory: 24.50, ybitan: 25.50, hatzi_hinam: 23.00, carrefour: 24.10, yochananof: 23.46 },
    'גבינת שמנת 200 גרם': { shufersal: 12.50, rami_levy: 13.50, victory: 14.50, ybitan: 15.50, hatzi_hinam: 13.00, carrefour: 12.90, yochananof: 13.39 },
    'מוצרלה 200 גרם': { shufersal: 19.50, rami_levy: 20.50, victory: 21.50, ybitan: 22.50, hatzi_hinam: 20.00, carrefour: 21.90, yochananof: 19.40 },
    'מוצרלה 400 גרם': { shufersal: 36.50, rami_levy: 38.50, victory: 39.50, ybitan: 40.50, hatzi_hinam: 37.50, carrefour: 37.10, yochananof: 36.75 },
    'פרמזן 150 גרם': { shufersal: 42.50, rami_levy: 44.50, victory: 45.50, ybitan: 46.50, hatzi_hinam: 43.50, carrefour: 43.90, yochananof: 43.07 },
    'גאודה 200 גרם': { shufersal: 34.50, rami_levy: 36.50, victory: 37.50, ybitan: 38.50, hatzi_hinam: 35.50, carrefour: 33.50, yochananof: 35.50 },
    'אמנטל 200 גרם': { shufersal: 38.50, rami_levy: 40.50, victory: 41.50, ybitan: 42.50, hatzi_hinam: 39.50, carrefour: 42.50, yochananof: 39.90 },
    'ברי 125 גרם': { shufersal: 32.50, rami_levy: 34.50, victory: 35.50, ybitan: 36.50, hatzi_hinam: 33.50, carrefour: 31.50, yochananof: 34.17 },
    'קממבר 125 גרם': { shufersal: 28.50, rami_levy: 30.50, victory: 31.50, ybitan: 32.50, hatzi_hinam: 29.50, carrefour: 32.10, yochananof: 30.39 },
    'חלומי 200 גרם': { shufersal: 36.50, rami_levy: 38.50, victory: 39.50, ybitan: 40.50, hatzi_hinam: 37.50, carrefour: 39.50, yochananof: 36.38 },
    'פילדלפיה 200 גרם': { shufersal: 16.50, rami_levy: 17.50, victory: 18.50, ybitan: 19.50, hatzi_hinam: 17.00, carrefour: 15.90, yochananof: 16.66 },
    'לאבנה 200 גרם': { shufersal: 12.50, rami_levy: 13.50, victory: 14.50, ybitan: 15.50, hatzi_hinam: 13.00, carrefour: 12.50, yochananof: 12.87 },
    'ריקוטה 250 גרם': { shufersal: 22.50, rami_levy: 23.50, victory: 24.50, ybitan: 25.50, hatzi_hinam: 23.00, carrefour: 24.50, yochananof: 23.00 },
    'גבינת עזים 150 גרם': { shufersal: 28.50, rami_levy: 30.50, victory: 31.50, ybitan: 32.50, hatzi_hinam: 29.50, carrefour: 31.10, yochananof: 29.80 },
    'קשקבל 100 גרם': { shufersal: 11.50, rami_levy: 12.50, victory: 13.50, ybitan: 14.50, hatzi_hinam: 12.00, carrefour: 12.50, yochananof: 12.24 },
    'מסקרפונה 250 גרם': { shufersal: 9.50, rami_levy: 10.50, victory: 11.50, ybitan: 12.50, hatzi_hinam: 10.00, carrefour: 8.50, yochananof: 10.30 },
    // ביצים
    'ביצים L 12 יח׳': { shufersal: 13.97, rami_levy: 13.50, victory: 13.97, ybitan: 13.97, hatzi_hinam: 13.90, carrefour: 13.97, yochananof: 13.50 },
    'ביצים XL 12 יח׳': { shufersal: 15.19, rami_levy: 14.90, victory: 15.19, ybitan: 15.19, hatzi_hinam: 15.10, carrefour: 15.19, yochananof: 14.90 },
    'ביצים אורגניות 12 יח׳': { shufersal: 29.90, rami_levy: 27.90, victory: 30.90, ybitan: 32.90, hatzi_hinam: 29.50, carrefour: 28.90, yochananof: 27.50 },
    'ביצים חופשיות 12 יח׳': { shufersal: 24.90, rami_levy: 22.90, victory: 25.90, ybitan: 27.90, hatzi_hinam: 24.50, carrefour: 23.90, yochananof: 22.50 },
    'ביצים L 6 יח׳': { shufersal: 7.90, rami_levy: 7.50, victory: 7.90, ybitan: 7.90, hatzi_hinam: 7.80, carrefour: 7.90, yochananof: 7.50 },
    'ביצים XL 6 יח׳': { shufersal: 8.90, rami_levy: 8.50, victory: 8.90, ybitan: 8.90, hatzi_hinam: 8.80, carrefour: 8.90, yochananof: 8.50 },
    // חמאה ושמנת
    'חמאה 200 גרם': { shufersal: 10.90, rami_levy: 10.50, victory: 11.50, ybitan: 12.50, hatzi_hinam: 10.90, carrefour: 11.50, yochananof: 10.70 },
    'חמאה מלוחה 200 גרם': { shufersal: 11.90, rami_levy: 11.50, victory: 12.50, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 12.50, yochananof: 11.70 },
    'שמנת מתוקה 200 מ"ל': { shufersal: 9.50, rami_levy: 10.50, victory: 11.50, ybitan: 12.50, hatzi_hinam: 10.00, carrefour: 8.50, yochananof: 9.80 },
    'שמנת מתוקה 500 מ"ל': { shufersal: 18.50, rami_levy: 19.50, victory: 20.50, ybitan: 21.50, hatzi_hinam: 19.00, carrefour: 19.50, yochananof: 18.81 },
    'שמנת חמוצה 200 גרם': { shufersal: 7.50, rami_levy: 8.50, victory: 9.50, ybitan: 10.50, hatzi_hinam: 8.00, carrefour: 8.10, yochananof: 8.00 },
    'שמנת לקצפת 500 מ"ל': { shufersal: 11.50, rami_levy: 12.50, victory: 13.50, ybitan: 14.50, hatzi_hinam: 12.00, carrefour: 10.90, yochananof: 12.12 },
    'מרגרינה 250 גרם': { shufersal: 9.50, rami_levy: 10.50, victory: 11.50, ybitan: 12.50, hatzi_hinam: 10.00, carrefour: 8.50, yochananof: 10.20 },
    'טופו 300 גרם': { shufersal: 18.50, rami_levy: 19.50, victory: 20.50, ybitan: 21.50, hatzi_hinam: 19.00, carrefour: 17.50, yochananof: 19.57 },

    // ===== ממרחים (spreads) =====
    'נוטלה 350 גרם': { shufersal: 24.90, rami_levy: 23.90, victory: 25.90, ybitan: 26.90, hatzi_hinam: 22.90, carrefour: 23.50, yochananof: 23.67 },
    'נוטלה 750 גרם': { shufersal: 44.90, rami_levy: 42.90, victory: 45.90, ybitan: 47.90, hatzi_hinam: 41.90, carrefour: 41.90, yochananof: 43.02 },
    'ממרח שוקולד השחר העולה 400 גרם': { shufersal: 18.90, rami_levy: 17.90, victory: 19.90, ybitan: 20.90, hatzi_hinam: 16.90, carrefour: 15.90, yochananof: 18.22 },
    'ממרח שוקולד עלית 400 גרם': { shufersal: 19.90, rami_levy: 18.90, victory: 20.90, ybitan: 21.90, hatzi_hinam: 17.90, carrefour: 18.50, yochananof: 19.40 },
    'ממרח אגוזים 350 גרם': { shufersal: 22.90, rami_levy: 21.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 20.90, carrefour: 20.90, yochananof: 22.62 },
    'ממרח לוטוס 400 גרם': { shufersal: 26.90, rami_levy: 24.90, victory: 27.90, ybitan: 28.90, hatzi_hinam: 22.10, carrefour: 23.90, yochananof: 26.42 },
    'ממרח לוטוס': { shufersal: 26.90, rami_levy: 24.90, victory: 27.90, ybitan: 28.90, hatzi_hinam: 22.10, carrefour: 19.90, yochananof: 26.68 },
    'לוטוס': { shufersal: 26.90, rami_levy: 24.90, victory: 27.90, ybitan: 28.90, hatzi_hinam: 22.10, carrefour: 20.50, yochananof: 25.12 },
    'עוגיות לוטוס': { shufersal: 12.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 10.90, carrefour: 11.50, yochananof: 12.15 },
    // חמאות אגוזים
    'חמאת בוטנים חלקה 350 גרם': { shufersal: 24.90, rami_levy: 23.90, victory: 25.90, ybitan: 26.90, hatzi_hinam: 22.90, carrefour: 23.50, yochananof: 24.16 },
    'חמאת בוטנים קראנצ\'י 350 גרם': { shufersal: 24.90, rami_levy: 23.90, victory: 25.90, ybitan: 26.90, hatzi_hinam: 22.90, carrefour: 22.50, yochananof: 24.40 },
    'חמאת בוטנים סקיפי 350 גרם': { shufersal: 28.90, rami_levy: 27.90, victory: 29.90, ybitan: 30.90, hatzi_hinam: 26.90, carrefour: 26.50, yochananof: 28.68 },
    'חמאת שקדים 200 גרם': { shufersal: 32.90, rami_levy: 31.90, victory: 33.90, ybitan: 34.90, hatzi_hinam: 30.90, carrefour: 33.50, yochananof: 33.05 },
    'חמאת קשיו 200 גרם': { shufersal: 34.90, rami_levy: 33.90, victory: 35.90, ybitan: 36.90, hatzi_hinam: 32.90, carrefour: 35.10, yochananof: 35.43 },
    'חמאת אגוזי לוז 200 גרם': { shufersal: 36.90, rami_levy: 35.90, victory: 37.90, ybitan: 38.90, hatzi_hinam: 34.90, carrefour: 31.50, yochananof: 35.31 },
    // טחינה
    'טחינה 250 גרם': { shufersal: 16.90, rami_levy: 14.90, victory: 17.90, ybitan: 18.90, hatzi_hinam: 15.90, carrefour: 16.50, yochananof: 15.58 },
    'טחינה 500 גרם': { shufersal: 24.90, rami_levy: 22.90, victory: 25.90, ybitan: 26.90, hatzi_hinam: 23.90, carrefour: 22.90, yochananof: 23.66 },
    'טחינה גולמית 250 גרם': { shufersal: 19.90, rami_levy: 17.90, victory: 20.90, ybitan: 21.90, hatzi_hinam: 18.90, carrefour: 16.90, yochananof: 18.90 },
    'טחינה גולמית 500 גרם': { shufersal: 32.90, rami_levy: 29.90, victory: 33.90, ybitan: 34.90, hatzi_hinam: 30.90, carrefour: 33.10, yochananof: 31.71 },
    'טחינה אל ארז 500 גרם': { shufersal: 26.90, rami_levy: 24.90, victory: 27.90, ybitan: 28.90, hatzi_hinam: 25.90, carrefour: 26.90, yochananof: 26.42 },
    'טחינה הבאבא 500 גרם': { shufersal: 24.90, rami_levy: 22.90, victory: 25.90, ybitan: 26.90, hatzi_hinam: 23.90, carrefour: 25.50, yochananof: 24.62 },
    // חלווה
    'חלווה 400 גרם': { shufersal: 18.90, rami_levy: 16.90, victory: 19.90, ybitan: 20.90, hatzi_hinam: 17.90, carrefour: 19.10, yochananof: 17.36 },
    'חלווה פרוסות 250 גרם': { shufersal: 14.90, rami_levy: 13.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50, carrefour: 13.50, yochananof: 14.11 },
    'חלווה שוקולד 400 גרם': { shufersal: 19.90, rami_levy: 17.90, victory: 20.90, ybitan: 21.90, hatzi_hinam: 18.90, carrefour: 20.10, yochananof: 18.71 },
    'חלווה פיסטוק 400 גרם': { shufersal: 22.90, rami_levy: 20.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 21.90, carrefour: 23.90, yochananof: 21.90 },
    // ריבות
    'ריבה תות 350 גרם': { shufersal: 14.90, rami_levy: 13.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50, carrefour: 15.50, yochananof: 14.54 },
    'ריבה משמש 350 גרם': { shufersal: 14.90, rami_levy: 13.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50, carrefour: 14.50, yochananof: 14.69 },
    'ריבה דובדבן 350 גרם': { shufersal: 14.90, rami_levy: 13.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50, carrefour: 13.50, yochananof: 14.83 },
    'ריבה תפוז 350 גרם': { shufersal: 14.90, rami_levy: 13.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50, carrefour: 15.50, yochananof: 13.97 },
    'ריבה פטל 350 גרם': { shufersal: 16.90, rami_levy: 15.90, victory: 17.90, ybitan: 18.90, hatzi_hinam: 16.50, carrefour: 17.90, yochananof: 16.07 },
    'ריבה ללא סוכר 350 גרם': { shufersal: 18.90, rami_levy: 17.90, victory: 19.90, ybitan: 20.90, hatzi_hinam: 18.50, carrefour: 15.90, yochananof: 18.22 },
    'מרמלדה 350 גרם': { shufersal: 12.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50, carrefour: 13.50, yochananof: 12.40 },
    // דבש וסילאן
    'דבש טהור 350 גרם': { shufersal: 29.90, rami_levy: 27.90, victory: 30.90, ybitan: 31.90, hatzi_hinam: 28.90, carrefour: 31.90, yochananof: 29.19 },
    'דבש טהור 700 גרם': { shufersal: 49.90, rami_levy: 46.90, victory: 51.90, ybitan: 53.90, hatzi_hinam: 47.90, carrefour: 51.90, yochananof: 49.37 },
    'דבש פרחים 350 גרם': { shufersal: 32.90, rami_levy: 30.90, victory: 33.90, ybitan: 34.90, hatzi_hinam: 31.90, carrefour: 34.10, yochananof: 32.86 },
    'דבש אורגני 350 גרם': { shufersal: 39.90, rami_levy: 37.90, victory: 41.90, ybitan: 43.90, hatzi_hinam: 38.90, carrefour: 35.50, yochananof: 37.73 },
    'סילאן טהור 350 גרם': { shufersal: 22.90, rami_levy: 20.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 21.90, carrefour: 22.50, yochananof: 21.46 },
    'סילאן טהור 700 גרם': { shufersal: 39.90, rami_levy: 36.90, victory: 41.90, ybitan: 43.90, hatzi_hinam: 37.90, carrefour: 38.10, yochananof: 38.02 },
    // ממרחים מלוחים
    'ממרח שום 200 גרם': { shufersal: 12.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50, carrefour: 12.90, yochananof: 12.40 },
    'ממרח זיתים 200 גרם': { shufersal: 14.90, rami_levy: 13.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50, carrefour: 12.50, yochananof: 14.54 },
    'ממרח עגבניות מיובשות 200 גרם': { shufersal: 16.90, rami_levy: 15.90, victory: 17.90, ybitan: 18.90, hatzi_hinam: 16.50, carrefour: 17.10, yochananof: 16.73 },
    'ממרח ארטישוק 200 גרם': { shufersal: 18.90, rami_levy: 17.90, victory: 19.90, ybitan: 20.90, hatzi_hinam: 18.50, carrefour: 19.10, yochananof: 18.95 },
    'פסטו ירוק 190 גרם': { shufersal: 19.90, rami_levy: 18.90, victory: 20.90, ybitan: 21.90, hatzi_hinam: 19.50, carrefour: 18.90, yochananof: 18.82 },
    'פסטו אדום 190 גרם': { shufersal: 19.90, rami_levy: 18.90, victory: 20.90, ybitan: 21.90, hatzi_hinam: 19.50, carrefour: 19.50, yochananof: 19.01 },
    'ממרח חציל 200 גרם': { shufersal: 12.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50, carrefour: 13.10, yochananof: 12.28 },
    'חומוס ממרח 400 גרם': { shufersal: 12.90, rami_levy: 10.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.90, carrefour: 11.50, yochananof: 11.90 },

    // ===== פירות וירקות (רמי לוי וויקטורי זולים) =====
    'עגבניות': { shufersal: 9.90, rami_levy: 6.90, victory: 7.50, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 8.50, yochananof: 6.76 },
    'עגבניות שרי': { shufersal: 14.90, rami_levy: 11.90, victory: 12.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 12.50, yochananof: 11.66 },
    'עגבניות מגי': { shufersal: 16.90, rami_levy: 13.90, victory: 14.50, ybitan: 17.50, hatzi_hinam: 15.90, carrefour: 15.90, yochananof: 13.62 },
    'מלפפונים': { shufersal: 7.90, rami_levy: 4.90, victory: 5.50, ybitan: 8.50, hatzi_hinam: 6.90, carrefour: 6.10, yochananof: 4.80 },
    'מלפפון בייבי': { shufersal: 10.90, rami_levy: 7.90, victory: 8.50, ybitan: 11.50, hatzi_hinam: 9.90, carrefour: 8.50, yochananof: 7.74 },
    'בצל': { shufersal: 6.90, rami_levy: 3.90, victory: 4.50, ybitan: 7.50, hatzi_hinam: 5.90, carrefour: 6.10, yochananof: 3.82 },
    'בצל סגול': { shufersal: 8.90, rami_levy: 5.90, victory: 6.50, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 7.10, yochananof: 5.78 },
    'בצל ירוק': { shufersal: 5.90, rami_levy: 3.90, victory: 4.50, ybitan: 6.50, hatzi_hinam: 4.90, carrefour: 5.10, yochananof: 3.82 },
    'שום': { shufersal: 12.90, rami_levy: 9.90, victory: 10.50, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 12.90, yochananof: 9.70 },
    'שום קלוף': { shufersal: 16.90, rami_levy: 13.90, victory: 14.50, ybitan: 17.50, hatzi_hinam: 15.90, carrefour: 13.50, yochananof: 13.62 },
    'פלפל אדום': { shufersal: 14.90, rami_levy: 10.90, victory: 11.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 12.10, yochananof: 10.68 },
    'פלפל ירוק': { shufersal: 9.90, rami_levy: 6.90, victory: 7.50, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 9.50, yochananof: 6.76 },
    'פלפל צהוב': { shufersal: 14.90, rami_levy: 10.90, victory: 11.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 13.50, yochananof: 10.68 },
    'פלפל כתום': { shufersal: 14.90, rami_levy: 10.90, victory: 11.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 12.10, yochananof: 10.68 },
    'פלפל חריף': { shufersal: 29.90, rami_levy: 24.90, victory: 26.50, ybitan: 32.50, hatzi_hinam: 27.90, carrefour: 25.50, yochananof: 24.40 },
    'חסה': { shufersal: 8.90, rami_levy: 5.90, victory: 6.50, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 7.10, yochananof: 5.78 },
    'חסה אייסברג': { shufersal: 9.90, rami_levy: 6.90, victory: 7.50, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 9.50, yochananof: 6.76 },
    'חסה רומית': { shufersal: 8.90, rami_levy: 5.90, victory: 6.50, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 8.10, yochananof: 5.78 },
    'כרוב': { shufersal: 6.90, rami_levy: 3.90, victory: 4.50, ybitan: 7.50, hatzi_hinam: 5.90, carrefour: 5.50, yochananof: 3.82 },
    'כרוב סגול': { shufersal: 8.90, rami_levy: 5.90, victory: 6.50, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 6.90, yochananof: 5.78 },
    'כרוב סיני': { shufersal: 9.90, rami_levy: 6.90, victory: 7.50, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 9.50, yochananof: 6.76 },
    'גזר': { shufersal: 6.90, rami_levy: 3.90, victory: 4.50, ybitan: 7.50, hatzi_hinam: 5.90, carrefour: 6.50, yochananof: 3.82 },
    'גזר בייבי': { shufersal: 10.90, rami_levy: 7.90, victory: 8.50, ybitan: 11.50, hatzi_hinam: 9.90, carrefour: 9.90, yochananof: 7.74 },
    'סלק': { shufersal: 7.90, rami_levy: 4.90, victory: 5.50, ybitan: 8.50, hatzi_hinam: 6.90, carrefour: 6.10, yochananof: 4.80 },
    'סלק מבושל': { shufersal: 12.90, rami_levy: 9.90, victory: 10.50, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 13.10, yochananof: 9.70 },
    'תפו״א אדום': { shufersal: 6.90, rami_levy: 3.90, victory: 4.50, ybitan: 7.50, hatzi_hinam: 5.90, carrefour: 6.10, yochananof: 3.82 },
    'תפו״א לבן': { shufersal: 6.90, rami_levy: 3.90, victory: 4.50, ybitan: 7.50, hatzi_hinam: 5.90, carrefour: 5.10, yochananof: 3.82 },
    'בטטה': { shufersal: 9.90, rami_levy: 6.90, victory: 7.50, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 8.50, yochananof: 6.76 },
    'קישוא': { shufersal: 8.90, rami_levy: 5.90, victory: 6.50, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 8.10, yochananof: 5.78 },
    'קישוא ירוק': { shufersal: 8.90, rami_levy: 5.90, victory: 6.50, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 8.50, yochananof: 5.78 },
    'חציל': { shufersal: 9.90, rami_levy: 6.90, victory: 7.50, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 9.50, yochananof: 6.76 },
    'ברוקולי': { shufersal: 14.90, rami_levy: 10.90, victory: 11.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 14.10, yochananof: 10.68 },
    'כרובית': { shufersal: 10.90, rami_levy: 7.90, victory: 8.50, ybitan: 11.50, hatzi_hinam: 9.90, carrefour: 8.50, yochananof: 7.74 },
    'תרד': { shufersal: 10.90, rami_levy: 7.90, victory: 8.50, ybitan: 11.50, hatzi_hinam: 9.90, carrefour: 8.50, yochananof: 7.74 },
    'תרד בייבי': { shufersal: 14.90, rami_levy: 11.90, victory: 12.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 11.90, yochananof: 11.66 },
    'פטרוזיליה': { shufersal: 5.90, rami_levy: 3.90, victory: 4.50, ybitan: 6.50, hatzi_hinam: 4.90, carrefour: 5.10, yochananof: 3.82 },
    'כוסברה': { shufersal: 5.90, rami_levy: 3.90, victory: 4.50, ybitan: 6.50, hatzi_hinam: 4.90, carrefour: 4.90, yochananof: 3.82 },
    'נענע': { shufersal: 5.90, rami_levy: 3.90, victory: 4.50, ybitan: 6.50, hatzi_hinam: 4.90, carrefour: 5.10, yochananof: 3.82 },
    'שמיר': { shufersal: 5.90, rami_levy: 3.90, victory: 4.50, ybitan: 6.50, hatzi_hinam: 4.90, carrefour: 4.50, yochananof: 3.82 },
    'ריחן': { shufersal: 6.90, rami_levy: 4.90, victory: 5.50, ybitan: 7.50, hatzi_hinam: 5.90, carrefour: 5.50, yochananof: 4.80 },
    'רוקט': { shufersal: 10.90, rami_levy: 7.90, victory: 8.50, ybitan: 11.50, hatzi_hinam: 9.90, carrefour: 8.50, yochananof: 7.74 },
    'סלרי': { shufersal: 8.90, rami_levy: 5.90, victory: 6.50, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 8.10, yochananof: 5.78 },
    'שומר': { shufersal: 9.90, rami_levy: 6.90, victory: 7.50, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 9.50, yochananof: 6.76 },
    'פטריות שמפיניון': { shufersal: 16.90, rami_levy: 13.90, victory: 14.50, ybitan: 17.50, hatzi_hinam: 15.90, carrefour: 13.50, yochananof: 13.62 },
    'פטריות פורטובלו': { shufersal: 22.90, rami_levy: 18.90, victory: 19.50, ybitan: 23.50, hatzi_hinam: 20.90, carrefour: 19.90, yochananof: 18.52 },
    // פירות
    'בננות': { shufersal: 9.90, rami_levy: 6.90, victory: 5.90, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 9.10, yochananof: 6.76 },
    'תפוחים ירוקים': { shufersal: 12.90, rami_levy: 9.90, victory: 8.90, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 10.50, yochananof: 9.70 },
    'תפוחים אדומים': { shufersal: 12.90, rami_levy: 9.90, victory: 8.90, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 10.50, yochananof: 9.70 },
    'תפוזים': { shufersal: 8.90, rami_levy: 5.90, victory: 4.90, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 6.90, yochananof: 5.78 },
    'קלמנטינות': { shufersal: 13.90, rami_levy: 10.90, victory: 9.90, ybitan: 14.50, hatzi_hinam: 12.90, carrefour: 13.90, yochananof: 10.68 },
    'אשכולית': { shufersal: 7.90, rami_levy: 4.90, victory: 3.90, ybitan: 8.50, hatzi_hinam: 6.90, carrefour: 6.10, yochananof: 4.80 },
    'אשכולית אדומה': { shufersal: 8.90, rami_levy: 5.90, victory: 4.90, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 7.50, yochananof: 5.78 },
    'פומלה': { shufersal: 9.90, rami_levy: 6.90, victory: 5.90, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 9.50, yochananof: 6.76 },
    'לימון': { shufersal: 9.90, rami_levy: 6.90, victory: 5.90, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 8.50, yochananof: 6.76 },
    'ליים': { shufersal: 12.90, rami_levy: 9.90, victory: 8.90, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 10.50, yochananof: 9.70 },
    'אבוקדו': { shufersal: 7.90, rami_levy: 5.90, victory: 4.90, ybitan: 8.50, hatzi_hinam: 6.90, carrefour: 7.10, yochananof: 5.78 },
    'מנגו': { shufersal: 16.90, rami_levy: 13.90, victory: 12.90, ybitan: 17.50, hatzi_hinam: 15.90, carrefour: 16.50, yochananof: 13.62 },
    'אננס': { shufersal: 18.90, rami_levy: 14.90, victory: 13.90, ybitan: 19.50, hatzi_hinam: 16.90, carrefour: 16.50, yochananof: 14.60 },
    'ענבים ירוקים': { shufersal: 26.90, rami_levy: 22.90, victory: 21.90, ybitan: 27.50, hatzi_hinam: 24.90, carrefour: 27.10, yochananof: 22.44 },
    'ענבים שחורים': { shufersal: 26.90, rami_levy: 22.90, victory: 21.90, ybitan: 27.50, hatzi_hinam: 24.90, carrefour: 26.10, yochananof: 22.44 },
    'אגס': { shufersal: 15.90, rami_levy: 12.90, victory: 11.90, ybitan: 16.50, hatzi_hinam: 14.90, carrefour: 16.10, yochananof: 12.64 },
    'שזיפים': { shufersal: 19.90, rami_levy: 16.90, victory: 15.90, ybitan: 20.50, hatzi_hinam: 18.90, carrefour: 19.10, yochananof: 16.56 },
    'אפרסקים': { shufersal: 17.90, rami_levy: 14.90, victory: 13.90, ybitan: 18.50, hatzi_hinam: 16.90, carrefour: 18.10, yochananof: 14.60 },
    'נקטרינות': { shufersal: 17.90, rami_levy: 14.90, victory: 13.90, ybitan: 18.50, hatzi_hinam: 16.90, carrefour: 17.90, yochananof: 14.60 },
    'קיווי': { shufersal: 5.90, rami_levy: 4.90, victory: 3.90, ybitan: 6.50, hatzi_hinam: 5.50, carrefour: 4.90, yochananof: 4.80 },
    'רימונים': { shufersal: 10.90, rami_levy: 7.90, victory: 6.90, ybitan: 11.50, hatzi_hinam: 9.90, carrefour: 10.50, yochananof: 7.74 },
    'תותים': { shufersal: 26.90, rami_levy: 22.90, victory: 21.90, ybitan: 27.50, hatzi_hinam: 24.90, carrefour: 25.90, yochananof: 22.44 },
    'אוכמניות': { shufersal: 36.90, rami_levy: 32.90, victory: 31.90, ybitan: 37.50, hatzi_hinam: 34.90, carrefour: 37.50, yochananof: 32.24 },
    'פטל': { shufersal: 31.90, rami_levy: 27.90, victory: 26.90, ybitan: 32.50, hatzi_hinam: 29.90, carrefour: 31.50, yochananof: 27.34 },
    'דובדבנים': { shufersal: 41.90, rami_levy: 37.90, victory: 36.90, ybitan: 42.50, hatzi_hinam: 39.90, carrefour: 43.10, yochananof: 37.14 },
    'אבטיח': { shufersal: 4.90, rami_levy: 2.90, victory: 2.50, ybitan: 5.50, hatzi_hinam: 3.90, carrefour: 3.90, yochananof: 2.84 },
    'מלון': { shufersal: 6.90, rami_levy: 4.90, victory: 3.90, ybitan: 7.50, hatzi_hinam: 5.90, carrefour: 5.50, yochananof: 4.80 },

    // ===== לחם ומאפים (ויקטורי זול) =====
    'לחם': { shufersal: 9.90, rami_levy: 8.90, victory: 7.50, ybitan: 9.50, hatzi_hinam: 8.50, carrefour: 7.90, yochananof: 9.68 },
    'לחם מלא': { shufersal: 12.90, rami_levy: 11.90, victory: 9.50, ybitan: 12.50, hatzi_hinam: 10.90, carrefour: 10.10, yochananof: 12.03 },
    'לחם שיפון': { shufersal: 14.90, rami_levy: 13.90, victory: 11.50, ybitan: 14.50, hatzi_hinam: 12.90, carrefour: 13.10, yochananof: 14.11 },
    'לחם כוסמין': { shufersal: 16.90, rami_levy: 15.90, victory: 13.50, ybitan: 16.50, hatzi_hinam: 14.90, carrefour: 14.10, yochananof: 16.24 },
    'לחם דגנים': { shufersal: 13.90, rami_levy: 12.90, victory: 10.50, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 11.50, yochananof: 13.40 },
    'לחם פרוס': { shufersal: 10.90, rami_levy: 9.90, victory: 8.50, ybitan: 10.50, hatzi_hinam: 9.50, carrefour: 9.50, yochananof: 10.50 },
    'לחם אחיד': { shufersal: 5.90, rami_levy: 5.90, victory: 5.90, ybitan: 5.90, hatzi_hinam: 5.90, carrefour: 5.10, yochananof: 5.90 },
    'לחם ללא גלוטן': { shufersal: 24.90, rami_levy: 23.90, victory: 21.50, ybitan: 24.50, hatzi_hinam: 22.90, carrefour: 24.50, yochananof: 25.13 },
    'חלה': { shufersal: 13.90, rami_levy: 12.90, victory: 10.50, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 11.10, yochananof: 13.00 },
    'חלה מלאה': { shufersal: 15.90, rami_levy: 14.90, victory: 12.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 15.10, yochananof: 15.09 },
    'חלה מתוקה': { shufersal: 14.90, rami_levy: 13.90, victory: 11.50, ybitan: 14.50, hatzi_hinam: 12.90, carrefour: 11.90, yochananof: 14.26 },
    'פיתות': { shufersal: 8.90, rami_levy: 7.90, victory: 6.50, ybitan: 8.50, hatzi_hinam: 7.50, carrefour: 7.90, yochananof: 8.40 },
    'פיתות מלאות': { shufersal: 10.90, rami_levy: 9.90, victory: 8.50, ybitan: 10.50, hatzi_hinam: 9.50, carrefour: 8.50, yochananof: 10.50 },
    'פיתות מיני': { shufersal: 7.90, rami_levy: 6.90, victory: 5.50, ybitan: 7.50, hatzi_hinam: 6.50, carrefour: 5.50, yochananof: 7.55 },
    'לחמניות': { shufersal: 15.90, rami_levy: 14.90, victory: 12.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 12.50, yochananof: 15.86 },
    'לחמניות המבורגר': { shufersal: 14.90, rami_levy: 13.90, victory: 11.50, ybitan: 14.50, hatzi_hinam: 12.90, carrefour: 12.10, yochananof: 13.97 },
    'לחמניות נקניקיה': { shufersal: 13.90, rami_levy: 12.90, victory: 10.50, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 11.50, yochananof: 13.13 },
    'בגט': { shufersal: 8.90, rami_levy: 7.90, victory: 6.50, ybitan: 8.50, hatzi_hinam: 7.50, carrefour: 7.10, yochananof: 8.32 },
    'צ\'בטה': { shufersal: 10.90, rami_levy: 9.90, victory: 8.50, ybitan: 10.50, hatzi_hinam: 9.50, carrefour: 10.10, yochananof: 10.40 },
    'פוקצ\'ה': { shufersal: 16.90, rami_levy: 15.90, victory: 13.50, ybitan: 16.50, hatzi_hinam: 14.90, carrefour: 12.90, yochananof: 16.56 },
    'טורטייה': { shufersal: 15.90, rami_levy: 14.90, victory: 12.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 15.10, yochananof: 15.71 },
    'לאפה': { shufersal: 9.90, rami_levy: 8.90, victory: 7.50, ybitan: 9.50, hatzi_hinam: 8.50, carrefour: 7.10, yochananof: 9.68 },
    'קרואסון': { shufersal: 7.90, rami_levy: 6.90, victory: 5.50, ybitan: 7.50, hatzi_hinam: 6.50, carrefour: 6.10, yochananof: 7.18 },
    'קרואסון שוקולד': { shufersal: 9.90, rami_levy: 8.90, victory: 7.50, ybitan: 9.50, hatzi_hinam: 8.50, carrefour: 8.10, yochananof: 9.21 },
    'בורקס': { shufersal: 9.90, rami_levy: 8.90, victory: 7.50, ybitan: 9.50, hatzi_hinam: 8.50, carrefour: 7.50, yochananof: 9.31 },
    'בורקס גבינה': { shufersal: 14.90, rami_levy: 13.90, victory: 11.50, ybitan: 14.50, hatzi_hinam: 12.90, carrefour: 12.50, yochananof: 14.40 },
    'בורקס תפו״א': { shufersal: 12.90, rami_levy: 11.90, victory: 9.50, ybitan: 12.50, hatzi_hinam: 10.90, carrefour: 9.50, yochananof: 12.52 },
    'בורקס פטריות': { shufersal: 14.90, rami_levy: 13.90, victory: 11.50, ybitan: 14.50, hatzi_hinam: 12.90, carrefour: 13.50, yochananof: 14.69 },
    'עוגיות': { shufersal: 12.90, rami_levy: 11.90, victory: 9.50, ybitan: 12.50, hatzi_hinam: 10.90, carrefour: 11.90, yochananof: 12.77 },
    'עוגיות שוקולד צ\'יפס': { shufersal: 14.90, rami_levy: 13.90, victory: 11.50, ybitan: 14.50, hatzi_hinam: 12.90, carrefour: 12.10, yochananof: 13.97 },
    'עוגיות חמאה': { shufersal: 13.90, rami_levy: 12.90, victory: 10.50, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 11.50, yochananof: 13.13 },
    'מצות': { shufersal: 12.90, rami_levy: 11.90, victory: 9.50, ybitan: 12.50, hatzi_hinam: 10.90, carrefour: 9.50, yochananof: 12.28 },
    'מצות מלאות': { shufersal: 14.90, rami_levy: 13.90, victory: 11.50, ybitan: 14.50, hatzi_hinam: 12.90, carrefour: 12.50, yochananof: 14.40 },
    'קרקרים': { shufersal: 9.90, rami_levy: 8.90, victory: 7.50, ybitan: 9.50, hatzi_hinam: 8.50, carrefour: 9.10, yochananof: 9.49 },

    // ===== משקאות (חצי חינם זול) =====
    'מים מינרליים 0.5 ליטר': { shufersal: 4.90, rami_levy: 4.50, victory: 4.70, ybitan: 5.50, hatzi_hinam: 2.90, carrefour: 2.90, yochananof: 5.00 },
    'מים מינרליים 1.5 ליטר': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 7.90, hatzi_hinam: 3.50, carrefour: 3.50, yochananof: 7.04 },
    'מים בטעמים 1.5 ליטר': { shufersal: 7.90, rami_levy: 6.90, victory: 7.50, ybitan: 8.90, hatzi_hinam: 4.50, carrefour: 4.50, yochananof: 8.06 },
    'מי עדן 0.5 ליטר': { shufersal: 4.90, rami_levy: 4.50, victory: 4.70, ybitan: 5.50, hatzi_hinam: 2.90, carrefour: 2.90, yochananof: 5.00 },
    'מי עדן 1.5 ליטר': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 7.90, hatzi_hinam: 3.50, carrefour: 3.10, yochananof: 7.04 },
    'נביעות 0.5 ליטר': { shufersal: 4.90, rami_levy: 4.50, victory: 4.70, ybitan: 5.50, hatzi_hinam: 2.90, carrefour: 2.50, yochananof: 5.00 },
    'נביעות 1.5 ליטר': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 7.90, hatzi_hinam: 3.50, carrefour: 3.50, yochananof: 7.04 },
    // קולה
    'קולה 0.5 ליטר': { shufersal: 6.90, rami_levy: 6.50, victory: 6.70, ybitan: 7.50, hatzi_hinam: 4.90, carrefour: 5.10, yochananof: 7.04 },
    'קולה 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 5.90, yochananof: 10.10 },
    'קולה 2 ליטר': { shufersal: 11.90, rami_levy: 10.90, victory: 11.50, ybitan: 12.90, hatzi_hinam: 8.50, carrefour: 8.10, yochananof: 12.14 },
    'קולה זירו 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 7.10, yochananof: 10.10 },
    'קולה זירו 2 ליטר': { shufersal: 11.90, rami_levy: 10.90, victory: 11.50, ybitan: 12.90, hatzi_hinam: 8.50, carrefour: 7.50, yochananof: 12.14 },
    'קולה דיאט 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 6.90, yochananof: 10.10 },
    'קולה פחית 330 מ"ל': { shufersal: 5.90, rami_levy: 5.50, victory: 5.70, ybitan: 6.50, hatzi_hinam: 4.50, carrefour: 4.10, yochananof: 6.02 },
    'קולה זירו פחית 330 מ"ל': { shufersal: 5.90, rami_levy: 5.50, victory: 5.70, ybitan: 6.50, hatzi_hinam: 4.50, carrefour: 4.10, yochananof: 6.02 },
    'שישיית קולה פחיות': { shufersal: 29.90, rami_levy: 26.90, victory: 28.90, ybitan: 32.90, hatzi_hinam: 24.90, carrefour: 24.90, yochananof: 30.50 },
    'שישיית קולה זירו פחיות': { shufersal: 29.90, rami_levy: 26.90, victory: 28.90, ybitan: 32.90, hatzi_hinam: 24.90, carrefour: 22.50, yochananof: 30.50 },
    'שישיית קולה 1.5 ליטר': { shufersal: 44.90, rami_levy: 41.90, victory: 43.90, ybitan: 47.90, hatzi_hinam: 39.90, carrefour: 34.10, yochananof: 45.80 },
    'שישיית קולה זירו 1.5 ליטר': { shufersal: 44.90, rami_levy: 41.90, victory: 43.90, ybitan: 47.90, hatzi_hinam: 39.90, carrefour: 34.10, yochananof: 45.80 },
    // פפסי
    'פפסי 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 6.90, yochananof: 10.10 },
    'פפסי 2 ליטר': { shufersal: 11.90, rami_levy: 10.90, victory: 11.50, ybitan: 12.90, hatzi_hinam: 8.50, carrefour: 7.90, yochananof: 12.14 },
    'פפסי מקס 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 7.10, yochananof: 10.10 },
    'פפסי פחית 330 מ"ל': { shufersal: 5.50, rami_levy: 5.00, victory: 5.30, ybitan: 6.00, hatzi_hinam: 4.00, carrefour: 3.90, yochananof: 5.61 },
    'פפסי מקס פחית 330 מ"ל': { shufersal: 5.50, rami_levy: 5.00, victory: 5.30, ybitan: 6.00, hatzi_hinam: 4.00, carrefour: 4.10, yochananof: 5.61 },
    'שישיית פפסי פחיות': { shufersal: 27.90, rami_levy: 24.90, victory: 26.90, ybitan: 29.90, hatzi_hinam: 22.90, carrefour: 19.90, yochananof: 28.46 },
    'שישיית פפסי 1.5 ליטר': { shufersal: 42.90, rami_levy: 39.90, victory: 41.90, ybitan: 45.90, hatzi_hinam: 37.90, carrefour: 38.50, yochananof: 43.76 },
    // ספרייט ופאנטה
    'ספרייט 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 6.90, yochananof: 10.10 },
    'ספרייט זירו 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 6.50, yochananof: 10.10 },
    'ספרייט פחית 330 מ"ל': { shufersal: 5.90, rami_levy: 5.50, victory: 5.70, ybitan: 6.50, hatzi_hinam: 4.50, carrefour: 4.10, yochananof: 6.02 },
    'שישיית ספרייט פחיות': { shufersal: 29.90, rami_levy: 26.90, victory: 28.90, ybitan: 32.90, hatzi_hinam: 24.90, carrefour: 25.10, yochananof: 30.50 },
    'שישיית ספרייט 1.5 ליטר': { shufersal: 44.90, rami_levy: 41.90, victory: 43.90, ybitan: 47.90, hatzi_hinam: 39.90, carrefour: 35.90, yochananof: 45.80 },
    'פאנטה 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 6.50, yochananof: 10.10 },
    'פאנטה 2 ליטר': { shufersal: 11.90, rami_levy: 10.90, victory: 11.50, ybitan: 12.90, hatzi_hinam: 8.50, carrefour: 7.90, yochananof: 12.14 },
    'פאנטה פחית 330 מ"ל': { shufersal: 5.90, rami_levy: 5.50, victory: 5.70, ybitan: 6.50, hatzi_hinam: 4.50, carrefour: 4.10, yochananof: 6.02 },
    'שישיית פאנטה פחיות': { shufersal: 29.90, rami_levy: 26.90, victory: 28.90, ybitan: 32.90, hatzi_hinam: 24.90, carrefour: 26.10, yochananof: 30.50 },
    'שישיית פאנטה 1.5 ליטר': { shufersal: 44.90, rami_levy: 41.90, victory: 43.90, ybitan: 47.90, hatzi_hinam: 39.90, carrefour: 34.50, yochananof: 45.80 },
    // שוופס וסודה
    'שוופס 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 6.10, yochananof: 10.10 },
    'סודה 1.5 ליטר': { shufersal: 5.90, rami_levy: 4.90, victory: 5.50, ybitan: 6.90, hatzi_hinam: 3.50, carrefour: 3.50, yochananof: 6.02 },
    'סודה פחית 330 מ"ל': { shufersal: 4.90, rami_levy: 4.50, victory: 4.70, ybitan: 5.50, hatzi_hinam: 3.50, carrefour: 3.50, yochananof: 5.00 },
    'טוניק 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 6.10, yochananof: 10.10 },
    'טוניק פחית 330 מ"ל': { shufersal: 5.90, rami_levy: 5.50, victory: 5.70, ybitan: 6.50, hatzi_hinam: 4.50, carrefour: 4.90, yochananof: 6.02 },
    'שישיית שוופס פחיות': { shufersal: 29.90, rami_levy: 26.90, victory: 28.90, ybitan: 32.90, hatzi_hinam: 24.90, carrefour: 22.10, yochananof: 30.50 },
    // מיצים
    'מיץ תפוזים 1 ליטר': { shufersal: 15.90, rami_levy: 13.90, victory: 14.50, ybitan: 16.90, hatzi_hinam: 11.50, carrefour: 12.10, yochananof: 16.22 },
    'מיץ תפוזים סחוט 1 ליטר': { shufersal: 18.90, rami_levy: 16.90, victory: 17.50, ybitan: 19.90, hatzi_hinam: 14.50, carrefour: 15.10, yochananof: 19.28 },
    'מיץ תפוחים 1 ליטר': { shufersal: 14.90, rami_levy: 12.90, victory: 13.50, ybitan: 15.90, hatzi_hinam: 10.50, carrefour: 9.10, yochananof: 15.20 },
    'מיץ ענבים 1 ליטר': { shufersal: 16.90, rami_levy: 14.90, victory: 15.50, ybitan: 17.90, hatzi_hinam: 12.50, carrefour: 11.10, yochananof: 17.24 },
    'מיץ גזר 1 ליטר': { shufersal: 15.90, rami_levy: 13.90, victory: 14.50, ybitan: 16.90, hatzi_hinam: 11.50, carrefour: 11.90, yochananof: 16.22 },
    'מיץ רימונים 1 ליטר': { shufersal: 22.90, rami_levy: 19.90, victory: 21.50, ybitan: 24.90, hatzi_hinam: 17.50, carrefour: 15.50, yochananof: 23.36 },
    'מיץ פריגת 1.5 ליטר': { shufersal: 13.90, rami_levy: 11.90, victory: 12.50, ybitan: 14.90, hatzi_hinam: 9.50, carrefour: 8.90, yochananof: 14.18 },
    'מיץ ספרינג 1.5 ליטר': { shufersal: 13.90, rami_levy: 11.90, victory: 12.50, ybitan: 14.90, hatzi_hinam: 9.50, carrefour: 8.90, yochananof: 14.18 },
    'נקטר 1 ליטר': { shufersal: 12.90, rami_levy: 10.90, victory: 11.50, ybitan: 13.90, hatzi_hinam: 8.50, carrefour: 8.10, yochananof: 13.16 },
    'תפוזינה 1.5 ליטר': { shufersal: 14.90, rami_levy: 12.90, victory: 13.50, ybitan: 15.90, hatzi_hinam: 10.50, carrefour: 11.50, yochananof: 15.20 },
    'לימונדה 1.5 ליטר': { shufersal: 11.90, rami_levy: 9.90, victory: 10.50, ybitan: 12.90, hatzi_hinam: 7.50, carrefour: 7.90, yochananof: 12.14 },
    'לימונענע 1.5 ליטר': { shufersal: 11.90, rami_levy: 9.90, victory: 10.50, ybitan: 12.90, hatzi_hinam: 7.50, carrefour: 8.10, yochananof: 12.14 },
    // אנרגיה
    'XL פחית 250 מ"ל': { shufersal: 7.90, rami_levy: 6.90, victory: 7.50, ybitan: 8.90, hatzi_hinam: 5.50, carrefour: 5.90, yochananof: 8.06 },
    'רד בול פחית 250 מ"ל': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 7.50, carrefour: 7.90, yochananof: 10.10 },
    'מונסטר פחית 500 מ"ל': { shufersal: 11.90, rami_levy: 10.90, victory: 11.50, ybitan: 12.90, hatzi_hinam: 9.50, carrefour: 9.10, yochananof: 12.14 },
    'משקה ספורט 500 מ"ל': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 6.50, carrefour: 7.10, yochananof: 9.08 },
    'מי קוקוס 330 מ"ל': { shufersal: 12.90, rami_levy: 11.90, victory: 12.50, ybitan: 13.90, hatzi_hinam: 10.50, carrefour: 9.50, yochananof: 13.16 },

    // ===== חטיפים (חצי חינם זול) =====
    'במבה': { shufersal: 5.90, rami_levy: 5.50, victory: 5.50, ybitan: 6.50, hatzi_hinam: 4.90, carrefour: 5.10, yochananof: 5.30 },
    'במבה אדומים': { shufersal: 5.90, rami_levy: 5.50, victory: 5.50, ybitan: 6.50, hatzi_hinam: 4.90, carrefour: 4.90, yochananof: 5.30 },
    'במבה נוגט': { shufersal: 6.50, rami_levy: 6.00, victory: 6.50, ybitan: 7.50, hatzi_hinam: 5.90, carrefour: 5.90, yochananof: 6.20 },
    'ביסלי': { shufersal: 5.90, rami_levy: 5.50, victory: 5.50, ybitan: 6.50, hatzi_hinam: 4.90, carrefour: 5.50, yochananof: 5.30 },
    'ביסלי גריל': { shufersal: 5.90, rami_levy: 5.50, victory: 5.50, ybitan: 6.50, hatzi_hinam: 4.90, carrefour: 5.50, yochananof: 5.30 },
    'ביסלי בצל': { shufersal: 5.90, rami_levy: 5.50, victory: 5.50, ybitan: 6.50, hatzi_hinam: 4.90, carrefour: 5.90, yochananof: 5.30 },
    'ביסלי פיצה': { shufersal: 5.90, rami_levy: 5.50, victory: 5.50, ybitan: 6.50, hatzi_hinam: 4.90, carrefour: 5.10, yochananof: 5.30 },
    'דוריטוס': { shufersal: 12.90, rami_levy: 11.90, victory: 12.50, ybitan: 13.90, hatzi_hinam: 9.90, carrefour: 9.50, yochananof: 13.16 },
    'דוריטוס צ\'ילי': { shufersal: 12.90, rami_levy: 11.90, victory: 12.50, ybitan: 13.90, hatzi_hinam: 9.90, carrefour: 9.50, yochananof: 13.16 },
    'טורטייה צ\'יפס': { shufersal: 11.90, rami_levy: 10.90, victory: 11.50, ybitan: 12.90, hatzi_hinam: 8.90, carrefour: 8.90, yochananof: 12.14 },
    'תפוצ\'יפס': { shufersal: 10.90, rami_levy: 9.90, victory: 10.50, ybitan: 11.90, hatzi_hinam: 7.50, carrefour: 6.50, yochananof: 11.12 },
    'פרינגלס': { shufersal: 14.90, rami_levy: 13.90, victory: 14.50, ybitan: 15.90, hatzi_hinam: 11.90, carrefour: 11.10, yochananof: 15.20 },
    'פרינגלס חמוץ': { shufersal: 14.90, rami_levy: 13.90, victory: 14.50, ybitan: 15.90, hatzi_hinam: 11.90, carrefour: 11.50, yochananof: 15.20 },
    'פופקורן': { shufersal: 7.90, rami_levy: 6.90, victory: 7.50, ybitan: 8.90, hatzi_hinam: 4.50, carrefour: 4.10, yochananof: 8.06 },
    'פופקורן מיקרו': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 6.90, yochananof: 10.10 },
    'פופקורן קרמל': { shufersal: 12.90, rami_levy: 11.90, victory: 12.50, ybitan: 13.90, hatzi_hinam: 9.90, carrefour: 10.10, yochananof: 13.16 },
    'שוקולד': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 6.50, carrefour: 5.90, yochananof: 9.08 },
    'שוקולד פרה': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 7.50, carrefour: 6.90, yochananof: 10.10 },
    'שוקולד מילקה': { shufersal: 12.90, rami_levy: 11.90, victory: 12.50, ybitan: 13.90, hatzi_hinam: 9.90, carrefour: 10.90, yochananof: 13.16 },
    'שוקולד חלב': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 6.50, carrefour: 6.50, yochananof: 9.08 },
    'שוקולד מריר': { shufersal: 12.90, rami_levy: 11.90, victory: 12.50, ybitan: 13.90, hatzi_hinam: 9.90, carrefour: 9.50, yochananof: 13.16 },
    'שוקולד לבן': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 7.50, carrefour: 6.50, yochananof: 10.10 },
    'שוקולד עם אגוזים': { shufersal: 14.90, rami_levy: 13.90, victory: 14.50, ybitan: 15.90, hatzi_hinam: 11.90, carrefour: 10.50, yochananof: 15.20 },
    'קינדר': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 6.50, carrefour: 6.10, yochananof: 9.08 },
    'סניקרס': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 7.90, hatzi_hinam: 4.90, carrefour: 4.10, yochananof: 7.04 },
    'מארס': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 7.90, hatzi_hinam: 4.90, carrefour: 4.90, yochananof: 7.04 },
    'טוויקס': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 7.90, hatzi_hinam: 4.90, carrefour: 5.10, yochananof: 7.04 },
    'קיטקט': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 7.90, hatzi_hinam: 4.90, carrefour: 4.90, yochananof: 7.04 },
    'עוגיות אוראו': { shufersal: 12.90, rami_levy: 11.90, victory: 12.50, ybitan: 13.90, hatzi_hinam: 9.90, carrefour: 10.10, yochananof: 13.16 },

    // ===== תבלינים =====
    'מלח שולחן 500 גרם': { shufersal: 3.50, rami_levy: 3.90, victory: 4.50, ybitan: 5.50, hatzi_hinam: 3.90, carrefour: 4.10, yochananof: 3.66 },
    'מלח שולחן 1 ק"ג': { shufersal: 5.50, rami_levy: 5.90, victory: 6.50, ybitan: 7.50, hatzi_hinam: 5.90, carrefour: 6.50, yochananof: 5.70 },
    'מלח ים 500 גרם': { shufersal: 6.50, rami_levy: 6.90, victory: 7.50, ybitan: 8.50, hatzi_hinam: 6.90, carrefour: 7.10, yochananof: 6.77 },
    'מלח גס 1 ק"ג': { shufersal: 4.50, rami_levy: 4.90, victory: 5.50, ybitan: 6.50, hatzi_hinam: 4.90, carrefour: 4.10, yochananof: 4.79 },
    'פלפל שחור טחון 80 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 9.90, yochananof: 9.48 },
    'פלפל שחור גרוס 80 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 8.50, yochananof: 8.92 },
    'פפריקה מתוקה 80 גרם': { shufersal: 8.50, rami_levy: 7.90, victory: 9.50, ybitan: 10.50, hatzi_hinam: 8.50, carrefour: 8.10, yochananof: 8.04 },
    'פפריקה מתוקה 100 גרם': { shufersal: 10.50, rami_levy: 9.90, victory: 11.50, ybitan: 12.50, hatzi_hinam: 10.50, carrefour: 10.50, yochananof: 10.10 },
    'פפריקה חריפה 80 גרם': { shufersal: 8.50, rami_levy: 7.90, victory: 9.50, ybitan: 10.50, hatzi_hinam: 8.50, carrefour: 7.10, yochananof: 8.20 },
    'פפריקה חריפה 100 גרם': { shufersal: 10.50, rami_levy: 9.90, victory: 11.50, ybitan: 12.50, hatzi_hinam: 10.50, carrefour: 10.10, yochananof: 10.30 },
    'פפריקה מעושנת 80 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 8.50, yochananof: 9.38 },
    'פפריקה מעושנת 100 גרם': { shufersal: 11.50, rami_levy: 10.90, victory: 12.50, ybitan: 13.50, hatzi_hinam: 11.50, carrefour: 10.10, yochananof: 11.54 },
    'כורכום 80 גרם': { shufersal: 12.50, rami_levy: 11.90, victory: 13.50, ybitan: 14.50, hatzi_hinam: 12.50, carrefour: 11.90, yochananof: 11.83 },
    'כמון 80 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 9.50, yochananof: 9.02 },
    'קינמון טחון 80 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 10.50, yochananof: 9.11 },
    'מקלות קינמון 50 גרם': { shufersal: 12.50, rami_levy: 11.90, victory: 13.50, ybitan: 14.50, hatzi_hinam: 12.50, carrefour: 10.50, yochananof: 12.20 },
    'אבקת שום 80 גרם': { shufersal: 8.50, rami_levy: 7.90, victory: 9.50, ybitan: 10.50, hatzi_hinam: 8.50, carrefour: 9.50, yochananof: 8.28 },
    'אבקת בצל 80 גרם': { shufersal: 8.50, rami_levy: 7.90, victory: 9.50, ybitan: 10.50, hatzi_hinam: 8.50, carrefour: 7.90, yochananof: 8.36 },
    'אורגנו 50 גרם': { shufersal: 7.50, rami_levy: 6.90, victory: 8.50, ybitan: 9.50, hatzi_hinam: 7.50, carrefour: 6.50, yochananof: 7.42 },
    'בזיליקום יבש 50 גרם': { shufersal: 7.50, rami_levy: 6.90, victory: 8.50, ybitan: 9.50, hatzi_hinam: 7.50, carrefour: 7.90, yochananof: 6.98 },
    'רוזמרין יבש 50 גרם': { shufersal: 7.50, rami_levy: 6.90, victory: 8.50, ybitan: 9.50, hatzi_hinam: 7.50, carrefour: 7.10, yochananof: 7.06 },
    'טימין יבש 50 גרם': { shufersal: 7.50, rami_levy: 6.90, victory: 8.50, ybitan: 9.50, hatzi_hinam: 7.50, carrefour: 7.50, yochananof: 7.13 },
    'זעתר 200 גרם': { shufersal: 18.50, rami_levy: 16.90, victory: 19.50, ybitan: 21.50, hatzi_hinam: 17.50, carrefour: 16.50, yochananof: 17.70 },
    'סומק 100 גרם': { shufersal: 12.50, rami_levy: 11.90, victory: 13.50, ybitan: 14.50, hatzi_hinam: 12.50, carrefour: 11.50, yochananof: 12.32 },
    'חוואייג׳ 100 גרם': { shufersal: 14.50, rami_levy: 13.90, victory: 15.50, ybitan: 16.50, hatzi_hinam: 14.50, carrefour: 12.50, yochananof: 14.48 },
    'תבלין לעוף 100 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 8.50, yochananof: 9.48 },
    'תבלין לדגים 100 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 8.50, yochananof: 8.92 },
    'תבלין לבשר 100 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 10.50, yochananof: 9.02 },
    'תבלין גריל 100 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 8.90, yochananof: 9.11 },
    'קארי 80 גרם': { shufersal: 11.50, rami_levy: 10.90, victory: 12.50, ybitan: 13.50, hatzi_hinam: 11.50, carrefour: 12.50, yochananof: 11.20 },
    'גרם מסאלה 80 גרם': { shufersal: 12.50, rami_levy: 11.90, victory: 13.50, ybitan: 14.50, hatzi_hinam: 12.50, carrefour: 13.50, yochananof: 12.32 },
    'ציילי 50 גרם': { shufersal: 8.50, rami_levy: 7.90, victory: 9.50, ybitan: 10.50, hatzi_hinam: 8.50, carrefour: 7.10, yochananof: 8.36 },
    'קיאן 50 גרם': { shufersal: 8.50, rami_levy: 7.90, victory: 9.50, ybitan: 10.50, hatzi_hinam: 8.50, carrefour: 7.50, yochananof: 8.45 },
    'זנגביל טחון 80 גרם': { shufersal: 10.50, rami_levy: 9.90, victory: 11.50, ybitan: 12.50, hatzi_hinam: 10.50, carrefour: 10.50, yochananof: 9.89 },
    'אגוז מוסקט 50 גרם': { shufersal: 14.50, rami_levy: 13.90, victory: 15.50, ybitan: 16.50, hatzi_hinam: 14.50, carrefour: 14.50, yochananof: 13.92 },
    'ציפורן 50 גרם': { shufersal: 12.50, rami_levy: 11.90, victory: 13.50, ybitan: 14.50, hatzi_hinam: 12.50, carrefour: 13.50, yochananof: 12.08 },
    'כוסברה טחונה 80 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 9.50, yochananof: 9.20 },
    'קרדמון 50 גרם': { shufersal: 18.50, rami_levy: 16.90, victory: 19.50, ybitan: 21.50, hatzi_hinam: 17.50, carrefour: 15.10, yochananof: 17.88 },
    'עלי דפנה 20 גרם': { shufersal: 6.50, rami_levy: 5.90, victory: 7.50, ybitan: 8.50, hatzi_hinam: 6.50, carrefour: 5.90, yochananof: 6.32 },
    'הל 50 גרם': { shufersal: 16.50, rami_levy: 15.90, victory: 17.50, ybitan: 18.50, hatzi_hinam: 16.50, carrefour: 16.10, yochananof: 16.69 },
    'כוכב אניס 50 גרם': { shufersal: 12.50, rami_levy: 11.90, victory: 13.50, ybitan: 14.50, hatzi_hinam: 12.50, carrefour: 13.50, yochananof: 11.83 },
    'שומר זרעים 80 גרם': { shufersal: 8.50, rami_levy: 7.90, victory: 9.50, ybitan: 10.50, hatzi_hinam: 8.50, carrefour: 8.50, yochananof: 8.04 },
    // ===== אבקות מרק (400 גרם) =====
    'אבקת מרק עוף': { shufersal: 27.90, rami_levy: 23.90, victory: 26.90, ybitan: 28.90, hatzi_hinam: 24.90, carrefour: 26.50, yochananof: 25.40 },
    'אבקת מרק עוף פרווה': { shufersal: 27.90, rami_levy: 23.90, victory: 26.90, ybitan: 28.90, hatzi_hinam: 24.90, carrefour: 26.50, yochananof: 25.40 },
    'אבקת מרק בטעם עוף': { shufersal: 27.90, rami_levy: 23.90, victory: 26.90, ybitan: 28.90, hatzi_hinam: 24.90, carrefour: 26.50, yochananof: 25.40 },
    'אבקת מרק עוף אמיתי': { shufersal: 29.90, rami_levy: 25.90, victory: 28.90, ybitan: 30.90, hatzi_hinam: 26.90, carrefour: 28.50, yochananof: 27.60 },
    'מרק עוף אמיתי': { shufersal: 29.90, rami_levy: 25.90, victory: 28.90, ybitan: 30.90, hatzi_hinam: 26.90, carrefour: 28.50, yochananof: 27.60 },
    'אבקת מרק פטריות': { shufersal: 29.90, rami_levy: 26.90, victory: 28.90, ybitan: 31.90, hatzi_hinam: 27.90, carrefour: 29.50, yochananof: 28.10 },
    'אבקת מרק בצל': { shufersal: 31.90, rami_levy: 27.90, victory: 30.90, ybitan: 33.90, hatzi_hinam: 28.90, carrefour: 30.50, yochananof: 29.80 },
    'אבקת מרק ירקות': { shufersal: 27.90, rami_levy: 23.90, victory: 26.90, ybitan: 28.90, hatzi_hinam: 24.90, carrefour: 26.50, yochananof: 25.40 },
    'אבקת מרק ירקות שורש': { shufersal: 27.90, rami_levy: 23.90, victory: 26.90, ybitan: 28.90, hatzi_hinam: 24.90, carrefour: 26.50, yochananof: 25.40 },
    'אבקת מרק בקר': { shufersal: 29.90, rami_levy: 25.90, victory: 28.90, ybitan: 30.90, hatzi_hinam: 26.90, carrefour: 28.50, yochananof: 27.60 },
    'מרק בקר אמיתי': { shufersal: 29.90, rami_levy: 25.90, victory: 28.90, ybitan: 30.90, hatzi_hinam: 26.90, carrefour: 28.50, yochananof: 27.60 },
    'שקדי מרק': { shufersal: 12.90, rami_levy: 10.90, victory: 11.90, ybitan: 13.90, hatzi_hinam: 11.50, carrefour: 12.50, yochananof: 11.30 },
    'שקדי מרק אסם': { shufersal: 12.90, rami_levy: 10.90, victory: 11.90, ybitan: 13.90, hatzi_hinam: 11.50, carrefour: 12.50, yochananof: 11.30 },

    // ===== בשר (רמי לוי זול) =====
    'עוף שלם טרי': { shufersal: 34.90, rami_levy: 26.90, victory: 31.90, ybitan: 36.90, hatzi_hinam: 30.90, carrefour: 33.50, yochananof: 30.59 },
    'עוף שלם קפוא': { shufersal: 29.90, rami_levy: 22.90, victory: 26.90, ybitan: 31.90, hatzi_hinam: 25.90, carrefour: 27.50, yochananof: 26.40 },
    'חזה עוף טרי': { shufersal: 44.90, rami_levy: 36.90, victory: 41.90, ybitan: 46.90, hatzi_hinam: 40.90, carrefour: 42.50, yochananof: 41.31 },
    'חזה עוף קפוא': { shufersal: 39.90, rami_levy: 31.90, victory: 36.90, ybitan: 41.90, hatzi_hinam: 35.90, carrefour: 34.10, yochananof: 36.62 },
    'כרעיים עוף טריות': { shufersal: 24.90, rami_levy: 18.90, victory: 22.90, ybitan: 26.90, hatzi_hinam: 21.90, carrefour: 22.90, yochananof: 22.56 },
    'כרעיים עוף קפואות': { shufersal: 19.90, rami_levy: 14.90, victory: 17.90, ybitan: 21.90, hatzi_hinam: 16.90, carrefour: 18.10, yochananof: 16.88 },
    'שוקיים עוף טריים': { shufersal: 29.90, rami_levy: 23.90, victory: 27.90, ybitan: 31.90, hatzi_hinam: 26.90, carrefour: 28.50, yochananof: 26.36 },
    'כנפיים עוף טריות': { shufersal: 22.90, rami_levy: 16.90, victory: 20.90, ybitan: 24.90, hatzi_hinam: 19.90, carrefour: 18.10, yochananof: 19.70 },
    'עוף טחון טרי': { shufersal: 36.90, rami_levy: 29.90, victory: 33.90, ybitan: 38.90, hatzi_hinam: 32.90, carrefour: 29.50, yochananof: 33.40 },
    'בשר טחון טרי': { shufersal: 52.90, rami_levy: 44.90, victory: 49.90, ybitan: 54.90, hatzi_hinam: 48.90, carrefour: 52.10, yochananof: 49.39 },
    'בשר טחון קפוא': { shufersal: 46.90, rami_levy: 39.90, victory: 43.90, ybitan: 48.90, hatzi_hinam: 42.90, carrefour: 36.90, yochananof: 44.27 },
    'אנטריקוט טרי': { shufersal: 134.90, rami_levy: 119.90, victory: 129.90, ybitan: 139.90, hatzi_hinam: 126.90, carrefour: 138.10, yochananof: 131.22 },
    'סינטה טרייה': { shufersal: 114.90, rami_levy: 99.90, victory: 109.90, ybitan: 119.90, hatzi_hinam: 106.90, carrefour: 112.10, yochananof: 104.18 },
    'שניצל עוף טרי': { shufersal: 44.90, rami_levy: 38.90, victory: 42.90, ybitan: 46.90, hatzi_hinam: 41.90, carrefour: 41.50, yochananof: 41.06 },
    'שניצל עוף קפוא': { shufersal: 38.90, rami_levy: 32.90, victory: 36.90, ybitan: 40.90, hatzi_hinam: 35.90, carrefour: 32.50, yochananof: 35.54 },
    'המבורגר טרי': { shufersal: 48.90, rami_levy: 41.90, victory: 45.90, ybitan: 50.90, hatzi_hinam: 44.90, carrefour: 44.50, yochananof: 45.40 },
    'המבורגר קפוא': { shufersal: 42.90, rami_levy: 36.90, victory: 39.90, ybitan: 44.90, hatzi_hinam: 38.90, carrefour: 40.50, yochananof: 40.30 },
    'קבב טרי': { shufersal: 52.90, rami_levy: 45.90, victory: 49.90, ybitan: 54.90, hatzi_hinam: 48.90, carrefour: 42.90, yochananof: 50.39 },
    'נקניקיות עוף': { shufersal: 24.90, rami_levy: 19.90, victory: 22.90, ybitan: 26.90, hatzi_hinam: 21.90, carrefour: 19.50, yochananof: 23.07 },
    'נקניקיות בקר': { shufersal: 29.90, rami_levy: 24.90, victory: 27.90, ybitan: 31.90, hatzi_hinam: 26.90, carrefour: 26.50, yochananof: 26.58 },

    // ===== דגים =====
    'סלמון טרי': { shufersal: 89.90, rami_levy: 84.90, victory: 94.90, ybitan: 99.90, hatzi_hinam: 87.90, carrefour: 83.10, yochananof: 85.65 },
    'סלמון מעושן': { shufersal: 69.90, rami_levy: 64.90, victory: 74.90, ybitan: 79.90, hatzi_hinam: 67.90, carrefour: 60.50, yochananof: 66.73 },
    'פילה סלמון טרי': { shufersal: 99.90, rami_levy: 94.90, victory: 104.90, ybitan: 109.90, hatzi_hinam: 97.90, carrefour: 86.10, yochananof: 97.40 },
    'טונה': { shufersal: 7.90, rami_levy: 6.90, victory: 8.50, ybitan: 8.90, hatzi_hinam: 7.50, carrefour: 7.90, yochananof: 7.30 },
    'טונה במים': { shufersal: 7.50, rami_levy: 6.90, victory: 8.20, ybitan: 8.90, hatzi_hinam: 7.20, carrefour: 7.50, yochananof: 7.10 },
    'טונה בשמן': { shufersal: 8.50, rami_levy: 7.90, victory: 9.20, ybitan: 9.90, hatzi_hinam: 8.20, carrefour: 8.50, yochananof: 8.10 },

    // ===== ניקיון =====
    'נייר טואלט': { shufersal: 36.90, rami_levy: 33.90, victory: 35.50, ybitan: 38.90, hatzi_hinam: 28.90, carrefour: 24.90, yochananof: 34.34 },
    'מגבות נייר': { shufersal: 16.90, rami_levy: 14.90, victory: 15.50, ybitan: 18.90, hatzi_hinam: 12.90, carrefour: 13.50, yochananof: 15.58 },
    'סבון כלים': { shufersal: 10.90, rami_levy: 9.90, victory: 10.50, ybitan: 11.90, hatzi_hinam: 7.50, carrefour: 6.50, yochananof: 10.30 },
    'אבקת כביסה': { shufersal: 41.90, rami_levy: 38.90, victory: 40.50, ybitan: 43.90, hatzi_hinam: 33.90, carrefour: 28.90, yochananof: 40.40 },
    'מרכך כביסה': { shufersal: 26.90, rami_levy: 23.90, victory: 25.50, ybitan: 28.90, hatzi_hinam: 21.50, carrefour: 18.50, yochananof: 25.65 },
    'אקונומיקה': { shufersal: 10.90, rami_levy: 8.90, victory: 10.50, ybitan: 12.90, hatzi_hinam: 6.50, carrefour: 6.10, yochananof: 10.10 },
    'שקיות אשפה': { shufersal: 15.90, rami_levy: 13.90, victory: 14.50, ybitan: 16.90, hatzi_hinam: 11.50, carrefour: 12.50, yochananof: 15.35 },

    // ===== קפה ותה =====
    'קפה נמס': { shufersal: 26.90, rami_levy: 21.90, victory: 24.90, ybitan: 28.90, hatzi_hinam: 23.90, carrefour: 20.90, yochananof: 23.67 },
    'קפה טורקי': { shufersal: 21.90, rami_levy: 16.90, victory: 19.90, ybitan: 23.90, hatzi_hinam: 18.90, carrefour: 20.90, yochananof: 19.01 },
    'תה שחור': { shufersal: 16.90, rami_levy: 11.90, victory: 14.90, ybitan: 18.90, hatzi_hinam: 13.90, carrefour: 12.50, yochananof: 14.26 },
    'תה ירוק': { shufersal: 18.90, rami_levy: 13.90, victory: 16.90, ybitan: 20.90, hatzi_hinam: 15.90, carrefour: 15.50, yochananof: 16.40 },
    'תה נענע': { shufersal: 16.90, rami_levy: 11.90, victory: 14.90, ybitan: 18.90, hatzi_hinam: 13.90, carrefour: 13.50, yochananof: 14.54 },

    // ===== יינות ואלכוהול (יינות ביתן זול) =====
    'יין אדום': { shufersal: 42.90, rami_levy: 39.90, victory: 44.90, ybitan: 34.90, hatzi_hinam: 41.90, carrefour: 36.10, yochananof: 42.23 },
    'יין לבן': { shufersal: 42.90, rami_levy: 39.90, victory: 44.90, ybitan: 34.90, hatzi_hinam: 41.90, carrefour: 42.90, yochananof: 42.64 },
    'בירה': { shufersal: 10.90, rami_levy: 9.90, victory: 10.50, ybitan: 7.50, hatzi_hinam: 9.50, carrefour: 10.50, yochananof: 10.09 },
    'בירה גולדסטאר': { shufersal: 10.90, rami_levy: 9.90, victory: 10.50, ybitan: 7.50, hatzi_hinam: 9.50, carrefour: 8.50, yochananof: 10.19 },
    'בירה מכבי': { shufersal: 10.90, rami_levy: 9.90, victory: 10.50, ybitan: 7.50, hatzi_hinam: 9.50, carrefour: 8.10, yochananof: 10.30 },
    'וודקה': { shufersal: 64.90, rami_levy: 59.90, victory: 66.90, ybitan: 52.90, hatzi_hinam: 62.90, carrefour: 57.90, yochananof: 62.40 },
    'וויסקי': { shufersal: 99.90, rami_levy: 94.90, victory: 102.90, ybitan: 84.90, hatzi_hinam: 97.90, carrefour: 104.50, yochananof: 98.37 },

    // ===== קפואים =====
    'גלידה': { shufersal: 26.90, rami_levy: 21.50, victory: 24.90, ybitan: 28.90, hatzi_hinam: 24.50, carrefour: 21.10, yochananof: 24.68 },
    'גלידה וניל': { shufersal: 26.90, rami_levy: 21.50, victory: 24.90, ybitan: 28.90, hatzi_hinam: 24.50, carrefour: 26.50, yochananof: 24.93 },
    'גלידה שוקולד': { shufersal: 26.90, rami_levy: 21.50, victory: 24.90, ybitan: 28.90, hatzi_hinam: 24.50, carrefour: 22.90, yochananof: 23.47 },
    'שניצל קפוא': { shufersal: 36.90, rami_levy: 29.50, victory: 33.90, ybitan: 38.90, hatzi_hinam: 33.50, carrefour: 32.90, yochananof: 32.54 },
    'נאגטס קפואים': { shufersal: 31.90, rami_levy: 24.50, victory: 28.90, ybitan: 33.90, hatzi_hinam: 28.50, carrefour: 27.50, yochananof: 27.92 },
    'פיצה קפואה': { shufersal: 26.90, rami_levy: 21.50, victory: 24.90, ybitan: 28.90, hatzi_hinam: 24.50, carrefour: 24.50, yochananof: 24.20 },
    'ירקות קפואים': { shufersal: 16.90, rami_levy: 11.50, victory: 14.90, ybitan: 18.90, hatzi_hinam: 14.50, carrefour: 14.90, yochananof: 14.34 },

    // ===== מזון יבש =====
    'אורז': { shufersal: 9.50, rami_levy: 11.90, victory: 12.90, ybitan: 13.90, hatzi_hinam: 11.50, carrefour: 10.50, yochananof: 10.91 },
    'אורז בסמטי': { shufersal: 14.50, rami_levy: 16.90, victory: 17.90, ybitan: 18.90, hatzi_hinam: 16.50, carrefour: 15.50, yochananof: 16.17 },
    'פסטה': { shufersal: 5.50, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50, carrefour: 7.10, yochananof: 6.50 },
    'פסטה ספגטי': { shufersal: 5.50, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50, carrefour: 6.50, yochananof: 6.57 },
    'פסטה פנה': { shufersal: 6.50, rami_levy: 8.90, victory: 9.90, ybitan: 10.90, hatzi_hinam: 8.50, carrefour: 8.90, yochananof: 7.62 },
    'קמח': { shufersal: 6.50, rami_levy: 8.90, victory: 9.90, ybitan: 10.90, hatzi_hinam: 8.50, carrefour: 8.50, yochananof: 7.70 },
    'סוכר': { shufersal: 5.50, rami_levy: 5.00, victory: 5.50, ybitan: 5.90, hatzi_hinam: 5.20, carrefour: 5.50, yochananof: 5.30 },
    'סוכר לבן': { shufersal: 5.50, rami_levy: 5.00, victory: 5.50, ybitan: 5.90, hatzi_hinam: 5.20, carrefour: 5.50, yochananof: 5.30 },
    'סוכר חום': { shufersal: 12.90, rami_levy: 11.90, victory: 13.50, ybitan: 14.90, hatzi_hinam: 12.50, carrefour: 13.90, yochananof: 12.70 },
    'מלח': { shufersal: 2.50, rami_levy: 4.90, victory: 5.90, ybitan: 6.90, hatzi_hinam: 4.50, carrefour: 4.50, yochananof: 3.77 },
    'שמן זית': { shufersal: 33.90, rami_levy: 38.90, victory: 39.90, ybitan: 42.90, hatzi_hinam: 36.90, carrefour: 34.50, yochananof: 37.49 },
    'שמן קנולה': { shufersal: 11.90, rami_levy: 10.90, victory: 12.50, ybitan: 13.50, hatzi_hinam: 11.50, carrefour: 12.50, yochananof: 11.30 },
    'רוטב עגבניות': { shufersal: 6.50, rami_levy: 8.90, victory: 9.90, ybitan: 10.90, hatzi_hinam: 8.50, carrefour: 8.10, yochananof: 7.55 },
    'רסק עגבניות': { shufersal: 4.50, rami_levy: 6.90, victory: 7.90, ybitan: 8.90, hatzi_hinam: 6.50, carrefour: 6.50, yochananof: 5.64 },
    'חומוס': { shufersal: 12.90, rami_levy: 9.90, victory: 11.90, ybitan: 13.90, hatzi_hinam: 11.50, carrefour: 10.50, yochananof: 11.40 },
    'טחינה': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 15.90, hatzi_hinam: 13.50, carrefour: 11.90, yochananof: 13.53 },
    'קטשופ': { shufersal: 9.50, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.50, carrefour: 10.50, yochananof: 11.42 },
    'מיונז': { shufersal: 11.50, rami_levy: 14.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 13.50, carrefour: 13.90, yochananof: 13.60 },
    'חרדל': { shufersal: 7.50, rami_levy: 9.90, victory: 10.90, ybitan: 11.90, hatzi_hinam: 9.50, carrefour: 10.50, yochananof: 8.44 },
    'זיתים': { shufersal: 14.90, rami_levy: 12.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 13.90, carrefour: 14.10, yochananof: 13.62 },

    // ===== מעדנייה =====
    'סלמי מעושן 100 גרם': { shufersal: 13.50, rami_levy: 11.90, victory: 14.50, ybitan: 15.50, hatzi_hinam: 12.90, carrefour: 14.10, yochananof: 12.57 },
    'סלמי מעושן 200 גרם': { shufersal: 26.90, rami_levy: 23.90, victory: 28.90, ybitan: 30.90, hatzi_hinam: 25.90, carrefour: 24.50, yochananof: 25.40 },
    'רוסטביף 100 גרם': { shufersal: 16.50, rami_levy: 14.90, victory: 17.50, ybitan: 18.50, hatzi_hinam: 15.90, carrefour: 14.50, yochananof: 15.86 },
    'רוסטביף 200 גרם': { shufersal: 32.90, rami_levy: 29.90, victory: 34.90, ybitan: 36.90, hatzi_hinam: 31.90, carrefour: 27.50, yochananof: 32.03 },
    'פסטרמה איטלקית 100 גרם': { shufersal: 16.50, rami_levy: 14.90, victory: 17.50, ybitan: 18.50, hatzi_hinam: 15.90, carrefour: 16.90, yochananof: 16.17 },
    'פסטרמה הודו 100 גרם': { shufersal: 14.50, rami_levy: 12.90, victory: 15.50, ybitan: 16.50, hatzi_hinam: 13.90, carrefour: 14.10, yochananof: 13.29 },
    'הודו מעושן 100 גרם': { shufersal: 12.50, rami_levy: 10.90, victory: 13.50, ybitan: 14.50, hatzi_hinam: 11.90, carrefour: 10.50, yochananof: 11.47 },
    'הודו מעושן 200 גרם': { shufersal: 24.90, rami_levy: 21.90, victory: 26.90, ybitan: 28.90, hatzi_hinam: 23.90, carrefour: 23.50, yochananof: 23.17 },
    'שינקן 100 גרם': { shufersal: 11.50, rami_levy: 9.90, victory: 12.50, ybitan: 13.50, hatzi_hinam: 10.90, carrefour: 10.90, yochananof: 10.70 },
    'שינקן 200 גרם': { shufersal: 22.90, rami_levy: 19.90, victory: 24.90, ybitan: 26.90, hatzi_hinam: 21.90, carrefour: 23.90, yochananof: 21.61 },

    // ===== סלטים =====
    'סלט חצילים': { shufersal: 15.90, rami_levy: 12.90, victory: 14.90, ybitan: 16.90, hatzi_hinam: 14.50, carrefour: 12.50, yochananof: 14.69 },
    'סלט מטבוחה': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 15.90, hatzi_hinam: 13.50, carrefour: 12.90, yochananof: 13.80 },
    'סלט טורקי': { shufersal: 16.90, rami_levy: 13.90, victory: 15.90, ybitan: 17.90, hatzi_hinam: 15.50, carrefour: 15.90, yochananof: 14.94 },

    // ===== תינוקות =====
    'חיתולים מידה 3': { shufersal: 48.90, rami_levy: 54.90, victory: 56.90, ybitan: 59.90, hatzi_hinam: 52.90, carrefour: 47.90, yochananof: 50.86 },
    'חיתולים מידה 4': { shufersal: 48.90, rami_levy: 54.90, victory: 56.90, ybitan: 59.90, hatzi_hinam: 52.90, carrefour: 54.90, yochananof: 51.38 },
    'מגבונים לתינוקות': { shufersal: 16.90, rami_levy: 13.90, victory: 15.50, ybitan: 18.90, hatzi_hinam: 11.50, carrefour: 10.90, yochananof: 15.40 },
    // פורמולות - מטרנה
    'מטרנה חלבי שלב 1': { shufersal: 56.90, rami_levy: 58.90, victory: 59.90, ybitan: 62.90, hatzi_hinam: 57.90, carrefour: 58.90, yochananof: 58.48 },
    'מטרנה חלבי שלב 2': { shufersal: 56.90, rami_levy: 58.90, victory: 59.90, ybitan: 62.90, hatzi_hinam: 57.90, carrefour: 58.90, yochananof: 59.06 },
    'מטרנה חלבי שלב 3': { shufersal: 56.90, rami_levy: 58.90, victory: 59.90, ybitan: 62.90, hatzi_hinam: 57.90, carrefour: 58.90, yochananof: 59.64 },
    'מטרנה מהדרין שלב 1': { shufersal: 65.00, rami_levy: 67.00, victory: 68.00, ybitan: 70.00, hatzi_hinam: 66.00, carrefour: 67.00, yochananof: 64.02 },
    'מטרנה מהדרין שלב 3': { shufersal: 65.00, rami_levy: 67.00, victory: 68.00, ybitan: 70.00, hatzi_hinam: 66.00, carrefour: 67.00, yochananof: 64.68 },
    'מטרנה גולד שלב 1': { shufersal: 81.90, rami_levy: 84.90, victory: 86.90, ybitan: 89.90, hatzi_hinam: 83.90, carrefour: 84.90, yochananof: 82.57 },
    'מטרנה גולד שלב 2': { shufersal: 81.90, rami_levy: 84.90, victory: 86.90, ybitan: 89.90, hatzi_hinam: 83.90, carrefour: 84.90, yochananof: 83.40 },
    'מטרנה גולד שלב 3': { shufersal: 81.90, rami_levy: 84.90, victory: 86.90, ybitan: 89.90, hatzi_hinam: 83.90, carrefour: 84.90, yochananof: 84.23 },
    'מטרנה אקסטרה קר שלב 1': { shufersal: 66.90, rami_levy: 69.90, victory: 71.90, ybitan: 74.90, hatzi_hinam: 68.90, carrefour: 69.90, yochananof: 69.77 },
    'מטרנה אקסטרה קר שלב 2': { shufersal: 66.90, rami_levy: 69.90, victory: 71.90, ybitan: 74.90, hatzi_hinam: 68.90, carrefour: 69.90, yochananof: 70.45 },
    'מטרנה אקסטרה קר שלב 3': { shufersal: 66.90, rami_levy: 69.90, victory: 71.90, ybitan: 74.90, hatzi_hinam: 68.90, carrefour: 69.90, yochananof: 66.35 },
    'מטרנה קומפורט': { shufersal: 82.90, rami_levy: 85.90, victory: 87.90, ybitan: 90.90, hatzi_hinam: 84.90, carrefour: 85.90, yochananof: 82.71 },
    'מטרנה צמחית': { shufersal: 71.90, rami_levy: 74.90, victory: 76.90, ybitan: 79.90, hatzi_hinam: 73.90, carrefour: 74.90, yochananof: 72.67 },
    // פורמולות - סימילאק
    'סימילאק גולד שלב 1': { shufersal: 72.60, rami_levy: 75.60, victory: 77.60, ybitan: 80.60, hatzi_hinam: 74.60, carrefour: 75.60, yochananof: 74.10 },
    'סימילאק גולד שלב 2': { shufersal: 72.60, rami_levy: 75.60, victory: 77.60, ybitan: 80.60, hatzi_hinam: 74.60, carrefour: 75.60, yochananof: 74.84 },
    'סימילאק גולד שלב 3': { shufersal: 72.60, rami_levy: 75.60, victory: 77.60, ybitan: 80.60, hatzi_hinam: 74.60, carrefour: 75.60, yochananof: 75.58 },
    'סימילאק גולד+ שלב 1': { shufersal: 80.90, rami_levy: 83.90, victory: 85.90, ybitan: 88.90, hatzi_hinam: 82.90, carrefour: 83.90, yochananof: 84.87 },
    'סימילאק גולד+ שלב 2': { shufersal: 80.90, rami_levy: 83.90, victory: 85.90, ybitan: 88.90, hatzi_hinam: 82.90, carrefour: 83.90, yochananof: 79.93 },
    'סימילאק גולד+ שלב 3': { shufersal: 80.90, rami_levy: 83.90, victory: 85.90, ybitan: 88.90, hatzi_hinam: 82.90, carrefour: 83.90, yochananof: 80.75 },
    'סימילאק קומפורט שלב 1': { shufersal: 107.90, rami_levy: 110.90, victory: 112.90, ybitan: 115.90, hatzi_hinam: 109.90, carrefour: 110.90, yochananof: 108.31 },
    'סימילאק קומפורט שלב 2': { shufersal: 107.90, rami_levy: 110.90, victory: 112.90, ybitan: 115.90, hatzi_hinam: 109.90, carrefour: 110.90, yochananof: 109.40 },
    // פורמולות - נוטרילון
    'נוטרילון שלב 1': { shufersal: 74.90, rami_levy: 77.90, victory: 79.90, ybitan: 82.90, hatzi_hinam: 76.90, carrefour: 77.90, yochananof: 77.16 },
    'נוטרילון שלב 2': { shufersal: 74.90, rami_levy: 77.90, victory: 79.90, ybitan: 82.90, hatzi_hinam: 76.90, carrefour: 77.90, yochananof: 77.93 },
    'נוטרילון שלב 3': { shufersal: 74.90, rami_levy: 77.90, victory: 79.90, ybitan: 82.90, hatzi_hinam: 76.90, carrefour: 77.90, yochananof: 78.69 },

    // ===== חיות מחמד =====
    'מזון לכלבים': { shufersal: 49.90, rami_levy: 44.90, victory: 52.90, ybitan: 54.90, hatzi_hinam: 46.90, carrefour: 49.50, yochananof: 45.98 },
    'מזון לחתולים': { shufersal: 44.90, rami_levy: 39.90, victory: 47.90, ybitan: 49.90, hatzi_hinam: 41.90, carrefour: 38.10, yochananof: 41.55 },
    'חול לחתולים': { shufersal: 34.90, rami_levy: 29.90, victory: 37.90, ybitan: 39.90, hatzi_hinam: 31.90, carrefour: 33.10, yochananof: 32.08 },

    // ===== דגנים וארוחת בוקר =====
    'קורנפלקס': { shufersal: 18.90, rami_levy: 19.90, victory: 20.90, ybitan: 21.90, hatzi_hinam: 17.90, carrefour: 16.90, yochananof: 19.40 },
    'קורנפלקס קלאסי': { shufersal: 18.90, rami_levy: 19.90, victory: 20.90, ybitan: 21.90, hatzi_hinam: 17.90, carrefour: 19.50, yochananof: 19.59 },
    'קורנפלקס דבש': { shufersal: 21.90, rami_levy: 22.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 20.90, carrefour: 21.50, yochananof: 22.85 },
    'קורנפלקס שוקולד': { shufersal: 21.90, rami_levy: 22.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 20.90, carrefour: 22.10, yochananof: 23.07 },
    'קורנפלקס כריות': { shufersal: 23.90, rami_levy: 24.90, victory: 25.90, ybitan: 26.90, hatzi_hinam: 22.90, carrefour: 19.90, yochananof: 23.67 },
    'קורנפלקס פירות': { shufersal: 22.90, rami_levy: 23.90, victory: 24.90, ybitan: 25.90, hatzi_hinam: 21.90, carrefour: 21.50, yochananof: 22.93 },
    'גרנולה': { shufersal: 24.90, rami_levy: 25.90, victory: 26.90, ybitan: 27.90, hatzi_hinam: 23.90, carrefour: 21.50, yochananof: 25.15 },
    'גרנולה שוקולד': { shufersal: 26.90, rami_levy: 27.90, victory: 28.90, ybitan: 29.90, hatzi_hinam: 25.90, carrefour: 26.90, yochananof: 27.40 },
    'גרנולה פירות': { shufersal: 26.90, rami_levy: 27.90, victory: 28.90, ybitan: 29.90, hatzi_hinam: 25.90, carrefour: 26.50, yochananof: 27.67 },
    'מוזלי': { shufersal: 22.90, rami_levy: 23.90, victory: 24.90, ybitan: 25.90, hatzi_hinam: 21.90, carrefour: 23.50, yochananof: 23.87 },
    'שיבולת שועל': { shufersal: 12.90, rami_levy: 13.90, victory: 14.90, ybitan: 15.90, hatzi_hinam: 11.90, carrefour: 12.90, yochananof: 13.80 },
    'קוואקר': { shufersal: 14.90, rami_levy: 15.90, victory: 16.90, ybitan: 17.90, hatzi_hinam: 13.90, carrefour: 12.90, yochananof: 14.94 },

    // ===== מעדני חלב =====
    'מילקי': { shufersal: 4.90, rami_levy: 5.20, victory: 5.50, ybitan: 5.90, hatzi_hinam: 4.50, carrefour: 3.90, yochananof: 4.95 },
    'מילקי שוקולד': { shufersal: 4.90, rami_levy: 5.20, victory: 5.50, ybitan: 5.90, hatzi_hinam: 4.50, carrefour: 4.50, yochananof: 5.00 },
    'מילקי וניל': { shufersal: 4.90, rami_levy: 5.20, victory: 5.50, ybitan: 5.90, hatzi_hinam: 4.50, carrefour: 3.90, yochananof: 5.05 },
    'מילקי קרמל': { shufersal: 4.90, rami_levy: 5.20, victory: 5.50, ybitan: 5.90, hatzi_hinam: 4.50, carrefour: 4.10, yochananof: 5.10 },
    'דניאלה': { shufersal: 5.90, rami_levy: 6.20, victory: 6.50, ybitan: 6.90, hatzi_hinam: 5.50, carrefour: 5.50, yochananof: 6.17 },
    'דניאלה שוקולד': { shufersal: 5.90, rami_levy: 6.20, victory: 6.50, ybitan: 6.90, hatzi_hinam: 5.50, carrefour: 5.10, yochananof: 6.23 },
    'דניאלה וניל': { shufersal: 5.90, rami_levy: 6.20, victory: 6.50, ybitan: 6.90, hatzi_hinam: 5.50, carrefour: 4.90, yochananof: 5.87 },
    'דנונה': { shufersal: 5.50, rami_levy: 5.90, victory: 6.20, ybitan: 6.50, hatzi_hinam: 5.20, carrefour: 5.10, yochananof: 5.59 },
    'דנונה שוקולד': { shufersal: 5.50, rami_levy: 5.90, victory: 6.20, ybitan: 6.50, hatzi_hinam: 5.20, carrefour: 5.10, yochananof: 5.64 },
    'יופלה': { shufersal: 6.90, rami_levy: 7.20, victory: 7.50, ybitan: 7.90, hatzi_hinam: 6.50, carrefour: 6.10, yochananof: 7.05 },
    'יופלה תות': { shufersal: 6.90, rami_levy: 7.20, victory: 7.50, ybitan: 7.90, hatzi_hinam: 6.50, carrefour: 6.50, yochananof: 7.12 },
    'אקטימל': { shufersal: 7.90, rami_levy: 8.20, victory: 8.50, ybitan: 8.90, hatzi_hinam: 7.50, carrefour: 7.50, yochananof: 8.21 },
    'פטיט דנון': { shufersal: 14.90, rami_levy: 15.50, victory: 16.20, ybitan: 16.90, hatzi_hinam: 14.50, carrefour: 13.50, yochananof: 15.66 },
    'מעדן שוקולד': { shufersal: 5.50, rami_levy: 5.90, victory: 6.20, ybitan: 6.50, hatzi_hinam: 5.20, carrefour: 5.10, yochananof: 5.53 },
    'מעדן וניל': { shufersal: 5.50, rami_levy: 5.90, victory: 6.20, ybitan: 6.50, hatzi_hinam: 5.20, carrefour: 5.10, yochananof: 5.59 },
    'שוקו': { shufersal: 4.90, rami_levy: 5.20, victory: 5.50, ybitan: 5.90, hatzi_hinam: 4.50, carrefour: 4.50, yochananof: 5.00 },
    'שוקו תנובה': { shufersal: 4.90, rami_levy: 5.20, victory: 5.50, ybitan: 5.90, hatzi_hinam: 4.50, carrefour: 4.50, yochananof: 5.05 },
    'פרי גד': { shufersal: 5.90, rami_levy: 6.20, victory: 6.50, ybitan: 6.90, hatzi_hinam: 5.50, carrefour: 4.90, yochananof: 6.11 },

    // ===== גלידות נוספות =====
    'מגנום': { shufersal: 12.90, rami_levy: 11.50, victory: 13.50, ybitan: 14.50, hatzi_hinam: 10.90, carrefour: 10.10, yochananof: 12.44 },
    'מגנום שקדים': { shufersal: 12.90, rami_levy: 11.50, victory: 13.50, ybitan: 14.50, hatzi_hinam: 10.90, carrefour: 9.50, yochananof: 12.57 },
    'מגנום לבן': { shufersal: 12.90, rami_levy: 11.50, victory: 13.50, ybitan: 14.50, hatzi_hinam: 10.90, carrefour: 11.90, yochananof: 11.83 },
    'קורנטו': { shufersal: 9.90, rami_levy: 8.50, victory: 10.50, ybitan: 11.50, hatzi_hinam: 7.90, carrefour: 8.10, yochananof: 9.02 },
    'קורנטו שוקולד': { shufersal: 9.90, rami_levy: 8.50, victory: 10.50, ybitan: 11.50, hatzi_hinam: 7.90, carrefour: 7.90, yochananof: 9.11 },
    'גולדה': { shufersal: 32.90, rami_levy: 29.90, victory: 34.90, ybitan: 36.90, hatzi_hinam: 28.90, carrefour: 27.50, yochananof: 31.40 },
    'ארטיק': { shufersal: 6.90, rami_levy: 5.90, victory: 7.50, ybitan: 8.50, hatzi_hinam: 5.50, carrefour: 5.50, yochananof: 6.46 },

    // ===== קפואים נוספים =====
    'בורקס': { shufersal: 28.90, rami_levy: 24.90, victory: 29.90, ybitan: 31.90, hatzi_hinam: 26.90, carrefour: 24.10, yochananof: 27.44 },
    'בורקס גבינה': { shufersal: 28.90, rami_levy: 24.90, victory: 29.90, ybitan: 31.90, hatzi_hinam: 26.90, carrefour: 26.50, yochananof: 27.71 },
    'בורקס תפו"א': { shufersal: 26.90, rami_levy: 22.90, victory: 27.90, ybitan: 29.90, hatzi_hinam: 24.90, carrefour: 23.50, yochananof: 24.15 },
    'בורקס פטריות': { shufersal: 28.90, rami_levy: 24.90, victory: 29.90, ybitan: 31.90, hatzi_hinam: 26.90, carrefour: 25.50, yochananof: 26.36 },
    'פיצה משפחתית': { shufersal: 34.90, rami_levy: 29.90, victory: 35.90, ybitan: 37.90, hatzi_hinam: 32.90, carrefour: 32.90, yochananof: 32.08 },
    'שווארמה קפואה': { shufersal: 44.90, rami_levy: 39.90, victory: 46.90, ybitan: 48.90, hatzi_hinam: 42.90, carrefour: 44.10, yochananof: 42.40 },
    'קבב קפוא': { shufersal: 39.90, rami_levy: 34.90, victory: 41.90, ybitan: 43.90, hatzi_hinam: 37.90, carrefour: 36.10, yochananof: 37.77 },
    'פלאפל קפוא': { shufersal: 18.90, rami_levy: 15.90, victory: 19.90, ybitan: 21.90, hatzi_hinam: 17.90, carrefour: 18.10, yochananof: 17.75 },
    'פירות יער קפואים': { shufersal: 24.90, rami_levy: 21.90, victory: 25.90, ybitan: 27.90, hatzi_hinam: 23.90, carrefour: 26.10, yochananof: 24.10 },
    'תותים קפואים': { shufersal: 22.90, rami_levy: 19.90, victory: 23.90, ybitan: 25.90, hatzi_hinam: 21.90, carrefour: 19.50, yochananof: 20.76 },

    // ===== משקאות קרים נוספים =====
    'נסטי': { shufersal: 7.90, rami_levy: 8.50, victory: 8.90, ybitan: 9.50, hatzi_hinam: 6.90, carrefour: 6.10, yochananof: 8.06 },
    'נסטי אפרסק': { shufersal: 7.90, rami_levy: 8.50, victory: 8.90, ybitan: 9.50, hatzi_hinam: 6.90, carrefour: 7.50, yochananof: 8.06 },
    'נסטי לימון': { shufersal: 7.90, rami_levy: 8.50, victory: 8.90, ybitan: 9.50, hatzi_hinam: 6.90, carrefour: 6.10, yochananof: 8.06 },
    'פיוז טי': { shufersal: 7.90, rami_levy: 8.50, victory: 8.90, ybitan: 9.50, hatzi_hinam: 6.90, carrefour: 6.10, yochananof: 8.06 },
    'פיוז טי אפרסק': { shufersal: 7.90, rami_levy: 8.50, victory: 8.90, ybitan: 9.50, hatzi_hinam: 6.90, carrefour: 6.90, yochananof: 8.06 },
    'ליפטון תה קר': { shufersal: 8.90, rami_levy: 9.50, victory: 9.90, ybitan: 10.50, hatzi_hinam: 7.90, carrefour: 6.90, yochananof: 9.08 },
    'XL': { shufersal: 6.90, rami_levy: 7.50, victory: 7.90, ybitan: 8.50, hatzi_hinam: 5.90, carrefour: 6.50, yochananof: 7.04 },
    'רד בול': { shufersal: 9.90, rami_levy: 10.50, victory: 10.90, ybitan: 11.50, hatzi_hinam: 8.90, carrefour: 9.10, yochananof: 10.10 },

    // ===== חטיפים נוספים =====
    'קינדר בואנו': { shufersal: 8.90, rami_levy: 9.50, victory: 9.90, ybitan: 10.50, hatzi_hinam: 7.90, carrefour: 7.50, yochananof: 9.08 },
    'קינדר שוקולד': { shufersal: 7.90, rami_levy: 8.50, victory: 8.90, ybitan: 9.50, hatzi_hinam: 6.90, carrefour: 6.50, yochananof: 8.06 },
    'קינדר סרפרייז': { shufersal: 9.90, rami_levy: 10.50, victory: 10.90, ybitan: 11.50, hatzi_hinam: 8.90, carrefour: 8.50, yochananof: 10.10 },
    'פסק זמן': { shufersal: 6.90, rami_levy: 7.50, victory: 7.90, ybitan: 8.50, hatzi_hinam: 5.90, carrefour: 5.90, yochananof: 7.04 },
    'פסק זמן לבן': { shufersal: 6.90, rami_levy: 7.50, victory: 7.90, ybitan: 8.50, hatzi_hinam: 5.90, carrefour: 5.50, yochananof: 7.04 },
    'באונטי': { shufersal: 6.90, rami_levy: 7.50, victory: 7.90, ybitan: 8.50, hatzi_hinam: 5.90, carrefour: 5.50, yochananof: 7.04 },
    'קליק': { shufersal: 5.90, rami_levy: 6.50, victory: 6.90, ybitan: 7.50, hatzi_hinam: 4.90, carrefour: 5.10, yochananof: 6.02 },
    'קליק מריר': { shufersal: 5.90, rami_levy: 6.50, victory: 6.90, ybitan: 7.50, hatzi_hinam: 4.90, carrefour: 4.50, yochananof: 6.02 },
    'טורטית': { shufersal: 5.90, rami_levy: 6.50, victory: 6.90, ybitan: 7.50, hatzi_hinam: 4.90, carrefour: 5.10, yochananof: 6.02 },
    'רושקה': { shufersal: 4.90, rami_levy: 5.50, victory: 5.90, ybitan: 6.50, hatzi_hinam: 3.90, carrefour: 4.10, yochananof: 5.00 },
    'כדורגל': { shufersal: 4.90, rami_levy: 5.50, victory: 5.90, ybitan: 6.50, hatzi_hinam: 3.90, carrefour: 3.50, yochananof: 5.00 },
    'חלווה': { shufersal: 18.90, rami_levy: 16.90, victory: 19.90, ybitan: 21.90, hatzi_hinam: 17.90, carrefour: 19.10, yochananof: 19.28 },
    'גרעינים': { shufersal: 12.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 10.90, carrefour: 9.90, yochananof: 13.16 },

    // ===== ניקיון נוספים =====
    'אקונומיקה': { shufersal: 9.90, rami_levy: 10.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 8.90, carrefour: 7.90, yochananof: 10.19 },
    'אקונומיקה לימון': { shufersal: 9.90, rami_levy: 10.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 8.90, carrefour: 9.50, yochananof: 10.30 },
    'מרכך כביסה': { shufersal: 16.90, rami_levy: 18.90, victory: 19.90, ybitan: 21.90, hatzi_hinam: 15.90, carrefour: 15.10, yochananof: 17.90 },
    'מרכך סנו': { shufersal: 18.90, rami_levy: 20.90, victory: 21.90, ybitan: 23.90, hatzi_hinam: 17.90, carrefour: 18.10, yochananof: 20.10 },
    'אבקת כביסה פרסיל': { shufersal: 44.90, rami_levy: 48.90, victory: 49.90, ybitan: 52.90, hatzi_hinam: 42.90, carrefour: 43.10, yochananof: 47.84 },
    'נוזל כלים סנו': { shufersal: 12.90, rami_levy: 14.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 11.90, carrefour: 11.50, yochananof: 14.32 },
    'מסיר שומנים': { shufersal: 14.90, rami_levy: 16.90, victory: 17.90, ybitan: 18.90, hatzi_hinam: 13.90, carrefour: 15.10, yochananof: 15.42 },
    'מסיר אבנית': { shufersal: 16.90, rami_levy: 18.90, victory: 19.90, ybitan: 20.90, hatzi_hinam: 15.90, carrefour: 13.90, yochananof: 17.54 },

    // ===== היגיינה נוספים =====
    'סבון דאב': { shufersal: 8.90, rami_levy: 9.90, victory: 10.90, ybitan: 11.90, hatzi_hinam: 7.90, carrefour: 6.90, yochananof: 9.31 },
    'דאודורנט רקסונה': { shufersal: 19.90, rami_levy: 21.90, victory: 22.90, ybitan: 24.90, hatzi_hinam: 18.90, carrefour: 18.10, yochananof: 20.90 },
    'דאודורנט ניוואה': { shufersal: 21.90, rami_levy: 23.90, victory: 24.90, ybitan: 26.90, hatzi_hinam: 20.90, carrefour: 17.90, yochananof: 23.13 },
    'משחת שיניים קולגייט': { shufersal: 14.90, rami_levy: 16.90, victory: 17.90, ybitan: 18.90, hatzi_hinam: 13.90, carrefour: 13.10, yochananof: 16.22 },
    'מרכך פנטן': { shufersal: 24.90, rami_levy: 26.90, victory: 27.90, ybitan: 29.90, hatzi_hinam: 23.90, carrefour: 21.90, yochananof: 26.68 },
};

// Chain information
const CHAINS = {
    shufersal: { name: 'שופרסל', color: '#dc2626', url: 'https://www.shufersal.co.il/online/he/search?text=' },
    rami_levy: { name: 'רמי לוי', color: '#2563eb', url: 'https://www.rami-levy.co.il/he/online/search?q=' },
    victory: { name: 'ויקטורי', color: '#ea580c', url: 'https://www.victoryonline.co.il/search?q=' },
    ybitan: { name: 'יינות ביתן', color: '#7c3aed', url: 'https://www.ybitan.co.il/search?q=' },
    hatzi_hinam: { name: 'חצי חינם', color: '#16a34a', url: 'https://shop.hazi-hinam.co.il/search?q=' },
    carrefour: { name: 'קארפור', color: '#0066cc', url: 'https://www.carrefour.co.il/search?q=' },
    yochananof: { name: 'יוחננוף', color: '#4f46e5', url: 'https://yochananof.co.il/search?q=' },
};

// Improved product matching with fuzzy search
function findProduct(name) {
    if (!name) return null;
    const searchName = name.trim();
    const searchLower = searchName.toLowerCase();
    const searchWords = searchLower.split(/\s+/).filter(w => w.length > 1);

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

    // 3. Find best match based on word overlap (prioritize longer matches)
    let bestMatch = null;
    let bestScore = 0;
    let bestLength = 0;

    for (const [productName, prices] of Object.entries(PRICE_DATABASE)) {
        const productLower = productName.toLowerCase();
        const productWords = productLower.split(/\s+/);
        let score = 0;

        // Exact word matches (highest priority)
        for (const searchWord of searchWords) {
            if (productWords.includes(searchWord)) {
                score += 30;
            }
        }

        // First word match (important for product identification)
        if (searchWords.length > 0 && productWords.length > 0) {
            if (searchWords[0] === productWords[0]) {
                score += 50; // Strong bonus for matching first word
            }
        }

        // Penalize partial word matches to avoid "חלבי" matching "חלב"
        // Only allow contains match if it's a WHOLE word match
        for (const searchWord of searchWords) {
            for (const productWord of productWords) {
                // Skip if words are too different in length (avoid חלבי->חלב)
                if (Math.abs(searchWord.length - productWord.length) > 2) {
                    continue;
                }
                // Exact word match already counted above
                if (searchWord === productWord) continue;
                // Starts-with match for similar length words
                if (searchWord.startsWith(productWord) && productWord.length >= 4) {
                    score += 10;
                }
                if (productWord.startsWith(searchWord) && searchWord.length >= 4) {
                    score += 10;
                }
            }
        }

        // Prefer longer product names (more specific)
        if (score > bestScore || (score === bestScore && productName.length > bestLength)) {
            bestScore = score;
            bestMatch = { name: productName, prices };
            bestLength = productName.length;
        }
    }

    // Require minimum score to return a match
    if (bestMatch && bestScore >= 30) {
        return bestMatch;
    }

    return null;
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

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
    'https://shooping-list.vercel.app',
    'https://listnest.vercel.app',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000'
];

// Main handler
module.exports = async (req, res) => {
    // CORS headers - restrict to known origins
    const origin = req.headers.origin;
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (process.env.NODE_ENV === 'development') {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

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

            const result = compareList(items);
            return res.json(result);
        }

        return res.status(400).json({ error: 'Invalid request' });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
