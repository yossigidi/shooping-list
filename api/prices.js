// ListNest Price Comparison API - Connected to Supabase
// Vercel Serverless Function

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Hebrew synonym dictionary for better product matching
const HEBREW_SYNONYMS = {
    // משקאות
    'קולה': ['קוקה קולה', 'קוקה-קולה', 'coca cola', 'coca-cola', 'קוקה'],
    'קוקה קולה': ['קולה', 'קוקה-קולה', 'coca cola', 'קוקה'],
    'פפסי': ['pepsi', 'פפסי קולה'],
    'ספרייט': ['sprite', 'ספריט'],
    'פנטה': ['fanta', 'פאנטה'],
    'סודה': ['מים מוגזים', 'מוגזים'],
    'מים': ['מים מינרלים', 'מינרלים'],

    // חלב ומוצריו
    'חלב': ['חלב טרי', 'חלב תנובה'],
    'יוגורט': ['יוגורט טבעי', 'לבן'],
    'גבינה צהובה': ['גבינה', 'עמק', 'גאודה', 'צהובה'],
    'גבינה לבנה': ['גבינת שמנת', 'קוטג\'', 'קוטג'],
    'קוטג': ['קוטג\'', 'גבינת קוטג', 'cottage'],

    // לחם ומאפים
    'לחם': ['לחם פרוס', 'לחם אחיד'],
    'פיתה': ['פיתות', 'לחם פיתה'],
    'חלה': ['חלות', 'לחם חלה'],
    'באגט': ['לחם צרפתי', 'כיכר'],

    // ירקות
    'עגבניה': ['עגבניות', 'עגבנייה'],
    'מלפפון': ['מלפפונים', 'מפפון'],
    'גזר': ['גזרים'],
    'בצל': ['בצלים'],
    'תפוח אדמה': ['תפו"א', 'תפוא', 'תפוחי אדמה'],

    // פירות
    'תפוח': ['תפוחים', 'תפוח עץ'],
    'בננה': ['בננות'],
    'תפוז': ['תפוזים'],
    'לימון': ['לימונים'],

    // בשר
    'עוף': ['חזה עוף', 'כרעיים', 'שוקיים'],
    'בקר': ['בשר בקר', 'סטייק'],
    'טחון': ['בשר טחון'],

    // תינוקות - פורמולות
    'מטרנה': ['materna', 'מטרנא'],
    'סימילאק': ['similac', 'סימילק'],
    'נוטרילון': ['nutrilon', 'נוטרילן'],
    'חיתולים': ['חיתול', 'טיטולים', 'פמפרס', 'האגיס'],
    'מגבונים': ['מגבוני', 'מגבון'],

    // ניקיון
    'סבון': ['סבון כלים', 'נוזל כלים', 'פיירי'],
    'אקונומיקה': ['אקונומיקא', 'אקו'],
    'נייר טואלט': ['טואלט', 'נייר שירותים'],
};

// Expand search terms with synonyms
function expandWithSynonyms(searchTerm) {
    const terms = [searchTerm.toLowerCase()];
    const searchLower = searchTerm.toLowerCase();

    // Check each synonym group
    for (const [key, synonyms] of Object.entries(HEBREW_SYNONYMS)) {
        const keyLower = key.toLowerCase();
        // If search term matches the key or any synonym
        if (searchLower.includes(keyLower) || synonyms.some(s => searchLower.includes(s.toLowerCase()))) {
            // Add the key and all synonyms
            terms.push(keyLower);
            synonyms.forEach(s => terms.push(s.toLowerCase()));
        }
    }

    return [...new Set(terms)]; // Remove duplicates
}

// Maximum reasonable prices by category (sanity check)
const MAX_REASONABLE_PRICES = {
    'dairy': 50,
    'beverages': 60,
    'pantry': 50,
    'spreads': 50,
    'bread': 30,
    'snacks': 40,
    'spices': 35,
    'cleaning': 60,
    'frozen': 80,
    'meat': 200,
    'fish': 150,
    'default': 100
};

// Packaged product patterns (these are sold by unit, not weight)
const PACKAGED_PATTERNS = [
    /\d+\s*(גרם|גר\'|גר|g)/i,      // grams
    /\d+\s*(מ"ל|מ״ל|מל|ml)/i,      // milliliters
    /\d+\s*(ליטר|ל\'|l)/i,         // liters
    /\d+\s*(יח'|יח׳|יחידות)/i,     // units
    /\d+\s*(ק"ג|ק״ג|קג|kg)/i,      // kilograms (packaged)
    /שישיי[הת]/,                    // 6-pack
    /אריזת?/,                       // package
    /חבילה/,                        // bundle
    /פחית/,                         // can
    /בקבוק/,                        // bottle
];

// Check if product is packaged (sold by unit)
function isPackagedProduct(productName) {
    if (!productName) return false;
    return PACKAGED_PATTERNS.some(pattern => pattern.test(productName));
}

// Get reasonable max price for a product
function getMaxReasonablePrice(productName, category) {
    // Special cases for expensive items
    if (/אנטריקוט|סטייק|פילה בקר|סינטה/.test(productName)) return 200;
    if (/סלמון|לברק|דניס/.test(productName)) return 150;
    if (/שישיי[הת]/.test(productName)) return 60;

    return MAX_REASONABLE_PRICES[category] || MAX_REASONABLE_PRICES.default;
}

// Fetch from Supabase with pagination support
async function supabaseQuery(table, query = '', fetchAll = false) {
    const baseUrl = `${SUPABASE_URL}/rest/v1/${table}${query}`;

    if (!fetchAll) {
        const response = await fetch(baseUrl, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    }

    // Fetch all rows with pagination
    // Supabase REST API has a max of 1000 rows per request
    let allRows = [];
    let offset = 0;
    const batchSize = 1000;

    while (true) {
        const separator = query.includes('?') ? '&' : '?';
        const url = `${baseUrl}${separator}offset=${offset}&limit=${batchSize}`;
        const response = await fetch(url, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'count=exact'
            }
        });
        const rows = await response.json();
        if (!rows || rows.length === 0) break;
        allRows = allRows.concat(rows);
        if (rows.length < batchSize) break;
        offset += batchSize;
    }
    return allRows;
}

// Get all data (with pagination for prices)
async function getAllData() {
    const [products, prices, chains] = await Promise.all([
        supabaseQuery('products', '', true),  // fetchAll
        supabaseQuery('prices', '', true),     // fetchAll
        supabaseQuery('chains', '?is_active=eq.true')
    ]);
    return { products, prices, chains };
}

// Compare shopping list across chains
async function compareList(items) {
    const { products, prices, chains } = await getAllData();

    const chainTotals = {};
    const chainItems = {};

    // Initialize chains
    chains.forEach(chain => {
        chainTotals[chain.id] = 0;
        chainItems[chain.id] = [];
    });

    // Process each item
    for (const item of items) {
        const searchTerm = item.name.toLowerCase().trim();
        const quantity = item.quantity || 1;

        // Find BEST matching product using scoring
        const searchWords = searchTerm.split(' ').filter(w => w.length > 1);

        let bestMatch = null;
        let bestScore = 0;

        for (const p of products) {
            const productName = p.name.toLowerCase();
            const productWords = productName.split(' ').filter(w => w.length > 1);
            let score = 0;

            // Exact match - highest score
            if (productName === searchTerm) {
                score = 1000;
            }
            // Product name contains full search term
            else if (productName.includes(searchTerm)) {
                score = 500;
            }
            // Search term contains full product name
            else if (searchTerm.includes(productName)) {
                score = 400;
            }
            else {
                // Count EXACT word matches only (no partial matches)
                let exactMatches = 0;
                let matchedSearchWords = new Set();

                for (const sw of searchWords) {
                    for (const pw of productWords) {
                        if (pw === sw) {
                            exactMatches += 1;
                            matchedSearchWords.add(sw);
                        }
                    }
                }

                // Score based on how many search words matched exactly
                if (exactMatches > 0) {
                    // Base score: 50 per exact word match
                    score = exactMatches * 50;
                    // Bonus for matching higher percentage of search words
                    const matchPercentage = matchedSearchWords.size / searchWords.length;
                    score *= (1 + matchPercentage);
                    // Bonus if all search words matched
                    if (matchedSearchWords.size === searchWords.length) {
                        score += 100;
                    }
                }
            }

            if (score > bestScore) {
                bestScore = score;
                bestMatch = p;
            }
        }

        const product = bestScore > 0 ? bestMatch : null;

        if (product) {
            const productPrices = prices.filter(p => p.product_id === product.id);

            // Calculate median price to detect outliers
            const allPrices = productPrices.map(pp => pp.price).sort((a, b) => a - b);
            const medianPrice = allPrices.length > 0
                ? allPrices[Math.floor(allPrices.length / 2)]
                : 0;

            productPrices.forEach(pp => {
                let priceToUse = pp.price;

                // Skip prices that are clearly errors:
                // - Under 1₪ or over 500₪
                // - More than 5x or less than 0.2x the median (outliers)
                if (priceToUse < 1 || priceToUse > 500) {
                    return;
                }
                if (medianPrice > 0 && (priceToUse > medianPrice * 5 || priceToUse < medianPrice * 0.2)) {
                    return; // Skip outlier
                }

                const totalPrice = priceToUse * quantity;
                chainTotals[pp.chain_id] += totalPrice;
                chainItems[pp.chain_id].push({
                    name: product.name,
                    quantity,
                    price: priceToUse,
                    total: Math.round(totalPrice * 100) / 100
                });
            });
        }
    }

    // Build result
    const result = chains.map(chain => ({
        id: chain.id,
        name: chain.name,
        name_he: chain.name_he,
        total: Math.round(chainTotals[chain.id] * 100) / 100,
        items: chainItems[chain.id],
        itemsFound: chainItems[chain.id].length
    })).filter(c => c.total > 0).sort((a, b) => a.total - b.total);

    return {
        chains: result,
        cheapest: result[0] || null,
        mostExpensive: result[result.length - 1] || null,
        savings: result.length > 1 ?
            Math.round((result[result.length - 1].total - result[0].total) * 100) / 100 : 0
    };
}

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Check Supabase config
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return res.status(500).json({
            error: 'Supabase not configured',
            message: 'Set SUPABASE_URL and SUPABASE_KEY in Vercel'
        });
    }

    const { action } = req.query;

    try {
        switch (action) {
            case 'chains':
                const chains = await supabaseQuery('chains', '?is_active=eq.true');
                return res.json({ success: true, chains });

            case 'products':
                const products = await supabaseQuery('products', '', true);
                return res.json({ success: true, products, total: products.length });

            case 'suggest':
                // Return product suggestions based on search query with scoring
                const query = (req.query.q || '').toLowerCase().trim();
                if (!query || query.length < 2) {
                    return res.json({ success: true, suggestions: [] });
                }
                const allProducts = await supabaseQuery('products', '', true);
                const queryWords = query.split(' ').filter(w => w.length > 1);

                // Expand query with synonyms for better matching
                const expandedTerms = expandWithSynonyms(query);

                const scoredProducts = allProducts.map(p => {
                    const name = p.name.toLowerCase();
                    const nameWords = name.split(' ').filter(w => w.length > 1);
                    let score = 0;

                    // Check against original query and all synonyms
                    for (const searchTerm of expandedTerms) {
                        // Exact match - highest priority
                        if (name === searchTerm) {
                            score = Math.max(score, 1000);
                        }
                        // Name contains full search term
                        else if (name.includes(searchTerm)) {
                            score = Math.max(score, searchTerm === query ? 500 : 450);
                        }
                        // Search term contains full name
                        else if (searchTerm.includes(name)) {
                            score = Math.max(score, searchTerm === query ? 400 : 350);
                        }
                    }

                    // If no direct match, try word-by-word
                    if (score === 0) {
                        // Count exact word matches
                        let exactMatches = 0;
                        let startsWithMatches = 0;
                        let synonymMatches = 0;
                        let matchedQueryWords = new Set();

                        for (const qw of queryWords) {
                            for (const nw of nameWords) {
                                if (nw === qw) {
                                    exactMatches++;
                                    matchedQueryWords.add(qw);
                                } else if (nw.startsWith(qw) && qw.length >= 3) {
                                    startsWithMatches++;
                                    matchedQueryWords.add(qw);
                                }
                            }
                            // Check synonym matches
                            for (const synTerm of expandedTerms) {
                                if (synTerm !== query && name.includes(synTerm)) {
                                    synonymMatches++;
                                }
                            }
                        }

                        // Score: exact matches > synonyms > startsWith
                        score = (exactMatches * 100) + (synonymMatches * 70) + (startsWithMatches * 30);
                        // Bonus for matching more query words
                        if (matchedQueryWords.size > 0) {
                            score *= (1 + matchedQueryWords.size / queryWords.length);
                        }
                    }
                    return { ...p, score };
                }).filter(p => p.score > 0)
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 10)
                  .map(p => ({ id: p.id, name: p.name, category: p.category }));

                // Get average prices for suggestions
                const allPricesForSuggest = await supabaseQuery('prices', '', true);
                const priceMapForSuggest = {};
                allPricesForSuggest.forEach(p => {
                    if (!priceMapForSuggest[p.product_id]) {
                        priceMapForSuggest[p.product_id] = { total: 0, count: 0 };
                    }
                    priceMapForSuggest[p.product_id].total += p.price;
                    priceMapForSuggest[p.product_id].count++;
                });

                const suggestionsWithPrices = scoredProducts.map(p => ({
                    ...p,
                    avgPrice: priceMapForSuggest[p.id]
                        ? Math.round((priceMapForSuggest[p.id].total / priceMapForSuggest[p.id].count) * 100) / 100
                        : null
                }));

                return res.json({ success: true, suggestions: suggestionsWithPrices });

            case 'avgprices':
                // Return average prices for all products
                const productsForAvg = await supabaseQuery('products', '', true);
                const pricesForAvg = await supabaseQuery('prices', '', true);

                // Create product lookup for category info
                const productLookup = {};
                productsForAvg.forEach(p => {
                    productLookup[p.id] = p;
                });

                // Collect all prices per product
                const priceMap = {};
                pricesForAvg.forEach(p => {
                    const product = productLookup[p.product_id];
                    if (!product) return;

                    // Skip prices under 1₪ or over 500₪ (likely data errors)
                    if (p.price < 1 || p.price > 500) {
                        return;
                    }

                    if (!priceMap[p.product_id]) {
                        priceMap[p.product_id] = [];
                    }
                    priceMap[p.product_id].push(p.price);
                });

                // Calculate MEDIAN price (more robust than average against outliers)
                const productPrices = {};
                productsForAvg.forEach(p => {
                    if (priceMap[p.id] && priceMap[p.id].length > 0) {
                        const prices = priceMap[p.id].sort((a, b) => a - b);
                        const median = prices[Math.floor(prices.length / 2)];

                        // Filter out extreme outliers (more than 3x or less than 0.33x median)
                        const validPrices = prices.filter(price =>
                            price >= median * 0.33 && price <= median * 3
                        );

                        if (validPrices.length > 0) {
                            const avg = validPrices.reduce((sum, pr) => sum + pr, 0) / validPrices.length;
                            productPrices[p.name] = Math.round(avg * 100) / 100;
                        }
                    }
                });

                return res.json({
                    success: true,
                    prices: productPrices,
                    totalProducts: Object.keys(productPrices).length,
                    lastUpdated: new Date().toISOString()
                });

            case 'promotions':
                // Get all active promotions
                const promotions = await supabaseQuery('promotions', '', true);
                const chainsForPromos = await supabaseQuery('chains', '?is_active=eq.true');
                const productsForPromos = await supabaseQuery('products', '', true);

                // Create chain lookup
                const chainLookup = {};
                chainsForPromos.forEach(c => {
                    chainLookup[c.id] = { name: c.name, name_he: c.name_he };
                });

                // Create product lookup
                const promoProductLookup = {};
                productsForPromos.forEach(p => {
                    promoProductLookup[p.id] = { name: p.name, category: p.category };
                });

                // Filter active promotions (end_date >= today)
                const today = new Date().toISOString().split('T')[0];
                const activePromos = promotions.filter(p => {
                    if (!p.end_date) return true;
                    return p.end_date >= today;
                });

                // Enhance with chain and product names
                const enhancedPromos = activePromos.map(p => ({
                    id: p.id,
                    chain_id: p.chain_id,
                    chain_name: chainLookup[p.chain_id]?.name_he || chainLookup[p.chain_id]?.name,
                    description: p.description,
                    start_date: p.start_date,
                    end_date: p.end_date,
                    discount_type: p.discount_type,
                    discount_rate: p.discount_rate,
                    min_qty: p.min_qty,
                    products: (p.product_ids || []).map(pid => promoProductLookup[pid]).filter(Boolean)
                }));

                // Group by chain
                const promosByChain = {};
                chainsForPromos.forEach(c => {
                    promosByChain[c.id] = {
                        chain_id: c.id,
                        chain_name: c.name,
                        chain_name_he: c.name_he,
                        promotions: []
                    };
                });
                enhancedPromos.forEach(p => {
                    if (promosByChain[p.chain_id]) {
                        promosByChain[p.chain_id].promotions.push(p);
                    }
                });

                return res.json({
                    success: true,
                    total: enhancedPromos.length,
                    promotions: enhancedPromos,
                    byChain: Object.values(promosByChain).filter(c => c.promotions.length > 0),
                    lastUpdated: new Date().toISOString()
                });

            case 'productPromos':
                // Get promotions for specific products (by name search)
                const productName = (req.query.name || '').toLowerCase().trim();
                if (!productName) {
                    return res.json({ success: true, promotions: [] });
                }

                const allPromos = await supabaseQuery('promotions', '', true);
                const allProds = await supabaseQuery('products', '', true);
                const allChains = await supabaseQuery('chains', '?is_active=eq.true');

                // Find matching product IDs
                const matchingProducts = allProds.filter(p =>
                    p.name.toLowerCase().includes(productName)
                );
                const matchingProductIds = new Set(matchingProducts.map(p => p.id));

                // Find promotions that include these products
                const matchingPromos = allPromos.filter(promo => {
                    if (!promo.product_ids) return false;
                    return promo.product_ids.some(pid => matchingProductIds.has(pid));
                });

                // Create lookups
                const chainMap = {};
                allChains.forEach(c => { chainMap[c.id] = c; });
                const prodMap = {};
                allProds.forEach(p => { prodMap[p.id] = p; });

                const result = matchingPromos.map(p => ({
                    chain_name: chainMap[p.chain_id]?.name_he || chainMap[p.chain_id]?.name,
                    description: p.description,
                    end_date: p.end_date,
                    products: (p.product_ids || [])
                        .filter(pid => matchingProductIds.has(pid))
                        .map(pid => prodMap[pid]?.name)
                        .filter(Boolean)
                }));

                return res.json({ success: true, promotions: result });

            case 'debug':
                const debugData = await getAllData();
                return res.json({
                    success: true,
                    counts: {
                        products: debugData.products.length,
                        prices: debugData.prices.length,
                        chains: debugData.chains.length
                    },
                    samplePrices: debugData.prices.slice(-10),
                    maxPriceId: Math.max(...debugData.prices.map(p => p.id))
                });

            case 'compare':
                if (req.method !== 'POST') {
                    return res.status(405).json({ error: 'Use POST for compare' });
                }
                const { items } = req.body;
                if (!items || !Array.isArray(items)) {
                    return res.status(400).json({ error: 'Missing items array' });
                }
                const comparison = await compareList(items);
                return res.json({ success: true, ...comparison });

            default:
                return res.json({
                    success: true,
                    message: 'ListNest Price API - Supabase',
                    endpoints: {
                        'GET ?action=chains': 'Get all chains',
                        'GET ?action=products': 'Get all products',
                        'POST ?action=compare': 'Compare shopping list'
                    }
                });
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message });
    }
};
