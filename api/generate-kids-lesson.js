// Kids Teacher - Lesson Generator API
// Vercel Serverless Function using Groq AI (FREE tier)

const ALLOWED_ORIGINS = [
    'https://shooping-list.vercel.app',
    'https://listnest.vercel.app',
    'https://listnest.co.il',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000'
];

// Fallback vocabulary for local generation when Groq is unavailable
const FALLBACK_VOCABULARY = {
    colors: [
        { word: 'Red', emoji: '🔴', translation: 'אדום' },
        { word: 'Blue', emoji: '🔵', translation: 'כחול' },
        { word: 'Green', emoji: '🟢', translation: 'ירוק' },
        { word: 'Yellow', emoji: '🟡', translation: 'צהוב' },
        { word: 'Purple', emoji: '🟣', translation: 'סגול' },
        { word: 'Orange', emoji: '🟠', translation: 'כתום' },
        { word: 'Pink', emoji: '🩷', translation: 'ורוד' },
        { word: 'White', emoji: '⬜', translation: 'לבן' },
        { word: 'Black', emoji: '⬛', translation: 'שחור' },
        { word: 'Brown', emoji: '🟤', translation: 'חום' }
    ],
    animals: [
        { word: 'Dog', emoji: '🐕', translation: 'כלב' },
        { word: 'Cat', emoji: '🐈', translation: 'חתול' },
        { word: 'Bird', emoji: '🐦', translation: 'ציפור' },
        { word: 'Fish', emoji: '🐟', translation: 'דג' },
        { word: 'Horse', emoji: '🐴', translation: 'סוס' },
        { word: 'Cow', emoji: '🐄', translation: 'פרה' },
        { word: 'Lion', emoji: '🦁', translation: 'אריה' },
        { word: 'Elephant', emoji: '🐘', translation: 'פיל' },
        { word: 'Rabbit', emoji: '🐰', translation: 'ארנב' },
        { word: 'Bear', emoji: '🐻', translation: 'דוב' }
    ],
    numbers: [
        { word: 'One', emoji: '1️⃣', translation: 'אחד' },
        { word: 'Two', emoji: '2️⃣', translation: 'שניים' },
        { word: 'Three', emoji: '3️⃣', translation: 'שלושה' },
        { word: 'Four', emoji: '4️⃣', translation: 'ארבעה' },
        { word: 'Five', emoji: '5️⃣', translation: 'חמישה' },
        { word: 'Six', emoji: '6️⃣', translation: 'שישה' },
        { word: 'Seven', emoji: '7️⃣', translation: 'שבעה' },
        { word: 'Eight', emoji: '8️⃣', translation: 'שמונה' },
        { word: 'Nine', emoji: '9️⃣', translation: 'תשעה' },
        { word: 'Ten', emoji: '🔟', translation: 'עשרה' }
    ],
    fruits: [
        { word: 'Apple', emoji: '🍎', translation: 'תפוח' },
        { word: 'Banana', emoji: '🍌', translation: 'בננה' },
        { word: 'Orange', emoji: '🍊', translation: 'תפוז' },
        { word: 'Grape', emoji: '🍇', translation: 'ענב' },
        { word: 'Strawberry', emoji: '🍓', translation: 'תות' },
        { word: 'Watermelon', emoji: '🍉', translation: 'אבטיח' },
        { word: 'Pineapple', emoji: '🍍', translation: 'אננס' },
        { word: 'Cherry', emoji: '🍒', translation: 'דובדבן' },
        { word: 'Peach', emoji: '🍑', translation: 'אפרסק' },
        { word: 'Lemon', emoji: '🍋', translation: 'לימון' }
    ],
    greetings: [
        { word: 'Hello', emoji: '👋', translation: 'שלום' },
        { word: 'Goodbye', emoji: '👋', translation: 'להתראות' },
        { word: 'Thank you', emoji: '🙏', translation: 'תודה' },
        { word: 'Please', emoji: '🤲', translation: 'בבקשה' },
        { word: 'Yes', emoji: '✅', translation: 'כן' },
        { word: 'No', emoji: '❌', translation: 'לא' },
        { word: 'Good morning', emoji: '🌅', translation: 'בוקר טוב' },
        { word: 'Good night', emoji: '🌙', translation: 'לילה טוב' },
        { word: 'How are you?', emoji: '😊', translation: 'מה שלומך?' },
        { word: 'My name is', emoji: '🏷️', translation: 'קוראים לי' }
    ],
    family: [
        { word: 'Mother', emoji: '👩', translation: 'אמא' },
        { word: 'Father', emoji: '👨', translation: 'אבא' },
        { word: 'Brother', emoji: '👦', translation: 'אח' },
        { word: 'Sister', emoji: '👧', translation: 'אחות' },
        { word: 'Baby', emoji: '👶', translation: 'תינוק' },
        { word: 'Grandmother', emoji: '👵', translation: 'סבתא' },
        { word: 'Grandfather', emoji: '👴', translation: 'סבא' },
        { word: 'Family', emoji: '👨‍👩‍👧‍👦', translation: 'משפחה' },
        { word: 'Uncle', emoji: '👨', translation: 'דוד' },
        { word: 'Aunt', emoji: '👩', translation: 'דודה' }
    ],
    body: [
        { word: 'Head', emoji: '😀', translation: 'ראש' },
        { word: 'Hand', emoji: '✋', translation: 'יד' },
        { word: 'Eye', emoji: '👁️', translation: 'עין' },
        { word: 'Nose', emoji: '👃', translation: 'אף' },
        { word: 'Mouth', emoji: '👄', translation: 'פה' },
        { word: 'Ear', emoji: '👂', translation: 'אוזן' },
        { word: 'Foot', emoji: '🦶', translation: 'רגל' },
        { word: 'Hair', emoji: '💇', translation: 'שיער' },
        { word: 'Heart', emoji: '❤️', translation: 'לב' },
        { word: 'Teeth', emoji: '🦷', translation: 'שיניים' }
    ],
    classroom: [
        { word: 'Book', emoji: '📖', translation: 'ספר' },
        { word: 'Pencil', emoji: '✏️', translation: 'עיפרון' },
        { word: 'Teacher', emoji: '👩‍🏫', translation: 'מורה' },
        { word: 'School', emoji: '🏫', translation: 'בית ספר' },
        { word: 'Table', emoji: '🪑', translation: 'שולחן' },
        { word: 'Chair', emoji: '💺', translation: 'כיסא' },
        { word: 'Bag', emoji: '🎒', translation: 'תיק' },
        { word: 'Clock', emoji: '🕐', translation: 'שעון' },
        { word: 'Paper', emoji: '📄', translation: 'נייר' },
        { word: 'Color', emoji: '🎨', translation: 'צבע' }
    ],
    food: [
        { word: 'Bread', emoji: '🍞', translation: 'לחם' },
        { word: 'Milk', emoji: '🥛', translation: 'חלב' },
        { word: 'Egg', emoji: '🥚', translation: 'ביצה' },
        { word: 'Rice', emoji: '🍚', translation: 'אורז' },
        { word: 'Pizza', emoji: '🍕', translation: 'פיצה' },
        { word: 'Ice cream', emoji: '🍦', translation: 'גלידה' },
        { word: 'Cake', emoji: '🎂', translation: 'עוגה' },
        { word: 'Water', emoji: '💧', translation: 'מים' },
        { word: 'Juice', emoji: '🧃', translation: 'מיץ' },
        { word: 'Cookie', emoji: '🍪', translation: 'עוגיה' }
    ],
    weather: [
        { word: 'Sun', emoji: '☀️', translation: 'שמש' },
        { word: 'Rain', emoji: '🌧️', translation: 'גשם' },
        { word: 'Cloud', emoji: '☁️', translation: 'ענן' },
        { word: 'Snow', emoji: '❄️', translation: 'שלג' },
        { word: 'Wind', emoji: '💨', translation: 'רוח' },
        { word: 'Hot', emoji: '🔥', translation: 'חם' },
        { word: 'Cold', emoji: '🥶', translation: 'קר' },
        { word: 'Rainbow', emoji: '🌈', translation: 'קשת' },
        { word: 'Star', emoji: '⭐', translation: 'כוכב' },
        { word: 'Moon', emoji: '🌙', translation: 'ירח' }
    ],
    home: [
        { word: 'House', emoji: '🏠', translation: 'בית' },
        { word: 'Door', emoji: '🚪', translation: 'דלת' },
        { word: 'Window', emoji: '🪟', translation: 'חלון' },
        { word: 'Bed', emoji: '🛏️', translation: 'מיטה' },
        { word: 'Kitchen', emoji: '🍳', translation: 'מטבח' },
        { word: 'Bathroom', emoji: '🚿', translation: 'חדר אמבטיה' },
        { word: 'Garden', emoji: '🌳', translation: 'גינה' },
        { word: 'Key', emoji: '🔑', translation: 'מפתח' },
        { word: 'Light', emoji: '💡', translation: 'אור' },
        { word: 'Television', emoji: '📺', translation: 'טלוויזיה' }
    ],
    clothes: [
        { word: 'Shirt', emoji: '👕', translation: 'חולצה' },
        { word: 'Pants', emoji: '👖', translation: 'מכנסיים' },
        { word: 'Shoes', emoji: '👟', translation: 'נעליים' },
        { word: 'Hat', emoji: '🧢', translation: 'כובע' },
        { word: 'Dress', emoji: '👗', translation: 'שמלה' },
        { word: 'Socks', emoji: '🧦', translation: 'גרביים' },
        { word: 'Jacket', emoji: '🧥', translation: 'ז\'קט' },
        { word: 'Scarf', emoji: '🧣', translation: 'צעיף' },
        { word: 'Glasses', emoji: '👓', translation: 'משקפיים' },
        { word: 'Watch', emoji: '⌚', translation: 'שעון יד' }
    ],
    transport: [
        { word: 'Car', emoji: '🚗', translation: 'מכונית' },
        { word: 'Bus', emoji: '🚌', translation: 'אוטובוס' },
        { word: 'Train', emoji: '🚂', translation: 'רכבת' },
        { word: 'Airplane', emoji: '✈️', translation: 'מטוס' },
        { word: 'Bicycle', emoji: '🚲', translation: 'אופניים' },
        { word: 'Ship', emoji: '🚢', translation: 'ספינה' },
        { word: 'Helicopter', emoji: '🚁', translation: 'מסוק' },
        { word: 'Truck', emoji: '🚛', translation: 'משאית' },
        { word: 'Motorcycle', emoji: '🏍️', translation: 'אופנוע' },
        { word: 'Taxi', emoji: '🚕', translation: 'מונית' }
    ],
    nature: [
        { word: 'Tree', emoji: '🌳', translation: 'עץ' },
        { word: 'Flower', emoji: '🌸', translation: 'פרח' },
        { word: 'Mountain', emoji: '🏔️', translation: 'הר' },
        { word: 'Sea', emoji: '🌊', translation: 'ים' },
        { word: 'River', emoji: '🏞️', translation: 'נהר' },
        { word: 'Forest', emoji: '🌲', translation: 'יער' },
        { word: 'Desert', emoji: '🏜️', translation: 'מדבר' },
        { word: 'Lake', emoji: '🏞️', translation: 'אגם' },
        { word: 'Sky', emoji: '🌤️', translation: 'שמיים' },
        { word: 'Rock', emoji: '🪨', translation: 'סלע' }
    ],
    sizes: [
        { word: 'Big', emoji: '🐘', translation: 'גדול' },
        { word: 'Small', emoji: '🐜', translation: 'קטן' },
        { word: 'Tall', emoji: '🦒', translation: 'גבוה' },
        { word: 'Short', emoji: '🐁', translation: 'נמוך' },
        { word: 'Long', emoji: '🐍', translation: 'ארוך' },
        { word: 'Fast', emoji: '🐆', translation: 'מהיר' },
        { word: 'Slow', emoji: '🐢', translation: 'איטי' },
        { word: 'Heavy', emoji: '🏋️', translation: 'כבד' },
        { word: 'Light', emoji: '🪶', translation: 'קל' },
        { word: 'Wide', emoji: '↔️', translation: 'רחב' }
    ],
    daily_routine: [
        { word: 'Wake up', emoji: '⏰', translation: 'להתעורר' },
        { word: 'Eat', emoji: '🍽️', translation: 'לאכול' },
        { word: 'Drink', emoji: '🥤', translation: 'לשתות' },
        { word: 'Sleep', emoji: '😴', translation: 'לישון' },
        { word: 'Play', emoji: '🎮', translation: 'לשחק' },
        { word: 'Read', emoji: '📖', translation: 'לקרוא' },
        { word: 'Write', emoji: '✍️', translation: 'לכתוב' },
        { word: 'Run', emoji: '🏃', translation: 'לרוץ' },
        { word: 'Walk', emoji: '🚶', translation: 'ללכת' },
        { word: 'Sing', emoji: '🎤', translation: 'לשיר' }
    ],
    store: [
        { word: 'Money', emoji: '💰', translation: 'כסף' },
        { word: 'Price', emoji: '🏷️', translation: 'מחיר' },
        { word: 'Buy', emoji: '🛒', translation: 'לקנות' },
        { word: 'Sell', emoji: '💵', translation: 'למכור' },
        { word: 'Shop', emoji: '🏪', translation: 'חנות' },
        { word: 'Bag', emoji: '🛍️', translation: 'שקית' },
        { word: 'Gift', emoji: '🎁', translation: 'מתנה' },
        { word: 'Toy', emoji: '🧸', translation: 'צעצוע' },
        { word: 'Candy', emoji: '🍬', translation: 'סוכרייה' },
        { word: 'Chocolate', emoji: '🍫', translation: 'שוקולד' }
    ],
    hobbies: [
        { word: 'Draw', emoji: '🎨', translation: 'לצייר' },
        { word: 'Dance', emoji: '💃', translation: 'לרקוד' },
        { word: 'Swim', emoji: '🏊', translation: 'לשחות' },
        { word: 'Cook', emoji: '👨‍🍳', translation: 'לבשל' },
        { word: 'Music', emoji: '🎵', translation: 'מוזיקה' },
        { word: 'Soccer', emoji: '⚽', translation: 'כדורגל' },
        { word: 'Basketball', emoji: '🏀', translation: 'כדורסל' },
        { word: 'Tennis', emoji: '🎾', translation: 'טניס' },
        { word: 'Photo', emoji: '📸', translation: 'צילום' },
        { word: 'Game', emoji: '🎲', translation: 'משחק' }
    ],
    verbs: [
        { word: 'Go', emoji: '🚶', translation: 'ללכת' },
        { word: 'Come', emoji: '🏃', translation: 'לבוא' },
        { word: 'See', emoji: '👀', translation: 'לראות' },
        { word: 'Hear', emoji: '👂', translation: 'לשמוע' },
        { word: 'Talk', emoji: '🗣️', translation: 'לדבר' },
        { word: 'Think', emoji: '🤔', translation: 'לחשוב' },
        { word: 'Love', emoji: '❤️', translation: 'לאהוב' },
        { word: 'Want', emoji: '🤞', translation: 'לרצות' },
        { word: 'Know', emoji: '🧠', translation: 'לדעת' },
        { word: 'Make', emoji: '🔨', translation: 'לעשות' }
    ]
};

// Exercise type generators
const EXERCISE_TYPES = ['emoji-pick', 'word-to-hebrew', 'listen-pick', 'fill-letter', 'match-pairs', 'sentence-build', 'speak-word', 'story-question'];

function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function pickRandom(arr, count) {
    return shuffleArray(arr).slice(0, count);
}

function generateExercisesLocally(topicId, words, mode) {
    const topicWords = words || FALLBACK_VOCABULARY[topicId] || FALLBACK_VOCABULARY.colors;
    const exercises = [];
    const selectedWords = pickRandom(topicWords, 8);

    // Generate 8 exercises with varied types
    const types = shuffleArray([
        'emoji-pick', 'word-to-hebrew', 'listen-pick', 'fill-letter',
        'emoji-pick', 'word-to-hebrew', 'speak-word', 'listen-pick'
    ]);

    for (let i = 0; i < 8; i++) {
        const targetWord = selectedWords[i % selectedWords.length];
        const type = types[i];
        const distractors = pickRandom(topicWords.filter(w => w.word !== targetWord.word), 3);

        switch (type) {
            case 'emoji-pick':
                exercises.push({
                    type: 'emoji-pick',
                    question: targetWord.word,
                    correctAnswer: targetWord.emoji,
                    options: shuffleArray([targetWord, ...distractors]).map(w => ({ emoji: w.emoji, word: w.word })),
                    wordData: targetWord
                });
                break;
            case 'word-to-hebrew':
                exercises.push({
                    type: 'word-to-hebrew',
                    question: targetWord.word,
                    correctAnswer: targetWord.translation,
                    options: shuffleArray([targetWord, ...distractors]).map(w => w.translation),
                    wordData: targetWord
                });
                break;
            case 'listen-pick':
                exercises.push({
                    type: 'listen-pick',
                    question: targetWord.word,
                    correctAnswer: targetWord.word,
                    options: shuffleArray([targetWord, ...distractors]).map(w => w.word),
                    wordData: targetWord
                });
                break;
            case 'fill-letter':
                const wordStr = targetWord.word;
                const hiddenIndex = Math.floor(Math.random() * wordStr.length);
                const hiddenLetter = wordStr[hiddenIndex];
                const display = wordStr.substring(0, hiddenIndex) + '_' + wordStr.substring(hiddenIndex + 1);
                const letterOptions = shuffleArray([hiddenLetter, ...pickRandom('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(l => l !== hiddenLetter.toUpperCase()), 3).map(l => l.toLowerCase())]);
                exercises.push({
                    type: 'fill-letter',
                    question: display,
                    fullWord: targetWord.word,
                    correctAnswer: hiddenLetter,
                    options: letterOptions.map(l => l.toLowerCase()),
                    emoji: targetWord.emoji,
                    wordData: targetWord
                });
                break;
            case 'speak-word':
                exercises.push({
                    type: 'speak-word',
                    question: targetWord.word,
                    emoji: targetWord.emoji,
                    correctAnswer: targetWord.word.toLowerCase(),
                    wordData: targetWord
                });
                break;
            default:
                exercises.push({
                    type: 'emoji-pick',
                    question: targetWord.word,
                    correctAnswer: targetWord.emoji,
                    options: shuffleArray([targetWord, ...distractors]).map(w => ({ emoji: w.emoji, word: w.word })),
                    wordData: targetWord
                });
        }
    }

    return exercises;
}

async function generateWithGroq(topicId, topicWords, mode, weakWords) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) return null;

    const wordsContext = topicWords.map(w => `${w.word} (${w.emoji}) = ${w.translation}`).join(', ');
    const weakContext = weakWords?.length ? `\nFocus on these weak words: ${weakWords.map(w => w.word).join(', ')}` : '';

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
                    content: `You generate English vocabulary exercises for Hebrew-speaking children. Return JSON only, no markdown. Generate 8 exercises using these types: emoji-pick, word-to-hebrew, listen-pick, fill-letter, speak-word. Each exercise has: type, question, correctAnswer, options (array of 4), wordData {word, emoji, translation}.`
                },
                {
                    role: 'user',
                    content: `Topic: ${topicId}. Words: ${wordsContext}${weakContext}. Mode: ${mode}. Generate 8 varied exercises as JSON array.`
                }
            ],
            temperature: 0.7,
            max_tokens: 1500
        })
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]);
}

module.exports = async (req, res) => {
    const origin = req.headers.origin;
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (process.env.NODE_ENV === 'development') {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { topicId, mode = 'new', weakWords, words } = req.body;

    if (!topicId) {
        return res.status(400).json({ error: 'Missing topicId' });
    }

    try {
        // Get topic words from request or fallback
        const topicWords = words || FALLBACK_VOCABULARY[topicId] || FALLBACK_VOCABULARY.colors;

        // Try Groq first
        let exercises = null;
        if (process.env.GROQ_API_KEY) {
            try {
                exercises = await generateWithGroq(topicId, topicWords, mode, weakWords);
            } catch (e) {
                console.error('Groq error:', e);
            }
        }

        // Fallback to local generation
        if (!exercises || !Array.isArray(exercises) || exercises.length < 4) {
            exercises = generateExercisesLocally(topicId, topicWords, mode);
        }

        return res.json({ success: true, exercises, generated: !!exercises });
    } catch (error) {
        console.error('Generate lesson error:', error);
        // Always return exercises via fallback
        const exercises = generateExercisesLocally(topicId, FALLBACK_VOCABULARY[topicId], 'new');
        return res.json({ success: true, exercises, fallback: true });
    }
};
