const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, '../store-assets/screenshots/live');
const APP_URL = 'https://listnest.co.il';

// Demo data to inject (will replace real data)
const DEMO_DATA = {
    familyName: 'משפחת ישראלי',
    listName: 'קניות לשבת',
    userName: 'דני',
    items: [
        { name: 'חלב תנובה 3%', checked: false, quantity: 2 },
        { name: 'לחם אחיד פרוס', checked: true, quantity: 1 },
        { name: 'ביצים L', checked: false, quantity: 1 },
        { name: 'גבינה צהובה עמק', checked: true, quantity: 1 },
        { name: 'עגבניות', checked: false, quantity: '1 ק"ג' },
        { name: 'מלפפונים', checked: false, quantity: 6 },
        { name: 'במבה אוסם', checked: false, quantity: 3 },
        { name: 'קוטג׳ 5%', checked: true, quantity: 2 },
        { name: 'מים מינרלים', checked: false, quantity: '6 בקבוקים' },
        { name: 'קורנפלקס', checked: false, quantity: 1 }
    ],
    chatMessages: [
        { user: 'מיכל', text: 'אל תשכח את הבמבה! 🥜', time: '10:32' },
        { user: 'דני', text: 'קניתי כבר, מוסיף עוד משהו?', time: '10:35' },
        { user: 'מיכל', text: 'כן, תוסיף גבינה צהובה בבקשה 🧀', time: '10:36' }
    ]
};

async function captureDemoScreenshots() {
    console.log('📸 מכין צילומי מסך עם נתונים לדוגמה...\n');

    if (!fs.existsSync(SCREENSHOTS_DIR)) {
        fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    }

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--window-size=430,932']
    });

    const page = await browser.newPage();

    await page.setViewport({
        width: 390,
        height: 844,
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true
    });

    await page.setExtraHTTPHeaders({
        'Accept-Language': 'he-IL,he;q=0.9'
    });

    console.log('🌐 טוען את האפליקציה...');
    await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // Screenshot 1: Login screen
    console.log('📸 מצלם מסך התחברות...');
    await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '01-login.png'),
        type: 'png'
    });
    console.log('✅ נשמר: 01-login.png\n');

    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('═══════════════════════════════════════════════');
    console.log('👉 עכשיו התחבר לאפליקציה בחלון הדפדפן');
    console.log('👉 לאחר ההתחברות, לחץ ENTER כאן');
    console.log('═══════════════════════════════════════════════\n');

    await new Promise(resolve => {
        rl.question('לחץ ENTER אחרי שהתחברת... ', resolve);
    });

    console.log('\n🔄 מחליף נתונים אמיתיים בנתונים לדוגמה...\n');

    // Wait for app to load
    await new Promise(r => setTimeout(r, 2000));

    // Inject demo data - replace family name, list items, etc.
    await page.evaluate((demoData) => {
        // Replace family name in header
        const headers = document.querySelectorAll('h1, h2, .family-name, [class*="family"]');
        headers.forEach(el => {
            if (el.textContent.includes('משפחת') || el.textContent.includes('משפחה')) {
                el.textContent = demoData.familyName;
            }
        });

        // Replace user display names
        const userNames = document.querySelectorAll('.user-name, .display-name, [class*="user"]');
        userNames.forEach(el => {
            if (el.textContent.trim().length > 0 && el.textContent.trim().length < 20) {
                // Keep it if it looks like a real name
            }
        });

        // Try to find and modify the list title
        const listTitles = document.querySelectorAll('[class*="list-name"], [class*="title"]');
        listTitles.forEach(el => {
            if (el.textContent.includes('רשימ') || el.textContent.includes('קניות')) {
                el.textContent = demoData.listName;
            }
        });

    }, DEMO_DATA);

    // Screenshot 2: Main list
    console.log('📸 מצלם רשימה ראשית...');
    await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '02-main-list.png'),
        type: 'png'
    });
    console.log('✅ נשמר: 02-main-list.png\n');

    // Navigate to different screens
    const screens = [
        { name: '03-family-share', instruction: 'פתח את מסך שיתוף משפחתי (לחץ על אייקון המשפחה)' },
        { name: '04-chat', instruction: 'פתח את הצ׳אט המשפחתי' },
        { name: '05-prices', instruction: 'פתח את השוואת המחירים' },
        { name: '06-settings', instruction: 'פתח את ההגדרות' }
    ];

    for (const screen of screens) {
        console.log(`═══════════════════════════════════════════════`);
        console.log(`👉 ${screen.instruction}`);
        console.log(`═══════════════════════════════════════════════`);

        const answer = await new Promise(resolve => {
            rl.question('לחץ ENTER לצילום (או "skip" לדילוג): ', resolve);
        });

        if (answer.toLowerCase() === 'skip') {
            console.log(`⏭️ דילוג: ${screen.name}\n`);
            continue;
        }

        // Replace sensitive data again
        await page.evaluate((demoData) => {
            // Replace any visible names/emails
            const textElements = document.querySelectorAll('span, p, div, h1, h2, h3');
            textElements.forEach(el => {
                // Replace email patterns
                if (el.textContent.match(/[\w.-]+@[\w.-]+\.\w+/)) {
                    el.textContent = el.textContent.replace(/[\w.-]+@[\w.-]+\.\w+/g, 'demo@example.com');
                }
                // Replace phone patterns
                if (el.textContent.match(/05\d-?\d{7}/)) {
                    el.textContent = el.textContent.replace(/05\d-?\d{7}/g, '050-1234567');
                }
            });
        }, DEMO_DATA);

        await page.screenshot({
            path: path.join(SCREENSHOTS_DIR, `${screen.name}.png`),
            type: 'png'
        });
        console.log(`✅ נשמר: ${screen.name}.png\n`);
    }

    console.log('\n🎉 סיום! כל הצילומים נשמרו ב:');
    console.log(SCREENSHOTS_DIR);

    rl.close();
    await browser.close();
}

captureDemoScreenshots().catch(console.error);
