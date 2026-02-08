// ListNest Price Comparison API - Connected to Supabase
// Vercel Serverless Function

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

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

            productPrices.forEach(pp => {
                const totalPrice = pp.price * quantity;
                chainTotals[pp.chain_id] += totalPrice;
                chainItems[pp.chain_id].push({
                    name: product.name,
                    quantity,
                    price: pp.price,
                    total: totalPrice
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
                const products = await supabaseQuery('products');
                return res.json({ success: true, products });

            case 'suggest':
                // Return product suggestions based on search query with scoring
                const query = (req.query.q || '').toLowerCase().trim();
                if (!query || query.length < 2) {
                    return res.json({ success: true, suggestions: [] });
                }
                const allProducts = await supabaseQuery('products', '', true);
                const queryWords = query.split(' ').filter(w => w.length > 1);

                const scoredProducts = allProducts.map(p => {
                    const name = p.name.toLowerCase();
                    const nameWords = name.split(' ').filter(w => w.length > 1);
                    let score = 0;

                    // Exact match
                    if (name === query) score = 1000;
                    // Name contains full query
                    else if (name.includes(query)) score = 500;
                    // Query contains full name
                    else if (query.includes(name)) score = 400;
                    else {
                        // Count exact word matches
                        let exactMatches = 0;
                        let startsWithMatches = 0;
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
                        }

                        // Score: exact matches are worth more
                        score = (exactMatches * 100) + (startsWithMatches * 30);
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

                // Calculate average price per product
                const priceMap = {};
                pricesForAvg.forEach(p => {
                    if (!priceMap[p.product_id]) {
                        priceMap[p.product_id] = { total: 0, count: 0 };
                    }
                    priceMap[p.product_id].total += p.price;
                    priceMap[p.product_id].count++;
                });

                const productPrices = {};
                productsForAvg.forEach(p => {
                    if (priceMap[p.id]) {
                        productPrices[p.name] = Math.round((priceMap[p.id].total / priceMap[p.id].count) * 100) / 100;
                    }
                });

                return res.json({
                    success: true,
                    prices: productPrices,
                    totalProducts: Object.keys(productPrices).length,
                    lastUpdated: new Date().toISOString()
                });

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
