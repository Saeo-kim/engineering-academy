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
for (const [, ref] of html.matchAll(/(?:src|href)="\/([^"]+\.(?:js|css|svg))"/g)) {
  if (!existsSync(join(root, 'public', ref))) failures.push(`index.html references missing file: ${ref}`);
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
