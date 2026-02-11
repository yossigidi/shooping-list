const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, '../store-assets/screenshots');

// Google Play dimensions (phone)
const PHONE_WIDTH = 1080;
const PHONE_HEIGHT = 1920;

// Feature graphic dimensions
const FEATURE_WIDTH = 1024;
const FEATURE_HEIGHT = 500;

async function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

async function generateMarketingScreenshots() {
    console.log('🎨 Generating marketing screenshots...\n');

    await ensureDir(SCREENSHOTS_DIR);

    const browser = await puppeteer.launch({
        headless: 'new',
        defaultViewport: null
    });

    const page = await browser.newPage();

    // Generate each screenshot
    const screens = [
        { name: '01-main-list', title: 'רשימת קניות', subtitle: 'נהלו את הקניות בקלות', type: 'list' },
        { name: '02-family-share', title: 'שיתוף משפחתי', subtitle: 'כל המשפחה רואה את אותה רשימה', type: 'qr' },
        { name: '03-chat', title: 'צ\'אט משפחתי', subtitle: 'תקשרו בזמן אמת', type: 'chat' },
        { name: '04-prices', title: 'השוואת מחירים', subtitle: 'חסכו בכל קנייה', type: 'prices' },
        { name: '05-child-login', title: 'חשבון ילדים', subtitle: 'בטוח וקל לשימוש', type: 'child' },
        { name: '06-voice', title: 'הוספה קולית', subtitle: 'פשוט תגידו מה צריך', type: 'voice' },
    ];

    for (const screen of screens) {
        console.log(`📸 Generating ${screen.name}...`);

        await page.setViewport({
            width: PHONE_WIDTH,
            height: PHONE_HEIGHT,
            deviceScaleFactor: 1
        });

        const html = generateScreenHTML(screen);
        await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await new Promise(r => setTimeout(r, 500)); // Wait for rendering

        await page.screenshot({
            path: path.join(SCREENSHOTS_DIR, `${screen.name}.png`),
            type: 'png'
        });
    }

    // Generate feature graphic
    console.log('📸 Generating feature graphic...');
    await page.setViewport({
        width: FEATURE_WIDTH,
        height: FEATURE_HEIGHT,
        deviceScaleFactor: 1
    });

    await page.setContent(generateFeatureGraphicHTML(), { waitUntil: 'domcontentloaded', timeout: 10000 });
    await new Promise(r => setTimeout(r, 500));

    await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'feature-graphic.png'),
        type: 'png'
    });

    console.log('\n✅ All marketing screenshots generated!');
    console.log('📁 Saved to:', SCREENSHOTS_DIR);

    await browser.close();
}

function generateScreenHTML(screen) {
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
                            <svg viewBox="0 0 100 100" width="200" height="200">
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
            width: ${PHONE_WIDTH}px;
            height: ${PHONE_HEIGHT}px;
            background: linear-gradient(180deg, #14B8A6 0%, #0D9488 35%, #F0FDFA 35%);
            display: flex;
            flex-direction: column;
        }
        .marketing-header {
            padding: 70px 50px 35px;
            text-align: center;
            color: white;
        }
        .marketing-header h1 {
            font-size: 64px;
            font-weight: 800;
            margin-bottom: 12px;
        }
        .marketing-header p {
            font-size: 32px;
            opacity: 0.95;
        }
        .phone-container {
            flex: 1;
            display: flex;
            justify-content: center;
            padding: 0 50px 50px;
        }
        .phone-frame {
            width: 100%;
            max-width: 750px;
            background: linear-gradient(145deg, #2d2d44, #1a1a2e);
            border-radius: 55px;
            padding: 14px;
            box-shadow: 0 40px 80px rgba(0,0,0,0.35);
        }
        .phone-screen {
            width: 100%;
            height: 100%;
            background: #F0FDFA;
            border-radius: 42px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            position: relative;
        }
        .app-header {
            background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
            padding: 55px 35px 25px;
            color: white;
        }
        .app-header h2 {
            font-size: 38px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .header-sub {
            font-size: 22px;
            opacity: 0.9;
            margin-top: 6px;
        }
        .app-content {
            flex: 1;
            padding: 25px;
            overflow: hidden;
        }
        .category {
            font-size: 26px;
            font-weight: 600;
            color: #374151;
            padding: 15px 0;
        }
        .list-item {
            background: white;
            border-radius: 20px;
            padding: 20px 24px;
            margin-bottom: 14px;
            display: flex;
            align-items: center;
            gap: 18px;
            box-shadow: 0 3px 15px rgba(0,0,0,0.06);
        }
        .checkbox {
            width: 40px;
            height: 40px;
            border: 3px solid #14B8A6;
            border-radius: 50%;
            flex-shrink: 0;
        }
        .checkbox.checked {
            background: #14B8A6;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
        }
        .item-emoji { font-size: 40px; }
        .item-info { flex: 1; }
        .item-name { font-size: 28px; font-weight: 600; color: #1f2937; }
        .item-meta { font-size: 20px; color: #6b7280; margin-top: 4px; }
        .item-price { font-size: 26px; color: #14B8A6; font-weight: 700; }
        .purchased { opacity: 0.5; }
        .purchased .item-name { text-decoration: line-through; }
        .add-btn {
            position: absolute;
            bottom: 130px;
            left: 50%;
            transform: translateX(-50%);
            width: 90px;
            height: 90px;
            background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 50px;
            box-shadow: 0 8px 25px rgba(20, 184, 166, 0.4);
        }
        .bottom-nav {
            height: 100px;
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
            font-size: 20px;
            color: #9ca3af;
        }
        .nav-item.active { color: #14B8A6; }
        .nav-icon { font-size: 32px; margin-bottom: 4px; }

        /* QR styles */
        .qr-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding-top: 40px;
        }
        .qr-box {
            background: white;
            border-radius: 24px;
            padding: 35px;
            text-align: center;
            box-shadow: 0 8px 30px rgba(0,0,0,0.1);
        }
        .qr-title { font-size: 28px; font-weight: 700; color: #1f2937; margin-bottom: 20px; }
        .qr-code { margin: 0 auto 20px; }
        .qr-code-text { font-size: 48px; font-weight: 800; letter-spacing: 8px; color: #14B8A6; margin-bottom: 12px; }
        .qr-hint { font-size: 22px; color: #6b7280; margin-bottom: 25px; }
        .share-buttons { display: flex; gap: 15px; justify-content: center; }
        .share-btn {
            padding: 16px 28px;
            border-radius: 30px;
            font-size: 22px;
            font-weight: 600;
        }
        .share-btn.whatsapp { background: #25D366; color: white; }
        .share-btn.copy { background: #e5e7eb; color: #1f2937; }

        /* Chat styles */
        .chat-content { padding-bottom: 100px; }
        .chat-msg {
            max-width: 80%;
            margin-bottom: 18px;
            padding: 18px 24px;
            border-radius: 24px;
            font-size: 26px;
            line-height: 1.4;
        }
        .chat-msg.sent {
            background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
            color: white;
            margin-right: auto;
            border-bottom-right-radius: 6px;
        }
        .chat-msg.received {
            background: white;
            color: #1f2937;
            margin-left: auto;
            border-bottom-left-radius: 6px;
            box-shadow: 0 3px 12px rgba(0,0,0,0.06);
        }
        .chat-sender { font-size: 20px; font-weight: 600; margin-bottom: 6px; opacity: 0.8; }
        .chat-input-bar {
            position: absolute;
            bottom: 110px;
            left: 25px;
            right: 25px;
            background: white;
            border-radius: 35px;
            padding: 16px 24px;
            display: flex;
            align-items: center;
            gap: 15px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .chat-input-bar input {
            flex: 1;
            border: none;
            font-size: 24px;
            outline: none;
            background: transparent;
        }
        .chat-input-bar .send-btn {
            width: 50px;
            height: 50px;
            background: #14B8A6;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
        }

        /* Price styles */
        .price-card {
            background: white;
            border-radius: 20px;
            padding: 24px;
            margin-bottom: 20px;
            box-shadow: 0 3px 15px rgba(0,0,0,0.06);
        }
        .price-header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 18px;
        }
        .price-icon {
            width: 60px;
            height: 60px;
            background: #fef3c7;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
        }
        .price-name { font-size: 26px; font-weight: 600; color: #1f2937; }
        .store-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 0;
            border-bottom: 1px solid #f3f4f6;
            font-size: 24px;
        }
        .store-row:last-child { border-bottom: none; }
        .store-name { color: #6b7280; }
        .store-price { font-weight: 700; color: #14B8A6; }
        .store-price.cheapest {
            color: #10b981;
            background: #d1fae5;
            padding: 6px 14px;
            border-radius: 16px;
        }
        .savings-box {
            background: #d1fae5;
            border-radius: 20px;
            padding: 24px;
            text-align: center;
            margin-top: 15px;
        }
        .savings-label { font-size: 24px; color: #065f46; margin-bottom: 8px; }
        .savings-amount { font-size: 48px; font-weight: 800; color: #059669; }
        .savings-hint { font-size: 20px; color: #065f46; margin-top: 6px; }

        /* Child login styles */
        .child-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 50px;
        }
        .child-avatar {
            width: 140px;
            height: 140px;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 70px;
            margin-bottom: 25px;
        }
        .child-title { font-size: 36px; font-weight: 700; color: #1f2937; margin-bottom: 35px; }
        .child-hint { font-size: 24px; color: #6b7280; margin-bottom: 30px; }
        .pin-input { display: flex; gap: 18px; margin-bottom: 35px; }
        .pin-digit {
            width: 75px;
            height: 90px;
            border: 3px solid #e5e7eb;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 42px;
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
            padding: 20px 60px;
            border-radius: 35px;
            font-size: 28px;
            font-weight: 600;
        }
        .child-forgot { font-size: 20px; color: #9ca3af; margin-top: 30px; }

        /* Voice modal styles */
        .voice-modal {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 30px;
            padding: 45px;
            text-align: center;
            width: 85%;
            box-shadow: 0 30px 60px rgba(0,0,0,0.25);
            z-index: 100;
        }
        .voice-icon {
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            border-radius: 50%;
            margin: 0 auto 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 50px;
        }
        .voice-text { font-size: 28px; color: #6b7280; margin-bottom: 15px; }
        .voice-result { font-size: 32px; font-weight: 700; color: #1f2937; }
        .voice-buttons { display: flex; gap: 18px; justify-content: center; margin-top: 30px; }
        .voice-btn {
            padding: 16px 35px;
            border-radius: 30px;
            font-size: 24px;
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

function generateFeatureGraphicHTML() {
    return `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Heebo', Arial, sans-serif; }
        body {
            width: ${FEATURE_WIDTH}px;
            height: ${FEATURE_HEIGHT}px;
            background: linear-gradient(135deg, #0D9488 0%, #14B8A6 50%, #2DD4BF 100%);
            display: flex;
            align-items: center;
            padding: 0 60px;
            position: relative;
            overflow: hidden;
        }
        .float-icon {
            position: absolute;
            font-size: 60px;
            opacity: 0.15;
        }
        .content {
            flex: 1;
            color: white;
            text-align: right;
            z-index: 10;
        }
        .logo { font-size: 80px; margin-bottom: 10px; }
        .title {
            font-size: 72px;
            font-weight: 900;
            margin-bottom: 10px;
            text-shadow: 0 2px 20px rgba(0,0,0,0.2);
        }
        .subtitle {
            font-size: 28px;
            opacity: 0.95;
            margin-bottom: 25px;
        }
        .features {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }
        .feature {
            background: rgba(255,255,255,0.2);
            padding: 12px 24px;
            border-radius: 30px;
            font-size: 20px;
            font-weight: 600;
        }
        .phone {
            width: 180px;
            height: 360px;
            background: #1a1a2e;
            border-radius: 28px;
            padding: 8px;
            margin-left: 40px;
            transform: rotate(-5deg);
            box-shadow: 0 30px 60px rgba(0,0,0,0.4);
        }
        .phone-screen {
            width: 100%;
            height: 100%;
            background: #F0FDFA;
            border-radius: 20px;
            overflow: hidden;
        }
        .phone-header {
            background: linear-gradient(135deg, #14B8A6, #0D9488);
            padding: 25px 12px 10px;
            color: white;
            font-size: 14px;
            font-weight: 600;
        }
        .phone-item {
            background: white;
            margin: 8px;
            padding: 8px 10px;
            border-radius: 8px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .phone-check {
            width: 16px;
            height: 16px;
            border: 2px solid #14B8A6;
            border-radius: 50%;
        }
        .phone-check.done {
            background: #14B8A6;
        }
    </style>
</head>
<body>
    <span class="float-icon" style="top: 10%; left: 5%;">🛒</span>
    <span class="float-icon" style="top: 60%; left: 15%;">🥛</span>
    <span class="float-icon" style="top: 30%; right: 5%;">🍎</span>
    <span class="float-icon" style="top: 75%; right: 15%;">🥖</span>

    <div class="content">
        <div class="logo">🛒</div>
        <div class="title">ListNest</div>
        <div class="subtitle">רשימת קניות חכמה לכל המשפחה</div>
        <div class="features">
            <div class="feature">👨‍👩‍👧‍👦 שיתוף בזמן אמת</div>
            <div class="feature">💰 השוואת מחירים</div>
            <div class="feature">🎤 הוספה קולית</div>
            <div class="feature">📱 עובד אופליין</div>
        </div>
    </div>

    <div class="phone">
        <div class="phone-screen">
            <div class="phone-header">🏠 משפחת כהן</div>
            <div class="phone-item"><div class="phone-check"></div>🥛 חלב</div>
            <div class="phone-item"><div class="phone-check"></div>🍞 לחם</div>
            <div class="phone-item"><div class="phone-check"></div>🧀 גבינה</div>
            <div class="phone-item" style="opacity:0.5"><div class="phone-check done"></div>🥚 <s>ביצים</s></div>
        </div>
    </div>
</body>
</html>`;
}

generateMarketingScreenshots().catch(console.error);
