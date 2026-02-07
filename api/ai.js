// ListNest Smart Add - Using Groq AI (FREE tier - 14,400 requests/day)
// Vercel Serverless Function

// Hebrew category detection for parsed items
const CATEGORY_KEYWORDS = {
    'fruits': ['תפוח', 'בננה', 'תפוז', 'אבטיח', 'מלון', 'ענב', 'אגס', 'שזיף', 'אפרסק', 'נקטרינה', 'מנגו', 'אננס', 'קיווי', 'רימון', 'תות', 'אוכמניות', 'פטל', 'לימון', 'אשכולית', 'קלמנטינה', 'פומלה', 'תמר', 'תאנה', 'משמש', 'דובדבן', 'פירות', 'תפוזים', 'בננות', 'תפוחים', 'ענבים'],
    'vegetables': ['עגבניה', 'עגבניות', 'מלפפון', 'מלפפונים', 'גזר', 'בצל', 'תפוח אדמה', 'תפוחי אדמה', 'פלפל', 'חסה', 'כרוב', 'ברוקולי', 'כרובית', 'חציל', 'חצילים', 'קישוא', 'קישואים', 'סלרי', 'פטרוזיליה', 'כוסברה', 'נענע', 'בזיליקום', 'שום', 'זנגביל', 'ירקות', 'סלט', 'ירק', 'תרד', 'מנגולד', 'קייל', 'רוקט', 'עלי', 'דלעת', 'בטטה', 'שעועית', 'אפונה', 'תירס', 'פטריות', 'אבוקדו'],
    'dairy': ['חלב', 'גבינה', 'יוגורט', 'קוטג', 'שמנת', 'חמאה', 'ביצים', 'ביצה', 'קשקבל', 'גאודה', 'עמק', 'בולגרית', 'צפתית', 'פטה', 'מוצרלה', 'פרמזן', 'לבן', 'אשל', 'מעדן', 'פודינג', 'דנונה', 'אקטיביה', 'מילקי', 'גבינת', 'שמנת חמוצה'],
    'meat': ['עוף', 'בקר', 'טחון', 'שניצל', 'סטייק', 'נקניק', 'נקניקיות', 'נקניקיה', 'קבב', 'המבורגר', 'כבד', 'כנפיים', 'שוקיים', 'חזה עוף', 'חזה', 'פרגית', 'אנטריקוט', 'סינטה', 'צלעות', 'פילה', 'בשר', 'כרעיים', 'שוק', 'בשר טחון'],
    'fish': ['דג', 'דגים', 'סלמון', 'טונה', 'אמנון', 'דניס', 'לוקוס', 'מוסר', 'קרפיון', 'בורי', 'סרדין', 'מקרל', 'נסיכה', 'קוד', 'פילה דג'],
    'bread': ['לחם', 'פיתה', 'פיתות', 'באגט', 'לחמניה', 'לחמניות', 'חלה', 'טורטיה', 'קרואסון', 'לפה', 'פוקצ\'ה', 'פרוסות', 'לחם אחיד', 'לחם לבן', 'לחם מלא'],
    'pantry': ['אורז', 'פסטה', 'קמח', 'סוכר', 'מלח', 'שמן', 'שמן זית', 'חומוס', 'טחינה', 'עדשים', 'שעועית', 'גרגירי חומוס', 'קוסקוס', 'בורגול', 'קינואה', 'שיבולת שועל', 'קורנפלקס', 'גרנולה', 'דגני בוקר', 'דבש', 'ריבה', 'שוקולד', 'ממרח', 'חמאת בוטנים', 'סילאן', 'מייפל', 'רסק עגבניות', 'קטשופ', 'מיונז', 'חרדל'],
    'drinks': ['מים', 'מיץ', 'קולה', 'סודה', 'בירה', 'יין', 'קפה', 'תה', 'חלב שוקו', 'לימונדה', 'משקה אנרגיה', 'מינרלים', 'פפסי', 'ספרייט', 'פנטה', 'שוופס', 'מיץ תפוזים', 'מיץ תפוחים'],
    'frozen': ['גלידה', 'פיצה קפואה', 'פיצה', 'שניצל קפוא', 'ירקות קפואים', 'בצק עלים', 'בורקס', 'קפוא', 'מאפה', 'שניצלים'],
    'snacks': ['חטיף', 'ביסלי', 'במבה', 'צ\'יפס', 'קרקר', 'עוגיות', 'שוקולד', 'סוכריות', 'וופלים', 'פופקורן', 'בוטנים', 'שקדים', 'אגוזים', 'חטיפים', 'קרקרים'],
    'cleaning': ['סבון', 'שמפו', 'מרכך', 'אקונומיקה', 'נייר טואלט', 'מגבונים', 'סבון כלים', 'אבקת כביסה', 'מרכך כביסה', 'ספוג', 'מברשת', 'שקיות אשפה', 'נוזל כלים', 'נוזל רצפה'],
    'baby': ['טיטולים', 'מטרנה', 'סימילאק', 'מגבונים לתינוק', 'בקבוק', 'מוצץ', 'חיתולים']
};

// Common Hebrew product aliases and corrections
const PRODUCT_ALIASES = {
    'חלב': 'חלב',
    'חלב תנובה': 'חלב',
    'ביצים': 'ביצים',
    'ביצה': 'ביצים',
    'תפו"א': 'תפוחי אדמה',
    'תפוא': 'תפוחי אדמה',
    'עגבניה': 'עגבניות',
    'מלפפון': 'מלפפונים',
    'לחם': 'לחם',
    'פיתה': 'פיתות',
    'גבינה צהובה': 'גבינה צהובה',
    'גבינה לבנה': 'גבינה לבנה',
};

function detectCategory(productName) {
    const normalized = productName.toLowerCase().trim();
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const keyword of keywords) {
            if (normalized.includes(keyword)) {
                return category;
            }
        }
    }
    return 'pantry';
}

function normalizeProductName(name) {
    const trimmed = name.trim();
    return PRODUCT_ALIASES[trimmed] || trimmed;
}

// Smart local parser - handles Hebrew text patterns
function smartParse(text) {
    const items = [];
    const seen = new Set();

    // Normalize text
    let normalized = text
        .replace(/\s+/g, ' ')
        .replace(/،/g, ',')
        .replace(/\./g, ',')
        .replace(/;/g, ',')
        .replace(/\n/g, ', ')
        .trim();

    // Split by common separators
    const parts = normalized.split(/[,]+/).map(s => s.trim()).filter(s => s.length > 0);

    for (let part of parts) {
        // Handle "ו" (and) connector: "חלב וביצים" -> ["חלב", "ביצים"]
        const andParts = part.split(/\s+ו(?=[א-ת])/);

        for (let subPart of andParts) {
            subPart = subPart.trim();
            if (!subPart) continue;

            let quantity = 1;
            let name = subPart;
            let unit = 'יח\'';

            // Pattern: "2 חלב" or "2x חלב" or "2X חלב" or "×2 חלב"
            let match = subPart.match(/^(\d+)\s*[xX×]?\s+(.+)$/);
            if (match) {
                quantity = parseInt(match[1]) || 1;
                name = match[2].trim();
            }

            // Pattern: "חלב 2" or "חלב - 2" or "חלב (2)"
            if (!match) {
                match = subPart.match(/^(.+?)\s*[-–]?\s*(\d+)$/);
                if (match && match[2]) {
                    quantity = parseInt(match[2]) || 1;
                    name = match[1].trim();
                }
            }

            // Pattern: "חלב (2)"
            if (!match) {
                match = subPart.match(/^(.+?)\s*\((\d+)\)$/);
                if (match && match[2]) {
                    quantity = parseInt(match[2]) || 1;
                    name = match[1].trim();
                }
            }

            // Pattern: "קילו עגבניות" or "חצי קילו גבינה"
            const kiloMatch = name.match(/^(חצי\s+)?קילו\s+(.+)$/);
            if (kiloMatch) {
                name = kiloMatch[2];
                unit = kiloMatch[1] ? '0.5 ק"ג' : 'ק"ג';
            }

            // Pattern: "ליטר חלב"
            const literMatch = name.match(/^(חצי\s+)?ליטר\s+(.+)$/);
            if (literMatch) {
                name = literMatch[2];
                unit = literMatch[1] ? '0.5 ליטר' : 'ליטר';
            }

            // Pattern: "200 גרם גבינה"
            const gramMatch = name.match(/^(\d+)\s*(?:גרם|גר)\s+(.+)$/);
            if (gramMatch) {
                name = gramMatch[2];
                unit = `${gramMatch[1]} גרם`;
                quantity = 1;
            }

            // Clean up name
            name = name
                .replace(/^את\s+/, '')
                .replace(/^של\s+/, '')
                .replace(/^קצת\s+/, '')
                .replace(/^הרבה\s+/, '')
                .replace(/^עוד\s+/, '')
                .replace(/\s+$/, '')
                .trim();

            // Normalize and validate
            name = normalizeProductName(name);

            if (name && name.length > 0 && !seen.has(name.toLowerCase())) {
                seen.add(name.toLowerCase());
                items.push({
                    name,
                    quantity,
                    unit,
                    category: detectCategory(name)
                });
            }
        }
    }

    return items;
}

// Call Groq API for advanced parsing
async function callGroqAPI(text) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
        return null;
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: `אתה עוזר לרשימת קניות ישראלית. תפקידך להמיר טקסט חופשי לרשימת מוצרים.

הנחיות:
1. זהה את כל המוצרים והכמויות
2. אם לא צוינה כמות, השתמש ב-1
3. תקן שגיאות כתיב
4. השתמש בשמות מוצרים סטנדרטיים בעברית
5. החזר JSON בלבד, ללא markdown

פורמט התשובה (JSON בלבד):
{"items": [{"name": "שם המוצר", "quantity": 1, "unit": "יח'"}]}`
                },
                {
                    role: 'user',
                    content: text
                }
            ],
            temperature: 0.1,
            max_tokens: 1000
        })
    });

    if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        return null;
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.items && Array.isArray(parsed.items)) {
            return parsed.items.map(item => ({
                name: normalizeProductName(item.name || ''),
                quantity: parseInt(item.quantity) || 1,
                unit: item.unit || 'יח\'',
                category: detectCategory(item.name || '')
            })).filter(item => item.name);
        }
    }

    return null;
}

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text, action = 'parse' } = req.body;

    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid text parameter' });
    }

    try {
        let items;
        let usedAI = false;

        // Try Groq API first if available
        if (process.env.GROQ_API_KEY) {
            try {
                const aiItems = await callGroqAPI(text);
                if (aiItems && aiItems.length > 0) {
                    items = aiItems;
                    usedAI = true;
                }
            } catch (aiError) {
                console.error('Groq API error, falling back to local parser:', aiError.message);
            }
        }

        // Fallback to smart local parser
        if (!items || items.length === 0) {
            items = smartParse(text);
        }

        res.json({
            success: true,
            items,
            usedAI,
            count: items.length
        });

    } catch (error) {
        console.error('Parse error:', error);

        // Ultimate fallback
        const fallbackItems = smartParse(text);

        res.json({
            success: true,
            items: fallbackItems,
            usedAI: false,
            fallback: true,
            count: fallbackItems.length
        });
    }
};
