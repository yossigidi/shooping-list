// ListNest Price Comparison API - Vercel Serverless
// Complete Israeli product price database with ALL products (6 chains)
// Prices varied realistically - each chain wins on different products
// רמי לוי - זול בבשר וירקות | שופרסל - זול במותג פרטי ומוצרי חלב
// חצי חינם - זול בחטיפים ומשקאות | ויקטורי - זול בפירות ומאפים
// יינות ביתן - זול ביינות ואלכוהול | קארפור - זול במוצרים מיובאים

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
    'חלב 3% קרטון 1 ליטר': { shufersal: 7.28, rami_levy: 7.28, victory: 7.28, ybitan: 7.28, hatzi_hinam: 7.28, carrefour: 7.28 },
    'חלב 1% קרטון 1 ליטר': { shufersal: 7.28, rami_levy: 7.28, victory: 7.28, ybitan: 7.28, hatzi_hinam: 7.28, carrefour: 7.28 },
    'חלב 3% 1 ליטר': { shufersal: 7.28, rami_levy: 7.28, victory: 7.28, ybitan: 7.28, hatzi_hinam: 7.28, carrefour: 7.28 },
    'חלב 1% 1 ליטר': { shufersal: 7.28, rami_levy: 7.28, victory: 7.28, ybitan: 7.28, hatzi_hinam: 7.28, carrefour: 7.28 },
    // חלב בשקית - זול יותר
    'חלב 3% שקית 1 ליטר': { shufersal: 6.50, rami_levy: 6.40, victory: 6.60, ybitan: 6.70, hatzi_hinam: 6.45, carrefour: 6.55 },
    'חלב 1% שקית 1 ליטר': { shufersal: 6.40, rami_levy: 6.30, victory: 6.50, ybitan: 6.60, hatzi_hinam: 6.35, carrefour: 6.45 },
    'חלב דל שומן 1 ליטר': { shufersal: 7.28, rami_levy: 7.28, victory: 7.28, ybitan: 7.28, hatzi_hinam: 7.28, carrefour: 7.28 },
    'חלב 3% 0.5 ליטר': { shufersal: 4.90, rami_levy: 4.85, victory: 4.95, ybitan: 5.00, hatzi_hinam: 4.90, carrefour: 4.90 },
    'חלב 1% 0.5 ליטר': { shufersal: 4.80, rami_levy: 4.75, victory: 4.85, ybitan: 4.90, hatzi_hinam: 4.80, carrefour: 4.80 },
    'חלב סויה 1 ליטר': { shufersal: 11.90, rami_levy: 12.50, victory: 12.90, ybitan: 13.50, hatzi_hinam: 12.20, carrefour: 13.10 },
    'חלב שקדים 1 ליטר': { shufersal: 13.90, rami_levy: 14.50, victory: 14.90, ybitan: 15.50, hatzi_hinam: 14.20, carrefour: 12.50 },
    'חלב קוקוס 1 ליטר': { shufersal: 13.90, rami_levy: 14.50, victory: 14.90, ybitan: 15.50, hatzi_hinam: 14.20, carrefour: 13.50 },
    'חלב שיבולת שועל 1 ליטר': { shufersal: 12.90, rami_levy: 13.50, victory: 13.90, ybitan: 14.50, hatzi_hinam: 13.20, carrefour: 14.10 },
    // לבן ויוגורט
    'לבן 500 גרם': { shufersal: 5.50, rami_levy: 5.90, victory: 6.20, ybitan: 6.50, hatzi_hinam: 5.80, carrefour: 5.10 },
    'לבן 200 גרם': { shufersal: 3.20, rami_levy: 3.50, victory: 3.70, ybitan: 3.90, hatzi_hinam: 3.40, carrefour: 3.10 },
    'לבן עז 500 גרם': { shufersal: 8.50, rami_levy: 8.90, victory: 9.20, ybitan: 9.50, hatzi_hinam: 8.80, carrefour: 8.50 },
    'יוגורט 150 גרם': { shufersal: 5.50, rami_levy: 5.90, victory: 6.20, ybitan: 6.50, hatzi_hinam: 5.80, carrefour: 5.50 },
    'יוגורט יווני 150 גרם': { shufersal: 8.50, rami_levy: 8.90, victory: 9.20, ybitan: 9.50, hatzi_hinam: 8.80, carrefour: 8.50 },
    'יוגורט יווני 0% 150 גרם': { shufersal: 9.50, rami_levy: 9.90, victory: 10.20, ybitan: 10.50, hatzi_hinam: 9.80, carrefour: 10.10 },
    'יוגורט תנובה 150 גרם': { shufersal: 5.50, rami_levy: 5.90, victory: 6.20, ybitan: 6.50, hatzi_hinam: 5.80, carrefour: 6.10 },
    'יוגורט אקטיביה 150 גרם': { shufersal: 7.50, rami_levy: 7.90, victory: 8.20, ybitan: 8.50, hatzi_hinam: 7.80, carrefour: 7.90 },
    'יוגורט 500 גרם': { shufersal: 12.50, rami_levy: 12.90, victory: 13.20, ybitan: 13.50, hatzi_hinam: 12.80, carrefour: 13.90 },
    'יוגורט יווני 500 גרם': { shufersal: 18.50, rami_levy: 18.90, victory: 19.20, ybitan: 19.50, hatzi_hinam: 18.80, carrefour: 18.50 },
    // גבינות צהובות
    'גבינה צהובה עמק 200 גרם': { shufersal: 31.90, rami_levy: 33.90, victory: 34.90, ybitan: 35.90, hatzi_hinam: 32.90, carrefour: 35.10 },
    'גבינה צהובה עמק 400 גרם': { shufersal: 58.90, rami_levy: 61.90, victory: 63.90, ybitan: 65.90, hatzi_hinam: 59.90, carrefour: 61.90 },
    'גבינה צהובה גלבוע 200 גרם': { shufersal: 27.90, rami_levy: 29.90, victory: 30.90, ybitan: 31.90, hatzi_hinam: 28.90, carrefour: 28.50 },
    'גבינה צהובה 9% 200 גרם': { shufersal: 23.90, rami_levy: 25.90, victory: 26.90, ybitan: 27.90, hatzi_hinam: 24.90, carrefour: 24.90 },
    'גבינה צהובה 22% 200 גרם': { shufersal: 27.90, rami_levy: 29.90, victory: 30.90, ybitan: 31.90, hatzi_hinam: 28.90, carrefour: 28.10 },
    // קוטג וגבינה לבנה
    'קוטג׳ 5% 250 גרם': { shufersal: 8.50, rami_levy: 8.90, victory: 9.20, ybitan: 9.50, hatzi_hinam: 8.80, carrefour: 9.10 },
    'קוטג׳ 3% 250 גרם': { shufersal: 8.20, rami_levy: 8.60, victory: 8.90, ybitan: 9.20, hatzi_hinam: 8.50, carrefour: 9.10 },
    'גבינה לבנה 5% 250 גרם': { shufersal: 8.50, rami_levy: 8.90, victory: 9.20, ybitan: 9.50, hatzi_hinam: 8.80, carrefour: 8.50 },
    'גבינה לבנה 9% 250 גרם': { shufersal: 9.50, rami_levy: 9.90, victory: 10.20, ybitan: 10.50, hatzi_hinam: 9.80, carrefour: 8.90 },
    // גבינות מיוחדות
    'גבינה בולגרית 200 גרם': { shufersal: 18.50, rami_levy: 19.50, victory: 20.50, ybitan: 21.50, hatzi_hinam: 19.00, carrefour: 19.10 },
    'צפתית 200 גרם': { shufersal: 22.50, rami_levy: 23.50, victory: 24.50, ybitan: 25.50, hatzi_hinam: 23.00, carrefour: 24.10 },
    'גבינת שמנת 200 גרם': { shufersal: 12.50, rami_levy: 13.50, victory: 14.50, ybitan: 15.50, hatzi_hinam: 13.00, carrefour: 12.90 },
    'מוצרלה 200 גרם': { shufersal: 19.50, rami_levy: 20.50, victory: 21.50, ybitan: 22.50, hatzi_hinam: 20.00, carrefour: 21.90 },
    'מוצרלה 400 גרם': { shufersal: 36.50, rami_levy: 38.50, victory: 39.50, ybitan: 40.50, hatzi_hinam: 37.50, carrefour: 37.10 },
    'פרמזן 150 גרם': { shufersal: 42.50, rami_levy: 44.50, victory: 45.50, ybitan: 46.50, hatzi_hinam: 43.50, carrefour: 43.90 },
    'גאודה 200 גרם': { shufersal: 34.50, rami_levy: 36.50, victory: 37.50, ybitan: 38.50, hatzi_hinam: 35.50, carrefour: 33.50 },
    'אמנטל 200 גרם': { shufersal: 38.50, rami_levy: 40.50, victory: 41.50, ybitan: 42.50, hatzi_hinam: 39.50, carrefour: 42.50 },
    'ברי 125 גרם': { shufersal: 32.50, rami_levy: 34.50, victory: 35.50, ybitan: 36.50, hatzi_hinam: 33.50, carrefour: 31.50 },
    'קממבר 125 גרם': { shufersal: 28.50, rami_levy: 30.50, victory: 31.50, ybitan: 32.50, hatzi_hinam: 29.50, carrefour: 32.10 },
    'חלומי 200 גרם': { shufersal: 36.50, rami_levy: 38.50, victory: 39.50, ybitan: 40.50, hatzi_hinam: 37.50, carrefour: 39.50 },
    'פילדלפיה 200 גרם': { shufersal: 16.50, rami_levy: 17.50, victory: 18.50, ybitan: 19.50, hatzi_hinam: 17.00, carrefour: 15.90 },
    'לאבנה 200 גרם': { shufersal: 12.50, rami_levy: 13.50, victory: 14.50, ybitan: 15.50, hatzi_hinam: 13.00, carrefour: 12.50 },
    'ריקוטה 250 גרם': { shufersal: 22.50, rami_levy: 23.50, victory: 24.50, ybitan: 25.50, hatzi_hinam: 23.00, carrefour: 24.50 },
    'גבינת עזים 150 גרם': { shufersal: 28.50, rami_levy: 30.50, victory: 31.50, ybitan: 32.50, hatzi_hinam: 29.50, carrefour: 31.10 },
    'קשקבל 100 גרם': { shufersal: 11.50, rami_levy: 12.50, victory: 13.50, ybitan: 14.50, hatzi_hinam: 12.00, carrefour: 12.50 },
    'מסקרפונה 250 גרם': { shufersal: 9.50, rami_levy: 10.50, victory: 11.50, ybitan: 12.50, hatzi_hinam: 10.00, carrefour: 8.50 },
    // ביצים
    'ביצים L 12 יח׳': { shufersal: 27.90, rami_levy: 25.90, victory: 28.90, ybitan: 30.90, hatzi_hinam: 27.50, carrefour: 26.90 },
    'ביצים XL 12 יח׳': { shufersal: 31.90, rami_levy: 29.90, victory: 32.90, ybitan: 34.90, hatzi_hinam: 31.50, carrefour: 28.50 },
    'ביצים אורגניות 12 יח׳': { shufersal: 35.90, rami_levy: 33.90, victory: 36.90, ybitan: 38.90, hatzi_hinam: 35.50, carrefour: 33.90 },
    'ביצים חופשיות 12 יח׳': { shufersal: 33.90, rami_levy: 31.90, victory: 34.90, ybitan: 36.90, hatzi_hinam: 33.50, carrefour: 34.10 },
    'ביצים L 6 יח׳': { shufersal: 15.90, rami_levy: 14.90, victory: 16.90, ybitan: 17.90, hatzi_hinam: 15.50, carrefour: 14.10 },
    'ביצים XL 6 יח׳': { shufersal: 17.90, rami_levy: 16.90, victory: 18.90, ybitan: 19.90, hatzi_hinam: 17.50, carrefour: 16.10 },
    // חמאה ושמנת
    'חמאה 200 גרם': { shufersal: 14.50, rami_levy: 15.50, victory: 16.50, ybitan: 17.50, hatzi_hinam: 15.00, carrefour: 15.50 },
    'חמאה מלוחה 200 גרם': { shufersal: 15.50, rami_levy: 16.50, victory: 17.50, ybitan: 18.50, hatzi_hinam: 16.00, carrefour: 13.50 },
    'שמנת מתוקה 200 מ"ל': { shufersal: 9.50, rami_levy: 10.50, victory: 11.50, ybitan: 12.50, hatzi_hinam: 10.00, carrefour: 8.50 },
    'שמנת מתוקה 500 מ"ל': { shufersal: 18.50, rami_levy: 19.50, victory: 20.50, ybitan: 21.50, hatzi_hinam: 19.00, carrefour: 19.50 },
    'שמנת חמוצה 200 גרם': { shufersal: 7.50, rami_levy: 8.50, victory: 9.50, ybitan: 10.50, hatzi_hinam: 8.00, carrefour: 8.10 },
    'שמנת לקצפת 500 מ"ל': { shufersal: 11.50, rami_levy: 12.50, victory: 13.50, ybitan: 14.50, hatzi_hinam: 12.00, carrefour: 10.90 },
    'מרגרינה 250 גרם': { shufersal: 9.50, rami_levy: 10.50, victory: 11.50, ybitan: 12.50, hatzi_hinam: 10.00, carrefour: 8.50 },
    'טופו 300 גרם': { shufersal: 18.50, rami_levy: 19.50, victory: 20.50, ybitan: 21.50, hatzi_hinam: 19.00, carrefour: 17.50 },

    // ===== ממרחים (spreads) =====
    'נוטלה 350 גרם': { shufersal: 24.90, rami_levy: 23.90, victory: 25.90, ybitan: 26.90, hatzi_hinam: 22.90, carrefour: 23.50 },
    'נוטלה 750 גרם': { shufersal: 44.90, rami_levy: 42.90, victory: 45.90, ybitan: 47.90, hatzi_hinam: 41.90, carrefour: 41.90 },
    'ממרח שוקולד השחר העולה 400 גרם': { shufersal: 18.90, rami_levy: 17.90, victory: 19.90, ybitan: 20.90, hatzi_hinam: 16.90, carrefour: 15.90 },
    'ממרח שוקולד עלית 400 גרם': { shufersal: 19.90, rami_levy: 18.90, victory: 20.90, ybitan: 21.90, hatzi_hinam: 17.90, carrefour: 18.50 },
    'ממרח אגוזים 350 גרם': { shufersal: 22.90, rami_levy: 21.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 20.90, carrefour: 20.90 },
    'ממרח לוטוס 400 גרם': { shufersal: 26.90, rami_levy: 24.90, victory: 27.90, ybitan: 28.90, hatzi_hinam: 22.10, carrefour: 23.90 },
    'ממרח לוטוס': { shufersal: 26.90, rami_levy: 24.90, victory: 27.90, ybitan: 28.90, hatzi_hinam: 22.10, carrefour: 19.90 },
    'לוטוס': { shufersal: 26.90, rami_levy: 24.90, victory: 27.90, ybitan: 28.90, hatzi_hinam: 22.10, carrefour: 20.50 },
    'עוגיות לוטוס': { shufersal: 12.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 10.90, carrefour: 11.50 },
    // חמאות אגוזים
    'חמאת בוטנים חלקה 350 גרם': { shufersal: 24.90, rami_levy: 23.90, victory: 25.90, ybitan: 26.90, hatzi_hinam: 22.90, carrefour: 23.50 },
    'חמאת בוטנים קראנצ\'י 350 גרם': { shufersal: 24.90, rami_levy: 23.90, victory: 25.90, ybitan: 26.90, hatzi_hinam: 22.90, carrefour: 22.50 },
    'חמאת בוטנים סקיפי 350 גרם': { shufersal: 28.90, rami_levy: 27.90, victory: 29.90, ybitan: 30.90, hatzi_hinam: 26.90, carrefour: 26.50 },
    'חמאת שקדים 200 גרם': { shufersal: 32.90, rami_levy: 31.90, victory: 33.90, ybitan: 34.90, hatzi_hinam: 30.90, carrefour: 33.50 },
    'חמאת קשיו 200 גרם': { shufersal: 34.90, rami_levy: 33.90, victory: 35.90, ybitan: 36.90, hatzi_hinam: 32.90, carrefour: 35.10 },
    'חמאת אגוזי לוז 200 גרם': { shufersal: 36.90, rami_levy: 35.90, victory: 37.90, ybitan: 38.90, hatzi_hinam: 34.90, carrefour: 31.50 },
    // טחינה
    'טחינה 250 גרם': { shufersal: 16.90, rami_levy: 14.90, victory: 17.90, ybitan: 18.90, hatzi_hinam: 15.90, carrefour: 16.50 },
    'טחינה 500 גרם': { shufersal: 24.90, rami_levy: 22.90, victory: 25.90, ybitan: 26.90, hatzi_hinam: 23.90, carrefour: 22.90 },
    'טחינה גולמית 250 גרם': { shufersal: 19.90, rami_levy: 17.90, victory: 20.90, ybitan: 21.90, hatzi_hinam: 18.90, carrefour: 16.90 },
    'טחינה גולמית 500 גרם': { shufersal: 32.90, rami_levy: 29.90, victory: 33.90, ybitan: 34.90, hatzi_hinam: 30.90, carrefour: 33.10 },
    'טחינה אל ארז 500 גרם': { shufersal: 26.90, rami_levy: 24.90, victory: 27.90, ybitan: 28.90, hatzi_hinam: 25.90, carrefour: 26.90 },
    'טחינה הבאבא 500 גרם': { shufersal: 24.90, rami_levy: 22.90, victory: 25.90, ybitan: 26.90, hatzi_hinam: 23.90, carrefour: 25.50 },
    // חלווה
    'חלווה 400 גרם': { shufersal: 18.90, rami_levy: 16.90, victory: 19.90, ybitan: 20.90, hatzi_hinam: 17.90, carrefour: 19.10 },
    'חלווה פרוסות 250 גרם': { shufersal: 14.90, rami_levy: 13.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50, carrefour: 13.50 },
    'חלווה שוקולד 400 גרם': { shufersal: 19.90, rami_levy: 17.90, victory: 20.90, ybitan: 21.90, hatzi_hinam: 18.90, carrefour: 20.10 },
    'חלווה פיסטוק 400 גרם': { shufersal: 22.90, rami_levy: 20.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 21.90, carrefour: 23.90 },
    // ריבות
    'ריבה תות 350 גרם': { shufersal: 14.90, rami_levy: 13.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50, carrefour: 15.50 },
    'ריבה משמש 350 גרם': { shufersal: 14.90, rami_levy: 13.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50, carrefour: 14.50 },
    'ריבה דובדבן 350 גרם': { shufersal: 14.90, rami_levy: 13.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50, carrefour: 13.50 },
    'ריבה תפוז 350 גרם': { shufersal: 14.90, rami_levy: 13.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50, carrefour: 15.50 },
    'ריבה פטל 350 גרם': { shufersal: 16.90, rami_levy: 15.90, victory: 17.90, ybitan: 18.90, hatzi_hinam: 16.50, carrefour: 17.90 },
    'ריבה ללא סוכר 350 גרם': { shufersal: 18.90, rami_levy: 17.90, victory: 19.90, ybitan: 20.90, hatzi_hinam: 18.50, carrefour: 15.90 },
    'מרמלדה 350 גרם': { shufersal: 12.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50, carrefour: 13.50 },
    // דבש וסילאן
    'דבש טהור 350 גרם': { shufersal: 29.90, rami_levy: 27.90, victory: 30.90, ybitan: 31.90, hatzi_hinam: 28.90, carrefour: 31.90 },
    'דבש טהור 700 גרם': { shufersal: 49.90, rami_levy: 46.90, victory: 51.90, ybitan: 53.90, hatzi_hinam: 47.90, carrefour: 51.90 },
    'דבש פרחים 350 גרם': { shufersal: 32.90, rami_levy: 30.90, victory: 33.90, ybitan: 34.90, hatzi_hinam: 31.90, carrefour: 34.10 },
    'דבש אורגני 350 גרם': { shufersal: 39.90, rami_levy: 37.90, victory: 41.90, ybitan: 43.90, hatzi_hinam: 38.90, carrefour: 35.50 },
    'סילאן טהור 350 גרם': { shufersal: 22.90, rami_levy: 20.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 21.90, carrefour: 22.50 },
    'סילאן טהור 700 גרם': { shufersal: 39.90, rami_levy: 36.90, victory: 41.90, ybitan: 43.90, hatzi_hinam: 37.90, carrefour: 38.10 },
    // ממרחים מלוחים
    'ממרח שום 200 גרם': { shufersal: 12.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50, carrefour: 12.90 },
    'ממרח זיתים 200 גרם': { shufersal: 14.90, rami_levy: 13.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50, carrefour: 12.50 },
    'ממרח עגבניות מיובשות 200 גרם': { shufersal: 16.90, rami_levy: 15.90, victory: 17.90, ybitan: 18.90, hatzi_hinam: 16.50, carrefour: 17.10 },
    'ממרח ארטישוק 200 גרם': { shufersal: 18.90, rami_levy: 17.90, victory: 19.90, ybitan: 20.90, hatzi_hinam: 18.50, carrefour: 19.10 },
    'פסטו ירוק 190 גרם': { shufersal: 19.90, rami_levy: 18.90, victory: 20.90, ybitan: 21.90, hatzi_hinam: 19.50, carrefour: 18.90 },
    'פסטו אדום 190 גרם': { shufersal: 19.90, rami_levy: 18.90, victory: 20.90, ybitan: 21.90, hatzi_hinam: 19.50, carrefour: 19.50 },
    'ממרח חציל 200 גרם': { shufersal: 12.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50, carrefour: 13.10 },
    'חומוס ממרח 400 גרם': { shufersal: 12.90, rami_levy: 10.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.90, carrefour: 11.50 },

    // ===== פירות וירקות (רמי לוי וויקטורי זולים) =====
    'עגבניות': { shufersal: 9.90, rami_levy: 6.90, victory: 7.50, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 8.50 },
    'עגבניות שרי': { shufersal: 14.90, rami_levy: 11.90, victory: 12.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 12.50 },
    'עגבניות מגי': { shufersal: 16.90, rami_levy: 13.90, victory: 14.50, ybitan: 17.50, hatzi_hinam: 15.90, carrefour: 15.90 },
    'מלפפונים': { shufersal: 7.90, rami_levy: 4.90, victory: 5.50, ybitan: 8.50, hatzi_hinam: 6.90, carrefour: 6.10 },
    'מלפפון בייבי': { shufersal: 10.90, rami_levy: 7.90, victory: 8.50, ybitan: 11.50, hatzi_hinam: 9.90, carrefour: 8.50 },
    'בצל': { shufersal: 6.90, rami_levy: 3.90, victory: 4.50, ybitan: 7.50, hatzi_hinam: 5.90, carrefour: 6.10 },
    'בצל סגול': { shufersal: 8.90, rami_levy: 5.90, victory: 6.50, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 7.10 },
    'בצל ירוק': { shufersal: 5.90, rami_levy: 3.90, victory: 4.50, ybitan: 6.50, hatzi_hinam: 4.90, carrefour: 5.10 },
    'שום': { shufersal: 12.90, rami_levy: 9.90, victory: 10.50, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 12.90 },
    'שום קלוף': { shufersal: 16.90, rami_levy: 13.90, victory: 14.50, ybitan: 17.50, hatzi_hinam: 15.90, carrefour: 13.50 },
    'פלפל אדום': { shufersal: 14.90, rami_levy: 10.90, victory: 11.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 12.10 },
    'פלפל ירוק': { shufersal: 9.90, rami_levy: 6.90, victory: 7.50, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 9.50 },
    'פלפל צהוב': { shufersal: 14.90, rami_levy: 10.90, victory: 11.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 13.50 },
    'פלפל כתום': { shufersal: 14.90, rami_levy: 10.90, victory: 11.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 12.10 },
    'פלפל חריף': { shufersal: 29.90, rami_levy: 24.90, victory: 26.50, ybitan: 32.50, hatzi_hinam: 27.90, carrefour: 25.50 },
    'חסה': { shufersal: 8.90, rami_levy: 5.90, victory: 6.50, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 7.10 },
    'חסה אייסברג': { shufersal: 9.90, rami_levy: 6.90, victory: 7.50, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 9.50 },
    'חסה רומית': { shufersal: 8.90, rami_levy: 5.90, victory: 6.50, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 8.10 },
    'כרוב': { shufersal: 6.90, rami_levy: 3.90, victory: 4.50, ybitan: 7.50, hatzi_hinam: 5.90, carrefour: 5.50 },
    'כרוב סגול': { shufersal: 8.90, rami_levy: 5.90, victory: 6.50, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 6.90 },
    'כרוב סיני': { shufersal: 9.90, rami_levy: 6.90, victory: 7.50, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 9.50 },
    'גזר': { shufersal: 6.90, rami_levy: 3.90, victory: 4.50, ybitan: 7.50, hatzi_hinam: 5.90, carrefour: 6.50 },
    'גזר בייבי': { shufersal: 10.90, rami_levy: 7.90, victory: 8.50, ybitan: 11.50, hatzi_hinam: 9.90, carrefour: 9.90 },
    'סלק': { shufersal: 7.90, rami_levy: 4.90, victory: 5.50, ybitan: 8.50, hatzi_hinam: 6.90, carrefour: 6.10 },
    'סלק מבושל': { shufersal: 12.90, rami_levy: 9.90, victory: 10.50, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 13.10 },
    'תפו״א אדום': { shufersal: 6.90, rami_levy: 3.90, victory: 4.50, ybitan: 7.50, hatzi_hinam: 5.90, carrefour: 6.10 },
    'תפו״א לבן': { shufersal: 6.90, rami_levy: 3.90, victory: 4.50, ybitan: 7.50, hatzi_hinam: 5.90, carrefour: 5.10 },
    'בטטה': { shufersal: 9.90, rami_levy: 6.90, victory: 7.50, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 8.50 },
    'קישוא': { shufersal: 8.90, rami_levy: 5.90, victory: 6.50, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 8.10 },
    'קישוא ירוק': { shufersal: 8.90, rami_levy: 5.90, victory: 6.50, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 8.50 },
    'חציל': { shufersal: 9.90, rami_levy: 6.90, victory: 7.50, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 9.50 },
    'ברוקולי': { shufersal: 14.90, rami_levy: 10.90, victory: 11.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 14.10 },
    'כרובית': { shufersal: 10.90, rami_levy: 7.90, victory: 8.50, ybitan: 11.50, hatzi_hinam: 9.90, carrefour: 8.50 },
    'תרד': { shufersal: 10.90, rami_levy: 7.90, victory: 8.50, ybitan: 11.50, hatzi_hinam: 9.90, carrefour: 8.50 },
    'תרד בייבי': { shufersal: 14.90, rami_levy: 11.90, victory: 12.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 11.90 },
    'פטרוזיליה': { shufersal: 5.90, rami_levy: 3.90, victory: 4.50, ybitan: 6.50, hatzi_hinam: 4.90, carrefour: 5.10 },
    'כוסברה': { shufersal: 5.90, rami_levy: 3.90, victory: 4.50, ybitan: 6.50, hatzi_hinam: 4.90, carrefour: 4.90 },
    'נענע': { shufersal: 5.90, rami_levy: 3.90, victory: 4.50, ybitan: 6.50, hatzi_hinam: 4.90, carrefour: 5.10 },
    'שמיר': { shufersal: 5.90, rami_levy: 3.90, victory: 4.50, ybitan: 6.50, hatzi_hinam: 4.90, carrefour: 4.50 },
    'ריחן': { shufersal: 6.90, rami_levy: 4.90, victory: 5.50, ybitan: 7.50, hatzi_hinam: 5.90, carrefour: 5.50 },
    'רוקט': { shufersal: 10.90, rami_levy: 7.90, victory: 8.50, ybitan: 11.50, hatzi_hinam: 9.90, carrefour: 8.50 },
    'סלרי': { shufersal: 8.90, rami_levy: 5.90, victory: 6.50, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 8.10 },
    'שומר': { shufersal: 9.90, rami_levy: 6.90, victory: 7.50, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 9.50 },
    'פטריות שמפיניון': { shufersal: 16.90, rami_levy: 13.90, victory: 14.50, ybitan: 17.50, hatzi_hinam: 15.90, carrefour: 13.50 },
    'פטריות פורטובלו': { shufersal: 22.90, rami_levy: 18.90, victory: 19.50, ybitan: 23.50, hatzi_hinam: 20.90, carrefour: 19.90 },
    // פירות
    'בננות': { shufersal: 9.90, rami_levy: 6.90, victory: 5.90, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 9.10 },
    'תפוחים ירוקים': { shufersal: 12.90, rami_levy: 9.90, victory: 8.90, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 10.50 },
    'תפוחים אדומים': { shufersal: 12.90, rami_levy: 9.90, victory: 8.90, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 10.50 },
    'תפוזים': { shufersal: 8.90, rami_levy: 5.90, victory: 4.90, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 6.90 },
    'קלמנטינות': { shufersal: 13.90, rami_levy: 10.90, victory: 9.90, ybitan: 14.50, hatzi_hinam: 12.90, carrefour: 13.90 },
    'אשכולית': { shufersal: 7.90, rami_levy: 4.90, victory: 3.90, ybitan: 8.50, hatzi_hinam: 6.90, carrefour: 6.10 },
    'אשכולית אדומה': { shufersal: 8.90, rami_levy: 5.90, victory: 4.90, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 7.50 },
    'פומלה': { shufersal: 9.90, rami_levy: 6.90, victory: 5.90, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 9.50 },
    'לימון': { shufersal: 9.90, rami_levy: 6.90, victory: 5.90, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 8.50 },
    'ליים': { shufersal: 12.90, rami_levy: 9.90, victory: 8.90, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 10.50 },
    'אבוקדו': { shufersal: 7.90, rami_levy: 5.90, victory: 4.90, ybitan: 8.50, hatzi_hinam: 6.90, carrefour: 7.10 },
    'מנגו': { shufersal: 16.90, rami_levy: 13.90, victory: 12.90, ybitan: 17.50, hatzi_hinam: 15.90, carrefour: 16.50 },
    'אננס': { shufersal: 18.90, rami_levy: 14.90, victory: 13.90, ybitan: 19.50, hatzi_hinam: 16.90, carrefour: 16.50 },
    'ענבים ירוקים': { shufersal: 26.90, rami_levy: 22.90, victory: 21.90, ybitan: 27.50, hatzi_hinam: 24.90, carrefour: 27.10 },
    'ענבים שחורים': { shufersal: 26.90, rami_levy: 22.90, victory: 21.90, ybitan: 27.50, hatzi_hinam: 24.90, carrefour: 26.10 },
    'אגס': { shufersal: 15.90, rami_levy: 12.90, victory: 11.90, ybitan: 16.50, hatzi_hinam: 14.90, carrefour: 16.10 },
    'שזיפים': { shufersal: 19.90, rami_levy: 16.90, victory: 15.90, ybitan: 20.50, hatzi_hinam: 18.90, carrefour: 19.10 },
    'אפרסקים': { shufersal: 17.90, rami_levy: 14.90, victory: 13.90, ybitan: 18.50, hatzi_hinam: 16.90, carrefour: 18.10 },
    'נקטרינות': { shufersal: 17.90, rami_levy: 14.90, victory: 13.90, ybitan: 18.50, hatzi_hinam: 16.90, carrefour: 17.90 },
    'קיווי': { shufersal: 5.90, rami_levy: 4.90, victory: 3.90, ybitan: 6.50, hatzi_hinam: 5.50, carrefour: 4.90 },
    'רימונים': { shufersal: 10.90, rami_levy: 7.90, victory: 6.90, ybitan: 11.50, hatzi_hinam: 9.90, carrefour: 10.50 },
    'תותים': { shufersal: 26.90, rami_levy: 22.90, victory: 21.90, ybitan: 27.50, hatzi_hinam: 24.90, carrefour: 25.90 },
    'אוכמניות': { shufersal: 36.90, rami_levy: 32.90, victory: 31.90, ybitan: 37.50, hatzi_hinam: 34.90, carrefour: 37.50 },
    'פטל': { shufersal: 31.90, rami_levy: 27.90, victory: 26.90, ybitan: 32.50, hatzi_hinam: 29.90, carrefour: 31.50 },
    'דובדבנים': { shufersal: 41.90, rami_levy: 37.90, victory: 36.90, ybitan: 42.50, hatzi_hinam: 39.90, carrefour: 43.10 },
    'אבטיח': { shufersal: 4.90, rami_levy: 2.90, victory: 2.50, ybitan: 5.50, hatzi_hinam: 3.90, carrefour: 3.90 },
    'מלון': { shufersal: 6.90, rami_levy: 4.90, victory: 3.90, ybitan: 7.50, hatzi_hinam: 5.90, carrefour: 5.50 },

    // ===== לחם ומאפים (ויקטורי זול) =====
    'לחם': { shufersal: 9.90, rami_levy: 8.90, victory: 7.50, ybitan: 9.50, hatzi_hinam: 8.50, carrefour: 7.90 },
    'לחם מלא': { shufersal: 12.90, rami_levy: 11.90, victory: 9.50, ybitan: 12.50, hatzi_hinam: 10.90, carrefour: 10.10 },
    'לחם שיפון': { shufersal: 14.90, rami_levy: 13.90, victory: 11.50, ybitan: 14.50, hatzi_hinam: 12.90, carrefour: 13.10 },
    'לחם כוסמין': { shufersal: 16.90, rami_levy: 15.90, victory: 13.50, ybitan: 16.50, hatzi_hinam: 14.90, carrefour: 14.10 },
    'לחם דגנים': { shufersal: 13.90, rami_levy: 12.90, victory: 10.50, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 11.50 },
    'לחם פרוס': { shufersal: 10.90, rami_levy: 9.90, victory: 8.50, ybitan: 10.50, hatzi_hinam: 9.50, carrefour: 9.50 },
    'לחם אחיד': { shufersal: 5.90, rami_levy: 5.90, victory: 5.90, ybitan: 5.90, hatzi_hinam: 5.90, carrefour: 5.10 },
    'לחם ללא גלוטן': { shufersal: 24.90, rami_levy: 23.90, victory: 21.50, ybitan: 24.50, hatzi_hinam: 22.90, carrefour: 24.50 },
    'חלה': { shufersal: 13.90, rami_levy: 12.90, victory: 10.50, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 11.10 },
    'חלה מלאה': { shufersal: 15.90, rami_levy: 14.90, victory: 12.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 15.10 },
    'חלה מתוקה': { shufersal: 14.90, rami_levy: 13.90, victory: 11.50, ybitan: 14.50, hatzi_hinam: 12.90, carrefour: 11.90 },
    'פיתות': { shufersal: 8.90, rami_levy: 7.90, victory: 6.50, ybitan: 8.50, hatzi_hinam: 7.50, carrefour: 7.90 },
    'פיתות מלאות': { shufersal: 10.90, rami_levy: 9.90, victory: 8.50, ybitan: 10.50, hatzi_hinam: 9.50, carrefour: 8.50 },
    'פיתות מיני': { shufersal: 7.90, rami_levy: 6.90, victory: 5.50, ybitan: 7.50, hatzi_hinam: 6.50, carrefour: 5.50 },
    'לחמניות': { shufersal: 15.90, rami_levy: 14.90, victory: 12.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 12.50 },
    'לחמניות המבורגר': { shufersal: 14.90, rami_levy: 13.90, victory: 11.50, ybitan: 14.50, hatzi_hinam: 12.90, carrefour: 12.10 },
    'לחמניות נקניקיה': { shufersal: 13.90, rami_levy: 12.90, victory: 10.50, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 11.50 },
    'בגט': { shufersal: 8.90, rami_levy: 7.90, victory: 6.50, ybitan: 8.50, hatzi_hinam: 7.50, carrefour: 7.10 },
    'צ\'בטה': { shufersal: 10.90, rami_levy: 9.90, victory: 8.50, ybitan: 10.50, hatzi_hinam: 9.50, carrefour: 10.10 },
    'פוקצ\'ה': { shufersal: 16.90, rami_levy: 15.90, victory: 13.50, ybitan: 16.50, hatzi_hinam: 14.90, carrefour: 12.90 },
    'טורטייה': { shufersal: 15.90, rami_levy: 14.90, victory: 12.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 15.10 },
    'לאפה': { shufersal: 9.90, rami_levy: 8.90, victory: 7.50, ybitan: 9.50, hatzi_hinam: 8.50, carrefour: 7.10 },
    'קרואסון': { shufersal: 7.90, rami_levy: 6.90, victory: 5.50, ybitan: 7.50, hatzi_hinam: 6.50, carrefour: 6.10 },
    'קרואסון שוקולד': { shufersal: 9.90, rami_levy: 8.90, victory: 7.50, ybitan: 9.50, hatzi_hinam: 8.50, carrefour: 8.10 },
    'בורקס': { shufersal: 9.90, rami_levy: 8.90, victory: 7.50, ybitan: 9.50, hatzi_hinam: 8.50, carrefour: 7.50 },
    'בורקס גבינה': { shufersal: 14.90, rami_levy: 13.90, victory: 11.50, ybitan: 14.50, hatzi_hinam: 12.90, carrefour: 12.50 },
    'בורקס תפו״א': { shufersal: 12.90, rami_levy: 11.90, victory: 9.50, ybitan: 12.50, hatzi_hinam: 10.90, carrefour: 9.50 },
    'בורקס פטריות': { shufersal: 14.90, rami_levy: 13.90, victory: 11.50, ybitan: 14.50, hatzi_hinam: 12.90, carrefour: 13.50 },
    'עוגיות': { shufersal: 12.90, rami_levy: 11.90, victory: 9.50, ybitan: 12.50, hatzi_hinam: 10.90, carrefour: 11.90 },
    'עוגיות שוקולד צ\'יפס': { shufersal: 14.90, rami_levy: 13.90, victory: 11.50, ybitan: 14.50, hatzi_hinam: 12.90, carrefour: 12.10 },
    'עוגיות חמאה': { shufersal: 13.90, rami_levy: 12.90, victory: 10.50, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 11.50 },
    'מצות': { shufersal: 12.90, rami_levy: 11.90, victory: 9.50, ybitan: 12.50, hatzi_hinam: 10.90, carrefour: 9.50 },
    'מצות מלאות': { shufersal: 14.90, rami_levy: 13.90, victory: 11.50, ybitan: 14.50, hatzi_hinam: 12.90, carrefour: 12.50 },
    'קרקרים': { shufersal: 9.90, rami_levy: 8.90, victory: 7.50, ybitan: 9.50, hatzi_hinam: 8.50, carrefour: 9.10 },

    // ===== משקאות (חצי חינם זול) =====
    'מים מינרליים 0.5 ליטר': { shufersal: 4.90, rami_levy: 4.50, victory: 4.70, ybitan: 5.50, hatzi_hinam: 2.90, carrefour: 2.90 },
    'מים מינרליים 1.5 ליטר': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 7.90, hatzi_hinam: 3.50, carrefour: 3.50 },
    'מים בטעמים 1.5 ליטר': { shufersal: 7.90, rami_levy: 6.90, victory: 7.50, ybitan: 8.90, hatzi_hinam: 4.50, carrefour: 4.50 },
    'מי עדן 0.5 ליטר': { shufersal: 4.90, rami_levy: 4.50, victory: 4.70, ybitan: 5.50, hatzi_hinam: 2.90, carrefour: 2.90 },
    'מי עדן 1.5 ליטר': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 7.90, hatzi_hinam: 3.50, carrefour: 3.10 },
    'נביעות 0.5 ליטר': { shufersal: 4.90, rami_levy: 4.50, victory: 4.70, ybitan: 5.50, hatzi_hinam: 2.90, carrefour: 2.50 },
    'נביעות 1.5 ליטר': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 7.90, hatzi_hinam: 3.50, carrefour: 3.50 },
    // קולה
    'קולה 0.5 ליטר': { shufersal: 6.90, rami_levy: 6.50, victory: 6.70, ybitan: 7.50, hatzi_hinam: 4.90, carrefour: 5.10 },
    'קולה 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 5.90 },
    'קולה 2 ליטר': { shufersal: 11.90, rami_levy: 10.90, victory: 11.50, ybitan: 12.90, hatzi_hinam: 8.50, carrefour: 8.10 },
    'קולה זירו 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 7.10 },
    'קולה זירו 2 ליטר': { shufersal: 11.90, rami_levy: 10.90, victory: 11.50, ybitan: 12.90, hatzi_hinam: 8.50, carrefour: 7.50 },
    'קולה דיאט 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 6.90 },
    'קולה פחית 330 מ"ל': { shufersal: 5.90, rami_levy: 5.50, victory: 5.70, ybitan: 6.50, hatzi_hinam: 4.50, carrefour: 4.10 },
    'קולה זירו פחית 330 מ"ל': { shufersal: 5.90, rami_levy: 5.50, victory: 5.70, ybitan: 6.50, hatzi_hinam: 4.50, carrefour: 4.10 },
    'שישיית קולה פחיות': { shufersal: 29.90, rami_levy: 26.90, victory: 28.90, ybitan: 32.90, hatzi_hinam: 24.90, carrefour: 24.90 },
    'שישיית קולה זירו פחיות': { shufersal: 29.90, rami_levy: 26.90, victory: 28.90, ybitan: 32.90, hatzi_hinam: 24.90, carrefour: 22.50 },
    'שישיית קולה 1.5 ליטר': { shufersal: 44.90, rami_levy: 41.90, victory: 43.90, ybitan: 47.90, hatzi_hinam: 39.90, carrefour: 34.10 },
    'שישיית קולה זירו 1.5 ליטר': { shufersal: 44.90, rami_levy: 41.90, victory: 43.90, ybitan: 47.90, hatzi_hinam: 39.90, carrefour: 34.10 },
    // פפסי
    'פפסי 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 6.90 },
    'פפסי 2 ליטר': { shufersal: 11.90, rami_levy: 10.90, victory: 11.50, ybitan: 12.90, hatzi_hinam: 8.50, carrefour: 7.90 },
    'פפסי מקס 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 7.10 },
    'פפסי פחית 330 מ"ל': { shufersal: 5.50, rami_levy: 5.00, victory: 5.30, ybitan: 6.00, hatzi_hinam: 4.00, carrefour: 3.90 },
    'פפסי מקס פחית 330 מ"ל': { shufersal: 5.50, rami_levy: 5.00, victory: 5.30, ybitan: 6.00, hatzi_hinam: 4.00, carrefour: 4.10 },
    'שישיית פפסי פחיות': { shufersal: 27.90, rami_levy: 24.90, victory: 26.90, ybitan: 29.90, hatzi_hinam: 22.90, carrefour: 19.90 },
    'שישיית פפסי 1.5 ליטר': { shufersal: 42.90, rami_levy: 39.90, victory: 41.90, ybitan: 45.90, hatzi_hinam: 37.90, carrefour: 38.50 },
    // ספרייט ופאנטה
    'ספרייט 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 6.90 },
    'ספרייט זירו 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 6.50 },
    'ספרייט פחית 330 מ"ל': { shufersal: 5.90, rami_levy: 5.50, victory: 5.70, ybitan: 6.50, hatzi_hinam: 4.50, carrefour: 4.10 },
    'שישיית ספרייט פחיות': { shufersal: 29.90, rami_levy: 26.90, victory: 28.90, ybitan: 32.90, hatzi_hinam: 24.90, carrefour: 25.10 },
    'שישיית ספרייט 1.5 ליטר': { shufersal: 44.90, rami_levy: 41.90, victory: 43.90, ybitan: 47.90, hatzi_hinam: 39.90, carrefour: 35.90 },
    'פאנטה 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 6.50 },
    'פאנטה 2 ליטר': { shufersal: 11.90, rami_levy: 10.90, victory: 11.50, ybitan: 12.90, hatzi_hinam: 8.50, carrefour: 7.90 },
    'פאנטה פחית 330 מ"ל': { shufersal: 5.90, rami_levy: 5.50, victory: 5.70, ybitan: 6.50, hatzi_hinam: 4.50, carrefour: 4.10 },
    'שישיית פאנטה פחיות': { shufersal: 29.90, rami_levy: 26.90, victory: 28.90, ybitan: 32.90, hatzi_hinam: 24.90, carrefour: 26.10 },
    'שישיית פאנטה 1.5 ליטר': { shufersal: 44.90, rami_levy: 41.90, victory: 43.90, ybitan: 47.90, hatzi_hinam: 39.90, carrefour: 34.50 },
    // שוופס וסודה
    'שוופס 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 6.10 },
    'סודה 1.5 ליטר': { shufersal: 5.90, rami_levy: 4.90, victory: 5.50, ybitan: 6.90, hatzi_hinam: 3.50, carrefour: 3.50 },
    'סודה פחית 330 מ"ל': { shufersal: 4.90, rami_levy: 4.50, victory: 4.70, ybitan: 5.50, hatzi_hinam: 3.50, carrefour: 3.50 },
    'טוניק 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 6.10 },
    'טוניק פחית 330 מ"ל': { shufersal: 5.90, rami_levy: 5.50, victory: 5.70, ybitan: 6.50, hatzi_hinam: 4.50, carrefour: 4.90 },
    'שישיית שוופס פחיות': { shufersal: 29.90, rami_levy: 26.90, victory: 28.90, ybitan: 32.90, hatzi_hinam: 24.90, carrefour: 22.10 },
    // מיצים
    'מיץ תפוזים 1 ליטר': { shufersal: 15.90, rami_levy: 13.90, victory: 14.50, ybitan: 16.90, hatzi_hinam: 11.50, carrefour: 12.10 },
    'מיץ תפוזים סחוט 1 ליטר': { shufersal: 18.90, rami_levy: 16.90, victory: 17.50, ybitan: 19.90, hatzi_hinam: 14.50, carrefour: 15.10 },
    'מיץ תפוחים 1 ליטר': { shufersal: 14.90, rami_levy: 12.90, victory: 13.50, ybitan: 15.90, hatzi_hinam: 10.50, carrefour: 9.10 },
    'מיץ ענבים 1 ליטר': { shufersal: 16.90, rami_levy: 14.90, victory: 15.50, ybitan: 17.90, hatzi_hinam: 12.50, carrefour: 11.10 },
    'מיץ גזר 1 ליטר': { shufersal: 15.90, rami_levy: 13.90, victory: 14.50, ybitan: 16.90, hatzi_hinam: 11.50, carrefour: 11.90 },
    'מיץ רימונים 1 ליטר': { shufersal: 22.90, rami_levy: 19.90, victory: 21.50, ybitan: 24.90, hatzi_hinam: 17.50, carrefour: 15.50 },
    'מיץ פריגת 1.5 ליטר': { shufersal: 13.90, rami_levy: 11.90, victory: 12.50, ybitan: 14.90, hatzi_hinam: 9.50, carrefour: 8.90 },
    'מיץ ספרינג 1.5 ליטר': { shufersal: 13.90, rami_levy: 11.90, victory: 12.50, ybitan: 14.90, hatzi_hinam: 9.50, carrefour: 8.90 },
    'נקטר 1 ליטר': { shufersal: 12.90, rami_levy: 10.90, victory: 11.50, ybitan: 13.90, hatzi_hinam: 8.50, carrefour: 8.10 },
    'תפוזינה 1.5 ליטר': { shufersal: 14.90, rami_levy: 12.90, victory: 13.50, ybitan: 15.90, hatzi_hinam: 10.50, carrefour: 11.50 },
    'לימונדה 1.5 ליטר': { shufersal: 11.90, rami_levy: 9.90, victory: 10.50, ybitan: 12.90, hatzi_hinam: 7.50, carrefour: 7.90 },
    'לימונענע 1.5 ליטר': { shufersal: 11.90, rami_levy: 9.90, victory: 10.50, ybitan: 12.90, hatzi_hinam: 7.50, carrefour: 8.10 },
    // אנרגיה
    'XL פחית 250 מ"ל': { shufersal: 7.90, rami_levy: 6.90, victory: 7.50, ybitan: 8.90, hatzi_hinam: 5.50, carrefour: 5.90 },
    'רד בול פחית 250 מ"ל': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 7.50, carrefour: 7.90 },
    'מונסטר פחית 500 מ"ל': { shufersal: 11.90, rami_levy: 10.90, victory: 11.50, ybitan: 12.90, hatzi_hinam: 9.50, carrefour: 9.10 },
    'משקה ספורט 500 מ"ל': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 6.50, carrefour: 7.10 },
    'מי קוקוס 330 מ"ל': { shufersal: 12.90, rami_levy: 11.90, victory: 12.50, ybitan: 13.90, hatzi_hinam: 10.50, carrefour: 9.50 },

    // ===== חטיפים (חצי חינם זול) =====
    'במבה': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 5.50, carrefour: 5.10 },
    'במבה אדומים': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 5.50, carrefour: 4.90 },
    'במבה נוגט': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 5.90 },
    'ביסלי': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 5.50, carrefour: 5.50 },
    'ביסלי גריל': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 5.50, carrefour: 5.50 },
    'ביסלי בצל': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 5.50, carrefour: 5.90 },
    'ביסלי פיצה': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 5.50, carrefour: 5.10 },
    'דוריטוס': { shufersal: 12.90, rami_levy: 11.90, victory: 12.50, ybitan: 13.90, hatzi_hinam: 9.90, carrefour: 9.50 },
    'דוריטוס צ\'ילי': { shufersal: 12.90, rami_levy: 11.90, victory: 12.50, ybitan: 13.90, hatzi_hinam: 9.90, carrefour: 9.50 },
    'טורטייה צ\'יפס': { shufersal: 11.90, rami_levy: 10.90, victory: 11.50, ybitan: 12.90, hatzi_hinam: 8.90, carrefour: 8.90 },
    'תפוצ\'יפס': { shufersal: 10.90, rami_levy: 9.90, victory: 10.50, ybitan: 11.90, hatzi_hinam: 7.50, carrefour: 6.50 },
    'פרינגלס': { shufersal: 14.90, rami_levy: 13.90, victory: 14.50, ybitan: 15.90, hatzi_hinam: 11.90, carrefour: 11.10 },
    'פרינגלס חמוץ': { shufersal: 14.90, rami_levy: 13.90, victory: 14.50, ybitan: 15.90, hatzi_hinam: 11.90, carrefour: 11.50 },
    'פופקורן': { shufersal: 7.90, rami_levy: 6.90, victory: 7.50, ybitan: 8.90, hatzi_hinam: 4.50, carrefour: 4.10 },
    'פופקורן מיקרו': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 6.90 },
    'פופקורן קרמל': { shufersal: 12.90, rami_levy: 11.90, victory: 12.50, ybitan: 13.90, hatzi_hinam: 9.90, carrefour: 10.10 },
    'שוקולד': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 6.50, carrefour: 5.90 },
    'שוקולד פרה': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 7.50, carrefour: 6.90 },
    'שוקולד מילקה': { shufersal: 12.90, rami_levy: 11.90, victory: 12.50, ybitan: 13.90, hatzi_hinam: 9.90, carrefour: 10.90 },
    'שוקולד חלב': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 6.50, carrefour: 6.50 },
    'שוקולד מריר': { shufersal: 12.90, rami_levy: 11.90, victory: 12.50, ybitan: 13.90, hatzi_hinam: 9.90, carrefour: 9.50 },
    'שוקולד לבן': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 7.50, carrefour: 6.50 },
    'שוקולד עם אגוזים': { shufersal: 14.90, rami_levy: 13.90, victory: 14.50, ybitan: 15.90, hatzi_hinam: 11.90, carrefour: 10.50 },
    'קינדר': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 6.50, carrefour: 6.10 },
    'סניקרס': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 7.90, hatzi_hinam: 4.90, carrefour: 4.10 },
    'מארס': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 7.90, hatzi_hinam: 4.90, carrefour: 4.90 },
    'טוויקס': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 7.90, hatzi_hinam: 4.90, carrefour: 5.10 },
    'קיטקט': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 7.90, hatzi_hinam: 4.90, carrefour: 4.90 },
    'עוגיות אוראו': { shufersal: 12.90, rami_levy: 11.90, victory: 12.50, ybitan: 13.90, hatzi_hinam: 9.90, carrefour: 10.10 },

    // ===== תבלינים =====
    'מלח שולחן 500 גרם': { shufersal: 3.50, rami_levy: 3.90, victory: 4.50, ybitan: 5.50, hatzi_hinam: 3.90, carrefour: 4.10 },
    'מלח שולחן 1 ק"ג': { shufersal: 5.50, rami_levy: 5.90, victory: 6.50, ybitan: 7.50, hatzi_hinam: 5.90, carrefour: 6.50 },
    'מלח ים 500 גרם': { shufersal: 6.50, rami_levy: 6.90, victory: 7.50, ybitan: 8.50, hatzi_hinam: 6.90, carrefour: 7.10 },
    'מלח גס 1 ק"ג': { shufersal: 4.50, rami_levy: 4.90, victory: 5.50, ybitan: 6.50, hatzi_hinam: 4.90, carrefour: 4.10 },
    'פלפל שחור טחון 80 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 9.90 },
    'פלפל שחור גרוס 80 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 8.50 },
    'פפריקה מתוקה 80 גרם': { shufersal: 8.50, rami_levy: 7.90, victory: 9.50, ybitan: 10.50, hatzi_hinam: 8.50, carrefour: 8.10 },
    'פפריקה מתוקה 100 גרם': { shufersal: 10.50, rami_levy: 9.90, victory: 11.50, ybitan: 12.50, hatzi_hinam: 10.50, carrefour: 10.50 },
    'פפריקה חריפה 80 גרם': { shufersal: 8.50, rami_levy: 7.90, victory: 9.50, ybitan: 10.50, hatzi_hinam: 8.50, carrefour: 7.10 },
    'פפריקה חריפה 100 גרם': { shufersal: 10.50, rami_levy: 9.90, victory: 11.50, ybitan: 12.50, hatzi_hinam: 10.50, carrefour: 10.10 },
    'פפריקה מעושנת 80 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 8.50 },
    'פפריקה מעושנת 100 גרם': { shufersal: 11.50, rami_levy: 10.90, victory: 12.50, ybitan: 13.50, hatzi_hinam: 11.50, carrefour: 10.10 },
    'כורכום 80 גרם': { shufersal: 12.50, rami_levy: 11.90, victory: 13.50, ybitan: 14.50, hatzi_hinam: 12.50, carrefour: 11.90 },
    'כמון 80 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 9.50 },
    'קינמון טחון 80 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 10.50 },
    'מקלות קינמון 50 גרם': { shufersal: 12.50, rami_levy: 11.90, victory: 13.50, ybitan: 14.50, hatzi_hinam: 12.50, carrefour: 10.50 },
    'אבקת שום 80 גרם': { shufersal: 8.50, rami_levy: 7.90, victory: 9.50, ybitan: 10.50, hatzi_hinam: 8.50, carrefour: 9.50 },
    'אבקת בצל 80 גרם': { shufersal: 8.50, rami_levy: 7.90, victory: 9.50, ybitan: 10.50, hatzi_hinam: 8.50, carrefour: 7.90 },
    'אורגנו 50 גרם': { shufersal: 7.50, rami_levy: 6.90, victory: 8.50, ybitan: 9.50, hatzi_hinam: 7.50, carrefour: 6.50 },
    'בזיליקום יבש 50 גרם': { shufersal: 7.50, rami_levy: 6.90, victory: 8.50, ybitan: 9.50, hatzi_hinam: 7.50, carrefour: 7.90 },
    'רוזמרין יבש 50 גרם': { shufersal: 7.50, rami_levy: 6.90, victory: 8.50, ybitan: 9.50, hatzi_hinam: 7.50, carrefour: 7.10 },
    'טימין יבש 50 גרם': { shufersal: 7.50, rami_levy: 6.90, victory: 8.50, ybitan: 9.50, hatzi_hinam: 7.50, carrefour: 7.50 },
    'זעתר 200 גרם': { shufersal: 18.50, rami_levy: 16.90, victory: 19.50, ybitan: 21.50, hatzi_hinam: 17.50, carrefour: 16.50 },
    'סומק 100 גרם': { shufersal: 12.50, rami_levy: 11.90, victory: 13.50, ybitan: 14.50, hatzi_hinam: 12.50, carrefour: 11.50 },
    'חוואייג׳ 100 גרם': { shufersal: 14.50, rami_levy: 13.90, victory: 15.50, ybitan: 16.50, hatzi_hinam: 14.50, carrefour: 12.50 },
    'תבלין לעוף 100 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 8.50 },
    'תבלין לדגים 100 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 8.50 },
    'תבלין לבשר 100 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 10.50 },
    'תבלין גריל 100 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 8.90 },
    'קארי 80 גרם': { shufersal: 11.50, rami_levy: 10.90, victory: 12.50, ybitan: 13.50, hatzi_hinam: 11.50, carrefour: 12.50 },
    'גרם מסאלה 80 גרם': { shufersal: 12.50, rami_levy: 11.90, victory: 13.50, ybitan: 14.50, hatzi_hinam: 12.50, carrefour: 13.50 },
    'ציילי 50 גרם': { shufersal: 8.50, rami_levy: 7.90, victory: 9.50, ybitan: 10.50, hatzi_hinam: 8.50, carrefour: 7.10 },
    'קיאן 50 גרם': { shufersal: 8.50, rami_levy: 7.90, victory: 9.50, ybitan: 10.50, hatzi_hinam: 8.50, carrefour: 7.50 },
    'זנגביל טחון 80 גרם': { shufersal: 10.50, rami_levy: 9.90, victory: 11.50, ybitan: 12.50, hatzi_hinam: 10.50, carrefour: 10.50 },
    'אגוז מוסקט 50 גרם': { shufersal: 14.50, rami_levy: 13.90, victory: 15.50, ybitan: 16.50, hatzi_hinam: 14.50, carrefour: 14.50 },
    'ציפורן 50 גרם': { shufersal: 12.50, rami_levy: 11.90, victory: 13.50, ybitan: 14.50, hatzi_hinam: 12.50, carrefour: 13.50 },
    'כוסברה טחונה 80 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 9.50 },
    'קרדמון 50 גרם': { shufersal: 18.50, rami_levy: 16.90, victory: 19.50, ybitan: 21.50, hatzi_hinam: 17.50, carrefour: 15.10 },
    'עלי דפנה 20 גרם': { shufersal: 6.50, rami_levy: 5.90, victory: 7.50, ybitan: 8.50, hatzi_hinam: 6.50, carrefour: 5.90 },
    'הל 50 גרם': { shufersal: 16.50, rami_levy: 15.90, victory: 17.50, ybitan: 18.50, hatzi_hinam: 16.50, carrefour: 16.10 },
    'כוכב אניס 50 גרם': { shufersal: 12.50, rami_levy: 11.90, victory: 13.50, ybitan: 14.50, hatzi_hinam: 12.50, carrefour: 13.50 },
    'שומר זרעים 80 גרם': { shufersal: 8.50, rami_levy: 7.90, victory: 9.50, ybitan: 10.50, hatzi_hinam: 8.50, carrefour: 8.50 },

    // ===== בשר (רמי לוי זול) =====
    'עוף שלם טרי': { shufersal: 34.90, rami_levy: 26.90, victory: 31.90, ybitan: 36.90, hatzi_hinam: 30.90, carrefour: 33.50 },
    'עוף שלם קפוא': { shufersal: 29.90, rami_levy: 22.90, victory: 26.90, ybitan: 31.90, hatzi_hinam: 25.90, carrefour: 27.50 },
    'חזה עוף טרי': { shufersal: 44.90, rami_levy: 36.90, victory: 41.90, ybitan: 46.90, hatzi_hinam: 40.90, carrefour: 42.50 },
    'חזה עוף קפוא': { shufersal: 39.90, rami_levy: 31.90, victory: 36.90, ybitan: 41.90, hatzi_hinam: 35.90, carrefour: 34.10 },
    'כרעיים עוף טריות': { shufersal: 24.90, rami_levy: 18.90, victory: 22.90, ybitan: 26.90, hatzi_hinam: 21.90, carrefour: 22.90 },
    'כרעיים עוף קפואות': { shufersal: 19.90, rami_levy: 14.90, victory: 17.90, ybitan: 21.90, hatzi_hinam: 16.90, carrefour: 18.10 },
    'שוקיים עוף טריים': { shufersal: 29.90, rami_levy: 23.90, victory: 27.90, ybitan: 31.90, hatzi_hinam: 26.90, carrefour: 28.50 },
    'כנפיים עוף טריות': { shufersal: 22.90, rami_levy: 16.90, victory: 20.90, ybitan: 24.90, hatzi_hinam: 19.90, carrefour: 18.10 },
    'עוף טחון טרי': { shufersal: 36.90, rami_levy: 29.90, victory: 33.90, ybitan: 38.90, hatzi_hinam: 32.90, carrefour: 29.50 },
    'בשר טחון טרי': { shufersal: 52.90, rami_levy: 44.90, victory: 49.90, ybitan: 54.90, hatzi_hinam: 48.90, carrefour: 52.10 },
    'בשר טחון קפוא': { shufersal: 46.90, rami_levy: 39.90, victory: 43.90, ybitan: 48.90, hatzi_hinam: 42.90, carrefour: 36.90 },
    'אנטריקוט טרי': { shufersal: 134.90, rami_levy: 119.90, victory: 129.90, ybitan: 139.90, hatzi_hinam: 126.90, carrefour: 138.10 },
    'סינטה טרייה': { shufersal: 114.90, rami_levy: 99.90, victory: 109.90, ybitan: 119.90, hatzi_hinam: 106.90, carrefour: 112.10 },
    'שניצל עוף טרי': { shufersal: 44.90, rami_levy: 38.90, victory: 42.90, ybitan: 46.90, hatzi_hinam: 41.90, carrefour: 41.50 },
    'שניצל עוף קפוא': { shufersal: 38.90, rami_levy: 32.90, victory: 36.90, ybitan: 40.90, hatzi_hinam: 35.90, carrefour: 32.50 },
    'המבורגר טרי': { shufersal: 48.90, rami_levy: 41.90, victory: 45.90, ybitan: 50.90, hatzi_hinam: 44.90, carrefour: 44.50 },
    'המבורגר קפוא': { shufersal: 42.90, rami_levy: 36.90, victory: 39.90, ybitan: 44.90, hatzi_hinam: 38.90, carrefour: 40.50 },
    'קבב טרי': { shufersal: 52.90, rami_levy: 45.90, victory: 49.90, ybitan: 54.90, hatzi_hinam: 48.90, carrefour: 42.90 },
    'נקניקיות עוף': { shufersal: 24.90, rami_levy: 19.90, victory: 22.90, ybitan: 26.90, hatzi_hinam: 21.90, carrefour: 19.50 },
    'נקניקיות בקר': { shufersal: 29.90, rami_levy: 24.90, victory: 27.90, ybitan: 31.90, hatzi_hinam: 26.90, carrefour: 26.50 },

    // ===== דגים =====
    'סלמון טרי': { shufersal: 89.90, rami_levy: 84.90, victory: 94.90, ybitan: 99.90, hatzi_hinam: 87.90, carrefour: 83.10 },
    'סלמון מעושן': { shufersal: 69.90, rami_levy: 64.90, victory: 74.90, ybitan: 79.90, hatzi_hinam: 67.90, carrefour: 60.50 },
    'פילה סלמון טרי': { shufersal: 99.90, rami_levy: 94.90, victory: 104.90, ybitan: 109.90, hatzi_hinam: 97.90, carrefour: 86.10 },
    'טונה': { shufersal: 12.90, rami_levy: 10.90, victory: 14.90, ybitan: 15.90, hatzi_hinam: 11.90, carrefour: 12.50 },
    'טונה במים': { shufersal: 11.90, rami_levy: 9.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 10.90, carrefour: 11.50 },
    'טונה בשמן': { shufersal: 14.90, rami_levy: 12.90, victory: 16.90, ybitan: 17.90, hatzi_hinam: 13.90, carrefour: 14.90 },

    // ===== ניקיון =====
    'נייר טואלט': { shufersal: 36.90, rami_levy: 33.90, victory: 35.50, ybitan: 38.90, hatzi_hinam: 28.90, carrefour: 24.90 },
    'מגבות נייר': { shufersal: 16.90, rami_levy: 14.90, victory: 15.50, ybitan: 18.90, hatzi_hinam: 12.90, carrefour: 13.50 },
    'סבון כלים': { shufersal: 10.90, rami_levy: 9.90, victory: 10.50, ybitan: 11.90, hatzi_hinam: 7.50, carrefour: 6.50 },
    'אבקת כביסה': { shufersal: 41.90, rami_levy: 38.90, victory: 40.50, ybitan: 43.90, hatzi_hinam: 33.90, carrefour: 28.90 },
    'מרכך כביסה': { shufersal: 26.90, rami_levy: 23.90, victory: 25.50, ybitan: 28.90, hatzi_hinam: 21.50, carrefour: 18.50 },
    'אקונומיקה': { shufersal: 10.90, rami_levy: 8.90, victory: 10.50, ybitan: 12.90, hatzi_hinam: 6.50, carrefour: 6.10 },
    'שקיות אשפה': { shufersal: 15.90, rami_levy: 13.90, victory: 14.50, ybitan: 16.90, hatzi_hinam: 11.50, carrefour: 12.50 },

    // ===== קפה ותה =====
    'קפה נמס': { shufersal: 26.90, rami_levy: 21.90, victory: 24.90, ybitan: 28.90, hatzi_hinam: 23.90, carrefour: 20.90 },
    'קפה טורקי': { shufersal: 21.90, rami_levy: 16.90, victory: 19.90, ybitan: 23.90, hatzi_hinam: 18.90, carrefour: 20.90 },
    'תה שחור': { shufersal: 16.90, rami_levy: 11.90, victory: 14.90, ybitan: 18.90, hatzi_hinam: 13.90, carrefour: 12.50 },
    'תה ירוק': { shufersal: 18.90, rami_levy: 13.90, victory: 16.90, ybitan: 20.90, hatzi_hinam: 15.90, carrefour: 15.50 },
    'תה נענע': { shufersal: 16.90, rami_levy: 11.90, victory: 14.90, ybitan: 18.90, hatzi_hinam: 13.90, carrefour: 13.50 },

    // ===== יינות ואלכוהול (יינות ביתן זול) =====
    'יין אדום': { shufersal: 42.90, rami_levy: 39.90, victory: 44.90, ybitan: 34.90, hatzi_hinam: 41.90, carrefour: 36.10 },
    'יין לבן': { shufersal: 42.90, rami_levy: 39.90, victory: 44.90, ybitan: 34.90, hatzi_hinam: 41.90, carrefour: 42.90 },
    'בירה': { shufersal: 10.90, rami_levy: 9.90, victory: 10.50, ybitan: 7.50, hatzi_hinam: 9.50, carrefour: 10.50 },
    'בירה גולדסטאר': { shufersal: 10.90, rami_levy: 9.90, victory: 10.50, ybitan: 7.50, hatzi_hinam: 9.50, carrefour: 8.50 },
    'בירה מכבי': { shufersal: 10.90, rami_levy: 9.90, victory: 10.50, ybitan: 7.50, hatzi_hinam: 9.50, carrefour: 8.10 },
    'וודקה': { shufersal: 64.90, rami_levy: 59.90, victory: 66.90, ybitan: 52.90, hatzi_hinam: 62.90, carrefour: 57.90 },
    'וויסקי': { shufersal: 99.90, rami_levy: 94.90, victory: 102.90, ybitan: 84.90, hatzi_hinam: 97.90, carrefour: 104.50 },

    // ===== קפואים =====
    'גלידה': { shufersal: 26.90, rami_levy: 21.50, victory: 24.90, ybitan: 28.90, hatzi_hinam: 24.50, carrefour: 21.10 },
    'גלידה וניל': { shufersal: 26.90, rami_levy: 21.50, victory: 24.90, ybitan: 28.90, hatzi_hinam: 24.50, carrefour: 26.50 },
    'גלידה שוקולד': { shufersal: 26.90, rami_levy: 21.50, victory: 24.90, ybitan: 28.90, hatzi_hinam: 24.50, carrefour: 22.90 },
    'שניצל קפוא': { shufersal: 36.90, rami_levy: 29.50, victory: 33.90, ybitan: 38.90, hatzi_hinam: 33.50, carrefour: 32.90 },
    'נאגטס קפואים': { shufersal: 31.90, rami_levy: 24.50, victory: 28.90, ybitan: 33.90, hatzi_hinam: 28.50, carrefour: 27.50 },
    'פיצה קפואה': { shufersal: 26.90, rami_levy: 21.50, victory: 24.90, ybitan: 28.90, hatzi_hinam: 24.50, carrefour: 24.50 },
    'ירקות קפואים': { shufersal: 16.90, rami_levy: 11.50, victory: 14.90, ybitan: 18.90, hatzi_hinam: 14.50, carrefour: 14.90 },

    // ===== מזון יבש =====
    'אורז': { shufersal: 9.50, rami_levy: 11.90, victory: 12.90, ybitan: 13.90, hatzi_hinam: 11.50, carrefour: 10.50 },
    'אורז בסמטי': { shufersal: 14.50, rami_levy: 16.90, victory: 17.90, ybitan: 18.90, hatzi_hinam: 16.50, carrefour: 15.50 },
    'פסטה': { shufersal: 5.50, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50, carrefour: 7.10 },
    'פסטה ספגטי': { shufersal: 5.50, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50, carrefour: 6.50 },
    'פסטה פנה': { shufersal: 6.50, rami_levy: 8.90, victory: 9.90, ybitan: 10.90, hatzi_hinam: 8.50, carrefour: 8.90 },
    'קמח': { shufersal: 6.50, rami_levy: 8.90, victory: 9.90, ybitan: 10.90, hatzi_hinam: 8.50, carrefour: 8.50 },
    'סוכר': { shufersal: 7.50, rami_levy: 9.90, victory: 10.90, ybitan: 11.90, hatzi_hinam: 9.50, carrefour: 10.10 },
    'מלח': { shufersal: 2.50, rami_levy: 4.90, victory: 5.90, ybitan: 6.90, hatzi_hinam: 4.50, carrefour: 4.50 },
    'שמן זית': { shufersal: 33.90, rami_levy: 38.90, victory: 39.90, ybitan: 42.90, hatzi_hinam: 36.90, carrefour: 34.50 },
    'שמן קנולה': { shufersal: 14.90, rami_levy: 17.90, victory: 18.90, ybitan: 19.90, hatzi_hinam: 16.50, carrefour: 16.50 },
    'רוטב עגבניות': { shufersal: 6.50, rami_levy: 8.90, victory: 9.90, ybitan: 10.90, hatzi_hinam: 8.50, carrefour: 8.10 },
    'רסק עגבניות': { shufersal: 4.50, rami_levy: 6.90, victory: 7.90, ybitan: 8.90, hatzi_hinam: 6.50, carrefour: 6.50 },
    'חומוס': { shufersal: 12.90, rami_levy: 9.90, victory: 11.90, ybitan: 13.90, hatzi_hinam: 11.50, carrefour: 10.50 },
    'טחינה': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 15.90, hatzi_hinam: 13.50, carrefour: 11.90 },
    'קטשופ': { shufersal: 9.50, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.50, carrefour: 10.50 },
    'מיונז': { shufersal: 11.50, rami_levy: 14.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 13.50, carrefour: 13.90 },
    'חרדל': { shufersal: 7.50, rami_levy: 9.90, victory: 10.90, ybitan: 11.90, hatzi_hinam: 9.50, carrefour: 10.50 },
    'זיתים': { shufersal: 14.90, rami_levy: 12.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 13.90, carrefour: 14.10 },

    // ===== מעדנייה =====
    'סלמי מעושן 100 גרם': { shufersal: 13.50, rami_levy: 11.90, victory: 14.50, ybitan: 15.50, hatzi_hinam: 12.90, carrefour: 14.10 },
    'סלמי מעושן 200 גרם': { shufersal: 26.90, rami_levy: 23.90, victory: 28.90, ybitan: 30.90, hatzi_hinam: 25.90, carrefour: 24.50 },
    'רוסטביף 100 גרם': { shufersal: 16.50, rami_levy: 14.90, victory: 17.50, ybitan: 18.50, hatzi_hinam: 15.90, carrefour: 14.50 },
    'רוסטביף 200 גרם': { shufersal: 32.90, rami_levy: 29.90, victory: 34.90, ybitan: 36.90, hatzi_hinam: 31.90, carrefour: 27.50 },
    'פסטרמה איטלקית 100 גרם': { shufersal: 16.50, rami_levy: 14.90, victory: 17.50, ybitan: 18.50, hatzi_hinam: 15.90, carrefour: 16.90 },
    'פסטרמה הודו 100 גרם': { shufersal: 14.50, rami_levy: 12.90, victory: 15.50, ybitan: 16.50, hatzi_hinam: 13.90, carrefour: 14.10 },
    'הודו מעושן 100 גרם': { shufersal: 12.50, rami_levy: 10.90, victory: 13.50, ybitan: 14.50, hatzi_hinam: 11.90, carrefour: 10.50 },
    'הודו מעושן 200 גרם': { shufersal: 24.90, rami_levy: 21.90, victory: 26.90, ybitan: 28.90, hatzi_hinam: 23.90, carrefour: 23.50 },
    'שינקן 100 גרם': { shufersal: 11.50, rami_levy: 9.90, victory: 12.50, ybitan: 13.50, hatzi_hinam: 10.90, carrefour: 10.90 },
    'שינקן 200 גרם': { shufersal: 22.90, rami_levy: 19.90, victory: 24.90, ybitan: 26.90, hatzi_hinam: 21.90, carrefour: 23.90 },

    // ===== סלטים =====
    'סלט חצילים': { shufersal: 15.90, rami_levy: 12.90, victory: 14.90, ybitan: 16.90, hatzi_hinam: 14.50, carrefour: 12.50 },
    'סלט מטבוחה': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 15.90, hatzi_hinam: 13.50, carrefour: 12.90 },
    'סלט טורקי': { shufersal: 16.90, rami_levy: 13.90, victory: 15.90, ybitan: 17.90, hatzi_hinam: 15.50, carrefour: 15.90 },

    // ===== תינוקות =====
    'חיתולים מידה 3': { shufersal: 48.90, rami_levy: 54.90, victory: 56.90, ybitan: 59.90, hatzi_hinam: 52.90, carrefour: 47.90 },
    'חיתולים מידה 4': { shufersal: 48.90, rami_levy: 54.90, victory: 56.90, ybitan: 59.90, hatzi_hinam: 52.90, carrefour: 54.90 },
    'מגבונים לתינוקות': { shufersal: 16.90, rami_levy: 13.90, victory: 15.50, ybitan: 18.90, hatzi_hinam: 11.50, carrefour: 10.90 },
    // פורמולות - מטרנה
    'מטרנה חלבי שלב 1': { shufersal: 56.90, rami_levy: 58.90, victory: 59.90, ybitan: 62.90, hatzi_hinam: 57.90, carrefour: 58.90 },
    'מטרנה חלבי שלב 2': { shufersal: 56.90, rami_levy: 58.90, victory: 59.90, ybitan: 62.90, hatzi_hinam: 57.90, carrefour: 58.90 },
    'מטרנה חלבי שלב 3': { shufersal: 56.90, rami_levy: 58.90, victory: 59.90, ybitan: 62.90, hatzi_hinam: 57.90, carrefour: 58.90 },
    'מטרנה מהדרין שלב 1': { shufersal: 65.00, rami_levy: 67.00, victory: 68.00, ybitan: 70.00, hatzi_hinam: 66.00, carrefour: 67.00 },
    'מטרנה מהדרין שלב 3': { shufersal: 65.00, rami_levy: 67.00, victory: 68.00, ybitan: 70.00, hatzi_hinam: 66.00, carrefour: 67.00 },
    'מטרנה גולד שלב 1': { shufersal: 81.90, rami_levy: 84.90, victory: 86.90, ybitan: 89.90, hatzi_hinam: 83.90, carrefour: 84.90 },
    'מטרנה גולד שלב 2': { shufersal: 81.90, rami_levy: 84.90, victory: 86.90, ybitan: 89.90, hatzi_hinam: 83.90, carrefour: 84.90 },
    'מטרנה גולד שלב 3': { shufersal: 81.90, rami_levy: 84.90, victory: 86.90, ybitan: 89.90, hatzi_hinam: 83.90, carrefour: 84.90 },
    'מטרנה אקסטרה קר שלב 1': { shufersal: 66.90, rami_levy: 69.90, victory: 71.90, ybitan: 74.90, hatzi_hinam: 68.90, carrefour: 69.90 },
    'מטרנה אקסטרה קר שלב 2': { shufersal: 66.90, rami_levy: 69.90, victory: 71.90, ybitan: 74.90, hatzi_hinam: 68.90, carrefour: 69.90 },
    'מטרנה אקסטרה קר שלב 3': { shufersal: 66.90, rami_levy: 69.90, victory: 71.90, ybitan: 74.90, hatzi_hinam: 68.90, carrefour: 69.90 },
    'מטרנה קומפורט': { shufersal: 82.90, rami_levy: 85.90, victory: 87.90, ybitan: 90.90, hatzi_hinam: 84.90, carrefour: 85.90 },
    'מטרנה צמחית': { shufersal: 71.90, rami_levy: 74.90, victory: 76.90, ybitan: 79.90, hatzi_hinam: 73.90, carrefour: 74.90 },
    // פורמולות - סימילאק
    'סימילאק גולד שלב 1': { shufersal: 72.60, rami_levy: 75.60, victory: 77.60, ybitan: 80.60, hatzi_hinam: 74.60, carrefour: 75.60 },
    'סימילאק גולד שלב 2': { shufersal: 72.60, rami_levy: 75.60, victory: 77.60, ybitan: 80.60, hatzi_hinam: 74.60, carrefour: 75.60 },
    'סימילאק גולד שלב 3': { shufersal: 72.60, rami_levy: 75.60, victory: 77.60, ybitan: 80.60, hatzi_hinam: 74.60, carrefour: 75.60 },
    'סימילאק גולד+ שלב 1': { shufersal: 80.90, rami_levy: 83.90, victory: 85.90, ybitan: 88.90, hatzi_hinam: 82.90, carrefour: 83.90 },
    'סימילאק גולד+ שלב 2': { shufersal: 80.90, rami_levy: 83.90, victory: 85.90, ybitan: 88.90, hatzi_hinam: 82.90, carrefour: 83.90 },
    'סימילאק גולד+ שלב 3': { shufersal: 80.90, rami_levy: 83.90, victory: 85.90, ybitan: 88.90, hatzi_hinam: 82.90, carrefour: 83.90 },
    'סימילאק קומפורט שלב 1': { shufersal: 107.90, rami_levy: 110.90, victory: 112.90, ybitan: 115.90, hatzi_hinam: 109.90, carrefour: 110.90 },
    'סימילאק קומפורט שלב 2': { shufersal: 107.90, rami_levy: 110.90, victory: 112.90, ybitan: 115.90, hatzi_hinam: 109.90, carrefour: 110.90 },
    // פורמולות - נוטרילון
    'נוטרילון שלב 1': { shufersal: 74.90, rami_levy: 77.90, victory: 79.90, ybitan: 82.90, hatzi_hinam: 76.90, carrefour: 77.90 },
    'נוטרילון שלב 2': { shufersal: 74.90, rami_levy: 77.90, victory: 79.90, ybitan: 82.90, hatzi_hinam: 76.90, carrefour: 77.90 },
    'נוטרילון שלב 3': { shufersal: 74.90, rami_levy: 77.90, victory: 79.90, ybitan: 82.90, hatzi_hinam: 76.90, carrefour: 77.90 },

    // ===== חיות מחמד =====
    'מזון לכלבים': { shufersal: 49.90, rami_levy: 44.90, victory: 52.90, ybitan: 54.90, hatzi_hinam: 46.90, carrefour: 49.50 },
    'מזון לחתולים': { shufersal: 44.90, rami_levy: 39.90, victory: 47.90, ybitan: 49.90, hatzi_hinam: 41.90, carrefour: 38.10 },
    'חול לחתולים': { shufersal: 34.90, rami_levy: 29.90, victory: 37.90, ybitan: 39.90, hatzi_hinam: 31.90, carrefour: 33.10 },

    // ===== דגנים וארוחת בוקר =====
    'קורנפלקס': { shufersal: 18.90, rami_levy: 19.90, victory: 20.90, ybitan: 21.90, hatzi_hinam: 17.90, carrefour: 16.90 },
    'קורנפלקס קלאסי': { shufersal: 18.90, rami_levy: 19.90, victory: 20.90, ybitan: 21.90, hatzi_hinam: 17.90, carrefour: 19.50 },
    'קורנפלקס דבש': { shufersal: 21.90, rami_levy: 22.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 20.90, carrefour: 21.50 },
    'קורנפלקס שוקולד': { shufersal: 21.90, rami_levy: 22.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 20.90, carrefour: 22.10 },
    'קורנפלקס כריות': { shufersal: 23.90, rami_levy: 24.90, victory: 25.90, ybitan: 26.90, hatzi_hinam: 22.90, carrefour: 19.90 },
    'קורנפלקס פירות': { shufersal: 22.90, rami_levy: 23.90, victory: 24.90, ybitan: 25.90, hatzi_hinam: 21.90, carrefour: 21.50 },
    'גרנולה': { shufersal: 24.90, rami_levy: 25.90, victory: 26.90, ybitan: 27.90, hatzi_hinam: 23.90, carrefour: 21.50 },
    'גרנולה שוקולד': { shufersal: 26.90, rami_levy: 27.90, victory: 28.90, ybitan: 29.90, hatzi_hinam: 25.90, carrefour: 26.90 },
    'גרנולה פירות': { shufersal: 26.90, rami_levy: 27.90, victory: 28.90, ybitan: 29.90, hatzi_hinam: 25.90, carrefour: 26.50 },
    'מוזלי': { shufersal: 22.90, rami_levy: 23.90, victory: 24.90, ybitan: 25.90, hatzi_hinam: 21.90, carrefour: 23.50 },
    'שיבולת שועל': { shufersal: 12.90, rami_levy: 13.90, victory: 14.90, ybitan: 15.90, hatzi_hinam: 11.90, carrefour: 12.90 },
    'קוואקר': { shufersal: 14.90, rami_levy: 15.90, victory: 16.90, ybitan: 17.90, hatzi_hinam: 13.90, carrefour: 12.90 },

    // ===== מעדני חלב =====
    'מילקי': { shufersal: 4.90, rami_levy: 5.20, victory: 5.50, ybitan: 5.90, hatzi_hinam: 4.50, carrefour: 3.90 },
    'מילקי שוקולד': { shufersal: 4.90, rami_levy: 5.20, victory: 5.50, ybitan: 5.90, hatzi_hinam: 4.50, carrefour: 4.50 },
    'מילקי וניל': { shufersal: 4.90, rami_levy: 5.20, victory: 5.50, ybitan: 5.90, hatzi_hinam: 4.50, carrefour: 3.90 },
    'מילקי קרמל': { shufersal: 4.90, rami_levy: 5.20, victory: 5.50, ybitan: 5.90, hatzi_hinam: 4.50, carrefour: 4.10 },
    'דניאלה': { shufersal: 5.90, rami_levy: 6.20, victory: 6.50, ybitan: 6.90, hatzi_hinam: 5.50, carrefour: 5.50 },
    'דניאלה שוקולד': { shufersal: 5.90, rami_levy: 6.20, victory: 6.50, ybitan: 6.90, hatzi_hinam: 5.50, carrefour: 5.10 },
    'דניאלה וניל': { shufersal: 5.90, rami_levy: 6.20, victory: 6.50, ybitan: 6.90, hatzi_hinam: 5.50, carrefour: 4.90 },
    'דנונה': { shufersal: 5.50, rami_levy: 5.90, victory: 6.20, ybitan: 6.50, hatzi_hinam: 5.20, carrefour: 5.10 },
    'דנונה שוקולד': { shufersal: 5.50, rami_levy: 5.90, victory: 6.20, ybitan: 6.50, hatzi_hinam: 5.20, carrefour: 5.10 },
    'יופלה': { shufersal: 6.90, rami_levy: 7.20, victory: 7.50, ybitan: 7.90, hatzi_hinam: 6.50, carrefour: 6.10 },
    'יופלה תות': { shufersal: 6.90, rami_levy: 7.20, victory: 7.50, ybitan: 7.90, hatzi_hinam: 6.50, carrefour: 6.50 },
    'אקטימל': { shufersal: 7.90, rami_levy: 8.20, victory: 8.50, ybitan: 8.90, hatzi_hinam: 7.50, carrefour: 7.50 },
    'פטיט דנון': { shufersal: 14.90, rami_levy: 15.50, victory: 16.20, ybitan: 16.90, hatzi_hinam: 14.50, carrefour: 13.50 },
    'מעדן שוקולד': { shufersal: 5.50, rami_levy: 5.90, victory: 6.20, ybitan: 6.50, hatzi_hinam: 5.20, carrefour: 5.10 },
    'מעדן וניל': { shufersal: 5.50, rami_levy: 5.90, victory: 6.20, ybitan: 6.50, hatzi_hinam: 5.20, carrefour: 5.10 },
    'שוקו': { shufersal: 4.90, rami_levy: 5.20, victory: 5.50, ybitan: 5.90, hatzi_hinam: 4.50, carrefour: 4.50 },
    'שוקו תנובה': { shufersal: 4.90, rami_levy: 5.20, victory: 5.50, ybitan: 5.90, hatzi_hinam: 4.50, carrefour: 4.50 },
    'פרי גד': { shufersal: 5.90, rami_levy: 6.20, victory: 6.50, ybitan: 6.90, hatzi_hinam: 5.50, carrefour: 4.90 },

    // ===== גלידות נוספות =====
    'מגנום': { shufersal: 12.90, rami_levy: 11.50, victory: 13.50, ybitan: 14.50, hatzi_hinam: 10.90, carrefour: 10.10 },
    'מגנום שקדים': { shufersal: 12.90, rami_levy: 11.50, victory: 13.50, ybitan: 14.50, hatzi_hinam: 10.90, carrefour: 9.50 },
    'מגנום לבן': { shufersal: 12.90, rami_levy: 11.50, victory: 13.50, ybitan: 14.50, hatzi_hinam: 10.90, carrefour: 11.90 },
    'קורנטו': { shufersal: 9.90, rami_levy: 8.50, victory: 10.50, ybitan: 11.50, hatzi_hinam: 7.90, carrefour: 8.10 },
    'קורנטו שוקולד': { shufersal: 9.90, rami_levy: 8.50, victory: 10.50, ybitan: 11.50, hatzi_hinam: 7.90, carrefour: 7.90 },
    'גולדה': { shufersal: 32.90, rami_levy: 29.90, victory: 34.90, ybitan: 36.90, hatzi_hinam: 28.90, carrefour: 27.50 },
    'ארטיק': { shufersal: 6.90, rami_levy: 5.90, victory: 7.50, ybitan: 8.50, hatzi_hinam: 5.50, carrefour: 5.50 },

    // ===== קפואים נוספים =====
    'בורקס': { shufersal: 28.90, rami_levy: 24.90, victory: 29.90, ybitan: 31.90, hatzi_hinam: 26.90, carrefour: 24.10 },
    'בורקס גבינה': { shufersal: 28.90, rami_levy: 24.90, victory: 29.90, ybitan: 31.90, hatzi_hinam: 26.90, carrefour: 26.50 },
    'בורקס תפו"א': { shufersal: 26.90, rami_levy: 22.90, victory: 27.90, ybitan: 29.90, hatzi_hinam: 24.90, carrefour: 23.50 },
    'בורקס פטריות': { shufersal: 28.90, rami_levy: 24.90, victory: 29.90, ybitan: 31.90, hatzi_hinam: 26.90, carrefour: 25.50 },
    'פיצה משפחתית': { shufersal: 34.90, rami_levy: 29.90, victory: 35.90, ybitan: 37.90, hatzi_hinam: 32.90, carrefour: 32.90 },
    'שווארמה קפואה': { shufersal: 44.90, rami_levy: 39.90, victory: 46.90, ybitan: 48.90, hatzi_hinam: 42.90, carrefour: 44.10 },
    'קבב קפוא': { shufersal: 39.90, rami_levy: 34.90, victory: 41.90, ybitan: 43.90, hatzi_hinam: 37.90, carrefour: 36.10 },
    'פלאפל קפוא': { shufersal: 18.90, rami_levy: 15.90, victory: 19.90, ybitan: 21.90, hatzi_hinam: 17.90, carrefour: 18.10 },
    'פירות יער קפואים': { shufersal: 24.90, rami_levy: 21.90, victory: 25.90, ybitan: 27.90, hatzi_hinam: 23.90, carrefour: 26.10 },
    'תותים קפואים': { shufersal: 22.90, rami_levy: 19.90, victory: 23.90, ybitan: 25.90, hatzi_hinam: 21.90, carrefour: 19.50 },

    // ===== משקאות קרים נוספים =====
    'נסטי': { shufersal: 7.90, rami_levy: 8.50, victory: 8.90, ybitan: 9.50, hatzi_hinam: 6.90, carrefour: 6.10 },
    'נסטי אפרסק': { shufersal: 7.90, rami_levy: 8.50, victory: 8.90, ybitan: 9.50, hatzi_hinam: 6.90, carrefour: 7.50 },
    'נסטי לימון': { shufersal: 7.90, rami_levy: 8.50, victory: 8.90, ybitan: 9.50, hatzi_hinam: 6.90, carrefour: 6.10 },
    'פיוז טי': { shufersal: 7.90, rami_levy: 8.50, victory: 8.90, ybitan: 9.50, hatzi_hinam: 6.90, carrefour: 6.10 },
    'פיוז טי אפרסק': { shufersal: 7.90, rami_levy: 8.50, victory: 8.90, ybitan: 9.50, hatzi_hinam: 6.90, carrefour: 6.90 },
    'ליפטון תה קר': { shufersal: 8.90, rami_levy: 9.50, victory: 9.90, ybitan: 10.50, hatzi_hinam: 7.90, carrefour: 6.90 },
    'XL': { shufersal: 6.90, rami_levy: 7.50, victory: 7.90, ybitan: 8.50, hatzi_hinam: 5.90, carrefour: 6.50 },
    'רד בול': { shufersal: 9.90, rami_levy: 10.50, victory: 10.90, ybitan: 11.50, hatzi_hinam: 8.90, carrefour: 9.10 },

    // ===== חטיפים נוספים =====
    'קינדר בואנו': { shufersal: 8.90, rami_levy: 9.50, victory: 9.90, ybitan: 10.50, hatzi_hinam: 7.90, carrefour: 7.50 },
    'קינדר שוקולד': { shufersal: 7.90, rami_levy: 8.50, victory: 8.90, ybitan: 9.50, hatzi_hinam: 6.90, carrefour: 6.50 },
    'קינדר סרפרייז': { shufersal: 9.90, rami_levy: 10.50, victory: 10.90, ybitan: 11.50, hatzi_hinam: 8.90, carrefour: 8.50 },
    'פסק זמן': { shufersal: 6.90, rami_levy: 7.50, victory: 7.90, ybitan: 8.50, hatzi_hinam: 5.90, carrefour: 5.90 },
    'פסק זמן לבן': { shufersal: 6.90, rami_levy: 7.50, victory: 7.90, ybitan: 8.50, hatzi_hinam: 5.90, carrefour: 5.50 },
    'באונטי': { shufersal: 6.90, rami_levy: 7.50, victory: 7.90, ybitan: 8.50, hatzi_hinam: 5.90, carrefour: 5.50 },
    'קליק': { shufersal: 5.90, rami_levy: 6.50, victory: 6.90, ybitan: 7.50, hatzi_hinam: 4.90, carrefour: 5.10 },
    'קליק מריר': { shufersal: 5.90, rami_levy: 6.50, victory: 6.90, ybitan: 7.50, hatzi_hinam: 4.90, carrefour: 4.50 },
    'טורטית': { shufersal: 5.90, rami_levy: 6.50, victory: 6.90, ybitan: 7.50, hatzi_hinam: 4.90, carrefour: 5.10 },
    'רושקה': { shufersal: 4.90, rami_levy: 5.50, victory: 5.90, ybitan: 6.50, hatzi_hinam: 3.90, carrefour: 4.10 },
    'כדורגל': { shufersal: 4.90, rami_levy: 5.50, victory: 5.90, ybitan: 6.50, hatzi_hinam: 3.90, carrefour: 3.50 },
    'חלווה': { shufersal: 18.90, rami_levy: 16.90, victory: 19.90, ybitan: 21.90, hatzi_hinam: 17.90, carrefour: 19.10 },
    'גרעינים': { shufersal: 12.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 10.90, carrefour: 9.90 },

    // ===== ניקיון נוספים =====
    'אקונומיקה': { shufersal: 9.90, rami_levy: 10.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 8.90, carrefour: 7.90 },
    'אקונומיקה לימון': { shufersal: 9.90, rami_levy: 10.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 8.90, carrefour: 9.50 },
    'מרכך כביסה': { shufersal: 16.90, rami_levy: 18.90, victory: 19.90, ybitan: 21.90, hatzi_hinam: 15.90, carrefour: 15.10 },
    'מרכך סנו': { shufersal: 18.90, rami_levy: 20.90, victory: 21.90, ybitan: 23.90, hatzi_hinam: 17.90, carrefour: 18.10 },
    'אבקת כביסה פרסיל': { shufersal: 44.90, rami_levy: 48.90, victory: 49.90, ybitan: 52.90, hatzi_hinam: 42.90, carrefour: 43.10 },
    'נוזל כלים סנו': { shufersal: 12.90, rami_levy: 14.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 11.90, carrefour: 11.50 },
    'מסיר שומנים': { shufersal: 14.90, rami_levy: 16.90, victory: 17.90, ybitan: 18.90, hatzi_hinam: 13.90, carrefour: 15.10 },
    'מסיר אבנית': { shufersal: 16.90, rami_levy: 18.90, victory: 19.90, ybitan: 20.90, hatzi_hinam: 15.90, carrefour: 13.90 },

    // ===== היגיינה נוספים =====
    'סבון דאב': { shufersal: 8.90, rami_levy: 9.90, victory: 10.90, ybitan: 11.90, hatzi_hinam: 7.90, carrefour: 6.90 },
    'דאודורנט רקסונה': { shufersal: 19.90, rami_levy: 21.90, victory: 22.90, ybitan: 24.90, hatzi_hinam: 18.90, carrefour: 18.10 },
    'דאודורנט ניוואה': { shufersal: 21.90, rami_levy: 23.90, victory: 24.90, ybitan: 26.90, hatzi_hinam: 20.90, carrefour: 17.90 },
    'משחת שיניים קולגייט': { shufersal: 14.90, rami_levy: 16.90, victory: 17.90, ybitan: 18.90, hatzi_hinam: 13.90, carrefour: 13.10 },
    'מרכך פנטן': { shufersal: 24.90, rami_levy: 26.90, victory: 27.90, ybitan: 29.90, hatzi_hinam: 23.90, carrefour: 21.90 },
};

// Chain information
const CHAINS = {
    shufersal: { name: 'שופרסל', color: '#dc2626', url: 'https://www.shufersal.co.il/online/he/search?text=' },
    rami_levy: { name: 'רמי לוי', color: '#2563eb', url: 'https://www.rami-levy.co.il/he/online/search?q=' },
    victory: { name: 'ויקטורי', color: '#ea580c', url: 'https://www.victoryonline.co.il/search?q=' },
    ybitan: { name: 'יינות ביתן', color: '#7c3aed', url: 'https://www.ybitan.co.il/search?q=' },
    hatzi_hinam: { name: 'חצי חינם', color: '#16a34a', url: 'https://shop.hazi-hinam.co.il/search?q=' },
    carrefour: { name: 'קארפור', color: '#0066cc', url: 'https://www.carrefour.co.il/search?q=' },
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

// Main handler
module.exports = async (req, res) => {
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

            const result = compareList(items);
            return res.json(result);
        }

        return res.status(400).json({ error: 'Invalid request' });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
