const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const maskableSizes = [192, 512];

// SVG icon template - shopping cart with checkmark
function createIconSVG(size, maskable = false) {
    const padding = maskable ? size * 0.1 : 0;
    const innerSize = size - (padding * 2);
    const scale = innerSize / 100;
    const offset = padding;

    return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366F1"/>
      <stop offset="100%" style="stop-color:#8B5CF6"/>
    </linearGradient>
    <clipPath id="rounded">
      <rect x="0" y="0" width="${size}" height="${size}" rx="${maskable ? 0 : size * 0.2}" ry="${maskable ? 0 : size * 0.2}"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" fill="url(#grad)" clip-path="url(#rounded)"/>

  <!-- Shopping Cart -->
  <g transform="translate(${offset + innerSize * 0.15}, ${offset + innerSize * 0.15})" stroke="white" stroke-width="${scale * 5}" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Cart handle -->
    <path d="M${10 * scale} ${20 * scale} L${20 * scale} ${20 * scale} L${25 * scale} ${48 * scale} L${58 * scale} ${48 * scale}"/>

    <!-- Cart body -->
    <path d="M${25 * scale} ${32 * scale} L${58 * scale} ${32 * scale} L${54 * scale} ${58 * scale} L${29 * scale} ${58 * scale} Z" fill="rgba(255,255,255,0.2)"/>

    <!-- Wheels -->
    <circle cx="${33 * scale}" cy="${68 * scale}" r="${5 * scale}" fill="white" stroke="none"/>
    <circle cx="${50 * scale}" cy="${68 * scale}" r="${5 * scale}" fill="white" stroke="none"/>

    <!-- Checkmark -->
    <path d="M${38 * scale} ${42 * scale} L${45 * scale} ${50 * scale} L${58 * scale} ${35 * scale}" stroke="#10B981" stroke-width="${scale * 6}"/>
  </g>
</svg>`;
}

async function generateIcons() {
    const iconsDir = path.join(__dirname, 'icons');

    // Create icons directory if it doesn't exist
    if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir, { recursive: true });
    }

    console.log('Generating icons...\n');

    // Generate regular icons
    for (const size of sizes) {
        const svg = createIconSVG(size, false);
        const filename = `icon-${size}x${size}.png`;
        const filepath = path.join(iconsDir, filename);

        await sharp(Buffer.from(svg))
            .png()
            .toFile(filepath);

        console.log(`Created: ${filename}`);
    }

    // Generate maskable icons
    for (const size of maskableSizes) {
        const svg = createIconSVG(size, true);
        const filename = `icon-maskable-${size}x${size}.png`;
        const filepath = path.join(iconsDir, filename);

        await sharp(Buffer.from(svg))
            .png()
            .toFile(filepath);

        console.log(`Created: ${filename}`);
    }

    console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
