const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const root = process.cwd();

async function gen() {
  const source = path.join(root, 'public', 'boxzz-logo.png');
  const iconsDir = path.join(root, 'public', 'icons');

  if (!fs.existsSync(source)) {
    console.error('Source file not found:', source);
    process.exit(1);
  }

  const meta = await sharp(source).metadata();
  console.log('Source metadata:', JSON.stringify(meta));

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
    console.log('Created icons directory');
  }

  for (const size of [192, 384, 512]) {
    const out = path.join(iconsDir, `icon-${size}x${size}.png`);
    await sharp(source)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(out);
    console.log(`✓ Created icon-${size}x${size}.png`);
  }

  const appleIcon = path.join(root, 'public', 'apple-touch-icon.png');
  await sharp(source)
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(appleIcon);
  console.log('✓ Created apple-touch-icon.png');

  // Verify
  const files = fs.readdirSync(iconsDir);
  console.log('Icons directory contents:', files);
  console.log('Done!');
}

gen().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});