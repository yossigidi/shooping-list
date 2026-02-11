const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, '../store-assets/screenshots');

// Apple App Store required sizes
const APPLE_SIZES = [
    { name: '6.7inch', width: 1290, height: 2796, label: 'iPhone 15 Pro Max' },
    { name: '6.5inch', width: 1284, height: 2778, label: 'iPhone 11 Pro Max' },
    { name: '5.5inch', width: 1242, height: 2208, label: 'iPhone 8 Plus' },
];

async function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

async function generateAppleScreenshots() {
    console.log('🍎 Generating Apple App Store screenshots...\n');

    const browser = await puppeteer.launch({
        headless: 'new',
        defaultViewport: null
    });

    const page = await browser.newPage();

    const screens = [
        { name: '01-main-list', title: 'רשימת קניות', subtitle: 'נהלו את הקניות בקלות', type: 'list' },
        { name: '02-family-share', title: 'שיתוף משפחתי', subtitle: 'כל המשפחה רואה את אותה רשימה', type: 'qr' },
        { name: '03-chat', title: 'צ\'אט משפחתי', subtitle: 'תקשרו בזמן אמת', type: 'chat' },
        { name: '04-prices', title: 'השוואת מחירים', subtitle: 'חסכו בכל קנייה', type: 'prices' },
        { name: '05-child-login', title: 'חשבון ילדים', subtitle: 'בטוח וקל לשימוש', type: 'child' },
        { name: '06-voice', title: 'הוספה קולית', subtitle: 'פשוט תגידו מה צריך', type: 'voice' },
    ];

    for (const size of APPLE_SIZES) {
        const sizeDir = path.join(SCREENSHOTS_DIR, `apple-${size.name}`);
        await ensureDir(sizeDir);

        console.log(`\n📱 Generating ${size.label} (${size.width}x${size.height})...`);

        for (const screen of screens) {
            console.log(`  📸 ${screen.name}...`);

            await page.setViewport({
                width: size.width,
                height: size.height,
                deviceScaleFactor: 1
            });

            const html = generateScreenHTML(screen, size.width, size.height);
            await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 10000 });
            await new Promise(r => setTimeout(r, 300));

            await page.screenshot({
                path: path.join(sizeDir, `${screen.name}.png`),
                type: 'png'
            });
        }
    }

    console.log('\n✅ All Apple screenshots generated!');
    console.log('📁 Saved to:', SCREENSHOTS_DIR);

    for (const size of APPLE_SIZES) {
        console.log(`   └── apple-${size.name}/ (${size.label})`);
    }

    await browser.close();
}

function generateScreenHTML(screen, width, height) {
    // Scale factors based on width
    const scale = width / 1080;

    let appContent = '';

    switch (screen.type) {
        case 'list':
            appContent = `
                <div class="app-header">
                    <h2>🏠 משפחת כהן</h2>
                    <div class="header-sub">5 מוצרים • 2 נקנו</div>
                </div>
                <div class="app-content">
                    <div class="category">🥛 מוצרי חלב</div>
                    <div class="list-item">
                        <div class="checkbox"></div>
                        <span class="item-emoji">🥛</span>
                        <div class="item-info">
                            <div class="item-name">חלב תנובה 3%</div>
                            <div class="item-meta">כמות: 2 • הוסיף: אבא</div>
                        </div>
                        <div class="item-price">₪12.90</div>
                    </div>
                    <div class="list-item">
                        <div class="checkbox"></div>
                        <span class="item-emoji">🧀</span>
                        <div class="item-info">
                            <div class="item-name">גבינה צהובה</div>
                            <div class="item-meta">כמות: 1 • הוסיף: אמא</div>
                        </div>
                        <div class="item-price">₪24.90</div>
                    </div>
                    <div class="category">🍞 לחם ומאפים</div>
                    <div class="list-item">
                        <div class="checkbox"></div>
                        <span class="item-emoji">🍞</span>
                        <div class="item-info">
                            <div class="item-name">לחם אחיד</div>
                            <div class="item-meta">כמות: 1 • הוסיף: דני</div>
                        </div>
                        <div class="item-price">₪8.90</div>
                    </div>
                    <div class="category">✅ נקנו</div>
                    <div class="list-item purchased">
                        <div class="checkbox checked">✓</div>
                        <span class="item-emoji">🥚</span>
                        <div class="item-info">
                            <div class="item-name">ביצים L</div>
                            <div class="item-meta">נקנה ע"י אמא</div>
                        </div>
                    </div>
                    <div class="list-item purchased">
                        <div class="checkbox checked">✓</div>
                        <span class="item-emoji">🧈</span>
                        <div class="item-info">
                            <div class="item-name">חמאה</div>
                            <div class="item-meta">נקנה ע"י אבא</div>
                        </div>
                    </div>
                </div>
                <div class="add-btn">+</div>
                <div class="bottom-nav">
                    <div class="nav-item active"><span class="nav-icon">📝</span><span>רשימה</span></div>
                    <div class="nav-item"><span class="nav-icon">💬</span><span>צ'אט</span></div>
                    <div class="nav-item"><span class="nav-icon">💰</span><span>מחירים</span></div>
                    <div class="nav-item"><span class="nav-icon">⚙️</span><span>הגדרות</span></div>
                </div>`;
            break;

        case 'qr':
            appContent = `
                <div class="app-header">
                    <h2>📱 הזמן למשפחה</h2>
                    <div class="header-sub">שתף את הקוד או QR</div>
                </div>
                <div class="app-content qr-content">
                    <div class="qr-box">
                        <div class="qr-title">סרקו להצטרפות</div>
                        <div class="qr-code">
                            <svg viewBox="0 0 100 100" width="${200 * scale}" height="${200 * scale}">
                                <rect x="10" y="10" width="25" height="25" fill="#1f2937"/>
                                <rect x="65" y="10" width="25" height="25" fill="#1f2937"/>
                                <rect x="10" y="65" width="25" height="25" fill="#1f2937"/>
                                <rect x="15" y="15" width="15" height="15" fill="white"/>
                                <rect x="70" y="15" width="15" height="15" fill="white"/>
                                <rect x="15" y="70" width="15" height="15" fill="white"/>
                                <rect x="18" y="18" width="9" height="9" fill="#1f2937"/>
                                <rect x="73" y="18" width="9" height="9" fill="#1f2937"/>
                                <rect x="18" y="73" width="9" height="9" fill="#1f2937"/>
                                <rect x="40" y="10" width="5" height="5" fill="#1f2937"/>
                                <rect x="50" y="15" width="5" height="5" fill="#1f2937"/>
                                <rect x="40" y="40" width="20" height="20" fill="#1f2937"/>
                                <rect x="45" y="45" width="10" height="10" fill="white"/>
                                <rect x="48" y="48" width="4" height="4" fill="#1f2937"/>
                                <rect x="65" y="45" width="5" height="5" fill="#1f2937"/>
                                <rect x="80" y="55" width="5" height="5" fill="#1f2937"/>
                                <rect x="45" y="65" width="5" height="5" fill="#1f2937"/>
                                <rect x="55" y="75" width="5" height="5" fill="#1f2937"/>
                                <rect x="70" y="80" width="5" height="5" fill="#1f2937"/>
                            </svg>
                        </div>
                        <div class="qr-code-text">ABC123</div>
                        <div class="qr-hint">או שתפו את הקוד בווטסאפ</div>
                        <div class="share-buttons">
                            <div class="share-btn whatsapp">📱 שתף בווטסאפ</div>
                            <div class="share-btn copy">📋 העתק קוד</div>
                        </div>
                    </div>
                </div>
                <div class="bottom-nav">
                    <div class="nav-item"><span class="nav-icon">📝</span><span>רשימה</span></div>
                    <div class="nav-item"><span class="nav-icon">💬</span><span>צ'אט</span></div>
                    <div class="nav-item"><span class="nav-icon">💰</span><span>מחירים</span></div>
                    <div class="nav-item active"><span class="nav-icon">⚙️</span><span>הגדרות</span></div>
                </div>`;
            break;

        case 'chat':
            appContent = `
                <div class="app-header">
                    <h2>💬 צ'אט משפחתי</h2>
                    <div class="header-sub">4 חברי משפחה מחוברים</div>
                </div>
                <div class="app-content chat-content">
                    <div class="chat-msg received">
                        <div class="chat-sender">👩 אמא</div>
                        <div class="chat-text">מישהו יכול לקנות חלב בדרך הביתה?</div>
                    </div>
                    <div class="chat-msg sent">
                        <div class="chat-sender">👨 אני</div>
                        <div class="chat-text">אני בדיוק ליד הסופר, אקנה!</div>
                    </div>
                    <div class="chat-msg received">
                        <div class="chat-sender">👩 אמא</div>
                        <div class="chat-text">תודה! 🙏 אל תשכח גם ביצים</div>
                    </div>
                    <div class="chat-msg sent">
                        <div class="chat-sender">👨 אני</div>
                        <div class="chat-text">הוספתי לרשימה ✅</div>
                    </div>
                    <div class="chat-msg received">
                        <div class="chat-sender">👦 דני</div>
                        <div class="chat-text">אבא תביא גם במבה! 🥺</div>
                    </div>
                    <div class="chat-msg sent">
                        <div class="chat-sender">👨 אני</div>
                        <div class="chat-text">טוב טוב, הוספתי 😄</div>
                    </div>
                </div>
                <div class="chat-input-bar">
                    <input type="text" placeholder="כתוב הודעה..." disabled>
                    <div class="send-btn">➤</div>
                </div>
                <div class="bottom-nav">
                    <div class="nav-item"><span class="nav-icon">📝</span><span>רשימה</span></div>
                    <div class="nav-item active"><span class="nav-icon">💬</span><span>צ'אט</span></div>
                    <div class="nav-item"><span class="nav-icon">💰</span><span>מחירים</span></div>
                    <div class="nav-item"><span class="nav-icon">⚙️</span><span>הגדרות</span></div>
                </div>`;
            break;

        case 'prices':
            appContent = `
                <div class="app-header">
                    <h2>💰 השוואת מחירים</h2>
                    <div class="header-sub">מחירים מעודכנים מ-5 רשתות</div>
                </div>
                <div class="app-content">
                    <div class="price-card">
                        <div class="price-header">
                            <div class="price-icon">🥛</div>
                            <div class="price-name">חלב תנובה 3% 1 ליטר</div>
                        </div>
                        <div class="store-row">
                            <span class="store-name">🏪 רמי לוי</span>
                            <span class="store-price cheapest">₪5.90 הכי זול!</span>
                        </div>
                        <div class="store-row">
                            <span class="store-name">🏪 שופרסל</span>
                            <span class="store-price">₪6.50</span>
                        </div>
                        <div class="store-row">
                            <span class="store-name">🏪 ויקטורי</span>
                            <span class="store-price">₪6.90</span>
                        </div>
                    </div>
                    <div class="price-card">
                        <div class="price-header">
                            <div class="price-icon">🥚</div>
                            <div class="price-name">ביצים חופש L תבנית 12</div>
                        </div>
                        <div class="store-row">
                            <span class="store-name">🏪 יינות ביתן</span>
                            <span class="store-price cheapest">₪14.90 הכי זול!</span>
                        </div>
                        <div class="store-row">
                            <span class="store-name">🏪 שופרסל</span>
                            <span class="store-price">₪16.90</span>
                        </div>
                        <div class="store-row">
                            <span class="store-name">🏪 רמי לוי</span>
                            <span class="store-price">₪15.90</span>
                        </div>
                    </div>
                    <div class="savings-box">
                        <div class="savings-label">💡 חיסכון פוטנציאלי</div>
                        <div class="savings-amount">₪23.40</div>
                        <div class="savings-hint">אם תקנו במחירים הזולים</div>
                    </div>
                </div>
                <div class="bottom-nav">
                    <div class="nav-item"><span class="nav-icon">📝</span><span>רשימה</span></div>
                    <div class="nav-item"><span class="nav-icon">💬</span><span>צ'אט</span></div>
                    <div class="nav-item active"><span class="nav-icon">💰</span><span>מחירים</span></div>
                    <div class="nav-item"><span class="nav-icon">⚙️</span><span>הגדרות</span></div>
                </div>`;
            break;

        case 'child':
            appContent = `
                <div class="app-header" style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);">
                    <h2>👦 כניסת ילדים</h2>
                    <div class="header-sub">הזן את קוד ה-PIN שלך</div>
                </div>
                <div class="app-content child-content">
                    <div class="child-avatar">👦</div>
                    <div class="child-title">שלום דני!</div>
                    <div class="child-hint">הזן את קוד ה-PIN בן 4 ספרות</div>
                    <div class="pin-input">
                        <div class="pin-digit filled">1</div>
                        <div class="pin-digit filled">2</div>
                        <div class="pin-digit filled">3</div>
                        <div class="pin-digit">_</div>
                    </div>
                    <button class="child-btn">התחבר</button>
                    <div class="child-forgot">שכחת PIN? בקש מההורים לאפס</div>
                </div>`;
            break;

        case 'voice':
            appContent = `
                <div class="app-header">
                    <h2>🏠 משפחת כהן</h2>
                    <div class="header-sub">5 מוצרים</div>
                </div>
                <div class="app-content" style="opacity: 0.3;">
                    <div class="list-item">
                        <div class="checkbox"></div>
                        <span class="item-emoji">🥛</span>
                        <div class="item-info"><div class="item-name">חלב</div></div>
                    </div>
                    <div class="list-item">
                        <div class="checkbox"></div>
                        <span class="item-emoji">🍞</span>
                        <div class="item-info"><div class="item-name">לחם</div></div>
                    </div>
                </div>
                <div class="voice-modal">
                    <div class="voice-icon">🎤</div>
                    <div class="voice-text">מקשיב...</div>
                    <div class="voice-result">"שני ליטר חלב ותריסר ביצים"</div>
                    <div class="voice-buttons">
                        <div class="voice-btn cancel">ביטול</div>
                        <div class="voice-btn confirm">הוסף ✓</div>
                    </div>
                </div>
                <div class="bottom-nav">
                    <div class="nav-item active"><span class="nav-icon">📝</span><span>רשימה</span></div>
                    <div class="nav-item"><span class="nav-icon">💬</span><span>צ'אט</span></div>
                    <div class="nav-item"><span class="nav-icon">💰</span><span>מחירים</span></div>
                    <div class="nav-item"><span class="nav-icon">⚙️</span><span>הגדרות</span></div>
                </div>`;
            break;
    }

    return `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Heebo', Arial, sans-serif; }
        body {
            width: ${width}px;
            height: ${height}px;
            background: linear-gradient(180deg, #14B8A6 0%, #0D9488 32%, #F0FDFA 32%);
            display: flex;
            flex-direction: column;
        }
        .marketing-header {
            padding: ${80 * scale}px ${50 * scale}px ${40 * scale}px;
            text-align: center;
            color: white;
        }
        .marketing-header h1 {
            font-size: ${72 * scale}px;
            font-weight: 800;
            margin-bottom: ${14 * scale}px;
        }
        .marketing-header p {
            font-size: ${36 * scale}px;
            opacity: 0.95;
        }
        .phone-container {
            flex: 1;
            display: flex;
            justify-content: center;
            padding: 0 ${55 * scale}px ${55 * scale}px;
        }
        .phone-frame {
            width: 100%;
            max-width: ${820 * scale}px;
            background: linear-gradient(145deg, #2d2d44, #1a1a2e);
            border-radius: ${60 * scale}px;
            padding: ${16 * scale}px;
            box-shadow: 0 ${45 * scale}px ${90 * scale}px rgba(0,0,0,0.35);
        }
        .phone-screen {
            width: 100%;
            height: 100%;
            background: #F0FDFA;
            border-radius: ${46 * scale}px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            position: relative;
        }
        .app-header {
            background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
            padding: ${60 * scale}px ${40 * scale}px ${28 * scale}px;
            color: white;
        }
        .app-header h2 {
            font-size: ${42 * scale}px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: ${14 * scale}px;
        }
        .header-sub {
            font-size: ${24 * scale}px;
            opacity: 0.9;
            margin-top: ${8 * scale}px;
        }
        .app-content {
            flex: 1;
            padding: ${28 * scale}px;
            overflow: hidden;
        }
        .category {
            font-size: ${28 * scale}px;
            font-weight: 600;
            color: #374151;
            padding: ${16 * scale}px 0;
        }
        .list-item {
            background: white;
            border-radius: ${22 * scale}px;
            padding: ${22 * scale}px ${26 * scale}px;
            margin-bottom: ${16 * scale}px;
            display: flex;
            align-items: center;
            gap: ${20 * scale}px;
            box-shadow: 0 ${4 * scale}px ${18 * scale}px rgba(0,0,0,0.06);
        }
        .checkbox {
            width: ${44 * scale}px;
            height: ${44 * scale}px;
            border: ${3 * scale}px solid #14B8A6;
            border-radius: 50%;
            flex-shrink: 0;
        }
        .checkbox.checked {
            background: #14B8A6;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: ${26 * scale}px;
        }
        .item-emoji { font-size: ${44 * scale}px; }
        .item-info { flex: 1; }
        .item-name { font-size: ${30 * scale}px; font-weight: 600; color: #1f2937; }
        .item-meta { font-size: ${22 * scale}px; color: #6b7280; margin-top: ${5 * scale}px; }
        .item-price { font-size: ${28 * scale}px; color: #14B8A6; font-weight: 700; }
        .purchased { opacity: 0.5; }
        .purchased .item-name { text-decoration: line-through; }
        .add-btn {
            position: absolute;
            bottom: ${140 * scale}px;
            left: 50%;
            transform: translateX(-50%);
            width: ${100 * scale}px;
            height: ${100 * scale}px;
            background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: ${55 * scale}px;
            box-shadow: 0 ${10 * scale}px ${30 * scale}px rgba(20, 184, 166, 0.4);
        }
        .bottom-nav {
            height: ${110 * scale}px;
            background: white;
            display: flex;
            justify-content: space-around;
            align-items: center;
            border-top: 1px solid #e5e7eb;
        }
        .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            font-size: ${22 * scale}px;
            color: #9ca3af;
        }
        .nav-item.active { color: #14B8A6; }
        .nav-icon { font-size: ${36 * scale}px; margin-bottom: ${5 * scale}px; }

        /* QR styles */
        .qr-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding-top: ${45 * scale}px;
        }
        .qr-box {
            background: white;
            border-radius: ${28 * scale}px;
            padding: ${40 * scale}px;
            text-align: center;
            box-shadow: 0 ${10 * scale}px ${35 * scale}px rgba(0,0,0,0.1);
        }
        .qr-title { font-size: ${32 * scale}px; font-weight: 700; color: #1f2937; margin-bottom: ${24 * scale}px; }
        .qr-code { margin: 0 auto ${24 * scale}px; }
        .qr-code-text { font-size: ${54 * scale}px; font-weight: 800; letter-spacing: ${10 * scale}px; color: #14B8A6; margin-bottom: ${14 * scale}px; }
        .qr-hint { font-size: ${24 * scale}px; color: #6b7280; margin-bottom: ${28 * scale}px; }
        .share-buttons { display: flex; gap: ${18 * scale}px; justify-content: center; }
        .share-btn {
            padding: ${18 * scale}px ${32 * scale}px;
            border-radius: ${35 * scale}px;
            font-size: ${24 * scale}px;
            font-weight: 600;
        }
        .share-btn.whatsapp { background: #25D366; color: white; }
        .share-btn.copy { background: #e5e7eb; color: #1f2937; }

        /* Chat styles */
        .chat-content { padding-bottom: ${110 * scale}px; }
        .chat-msg {
            max-width: 80%;
            margin-bottom: ${20 * scale}px;
            padding: ${20 * scale}px ${28 * scale}px;
            border-radius: ${28 * scale}px;
            font-size: ${28 * scale}px;
            line-height: 1.4;
        }
        .chat-msg.sent {
            background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
            color: white;
            margin-right: auto;
            border-bottom-right-radius: ${8 * scale}px;
        }
        .chat-msg.received {
            background: white;
            color: #1f2937;
            margin-left: auto;
            border-bottom-left-radius: ${8 * scale}px;
            box-shadow: 0 ${4 * scale}px ${14 * scale}px rgba(0,0,0,0.06);
        }
        .chat-sender { font-size: ${22 * scale}px; font-weight: 600; margin-bottom: ${8 * scale}px; opacity: 0.8; }
        .chat-input-bar {
            position: absolute;
            bottom: ${120 * scale}px;
            left: ${28 * scale}px;
            right: ${28 * scale}px;
            background: white;
            border-radius: ${40 * scale}px;
            padding: ${18 * scale}px ${28 * scale}px;
            display: flex;
            align-items: center;
            gap: ${18 * scale}px;
            box-shadow: 0 ${5 * scale}px ${24 * scale}px rgba(0,0,0,0.1);
        }
        .chat-input-bar input {
            flex: 1;
            border: none;
            font-size: ${26 * scale}px;
            outline: none;
            background: transparent;
        }
        .chat-input-bar .send-btn {
            width: ${55 * scale}px;
            height: ${55 * scale}px;
            background: #14B8A6;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: ${28 * scale}px;
        }

        /* Price styles */
        .price-card {
            background: white;
            border-radius: ${22 * scale}px;
            padding: ${28 * scale}px;
            margin-bottom: ${22 * scale}px;
            box-shadow: 0 ${4 * scale}px ${18 * scale}px rgba(0,0,0,0.06);
        }
        .price-header {
            display: flex;
            align-items: center;
            gap: ${18 * scale}px;
            margin-bottom: ${20 * scale}px;
        }
        .price-icon {
            width: ${66 * scale}px;
            height: ${66 * scale}px;
            background: #fef3c7;
            border-radius: ${16 * scale}px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${40 * scale}px;
        }
        .price-name { font-size: ${28 * scale}px; font-weight: 600; color: #1f2937; }
        .store-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: ${16 * scale}px 0;
            border-bottom: 1px solid #f3f4f6;
            font-size: ${26 * scale}px;
        }
        .store-row:last-child { border-bottom: none; }
        .store-name { color: #6b7280; }
        .store-price { font-weight: 700; color: #14B8A6; }
        .store-price.cheapest {
            color: #10b981;
            background: #d1fae5;
            padding: ${8 * scale}px ${16 * scale}px;
            border-radius: ${18 * scale}px;
        }
        .savings-box {
            background: #d1fae5;
            border-radius: ${22 * scale}px;
            padding: ${28 * scale}px;
            text-align: center;
            margin-top: ${18 * scale}px;
        }
        .savings-label { font-size: ${26 * scale}px; color: #065f46; margin-bottom: ${10 * scale}px; }
        .savings-amount { font-size: ${54 * scale}px; font-weight: 800; color: #059669; }
        .savings-hint { font-size: ${22 * scale}px; color: #065f46; margin-top: ${8 * scale}px; }

        /* Child login styles */
        .child-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: ${55 * scale}px;
        }
        .child-avatar {
            width: ${160 * scale}px;
            height: ${160 * scale}px;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${80 * scale}px;
            margin-bottom: ${30 * scale}px;
        }
        .child-title { font-size: ${40 * scale}px; font-weight: 700; color: #1f2937; margin-bottom: ${40 * scale}px; }
        .child-hint { font-size: ${26 * scale}px; color: #6b7280; margin-bottom: ${35 * scale}px; }
        .pin-input { display: flex; gap: ${20 * scale}px; margin-bottom: ${40 * scale}px; }
        .pin-digit {
            width: ${85 * scale}px;
            height: ${100 * scale}px;
            border: ${4 * scale}px solid #e5e7eb;
            border-radius: ${20 * scale}px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${48 * scale}px;
            font-weight: 700;
            color: #1f2937;
        }
        .pin-digit.filled {
            border-color: #14B8A6;
            background: #f0fdfa;
        }
        .child-btn {
            background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
            color: white;
            border: none;
            padding: ${24 * scale}px ${70 * scale}px;
            border-radius: ${40 * scale}px;
            font-size: ${32 * scale}px;
            font-weight: 600;
        }
        .child-forgot { font-size: ${22 * scale}px; color: #9ca3af; margin-top: ${35 * scale}px; }

        /* Voice modal styles */
        .voice-modal {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: ${35 * scale}px;
            padding: ${50 * scale}px;
            text-align: center;
            width: 85%;
            box-shadow: 0 ${35 * scale}px ${70 * scale}px rgba(0,0,0,0.25);
            z-index: 100;
        }
        .voice-icon {
            width: ${140 * scale}px;
            height: ${140 * scale}px;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            border-radius: 50%;
            margin: 0 auto ${35 * scale}px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${60 * scale}px;
        }
        .voice-text { font-size: ${32 * scale}px; color: #6b7280; margin-bottom: ${18 * scale}px; }
        .voice-result { font-size: ${36 * scale}px; font-weight: 700; color: #1f2937; }
        .voice-buttons { display: flex; gap: ${20 * scale}px; justify-content: center; margin-top: ${35 * scale}px; }
        .voice-btn {
            padding: ${18 * scale}px ${40 * scale}px;
            border-radius: ${35 * scale}px;
            font-size: ${28 * scale}px;
        }
        .voice-btn.cancel { background: #e5e7eb; color: #1f2937; }
        .voice-btn.confirm { background: #14B8A6; color: white; }
    </style>
</head>
<body>
    <div class="marketing-header">
        <h1>${screen.title}</h1>
        <p>${screen.subtitle}</p>
    </div>
    <div class="phone-container">
        <div class="phone-frame">
            <div class="phone-screen">
                ${appContent}
            </div>
        </div>
    </div>
</body>
</html>`;
}

generateAppleScreenshots().catch(console.error);
