// The service worker caches the app shell under a version that is a hash of
// every cached file. Any change to the app changes the hash, which changes
// sw.js, which makes phones download the new version as one consistent set.
//   node scripts/sw-version.js          update public/sw.js
//   node scripts/sw-version.js --check  exit 1 if it is out of date
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const swPath = join(pub, 'sw.js');

export function shellFiles(sw = readFileSync(swPath, 'utf8')) {
  return [...sw.matchAll(/^\s+'(\/[^']*)',$/gm)].map((m) => m[1]);
}

export function computeVersion(sw = readFileSync(swPath, 'utf8')) {
  const hash = createHash('sha256');
  for (const url of shellFiles(sw)) {
    hash.update(url);
    hash.update(readFileSync(join(pub, url === '/' ? 'index.html' : url.slice(1))));
  }
  return hash.digest('hex').slice(0, 12);
}

const VERSION_LINE = /^const VERSION = '([0-9a-f]*)';$/m;

export function currentVersion(sw = readFileSync(swPath, 'utf8')) {
  return VERSION_LINE.exec(sw)?.[1];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const sw = readFileSync(swPath, 'utf8');
  const version = computeVersion(sw);
  if (process.argv.includes('--check')) {
    if (currentVersion(sw) !== version) {
      console.error(`public/sw.js VERSION is out of date (expected ${version}). Run: node scripts/sw-version.js`);
      process.exit(1);
    }
  } else if (currentVersion(sw) !== version) {
    writeFileSync(swPath, sw.replace(VERSION_LINE, `const VERSION = '${version}';`));
    console.log(`public/sw.js VERSION → ${version}`);
  } else {
    console.log(`public/sw.js VERSION is current (${version})`);
  }
}
