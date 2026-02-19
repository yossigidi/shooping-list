// Shared utility for fetching regulated prices from data.gov.il
// Used by api/regulated-prices.js and api/prices.js

const GOV_API_URL = 'https://data.gov.il/api/3/action/datastore_search';
const GOV_RESOURCE_ID = '0a760550-0426-4eb7-acf6-2ee919bf12e7';

// Mapping from data.gov.il product names → app product names
// Each gov product maps to all the app name variations it should regulate
const GOV_TO_APP_NAMES = {
    'שמנת חמוצה 15% שומן רגילה': [
        'שמנת חמוצה', 'שמנת חמוצה 200 גרם', 'שמנת חמוצה אורגינל 15%'
    ],
    'שמנת מתוקה 38% שומן': [
        'שמנת מתוקה', 'שמנת מתוקה 200 מ"ל', 'שמנת מתוקה 38%'
    ],
    'חלב טרי בקרטון 3% שומן (רגיל)': [
        'חלב', 'חלב 3%', 'חלב תנובה', 'חלב תנובה 3%', 'חלב תנובה 3% 1 ליטר',
        'חלב טרי 3%', 'חלב טרי 3% 1 ליטר'
    ],
    'חלב טרי בקרטון 1% שומן (רגיל)': [
        'חלב 1%', 'חלב דל שומן', 'חלב תנובה 1%', 'חלב תנובה דל שומן 1 ליטר'
    ],
    'חלב טרי בשקית 3% שומן (רגיל)': [
        'חלב בשקית 3%', 'חלב שקית 3%'
    ],
    'חלב טרי בשקית 1% שומן (רגיל)': [
        'חלב בשקית 1%', 'חלב שקית 1%'
    ],
    'גבינה לבנה 5%': [
        'גבינה לבנה 5%', 'גבינה לבנה 5% 250 גרם'
    ],
    'ביצי מאכל - גודל גדול (L)': [
        'ביצים L', 'ביצים L 12 יח׳'
    ],
    'ביצי מאכל - גודל מדיום (M)': [
        'ביצים M', 'ביצים M 12 יח׳'
    ],
    'ביצי מאכל- גודל ענק (XL)': [
        'ביצים XL', 'ביצים XL 12 יח׳'
    ],
    'אשל 4.5% שומן': [
        'אשל לבן 4.5%'
    ],
    'גיל 3% שומן': [
        'גיל לבן 3%'
    ],
    'חלה או מאפה שמרים': [
        'חלה'
    ],
    'לחם אחיד (כהה)': [
        'לחם אחיד', 'לחם אחיד כהה'
    ],
    'לחם אחיד (כהה) פרוס וארוז': [
        'לחם אחיד פרוס', 'לחם כהה פרוס'
    ],
    'לחם לבן': [
        'לחם', 'לחם לבן'
    ],
    'לחם לבן פרוס וארוז': [
        'לחם פרוס'
    ],
    'מלח מטבח רגיל, מלח מטבח מעולה': [
        'מלח', 'מלח שולחן 500 גרם'
    ],
    'מלח שולחן מעולה ומלח שולחן מעולה גס': [
        'מלח שולחן 500 גרם'
    ],
};

// Products whose regulated price is derived proportionally from a 12-unit base
// data.gov.il prices are per tray of 12 eggs; 30-egg trays = price * 30/12
const PROPORTIONAL_PRODUCTS = {
    'ביצים L 30 יח׳': { govName: 'ביצי מאכל - גודל גדול (L)', factor: 30 / 12 },
    'ביצים XL 30 יח׳': { govName: 'ביצי מאכל- גודל ענק (XL)', factor: 30 / 12 },
    'ביצים M 30 יח׳': { govName: 'ביצי מאכל - גודל מדיום (M)', factor: 30 / 12 },
};

// Hardcoded fallback prices (updated February 2026) in case data.gov.il API is down
// These are the government-regulated maximum prices including 18% VAT
const FALLBACK_GOV_PRICES = {
    'חלב טרי בקרטון 3% שומן (רגיל)': { price: 7.28, updateDate: '01/05/2025' },
    'חלב טרי בקרטון 1% שומן (רגיל)': { price: 6.85, updateDate: '01/05/2025' },
    'חלב טרי בשקית 3% שומן (רגיל)': { price: 6.35, updateDate: '01/05/2025' },
    'חלב טרי בשקית 1% שומן (רגיל)': { price: 5.89, updateDate: '01/05/2025' },
    'גבינה לבנה 5%': { price: 5.81, updateDate: '01/05/2025' },
    'שמנת חמוצה 15% שומן רגילה': { price: 2.81, updateDate: '01/05/2025' },
    'שמנת מתוקה 38% שומן': { price: 7.56, updateDate: '01/05/2025' },
    'אשל 4.5% שומן': { price: 1.97, updateDate: '01/05/2025' },
    'גיל 3% שומן': { price: 1.76, updateDate: '01/05/2025' },
    'ביצי מאכל - גודל גדול (L)': { price: 14.12, updateDate: '01/11/2025' },
    'ביצי מאכל - גודל מדיום (M)': { price: 13.11, updateDate: '01/11/2025' },
    'ביצי מאכל- גודל ענק (XL)': { price: 15.35, updateDate: '01/11/2025' },
    'לחם אחיד (כהה)': { price: 7.36, updateDate: '01/01/2025' },
    'לחם אחיד (כהה) פרוס וארוז': { price: 8.38, updateDate: '01/01/2025' },
    'לחם לבן': { price: 7.36, updateDate: '01/01/2025' },
    'לחם לבן פרוס וארוז': { price: 6.41, updateDate: '01/01/2025' },
    'חלה או מאפה שמרים': { price: 6.62, updateDate: '01/01/2025' },
    'מלח מטבח רגיל, מלח מטבח מעולה': { price: 2.09, updateDate: '01/01/2025' },
    'מלח שולחן מעולה ומלח שולחן מעולה גס': { price: 2.09, updateDate: '01/01/2025' },
};

// Regex matchers for fuzzy-matching Supabase product names to regulated products
// Used by avgprices to cap prices for products in the database
const REGULATED_MATCHERS = [
    {
        govName: 'שמנת חמוצה 15% שומן רגילה',
        match: (name) => /שמנת/.test(name) && /חמוצה/.test(name) &&
            !/מתוקה/.test(name) && !/להקצפה/.test(name) && !/לקצפת/.test(name) &&
            !/500/.test(name) && !/ליטר/.test(name),
    },
    {
        govName: 'שמנת מתוקה 38% שומן',
        match: (name) => /שמנת/.test(name) && /מתוקה/.test(name) &&
            !/500/.test(name) && !/ליטר/.test(name),
    },
    {
        govName: 'חלב טרי בקרטון 3% שומן (רגיל)',
        match: (name) => /חלב/.test(name) && !/(שקית|1%|שוקו|סויה|שקדים|קוקוס|עזים|אורז)/.test(name),
    },
    {
        govName: 'חלב טרי בקרטון 1% שומן (רגיל)',
        match: (name) => /חלב/.test(name) && /1%/.test(name) && !/שקית/.test(name) &&
            !/(שוקו|סויה|שקדים|קוקוס|עזים|אורז)/.test(name),
    },
    {
        govName: 'חלב טרי בשקית 3% שומן (רגיל)',
        match: (name) => /חלב/.test(name) && /שקית/.test(name) && !/1%/.test(name),
    },
    {
        govName: 'חלב טרי בשקית 1% שומן (רגיל)',
        match: (name) => /חלב/.test(name) && /שקית/.test(name) && /1%/.test(name),
    },
    {
        govName: 'גבינה לבנה 5%',
        match: (name) => /גבינה/.test(name) && /לבנה/.test(name) && /5%/.test(name),
    },
    {
        govName: 'ביצי מאכל - גודל גדול (L)',
        match: (name) => (/ביצים/.test(name) || /ביצי/.test(name)) &&
            (/\bL\b/.test(name) || /גדול/.test(name)) && !/30/.test(name),
    },
    {
        govName: 'ביצי מאכל - גודל מדיום (M)',
        match: (name) => (/ביצים/.test(name) || /ביצי/.test(name)) &&
            (/\bM\b/.test(name) || /מדיום/.test(name)) && !/30/.test(name),
    },
    {
        govName: 'ביצי מאכל- גודל ענק (XL)',
        match: (name) => (/ביצים/.test(name) || /ביצי/.test(name)) &&
            (/XL/.test(name) || /ענק/.test(name)) && !/30/.test(name),
    },
    // 30-egg trays - proportional price (x2.5 of 12-egg regulated price)
    {
        govName: 'ביצי מאכל - גודל גדול (L)',
        factor: 30 / 12,
        match: (name) => (/ביצים/.test(name) || /ביצי/.test(name)) &&
            (/\bL\b/.test(name) || /גדול/.test(name)) && /30/.test(name),
    },
    {
        govName: 'ביצי מאכל - גודל מדיום (M)',
        factor: 30 / 12,
        match: (name) => (/ביצים/.test(name) || /ביצי/.test(name)) &&
            (/\bM\b/.test(name) || /מדיום/.test(name)) && /30/.test(name),
    },
    {
        govName: 'ביצי מאכל- גודל ענק (XL)',
        factor: 30 / 12,
        match: (name) => (/ביצים/.test(name) || /ביצי/.test(name)) &&
            (/XL/.test(name) || /ענק/.test(name)) && /30/.test(name),
    },
    {
        govName: 'אשל 4.5% שומן',
        match: (name) => /אשל/.test(name) && /4\.?5/.test(name),
    },
    {
        govName: 'גיל 3% שומן',
        match: (name) => /\bגיל\b/.test(name) && /3%/.test(name),
    },
    {
        govName: 'חלה או מאפה שמרים',
        match: (name) => /\bחלה\b/.test(name) && !/מלאה/.test(name) && !/מתוקה/.test(name) && !/שוקולד/.test(name),
    },
    {
        govName: 'לחם אחיד (כהה)',
        match: (name) => /לחם/.test(name) && /אחיד/.test(name) && !/פרוס/.test(name),
    },
    {
        govName: 'לחם אחיד (כהה) פרוס וארוז',
        match: (name) => /לחם/.test(name) && /אחיד/.test(name) && /פרוס/.test(name),
    },
    {
        govName: 'לחם לבן',
        match: (name) => {
            if (!/\bלחם\b/.test(name)) return false;
            if (/פרוס|מלא|כהה|שיפון|כוסמין|דגנים|גלוטן|אחיד|חלה/.test(name)) return false;
            return /לבן/.test(name) || name.trim() === 'לחם';
        },
    },
    {
        govName: 'לחם לבן פרוס וארוז',
        match: (name) => /לחם/.test(name) && /פרוס/.test(name) && !/מלא/.test(name) && !/כהה/.test(name) && !/אחיד/.test(name),
    },
    {
        govName: 'מלח מטבח רגיל, מלח מטבח מעולה',
        match: (name) => /\bמלח\b/.test(name) && !/(ים|גס|מדיח|ברזל|לימון|הימלאיה)/.test(name),
    },
];

// Parse date in DD/MM/YYYY format from data.gov.il
function parseGovDate(dateStr) {
    if (!dateStr) return new Date(0);
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    return new Date(dateStr);
}

// Fetch all records from data.gov.il, return latest price per product
// Falls back to hardcoded prices if API is unavailable
async function fetchGovPrices() {
    try {
        const url = `${GOV_API_URL}?resource_id=${GOV_RESOURCE_ID}&limit=500`;
        const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (!response.ok) throw new Error(`data.gov.il API returned ${response.status}`);

        const data = await response.json();
        if (!data.success || !data.result?.records) {
            throw new Error('Invalid response from data.gov.il');
        }

        const records = data.result.records;

        // Group by product, keep only the latest record for each
        const latestByProduct = {};
        for (const record of records) {
            const product = record.product;
            const date = parseGovDate(record['update date']);
            const price = parseFloat(record['consumers price includes VAT']);

            if (isNaN(price) || price <= 0) continue;

            if (!latestByProduct[product] || date > latestByProduct[product].date) {
                latestByProduct[product] = {
                    date,
                    price,
                    updateDate: record['update date']
                };
            }
        }

        // Merge with fallbacks (API prices take priority)
        const merged = { ...FALLBACK_GOV_PRICES };
        for (const [product, data] of Object.entries(latestByProduct)) {
            merged[product] = data;
        }

        return merged;
    } catch (apiError) {
        console.warn(`⚠️ data.gov.il API failed: ${apiError.message}, using fallback prices`);
        // Return fallback prices with parsed dates
        const fallback = {};
        for (const [product, data] of Object.entries(FALLBACK_GOV_PRICES)) {
            fallback[product] = {
                ...data,
                date: parseGovDate(data.updateDate),
            };
        }
        return fallback;
    }
}

// Build regulated price map for app product names
function buildAppRegulatedPrices(govPrices) {
    const regulatedPrices = {};
    const govProducts = [];

    for (const [govName, data] of Object.entries(govPrices)) {
        const appNames = GOV_TO_APP_NAMES[govName] || [];

        govProducts.push({
            govName,
            price: data.price,
            updateDate: data.updateDate,
            mappedTo: appNames
        });

        for (const appName of appNames) {
            regulatedPrices[appName] = data.price;
        }
    }

    // Add proportional products (e.g. 30-egg trays derived from 12-egg regulated price)
    for (const [appName, config] of Object.entries(PROPORTIONAL_PRODUCTS)) {
        if (govPrices[config.govName]) {
            const basePrice = govPrices[config.govName].price;
            const proportionalPrice = Math.round(basePrice * config.factor * 100) / 100;
            regulatedPrices[appName] = proportionalPrice;
        }
    }

    return { regulatedPrices, govProducts };
}

// Match a product name against regulated product patterns
// Returns the gov price if matched (with proportional factor applied), null otherwise
function matchRegulatedPrice(productName, govPrices) {
    for (const matcher of REGULATED_MATCHERS) {
        if (matcher.match(productName) && govPrices[matcher.govName]) {
            const basePrice = govPrices[matcher.govName].price;
            const factor = matcher.factor || 1;
            return Math.round(basePrice * factor * 100) / 100;
        }
    }
    return null;
}

module.exports = {
    GOV_TO_APP_NAMES,
    REGULATED_MATCHERS,
    fetchGovPrices,
    buildAppRegulatedPrices,
    matchRegulatedPrice,
};
