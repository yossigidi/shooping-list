const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const maskableSizes = [192, 512];

// SVG icon template - ListNest brand (nest + list concept)
function createIconSVG(size, maskable = false) {
    const padding = maskable ? size * 0.1 : 0;
    const innerSize = size - (padding * 2);
    const scale = innerSize / 100;
    const offset = padding;

    return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#F97316"/>
      <stop offset="50%" style="stop-color:#FB923C"/>
      <stop offset="100%" style="stop-color:#FBBF24"/>
    </linearGradient>
    <clipPath id="rounded">
      <rect x="0" y="0" width="${size}" height="${size}" rx="${maskable ? 0 : size * 0.22}" ry="${maskable ? 0 : size * 0.22}"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" fill="url(#grad)" clip-path="url(#rounded)"/>

  <!-- Nest shape (curved lines) -->
  <g transform="translate(${offset + innerSize * 0.1}, ${offset + innerSize * 0.15})" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="${scale * 3}">
    <path d="M${10 * scale} ${55 * scale} Q${40 * scale} ${75 * scale} ${70 * scale} ${55 * scale}"/>
    <path d="M${15 * scale} ${48 * scale} Q${40 * scale} ${65 * scale} ${65 * scale} ${48 * scale}"/>
  </g>

  <!-- Shopping list icon -->
  <g transform="translate(${offset + innerSize * 0.22}, ${offset + innerSize * 0.15})" fill="white">
    <!-- List paper -->
    <rect x="0" y="0" width="${56 * scale}" height="${65 * scale}" rx="${6 * scale}" fill="white" opacity="0.95"/>

    <!-- List lines with checkboxes -->
    <g fill="none" stroke="#F97316" stroke-width="${scale * 2.5}">
      <!-- Checkbox 1 - checked -->
      <rect x="${6 * scale}" y="${10 * scale}" width="${10 * scale}" height="${10 * scale}" rx="${2 * scale}"/>
      <path d="M${8 * scale} ${15 * scale} L${11 * scale} ${18 * scale} L${18 * scale} ${11 * scale}" stroke="#22C55E" stroke-width="${scale * 3}"/>
      <line x1="${22 * scale}" y1="${15 * scale}" x2="${48 * scale}" y2="${15 * scale}" stroke="#9CA3AF" stroke-width="${scale * 2}"/>

      <!-- Checkbox 2 - checked -->
      <rect x="${6 * scale}" y="${26 * scale}" width="${10 * scale}" height="${10 * scale}" rx="${2 * scale}"/>
      <path d="M${8 * scale} ${31 * scale} L${11 * scale} ${34 * scale} L${18 * scale} ${27 * scale}" stroke="#22C55E" stroke-width="${scale * 3}"/>
      <line x1="${22 * scale}" y1="${31 * scale}" x2="${42 * scale}" y2="${31 * scale}" stroke="#9CA3AF" stroke-width="${scale * 2}"/>

      <!-- Checkbox 3 - unchecked -->
      <rect x="${6 * scale}" y="${42 * scale}" width="${10 * scale}" height="${10 * scale}" rx="${2 * scale}"/>
      <line x1="${22 * scale}" y1="${47 * scale}" x2="${45 * scale}" y2="${47 * scale}" stroke="#374151" stroke-width="${scale * 2}"/>
    </g>
  </g>

  <!-- Family hearts/warmth indicator -->
  <g transform="translate(${offset + innerSize * 0.65}, ${offset + innerSize * 0.55})">
    <text x="0" y="${15 * scale}" font-size="${18 * scale}" fill="white">🏠</text>
  </g>
</svg>`;
}

async function generateIcons() {
    const iconsDir = path.join(__dirname, 'icons');

    // Create icons directory if it doesn't exist
    if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir, { recursive: true });
    }

    console.log('Generating ListNest icons...\n');

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

    console.log('\nAll ListNest icons generated successfully!');
}

generateIcons().catch(console.error);
