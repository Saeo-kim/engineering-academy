// Renders each icons/*.svg to a 256px PNG with headless Chrome, then wraps it
// in a .ico (PNG-compressed ICO, supported since Windows Vista).
// Run: node scripts/icons/make-icons.mjs
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const cdp = pathToFileURL(join(here, '..', '..', 'engineering-academy', 'tests', 'e2e', 'cdp.js')).href;
const { launch } = await import(cdp);

function ico(pngs) {
  // pngs: [{ size, data }]
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const entries = [];
  let offset = 6 + 16 * pngs.length;
  for (const { size, data } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

const page = await launch({ profileDir: mkdtempSync(join(tmpdir(), 'icons-')), width: 256, height: 256 });
try {
  await page.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  for (const file of readdirSync(here).filter((f) => f.endsWith('.svg'))) {
    const svg = readFileSync(join(here, file), 'utf8');
    const pngs = [];
    for (const size of [256, 48, 32]) {
      await page.setViewport(size, size);
      const html = `<html><head><meta charset="utf-8"></head><body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`;
      await page.goto(`data:text/html;base64,${Buffer.from(html).toString('base64')}`);
      await new Promise((r) => setTimeout(r, 300));
      const { data } = await page.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: size, height: size, scale: 1 } });
      pngs.push({ size, data: Buffer.from(data, 'base64') });
    }
    const name = file.replace(/\.svg$/, '');
    writeFileSync(join(here, `${name}.png`), pngs[0].data);
    writeFileSync(join(here, `${name}.ico`), ico(pngs));
    console.log(`icon: ${name}.ico`);
  }
} finally {
  await page.close();
}
