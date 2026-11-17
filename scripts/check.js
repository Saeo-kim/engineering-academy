// The app ships plain ES modules, so there is nothing to compile.
// "Build" means: every source file must parse, and every file index.html
// references must exist. Exits non-zero if anything fails.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (name === 'node_modules' || name === '.artifacts') return [];
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const sources = ['server', 'public', 'tests', 'scripts']
  .flatMap((d) => walk(join(root, d)))
  .filter((p) => p.endsWith('.js'));

for (const file of sources) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (err) {
    failures.push(`${relative(root, file)}\n${err.stderr}`);
  }
}

const html = readFileSync(join(root, 'public/index.html'), 'utf8');
for (const [, ref] of html.matchAll(/(?:src|href)="\/([^"]+\.(?:js|css|svg|png|webmanifest))"/g)) {
  if (!existsSync(join(root, 'public', ref))) failures.push(`index.html references missing file: ${ref}`);
}

// The web app manifest must parse and every icon it lists must exist.
try {
  const manifest = JSON.parse(readFileSync(join(root, 'public/manifest.webmanifest'), 'utf8'));
  for (const field of ['name', 'short_name', 'start_url', 'display', 'icons']) {
    if (!manifest[field]) failures.push(`manifest.webmanifest is missing "${field}"`);
  }
  const icons = [...manifest.icons, ...(manifest.shortcuts ?? []).flatMap((s) => s.icons ?? [])];
  for (const { src } of icons) {
    if (!existsSync(join(root, 'public', src))) failures.push(`manifest.webmanifest references missing icon: ${src}`);
  }
} catch (err) {
  failures.push(`manifest.webmanifest is not valid JSON: ${err.message}`);
}

// Every file the service worker pre-caches must exist, and every view module
// must be pre-cached, or the installed app breaks offline.
const sw = readFileSync(join(root, 'public/sw.js'), 'utf8');
const shell = [...sw.matchAll(/^\s+'(\/[^']*)',$/gm)].map((m) => m[1]);
for (const url of shell) {
  const file = url === '/' ? 'index.html' : url.slice(1);
  if (!existsSync(join(root, 'public', file))) failures.push(`sw.js pre-caches missing file: ${url}`);
}
for (const file of sources.filter((p) => p.startsWith(join(root, 'public')) && !p.endsWith('sw.js'))) {
  const url = `/${relative(join(root, 'public'), file).split('\\').join('/')}`;
  if (!shell.includes(url)) failures.push(`sw.js does not pre-cache ${url}`);
}

// The service worker version must match the files it caches, or phones
// would keep running an old copy of the app.
{
  const { computeVersion, currentVersion } = await import('./sw-version.js');
  const expected = computeVersion();
  if (currentVersion() !== expected) failures.push(`public/sw.js VERSION is out of date (expected ${expected}). Run: node scripts/sw-version.js`);
}

// Relative imports must resolve, since browsers fail on them only at runtime.
for (const file of sources) {
  const text = readFileSync(file, 'utf8');
  for (const [, spec] of text.matchAll(/from\s+'(\.[^']+)'/g)) {
    if (!existsSync(join(dirname(file), spec))) {
      failures.push(`${relative(root, file)}: cannot resolve import ${spec}`);
    }
  }
}

if (failures.length) {
  console.error(`Build check failed:\n\n${failures.join('\n')}`);
  process.exit(1);
}
console.log(`Build check passed: ${sources.length} JavaScript files parse and all references resolve.`);
