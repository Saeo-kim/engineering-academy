// Regenerates the README screenshots in docs/screenshots/ from a fresh database
// holding only the built-in EXAMPLE records. Run: npm run screenshots
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from '../tests/e2e/cdp.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'docs', 'screenshots');
mkdirSync(out, { recursive: true });
const temp = mkdtempSync(join(tmpdir(), 'academy-shots-'));
const PORT = 4398;

const server = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', 'server/index.js'], {
  cwd: root,
  env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot, PORT: String(PORT), ACADEMY_DB: join(temp, 'shots.db') },
});
await new Promise((resolve, reject) => {
  let log = '';
  server.stdout.on('data', (c) => ((log += c), log.includes('running at') && resolve()));
  server.on('exit', (code) => reject(new Error(`Server exited (${code}): ${log}`)));
});

const page = await launch({ profileDir: join(temp, 'profile') });
const shot = async (name) => {
  await new Promise((r) => setTimeout(r, 250));
  await page.screenshot(join(out, `${name}.png`), writeFileSync);
  console.log(`  docs/screenshots/${name}.png`);
};

try {
  await page.goto(`http://127.0.0.1:${PORT}/`);
  await page.waitFor(`Boolean(document.getElementById('view').dataset.ready)`, { timeout: 8000 });
  await page.setViewport(1440, 900);
  await shot('dashboard');

  await page.route('#/knowledge/2');
  await shot('record-detail');

  await page.route('#/practice/knowledge/2/explain');
  await page.type('#practice-answer', 'The event loop lets a single-threaded runtime schedule work: it runs the current task, then drains the microtask queue, so promise callbacks run before a setTimeout callback.');
  await page.click('#check-answer');
  await page.waitFor(`document.querySelector('#practice-result')`);
  await page.evaluate(`document.querySelector('#practice-result').scrollIntoView()`);
  await shot('explain-back');

  await page.route('#/review');
  await page.click('#start-review');
  await page.click('#show-answer');
  await shot('review-center');

  await page.route('#/quiz');
  await page.click('#start-quiz');
  await page.waitFor(`document.querySelector('#quiz-run .question')`);
  await shot('assessment');

  await page.route('#/map');
  await page.waitFor(`document.querySelector('#map-svg')`);
  await shot('knowledge-map');

  await page.route('#/progress');
  await shot('progress');

  await page.setViewport(390, 844, true);
  await page.route('#/');
  await shot('mobile-dashboard');
} finally {
  await page.close();
  server.kill();
  await new Promise((r) => setTimeout(r, 300));
  rmSync(temp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
