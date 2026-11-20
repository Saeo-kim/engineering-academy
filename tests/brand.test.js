// Locks the Engineering Academy app icon. The icon is the app's permanent
// identity (docs/BRANDING.md): the same artwork on the website, in the PWA
// manifest, on the iPhone Home Screen and everywhere else.
//
// If this test fails, an icon file changed. Do not update the hashes unless
// the owner explicitly asked for a new icon; restore the files instead.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const sha256 = (file) => createHash('sha256').update(readFileSync(join(pub, file))).digest('hex');

export const ICON_LOCK = {
  'favicon.svg': '0845992543d8cafc6b15b982cc7ffa4a67074e25a5c48b93082f5cd582b93765', // master artwork
  'icons/icon-32.png': 'f7d094633ddf7c3d5724d0eb872039c2e1849da499db31d48ebe5096b75fb919',
  'icons/apple-touch-icon.png': '4f4c1a52f0b32cc480ac734a914a74468618e488f2d54522e0773015351b9b39',
  'apple-touch-icon.png': '4f4c1a52f0b32cc480ac734a914a74468618e488f2d54522e0773015351b9b39',
  'icons/icon-192.png': 'dc17ed769f5b2153e523e6fbc67031945b23af6b2b4a2030cd5ad32d530bd64a',
  'icons/icon-512.png': '5dcf403b9bf5df03b0578e92350c7771730698fa83bbae7cced93196570632be',
  'icons/icon-maskable-512.png': '2f65e0bd08fdd14593e3a5a6a21595f060ec055efa2b3875dfd042d492a419b8',
};

describe('app icon and branding', () => {
  it('keeps every icon file byte-for-byte identical to the approved icon', () => {
    for (const [file, hash] of Object.entries(ICON_LOCK)) assert.equal(sha256(file), hash, `${file} changed; see docs/BRANDING.md`);
  });

  it('uses only the locked icons in the manifest and the page', () => {
    const manifest = JSON.parse(readFileSync(join(pub, 'manifest.webmanifest'), 'utf8'));
    const used = [...manifest.icons, ...manifest.shortcuts.flatMap((s) => s.icons)].map((i) => i.src.slice(1));
    for (const src of used) assert.ok(src in ICON_LOCK, `manifest uses unlocked icon ${src}`);

    const html = readFileSync(join(pub, 'index.html'), 'utf8');
    const refs = [...html.matchAll(/<(?:link|img)[^>]+(?:href|src)="\/([^"]+\.(?:png|svg))"/g)].map((m) => m[1]);
    assert.ok(refs.includes('favicon.svg') && refs.includes('icons/apple-touch-icon.png'));
    for (const src of refs) assert.ok(src in ICON_LOCK, `index.html uses unlocked icon ${src}`);
  });

  it('keeps the name and colours consistent', () => {
    const manifest = JSON.parse(readFileSync(join(pub, 'manifest.webmanifest'), 'utf8'));
    const html = readFileSync(join(pub, 'index.html'), 'utf8');
    assert.equal(manifest.name, 'Engineering Academy');
    assert.equal(manifest.short_name, 'Eng Academy');
    assert.match(html, new RegExp(`apple-mobile-web-app-title" content="${manifest.short_name}"`));
    assert.match(html, new RegExp(`theme-color" content="${manifest.theme_color}"`));
  });
});
