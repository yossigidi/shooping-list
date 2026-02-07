// ListNest AI - Smart Item Parser using Gemini (FREE tier)
// Vercel Serverless Function

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini - uses GEMINI_API_KEY from environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Hebrew category detection for parsed items
const CATEGORY_KEYWORDS = {
    'fruits': ['תפוח', 'בננה', 'תפוז', 'אבטיח', 'מלון', 'ענב', 'אגס', 'שזיף', 'אפרסק', 'נקטרינה', 'מנגו', 'אננס', 'קיווי', 'רימון', 'תות', 'אוכמניות', 'פטל', 'לימון', 'אשכולית', 'קלמנטינה', 'פומלה', 'תמר', 'תאנה', 'משמש', 'דובדבן', 'פירות'],
    'vegetables': ['עגבניה', 'מלפפון', 'גזר', 'בצל', 'תפוח אדמה', 'פלפל', 'חסה', 'כרוב', 'ברוקולי', 'כרובית', 'חציל', 'קישוא', 'סלרי', 'פטרוזיליה', 'כוסברה', 'נענע', 'בזיליקום', 'שום', 'זנגביל', 'לימון', 'ירקות', 'סלט', 'ירק', 'תרד', 'מנגולד', 'קייל', 'רוקט', 'עלי', 'דלעת', 'בטטה', 'שעועית', 'אפונה', 'תירס', 'פטריות', 'אבוקדו'],
    'dairy': ['חלב', 'גבינה', 'יוגורט', 'קוטג', 'שמנת', 'חמאה', 'ביצים', 'ביצה', 'קשקבל', 'גאודה', 'עמק', 'בולגרית', 'צפתית', 'פטה', 'מוצרלה', 'פרמזן', 'שמנת', 'לבן', 'אשל', 'מעדן', 'פודינג', 'דנונה', 'אקטיביה', 'מילקי'],
    'meat': ['עוף', 'בקר', 'טחון', 'שניצל', 'סטייק', 'נקניק', 'נקניקיה', 'קבב', 'המבורגר', 'כבד', 'כנפיים', 'שוקיים', 'חזה', 'פרגית', 'אנטריקוט', 'סינטה', 'צלעות', 'פילה', 'בשר'],
    'fish': ['דג', 'סלמון', 'טונה', 'אמנון', 'דניס', 'לוקוס', 'מוסר', 'קרפיון', 'בורי', 'סרדין', 'מקרל', 'נסיכה', 'קוד', 'פילה דג'],
    'bread': ['לחם', 'פיתה', 'באגט', 'לחמניה', 'חלה', 'טורטיה', 'קרואסון', 'לפה', 'פוקצ\'ה', 'פרוסות', 'לחם אחיד'],
    'pantry': ['אורז', 'פסטה', 'קמח', 'סוכר', 'מלח', 'שמן', 'חומוס', 'טחינה', 'עדשים', 'שעועית', 'גרגירי חומוס', 'קוסקוס', 'בורגול', 'קינואה', 'שיבולת שועל', 'קורנפלקס', 'גרנולה', 'דגני בוקר', 'דבש', 'ריבה', 'שוקולד', 'ממרח', 'חמאת בוטנים', 'טחינה גולמית', 'סילאן', 'מייפל'],
    'drinks': ['מים', 'מיץ', 'קולה', 'סודה', 'בירה', 'יין', 'קפה', 'תה', 'חלב שוקו', 'לימונדה', 'משקה אנרגיה', 'מינרלים', 'פפסי', 'ספרייט', 'פנטה', 'שוופס'],
    'frozen': ['גלידה', 'פיצה קפואה', 'שניצל קפוא', 'ירקות קפואים', 'בצק עלים', 'בורקס', 'קפוא', 'מאפה'],
    'snacks': ['חטיף', 'ביסלי', 'במבה', 'צ\'יפס', 'קרקר', 'עוגיות', 'שוקולד', 'סוכריות', 'וופלים', 'פופקורן', 'בוטנים', 'שקדים', 'אגוזים', 'חטיפים'],
    'cleaning': ['סבון', 'שמפו', 'מרכך', 'אקונומיקה', 'נייר טואלט', 'מגבונים', 'סבון כלים', 'אבקת כביסה', 'מרכך כביסה', 'ספוג', 'מברשת', 'שקיות אשפה', 'נוזל כלים', 'נוזל רצפה', 'אקונומיקה'],
    'baby': ['טיטולים', 'מטרנה', 'סימילאק', 'מגבונים לתינוק', 'בקבוק', 'מוצץ', 'חיתולים']
};

function detectCategory(productName) {
    const normalized = productName.toLowerCase();
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const keyword of keywords) {
            if (normalized.includes(keyword)) {
                return category;
            }
        }
    }
    return 'pantry'; // Default
}

// Parse AI response to extract items
function parseAIResponse(text) {
    try {
        // Try to extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.items && Array.isArray(parsed.items)) {
                return parsed.items.map(item => ({
                    name: item.name || item.product || '',
                    quantity: parseInt(item.quantity) || 1,
                    unit: item.unit || 'יח\'',
                    category: item.category || detectCategory(item.name || '')
                })).filter(item => item.name);
            }
        }

        // Fallback: try to parse line by line
        const lines = text.split('\n').filter(line => line.trim());
        const items = [];
        for (const line of lines) {
            // Match patterns like "2 חלב" or "חלב - 2" or "חלב (2)"
            const match = line.match(/(\d+)?\s*[xX×]?\s*([א-ת\s]+?)(?:\s*[-:]\s*(\d+)|\s*\((\d+)\))?/);
            if (match) {
                const quantity = parseInt(match[1] || match[3] || match[4]) || 1;
                const name = match[2].trim();
                if (name && name.length > 1) {
                    items.push({
                        name,
                        quantity,
                        unit: 'יח\'',
                        category: detectCategory(name)
                    });
                }
            }
        }
        return items;
    } catch (e) {
        console.error('Error parsing AI response:', e);
        return [];
    }
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

    if (!text) {
        return res.status(400).json({ error: 'Missing text parameter' });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
            error: 'Gemini API key not configured',
            fallback: true,
            items: simpleParse(text) // Use simple fallback parser
        });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        let prompt;

        if (action === 'parse') {
            // Smart item parsing from free text
            prompt = `אתה עוזר לרשימת קניות ישראלית. המר את הטקסט הבא לרשימת מוצרים.

טקסט מהמשתמש: "${text}"

הנחיות:
1. זהה את כל המוצרים והכמויות
2. אם לא צוינה כמות, הניח 1
3. תקן שגיאות כתיב נפוצות
4. השתמש בשמות מוצרים סטנדרטיים בעברית

החזר JSON בלבד בפורמט הבא (בלי הסברים, בלי markdown):
{"items": [{"name": "שם המוצר", "quantity": 1, "unit": "יח'"}, ...]}

יחידות אפשריות: יח', ק"ג, גרם, ליטר, מ"ל, חבילה, קרטון`;

        } else if (action === 'suggest') {
            // Recipe to shopping list
            prompt = `אתה עוזר לרשימת קניות. המשתמש רוצה להכין: "${text}"

צור רשימת מצרכים נדרשים.

החזר JSON בלבד:
{"items": [{"name": "שם המוצר", "quantity": 1, "unit": "יח'"}, ...]}`;

        } else if (action === 'complete') {
            // Smart suggestions based on current list
            prompt = `רשימת הקניות הנוכחית מכילה: ${text}

הצע 3-5 מוצרים שכנראה חסרים ומתאימים לרשימה זו.

החזר JSON בלבד:
{"suggestions": ["מוצר 1", "מוצר 2", ...]}`;
        }

        const result = await model.generateContent(prompt);
        const response = result.response;
        const responseText = response.text();

        if (action === 'complete') {
            // Return suggestions
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return res.json({ suggestions: parsed.suggestions || [] });
            }
            return res.json({ suggestions: [] });
        }

        // Parse items from response
        const items = parseAIResponse(responseText);

        res.json({
            success: true,
            items,
            rawResponse: responseText
        });

    } catch (error) {
        console.error('AI Error:', error);

        // Fallback to simple parser
        res.json({
            success: false,
            error: error.message,
            fallback: true,
            items: simpleParse(text)
        });
    }
};

// Simple fallback parser (no AI needed)
function simpleParse(text) {
    const items = [];

    // Split by common separators
    const parts = text.split(/[,،\n\r]+/).map(s => s.trim()).filter(s => s);

    for (const part of parts) {
        // Match patterns: "2 חלב", "חלב 2", "חלב", "2x חלב"
        const match = part.match(/^(\d+)?\s*[xX×]?\s*(.+?)(?:\s+(\d+))?$/);
        if (match) {
            const quantity = parseInt(match[1] || match[3]) || 1;
            const name = match[2].trim().replace(/^\d+\s*/, '');
            if (name && name.length > 0) {
                items.push({
                    name,
                    quantity,
                    unit: 'יח\'',
                    category: detectCategory(name)
                });
            }
        }
    }

    return items;
}
