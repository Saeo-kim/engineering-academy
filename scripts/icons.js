// Rasterizes the app icons from the one master artwork, public/favicon.svg.
//
// The Engineering Academy icon is fixed (see docs/BRANDING.md). This script
// never designs anything: it only renders that master SVG onto the app's dark
// background at the sizes browsers and iOS require. Output is committed, and
// tests/brand.test.js locks every file by hash, so only run this after an
// explicitly approved change to the master artwork.
//
// Run: npm run icons
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from '../tests/e2e/cdp.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
const out = join(pub, 'icons');
mkdirSync(out, { recursive: true });

export const BACKGROUND = '#12181e';
const master = readFileSync(join(pub, 'favicon.svg'), 'utf8');
const viewBox = /viewBox="([^"]+)"/.exec(master)[1];
const inner = master.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

// The master artwork centred on a full-bleed square. `scale` is the share of
// the square the artwork fills: 0.8 for regular icons, 0.62 for maskable icons
// so the whole mark stays inside the 80% safe zone of any mask shape.
function composed(scale) {
  const size = 100 * scale;
  const offset = (100 - size) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${BACKGROUND}"/><svg x="${offset}" y="${offset}" width="${size}" height="${size}" viewBox="${viewBox}">${inner}</svg></svg>`;
}

const ICONS = [
  { file: 'icons/icon-32.png', size: 32, svg: master, transparent: true },
  { file: 'icons/apple-touch-icon.png', size: 180, svg: composed(0.8) },
  { file: 'icons/icon-192.png', size: 192, svg: composed(0.8) },
  { file: 'icons/icon-512.png', size: 512, svg: composed(0.8) },
  { file: 'icons/icon-maskable-512.png', size: 512, svg: composed(0.62) },
];

const temp = mkdtempSync(join(tmpdir(), 'academy-icons-'));
const page = await launch({ profileDir: join(temp, 'profile') });
try {
  for (const icon of ICONS) {
    await page.setViewport(icon.size, icon.size);
    await page.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: icon.transparent ? 0 : 1 } });
    const html = `<!doctype html><html><body style="margin:0;background:transparent">${icon.svg.replace('<svg ', `<svg width="${icon.size}" height="${icon.size}" style="display:block" `)}</body></html>`;
    await page.goto(`data:text/html;base64,${Buffer.from(html).toString('base64')}`);
    await page.waitFor(`document.readyState === 'complete' && document.querySelector('svg')`);
    await new Promise((r) => setTimeout(r, 150));
    await page.screenshot(join(pub, icon.file), writeFileSync);
    console.log(`  public/${icon.file} (${icon.size}×${icon.size})`);
  }
  // iOS also looks for this file at the site root when a page omits the link.
  copyFileSync(join(out, 'apple-touch-icon.png'), join(pub, 'apple-touch-icon.png'));
  console.log('  public/apple-touch-icon.png (copy)');
} finally {
  await page.close();
  rmSync(temp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
