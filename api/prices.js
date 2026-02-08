// ListNest Price Comparison API - Connected to Supabase
// Vercel Serverless Function

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Fetch from Supabase
async function supabaseQuery(table, query = '') {
    const url = `${SUPABASE_URL}/rest/v1/${table}${query}`;
    const response = await fetch(url, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
        }
    });
    return response.json();
}

// Get all data
async function getAllData() {
    const [products, prices, chains] = await Promise.all([
        supabaseQuery('products'),
        supabaseQuery('prices'),
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
        const searchTerm = item.name.toLowerCase();
        const quantity = item.quantity || 1;

        // Find matching product
        const product = products.find(p =>
            p.name.toLowerCase().includes(searchTerm) ||
            searchTerm.includes(p.name.toLowerCase())
        );

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
