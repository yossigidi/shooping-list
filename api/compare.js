// ListNest Price Comparison API - Vercel Serverless
// Uses estimated prices + links to real supermarket sites

// Comprehensive Israeli product price database (estimated averages)
const PRICE_DATABASE = {
    // חלב ומוצרי חלב
    'חלב': { shufersal: 6.90, rami_levy: 6.50, victory: 6.70, ybitan: 6.80, hatzi_hinam: 6.40 },
    'חלב 3%': { shufersal: 6.90, rami_levy: 6.50, victory: 6.70, ybitan: 6.80, hatzi_hinam: 6.40 },
    'חלב 1%': { shufersal: 6.70, rami_levy: 6.30, victory: 6.50, ybitan: 6.60, hatzi_hinam: 6.20 },
    'גבינה צהובה': { shufersal: 32.90, rami_levy: 29.90, victory: 31.90, ybitan: 33.90, hatzi_hinam: 28.90 },
    'גבינה לבנה': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 8.90, hatzi_hinam: 7.50 },
    'קוטג\'': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 9.90, hatzi_hinam: 8.50 },
    'שמנת': { shufersal: 7.90, rami_levy: 6.90, victory: 7.50, ybitan: 7.90, hatzi_hinam: 6.50 },
    'חמאה': { shufersal: 12.90, rami_levy: 11.90, victory: 12.50, ybitan: 12.90, hatzi_hinam: 11.50 },
    'יוגורט': { shufersal: 5.90, rami_levy: 4.90, victory: 5.50, ybitan: 5.90, hatzi_hinam: 4.50 },
    'ביצים': { shufersal: 28.90, rami_levy: 26.90, victory: 27.90, ybitan: 29.90, hatzi_hinam: 25.90 },
    'ביצים L': { shufersal: 28.90, rami_levy: 26.90, victory: 27.90, ybitan: 29.90, hatzi_hinam: 25.90 },
    'ביצים XL': { shufersal: 32.90, rami_levy: 30.90, victory: 31.90, ybitan: 33.90, hatzi_hinam: 29.90 },

    // לחם ומאפים
    'לחם': { shufersal: 8.90, rami_levy: 7.90, victory: 8.50, ybitan: 8.90, hatzi_hinam: 7.50 },
    'לחם אחיד': { shufersal: 5.90, rami_levy: 5.90, victory: 5.90, ybitan: 5.90, hatzi_hinam: 5.90 },
    'לחם פרוס': { shufersal: 9.90, rami_levy: 8.90, victory: 9.50, ybitan: 9.90, hatzi_hinam: 8.50 },
    'חלה': { shufersal: 12.90, rami_levy: 10.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 10.50 },
    'פיתה': { shufersal: 7.90, rami_levy: 6.90, victory: 7.50, ybitan: 7.90, hatzi_hinam: 6.50 },
    'לחמניות': { shufersal: 14.90, rami_levy: 12.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 12.50 },
    'קרואסון': { shufersal: 5.90, rami_levy: 4.90, victory: 5.50, ybitan: 5.90, hatzi_hinam: 4.50 },
    'עוגיות': { shufersal: 15.90, rami_levy: 13.90, victory: 14.90, ybitan: 15.90, hatzi_hinam: 13.50 },

    // פירות וירקות
    'תפוח': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'תפוחים': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'בננה': { shufersal: 7.90, rami_levy: 5.90, victory: 6.90, ybitan: 7.90, hatzi_hinam: 5.50 },
    'בננות': { shufersal: 7.90, rami_levy: 5.90, victory: 6.90, ybitan: 7.90, hatzi_hinam: 5.50 },
    'תפוז': { shufersal: 6.90, rami_levy: 4.90, victory: 5.90, ybitan: 6.90, hatzi_hinam: 4.50 },
    'תפוזים': { shufersal: 6.90, rami_levy: 4.90, victory: 5.90, ybitan: 6.90, hatzi_hinam: 4.50 },
    'לימון': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'אבוקדו': { shufersal: 12.90, rami_levy: 9.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 9.50 },
    'עגבניה': { shufersal: 8.90, rami_levy: 6.90, victory: 7.90, ybitan: 8.90, hatzi_hinam: 6.50 },
    'עגבניות': { shufersal: 8.90, rami_levy: 6.90, victory: 7.90, ybitan: 8.90, hatzi_hinam: 6.50 },
    'מלפפון': { shufersal: 6.90, rami_levy: 4.90, victory: 5.90, ybitan: 6.90, hatzi_hinam: 4.50 },
    'מלפפונים': { shufersal: 6.90, rami_levy: 4.90, victory: 5.90, ybitan: 6.90, hatzi_hinam: 4.50 },
    'בצל': { shufersal: 5.90, rami_levy: 3.90, victory: 4.90, ybitan: 5.90, hatzi_hinam: 3.50 },
    'שום': { shufersal: 19.90, rami_levy: 14.90, victory: 17.90, ybitan: 19.90, hatzi_hinam: 14.50 },
    'תפוח אדמה': { shufersal: 6.90, rami_levy: 4.90, victory: 5.90, ybitan: 6.90, hatzi_hinam: 4.50 },
    'גזר': { shufersal: 5.90, rami_levy: 3.90, victory: 4.90, ybitan: 5.90, hatzi_hinam: 3.50 },
    'פלפל': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.50 },
    'חסה': { shufersal: 7.90, rami_levy: 5.90, victory: 6.90, ybitan: 7.90, hatzi_hinam: 5.50 },
    'כרוב': { shufersal: 4.90, rami_levy: 2.90, victory: 3.90, ybitan: 4.90, hatzi_hinam: 2.50 },
    'ברוקולי': { shufersal: 12.90, rami_levy: 9.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 9.50 },

    // בשר ועוף
    'עוף': { shufersal: 32.90, rami_levy: 27.90, victory: 29.90, ybitan: 32.90, hatzi_hinam: 26.90 },
    'חזה עוף': { shufersal: 42.90, rami_levy: 37.90, victory: 39.90, ybitan: 42.90, hatzi_hinam: 36.90 },
    'כנפיים': { shufersal: 24.90, rami_levy: 19.90, victory: 22.90, ybitan: 24.90, hatzi_hinam: 19.50 },
    'שוקיים': { shufersal: 28.90, rami_levy: 24.90, victory: 26.90, ybitan: 28.90, hatzi_hinam: 24.50 },
    'בשר טחון': { shufersal: 54.90, rami_levy: 49.90, victory: 52.90, ybitan: 54.90, hatzi_hinam: 48.90 },
    'סטייק': { shufersal: 89.90, rami_levy: 79.90, victory: 84.90, ybitan: 89.90, hatzi_hinam: 78.90 },
    'נקניקיות': { shufersal: 29.90, rami_levy: 24.90, victory: 27.90, ybitan: 29.90, hatzi_hinam: 24.50 },
    'שניצל': { shufersal: 44.90, rami_levy: 39.90, victory: 42.90, ybitan: 44.90, hatzi_hinam: 38.90 },
    'המבורגר': { shufersal: 49.90, rami_levy: 44.90, victory: 47.90, ybitan: 49.90, hatzi_hinam: 43.90 },

    // דגים
    'סלמון': { shufersal: 89.90, rami_levy: 79.90, victory: 84.90, ybitan: 89.90, hatzi_hinam: 78.90 },
    'טונה': { shufersal: 12.90, rami_levy: 10.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 10.50 },
    'דג': { shufersal: 49.90, rami_levy: 44.90, victory: 47.90, ybitan: 49.90, hatzi_hinam: 43.90 },

    // מזון יבש
    'אורז': { shufersal: 12.90, rami_levy: 9.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 9.50 },
    'פסטה': { shufersal: 7.90, rami_levy: 5.90, victory: 6.90, ybitan: 7.90, hatzi_hinam: 5.50 },
    'קמח': { shufersal: 8.90, rami_levy: 6.90, victory: 7.90, ybitan: 8.90, hatzi_hinam: 6.50 },
    'סוכר': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'מלח': { shufersal: 4.90, rami_levy: 2.90, victory: 3.90, ybitan: 4.90, hatzi_hinam: 2.50 },
    'שמן': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.50 },
    'שמן זית': { shufersal: 39.90, rami_levy: 34.90, victory: 37.90, ybitan: 39.90, hatzi_hinam: 33.90 },
    'חומץ': { shufersal: 7.90, rami_levy: 5.90, victory: 6.90, ybitan: 7.90, hatzi_hinam: 5.50 },
    'קטשופ': { shufersal: 12.90, rami_levy: 9.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 9.50 },
    'מיונז': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.50 },
    'חרדל': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'דבש': { shufersal: 29.90, rami_levy: 24.90, victory: 27.90, ybitan: 29.90, hatzi_hinam: 24.50 },
    'ריבה': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.50 },
    'שוקולד': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'במבה': { shufersal: 7.90, rami_levy: 5.90, victory: 6.90, ybitan: 7.90, hatzi_hinam: 5.50 },
    'ביסלי': { shufersal: 7.90, rami_levy: 5.90, victory: 6.90, ybitan: 7.90, hatzi_hinam: 5.50 },

    // משקאות
    'מים': { shufersal: 5.90, rami_levy: 3.90, victory: 4.90, ybitan: 5.90, hatzi_hinam: 3.50 },
    'מים מינרליים': { shufersal: 5.90, rami_levy: 3.90, victory: 4.90, ybitan: 5.90, hatzi_hinam: 3.50 },
    'קולה': { shufersal: 8.90, rami_levy: 6.90, victory: 7.90, ybitan: 8.90, hatzi_hinam: 6.50 },
    'מיץ': { shufersal: 12.90, rami_levy: 9.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 9.50 },
    'מיץ תפוזים': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.50 },
    'בירה': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'יין': { shufersal: 39.90, rami_levy: 34.90, victory: 37.90, ybitan: 39.90, hatzi_hinam: 33.90 },
    'קפה': { shufersal: 24.90, rami_levy: 19.90, victory: 22.90, ybitan: 24.90, hatzi_hinam: 19.50 },
    'תה': { shufersal: 14.90, rami_levy: 11.90, victory: 13.90, ybitan: 14.90, hatzi_hinam: 11.50 },

    // ניקיון
    'סבון': { shufersal: 9.90, rami_levy: 7.90, victory: 8.90, ybitan: 9.90, hatzi_hinam: 7.50 },
    'שמפו': { shufersal: 19.90, rami_levy: 14.90, victory: 17.90, ybitan: 19.90, hatzi_hinam: 14.50 },
    'נייר טואלט': { shufersal: 34.90, rami_levy: 29.90, victory: 32.90, ybitan: 34.90, hatzi_hinam: 28.90 },
    'אבקת כביסה': { shufersal: 39.90, rami_levy: 34.90, victory: 37.90, ybitan: 39.90, hatzi_hinam: 33.90 },
    'נוזל כלים': { shufersal: 12.90, rami_levy: 9.90, victory: 11.90, ybitan: 12.90, hatzi_hinam: 9.50 },
};

// Chain information
const CHAINS = {
    shufersal: { name: 'שופרסל', color: '#dc2626', url: 'https://www.shufersal.co.il/online/he/search?text=' },
    rami_levy: { name: 'רמי לוי', color: '#2563eb', url: 'https://www.rami-levy.co.il/he/online/search?q=' },
    victory: { name: 'ויקטורי', color: '#ea580c', url: 'https://www.victoryonline.co.il/search?q=' },
    ybitan: { name: 'יינות ביתן', color: '#7c3aed', url: 'https://www.ybitan.co.il/search?q=' },
    hatzi_hinam: { name: 'חצי חינם', color: '#16a34a', url: 'https://shop.hazi-hinam.co.il/search?q=' },
};

// Find best matching product
function findProduct(name) {
    const normalizedName = name.trim().toLowerCase();

    // Exact match
    if (PRICE_DATABASE[name]) return { name, prices: PRICE_DATABASE[name] };

    // Partial match
    for (const [productName, prices] of Object.entries(PRICE_DATABASE)) {
        if (productName.includes(normalizedName) || normalizedName.includes(productName.toLowerCase())) {
            return { name: productName, prices };
        }
    }

    // Word match
    const words = normalizedName.split(/\s+/);
    for (const [productName, prices] of Object.entries(PRICE_DATABASE)) {
        for (const word of words) {
            if (word.length > 2 && productName.includes(word)) {
                return { name: productName, prices };
            }
        }
    }

    return null;
}

// Compare shopping list
function compareList(items) {
    const chainTotals = {};
    const chainItems = {};
    const notFound = [];

    // Initialize chains
    for (const chainId of Object.keys(CHAINS)) {
        chainTotals[chainId] = 0;
        chainItems[chainId] = [];
    }

    // Process each item
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

    // Build comparison array
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

    // Mark cheapest
    if (comparison.length > 0) {
        comparison[0].is_cheapest = true;
        const maxTotal = comparison[comparison.length - 1].total;
        comparison.forEach(c => {
            c.savings_vs_expensive = Math.round((maxTotal - c.total) * 100) / 100;
        });
    }

    return {
        comparison,
        cheapest_chain: comparison[0] || null,
        most_expensive_chain: comparison[comparison.length - 1] || null,
        potential_savings: comparison.length > 1
            ? Math.round((comparison[comparison.length - 1].total - comparison[0].total) * 100) / 100
            : 0,
        items_analyzed: items.length,
        items_found: items.length - notFound.length,
        items_not_found: notFound
    };
}

// Optimize basket - find cheapest price for each item
function optimizeBasket(items, maxChains = 2, strategy = 'optimal') {
    const chainBaskets = {};
    let total = 0;
    let singleChainTotal = Infinity;
    let cheapestSingleChain = '';

    // Calculate single chain totals first
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

    // Find cheapest single chain
    for (const [chainId, chainTotal] of Object.entries(singleChainTotals)) {
        if (chainTotal < singleChainTotal && chainTotal > 0) {
            singleChainTotal = chainTotal;
            cheapestSingleChain = chainId;
        }
    }

    if (strategy === 'single') {
        // Just use the cheapest single chain
        const chainId = cheapestSingleChain;
        const basket = { items: [], subtotal: 0, item_count: 0 };

        for (const item of items) {
            const product = findProduct(item.name);
            if (product && product.prices[chainId]) {
                const quantity = item.quantity || 1;
                const price = product.prices[chainId];
                basket.items.push({
                    name: item.name,
                    quantity,
                    price,
                    total: price * quantity
                });
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
                chain_name: CHAINS[chainId].name,
                chain_name_he: CHAINS[chainId].name,
                ...basket,
                subtotal: Math.round(basket.subtotal * 100) / 100
            }],
            single_chain_comparison: {
                cheapest: CHAINS[chainId].name,
                total: Math.round(singleChainTotal * 100) / 100
            }
        };
    }

    // Split strategy - find cheapest for each item
    for (const item of items) {
        const product = findProduct(item.name);
        if (product) {
            const quantity = item.quantity || 1;

            // Find cheapest chain for this product
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
                chainBaskets[cheapestChain].items.push({
                    name: item.name,
                    quantity,
                    price: cheapestPrice,
                    total: itemTotal
                });
                chainBaskets[cheapestChain].subtotal += itemTotal;
                chainBaskets[cheapestChain].item_count++;
                total += itemTotal;
            }
        }
    }

    // Convert to array and sort by subtotal
    let shoppingPlan = Object.values(chainBaskets)
        .map(b => ({ ...b, subtotal: Math.round(b.subtotal * 100) / 100 }))
        .sort((a, b) => b.subtotal - a.subtotal);

    // For optimal strategy, limit chains if needed
    if (strategy === 'optimal' && shoppingPlan.length > maxChains) {
        // Merge smaller baskets into larger ones
        const keptChains = shoppingPlan.slice(0, maxChains);
        const removedChains = shoppingPlan.slice(maxChains);

        for (const removed of removedChains) {
            // Add items to the first kept chain
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
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action } = req.query;

    try {
        // Health check
        if (action === 'health') {
            return res.status(200).json({ status: 'healthy', service: 'ListNest Price Comparison' });
        }

        // List comparison
        if (action === 'compare' && req.method === 'POST') {
            const { items } = req.body;
            if (!items || !Array.isArray(items)) {
                return res.status(400).json({ error: 'Items array required' });
            }
            const result = compareList(items);
            return res.status(200).json(result);
        }

        // Basket optimization
        if (action === 'optimize' && req.method === 'POST') {
            const { items, max_chains = 2, strategy = 'optimal' } = req.body;
            if (!items || !Array.isArray(items)) {
                return res.status(400).json({ error: 'Items array required' });
            }
            const result = optimizeBasket(items, max_chains, strategy);
            return res.status(200).json(result);
        }

        // Product search
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

                return res.status(200).json({
                    product: { name: product.name },
                    prices,
                    cheapest: prices[0] || null
                });
            }
            return res.status(404).json({ error: 'Product not found' });
        }

        // Get all chains
        if (action === 'chains') {
            const chains = Object.entries(CHAINS).map(([id, data]) => ({
                id,
                name: data.name,
                name_he: data.name,
                color: data.color
            }));
            return res.status(200).json(chains);
        }

        // Default - API info
        return res.status(200).json({
            name: 'ListNest Price Comparison API',
            version: '1.0.0',
            endpoints: {
                health: '/api/compare?action=health',
                chains: '/api/compare?action=chains',
                search: '/api/compare?action=search&q=<product>',
                compare: 'POST /api/compare?action=compare',
                optimize: 'POST /api/compare?action=optimize'
            }
        });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
