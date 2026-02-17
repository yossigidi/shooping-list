// ListNest Regulated Prices API
// Fetches government-controlled prices from data.gov.il
// Called daily via cron (8:00 AM) and available as direct endpoint

const { fetchGovPrices, buildAppRegulatedPrices } = require('./_lib/gov-prices');

module.exports = async (req, res) => {
    // CORS headers
    const origin = req.headers.origin;
    if (origin?.includes('vercel.app') || origin?.includes('listnest.co.il') || origin?.includes('localhost')) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const govPrices = await fetchGovPrices();
        const { regulatedPrices, govProducts } = buildAppRegulatedPrices(govPrices);

        console.log(`✅ Fetched ${govProducts.length} regulated products from data.gov.il, mapped to ${Object.keys(regulatedPrices).length} app names`);

        return res.json({
            success: true,
            regulatedPrices,
            govProducts,
            totalGovProducts: govProducts.length,
            totalMappings: Object.keys(regulatedPrices).length,
            source: 'data.gov.il',
            lastFetched: new Date().toISOString()
        });
    } catch (error) {
        console.error('Regulated prices error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
