const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, '../store-assets/screenshots/live');
const APP_URL = 'https://listnest.co.il';

async function captureLiveScreenshots() {
    console.log('📸 Capturing live screenshots from', APP_URL);
    
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
        fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    }

    const browser = await puppeteer.launch({
        headless: false, // Show browser so user can log in
        defaultViewport: null,
        args: ['--window-size=400,850']
    });

    const page = await browser.newPage();
    
    // Set mobile viewport (iPhone size)
    await page.setViewport({
        width: 390,
        height: 844,
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true
    });

    // Set Hebrew language
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'he-IL,he;q=0.9'
    });

    console.log('🌐 Loading app...');
    await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    console.log('\n📱 Browser is open!');
    console.log('👉 Please LOG IN to the app in the browser window');
    console.log('👉 Navigate to each screen you want to capture');
    console.log('👉 Press ENTER here after each screen to capture it\n');

    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const screens = [
        '01-login',
        '02-main-list', 
        '03-family-share',
        '04-chat',
        '05-prices',
        '06-settings'
    ];

    let currentIndex = 0;

    // Capture login screen first
    console.log('📸 Capturing login screen...');
    await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '01-login.png'),
        type: 'png'
    });
    console.log('✅ Saved: 01-login.png\n');
    currentIndex = 1;

    const captureNext = () => {
        if (currentIndex >= screens.length) {
            console.log('\n🎉 Done! Screenshots saved to:', SCREENSHOTS_DIR);
            rl.close();
            browser.close();
            return;
        }

        const screenName = screens[currentIndex];
        rl.question(`Navigate to "${screenName.replace(/^\d+-/, '')}" and press ENTER (or 'skip' / 'done'): `, async (answer) => {
            if (answer.toLowerCase() === 'done') {
                console.log('\n🎉 Done! Screenshots saved to:', SCREENSHOTS_DIR);
                rl.close();
                await browser.close();
                return;
            }
            
            if (answer.toLowerCase() !== 'skip') {
                await page.screenshot({
                    path: path.join(SCREENSHOTS_DIR, `${screenName}.png`),
                    type: 'png'
                });
                console.log(`✅ Saved: ${screenName}.png`);
            } else {
                console.log(`⏭️ Skipped: ${screenName}`);
            }
            
            currentIndex++;
            captureNext();
        });
    };

    console.log('👉 Log in now, then press ENTER when ready to capture "main-list"');
    rl.question('Press ENTER when logged in and on the main list screen: ', async () => {
        await page.screenshot({
            path: path.join(SCREENSHOTS_DIR, '02-main-list.png'),
            type: 'png'
        });
        console.log('✅ Saved: 02-main-list.png\n');
        currentIndex = 2;
        captureNext();
    });
}

captureLiveScreenshots().catch(console.error);
