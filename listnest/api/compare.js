// ListNest Price Comparison API - Vercel Serverless
// Complete Israeli product price database with ALL products (6 chains)
// Prices varied realistically - each chain wins on different products
// רמי לוי - זול בבשר וירקות | שופרסל - זול במותג פרטי ומוצרי חלב
// חצי חינם - זול בחטיפים ומשקאות | ויקטורי - זול בפירות ומאפים
// יינות ביתן - זול ביינות ואלכוהול | קארפור - זול במוצרים מיובאים

// Hebrew synonym dictionary for better product matching
const HEBREW_SYNONYMS = {
    'קולה': ['קוקה קולה', 'coca cola', 'קוקה', 'coke', 'coca-cola'],
    'קוקה קולה': ['קולה', 'קוקה', 'coca cola', 'coca-cola', 'coke'],
    'פפסי': ['pepsi', 'pepsi cola'],
    'חלב': ['חלב טרי', 'milk'],
    'יוגורט': ['לבן', 'yogurt', 'yoghurt'],
    'גבינה צהובה': ['עמק', 'גאודה', 'yellow cheese', 'cheese'],
    'קוטג': ['קוטג\'', 'cottage', 'cottage cheese'],
    'מטרנה': ['materna'],
    'סימילאק': ['similac'],
    'נוטרילון': ['nutrilon'],
    'חיתולים': ['חיתול', 'טיטולים', 'diapers', 'pampers', 'huggies'],
    'לחם': ['bread', 'לחם לבן', 'לחם אחיד'],
    'ביצים': ['eggs', 'ביצה', 'egg'],
    'חמאה': ['butter', 'חמאת'],
    'שוקולד': ['chocolate', 'שוקולד חלב', 'שוקו'],
    'במבה': ['bamba', 'osem bamba'],
    'ביסלי': ['bisli'],
    'חומוס': ['hummus', 'humus'],
    'טחינה': ['tahini', 'tahina'],
    'שמן זית': ['olive oil', 'שמן זית כתית'],
    'קמח': ['flour', 'קמח לבן', 'קמח מלא'],
    'אורז': ['rice', 'אורז בסמטי', 'אורז לבן'],
    'סוכר': ['sugar'],
    'מלח': ['salt'],
    'קפה': ['coffee', 'נס קפה', 'nescafe', 'espresso'],
    'תה': ['tea'],
    'מים מינרלים': ['water', 'mineral water', 'מים'],
    'טונה': ['tuna', 'שימורי טונה'],
    'פסטה': ['pasta', 'ספגטי', 'spaghetti', 'מקרוני'],
    'נייר טואלט': ['toilet paper', 'נייר טישו'],
    'שמנת': ['cream', 'שמנת מתוקה', 'שמנת חמוצה'],
    'חזה עוף': ['chicken breast', 'חזה'],
    'בננות': ['banana', 'bananas'],
    'תפוחים': ['apple', 'apples', 'תפוח'],
    'עגבניות': ['tomato', 'tomatoes', 'עגבנייה'],
    'מלפפונים': ['cucumber', 'cucumbers', 'מלפפון'],
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
    'חלב 3% קרטון 1 ליטר': { shufersal: 7.28, rami_levy: 7.28, victory: 7.28, ybitan: 7.28, hatzi_hinam: 7.28, carrefour: 7.28, yochananof: 7.28, tiv_taam: 7.28, osher_ad: 7.28, machsanei_hashuk: 7.06 },
    'חלב 1% קרטון 1 ליטר': { shufersal: 7.28, rami_levy: 7.28, victory: 7.28, ybitan: 7.28, hatzi_hinam: 7.28, carrefour: 7.28, yochananof: 7.28, tiv_taam: 7.28, osher_ad: 7.28, machsanei_hashuk: 7.06 },
    'חלב 3% 1 ליטר': { shufersal: 7.28, rami_levy: 7.28, victory: 7.28, ybitan: 7.28, hatzi_hinam: 7.28, carrefour: 7.28, yochananof: 7.28, tiv_taam: 7.28, osher_ad: 7.28, machsanei_hashuk: 7.06 },
    'חלב 1% 1 ליטר': { shufersal: 7.28, rami_levy: 7.28, victory: 7.28, ybitan: 7.28, hatzi_hinam: 7.28, carrefour: 7.28, yochananof: 7.28, tiv_taam: 7.28, osher_ad: 7.28, machsanei_hashuk: 7.06 },
    // חלב בשקית - זול יותר
    'חלב 3% שקית 1 ליטר': { shufersal: 6.50, rami_levy: 6.40, victory: 6.60, ybitan: 6.70, hatzi_hinam: 6.45, carrefour: 6.55, yochananof: 6.40, tiv_taam: 6.52, osher_ad: 6.45, machsanei_hashuk: 6.21 },
    'חלב 1% שקית 1 ליטר': { shufersal: 6.40, rami_levy: 6.30, victory: 6.50, ybitan: 6.60, hatzi_hinam: 6.35, carrefour: 6.45, yochananof: 6.30, tiv_taam: 6.42, osher_ad: 6.35, machsanei_hashuk: 6.11 },
    'חלב דל שומן 1 ליטר': { shufersal: 7.28, rami_levy: 7.28, victory: 7.28, ybitan: 7.28, hatzi_hinam: 7.28, carrefour: 7.28, yochananof: 7.28, tiv_taam: 7.28, osher_ad: 7.28, machsanei_hashuk: 7.06 },
    'חלב 3% 0.5 ליטר': { shufersal: 4.90, rami_levy: 4.85, victory: 4.95, ybitan: 5.00, hatzi_hinam: 4.90, carrefour: 4.90, yochananof: 4.85, tiv_taam: 4.90, osher_ad: 4.90, machsanei_hashuk: 4.70 },
    'חלב 1% 0.5 ליטר': { shufersal: 4.80, rami_levy: 4.75, victory: 4.85, ybitan: 4.90, hatzi_hinam: 4.80, carrefour: 4.80, yochananof: 4.75, tiv_taam: 4.80, osher_ad: 4.80, machsanei_hashuk: 4.61 },
    'חלב סויה 1 ליטר': { shufersal: 11.90, rami_levy: 12.50, victory: 12.90, ybitan: 13.50, hatzi_hinam: 12.20, carrefour: 13.10, yochananof: 12.49, tiv_taam: 12.38, osher_ad: 12.21, machsanei_hashuk: 12.13 },
    'חלב שקדים 1 ליטר': { shufersal: 13.90, rami_levy: 14.50, victory: 14.90, ybitan: 15.50, hatzi_hinam: 14.20, carrefour: 12.50, yochananof: 14.49, tiv_taam: 13.34, osher_ad: 14.21, machsanei_hashuk: 14.07 },
    'חלב קוקוס 1 ליטר': { shufersal: 13.90, rami_levy: 14.50, victory: 14.90, ybitan: 15.50, hatzi_hinam: 14.20, carrefour: 13.50, yochananof: 14.49, tiv_taam: 13.74, osher_ad: 14.21, machsanei_hashuk: 14.07 },
    'חלב שיבולת שועל 1 ליטר': { shufersal: 12.90, rami_levy: 13.50, victory: 13.90, ybitan: 14.50, hatzi_hinam: 13.20, carrefour: 14.10, yochananof: 13.49, tiv_taam: 13.38, osher_ad: 13.22, machsanei_hashuk: 13.10 },
    // לבן ויוגורט
    'לבן 500 גרם': { shufersal: 5.50, rami_levy: 5.90, victory: 6.20, ybitan: 6.50, hatzi_hinam: 5.80, carrefour: 5.10, yochananof: 5.89, tiv_taam: 5.34, osher_ad: 5.81, machsanei_hashuk: 5.72 },
    'לבן 200 גרם': { shufersal: 3.20, rami_levy: 3.50, victory: 3.70, ybitan: 3.90, hatzi_hinam: 3.40, carrefour: 3.10, yochananof: 3.49, tiv_taam: 3.16, osher_ad: 3.41, machsanei_hashuk: 3.40 },
    'לבן עז 500 גרם': { shufersal: 8.50, rami_levy: 8.90, victory: 9.20, ybitan: 9.50, hatzi_hinam: 8.80, carrefour: 8.50, yochananof: 8.89, tiv_taam: 8.50, osher_ad: 8.81, machsanei_hashuk: 8.63 },
    'יוגורט 150 גרם': { shufersal: 5.50, rami_levy: 5.90, victory: 6.20, ybitan: 6.50, hatzi_hinam: 5.80, carrefour: 5.50, yochananof: 5.89, tiv_taam: 5.50, osher_ad: 5.81, machsanei_hashuk: 5.72 },
    'יוגורט יווני 150 גרם': { shufersal: 8.50, rami_levy: 8.90, victory: 9.20, ybitan: 9.50, hatzi_hinam: 8.80, carrefour: 8.50, yochananof: 8.89, tiv_taam: 8.50, osher_ad: 8.81, machsanei_hashuk: 8.63 },
    'יוגורט יווני 0% 150 גרם': { shufersal: 9.50, rami_levy: 9.90, victory: 10.20, ybitan: 10.50, hatzi_hinam: 9.80, carrefour: 10.10, yochananof: 9.89, tiv_taam: 9.74, osher_ad: 9.81, machsanei_hashuk: 9.60 },
    'יוגורט תנובה 150 גרם': { shufersal: 5.50, rami_levy: 5.90, victory: 6.20, ybitan: 6.50, hatzi_hinam: 5.80, carrefour: 6.10, yochananof: 5.89, tiv_taam: 5.74, osher_ad: 5.81, machsanei_hashuk: 5.72 },
    'יוגורט אקטיביה 150 גרם': { shufersal: 7.50, rami_levy: 7.90, victory: 8.20, ybitan: 8.50, hatzi_hinam: 7.80, carrefour: 7.90, yochananof: 7.89, tiv_taam: 7.66, osher_ad: 7.81, machsanei_hashuk: 7.66 },
    'יוגורט 500 גרם': { shufersal: 12.50, rami_levy: 12.90, victory: 13.20, ybitan: 13.50, hatzi_hinam: 12.80, carrefour: 13.90, yochananof: 12.89, tiv_taam: 13.06, osher_ad: 12.81, machsanei_hashuk: 12.51 },
    'יוגורט יווני 500 גרם': { shufersal: 18.50, rami_levy: 18.90, victory: 19.20, ybitan: 19.50, hatzi_hinam: 18.80, carrefour: 18.50, yochananof: 18.89, tiv_taam: 18.50, osher_ad: 18.81, machsanei_hashuk: 18.33 },
    // גבינות צהובות
    'גבינה צהובה עמק 200 גרם': { shufersal: 31.90, rami_levy: 33.90, victory: 34.90, ybitan: 35.90, hatzi_hinam: 32.90, carrefour: 35.10, yochananof: 33.86, tiv_taam: 33.18, osher_ad: 32.95, machsanei_hashuk: 32.88 },
    'גבינה צהובה עמק 400 גרם': { shufersal: 58.90, rami_levy: 61.90, victory: 63.90, ybitan: 65.90, hatzi_hinam: 59.90, carrefour: 61.90, yochananof: 61.84, tiv_taam: 60.10, osher_ad: 60.00, machsanei_hashuk: 60.04 },
    'גבינה צהובה גלבוע 200 גרם': { shufersal: 27.90, rami_levy: 29.90, victory: 30.90, ybitan: 31.90, hatzi_hinam: 28.90, carrefour: 28.50, yochananof: 29.86, tiv_taam: 28.14, osher_ad: 28.95, machsanei_hashuk: 29.00 },
    'גבינה צהובה 9% 200 גרם': { shufersal: 23.90, rami_levy: 25.90, victory: 26.90, ybitan: 27.90, hatzi_hinam: 24.90, carrefour: 24.90, yochananof: 25.86, tiv_taam: 24.30, osher_ad: 24.95, machsanei_hashuk: 25.12 },
    'גבינה צהובה 22% 200 גרם': { shufersal: 27.90, rami_levy: 29.90, victory: 30.90, ybitan: 31.90, hatzi_hinam: 28.90, carrefour: 28.10, yochananof: 29.86, tiv_taam: 27.98, osher_ad: 28.95, machsanei_hashuk: 29.00 },
    // קוטג וגבינה לבנה
    'קוטג׳ 5% 250 גרם': { shufersal: 8.50, rami_levy: 8.90, victory: 9.20, ybitan: 9.50, hatzi_hinam: 8.80, carrefour: 9.10, yochananof: 8.89, tiv_taam: 8.74, osher_ad: 8.81, machsanei_hashuk: 8.63 },
    'קוטג׳ 3% 250 גרם': { shufersal: 8.20, rami_levy: 8.60, victory: 8.90, ybitan: 9.20, hatzi_hinam: 8.50, carrefour: 9.10, yochananof: 8.59, tiv_taam: 8.56, osher_ad: 8.50, machsanei_hashuk: 8.34 },
    'גבינה לבנה 5% 250 גרם': { shufersal: 8.50, rami_levy: 8.90, victory: 9.20, ybitan: 9.50, hatzi_hinam: 8.80, carrefour: 8.50, yochananof: 8.89, tiv_taam: 8.50, osher_ad: 8.81, machsanei_hashuk: 8.63 },
    'גבינה לבנה 9% 250 גרם': { shufersal: 9.50, rami_levy: 9.90, victory: 10.20, ybitan: 10.50, hatzi_hinam: 9.80, carrefour: 8.90, yochananof: 9.89, tiv_taam: 9.26, osher_ad: 9.81, machsanei_hashuk: 9.60 },
    // גבינות מיוחדות
    'גבינה בולגרית 200 גרם': { shufersal: 18.50, rami_levy: 19.50, victory: 20.50, ybitan: 21.50, hatzi_hinam: 19.00, carrefour: 19.10, yochananof: 19.48, tiv_taam: 18.74, osher_ad: 19.03, machsanei_hashuk: 18.92 },
    'צפתית 200 גרם': { shufersal: 22.50, rami_levy: 23.50, victory: 24.50, ybitan: 25.50, hatzi_hinam: 23.00, carrefour: 24.10, yochananof: 23.48, tiv_taam: 23.14, osher_ad: 23.03, machsanei_hashuk: 22.80 },
    'גבינת שמנת 200 גרם': { shufersal: 12.50, rami_levy: 13.50, victory: 14.50, ybitan: 15.50, hatzi_hinam: 13.00, carrefour: 12.90, yochananof: 13.48, tiv_taam: 12.66, osher_ad: 13.03, machsanei_hashuk: 13.10 },
    'מוצרלה 200 גרם': { shufersal: 19.50, rami_levy: 20.50, victory: 21.50, ybitan: 22.50, hatzi_hinam: 20.00, carrefour: 21.90, yochananof: 20.48, tiv_taam: 20.46, osher_ad: 20.02, machsanei_hashuk: 19.88 },
    'מוצרלה 400 גרם': { shufersal: 36.50, rami_levy: 38.50, victory: 39.50, ybitan: 40.50, hatzi_hinam: 37.50, carrefour: 37.10, yochananof: 38.46, tiv_taam: 36.74, osher_ad: 37.55, machsanei_hashuk: 37.35 },
    'פרמזן 150 גרם': { shufersal: 42.50, rami_levy: 44.50, victory: 45.50, ybitan: 46.50, hatzi_hinam: 43.50, carrefour: 43.90, yochananof: 44.46, tiv_taam: 43.06, osher_ad: 43.55, machsanei_hashuk: 43.17 },
    'גאודה 200 גרם': { shufersal: 34.50, rami_levy: 36.50, victory: 37.50, ybitan: 38.50, hatzi_hinam: 35.50, carrefour: 33.50, yochananof: 36.46, tiv_taam: 34.10, osher_ad: 35.55, machsanei_hashuk: 35.41 },
    'אמנטל 200 גרם': { shufersal: 38.50, rami_levy: 40.50, victory: 41.50, ybitan: 42.50, hatzi_hinam: 39.50, carrefour: 42.50, yochananof: 40.46, tiv_taam: 40.10, osher_ad: 39.55, machsanei_hashuk: 39.28 },
    'ברי 125 גרם': { shufersal: 32.50, rami_levy: 34.50, victory: 35.50, ybitan: 36.50, hatzi_hinam: 33.50, carrefour: 31.50, yochananof: 34.46, tiv_taam: 32.10, osher_ad: 33.55, machsanei_hashuk: 33.46 },
    'קממבר 125 גרם': { shufersal: 28.50, rami_levy: 30.50, victory: 31.50, ybitan: 32.50, hatzi_hinam: 29.50, carrefour: 32.10, yochananof: 30.46, tiv_taam: 29.94, osher_ad: 29.55, machsanei_hashuk: 29.59 },
    'חלומי 200 גרם': { shufersal: 36.50, rami_levy: 38.50, victory: 39.50, ybitan: 40.50, hatzi_hinam: 37.50, carrefour: 39.50, yochananof: 38.46, tiv_taam: 37.70, osher_ad: 37.55, machsanei_hashuk: 37.35 },
    'פילדלפיה 200 גרם': { shufersal: 16.50, rami_levy: 17.50, victory: 18.50, ybitan: 19.50, hatzi_hinam: 17.00, carrefour: 15.90, yochananof: 17.48, tiv_taam: 16.26, osher_ad: 17.02, machsanei_hashuk: 16.97 },
    'לאבנה 200 גרם': { shufersal: 12.50, rami_levy: 13.50, victory: 14.50, ybitan: 15.50, hatzi_hinam: 13.00, carrefour: 12.50, yochananof: 13.48, tiv_taam: 12.50, osher_ad: 13.03, machsanei_hashuk: 13.10 },
    'ריקוטה 250 גרם': { shufersal: 22.50, rami_levy: 23.50, victory: 24.50, ybitan: 25.50, hatzi_hinam: 23.00, carrefour: 24.50, yochananof: 23.48, tiv_taam: 23.30, osher_ad: 23.03, machsanei_hashuk: 22.80 },
    'גבינת עזים 150 גרם': { shufersal: 28.50, rami_levy: 30.50, victory: 31.50, ybitan: 32.50, hatzi_hinam: 29.50, carrefour: 31.10, yochananof: 30.46, tiv_taam: 29.54, osher_ad: 29.55, machsanei_hashuk: 29.59 },
    'קשקבל 100 גרם': { shufersal: 11.50, rami_levy: 12.50, victory: 13.50, ybitan: 14.50, hatzi_hinam: 12.00, carrefour: 12.50, yochananof: 12.48, tiv_taam: 11.90, osher_ad: 12.02, machsanei_hashuk: 12.13 },
    'מסקרפונה 250 גרם': { shufersal: 9.50, rami_levy: 10.50, victory: 11.50, ybitan: 12.50, hatzi_hinam: 10.00, carrefour: 8.50, yochananof: 10.48, tiv_taam: 9.10, osher_ad: 10.03, machsanei_hashuk: 10.19 },
    // ביצים
    'ביצים L 12 יח׳': { shufersal: 27.90, rami_levy: 25.90, victory: 28.90, ybitan: 30.90, hatzi_hinam: 27.50, carrefour: 26.90, yochananof: 25.94, tiv_taam: 27.50, osher_ad: 27.42, machsanei_hashuk: 25.12 },
    'ביצים XL 12 יח׳': { shufersal: 31.90, rami_levy: 29.90, victory: 32.90, ybitan: 34.90, hatzi_hinam: 31.50, carrefour: 28.50, yochananof: 29.94, tiv_taam: 30.54, osher_ad: 31.42, machsanei_hashuk: 29.00 },
    'ביצים אורגניות 12 יח׳': { shufersal: 35.90, rami_levy: 33.90, victory: 36.90, ybitan: 38.90, hatzi_hinam: 35.50, carrefour: 33.90, yochananof: 33.94, tiv_taam: 35.10, osher_ad: 35.42, machsanei_hashuk: 32.88 },
    'ביצים חופשיות 12 יח׳': { shufersal: 33.90, rami_levy: 31.90, victory: 34.90, ybitan: 36.90, hatzi_hinam: 33.50, carrefour: 34.10, yochananof: 31.94, tiv_taam: 33.98, osher_ad: 33.42, machsanei_hashuk: 30.94 },
    'ביצים L 6 יח׳': { shufersal: 15.90, rami_levy: 14.90, victory: 16.90, ybitan: 17.90, hatzi_hinam: 15.50, carrefour: 14.10, yochananof: 14.92, tiv_taam: 15.18, osher_ad: 15.47, machsanei_hashuk: 14.45 },
    'ביצים XL 6 יח׳': { shufersal: 17.90, rami_levy: 16.90, victory: 18.90, ybitan: 19.90, hatzi_hinam: 17.50, carrefour: 16.10, yochananof: 16.92, tiv_taam: 17.18, osher_ad: 17.47, machsanei_hashuk: 16.39 },
    // חמאה ושמנת
    'חמאה 200 גרם': { shufersal: 14.50, rami_levy: 15.50, victory: 16.50, ybitan: 17.50, hatzi_hinam: 15.00, carrefour: 15.50, yochananof: 15.48, tiv_taam: 14.90, osher_ad: 15.03, machsanei_hashuk: 15.04 },
    'חמאה מלוחה 200 גרם': { shufersal: 15.50, rami_levy: 16.50, victory: 17.50, ybitan: 18.50, hatzi_hinam: 16.00, carrefour: 13.50, yochananof: 16.48, tiv_taam: 14.70, osher_ad: 16.02, machsanei_hashuk: 16.01 },
    'שמנת מתוקה 200 מ"ל': { shufersal: 9.50, rami_levy: 10.50, victory: 11.50, ybitan: 12.50, hatzi_hinam: 10.00, carrefour: 8.50, yochananof: 10.48, tiv_taam: 9.10, osher_ad: 10.03, machsanei_hashuk: 10.19 },
    'שמנת מתוקה 500 מ"ל': { shufersal: 18.50, rami_levy: 19.50, victory: 20.50, ybitan: 21.50, hatzi_hinam: 19.00, carrefour: 19.50, yochananof: 19.48, tiv_taam: 18.90, osher_ad: 19.03, machsanei_hashuk: 18.92 },
    'שמנת חמוצה 200 גרם': { shufersal: 7.50, rami_levy: 8.50, victory: 9.50, ybitan: 10.50, hatzi_hinam: 8.00, carrefour: 8.10, yochananof: 8.48, tiv_taam: 7.74, osher_ad: 8.03, machsanei_hashuk: 8.24 },
    'שמנת לקצפת 500 מ"ל': { shufersal: 11.50, rami_levy: 12.50, victory: 13.50, ybitan: 14.50, hatzi_hinam: 12.00, carrefour: 10.90, yochananof: 12.48, tiv_taam: 11.26, osher_ad: 12.02, machsanei_hashuk: 12.13 },
    'מרגרינה 250 גרם': { shufersal: 9.50, rami_levy: 10.50, victory: 11.50, ybitan: 12.50, hatzi_hinam: 10.00, carrefour: 8.50, yochananof: 10.48, tiv_taam: 9.10, osher_ad: 10.03, machsanei_hashuk: 10.19 },
    'טופו 300 גרם': { shufersal: 18.50, rami_levy: 19.50, victory: 20.50, ybitan: 21.50, hatzi_hinam: 19.00, carrefour: 17.50, yochananof: 19.48, tiv_taam: 18.10, osher_ad: 19.03, machsanei_hashuk: 18.92 },

    // ===== ממרחים (spreads) =====
    'נוטלה 350 גרם': { shufersal: 24.90, rami_levy: 23.90, victory: 25.90, ybitan: 26.90, hatzi_hinam: 22.90, carrefour: 23.50, yochananof: 23.92, tiv_taam: 24.34, osher_ad: 22.95, machsanei_hashuk: 23.18 },
    'נוטלה 750 גרם': { shufersal: 44.90, rami_levy: 42.90, victory: 45.90, ybitan: 47.90, hatzi_hinam: 41.90, carrefour: 41.90, yochananof: 42.94, tiv_taam: 43.70, osher_ad: 41.95, machsanei_hashuk: 41.61 },
    'ממרח שוקולד השחר העולה 400 גרם': { shufersal: 18.90, rami_levy: 17.90, victory: 19.90, ybitan: 20.90, hatzi_hinam: 16.90, carrefour: 15.90, yochananof: 17.92, tiv_taam: 17.70, osher_ad: 16.95, machsanei_hashuk: 17.36 },
    'ממרח שוקולד עלית 400 גרם': { shufersal: 19.90, rami_levy: 18.90, victory: 20.90, ybitan: 21.90, hatzi_hinam: 17.90, carrefour: 18.50, yochananof: 18.92, tiv_taam: 19.34, osher_ad: 17.95, machsanei_hashuk: 18.33 },
    'ממרח אגוזים 350 גרם': { shufersal: 22.90, rami_levy: 21.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 20.90, carrefour: 20.90, yochananof: 21.92, tiv_taam: 22.10, osher_ad: 20.95, machsanei_hashuk: 21.24 },
    'ממרח לוטוס 400 גרם': { shufersal: 26.90, rami_levy: 24.90, victory: 27.90, ybitan: 28.90, hatzi_hinam: 22.10, carrefour: 23.90, yochananof: 24.94, tiv_taam: 25.70, osher_ad: 22.24, machsanei_hashuk: 24.15 },
    'ממרח לוטוס': { shufersal: 26.90, rami_levy: 24.90, victory: 27.90, ybitan: 28.90, hatzi_hinam: 22.10, carrefour: 19.90, yochananof: 24.94, tiv_taam: 24.10, osher_ad: 22.24, machsanei_hashuk: 24.15 },
    'לוטוס': { shufersal: 26.90, rami_levy: 24.90, victory: 27.90, ybitan: 28.90, hatzi_hinam: 22.10, carrefour: 20.50, yochananof: 24.94, tiv_taam: 24.34, osher_ad: 22.24, machsanei_hashuk: 24.15 },
    'עוגיות לוטוס': { shufersal: 12.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 10.90, carrefour: 11.50, yochananof: 11.92, tiv_taam: 12.34, osher_ad: 10.95, machsanei_hashuk: 11.54 },
    // חמאות אגוזים
    'חמאת בוטנים חלקה 350 גרם': { shufersal: 24.90, rami_levy: 23.90, victory: 25.90, ybitan: 26.90, hatzi_hinam: 22.90, carrefour: 23.50, yochananof: 23.92, tiv_taam: 24.34, osher_ad: 22.95, machsanei_hashuk: 23.18 },
    'חמאת בוטנים קראנצ\'י 350 גרם': { shufersal: 24.90, rami_levy: 23.90, victory: 25.90, ybitan: 26.90, hatzi_hinam: 22.90, carrefour: 22.50, yochananof: 23.92, tiv_taam: 23.94, osher_ad: 22.95, machsanei_hashuk: 23.18 },
    'חמאת בוטנים סקיפי 350 גרם': { shufersal: 28.90, rami_levy: 27.90, victory: 29.90, ybitan: 30.90, hatzi_hinam: 26.90, carrefour: 26.50, yochananof: 27.92, tiv_taam: 27.94, osher_ad: 26.95, machsanei_hashuk: 27.06 },
    'חמאת שקדים 200 גרם': { shufersal: 32.90, rami_levy: 31.90, victory: 33.90, ybitan: 34.90, hatzi_hinam: 30.90, carrefour: 33.50, yochananof: 31.92, tiv_taam: 33.14, osher_ad: 30.95, machsanei_hashuk: 30.94 },
    'חמאת קשיו 200 גרם': { shufersal: 34.90, rami_levy: 33.90, victory: 35.90, ybitan: 36.90, hatzi_hinam: 32.90, carrefour: 35.10, yochananof: 33.92, tiv_taam: 34.98, osher_ad: 32.95, machsanei_hashuk: 32.88 },
    'חמאת אגוזי לוז 200 גרם': { shufersal: 36.90, rami_levy: 35.90, victory: 37.90, ybitan: 38.90, hatzi_hinam: 34.90, carrefour: 31.50, yochananof: 35.92, tiv_taam: 34.74, osher_ad: 34.95, machsanei_hashuk: 34.82 },
    // טחינה
    'טחינה 250 גרם': { shufersal: 16.90, rami_levy: 14.90, victory: 17.90, ybitan: 18.90, hatzi_hinam: 15.90, carrefour: 16.50, yochananof: 14.94, tiv_taam: 16.74, osher_ad: 15.85, machsanei_hashuk: 14.45 },
    'טחינה 500 גרם': { shufersal: 24.90, rami_levy: 22.90, victory: 25.90, ybitan: 26.90, hatzi_hinam: 23.90, carrefour: 22.90, yochananof: 22.94, tiv_taam: 24.10, osher_ad: 23.85, machsanei_hashuk: 22.21 },
    'טחינה גולמית 250 גרם': { shufersal: 19.90, rami_levy: 17.90, victory: 20.90, ybitan: 21.90, hatzi_hinam: 18.90, carrefour: 16.90, yochananof: 17.94, tiv_taam: 18.70, osher_ad: 18.85, machsanei_hashuk: 17.36 },
    'טחינה גולמית 500 גרם': { shufersal: 32.90, rami_levy: 29.90, victory: 33.90, ybitan: 34.90, hatzi_hinam: 30.90, carrefour: 33.10, yochananof: 29.96, tiv_taam: 32.98, osher_ad: 30.85, machsanei_hashuk: 29.00 },
    'טחינה אל ארז 500 גרם': { shufersal: 26.90, rami_levy: 24.90, victory: 27.90, ybitan: 28.90, hatzi_hinam: 25.90, carrefour: 26.90, yochananof: 24.94, tiv_taam: 26.90, osher_ad: 25.85, machsanei_hashuk: 24.15 },
    'טחינה הבאבא 500 גרם': { shufersal: 24.90, rami_levy: 22.90, victory: 25.90, ybitan: 26.90, hatzi_hinam: 23.90, carrefour: 25.50, yochananof: 22.94, tiv_taam: 25.14, osher_ad: 23.85, machsanei_hashuk: 22.21 },
    // חלווה
    'חלווה 400 גרם': { shufersal: 18.90, rami_levy: 16.90, victory: 19.90, ybitan: 20.90, hatzi_hinam: 17.90, carrefour: 19.10, yochananof: 16.94, tiv_taam: 18.98, osher_ad: 17.85, machsanei_hashuk: 16.39 },
    'חלווה פרוסות 250 גרם': { shufersal: 14.90, rami_levy: 13.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50, carrefour: 13.50, yochananof: 13.92, tiv_taam: 14.34, osher_ad: 14.47, machsanei_hashuk: 13.48 },
    'חלווה שוקולד 400 גרם': { shufersal: 19.90, rami_levy: 17.90, victory: 20.90, ybitan: 21.90, hatzi_hinam: 18.90, carrefour: 20.10, yochananof: 17.94, tiv_taam: 19.98, osher_ad: 18.85, machsanei_hashuk: 17.36 },
    'חלווה פיסטוק 400 גרם': { shufersal: 22.90, rami_levy: 20.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 21.90, carrefour: 23.90, yochananof: 20.94, tiv_taam: 23.30, osher_ad: 21.85, machsanei_hashuk: 20.27 },
    // ריבות
    'ריבה תות 350 גרם': { shufersal: 14.90, rami_levy: 13.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50, carrefour: 15.50, yochananof: 13.92, tiv_taam: 15.14, osher_ad: 14.47, machsanei_hashuk: 13.48 },
    'ריבה משמש 350 גרם': { shufersal: 14.90, rami_levy: 13.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50, carrefour: 14.50, yochananof: 13.92, tiv_taam: 14.74, osher_ad: 14.47, machsanei_hashuk: 13.48 },
    'ריבה דובדבן 350 גרם': { shufersal: 14.90, rami_levy: 13.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50, carrefour: 13.50, yochananof: 13.92, tiv_taam: 14.34, osher_ad: 14.47, machsanei_hashuk: 13.48 },
    'ריבה תפוז 350 גרם': { shufersal: 14.90, rami_levy: 13.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50, carrefour: 15.50, yochananof: 13.92, tiv_taam: 15.14, osher_ad: 14.47, machsanei_hashuk: 13.48 },
    'ריבה פטל 350 גרם': { shufersal: 16.90, rami_levy: 15.90, victory: 17.90, ybitan: 18.90, hatzi_hinam: 16.50, carrefour: 17.90, yochananof: 15.92, tiv_taam: 17.30, osher_ad: 16.47, machsanei_hashuk: 15.42 },
    'ריבה ללא סוכר 350 גרם': { shufersal: 18.90, rami_levy: 17.90, victory: 19.90, ybitan: 20.90, hatzi_hinam: 18.50, carrefour: 15.90, yochananof: 17.92, tiv_taam: 17.70, osher_ad: 18.47, machsanei_hashuk: 17.36 },
    'מרמלדה 350 גרם': { shufersal: 12.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50, carrefour: 13.50, yochananof: 11.92, tiv_taam: 13.14, osher_ad: 12.47, machsanei_hashuk: 11.54 },
    // דבש וסילאן
    'דבש טהור 350 גרם': { shufersal: 29.90, rami_levy: 27.90, victory: 30.90, ybitan: 31.90, hatzi_hinam: 28.90, carrefour: 31.90, yochananof: 27.94, tiv_taam: 30.70, osher_ad: 28.85, machsanei_hashuk: 27.06 },
    'דבש טהור 700 גרם': { shufersal: 49.90, rami_levy: 46.90, victory: 51.90, ybitan: 53.90, hatzi_hinam: 47.90, carrefour: 51.90, yochananof: 46.96, tiv_taam: 50.70, osher_ad: 47.85, machsanei_hashuk: 45.49 },
    'דבש פרחים 350 גרם': { shufersal: 32.90, rami_levy: 30.90, victory: 33.90, ybitan: 34.90, hatzi_hinam: 31.90, carrefour: 34.10, yochananof: 30.94, tiv_taam: 33.38, osher_ad: 31.85, machsanei_hashuk: 29.97 },
    'דבש אורגני 350 גרם': { shufersal: 39.90, rami_levy: 37.90, victory: 41.90, ybitan: 43.90, hatzi_hinam: 38.90, carrefour: 35.50, yochananof: 37.94, tiv_taam: 38.14, osher_ad: 38.85, machsanei_hashuk: 36.76 },
    'סילאן טהור 350 גרם': { shufersal: 22.90, rami_levy: 20.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 21.90, carrefour: 22.50, yochananof: 20.94, tiv_taam: 22.74, osher_ad: 21.85, machsanei_hashuk: 20.27 },
    'סילאן טהור 700 גרם': { shufersal: 39.90, rami_levy: 36.90, victory: 41.90, ybitan: 43.90, hatzi_hinam: 37.90, carrefour: 38.10, yochananof: 36.96, tiv_taam: 39.18, osher_ad: 37.85, machsanei_hashuk: 35.79 },
    // ממרחים מלוחים
    'ממרח שום 200 גרם': { shufersal: 12.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50, carrefour: 12.90, yochananof: 11.92, tiv_taam: 12.90, osher_ad: 12.47, machsanei_hashuk: 11.54 },
    'ממרח זיתים 200 גרם': { shufersal: 14.90, rami_levy: 13.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 14.50, carrefour: 12.50, yochananof: 13.92, tiv_taam: 13.94, osher_ad: 14.47, machsanei_hashuk: 13.48 },
    'ממרח עגבניות מיובשות 200 גרם': { shufersal: 16.90, rami_levy: 15.90, victory: 17.90, ybitan: 18.90, hatzi_hinam: 16.50, carrefour: 17.10, yochananof: 15.92, tiv_taam: 16.98, osher_ad: 16.47, machsanei_hashuk: 15.42 },
    'ממרח ארטישוק 200 גרם': { shufersal: 18.90, rami_levy: 17.90, victory: 19.90, ybitan: 20.90, hatzi_hinam: 18.50, carrefour: 19.10, yochananof: 17.92, tiv_taam: 18.98, osher_ad: 18.47, machsanei_hashuk: 17.36 },
    'פסטו ירוק 190 גרם': { shufersal: 19.90, rami_levy: 18.90, victory: 20.90, ybitan: 21.90, hatzi_hinam: 19.50, carrefour: 18.90, yochananof: 18.92, tiv_taam: 19.50, osher_ad: 19.47, machsanei_hashuk: 18.33 },
    'פסטו אדום 190 גרם': { shufersal: 19.90, rami_levy: 18.90, victory: 20.90, ybitan: 21.90, hatzi_hinam: 19.50, carrefour: 19.50, yochananof: 18.92, tiv_taam: 19.74, osher_ad: 19.47, machsanei_hashuk: 18.33 },
    'ממרח חציל 200 גרם': { shufersal: 12.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50, carrefour: 13.10, yochananof: 11.92, tiv_taam: 12.98, osher_ad: 12.47, machsanei_hashuk: 11.54 },
    'חומוס ממרח 400 גרם': { shufersal: 12.90, rami_levy: 10.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.90, carrefour: 11.50, yochananof: 10.94, tiv_taam: 12.34, osher_ad: 11.85, machsanei_hashuk: 10.57 },

    // ===== פירות וירקות (רמי לוי וויקטורי זולים) =====
    'עגבניות': { shufersal: 9.90, rami_levy: 6.90, victory: 7.50, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 8.50, yochananof: 6.96, tiv_taam: 9.34, osher_ad: 8.80, machsanei_hashuk: 6.69 },
    'עגבניות שרי': { shufersal: 14.90, rami_levy: 11.90, victory: 12.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 12.50, yochananof: 11.96, tiv_taam: 13.94, osher_ad: 13.80, machsanei_hashuk: 11.54 },
    'עגבניות מגי': { shufersal: 16.90, rami_levy: 13.90, victory: 14.50, ybitan: 17.50, hatzi_hinam: 15.90, carrefour: 15.90, yochananof: 13.96, tiv_taam: 16.50, osher_ad: 15.80, machsanei_hashuk: 13.48 },
    'מלפפונים': { shufersal: 7.90, rami_levy: 4.90, victory: 5.50, ybitan: 8.50, hatzi_hinam: 6.90, carrefour: 6.10, yochananof: 4.96, tiv_taam: 7.18, osher_ad: 6.80, machsanei_hashuk: 4.75 },
    'מלפפון בייבי': { shufersal: 10.90, rami_levy: 7.90, victory: 8.50, ybitan: 11.50, hatzi_hinam: 9.90, carrefour: 8.50, yochananof: 7.96, tiv_taam: 9.94, osher_ad: 9.80, machsanei_hashuk: 7.66 },
    'בצל': { shufersal: 6.90, rami_levy: 3.90, victory: 4.50, ybitan: 7.50, hatzi_hinam: 5.90, carrefour: 6.10, yochananof: 3.96, tiv_taam: 6.58, osher_ad: 5.80, machsanei_hashuk: 3.78 },
    'בצל סגול': { shufersal: 8.90, rami_levy: 5.90, victory: 6.50, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 7.10, yochananof: 5.96, tiv_taam: 8.18, osher_ad: 7.80, machsanei_hashuk: 5.72 },
    'בצל ירוק': { shufersal: 5.90, rami_levy: 3.90, victory: 4.50, ybitan: 6.50, hatzi_hinam: 4.90, carrefour: 5.10, yochananof: 3.94, tiv_taam: 5.58, osher_ad: 4.85, machsanei_hashuk: 3.78 },
    'שום': { shufersal: 12.90, rami_levy: 9.90, victory: 10.50, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 12.90, yochananof: 9.96, tiv_taam: 12.90, osher_ad: 11.80, machsanei_hashuk: 9.60 },
    'שום קלוף': { shufersal: 16.90, rami_levy: 13.90, victory: 14.50, ybitan: 17.50, hatzi_hinam: 15.90, carrefour: 13.50, yochananof: 13.96, tiv_taam: 15.54, osher_ad: 15.80, machsanei_hashuk: 13.48 },
    'פלפל אדום': { shufersal: 14.90, rami_levy: 10.90, victory: 11.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 12.10, yochananof: 10.98, tiv_taam: 13.78, osher_ad: 13.75, machsanei_hashuk: 10.57 },
    'פלפל ירוק': { shufersal: 9.90, rami_levy: 6.90, victory: 7.50, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 9.50, yochananof: 6.96, tiv_taam: 9.74, osher_ad: 8.80, machsanei_hashuk: 6.69 },
    'פלפל צהוב': { shufersal: 14.90, rami_levy: 10.90, victory: 11.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 13.50, yochananof: 10.98, tiv_taam: 14.34, osher_ad: 13.75, machsanei_hashuk: 10.57 },
    'פלפל כתום': { shufersal: 14.90, rami_levy: 10.90, victory: 11.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 12.10, yochananof: 10.98, tiv_taam: 13.78, osher_ad: 13.75, machsanei_hashuk: 10.57 },
    'פלפל חריף': { shufersal: 29.90, rami_levy: 24.90, victory: 26.50, ybitan: 32.50, hatzi_hinam: 27.90, carrefour: 25.50, yochananof: 25.00, tiv_taam: 28.14, osher_ad: 27.75, machsanei_hashuk: 24.15 },
    'חסה': { shufersal: 8.90, rami_levy: 5.90, victory: 6.50, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 7.10, yochananof: 5.96, tiv_taam: 8.18, osher_ad: 7.80, machsanei_hashuk: 5.72 },
    'חסה אייסברג': { shufersal: 9.90, rami_levy: 6.90, victory: 7.50, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 9.50, yochananof: 6.96, tiv_taam: 9.74, osher_ad: 8.80, machsanei_hashuk: 6.69 },
    'חסה רומית': { shufersal: 8.90, rami_levy: 5.90, victory: 6.50, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 8.10, yochananof: 5.96, tiv_taam: 8.58, osher_ad: 7.80, machsanei_hashuk: 5.72 },
    'כרוב': { shufersal: 6.90, rami_levy: 3.90, victory: 4.50, ybitan: 7.50, hatzi_hinam: 5.90, carrefour: 5.50, yochananof: 3.96, tiv_taam: 6.34, osher_ad: 5.80, machsanei_hashuk: 3.78 },
    'כרוב סגול': { shufersal: 8.90, rami_levy: 5.90, victory: 6.50, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 6.90, yochananof: 5.96, tiv_taam: 8.10, osher_ad: 7.80, machsanei_hashuk: 5.72 },
    'כרוב סיני': { shufersal: 9.90, rami_levy: 6.90, victory: 7.50, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 9.50, yochananof: 6.96, tiv_taam: 9.74, osher_ad: 8.80, machsanei_hashuk: 6.69 },
    'גזר': { shufersal: 6.90, rami_levy: 3.90, victory: 4.50, ybitan: 7.50, hatzi_hinam: 5.90, carrefour: 6.50, yochananof: 3.96, tiv_taam: 6.74, osher_ad: 5.80, machsanei_hashuk: 3.78 },
    'גזר בייבי': { shufersal: 10.90, rami_levy: 7.90, victory: 8.50, ybitan: 11.50, hatzi_hinam: 9.90, carrefour: 9.90, yochananof: 7.96, tiv_taam: 10.50, osher_ad: 9.80, machsanei_hashuk: 7.66 },
    'סלק': { shufersal: 7.90, rami_levy: 4.90, victory: 5.50, ybitan: 8.50, hatzi_hinam: 6.90, carrefour: 6.10, yochananof: 4.96, tiv_taam: 7.18, osher_ad: 6.80, machsanei_hashuk: 4.75 },
    'סלק מבושל': { shufersal: 12.90, rami_levy: 9.90, victory: 10.50, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 13.10, yochananof: 9.96, tiv_taam: 12.98, osher_ad: 11.80, machsanei_hashuk: 9.60 },
    'תפו״א אדום': { shufersal: 6.90, rami_levy: 3.90, victory: 4.50, ybitan: 7.50, hatzi_hinam: 5.90, carrefour: 6.10, yochananof: 3.96, tiv_taam: 6.58, osher_ad: 5.80, machsanei_hashuk: 3.78 },
    'תפו״א לבן': { shufersal: 6.90, rami_levy: 3.90, victory: 4.50, ybitan: 7.50, hatzi_hinam: 5.90, carrefour: 5.10, yochananof: 3.96, tiv_taam: 6.18, osher_ad: 5.80, machsanei_hashuk: 3.78 },
    'בטטה': { shufersal: 9.90, rami_levy: 6.90, victory: 7.50, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 8.50, yochananof: 6.96, tiv_taam: 9.34, osher_ad: 8.80, machsanei_hashuk: 6.69 },
    'קישוא': { shufersal: 8.90, rami_levy: 5.90, victory: 6.50, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 8.10, yochananof: 5.96, tiv_taam: 8.58, osher_ad: 7.80, machsanei_hashuk: 5.72 },
    'קישוא ירוק': { shufersal: 8.90, rami_levy: 5.90, victory: 6.50, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 8.50, yochananof: 5.96, tiv_taam: 8.74, osher_ad: 7.80, machsanei_hashuk: 5.72 },
    'חציל': { shufersal: 9.90, rami_levy: 6.90, victory: 7.50, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 9.50, yochananof: 6.96, tiv_taam: 9.74, osher_ad: 8.80, machsanei_hashuk: 6.69 },
    'ברוקולי': { shufersal: 14.90, rami_levy: 10.90, victory: 11.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 14.10, yochananof: 10.98, tiv_taam: 14.58, osher_ad: 13.75, machsanei_hashuk: 10.57 },
    'כרובית': { shufersal: 10.90, rami_levy: 7.90, victory: 8.50, ybitan: 11.50, hatzi_hinam: 9.90, carrefour: 8.50, yochananof: 7.96, tiv_taam: 9.94, osher_ad: 9.80, machsanei_hashuk: 7.66 },
    'תרד': { shufersal: 10.90, rami_levy: 7.90, victory: 8.50, ybitan: 11.50, hatzi_hinam: 9.90, carrefour: 8.50, yochananof: 7.96, tiv_taam: 9.94, osher_ad: 9.80, machsanei_hashuk: 7.66 },
    'תרד בייבי': { shufersal: 14.90, rami_levy: 11.90, victory: 12.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 11.90, yochananof: 11.96, tiv_taam: 13.70, osher_ad: 13.80, machsanei_hashuk: 11.54 },
    'פטרוזיליה': { shufersal: 5.90, rami_levy: 3.90, victory: 4.50, ybitan: 6.50, hatzi_hinam: 4.90, carrefour: 5.10, yochananof: 3.94, tiv_taam: 5.58, osher_ad: 4.85, machsanei_hashuk: 3.78 },
    'כוסברה': { shufersal: 5.90, rami_levy: 3.90, victory: 4.50, ybitan: 6.50, hatzi_hinam: 4.90, carrefour: 4.90, yochananof: 3.94, tiv_taam: 5.50, osher_ad: 4.85, machsanei_hashuk: 3.78 },
    'נענע': { shufersal: 5.90, rami_levy: 3.90, victory: 4.50, ybitan: 6.50, hatzi_hinam: 4.90, carrefour: 5.10, yochananof: 3.94, tiv_taam: 5.58, osher_ad: 4.85, machsanei_hashuk: 3.78 },
    'שמיר': { shufersal: 5.90, rami_levy: 3.90, victory: 4.50, ybitan: 6.50, hatzi_hinam: 4.90, carrefour: 4.50, yochananof: 3.94, tiv_taam: 5.34, osher_ad: 4.85, machsanei_hashuk: 3.78 },
    'ריחן': { shufersal: 6.90, rami_levy: 4.90, victory: 5.50, ybitan: 7.50, hatzi_hinam: 5.90, carrefour: 5.50, yochananof: 4.94, tiv_taam: 6.34, osher_ad: 5.85, machsanei_hashuk: 4.75 },
    'רוקט': { shufersal: 10.90, rami_levy: 7.90, victory: 8.50, ybitan: 11.50, hatzi_hinam: 9.90, carrefour: 8.50, yochananof: 7.96, tiv_taam: 9.94, osher_ad: 9.80, machsanei_hashuk: 7.66 },
    'סלרי': { shufersal: 8.90, rami_levy: 5.90, victory: 6.50, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 8.10, yochananof: 5.96, tiv_taam: 8.58, osher_ad: 7.80, machsanei_hashuk: 5.72 },
    'שומר': { shufersal: 9.90, rami_levy: 6.90, victory: 7.50, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 9.50, yochananof: 6.96, tiv_taam: 9.74, osher_ad: 8.80, machsanei_hashuk: 6.69 },
    'פטריות שמפיניון': { shufersal: 16.90, rami_levy: 13.90, victory: 14.50, ybitan: 17.50, hatzi_hinam: 15.90, carrefour: 13.50, yochananof: 13.96, tiv_taam: 15.54, osher_ad: 15.80, machsanei_hashuk: 13.48 },
    'פטריות פורטובלו': { shufersal: 22.90, rami_levy: 18.90, victory: 19.50, ybitan: 23.50, hatzi_hinam: 20.90, carrefour: 19.90, yochananof: 18.98, tiv_taam: 21.70, osher_ad: 20.80, machsanei_hashuk: 18.33 },
    // פירות
    'בננות': { shufersal: 9.90, rami_levy: 6.90, victory: 5.90, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 9.10, yochananof: 6.96, tiv_taam: 9.58, osher_ad: 8.80, machsanei_hashuk: 6.69 },
    'תפוחים ירוקים': { shufersal: 12.90, rami_levy: 9.90, victory: 8.90, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 10.50, yochananof: 9.96, tiv_taam: 11.94, osher_ad: 11.80, machsanei_hashuk: 9.60 },
    'תפוחים אדומים': { shufersal: 12.90, rami_levy: 9.90, victory: 8.90, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 10.50, yochananof: 9.96, tiv_taam: 11.94, osher_ad: 11.80, machsanei_hashuk: 9.60 },
    'תפוזים': { shufersal: 8.90, rami_levy: 5.90, victory: 4.90, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 6.90, yochananof: 5.96, tiv_taam: 8.10, osher_ad: 7.80, machsanei_hashuk: 5.72 },
    'קלמנטינות': { shufersal: 13.90, rami_levy: 10.90, victory: 9.90, ybitan: 14.50, hatzi_hinam: 12.90, carrefour: 13.90, yochananof: 10.96, tiv_taam: 13.90, osher_ad: 12.80, machsanei_hashuk: 10.57 },
    'אשכולית': { shufersal: 7.90, rami_levy: 4.90, victory: 3.90, ybitan: 8.50, hatzi_hinam: 6.90, carrefour: 6.10, yochananof: 4.96, tiv_taam: 7.18, osher_ad: 6.80, machsanei_hashuk: 4.75 },
    'אשכולית אדומה': { shufersal: 8.90, rami_levy: 5.90, victory: 4.90, ybitan: 9.50, hatzi_hinam: 7.90, carrefour: 7.50, yochananof: 5.96, tiv_taam: 8.34, osher_ad: 7.80, machsanei_hashuk: 5.72 },
    'פומלה': { shufersal: 9.90, rami_levy: 6.90, victory: 5.90, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 9.50, yochananof: 6.96, tiv_taam: 9.74, osher_ad: 8.80, machsanei_hashuk: 6.69 },
    'לימון': { shufersal: 9.90, rami_levy: 6.90, victory: 5.90, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 8.50, yochananof: 6.96, tiv_taam: 9.34, osher_ad: 8.80, machsanei_hashuk: 6.69 },
    'ליים': { shufersal: 12.90, rami_levy: 9.90, victory: 8.90, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 10.50, yochananof: 9.96, tiv_taam: 11.94, osher_ad: 11.80, machsanei_hashuk: 9.60 },
    'אבוקדו': { shufersal: 7.90, rami_levy: 5.90, victory: 4.90, ybitan: 8.50, hatzi_hinam: 6.90, carrefour: 7.10, yochananof: 5.94, tiv_taam: 7.58, osher_ad: 6.85, machsanei_hashuk: 5.72 },
    'מנגו': { shufersal: 16.90, rami_levy: 13.90, victory: 12.90, ybitan: 17.50, hatzi_hinam: 15.90, carrefour: 16.50, yochananof: 13.96, tiv_taam: 16.74, osher_ad: 15.80, machsanei_hashuk: 13.48 },
    'אננס': { shufersal: 18.90, rami_levy: 14.90, victory: 13.90, ybitan: 19.50, hatzi_hinam: 16.90, carrefour: 16.50, yochananof: 14.98, tiv_taam: 17.94, osher_ad: 16.80, machsanei_hashuk: 14.45 },
    'ענבים ירוקים': { shufersal: 26.90, rami_levy: 22.90, victory: 21.90, ybitan: 27.50, hatzi_hinam: 24.90, carrefour: 27.10, yochananof: 22.98, tiv_taam: 26.98, osher_ad: 24.80, machsanei_hashuk: 22.21 },
    'ענבים שחורים': { shufersal: 26.90, rami_levy: 22.90, victory: 21.90, ybitan: 27.50, hatzi_hinam: 24.90, carrefour: 26.10, yochananof: 22.98, tiv_taam: 26.58, osher_ad: 24.80, machsanei_hashuk: 22.21 },
    'אגס': { shufersal: 15.90, rami_levy: 12.90, victory: 11.90, ybitan: 16.50, hatzi_hinam: 14.90, carrefour: 16.10, yochananof: 12.96, tiv_taam: 15.98, osher_ad: 14.80, machsanei_hashuk: 12.51 },
    'שזיפים': { shufersal: 19.90, rami_levy: 16.90, victory: 15.90, ybitan: 20.50, hatzi_hinam: 18.90, carrefour: 19.10, yochananof: 16.96, tiv_taam: 19.58, osher_ad: 18.80, machsanei_hashuk: 16.39 },
    'אפרסקים': { shufersal: 17.90, rami_levy: 14.90, victory: 13.90, ybitan: 18.50, hatzi_hinam: 16.90, carrefour: 18.10, yochananof: 14.96, tiv_taam: 17.98, osher_ad: 16.80, machsanei_hashuk: 14.45 },
    'נקטרינות': { shufersal: 17.90, rami_levy: 14.90, victory: 13.90, ybitan: 18.50, hatzi_hinam: 16.90, carrefour: 17.90, yochananof: 14.96, tiv_taam: 17.90, osher_ad: 16.80, machsanei_hashuk: 14.45 },
    'קיווי': { shufersal: 5.90, rami_levy: 4.90, victory: 3.90, ybitan: 6.50, hatzi_hinam: 5.50, carrefour: 4.90, yochananof: 4.92, tiv_taam: 5.50, osher_ad: 5.47, machsanei_hashuk: 4.75 },
    'רימונים': { shufersal: 10.90, rami_levy: 7.90, victory: 6.90, ybitan: 11.50, hatzi_hinam: 9.90, carrefour: 10.50, yochananof: 7.96, tiv_taam: 10.74, osher_ad: 9.80, machsanei_hashuk: 7.66 },
    'תותים': { shufersal: 26.90, rami_levy: 22.90, victory: 21.90, ybitan: 27.50, hatzi_hinam: 24.90, carrefour: 25.90, yochananof: 22.98, tiv_taam: 26.50, osher_ad: 24.80, machsanei_hashuk: 22.21 },
    'אוכמניות': { shufersal: 36.90, rami_levy: 32.90, victory: 31.90, ybitan: 37.50, hatzi_hinam: 34.90, carrefour: 37.50, yochananof: 32.98, tiv_taam: 37.14, osher_ad: 34.80, machsanei_hashuk: 31.91 },
    'פטל': { shufersal: 31.90, rami_levy: 27.90, victory: 26.90, ybitan: 32.50, hatzi_hinam: 29.90, carrefour: 31.50, yochananof: 27.98, tiv_taam: 31.74, osher_ad: 29.80, machsanei_hashuk: 27.06 },
    'דובדבנים': { shufersal: 41.90, rami_levy: 37.90, victory: 36.90, ybitan: 42.50, hatzi_hinam: 39.90, carrefour: 43.10, yochananof: 37.98, tiv_taam: 42.38, osher_ad: 39.80, machsanei_hashuk: 36.76 },
    'אבטיח': { shufersal: 4.90, rami_levy: 2.90, victory: 2.50, ybitan: 5.50, hatzi_hinam: 3.90, carrefour: 3.90, yochananof: 2.94, tiv_taam: 4.50, osher_ad: 3.85, machsanei_hashuk: 2.81 },
    'מלון': { shufersal: 6.90, rami_levy: 4.90, victory: 3.90, ybitan: 7.50, hatzi_hinam: 5.90, carrefour: 5.50, yochananof: 4.94, tiv_taam: 6.34, osher_ad: 5.85, machsanei_hashuk: 4.75 },

    // ===== לחם ומאפים (ויקטורי זול) =====
    'לחם': { shufersal: 9.90, rami_levy: 8.90, victory: 7.50, ybitan: 9.50, hatzi_hinam: 8.50, carrefour: 7.90, yochananof: 8.92, tiv_taam: 9.10, osher_ad: 8.52, machsanei_hashuk: 8.63 },
    'לחם מלא': { shufersal: 12.90, rami_levy: 11.90, victory: 9.50, ybitan: 12.50, hatzi_hinam: 10.90, carrefour: 10.10, yochananof: 11.92, tiv_taam: 11.78, osher_ad: 10.95, machsanei_hashuk: 11.54 },
    'לחם שיפון': { shufersal: 14.90, rami_levy: 13.90, victory: 11.50, ybitan: 14.50, hatzi_hinam: 12.90, carrefour: 13.10, yochananof: 13.92, tiv_taam: 14.18, osher_ad: 12.95, machsanei_hashuk: 13.48 },
    'לחם כוסמין': { shufersal: 16.90, rami_levy: 15.90, victory: 13.50, ybitan: 16.50, hatzi_hinam: 14.90, carrefour: 14.10, yochananof: 15.92, tiv_taam: 15.78, osher_ad: 14.95, machsanei_hashuk: 15.42 },
    'לחם דגנים': { shufersal: 13.90, rami_levy: 12.90, victory: 10.50, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 11.50, yochananof: 12.92, tiv_taam: 12.94, osher_ad: 11.95, machsanei_hashuk: 12.51 },
    'לחם פרוס': { shufersal: 10.90, rami_levy: 9.90, victory: 8.50, ybitan: 10.50, hatzi_hinam: 9.50, carrefour: 9.50, yochananof: 9.92, tiv_taam: 10.34, osher_ad: 9.52, machsanei_hashuk: 9.60 },
    'לחם אחיד': { shufersal: 5.90, rami_levy: 5.90, victory: 5.90, ybitan: 5.90, hatzi_hinam: 5.90, carrefour: 5.10, yochananof: 5.90, tiv_taam: 5.58, osher_ad: 5.90, machsanei_hashuk: 5.72 },
    'לחם ללא גלוטן': { shufersal: 24.90, rami_levy: 23.90, victory: 21.50, ybitan: 24.50, hatzi_hinam: 22.90, carrefour: 24.50, yochananof: 23.92, tiv_taam: 24.74, osher_ad: 22.95, machsanei_hashuk: 23.18 },
    'חלה': { shufersal: 13.90, rami_levy: 12.90, victory: 10.50, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 11.10, yochananof: 12.92, tiv_taam: 12.78, osher_ad: 11.95, machsanei_hashuk: 12.51 },
    'חלה מלאה': { shufersal: 15.90, rami_levy: 14.90, victory: 12.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 15.10, yochananof: 14.92, tiv_taam: 15.58, osher_ad: 13.95, machsanei_hashuk: 14.45 },
    'חלה מתוקה': { shufersal: 14.90, rami_levy: 13.90, victory: 11.50, ybitan: 14.50, hatzi_hinam: 12.90, carrefour: 11.90, yochananof: 13.92, tiv_taam: 13.70, osher_ad: 12.95, machsanei_hashuk: 13.48 },
    'פיתות': { shufersal: 8.90, rami_levy: 7.90, victory: 6.50, ybitan: 8.50, hatzi_hinam: 7.50, carrefour: 7.90, yochananof: 7.92, tiv_taam: 8.50, osher_ad: 7.52, machsanei_hashuk: 7.66 },
    'פיתות מלאות': { shufersal: 10.90, rami_levy: 9.90, victory: 8.50, ybitan: 10.50, hatzi_hinam: 9.50, carrefour: 8.50, yochananof: 9.92, tiv_taam: 9.94, osher_ad: 9.52, machsanei_hashuk: 9.60 },
    'פיתות מיני': { shufersal: 7.90, rami_levy: 6.90, victory: 5.50, ybitan: 7.50, hatzi_hinam: 6.50, carrefour: 5.50, yochananof: 6.92, tiv_taam: 6.94, osher_ad: 6.52, machsanei_hashuk: 6.69 },
    'לחמניות': { shufersal: 15.90, rami_levy: 14.90, victory: 12.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 12.50, yochananof: 14.92, tiv_taam: 14.54, osher_ad: 13.95, machsanei_hashuk: 14.45 },
    'לחמניות המבורגר': { shufersal: 14.90, rami_levy: 13.90, victory: 11.50, ybitan: 14.50, hatzi_hinam: 12.90, carrefour: 12.10, yochananof: 13.92, tiv_taam: 13.78, osher_ad: 12.95, machsanei_hashuk: 13.48 },
    'לחמניות נקניקיה': { shufersal: 13.90, rami_levy: 12.90, victory: 10.50, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 11.50, yochananof: 12.92, tiv_taam: 12.94, osher_ad: 11.95, machsanei_hashuk: 12.51 },
    'בגט': { shufersal: 8.90, rami_levy: 7.90, victory: 6.50, ybitan: 8.50, hatzi_hinam: 7.50, carrefour: 7.10, yochananof: 7.92, tiv_taam: 8.18, osher_ad: 7.52, machsanei_hashuk: 7.66 },
    'צ\'בטה': { shufersal: 10.90, rami_levy: 9.90, victory: 8.50, ybitan: 10.50, hatzi_hinam: 9.50, carrefour: 10.10, yochananof: 9.92, tiv_taam: 10.58, osher_ad: 9.52, machsanei_hashuk: 9.60 },
    'פוקצ\'ה': { shufersal: 16.90, rami_levy: 15.90, victory: 13.50, ybitan: 16.50, hatzi_hinam: 14.90, carrefour: 12.90, yochananof: 15.92, tiv_taam: 15.30, osher_ad: 14.95, machsanei_hashuk: 15.42 },
    'טורטייה': { shufersal: 15.90, rami_levy: 14.90, victory: 12.50, ybitan: 15.50, hatzi_hinam: 13.90, carrefour: 15.10, yochananof: 14.92, tiv_taam: 15.58, osher_ad: 13.95, machsanei_hashuk: 14.45 },
    'לאפה': { shufersal: 9.90, rami_levy: 8.90, victory: 7.50, ybitan: 9.50, hatzi_hinam: 8.50, carrefour: 7.10, yochananof: 8.92, tiv_taam: 8.78, osher_ad: 8.52, machsanei_hashuk: 8.63 },
    'קרואסון': { shufersal: 7.90, rami_levy: 6.90, victory: 5.50, ybitan: 7.50, hatzi_hinam: 6.50, carrefour: 6.10, yochananof: 6.92, tiv_taam: 7.18, osher_ad: 6.52, machsanei_hashuk: 6.69 },
    'קרואסון שוקולד': { shufersal: 9.90, rami_levy: 8.90, victory: 7.50, ybitan: 9.50, hatzi_hinam: 8.50, carrefour: 8.10, yochananof: 8.92, tiv_taam: 9.18, osher_ad: 8.52, machsanei_hashuk: 8.63 },
    'בורקס': { shufersal: 9.90, rami_levy: 8.90, victory: 7.50, ybitan: 9.50, hatzi_hinam: 8.50, carrefour: 7.50, yochananof: 8.92, tiv_taam: 8.94, osher_ad: 8.52, machsanei_hashuk: 8.63 },
    'בורקס גבינה': { shufersal: 14.90, rami_levy: 13.90, victory: 11.50, ybitan: 14.50, hatzi_hinam: 12.90, carrefour: 12.50, yochananof: 13.92, tiv_taam: 13.94, osher_ad: 12.95, machsanei_hashuk: 13.48 },
    'בורקס תפו״א': { shufersal: 12.90, rami_levy: 11.90, victory: 9.50, ybitan: 12.50, hatzi_hinam: 10.90, carrefour: 9.50, yochananof: 11.92, tiv_taam: 11.54, osher_ad: 10.95, machsanei_hashuk: 11.54 },
    'בורקס פטריות': { shufersal: 14.90, rami_levy: 13.90, victory: 11.50, ybitan: 14.50, hatzi_hinam: 12.90, carrefour: 13.50, yochananof: 13.92, tiv_taam: 14.34, osher_ad: 12.95, machsanei_hashuk: 13.48 },
    'עוגיות': { shufersal: 12.90, rami_levy: 11.90, victory: 9.50, ybitan: 12.50, hatzi_hinam: 10.90, carrefour: 11.90, yochananof: 11.92, tiv_taam: 12.50, osher_ad: 10.95, machsanei_hashuk: 11.54 },
    'עוגיות שוקולד צ\'יפס': { shufersal: 14.90, rami_levy: 13.90, victory: 11.50, ybitan: 14.50, hatzi_hinam: 12.90, carrefour: 12.10, yochananof: 13.92, tiv_taam: 13.78, osher_ad: 12.95, machsanei_hashuk: 13.48 },
    'עוגיות חמאה': { shufersal: 13.90, rami_levy: 12.90, victory: 10.50, ybitan: 13.50, hatzi_hinam: 11.90, carrefour: 11.50, yochananof: 12.92, tiv_taam: 12.94, osher_ad: 11.95, machsanei_hashuk: 12.51 },
    'מצות': { shufersal: 12.90, rami_levy: 11.90, victory: 9.50, ybitan: 12.50, hatzi_hinam: 10.90, carrefour: 9.50, yochananof: 11.92, tiv_taam: 11.54, osher_ad: 10.95, machsanei_hashuk: 11.54 },
    'מצות מלאות': { shufersal: 14.90, rami_levy: 13.90, victory: 11.50, ybitan: 14.50, hatzi_hinam: 12.90, carrefour: 12.50, yochananof: 13.92, tiv_taam: 13.94, osher_ad: 12.95, machsanei_hashuk: 13.48 },
    'קרקרים': { shufersal: 9.90, rami_levy: 8.90, victory: 7.50, ybitan: 9.50, hatzi_hinam: 8.50, carrefour: 9.10, yochananof: 8.92, tiv_taam: 9.58, osher_ad: 8.52, machsanei_hashuk: 8.63 },

    // ===== משקאות (חצי חינם זול) =====
    'מים מינרליים 0.5 ליטר': { shufersal: 4.90, rami_levy: 4.50, victory: 4.70, ybitan: 5.50, hatzi_hinam: 2.90, carrefour: 2.90, yochananof: 4.51, tiv_taam: 4.10, osher_ad: 2.98, machsanei_hashuk: 4.37 },
    'מים מינרליים 1.5 ליטר': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 7.90, hatzi_hinam: 3.50, carrefour: 3.50, yochananof: 5.92, tiv_taam: 5.54, osher_ad: 3.62, machsanei_hashuk: 5.72 },
    'מים בטעמים 1.5 ליטר': { shufersal: 7.90, rami_levy: 6.90, victory: 7.50, ybitan: 8.90, hatzi_hinam: 4.50, carrefour: 4.50, yochananof: 6.92, tiv_taam: 6.54, osher_ad: 4.62, machsanei_hashuk: 6.69 },
    'מי עדן 0.5 ליטר': { shufersal: 4.90, rami_levy: 4.50, victory: 4.70, ybitan: 5.50, hatzi_hinam: 2.90, carrefour: 2.90, yochananof: 4.51, tiv_taam: 4.10, osher_ad: 2.98, machsanei_hashuk: 4.37 },
    'מי עדן 1.5 ליטר': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 7.90, hatzi_hinam: 3.50, carrefour: 3.10, yochananof: 5.92, tiv_taam: 5.38, osher_ad: 3.62, machsanei_hashuk: 5.72 },
    'נביעות 0.5 ליטר': { shufersal: 4.90, rami_levy: 4.50, victory: 4.70, ybitan: 5.50, hatzi_hinam: 2.90, carrefour: 2.50, yochananof: 4.51, tiv_taam: 3.94, osher_ad: 2.98, machsanei_hashuk: 4.37 },
    'נביעות 1.5 ליטר': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 7.90, hatzi_hinam: 3.50, carrefour: 3.50, yochananof: 5.92, tiv_taam: 5.54, osher_ad: 3.62, machsanei_hashuk: 5.72 },
    // קולה
    'קולה 0.5 ליטר': { shufersal: 6.90, rami_levy: 6.50, victory: 6.70, ybitan: 7.50, hatzi_hinam: 4.90, carrefour: 5.10, yochananof: 6.51, tiv_taam: 6.18, osher_ad: 4.98, machsanei_hashuk: 6.31 },
    'קולה 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 5.90, yochananof: 8.92, tiv_taam: 8.30, osher_ad: 6.62, machsanei_hashuk: 8.63 },
    'קולה 2 ליטר': { shufersal: 11.90, rami_levy: 10.90, victory: 11.50, ybitan: 12.90, hatzi_hinam: 8.50, carrefour: 8.10, yochananof: 10.92, tiv_taam: 10.38, osher_ad: 8.62, machsanei_hashuk: 10.57 },
    'קולה זירו 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 7.10, yochananof: 8.92, tiv_taam: 8.78, osher_ad: 6.62, machsanei_hashuk: 8.63 },
    'קולה זירו 2 ליטר': { shufersal: 11.90, rami_levy: 10.90, victory: 11.50, ybitan: 12.90, hatzi_hinam: 8.50, carrefour: 7.50, yochananof: 10.92, tiv_taam: 10.14, osher_ad: 8.62, machsanei_hashuk: 10.57 },
    'קולה דיאט 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 6.90, yochananof: 8.92, tiv_taam: 8.70, osher_ad: 6.62, machsanei_hashuk: 8.63 },
    'קולה פחית 330 מ"ל': { shufersal: 5.90, rami_levy: 5.50, victory: 5.70, ybitan: 6.50, hatzi_hinam: 4.50, carrefour: 4.10, yochananof: 5.51, tiv_taam: 5.18, osher_ad: 4.55, machsanei_hashuk: 5.34 },
    'קולה זירו פחית 330 מ"ל': { shufersal: 5.90, rami_levy: 5.50, victory: 5.70, ybitan: 6.50, hatzi_hinam: 4.50, carrefour: 4.10, yochananof: 5.51, tiv_taam: 5.18, osher_ad: 4.55, machsanei_hashuk: 5.34 },
    'שישיית קולה פחיות': { shufersal: 29.90, rami_levy: 26.90, victory: 28.90, ybitan: 32.90, hatzi_hinam: 24.90, carrefour: 24.90, yochananof: 26.96, tiv_taam: 27.90, osher_ad: 25.00, machsanei_hashuk: 26.09 },
    'שישיית קולה זירו פחיות': { shufersal: 29.90, rami_levy: 26.90, victory: 28.90, ybitan: 32.90, hatzi_hinam: 24.90, carrefour: 22.50, yochananof: 26.96, tiv_taam: 26.94, osher_ad: 25.00, machsanei_hashuk: 26.09 },
    'שישיית קולה 1.5 ליטר': { shufersal: 44.90, rami_levy: 41.90, victory: 43.90, ybitan: 47.90, hatzi_hinam: 39.90, carrefour: 34.10, yochananof: 41.96, tiv_taam: 40.58, osher_ad: 40.00, machsanei_hashuk: 40.64 },
    'שישיית קולה זירו 1.5 ליטר': { shufersal: 44.90, rami_levy: 41.90, victory: 43.90, ybitan: 47.90, hatzi_hinam: 39.90, carrefour: 34.10, yochananof: 41.96, tiv_taam: 40.58, osher_ad: 40.00, machsanei_hashuk: 40.64 },
    // פפסי
    'פפסי 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 6.90, yochananof: 8.92, tiv_taam: 8.70, osher_ad: 6.62, machsanei_hashuk: 8.63 },
    'פפסי 2 ליטר': { shufersal: 11.90, rami_levy: 10.90, victory: 11.50, ybitan: 12.90, hatzi_hinam: 8.50, carrefour: 7.90, yochananof: 10.92, tiv_taam: 10.30, osher_ad: 8.62, machsanei_hashuk: 10.57 },
    'פפסי מקס 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 7.10, yochananof: 8.92, tiv_taam: 8.78, osher_ad: 6.62, machsanei_hashuk: 8.63 },
    'פפסי פחית 330 מ"ל': { shufersal: 5.50, rami_levy: 5.00, victory: 5.30, ybitan: 6.00, hatzi_hinam: 4.00, carrefour: 3.90, yochananof: 5.01, tiv_taam: 4.86, osher_ad: 4.05, machsanei_hashuk: 4.85 },
    'פפסי מקס פחית 330 מ"ל': { shufersal: 5.50, rami_levy: 5.00, victory: 5.30, ybitan: 6.00, hatzi_hinam: 4.00, carrefour: 4.10, yochananof: 5.01, tiv_taam: 4.94, osher_ad: 4.05, machsanei_hashuk: 4.85 },
    'שישיית פפסי פחיות': { shufersal: 27.90, rami_levy: 24.90, victory: 26.90, ybitan: 29.90, hatzi_hinam: 22.90, carrefour: 19.90, yochananof: 24.96, tiv_taam: 24.70, osher_ad: 23.00, machsanei_hashuk: 24.15 },
    'שישיית פפסי 1.5 ליטר': { shufersal: 42.90, rami_levy: 39.90, victory: 41.90, ybitan: 45.90, hatzi_hinam: 37.90, carrefour: 38.50, yochananof: 39.96, tiv_taam: 41.14, osher_ad: 38.00, machsanei_hashuk: 38.70 },
    // ספרייט ופאנטה
    'ספרייט 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 6.90, yochananof: 8.92, tiv_taam: 8.70, osher_ad: 6.62, machsanei_hashuk: 8.63 },
    'ספרייט זירו 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 6.50, yochananof: 8.92, tiv_taam: 8.54, osher_ad: 6.62, machsanei_hashuk: 8.63 },
    'ספרייט פחית 330 מ"ל': { shufersal: 5.90, rami_levy: 5.50, victory: 5.70, ybitan: 6.50, hatzi_hinam: 4.50, carrefour: 4.10, yochananof: 5.51, tiv_taam: 5.18, osher_ad: 4.55, machsanei_hashuk: 5.34 },
    'שישיית ספרייט פחיות': { shufersal: 29.90, rami_levy: 26.90, victory: 28.90, ybitan: 32.90, hatzi_hinam: 24.90, carrefour: 25.10, yochananof: 26.96, tiv_taam: 27.98, osher_ad: 25.00, machsanei_hashuk: 26.09 },
    'שישיית ספרייט 1.5 ליטר': { shufersal: 44.90, rami_levy: 41.90, victory: 43.90, ybitan: 47.90, hatzi_hinam: 39.90, carrefour: 35.90, yochananof: 41.96, tiv_taam: 41.30, osher_ad: 40.00, machsanei_hashuk: 40.64 },
    'פאנטה 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 6.50, yochananof: 8.92, tiv_taam: 8.54, osher_ad: 6.62, machsanei_hashuk: 8.63 },
    'פאנטה 2 ליטר': { shufersal: 11.90, rami_levy: 10.90, victory: 11.50, ybitan: 12.90, hatzi_hinam: 8.50, carrefour: 7.90, yochananof: 10.92, tiv_taam: 10.30, osher_ad: 8.62, machsanei_hashuk: 10.57 },
    'פאנטה פחית 330 מ"ל': { shufersal: 5.90, rami_levy: 5.50, victory: 5.70, ybitan: 6.50, hatzi_hinam: 4.50, carrefour: 4.10, yochananof: 5.51, tiv_taam: 5.18, osher_ad: 4.55, machsanei_hashuk: 5.34 },
    'שישיית פאנטה פחיות': { shufersal: 29.90, rami_levy: 26.90, victory: 28.90, ybitan: 32.90, hatzi_hinam: 24.90, carrefour: 26.10, yochananof: 26.96, tiv_taam: 28.38, osher_ad: 25.00, machsanei_hashuk: 26.09 },
    'שישיית פאנטה 1.5 ליטר': { shufersal: 44.90, rami_levy: 41.90, victory: 43.90, ybitan: 47.90, hatzi_hinam: 39.90, carrefour: 34.50, yochananof: 41.96, tiv_taam: 40.74, osher_ad: 40.00, machsanei_hashuk: 40.64 },
    // שוופס וסודה
    'שוופס 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 6.10, yochananof: 8.92, tiv_taam: 8.38, osher_ad: 6.62, machsanei_hashuk: 8.63 },
    'סודה 1.5 ליטר': { shufersal: 5.90, rami_levy: 4.90, victory: 5.50, ybitan: 6.90, hatzi_hinam: 3.50, carrefour: 3.50, yochananof: 4.92, tiv_taam: 4.94, osher_ad: 3.57, machsanei_hashuk: 4.75 },
    'סודה פחית 330 מ"ל': { shufersal: 4.90, rami_levy: 4.50, victory: 4.70, ybitan: 5.50, hatzi_hinam: 3.50, carrefour: 3.50, yochananof: 4.51, tiv_taam: 4.34, osher_ad: 3.55, machsanei_hashuk: 4.37 },
    'טוניק 1.5 ליטר': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 6.10, yochananof: 8.92, tiv_taam: 8.38, osher_ad: 6.62, machsanei_hashuk: 8.63 },
    'טוניק פחית 330 מ"ל': { shufersal: 5.90, rami_levy: 5.50, victory: 5.70, ybitan: 6.50, hatzi_hinam: 4.50, carrefour: 4.90, yochananof: 5.51, tiv_taam: 5.50, osher_ad: 4.55, machsanei_hashuk: 5.34 },
    'שישיית שוופס פחיות': { shufersal: 29.90, rami_levy: 26.90, victory: 28.90, ybitan: 32.90, hatzi_hinam: 24.90, carrefour: 22.10, yochananof: 26.96, tiv_taam: 26.78, osher_ad: 25.00, machsanei_hashuk: 26.09 },
    // מיצים
    'מיץ תפוזים 1 ליטר': { shufersal: 15.90, rami_levy: 13.90, victory: 14.50, ybitan: 16.90, hatzi_hinam: 11.50, carrefour: 12.10, yochananof: 13.94, tiv_taam: 14.38, osher_ad: 11.62, machsanei_hashuk: 13.48 },
    'מיץ תפוזים סחוט 1 ליטר': { shufersal: 18.90, rami_levy: 16.90, victory: 17.50, ybitan: 19.90, hatzi_hinam: 14.50, carrefour: 15.10, yochananof: 16.94, tiv_taam: 17.38, osher_ad: 14.62, machsanei_hashuk: 16.39 },
    'מיץ תפוחים 1 ליטר': { shufersal: 14.90, rami_levy: 12.90, victory: 13.50, ybitan: 15.90, hatzi_hinam: 10.50, carrefour: 9.10, yochananof: 12.94, tiv_taam: 12.58, osher_ad: 10.62, machsanei_hashuk: 12.51 },
    'מיץ ענבים 1 ליטר': { shufersal: 16.90, rami_levy: 14.90, victory: 15.50, ybitan: 17.90, hatzi_hinam: 12.50, carrefour: 11.10, yochananof: 14.94, tiv_taam: 14.58, osher_ad: 12.62, machsanei_hashuk: 14.45 },
    'מיץ גזר 1 ליטר': { shufersal: 15.90, rami_levy: 13.90, victory: 14.50, ybitan: 16.90, hatzi_hinam: 11.50, carrefour: 11.90, yochananof: 13.94, tiv_taam: 14.30, osher_ad: 11.62, machsanei_hashuk: 13.48 },
    'מיץ רימונים 1 ליטר': { shufersal: 22.90, rami_levy: 19.90, victory: 21.50, ybitan: 24.90, hatzi_hinam: 17.50, carrefour: 15.50, yochananof: 19.96, tiv_taam: 19.94, osher_ad: 17.62, machsanei_hashuk: 19.30 },
    'מיץ פריגת 1.5 ליטר': { shufersal: 13.90, rami_levy: 11.90, victory: 12.50, ybitan: 14.90, hatzi_hinam: 9.50, carrefour: 8.90, yochananof: 11.94, tiv_taam: 11.90, osher_ad: 9.62, machsanei_hashuk: 11.54 },
    'מיץ ספרינג 1.5 ליטר': { shufersal: 13.90, rami_levy: 11.90, victory: 12.50, ybitan: 14.90, hatzi_hinam: 9.50, carrefour: 8.90, yochananof: 11.94, tiv_taam: 11.90, osher_ad: 9.62, machsanei_hashuk: 11.54 },
    'נקטר 1 ליטר': { shufersal: 12.90, rami_levy: 10.90, victory: 11.50, ybitan: 13.90, hatzi_hinam: 8.50, carrefour: 8.10, yochananof: 10.94, tiv_taam: 10.98, osher_ad: 8.62, machsanei_hashuk: 10.57 },
    'תפוזינה 1.5 ליטר': { shufersal: 14.90, rami_levy: 12.90, victory: 13.50, ybitan: 15.90, hatzi_hinam: 10.50, carrefour: 11.50, yochananof: 12.94, tiv_taam: 13.54, osher_ad: 10.62, machsanei_hashuk: 12.51 },
    'לימונדה 1.5 ליטר': { shufersal: 11.90, rami_levy: 9.90, victory: 10.50, ybitan: 12.90, hatzi_hinam: 7.50, carrefour: 7.90, yochananof: 9.94, tiv_taam: 10.30, osher_ad: 7.62, machsanei_hashuk: 9.60 },
    'לימונענע 1.5 ליטר': { shufersal: 11.90, rami_levy: 9.90, victory: 10.50, ybitan: 12.90, hatzi_hinam: 7.50, carrefour: 8.10, yochananof: 9.94, tiv_taam: 10.38, osher_ad: 7.62, machsanei_hashuk: 9.60 },
    // אנרגיה
    'XL פחית 250 מ"ל': { shufersal: 7.90, rami_levy: 6.90, victory: 7.50, ybitan: 8.90, hatzi_hinam: 5.50, carrefour: 5.90, yochananof: 6.92, tiv_taam: 7.10, osher_ad: 5.57, machsanei_hashuk: 6.69 },
    'רד בול פחית 250 מ"ל': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 7.50, carrefour: 7.90, yochananof: 8.92, tiv_taam: 9.10, osher_ad: 7.57, machsanei_hashuk: 8.63 },
    'מונסטר פחית 500 מ"ל': { shufersal: 11.90, rami_levy: 10.90, victory: 11.50, ybitan: 12.90, hatzi_hinam: 9.50, carrefour: 9.10, yochananof: 10.92, tiv_taam: 10.78, osher_ad: 9.57, machsanei_hashuk: 10.57 },
    'משקה ספורט 500 מ"ל': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 6.50, carrefour: 7.10, yochananof: 7.92, tiv_taam: 8.18, osher_ad: 6.57, machsanei_hashuk: 7.66 },
    'מי קוקוס 330 מ"ל': { shufersal: 12.90, rami_levy: 11.90, victory: 12.50, ybitan: 13.90, hatzi_hinam: 10.50, carrefour: 9.50, yochananof: 11.92, tiv_taam: 11.54, osher_ad: 10.57, machsanei_hashuk: 11.54 },

    // ===== חטיפים (חצי חינם זול) =====
    'במבה': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 5.50, carrefour: 5.10, yochananof: 7.92, tiv_taam: 7.38, osher_ad: 5.62, machsanei_hashuk: 7.66 },
    'במבה אדומים': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 5.50, carrefour: 4.90, yochananof: 7.92, tiv_taam: 7.30, osher_ad: 5.62, machsanei_hashuk: 7.66 },
    'במבה נוגט': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 5.90, yochananof: 8.92, tiv_taam: 8.30, osher_ad: 6.62, machsanei_hashuk: 8.63 },
    'ביסלי': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 5.50, carrefour: 5.50, yochananof: 7.92, tiv_taam: 7.54, osher_ad: 5.62, machsanei_hashuk: 7.66 },
    'ביסלי גריל': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 5.50, carrefour: 5.50, yochananof: 7.92, tiv_taam: 7.54, osher_ad: 5.62, machsanei_hashuk: 7.66 },
    'ביסלי בצל': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 5.50, carrefour: 5.90, yochananof: 7.92, tiv_taam: 7.70, osher_ad: 5.62, machsanei_hashuk: 7.66 },
    'ביסלי פיצה': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 5.50, carrefour: 5.10, yochananof: 7.92, tiv_taam: 7.38, osher_ad: 5.62, machsanei_hashuk: 7.66 },
    'דוריטוס': { shufersal: 12.90, rami_levy: 11.90, victory: 12.50, ybitan: 13.90, hatzi_hinam: 9.90, carrefour: 9.50, yochananof: 11.92, tiv_taam: 11.54, osher_ad: 10.00, machsanei_hashuk: 11.54 },
    'דוריטוס צ\'ילי': { shufersal: 12.90, rami_levy: 11.90, victory: 12.50, ybitan: 13.90, hatzi_hinam: 9.90, carrefour: 9.50, yochananof: 11.92, tiv_taam: 11.54, osher_ad: 10.00, machsanei_hashuk: 11.54 },
    'טורטייה צ\'יפס': { shufersal: 11.90, rami_levy: 10.90, victory: 11.50, ybitan: 12.90, hatzi_hinam: 8.90, carrefour: 8.90, yochananof: 10.92, tiv_taam: 10.70, osher_ad: 9.00, machsanei_hashuk: 10.57 },
    'תפוצ\'יפס': { shufersal: 10.90, rami_levy: 9.90, victory: 10.50, ybitan: 11.90, hatzi_hinam: 7.50, carrefour: 6.50, yochananof: 9.92, tiv_taam: 9.14, osher_ad: 7.62, machsanei_hashuk: 9.60 },
    'פרינגלס': { shufersal: 14.90, rami_levy: 13.90, victory: 14.50, ybitan: 15.90, hatzi_hinam: 11.90, carrefour: 11.10, yochananof: 13.92, tiv_taam: 13.38, osher_ad: 12.00, machsanei_hashuk: 13.48 },
    'פרינגלס חמוץ': { shufersal: 14.90, rami_levy: 13.90, victory: 14.50, ybitan: 15.90, hatzi_hinam: 11.90, carrefour: 11.50, yochananof: 13.92, tiv_taam: 13.54, osher_ad: 12.00, machsanei_hashuk: 13.48 },
    'פופקורן': { shufersal: 7.90, rami_levy: 6.90, victory: 7.50, ybitan: 8.90, hatzi_hinam: 4.50, carrefour: 4.10, yochananof: 6.92, tiv_taam: 6.38, osher_ad: 4.62, machsanei_hashuk: 6.69 },
    'פופקורן מיקרו': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 6.50, carrefour: 6.90, yochananof: 8.92, tiv_taam: 8.70, osher_ad: 6.62, machsanei_hashuk: 8.63 },
    'פופקורן קרמל': { shufersal: 12.90, rami_levy: 11.90, victory: 12.50, ybitan: 13.90, hatzi_hinam: 9.90, carrefour: 10.10, yochananof: 11.92, tiv_taam: 11.78, osher_ad: 10.00, machsanei_hashuk: 11.54 },
    'שוקולד': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 6.50, carrefour: 5.90, yochananof: 7.92, tiv_taam: 7.70, osher_ad: 6.57, machsanei_hashuk: 7.66 },
    'שוקולד פרה': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 7.50, carrefour: 6.90, yochananof: 8.92, tiv_taam: 8.70, osher_ad: 7.57, machsanei_hashuk: 8.63 },
    'שוקולד מילקה': { shufersal: 12.90, rami_levy: 11.90, victory: 12.50, ybitan: 13.90, hatzi_hinam: 9.90, carrefour: 10.90, yochananof: 11.92, tiv_taam: 12.10, osher_ad: 10.00, machsanei_hashuk: 11.54 },
    'שוקולד חלב': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 6.50, carrefour: 6.50, yochananof: 7.92, tiv_taam: 7.94, osher_ad: 6.57, machsanei_hashuk: 7.66 },
    'שוקולד מריר': { shufersal: 12.90, rami_levy: 11.90, victory: 12.50, ybitan: 13.90, hatzi_hinam: 9.90, carrefour: 9.50, yochananof: 11.92, tiv_taam: 11.54, osher_ad: 10.00, machsanei_hashuk: 11.54 },
    'שוקולד לבן': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 10.90, hatzi_hinam: 7.50, carrefour: 6.50, yochananof: 8.92, tiv_taam: 8.54, osher_ad: 7.57, machsanei_hashuk: 8.63 },
    'שוקולד עם אגוזים': { shufersal: 14.90, rami_levy: 13.90, victory: 14.50, ybitan: 15.90, hatzi_hinam: 11.90, carrefour: 10.50, yochananof: 13.92, tiv_taam: 13.14, osher_ad: 12.00, machsanei_hashuk: 13.48 },
    'קינדר': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 9.90, hatzi_hinam: 6.50, carrefour: 6.10, yochananof: 7.92, tiv_taam: 7.78, osher_ad: 6.57, machsanei_hashuk: 7.66 },
    'סניקרס': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 7.90, hatzi_hinam: 4.90, carrefour: 4.10, yochananof: 5.92, tiv_taam: 5.78, osher_ad: 4.95, machsanei_hashuk: 5.72 },
    'מארס': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 7.90, hatzi_hinam: 4.90, carrefour: 4.90, yochananof: 5.92, tiv_taam: 6.10, osher_ad: 4.95, machsanei_hashuk: 5.72 },
    'טוויקס': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 7.90, hatzi_hinam: 4.90, carrefour: 5.10, yochananof: 5.92, tiv_taam: 6.18, osher_ad: 4.95, machsanei_hashuk: 5.72 },
    'קיטקט': { shufersal: 6.90, rami_levy: 5.90, victory: 6.50, ybitan: 7.90, hatzi_hinam: 4.90, carrefour: 4.90, yochananof: 5.92, tiv_taam: 6.10, osher_ad: 4.95, machsanei_hashuk: 5.72 },
    'עוגיות אוראו': { shufersal: 12.90, rami_levy: 11.90, victory: 12.50, ybitan: 13.90, hatzi_hinam: 9.90, carrefour: 10.10, yochananof: 11.92, tiv_taam: 11.78, osher_ad: 10.00, machsanei_hashuk: 11.54 },

    // ===== תבלינים =====
    'מלח שולחן 500 גרם': { shufersal: 3.50, rami_levy: 3.90, victory: 4.50, ybitan: 5.50, hatzi_hinam: 3.90, carrefour: 4.10, yochananof: 3.89, tiv_taam: 3.74, osher_ad: 3.90, machsanei_hashuk: 3.78 },
    'מלח שולחן 1 ק"ג': { shufersal: 5.50, rami_levy: 5.90, victory: 6.50, ybitan: 7.50, hatzi_hinam: 5.90, carrefour: 6.50, yochananof: 5.89, tiv_taam: 5.90, osher_ad: 5.90, machsanei_hashuk: 5.72 },
    'מלח ים 500 גרם': { shufersal: 6.50, rami_levy: 6.90, victory: 7.50, ybitan: 8.50, hatzi_hinam: 6.90, carrefour: 7.10, yochananof: 6.89, tiv_taam: 6.74, osher_ad: 6.90, machsanei_hashuk: 6.69 },
    'מלח גס 1 ק"ג': { shufersal: 4.50, rami_levy: 4.90, victory: 5.50, ybitan: 6.50, hatzi_hinam: 4.90, carrefour: 4.10, yochananof: 4.89, tiv_taam: 4.34, osher_ad: 4.90, machsanei_hashuk: 4.75 },
    'פלפל שחור טחון 80 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 9.90, yochananof: 8.91, tiv_taam: 9.66, osher_ad: 9.47, machsanei_hashuk: 8.63 },
    'פלפל שחור גרוס 80 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 8.50, yochananof: 8.91, tiv_taam: 9.10, osher_ad: 9.47, machsanei_hashuk: 8.63 },
    'פפריקה מתוקה 80 גרם': { shufersal: 8.50, rami_levy: 7.90, victory: 9.50, ybitan: 10.50, hatzi_hinam: 8.50, carrefour: 8.10, yochananof: 7.91, tiv_taam: 8.34, osher_ad: 8.47, machsanei_hashuk: 7.66 },
    'פפריקה מתוקה 100 גרם': { shufersal: 10.50, rami_levy: 9.90, victory: 11.50, ybitan: 12.50, hatzi_hinam: 10.50, carrefour: 10.50, yochananof: 9.91, tiv_taam: 10.50, osher_ad: 10.47, machsanei_hashuk: 9.60 },
    'פפריקה חריפה 80 גרם': { shufersal: 8.50, rami_levy: 7.90, victory: 9.50, ybitan: 10.50, hatzi_hinam: 8.50, carrefour: 7.10, yochananof: 7.91, tiv_taam: 7.94, osher_ad: 8.47, machsanei_hashuk: 7.66 },
    'פפריקה חריפה 100 גרם': { shufersal: 10.50, rami_levy: 9.90, victory: 11.50, ybitan: 12.50, hatzi_hinam: 10.50, carrefour: 10.10, yochananof: 9.91, tiv_taam: 10.34, osher_ad: 10.47, machsanei_hashuk: 9.60 },
    'פפריקה מעושנת 80 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 8.50, yochananof: 8.91, tiv_taam: 9.10, osher_ad: 9.47, machsanei_hashuk: 8.63 },
    'פפריקה מעושנת 100 גרם': { shufersal: 11.50, rami_levy: 10.90, victory: 12.50, ybitan: 13.50, hatzi_hinam: 11.50, carrefour: 10.10, yochananof: 10.91, tiv_taam: 10.94, osher_ad: 11.47, machsanei_hashuk: 10.57 },
    'כורכום 80 גרם': { shufersal: 12.50, rami_levy: 11.90, victory: 13.50, ybitan: 14.50, hatzi_hinam: 12.50, carrefour: 11.90, yochananof: 11.91, tiv_taam: 12.26, osher_ad: 12.47, machsanei_hashuk: 11.54 },
    'כמון 80 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 9.50, yochananof: 8.91, tiv_taam: 9.50, osher_ad: 9.47, machsanei_hashuk: 8.63 },
    'קינמון טחון 80 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 10.50, yochananof: 8.91, tiv_taam: 9.90, osher_ad: 9.47, machsanei_hashuk: 8.63 },
    'מקלות קינמון 50 גרם': { shufersal: 12.50, rami_levy: 11.90, victory: 13.50, ybitan: 14.50, hatzi_hinam: 12.50, carrefour: 10.50, yochananof: 11.91, tiv_taam: 11.70, osher_ad: 12.47, machsanei_hashuk: 11.54 },
    'אבקת שום 80 גרם': { shufersal: 8.50, rami_levy: 7.90, victory: 9.50, ybitan: 10.50, hatzi_hinam: 8.50, carrefour: 9.50, yochananof: 7.91, tiv_taam: 8.90, osher_ad: 8.47, machsanei_hashuk: 7.66 },
    'אבקת בצל 80 גרם': { shufersal: 8.50, rami_levy: 7.90, victory: 9.50, ybitan: 10.50, hatzi_hinam: 8.50, carrefour: 7.90, yochananof: 7.91, tiv_taam: 8.26, osher_ad: 8.47, machsanei_hashuk: 7.66 },
    'אורגנו 50 גרם': { shufersal: 7.50, rami_levy: 6.90, victory: 8.50, ybitan: 9.50, hatzi_hinam: 7.50, carrefour: 6.50, yochananof: 6.91, tiv_taam: 7.10, osher_ad: 7.47, machsanei_hashuk: 6.69 },
    'בזיליקום יבש 50 גרם': { shufersal: 7.50, rami_levy: 6.90, victory: 8.50, ybitan: 9.50, hatzi_hinam: 7.50, carrefour: 7.90, yochananof: 6.91, tiv_taam: 7.66, osher_ad: 7.47, machsanei_hashuk: 6.69 },
    'רוזמרין יבש 50 גרם': { shufersal: 7.50, rami_levy: 6.90, victory: 8.50, ybitan: 9.50, hatzi_hinam: 7.50, carrefour: 7.10, yochananof: 6.91, tiv_taam: 7.34, osher_ad: 7.47, machsanei_hashuk: 6.69 },
    'טימין יבש 50 גרם': { shufersal: 7.50, rami_levy: 6.90, victory: 8.50, ybitan: 9.50, hatzi_hinam: 7.50, carrefour: 7.50, yochananof: 6.91, tiv_taam: 7.50, osher_ad: 7.47, machsanei_hashuk: 6.69 },
    'זעתר 200 גרם': { shufersal: 18.50, rami_levy: 16.90, victory: 19.50, ybitan: 21.50, hatzi_hinam: 17.50, carrefour: 16.50, yochananof: 16.93, tiv_taam: 17.70, osher_ad: 17.47, machsanei_hashuk: 16.39 },
    'סומק 100 גרם': { shufersal: 12.50, rami_levy: 11.90, victory: 13.50, ybitan: 14.50, hatzi_hinam: 12.50, carrefour: 11.50, yochananof: 11.91, tiv_taam: 12.10, osher_ad: 12.47, machsanei_hashuk: 11.54 },
    'חוואייג׳ 100 גרם': { shufersal: 14.50, rami_levy: 13.90, victory: 15.50, ybitan: 16.50, hatzi_hinam: 14.50, carrefour: 12.50, yochananof: 13.91, tiv_taam: 13.70, osher_ad: 14.47, machsanei_hashuk: 13.48 },
    'תבלין לעוף 100 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 8.50, yochananof: 8.91, tiv_taam: 9.10, osher_ad: 9.47, machsanei_hashuk: 8.63 },
    'תבלין לדגים 100 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 8.50, yochananof: 8.91, tiv_taam: 9.10, osher_ad: 9.47, machsanei_hashuk: 8.63 },
    'תבלין לבשר 100 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 10.50, yochananof: 8.91, tiv_taam: 9.90, osher_ad: 9.47, machsanei_hashuk: 8.63 },
    'תבלין גריל 100 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 8.90, yochananof: 8.91, tiv_taam: 9.26, osher_ad: 9.47, machsanei_hashuk: 8.63 },
    'קארי 80 גרם': { shufersal: 11.50, rami_levy: 10.90, victory: 12.50, ybitan: 13.50, hatzi_hinam: 11.50, carrefour: 12.50, yochananof: 10.91, tiv_taam: 11.90, osher_ad: 11.47, machsanei_hashuk: 10.57 },
    'גרם מסאלה 80 גרם': { shufersal: 12.50, rami_levy: 11.90, victory: 13.50, ybitan: 14.50, hatzi_hinam: 12.50, carrefour: 13.50, yochananof: 11.91, tiv_taam: 12.90, osher_ad: 12.47, machsanei_hashuk: 11.54 },
    'ציילי 50 גרם': { shufersal: 8.50, rami_levy: 7.90, victory: 9.50, ybitan: 10.50, hatzi_hinam: 8.50, carrefour: 7.10, yochananof: 7.91, tiv_taam: 7.94, osher_ad: 8.47, machsanei_hashuk: 7.66 },
    'קיאן 50 גרם': { shufersal: 8.50, rami_levy: 7.90, victory: 9.50, ybitan: 10.50, hatzi_hinam: 8.50, carrefour: 7.50, yochananof: 7.91, tiv_taam: 8.10, osher_ad: 8.47, machsanei_hashuk: 7.66 },
    'זנגביל טחון 80 גרם': { shufersal: 10.50, rami_levy: 9.90, victory: 11.50, ybitan: 12.50, hatzi_hinam: 10.50, carrefour: 10.50, yochananof: 9.91, tiv_taam: 10.50, osher_ad: 10.47, machsanei_hashuk: 9.60 },
    'אגוז מוסקט 50 גרם': { shufersal: 14.50, rami_levy: 13.90, victory: 15.50, ybitan: 16.50, hatzi_hinam: 14.50, carrefour: 14.50, yochananof: 13.91, tiv_taam: 14.50, osher_ad: 14.47, machsanei_hashuk: 13.48 },
    'ציפורן 50 גרם': { shufersal: 12.50, rami_levy: 11.90, victory: 13.50, ybitan: 14.50, hatzi_hinam: 12.50, carrefour: 13.50, yochananof: 11.91, tiv_taam: 12.90, osher_ad: 12.47, machsanei_hashuk: 11.54 },
    'כוסברה טחונה 80 גרם': { shufersal: 9.50, rami_levy: 8.90, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 9.50, yochananof: 8.91, tiv_taam: 9.50, osher_ad: 9.47, machsanei_hashuk: 8.63 },
    'קרדמון 50 גרם': { shufersal: 18.50, rami_levy: 16.90, victory: 19.50, ybitan: 21.50, hatzi_hinam: 17.50, carrefour: 15.10, yochananof: 16.93, tiv_taam: 17.14, osher_ad: 17.47, machsanei_hashuk: 16.39 },
    'עלי דפנה 20 גרם': { shufersal: 6.50, rami_levy: 5.90, victory: 7.50, ybitan: 8.50, hatzi_hinam: 6.50, carrefour: 5.90, yochananof: 5.91, tiv_taam: 6.26, osher_ad: 6.47, machsanei_hashuk: 5.72 },
    'הל 50 גרם': { shufersal: 16.50, rami_levy: 15.90, victory: 17.50, ybitan: 18.50, hatzi_hinam: 16.50, carrefour: 16.10, yochananof: 15.91, tiv_taam: 16.34, osher_ad: 16.47, machsanei_hashuk: 15.42 },
    'כוכב אניס 50 גרם': { shufersal: 12.50, rami_levy: 11.90, victory: 13.50, ybitan: 14.50, hatzi_hinam: 12.50, carrefour: 13.50, yochananof: 11.91, tiv_taam: 12.90, osher_ad: 12.47, machsanei_hashuk: 11.54 },
    'שומר זרעים 80 גרם': { shufersal: 8.50, rami_levy: 7.90, victory: 9.50, ybitan: 10.50, hatzi_hinam: 8.50, carrefour: 8.50, yochananof: 7.91, tiv_taam: 8.50, osher_ad: 8.47, machsanei_hashuk: 7.66 },

    // ===== בשר (רמי לוי זול) =====
    'עוף שלם טרי': { shufersal: 34.90, rami_levy: 26.90, victory: 31.90, ybitan: 36.90, hatzi_hinam: 30.90, carrefour: 33.50, yochananof: 27.06, tiv_taam: 34.34, osher_ad: 30.70, machsanei_hashuk: 26.09 },
    'עוף שלם קפוא': { shufersal: 29.90, rami_levy: 22.90, victory: 26.90, ybitan: 31.90, hatzi_hinam: 25.90, carrefour: 27.50, yochananof: 23.04, tiv_taam: 28.94, osher_ad: 25.75, machsanei_hashuk: 22.21 },
    'חזה עוף טרי': { shufersal: 44.90, rami_levy: 36.90, victory: 41.90, ybitan: 46.90, hatzi_hinam: 40.90, carrefour: 42.50, yochananof: 37.06, tiv_taam: 43.94, osher_ad: 40.70, machsanei_hashuk: 35.79 },
    'חזה עוף קפוא': { shufersal: 39.90, rami_levy: 31.90, victory: 36.90, ybitan: 41.90, hatzi_hinam: 35.90, carrefour: 34.10, yochananof: 32.06, tiv_taam: 37.58, osher_ad: 35.70, machsanei_hashuk: 30.94 },
    'כרעיים עוף טריות': { shufersal: 24.90, rami_levy: 18.90, victory: 22.90, ybitan: 26.90, hatzi_hinam: 21.90, carrefour: 22.90, yochananof: 19.02, tiv_taam: 24.10, osher_ad: 21.75, machsanei_hashuk: 18.33 },
    'כרעיים עוף קפואות': { shufersal: 19.90, rami_levy: 14.90, victory: 17.90, ybitan: 21.90, hatzi_hinam: 16.90, carrefour: 18.10, yochananof: 15.00, tiv_taam: 19.18, osher_ad: 16.80, machsanei_hashuk: 14.45 },
    'שוקיים עוף טריים': { shufersal: 29.90, rami_levy: 23.90, victory: 27.90, ybitan: 31.90, hatzi_hinam: 26.90, carrefour: 28.50, yochananof: 24.02, tiv_taam: 29.34, osher_ad: 26.75, machsanei_hashuk: 23.18 },
    'כנפיים עוף טריות': { shufersal: 22.90, rami_levy: 16.90, victory: 20.90, ybitan: 24.90, hatzi_hinam: 19.90, carrefour: 18.10, yochananof: 17.02, tiv_taam: 20.98, osher_ad: 19.75, machsanei_hashuk: 16.39 },
    'עוף טחון טרי': { shufersal: 36.90, rami_levy: 29.90, victory: 33.90, ybitan: 38.90, hatzi_hinam: 32.90, carrefour: 29.50, yochananof: 30.04, tiv_taam: 33.94, osher_ad: 32.75, machsanei_hashuk: 29.00 },
    'בשר טחון טרי': { shufersal: 52.90, rami_levy: 44.90, victory: 49.90, ybitan: 54.90, hatzi_hinam: 48.90, carrefour: 52.10, yochananof: 45.06, tiv_taam: 52.58, osher_ad: 48.70, machsanei_hashuk: 43.55 },
    'בשר טחון קפוא': { shufersal: 46.90, rami_levy: 39.90, victory: 43.90, ybitan: 48.90, hatzi_hinam: 42.90, carrefour: 36.90, yochananof: 40.04, tiv_taam: 42.90, osher_ad: 42.75, machsanei_hashuk: 38.70 },
    'אנטריקוט טרי': { shufersal: 134.90, rami_levy: 119.90, victory: 129.90, ybitan: 139.90, hatzi_hinam: 126.90, carrefour: 138.10, yochananof: 120.20, tiv_taam: 136.18, osher_ad: 126.55, machsanei_hashuk: 116.30 },
    'סינטה טרייה': { shufersal: 114.90, rami_levy: 99.90, victory: 109.90, ybitan: 119.90, hatzi_hinam: 106.90, carrefour: 112.10, yochananof: 100.20, tiv_taam: 113.78, osher_ad: 106.55, machsanei_hashuk: 96.90 },
    'שניצל עוף טרי': { shufersal: 44.90, rami_levy: 38.90, victory: 42.90, ybitan: 46.90, hatzi_hinam: 41.90, carrefour: 41.50, yochananof: 39.02, tiv_taam: 43.54, osher_ad: 41.75, machsanei_hashuk: 37.73 },
    'שניצל עוף קפוא': { shufersal: 38.90, rami_levy: 32.90, victory: 36.90, ybitan: 40.90, hatzi_hinam: 35.90, carrefour: 32.50, yochananof: 33.02, tiv_taam: 36.34, osher_ad: 35.75, machsanei_hashuk: 31.91 },
    'המבורגר טרי': { shufersal: 48.90, rami_levy: 41.90, victory: 45.90, ybitan: 50.90, hatzi_hinam: 44.90, carrefour: 44.50, yochananof: 42.04, tiv_taam: 47.14, osher_ad: 44.75, machsanei_hashuk: 40.64 },
    'המבורגר קפוא': { shufersal: 42.90, rami_levy: 36.90, victory: 39.90, ybitan: 44.90, hatzi_hinam: 38.90, carrefour: 40.50, yochananof: 37.02, tiv_taam: 41.94, osher_ad: 38.80, machsanei_hashuk: 35.79 },
    'קבב טרי': { shufersal: 52.90, rami_levy: 45.90, victory: 49.90, ybitan: 54.90, hatzi_hinam: 48.90, carrefour: 42.90, yochananof: 46.04, tiv_taam: 48.90, osher_ad: 48.75, machsanei_hashuk: 44.52 },
    'נקניקיות עוף': { shufersal: 24.90, rami_levy: 19.90, victory: 22.90, ybitan: 26.90, hatzi_hinam: 21.90, carrefour: 19.50, yochananof: 20.00, tiv_taam: 22.74, osher_ad: 21.80, machsanei_hashuk: 19.30 },
    'נקניקיות בקר': { shufersal: 29.90, rami_levy: 24.90, victory: 27.90, ybitan: 31.90, hatzi_hinam: 26.90, carrefour: 26.50, yochananof: 25.00, tiv_taam: 28.54, osher_ad: 26.80, machsanei_hashuk: 24.15 },

    // ===== דגים =====
    'סלמון טרי': { shufersal: 89.90, rami_levy: 84.90, victory: 94.90, ybitan: 99.90, hatzi_hinam: 87.90, carrefour: 83.10, yochananof: 85.00, tiv_taam: 87.18, osher_ad: 87.75, machsanei_hashuk: 82.35 },
    'סלמון מעושן': { shufersal: 69.90, rami_levy: 64.90, victory: 74.90, ybitan: 79.90, hatzi_hinam: 67.90, carrefour: 60.50, yochananof: 65.00, tiv_taam: 66.14, osher_ad: 67.75, machsanei_hashuk: 62.95 },
    'פילה סלמון טרי': { shufersal: 99.90, rami_levy: 94.90, victory: 104.90, ybitan: 109.90, hatzi_hinam: 97.90, carrefour: 86.10, yochananof: 95.00, tiv_taam: 94.38, osher_ad: 97.75, machsanei_hashuk: 92.05 },
    'טונה': { shufersal: 12.90, rami_levy: 10.90, victory: 14.90, ybitan: 15.90, hatzi_hinam: 11.90, carrefour: 12.50, yochananof: 10.94, tiv_taam: 12.74, osher_ad: 11.85, machsanei_hashuk: 10.57 },
    'טונה במים': { shufersal: 11.90, rami_levy: 9.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 10.90, carrefour: 11.50, yochananof: 9.94, tiv_taam: 11.74, osher_ad: 10.85, machsanei_hashuk: 9.60 },
    'טונה בשמן': { shufersal: 14.90, rami_levy: 12.90, victory: 16.90, ybitan: 17.90, hatzi_hinam: 13.90, carrefour: 14.90, yochananof: 12.94, tiv_taam: 14.90, osher_ad: 13.85, machsanei_hashuk: 12.51 },

    // ===== ניקיון =====
    'נייר טואלט': { shufersal: 36.90, rami_levy: 33.90, victory: 35.50, ybitan: 38.90, hatzi_hinam: 28.90, carrefour: 24.90, yochananof: 33.96, tiv_taam: 32.10, osher_ad: 29.15, machsanei_hashuk: 32.88 },
    'מגבות נייר': { shufersal: 16.90, rami_levy: 14.90, victory: 15.50, ybitan: 18.90, hatzi_hinam: 12.90, carrefour: 13.50, yochananof: 14.94, tiv_taam: 15.54, osher_ad: 13.00, machsanei_hashuk: 14.45 },
    'סבון כלים': { shufersal: 10.90, rami_levy: 9.90, victory: 10.50, ybitan: 11.90, hatzi_hinam: 7.50, carrefour: 6.50, yochananof: 9.92, tiv_taam: 9.14, osher_ad: 7.62, machsanei_hashuk: 9.60 },
    'אבקת כביסה': { shufersal: 41.90, rami_levy: 38.90, victory: 40.50, ybitan: 43.90, hatzi_hinam: 33.90, carrefour: 28.90, yochananof: 38.96, tiv_taam: 36.70, osher_ad: 34.15, machsanei_hashuk: 37.73 },
    'מרכך כביסה': { shufersal: 26.90, rami_levy: 23.90, victory: 25.50, ybitan: 28.90, hatzi_hinam: 21.50, carrefour: 18.50, yochananof: 23.96, tiv_taam: 23.54, osher_ad: 21.62, machsanei_hashuk: 23.18 },
    'אקונומיקה': { shufersal: 10.90, rami_levy: 8.90, victory: 10.50, ybitan: 12.90, hatzi_hinam: 6.50, carrefour: 6.10, yochananof: 8.94, tiv_taam: 8.98, osher_ad: 6.62, machsanei_hashuk: 8.63 },
    'שקיות אשפה': { shufersal: 15.90, rami_levy: 13.90, victory: 14.50, ybitan: 16.90, hatzi_hinam: 11.50, carrefour: 12.50, yochananof: 13.94, tiv_taam: 14.54, osher_ad: 11.62, machsanei_hashuk: 13.48 },

    // ===== קפה ותה =====
    'קפה נמס': { shufersal: 26.90, rami_levy: 21.90, victory: 24.90, ybitan: 28.90, hatzi_hinam: 23.90, carrefour: 20.90, yochananof: 22.00, tiv_taam: 24.50, osher_ad: 23.80, machsanei_hashuk: 21.24 },
    'קפה טורקי': { shufersal: 21.90, rami_levy: 16.90, victory: 19.90, ybitan: 23.90, hatzi_hinam: 18.90, carrefour: 20.90, yochananof: 17.00, tiv_taam: 21.50, osher_ad: 18.80, machsanei_hashuk: 16.39 },
    'תה שחור': { shufersal: 16.90, rami_levy: 11.90, victory: 14.90, ybitan: 18.90, hatzi_hinam: 13.90, carrefour: 12.50, yochananof: 12.00, tiv_taam: 15.14, osher_ad: 13.80, machsanei_hashuk: 11.54 },
    'תה ירוק': { shufersal: 18.90, rami_levy: 13.90, victory: 16.90, ybitan: 20.90, hatzi_hinam: 15.90, carrefour: 15.50, yochananof: 14.00, tiv_taam: 17.54, osher_ad: 15.80, machsanei_hashuk: 13.48 },
    'תה נענע': { shufersal: 16.90, rami_levy: 11.90, victory: 14.90, ybitan: 18.90, hatzi_hinam: 13.90, carrefour: 13.50, yochananof: 12.00, tiv_taam: 15.54, osher_ad: 13.80, machsanei_hashuk: 11.54 },

    // ===== יינות ואלכוהול (יינות ביתן זול) =====
    'יין אדום': { shufersal: 42.90, rami_levy: 39.90, victory: 44.90, ybitan: 34.90, hatzi_hinam: 41.90, carrefour: 36.10, yochananof: 39.96, tiv_taam: 40.18, osher_ad: 41.80, machsanei_hashuk: 38.70 },
    'יין לבן': { shufersal: 42.90, rami_levy: 39.90, victory: 44.90, ybitan: 34.90, hatzi_hinam: 41.90, carrefour: 42.90, yochananof: 39.96, tiv_taam: 42.90, osher_ad: 41.80, machsanei_hashuk: 38.70 },
    'בירה': { shufersal: 10.90, rami_levy: 9.90, victory: 10.50, ybitan: 7.50, hatzi_hinam: 9.50, carrefour: 10.50, yochananof: 9.92, tiv_taam: 10.74, osher_ad: 9.52, machsanei_hashuk: 9.60 },
    'בירה גולדסטאר': { shufersal: 10.90, rami_levy: 9.90, victory: 10.50, ybitan: 7.50, hatzi_hinam: 9.50, carrefour: 8.50, yochananof: 9.92, tiv_taam: 9.94, osher_ad: 9.52, machsanei_hashuk: 9.60 },
    'בירה מכבי': { shufersal: 10.90, rami_levy: 9.90, victory: 10.50, ybitan: 7.50, hatzi_hinam: 9.50, carrefour: 8.10, yochananof: 9.92, tiv_taam: 9.78, osher_ad: 9.52, machsanei_hashuk: 9.60 },
    'וודקה': { shufersal: 64.90, rami_levy: 59.90, victory: 66.90, ybitan: 52.90, hatzi_hinam: 62.90, carrefour: 57.90, yochananof: 60.00, tiv_taam: 62.10, osher_ad: 62.75, machsanei_hashuk: 58.10 },
    'וויסקי': { shufersal: 99.90, rami_levy: 94.90, victory: 102.90, ybitan: 84.90, hatzi_hinam: 97.90, carrefour: 104.50, yochananof: 95.00, tiv_taam: 101.74, osher_ad: 97.75, machsanei_hashuk: 92.05 },

    // ===== קפואים =====
    'גלידה': { shufersal: 26.90, rami_levy: 21.50, victory: 24.90, ybitan: 28.90, hatzi_hinam: 24.50, carrefour: 21.10, yochananof: 21.61, tiv_taam: 24.58, osher_ad: 24.35, machsanei_hashuk: 20.86 },
    'גלידה וניל': { shufersal: 26.90, rami_levy: 21.50, victory: 24.90, ybitan: 28.90, hatzi_hinam: 24.50, carrefour: 26.50, yochananof: 21.61, tiv_taam: 26.74, osher_ad: 24.35, machsanei_hashuk: 20.86 },
    'גלידה שוקולד': { shufersal: 26.90, rami_levy: 21.50, victory: 24.90, ybitan: 28.90, hatzi_hinam: 24.50, carrefour: 22.90, yochananof: 21.61, tiv_taam: 25.30, osher_ad: 24.35, machsanei_hashuk: 20.86 },
    'שניצל קפוא': { shufersal: 36.90, rami_levy: 29.50, victory: 33.90, ybitan: 38.90, hatzi_hinam: 33.50, carrefour: 32.90, yochananof: 29.65, tiv_taam: 35.30, osher_ad: 33.30, machsanei_hashuk: 28.62 },
    'נאגטס קפואים': { shufersal: 31.90, rami_levy: 24.50, victory: 28.90, ybitan: 33.90, hatzi_hinam: 28.50, carrefour: 27.50, yochananof: 24.65, tiv_taam: 30.14, osher_ad: 28.30, machsanei_hashuk: 23.77 },
    'פיצה קפואה': { shufersal: 26.90, rami_levy: 21.50, victory: 24.90, ybitan: 28.90, hatzi_hinam: 24.50, carrefour: 24.50, yochananof: 21.61, tiv_taam: 25.94, osher_ad: 24.35, machsanei_hashuk: 20.86 },
    'ירקות קפואים': { shufersal: 16.90, rami_levy: 11.50, victory: 14.90, ybitan: 18.90, hatzi_hinam: 14.50, carrefour: 14.90, yochananof: 11.61, tiv_taam: 16.10, osher_ad: 14.35, machsanei_hashuk: 11.16 },

    // ===== מזון יבש =====
    'אורז': { shufersal: 9.50, rami_levy: 11.90, victory: 12.90, ybitan: 13.90, hatzi_hinam: 11.50, carrefour: 10.50, yochananof: 11.85, tiv_taam: 9.90, osher_ad: 11.52, machsanei_hashuk: 11.54 },
    'אורז בסמטי': { shufersal: 14.50, rami_levy: 16.90, victory: 17.90, ybitan: 18.90, hatzi_hinam: 16.50, carrefour: 15.50, yochananof: 16.85, tiv_taam: 14.90, osher_ad: 16.52, machsanei_hashuk: 16.39 },
    'פסטה': { shufersal: 5.50, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50, carrefour: 7.10, yochananof: 7.85, tiv_taam: 6.14, osher_ad: 7.52, machsanei_hashuk: 7.66 },
    'פסטה ספגטי': { shufersal: 5.50, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50, carrefour: 6.50, yochananof: 7.85, tiv_taam: 5.90, osher_ad: 7.52, machsanei_hashuk: 7.66 },
    'פסטה פנה': { shufersal: 6.50, rami_levy: 8.90, victory: 9.90, ybitan: 10.90, hatzi_hinam: 8.50, carrefour: 8.90, yochananof: 8.85, tiv_taam: 7.46, osher_ad: 8.52, machsanei_hashuk: 8.63 },
    'קמח': { shufersal: 6.50, rami_levy: 8.90, victory: 9.90, ybitan: 10.90, hatzi_hinam: 8.50, carrefour: 8.50, yochananof: 7.70, tiv_taam: 7.30, osher_ad: 8.20, machsanei_hashuk: 8.50 },
    'קמח לבן': { shufersal: 6.50, rami_levy: 8.90, victory: 9.90, ybitan: 10.90, hatzi_hinam: 8.50, carrefour: 8.50, yochananof: 7.70, tiv_taam: 7.30, osher_ad: 8.20, machsanei_hashuk: 8.50 },
    'קמח מלא': { shufersal: 7.90, rami_levy: 8.50, victory: 9.50, ybitan: 10.50, hatzi_hinam: 8.90, carrefour: 9.20, yochananof: 8.30, tiv_taam: 8.50, osher_ad: 8.70, machsanei_hashuk: 8.40 },
    'קמח תופח': { shufersal: 8.50, rami_levy: 9.50, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.20, carrefour: 9.50, yochananof: 9.30, tiv_taam: 9.00, osher_ad: 9.10, machsanei_hashuk: 9.20 },
    'קמח כוסמין': { shufersal: 18.90, rami_levy: 19.90, victory: 21.90, ybitan: 22.90, hatzi_hinam: 20.50, carrefour: 19.50, yochananof: 19.50, tiv_taam: 19.90, osher_ad: 20.50, machsanei_hashuk: 19.50 },
    'קמח שיפון': { shufersal: 8.90, rami_levy: 9.50, victory: 10.50, ybitan: 11.50, hatzi_hinam: 9.50, carrefour: 9.90, yochananof: 9.30, tiv_taam: 9.20, osher_ad: 9.50, machsanei_hashuk: 9.20 },
    'קמח תירס': { shufersal: 10.50, rami_levy: 11.50, victory: 12.50, ybitan: 13.50, hatzi_hinam: 11.20, carrefour: 11.50, yochananof: 11.30, tiv_taam: 10.90, osher_ad: 11.20, machsanei_hashuk: 11.10 },
    'סוכר': { shufersal: 7.50, rami_levy: 9.90, victory: 10.90, ybitan: 11.90, hatzi_hinam: 9.50, carrefour: 10.10, yochananof: 9.85, tiv_taam: 8.54, osher_ad: 9.52, machsanei_hashuk: 9.60 },
    'מלח': { shufersal: 2.50, rami_levy: 4.90, victory: 5.90, ybitan: 6.90, hatzi_hinam: 4.50, carrefour: 4.50, yochananof: 4.85, tiv_taam: 3.30, osher_ad: 4.52, machsanei_hashuk: 4.75 },
    'שמן זית': { shufersal: 33.90, rami_levy: 38.90, victory: 39.90, ybitan: 42.90, hatzi_hinam: 36.90, carrefour: 34.50, yochananof: 38.80, tiv_taam: 34.14, osher_ad: 37.00, machsanei_hashuk: 37.73 },
    'שמן קנולה': { shufersal: 14.90, rami_levy: 17.90, victory: 18.90, ybitan: 19.90, hatzi_hinam: 16.50, carrefour: 16.50, yochananof: 17.84, tiv_taam: 15.54, osher_ad: 16.57, machsanei_hashuk: 17.36 },
    'רוטב עגבניות': { shufersal: 6.50, rami_levy: 8.90, victory: 9.90, ybitan: 10.90, hatzi_hinam: 8.50, carrefour: 8.10, yochananof: 8.85, tiv_taam: 7.14, osher_ad: 8.52, machsanei_hashuk: 8.63 },
    'רסק עגבניות': { shufersal: 4.50, rami_levy: 6.90, victory: 7.90, ybitan: 8.90, hatzi_hinam: 6.50, carrefour: 6.50, yochananof: 6.85, tiv_taam: 5.30, osher_ad: 6.52, machsanei_hashuk: 6.69 },
    'חומוס': { shufersal: 12.90, rami_levy: 9.90, victory: 11.90, ybitan: 13.90, hatzi_hinam: 11.50, carrefour: 10.50, yochananof: 9.96, tiv_taam: 11.94, osher_ad: 11.42, machsanei_hashuk: 9.60 },
    'טחינה': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 15.90, hatzi_hinam: 13.50, carrefour: 11.90, yochananof: 11.96, tiv_taam: 13.70, osher_ad: 13.42, machsanei_hashuk: 11.54 },
    'קטשופ': { shufersal: 9.50, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.50, carrefour: 10.50, yochananof: 12.83, tiv_taam: 9.90, osher_ad: 11.57, machsanei_hashuk: 12.51 },
    'מיונז': { shufersal: 11.50, rami_levy: 14.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 13.50, carrefour: 13.90, yochananof: 14.83, tiv_taam: 12.46, osher_ad: 13.57, machsanei_hashuk: 14.45 },
    'חרדל': { shufersal: 7.50, rami_levy: 9.90, victory: 10.90, ybitan: 11.90, hatzi_hinam: 9.50, carrefour: 10.50, yochananof: 9.85, tiv_taam: 8.70, osher_ad: 9.52, machsanei_hashuk: 9.60 },
    'זיתים': { shufersal: 14.90, rami_levy: 12.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 13.90, carrefour: 14.10, yochananof: 12.94, tiv_taam: 14.58, osher_ad: 13.85, machsanei_hashuk: 12.51 },

    // ===== מעדנייה =====
    'סלמי מעושן 100 גרם': { shufersal: 13.50, rami_levy: 11.90, victory: 14.50, ybitan: 15.50, hatzi_hinam: 12.90, carrefour: 14.10, yochananof: 11.93, tiv_taam: 13.74, osher_ad: 12.85, machsanei_hashuk: 11.54 },
    'סלמי מעושן 200 גרם': { shufersal: 26.90, rami_levy: 23.90, victory: 28.90, ybitan: 30.90, hatzi_hinam: 25.90, carrefour: 24.50, yochananof: 23.96, tiv_taam: 25.94, osher_ad: 25.80, machsanei_hashuk: 23.18 },
    'רוסטביף 100 גרם': { shufersal: 16.50, rami_levy: 14.90, victory: 17.50, ybitan: 18.50, hatzi_hinam: 15.90, carrefour: 14.50, yochananof: 14.93, tiv_taam: 15.70, osher_ad: 15.85, machsanei_hashuk: 14.45 },
    'רוסטביף 200 גרם': { shufersal: 32.90, rami_levy: 29.90, victory: 34.90, ybitan: 36.90, hatzi_hinam: 31.90, carrefour: 27.50, yochananof: 29.96, tiv_taam: 30.74, osher_ad: 31.80, machsanei_hashuk: 29.00 },
    'פסטרמה איטלקית 100 גרם': { shufersal: 16.50, rami_levy: 14.90, victory: 17.50, ybitan: 18.50, hatzi_hinam: 15.90, carrefour: 16.90, yochananof: 14.93, tiv_taam: 16.66, osher_ad: 15.85, machsanei_hashuk: 14.45 },
    'פסטרמה הודו 100 גרם': { shufersal: 14.50, rami_levy: 12.90, victory: 15.50, ybitan: 16.50, hatzi_hinam: 13.90, carrefour: 14.10, yochananof: 12.93, tiv_taam: 14.34, osher_ad: 13.85, machsanei_hashuk: 12.51 },
    'הודו מעושן 100 גרם': { shufersal: 12.50, rami_levy: 10.90, victory: 13.50, ybitan: 14.50, hatzi_hinam: 11.90, carrefour: 10.50, yochananof: 10.93, tiv_taam: 11.70, osher_ad: 11.85, machsanei_hashuk: 10.57 },
    'הודו מעושן 200 גרם': { shufersal: 24.90, rami_levy: 21.90, victory: 26.90, ybitan: 28.90, hatzi_hinam: 23.90, carrefour: 23.50, yochananof: 21.96, tiv_taam: 24.34, osher_ad: 23.80, machsanei_hashuk: 21.24 },
    'שינקן 100 גרם': { shufersal: 11.50, rami_levy: 9.90, victory: 12.50, ybitan: 13.50, hatzi_hinam: 10.90, carrefour: 10.90, yochananof: 9.93, tiv_taam: 11.26, osher_ad: 10.85, machsanei_hashuk: 9.60 },
    'שינקן 200 גרם': { shufersal: 22.90, rami_levy: 19.90, victory: 24.90, ybitan: 26.90, hatzi_hinam: 21.90, carrefour: 23.90, yochananof: 19.96, tiv_taam: 23.30, osher_ad: 21.80, machsanei_hashuk: 19.30 },

    // ===== סלטים =====
    'סלט חצילים': { shufersal: 15.90, rami_levy: 12.90, victory: 14.90, ybitan: 16.90, hatzi_hinam: 14.50, carrefour: 12.50, yochananof: 12.96, tiv_taam: 14.54, osher_ad: 14.42, machsanei_hashuk: 12.51 },
    'סלט מטבוחה': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 15.90, hatzi_hinam: 13.50, carrefour: 12.90, yochananof: 11.96, tiv_taam: 14.10, osher_ad: 13.42, machsanei_hashuk: 11.54 },
    'סלט טורקי': { shufersal: 16.90, rami_levy: 13.90, victory: 15.90, ybitan: 17.90, hatzi_hinam: 15.50, carrefour: 15.90, yochananof: 13.96, tiv_taam: 16.50, osher_ad: 15.42, machsanei_hashuk: 13.48 },

    // ===== תינוקות =====
    'חיתולים מידה 3': { shufersal: 48.90, rami_levy: 54.90, victory: 56.90, ybitan: 59.90, hatzi_hinam: 52.90, carrefour: 47.90, yochananof: 54.78, tiv_taam: 48.50, osher_ad: 53.00, machsanei_hashuk: 53.25 },
    'חיתולים מידה 4': { shufersal: 48.90, rami_levy: 54.90, victory: 56.90, ybitan: 59.90, hatzi_hinam: 52.90, carrefour: 54.90, yochananof: 54.78, tiv_taam: 51.30, osher_ad: 53.00, machsanei_hashuk: 53.25 },
    'מגבונים לתינוקות': { shufersal: 16.90, rami_levy: 13.90, victory: 15.50, ybitan: 18.90, hatzi_hinam: 11.50, carrefour: 10.90, yochananof: 13.96, tiv_taam: 14.50, osher_ad: 11.62, machsanei_hashuk: 13.48 },
    // פורמולות - מטרנה
    'מטרנה חלבי שלב 1': { shufersal: 56.90, rami_levy: 58.90, victory: 59.90, ybitan: 62.90, hatzi_hinam: 57.90, carrefour: 58.90, yochananof: 58.86, tiv_taam: 57.70, osher_ad: 57.95, machsanei_hashuk: 57.13 },
    'מטרנה חלבי שלב 2': { shufersal: 56.90, rami_levy: 58.90, victory: 59.90, ybitan: 62.90, hatzi_hinam: 57.90, carrefour: 58.90, yochananof: 58.86, tiv_taam: 57.70, osher_ad: 57.95, machsanei_hashuk: 57.13 },
    'מטרנה חלבי שלב 3': { shufersal: 56.90, rami_levy: 58.90, victory: 59.90, ybitan: 62.90, hatzi_hinam: 57.90, carrefour: 58.90, yochananof: 58.86, tiv_taam: 57.70, osher_ad: 57.95, machsanei_hashuk: 57.13 },
    'מטרנה מהדרין שלב 1': { shufersal: 65.00, rami_levy: 67.00, victory: 68.00, ybitan: 70.00, hatzi_hinam: 66.00, carrefour: 67.00, yochananof: 66.96, tiv_taam: 65.80, osher_ad: 66.05, machsanei_hashuk: 64.99 },
    'מטרנה מהדרין שלב 3': { shufersal: 65.00, rami_levy: 67.00, victory: 68.00, ybitan: 70.00, hatzi_hinam: 66.00, carrefour: 67.00, yochananof: 66.96, tiv_taam: 65.80, osher_ad: 66.05, machsanei_hashuk: 64.99 },
    'מטרנה גולד שלב 1': { shufersal: 81.90, rami_levy: 84.90, victory: 86.90, ybitan: 89.90, hatzi_hinam: 83.90, carrefour: 84.90, yochananof: 84.84, tiv_taam: 83.10, osher_ad: 83.95, machsanei_hashuk: 82.35 },
    'מטרנה גולד שלב 2': { shufersal: 81.90, rami_levy: 84.90, victory: 86.90, ybitan: 89.90, hatzi_hinam: 83.90, carrefour: 84.90, yochananof: 84.84, tiv_taam: 83.10, osher_ad: 83.95, machsanei_hashuk: 82.35 },
    'מטרנה גולד שלב 3': { shufersal: 81.90, rami_levy: 84.90, victory: 86.90, ybitan: 89.90, hatzi_hinam: 83.90, carrefour: 84.90, yochananof: 84.84, tiv_taam: 83.10, osher_ad: 83.95, machsanei_hashuk: 82.35 },
    'מטרנה אקסטרה קר שלב 1': { shufersal: 66.90, rami_levy: 69.90, victory: 71.90, ybitan: 74.90, hatzi_hinam: 68.90, carrefour: 69.90, yochananof: 69.84, tiv_taam: 68.10, osher_ad: 68.95, machsanei_hashuk: 67.80 },
    'מטרנה אקסטרה קר שלב 2': { shufersal: 66.90, rami_levy: 69.90, victory: 71.90, ybitan: 74.90, hatzi_hinam: 68.90, carrefour: 69.90, yochananof: 69.84, tiv_taam: 68.10, osher_ad: 68.95, machsanei_hashuk: 67.80 },
    'מטרנה אקסטרה קר שלב 3': { shufersal: 66.90, rami_levy: 69.90, victory: 71.90, ybitan: 74.90, hatzi_hinam: 68.90, carrefour: 69.90, yochananof: 69.84, tiv_taam: 68.10, osher_ad: 68.95, machsanei_hashuk: 67.80 },
    'מטרנה קומפורט': { shufersal: 82.90, rami_levy: 85.90, victory: 87.90, ybitan: 90.90, hatzi_hinam: 84.90, carrefour: 85.90, yochananof: 85.84, tiv_taam: 84.10, osher_ad: 84.95, machsanei_hashuk: 83.32 },
    'מטרנה צמחית': { shufersal: 71.90, rami_levy: 74.90, victory: 76.90, ybitan: 79.90, hatzi_hinam: 73.90, carrefour: 74.90, yochananof: 74.84, tiv_taam: 73.10, osher_ad: 73.95, machsanei_hashuk: 72.65 },
    // פורמולות - סימילאק
    'סימילאק גולד שלב 1': { shufersal: 72.60, rami_levy: 75.60, victory: 77.60, ybitan: 80.60, hatzi_hinam: 74.60, carrefour: 75.60, yochananof: 75.54, tiv_taam: 73.80, osher_ad: 74.65, machsanei_hashuk: 73.33 },
    'סימילאק גולד שלב 2': { shufersal: 72.60, rami_levy: 75.60, victory: 77.60, ybitan: 80.60, hatzi_hinam: 74.60, carrefour: 75.60, yochananof: 75.54, tiv_taam: 73.80, osher_ad: 74.65, machsanei_hashuk: 73.33 },
    'סימילאק גולד שלב 3': { shufersal: 72.60, rami_levy: 75.60, victory: 77.60, ybitan: 80.60, hatzi_hinam: 74.60, carrefour: 75.60, yochananof: 75.54, tiv_taam: 73.80, osher_ad: 74.65, machsanei_hashuk: 73.33 },
    'סימילאק גולד+ שלב 1': { shufersal: 80.90, rami_levy: 83.90, victory: 85.90, ybitan: 88.90, hatzi_hinam: 82.90, carrefour: 83.90, yochananof: 83.84, tiv_taam: 82.10, osher_ad: 82.95, machsanei_hashuk: 81.38 },
    'סימילאק גולד+ שלב 2': { shufersal: 80.90, rami_levy: 83.90, victory: 85.90, ybitan: 88.90, hatzi_hinam: 82.90, carrefour: 83.90, yochananof: 83.84, tiv_taam: 82.10, osher_ad: 82.95, machsanei_hashuk: 81.38 },
    'סימילאק גולד+ שלב 3': { shufersal: 80.90, rami_levy: 83.90, victory: 85.90, ybitan: 88.90, hatzi_hinam: 82.90, carrefour: 83.90, yochananof: 83.84, tiv_taam: 82.10, osher_ad: 82.95, machsanei_hashuk: 81.38 },
    'סימילאק קומפורט שלב 1': { shufersal: 107.90, rami_levy: 110.90, victory: 112.90, ybitan: 115.90, hatzi_hinam: 109.90, carrefour: 110.90, yochananof: 110.84, tiv_taam: 109.10, osher_ad: 109.95, machsanei_hashuk: 107.57 },
    'סימילאק קומפורט שלב 2': { shufersal: 107.90, rami_levy: 110.90, victory: 112.90, ybitan: 115.90, hatzi_hinam: 109.90, carrefour: 110.90, yochananof: 110.84, tiv_taam: 109.10, osher_ad: 109.95, machsanei_hashuk: 107.57 },
    // פורמולות - נוטרילון
    'נוטרילון שלב 1': { shufersal: 74.90, rami_levy: 77.90, victory: 79.90, ybitan: 82.90, hatzi_hinam: 76.90, carrefour: 77.90, yochananof: 77.84, tiv_taam: 76.10, osher_ad: 76.95, machsanei_hashuk: 75.56 },
    'נוטרילון שלב 2': { shufersal: 74.90, rami_levy: 77.90, victory: 79.90, ybitan: 82.90, hatzi_hinam: 76.90, carrefour: 77.90, yochananof: 77.84, tiv_taam: 76.10, osher_ad: 76.95, machsanei_hashuk: 75.56 },
    'נוטרילון שלב 3': { shufersal: 74.90, rami_levy: 77.90, victory: 79.90, ybitan: 82.90, hatzi_hinam: 76.90, carrefour: 77.90, yochananof: 77.84, tiv_taam: 76.10, osher_ad: 76.95, machsanei_hashuk: 75.56 },

    // ===== חיות מחמד =====
    'מזון לכלבים': { shufersal: 49.90, rami_levy: 44.90, victory: 52.90, ybitan: 54.90, hatzi_hinam: 46.90, carrefour: 49.50, yochananof: 45.00, tiv_taam: 49.74, osher_ad: 46.80, machsanei_hashuk: 43.55 },
    'מזון לחתולים': { shufersal: 44.90, rami_levy: 39.90, victory: 47.90, ybitan: 49.90, hatzi_hinam: 41.90, carrefour: 38.10, yochananof: 40.00, tiv_taam: 42.18, osher_ad: 41.80, machsanei_hashuk: 38.70 },
    'חול לחתולים': { shufersal: 34.90, rami_levy: 29.90, victory: 37.90, ybitan: 39.90, hatzi_hinam: 31.90, carrefour: 33.10, yochananof: 30.00, tiv_taam: 34.18, osher_ad: 31.80, machsanei_hashuk: 29.00 },

    // ===== דגנים וארוחת בוקר =====
    'קורנפלקס': { shufersal: 18.90, rami_levy: 19.90, victory: 20.90, ybitan: 21.90, hatzi_hinam: 17.90, carrefour: 16.90, yochananof: 19.88, tiv_taam: 18.10, osher_ad: 18.00, machsanei_hashuk: 19.30 },
    'קורנפלקס קלאסי': { shufersal: 18.90, rami_levy: 19.90, victory: 20.90, ybitan: 21.90, hatzi_hinam: 17.90, carrefour: 19.50, yochananof: 19.88, tiv_taam: 19.14, osher_ad: 18.00, machsanei_hashuk: 19.30 },
    'קורנפלקס דבש': { shufersal: 21.90, rami_levy: 22.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 20.90, carrefour: 21.50, yochananof: 22.88, tiv_taam: 21.74, osher_ad: 21.00, machsanei_hashuk: 22.21 },
    'קורנפלקס שוקולד': { shufersal: 21.90, rami_levy: 22.90, victory: 23.90, ybitan: 24.90, hatzi_hinam: 20.90, carrefour: 22.10, yochananof: 22.88, tiv_taam: 21.98, osher_ad: 21.00, machsanei_hashuk: 22.21 },
    'קורנפלקס כריות': { shufersal: 23.90, rami_levy: 24.90, victory: 25.90, ybitan: 26.90, hatzi_hinam: 22.90, carrefour: 19.90, yochananof: 24.88, tiv_taam: 22.30, osher_ad: 23.00, machsanei_hashuk: 24.15 },
    'קורנפלקס פירות': { shufersal: 22.90, rami_levy: 23.90, victory: 24.90, ybitan: 25.90, hatzi_hinam: 21.90, carrefour: 21.50, yochananof: 23.88, tiv_taam: 22.34, osher_ad: 22.00, machsanei_hashuk: 23.18 },
    'גרנולה': { shufersal: 24.90, rami_levy: 25.90, victory: 26.90, ybitan: 27.90, hatzi_hinam: 23.90, carrefour: 21.50, yochananof: 25.88, tiv_taam: 23.54, osher_ad: 24.00, machsanei_hashuk: 25.12 },
    'גרנולה שוקולד': { shufersal: 26.90, rami_levy: 27.90, victory: 28.90, ybitan: 29.90, hatzi_hinam: 25.90, carrefour: 26.90, yochananof: 27.88, tiv_taam: 26.90, osher_ad: 26.00, machsanei_hashuk: 27.06 },
    'גרנולה פירות': { shufersal: 26.90, rami_levy: 27.90, victory: 28.90, ybitan: 29.90, hatzi_hinam: 25.90, carrefour: 26.50, yochananof: 27.88, tiv_taam: 26.74, osher_ad: 26.00, machsanei_hashuk: 27.06 },
    'מוזלי': { shufersal: 22.90, rami_levy: 23.90, victory: 24.90, ybitan: 25.90, hatzi_hinam: 21.90, carrefour: 23.50, yochananof: 23.88, tiv_taam: 23.14, osher_ad: 22.00, machsanei_hashuk: 23.18 },
    'שיבולת שועל': { shufersal: 12.90, rami_levy: 13.90, victory: 14.90, ybitan: 15.90, hatzi_hinam: 11.90, carrefour: 12.90, yochananof: 13.88, tiv_taam: 12.90, osher_ad: 12.00, machsanei_hashuk: 13.48 },
    'קוואקר': { shufersal: 14.90, rami_levy: 15.90, victory: 16.90, ybitan: 17.90, hatzi_hinam: 13.90, carrefour: 12.90, yochananof: 15.88, tiv_taam: 14.10, osher_ad: 14.00, machsanei_hashuk: 15.42 },

    // ===== מעדני חלב =====
    'מילקי': { shufersal: 4.90, rami_levy: 5.20, victory: 5.50, ybitan: 5.90, hatzi_hinam: 4.50, carrefour: 3.90, yochananof: 5.19, tiv_taam: 4.50, osher_ad: 4.53, machsanei_hashuk: 5.04 },
    'מילקי שוקולד': { shufersal: 4.90, rami_levy: 5.20, victory: 5.50, ybitan: 5.90, hatzi_hinam: 4.50, carrefour: 4.50, yochananof: 5.19, tiv_taam: 4.74, osher_ad: 4.53, machsanei_hashuk: 5.04 },
    'מילקי וניל': { shufersal: 4.90, rami_levy: 5.20, victory: 5.50, ybitan: 5.90, hatzi_hinam: 4.50, carrefour: 3.90, yochananof: 5.19, tiv_taam: 4.50, osher_ad: 4.53, machsanei_hashuk: 5.04 },
    'מילקי קרמל': { shufersal: 4.90, rami_levy: 5.20, victory: 5.50, ybitan: 5.90, hatzi_hinam: 4.50, carrefour: 4.10, yochananof: 5.19, tiv_taam: 4.58, osher_ad: 4.53, machsanei_hashuk: 5.04 },
    'דניאלה': { shufersal: 5.90, rami_levy: 6.20, victory: 6.50, ybitan: 6.90, hatzi_hinam: 5.50, carrefour: 5.50, yochananof: 6.19, tiv_taam: 5.74, osher_ad: 5.54, machsanei_hashuk: 6.01 },
    'דניאלה שוקולד': { shufersal: 5.90, rami_levy: 6.20, victory: 6.50, ybitan: 6.90, hatzi_hinam: 5.50, carrefour: 5.10, yochananof: 6.19, tiv_taam: 5.58, osher_ad: 5.54, machsanei_hashuk: 6.01 },
    'דניאלה וניל': { shufersal: 5.90, rami_levy: 6.20, victory: 6.50, ybitan: 6.90, hatzi_hinam: 5.50, carrefour: 4.90, yochananof: 6.19, tiv_taam: 5.50, osher_ad: 5.54, machsanei_hashuk: 6.01 },
    'דנונה': { shufersal: 5.50, rami_levy: 5.90, victory: 6.20, ybitan: 6.50, hatzi_hinam: 5.20, carrefour: 5.10, yochananof: 5.89, tiv_taam: 5.34, osher_ad: 5.24, machsanei_hashuk: 5.72 },
    'דנונה שוקולד': { shufersal: 5.50, rami_levy: 5.90, victory: 6.20, ybitan: 6.50, hatzi_hinam: 5.20, carrefour: 5.10, yochananof: 5.89, tiv_taam: 5.34, osher_ad: 5.24, machsanei_hashuk: 5.72 },
    'יופלה': { shufersal: 6.90, rami_levy: 7.20, victory: 7.50, ybitan: 7.90, hatzi_hinam: 6.50, carrefour: 6.10, yochananof: 7.19, tiv_taam: 6.58, osher_ad: 6.54, machsanei_hashuk: 6.98 },
    'יופלה תות': { shufersal: 6.90, rami_levy: 7.20, victory: 7.50, ybitan: 7.90, hatzi_hinam: 6.50, carrefour: 6.50, yochananof: 7.19, tiv_taam: 6.74, osher_ad: 6.54, machsanei_hashuk: 6.98 },
    'אקטימל': { shufersal: 7.90, rami_levy: 8.20, victory: 8.50, ybitan: 8.90, hatzi_hinam: 7.50, carrefour: 7.50, yochananof: 8.19, tiv_taam: 7.74, osher_ad: 7.54, machsanei_hashuk: 7.95 },
    'פטיט דנון': { shufersal: 14.90, rami_levy: 15.50, victory: 16.20, ybitan: 16.90, hatzi_hinam: 14.50, carrefour: 13.50, yochananof: 15.49, tiv_taam: 14.34, osher_ad: 14.55, machsanei_hashuk: 15.04 },
    'מעדן שוקולד': { shufersal: 5.50, rami_levy: 5.90, victory: 6.20, ybitan: 6.50, hatzi_hinam: 5.20, carrefour: 5.10, yochananof: 5.89, tiv_taam: 5.34, osher_ad: 5.24, machsanei_hashuk: 5.72 },
    'מעדן וניל': { shufersal: 5.50, rami_levy: 5.90, victory: 6.20, ybitan: 6.50, hatzi_hinam: 5.20, carrefour: 5.10, yochananof: 5.89, tiv_taam: 5.34, osher_ad: 5.24, machsanei_hashuk: 5.72 },
    'שוקו': { shufersal: 4.90, rami_levy: 5.20, victory: 5.50, ybitan: 5.90, hatzi_hinam: 4.50, carrefour: 4.50, yochananof: 5.19, tiv_taam: 4.74, osher_ad: 4.53, machsanei_hashuk: 5.04 },
    'שוקו תנובה': { shufersal: 4.90, rami_levy: 5.20, victory: 5.50, ybitan: 5.90, hatzi_hinam: 4.50, carrefour: 4.50, yochananof: 5.19, tiv_taam: 4.74, osher_ad: 4.53, machsanei_hashuk: 5.04 },
    'פרי גד': { shufersal: 5.90, rami_levy: 6.20, victory: 6.50, ybitan: 6.90, hatzi_hinam: 5.50, carrefour: 4.90, yochananof: 6.19, tiv_taam: 5.50, osher_ad: 5.54, machsanei_hashuk: 6.01 },

    // ===== גלידות נוספות =====
    'מגנום': { shufersal: 12.90, rami_levy: 11.50, victory: 13.50, ybitan: 14.50, hatzi_hinam: 10.90, carrefour: 10.10, yochananof: 11.53, tiv_taam: 11.78, osher_ad: 10.93, machsanei_hashuk: 11.16 },
    'מגנום שקדים': { shufersal: 12.90, rami_levy: 11.50, victory: 13.50, ybitan: 14.50, hatzi_hinam: 10.90, carrefour: 9.50, yochananof: 11.53, tiv_taam: 11.54, osher_ad: 10.93, machsanei_hashuk: 11.16 },
    'מגנום לבן': { shufersal: 12.90, rami_levy: 11.50, victory: 13.50, ybitan: 14.50, hatzi_hinam: 10.90, carrefour: 11.90, yochananof: 11.53, tiv_taam: 12.50, osher_ad: 10.93, machsanei_hashuk: 11.16 },
    'קורנטו': { shufersal: 9.90, rami_levy: 8.50, victory: 10.50, ybitan: 11.50, hatzi_hinam: 7.90, carrefour: 8.10, yochananof: 8.53, tiv_taam: 9.18, osher_ad: 7.93, machsanei_hashuk: 8.24 },
    'קורנטו שוקולד': { shufersal: 9.90, rami_levy: 8.50, victory: 10.50, ybitan: 11.50, hatzi_hinam: 7.90, carrefour: 7.90, yochananof: 8.53, tiv_taam: 9.10, osher_ad: 7.93, machsanei_hashuk: 8.24 },
    'גולדה': { shufersal: 32.90, rami_levy: 29.90, victory: 34.90, ybitan: 36.90, hatzi_hinam: 28.90, carrefour: 27.50, yochananof: 29.96, tiv_taam: 30.74, osher_ad: 28.95, machsanei_hashuk: 29.00 },
    'ארטיק': { shufersal: 6.90, rami_levy: 5.90, victory: 7.50, ybitan: 8.50, hatzi_hinam: 5.50, carrefour: 5.50, yochananof: 5.92, tiv_taam: 6.34, osher_ad: 5.52, machsanei_hashuk: 5.72 },

    // ===== קפואים נוספים =====
    'בורקס': { shufersal: 28.90, rami_levy: 24.90, victory: 29.90, ybitan: 31.90, hatzi_hinam: 26.90, carrefour: 24.10, yochananof: 24.98, tiv_taam: 26.98, osher_ad: 26.80, machsanei_hashuk: 24.15 },
    'בורקס גבינה': { shufersal: 28.90, rami_levy: 24.90, victory: 29.90, ybitan: 31.90, hatzi_hinam: 26.90, carrefour: 26.50, yochananof: 24.98, tiv_taam: 27.94, osher_ad: 26.80, machsanei_hashuk: 24.15 },
    'בורקס תפו"א': { shufersal: 26.90, rami_levy: 22.90, victory: 27.90, ybitan: 29.90, hatzi_hinam: 24.90, carrefour: 23.50, yochananof: 22.98, tiv_taam: 25.54, osher_ad: 24.80, machsanei_hashuk: 22.21 },
    'בורקס פטריות': { shufersal: 28.90, rami_levy: 24.90, victory: 29.90, ybitan: 31.90, hatzi_hinam: 26.90, carrefour: 25.50, yochananof: 24.98, tiv_taam: 27.54, osher_ad: 26.80, machsanei_hashuk: 24.15 },
    'פיצה משפחתית': { shufersal: 34.90, rami_levy: 29.90, victory: 35.90, ybitan: 37.90, hatzi_hinam: 32.90, carrefour: 32.90, yochananof: 30.00, tiv_taam: 34.10, osher_ad: 32.75, machsanei_hashuk: 29.00 },
    'שווארמה קפואה': { shufersal: 44.90, rami_levy: 39.90, victory: 46.90, ybitan: 48.90, hatzi_hinam: 42.90, carrefour: 44.10, yochananof: 40.00, tiv_taam: 44.58, osher_ad: 42.75, machsanei_hashuk: 38.70 },
    'קבב קפוא': { shufersal: 39.90, rami_levy: 34.90, victory: 41.90, ybitan: 43.90, hatzi_hinam: 37.90, carrefour: 36.10, yochananof: 35.00, tiv_taam: 38.38, osher_ad: 37.75, machsanei_hashuk: 33.85 },
    'פלאפל קפוא': { shufersal: 18.90, rami_levy: 15.90, victory: 19.90, ybitan: 21.90, hatzi_hinam: 17.90, carrefour: 18.10, yochananof: 15.96, tiv_taam: 18.58, osher_ad: 17.80, machsanei_hashuk: 15.42 },
    'פירות יער קפואים': { shufersal: 24.90, rami_levy: 21.90, victory: 25.90, ybitan: 27.90, hatzi_hinam: 23.90, carrefour: 26.10, yochananof: 21.96, tiv_taam: 25.38, osher_ad: 23.80, machsanei_hashuk: 21.24 },
    'תותים קפואים': { shufersal: 22.90, rami_levy: 19.90, victory: 23.90, ybitan: 25.90, hatzi_hinam: 21.90, carrefour: 19.50, yochananof: 19.96, tiv_taam: 21.54, osher_ad: 21.80, machsanei_hashuk: 19.30 },

    // ===== משקאות קרים נוספים =====
    'נסטי': { shufersal: 7.90, rami_levy: 8.50, victory: 8.90, ybitan: 9.50, hatzi_hinam: 6.90, carrefour: 6.10, yochananof: 8.49, tiv_taam: 7.18, osher_ad: 6.98, machsanei_hashuk: 8.24 },
    'נסטי אפרסק': { shufersal: 7.90, rami_levy: 8.50, victory: 8.90, ybitan: 9.50, hatzi_hinam: 6.90, carrefour: 7.50, yochananof: 8.49, tiv_taam: 7.74, osher_ad: 6.98, machsanei_hashuk: 8.24 },
    'נסטי לימון': { shufersal: 7.90, rami_levy: 8.50, victory: 8.90, ybitan: 9.50, hatzi_hinam: 6.90, carrefour: 6.10, yochananof: 8.49, tiv_taam: 7.18, osher_ad: 6.98, machsanei_hashuk: 8.24 },
    'פיוז טי': { shufersal: 7.90, rami_levy: 8.50, victory: 8.90, ybitan: 9.50, hatzi_hinam: 6.90, carrefour: 6.10, yochananof: 8.49, tiv_taam: 7.18, osher_ad: 6.98, machsanei_hashuk: 8.24 },
    'פיוז טי אפרסק': { shufersal: 7.90, rami_levy: 8.50, victory: 8.90, ybitan: 9.50, hatzi_hinam: 6.90, carrefour: 6.90, yochananof: 8.49, tiv_taam: 7.50, osher_ad: 6.98, machsanei_hashuk: 8.24 },
    'ליפטון תה קר': { shufersal: 8.90, rami_levy: 9.50, victory: 9.90, ybitan: 10.50, hatzi_hinam: 7.90, carrefour: 6.90, yochananof: 9.49, tiv_taam: 8.10, osher_ad: 7.98, machsanei_hashuk: 9.22 },
    'XL': { shufersal: 6.90, rami_levy: 7.50, victory: 7.90, ybitan: 8.50, hatzi_hinam: 5.90, carrefour: 6.50, yochananof: 7.49, tiv_taam: 6.74, osher_ad: 5.98, machsanei_hashuk: 7.28 },
    'רד בול': { shufersal: 9.90, rami_levy: 10.50, victory: 10.90, ybitan: 11.50, hatzi_hinam: 8.90, carrefour: 9.10, yochananof: 10.49, tiv_taam: 9.58, osher_ad: 8.98, machsanei_hashuk: 10.19 },

    // ===== חטיפים נוספים =====
    'קינדר בואנו': { shufersal: 8.90, rami_levy: 9.50, victory: 9.90, ybitan: 10.50, hatzi_hinam: 7.90, carrefour: 7.50, yochananof: 9.49, tiv_taam: 8.34, osher_ad: 7.98, machsanei_hashuk: 9.22 },
    'קינדר שוקולד': { shufersal: 7.90, rami_levy: 8.50, victory: 8.90, ybitan: 9.50, hatzi_hinam: 6.90, carrefour: 6.50, yochananof: 8.49, tiv_taam: 7.34, osher_ad: 6.98, machsanei_hashuk: 8.24 },
    'קינדר סרפרייז': { shufersal: 9.90, rami_levy: 10.50, victory: 10.90, ybitan: 11.50, hatzi_hinam: 8.90, carrefour: 8.50, yochananof: 10.49, tiv_taam: 9.34, osher_ad: 8.98, machsanei_hashuk: 10.19 },
    'פסק זמן': { shufersal: 6.90, rami_levy: 7.50, victory: 7.90, ybitan: 8.50, hatzi_hinam: 5.90, carrefour: 5.90, yochananof: 7.49, tiv_taam: 6.50, osher_ad: 5.98, machsanei_hashuk: 7.28 },
    'פסק זמן לבן': { shufersal: 6.90, rami_levy: 7.50, victory: 7.90, ybitan: 8.50, hatzi_hinam: 5.90, carrefour: 5.50, yochananof: 7.49, tiv_taam: 6.34, osher_ad: 5.98, machsanei_hashuk: 7.28 },
    'באונטי': { shufersal: 6.90, rami_levy: 7.50, victory: 7.90, ybitan: 8.50, hatzi_hinam: 5.90, carrefour: 5.50, yochananof: 7.49, tiv_taam: 6.34, osher_ad: 5.98, machsanei_hashuk: 7.28 },
    'קליק': { shufersal: 5.90, rami_levy: 6.50, victory: 6.90, ybitan: 7.50, hatzi_hinam: 4.90, carrefour: 5.10, yochananof: 6.49, tiv_taam: 5.58, osher_ad: 4.98, machsanei_hashuk: 6.31 },
    'קליק מריר': { shufersal: 5.90, rami_levy: 6.50, victory: 6.90, ybitan: 7.50, hatzi_hinam: 4.90, carrefour: 4.50, yochananof: 6.49, tiv_taam: 5.34, osher_ad: 4.98, machsanei_hashuk: 6.31 },
    'טורטית': { shufersal: 5.90, rami_levy: 6.50, victory: 6.90, ybitan: 7.50, hatzi_hinam: 4.90, carrefour: 5.10, yochananof: 6.49, tiv_taam: 5.58, osher_ad: 4.98, machsanei_hashuk: 6.31 },
    'רושקה': { shufersal: 4.90, rami_levy: 5.50, victory: 5.90, ybitan: 6.50, hatzi_hinam: 3.90, carrefour: 4.10, yochananof: 5.49, tiv_taam: 4.58, osher_ad: 3.98, machsanei_hashuk: 5.34 },
    'כדורגל': { shufersal: 4.90, rami_levy: 5.50, victory: 5.90, ybitan: 6.50, hatzi_hinam: 3.90, carrefour: 3.50, yochananof: 5.49, tiv_taam: 4.34, osher_ad: 3.98, machsanei_hashuk: 5.34 },
    'חלווה': { shufersal: 18.90, rami_levy: 16.90, victory: 19.90, ybitan: 21.90, hatzi_hinam: 17.90, carrefour: 19.10, yochananof: 16.94, tiv_taam: 18.98, osher_ad: 17.85, machsanei_hashuk: 16.39 },
    'גרעינים': { shufersal: 12.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 10.90, carrefour: 9.90, yochananof: 11.92, tiv_taam: 11.70, osher_ad: 10.95, machsanei_hashuk: 11.54 },

    // ===== ניקיון נוספים =====
    'אקונומיקה': { shufersal: 9.90, rami_levy: 10.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 8.90, carrefour: 7.90, yochananof: 10.88, tiv_taam: 9.10, osher_ad: 9.00, machsanei_hashuk: 10.57 },
    'אקונומיקה לימון': { shufersal: 9.90, rami_levy: 10.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 8.90, carrefour: 9.50, yochananof: 10.88, tiv_taam: 9.74, osher_ad: 9.00, machsanei_hashuk: 10.57 },
    'מרכך כביסה': { shufersal: 16.90, rami_levy: 18.90, victory: 19.90, ybitan: 21.90, hatzi_hinam: 15.90, carrefour: 15.10, yochananof: 18.86, tiv_taam: 16.18, osher_ad: 16.05, machsanei_hashuk: 18.33 },
    'מרכך סנו': { shufersal: 18.90, rami_levy: 20.90, victory: 21.90, ybitan: 23.90, hatzi_hinam: 17.90, carrefour: 18.10, yochananof: 20.86, tiv_taam: 18.58, osher_ad: 18.05, machsanei_hashuk: 20.27 },
    'אבקת כביסה פרסיל': { shufersal: 44.90, rami_levy: 48.90, victory: 49.90, ybitan: 52.90, hatzi_hinam: 42.90, carrefour: 43.10, yochananof: 48.82, tiv_taam: 44.18, osher_ad: 43.20, machsanei_hashuk: 47.43 },
    'נוזל כלים סנו': { shufersal: 12.90, rami_levy: 14.90, victory: 15.90, ybitan: 16.90, hatzi_hinam: 11.90, carrefour: 11.50, yochananof: 14.86, tiv_taam: 12.34, osher_ad: 12.05, machsanei_hashuk: 14.45 },
    'מסיר שומנים': { shufersal: 14.90, rami_levy: 16.90, victory: 17.90, ybitan: 18.90, hatzi_hinam: 13.90, carrefour: 15.10, yochananof: 16.86, tiv_taam: 14.98, osher_ad: 14.05, machsanei_hashuk: 16.39 },
    'מסיר אבנית': { shufersal: 16.90, rami_levy: 18.90, victory: 19.90, ybitan: 20.90, hatzi_hinam: 15.90, carrefour: 13.90, yochananof: 18.86, tiv_taam: 15.70, osher_ad: 16.05, machsanei_hashuk: 18.33 },

    // ===== היגיינה נוספים =====
    'סבון דאב': { shufersal: 8.90, rami_levy: 9.90, victory: 10.90, ybitan: 11.90, hatzi_hinam: 7.90, carrefour: 6.90, yochananof: 9.88, tiv_taam: 8.10, osher_ad: 8.00, machsanei_hashuk: 9.60 },
    'דאודורנט רקסונה': { shufersal: 19.90, rami_levy: 21.90, victory: 22.90, ybitan: 24.90, hatzi_hinam: 18.90, carrefour: 18.10, yochananof: 21.86, tiv_taam: 19.18, osher_ad: 19.05, machsanei_hashuk: 21.24 },
    'דאודורנט ניוואה': { shufersal: 21.90, rami_levy: 23.90, victory: 24.90, ybitan: 26.90, hatzi_hinam: 20.90, carrefour: 17.90, yochananof: 23.86, tiv_taam: 20.30, osher_ad: 21.05, machsanei_hashuk: 23.18 },
    'משחת שיניים קולגייט': { shufersal: 14.90, rami_levy: 16.90, victory: 17.90, ybitan: 18.90, hatzi_hinam: 13.90, carrefour: 13.10, yochananof: 16.86, tiv_taam: 14.18, osher_ad: 14.05, machsanei_hashuk: 16.39 },
    'מרכך פנטן': { shufersal: 24.90, rami_levy: 26.90, victory: 27.90, ybitan: 29.90, hatzi_hinam: 23.90, carrefour: 21.90, yochananof: 26.86, tiv_taam: 23.70, osher_ad: 24.05, machsanei_hashuk: 26.09 },
};

// Chain information - 10 major Israeli supermarket chains
const CHAINS = {
    shufersal: { name: 'שופרסל', color: '#dc2626', url: 'https://www.shufersal.co.il/online/he/search?text=' },
    rami_levy: { name: 'רמי לוי', color: '#2563eb', url: 'https://www.rami-levy.co.il/he/online/search?q=' },
    victory: { name: 'ויקטורי', color: '#ea580c', url: 'https://www.victoryonline.co.il/search?q=' },
    ybitan: { name: 'יינות ביתן', color: '#7c3aed', url: 'https://www.ybitan.co.il/search?q=' },
    hatzi_hinam: { name: 'חצי חינם', color: '#16a34a', url: 'https://shop.hazi-hinam.co.il/search?q=' },
    carrefour: { name: 'קארפור', color: '#0066cc', url: 'https://www.carrefour.co.il/search?q=' },
    yochananof: { name: 'יוחננוף', color: '#f59e0b', url: 'https://yochananof.co.il/search?q=' },
    tiv_taam: { name: 'טיב טעם', color: '#10b981', url: 'https://www.tivtaam.co.il/search?q=' },
    osher_ad: { name: 'אושר עד', color: '#6366f1', url: 'https://osherad.co.il/search?q=' },
    machsanei_hashuk: { name: 'מחסני השוק', color: '#f97316', url: 'https://www.mahsanei-hashuk.co.il/search?q=' },
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
                chain_name_he: CHAINS[bestChain[0]].name,
                color: CHAINS[bestChain[0]].color,
                items: itemPrices.map(i => ({ name: i.name, quantity: i.quantity, price: i.pricesByChain[bestChain[0]] })),
                item_count: itemPrices.length,
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

    const singleStoreTotals = Object.keys(CHAINS).map(chainId => ({
        chainId,
        total: itemPrices.reduce((sum, item) => sum + (item.pricesByChain[chainId] || 0), 0)
    }));
    singleStoreTotals.sort((a, b) => a.total - b.total);
    const bestSingleStore = singleStoreTotals[0].total;
    const savings = bestSingleStore - totalPrice;

    return {
        strategy: 'optimal',
        total_price: Math.round(totalPrice * 100) / 100,
        total_savings: Math.round(savings * 100) / 100,
        savings_percentage: bestSingleStore > 0 ? Math.round((savings / bestSingleStore) * 100 * 10) / 10 : 0,
        shopping_plan: Object.entries(shoppingPlan).map(([chainId, data]) => ({
            chain_id: chainId,
            chain_name: CHAINS[chainId].name,
            chain_name_he: CHAINS[chainId].name,
            color: CHAINS[chainId].color,
            items: data.items,
            item_count: data.items.length,
            subtotal: Math.round(data.subtotal * 100) / 100
        })).sort((a, b) => b.subtotal - a.subtotal),
        single_chain_comparison: {
            cheapest: CHAINS[singleStoreTotals[0].chainId].name,
            total: Math.round(bestSingleStore * 100) / 100
        }
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
