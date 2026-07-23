import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

async function generateIcons() {
  const source = path.join(root, 'public', 'boxzz-logo.png');
  const iconsDir = path.join(root, 'public', 'icons');

  if (!fs.existsSync(source)) {
    console.error('Source not found:', source);
    process.exit(1);
  }

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
    console.log('Created icons directory');
  }

  const sizes = [
    { size: 192, name: 'icon-192x192.png' },
    { size: 384, name: 'icon-384x384.png' },
    { size: 512, name: 'icon-512x512.png' },
  ];

  for (const { size, name } of sizes) {
    const outPath = path.join(iconsDir, name);
    await sharp(source)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(outPath);
    console.log('Created:', path.relative(root, outPath));
  }

  const appleIcon = path.join(root, 'public', 'apple-touch-icon.png');
  await sharp(source)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(appleIcon);
  console.log('Created:', path.relative(root, appleIcon));
}

generateIcons().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
</｜｜DSML｜｜>