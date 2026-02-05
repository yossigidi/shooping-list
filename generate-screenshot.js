const sharp = require('sharp');
const path = require('path');

const screenshotSVG = `<svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#F97316"/>
      <stop offset="50%" style="stop-color:#FB923C"/>
      <stop offset="100%" style="stop-color:#FBBF24"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1080" height="1920" fill="url(#bg)"/>

  <!-- Phone frame mockup -->
  <rect x="140" y="200" width="800" height="1520" rx="50" fill="white" opacity="0.95"/>

  <!-- Header -->
  <rect x="140" y="200" width="800" height="120" rx="50" fill="#F97316"/>
  <text x="540" y="275" font-family="Arial" font-size="48" fill="white" text-anchor="middle" font-weight="bold">ListNest</text>

  <!-- Shopping list items -->
  <g transform="translate(180, 360)">
    <!-- Item 1 -->
    <rect width="720" height="80" rx="15" fill="#F3F4F6"/>
    <circle cx="40" cy="40" r="20" fill="#10B981"/>
    <text x="700" y="50" font-family="Arial" font-size="32" fill="#374151" text-anchor="end">חלב</text>
    <path d="M30 40 L38 48 L52 32" stroke="white" stroke-width="4" fill="none"/>

    <!-- Item 2 -->
    <rect y="100" width="720" height="80" rx="15" fill="#F3F4F6"/>
    <circle cx="40" cy="140" r="20" fill="#10B981"/>
    <text x="700" y="150" font-family="Arial" font-size="32" fill="#374151" text-anchor="end">לחם</text>
    <path d="M30 140 L38 148 L52 132" stroke="white" stroke-width="4" fill="none"/>

    <!-- Item 3 -->
    <rect y="200" width="720" height="80" rx="15" fill="#F3F4F6"/>
    <circle cx="40" cy="240" r="20" stroke="#D1D5DB" stroke-width="3" fill="white"/>
    <text x="700" y="250" font-family="Arial" font-size="32" fill="#374151" text-anchor="end">ביצים</text>

    <!-- Item 4 -->
    <rect y="300" width="720" height="80" rx="15" fill="#F3F4F6"/>
    <circle cx="40" cy="340" r="20" stroke="#D1D5DB" stroke-width="3" fill="white"/>
    <text x="700" y="350" font-family="Arial" font-size="32" fill="#374151" text-anchor="end">גבינה צהובה</text>

    <!-- Item 5 -->
    <rect y="400" width="720" height="80" rx="15" fill="#F3F4F6"/>
    <circle cx="40" cy="440" r="20" stroke="#D1D5DB" stroke-width="3" fill="white"/>
    <text x="700" y="450" font-family="Arial" font-size="32" fill="#374151" text-anchor="end">עגבניות</text>
  </g>

  <!-- Bottom bar -->
  <rect x="140" y="1560" width="800" height="160" rx="0" fill="#FFF7ED"/>
  <rect x="200" y="1600" width="680" height="60" rx="30" fill="#FFEDD5" stroke="#FDBA74" stroke-width="2"/>
  <text x="540" y="1640" font-family="Arial" font-size="28" fill="#9CA3AF" text-anchor="middle">🔍 הוסף מוצר...</text>

  <!-- App title at bottom -->
  <text x="540" y="1850" font-family="Arial" font-size="36" fill="white" text-anchor="middle" font-weight="bold">ListNest</text>
  <text x="540" y="1890" font-family="Arial" font-size="24" fill="rgba(255,255,255,0.8)" text-anchor="middle">הקן המשפחתי לרשימות קניות חכמות</text>
</svg>`;

async function generateScreenshot() {
    const filepath = path.join(__dirname, 'screenshots', 'screenshot1.png');

    await sharp(Buffer.from(screenshotSVG))
        .png()
        .toFile(filepath);

    console.log('Screenshot created: screenshots/screenshot1.png');
}

generateScreenshot().catch(console.error);
