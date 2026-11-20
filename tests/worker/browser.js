// Browser test of a running deployment, driven through the real interface.
//   node tests/worker/browser.js <base-url> <password>
// It creates one record named "Browser test <time>", edits it, checks it
// survives a reload, deletes it, and signs out. Nothing else is touched.
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { launch } from '../e2e/cdp.js';

const [base, password] = process.argv.slice(2);
if (!base || !password) {
  console.error('Usage: node tests/worker/browser.js <base-url> <password>');
  process.exit(2);
}
const url = new URL(base);
const temp = mkdtempSync(join(tmpdir(), 'ea-browser-'));
const page = await launch({ profileDir: join(temp, 'profile') });
const problems = [];
page.on('Runtime.exceptionThrown', (e) => problems.push(`exception: ${e.exceptionDetails.exception?.description ?? e.exceptionDetails.text}`));
page.on('Runtime.consoleAPICalled', (e) => {
  if (e.type === 'error') problems.push(`console.error: ${e.args.map((a) => a.value ?? a.description).join(' ')}`);
});
await page.setViewport(390, 844, true); // iPhone 14 class, touch
const results = [];
const step = async (name, fn) => {
  try {
    await fn();
    results.push({ ok: true, name });
    console.log(`  pass  ${name}`);
  } catch (err) {
    results.push({ ok: false, name, err: err.message });
    console.log(`  FAIL  ${name}\n        ${err.message}`);
  }
};
const h1 = () => page.text('#view h1');
const title = `Browser test ${Date.now()}`;
let recordId;
const shot = (name) => page.screenshot(join(temp, `${name}.png`), writeFileSync);

await page.goto(base);
await page.waitFor(`document.querySelector('#login-password') || document.querySelector('#view h1')`, { timeout: 20000, label: 'app loads' });

await step('Sign-in screen renders on a phone and is readable', async () => {
  if (await page.exists('#view h1')) return; // already signed in from an earlier run
  await page.waitFor(`document.querySelector('#login-form')`);
  const overflow = await page.evaluate('document.documentElement.scrollWidth - window.innerWidth');
  assert.ok(overflow <= 0, `login overflows by ${overflow}px`);
  const fontSize = await page.evaluate(`parseFloat(getComputedStyle(document.getElementById('login-password')).fontSize)`);
  assert.ok(fontSize >= 16, 'password field is 16px+ so iPhone Safari does not zoom');
});

await step('A wrong password is refused with a clear message', async () => {
  if (await page.exists('#view h1')) return;
  await page.type('#login-password', 'definitely wrong password');
  await page.click('#login-submit');
  await page.waitFor(`document.querySelector('#login-form .form-error:not([hidden])')`, { label: 'error shown' });
  await page.evaluate(`document.getElementById('login-password').value = ''`);
});

await step('The correct password signs in and opens the dashboard', async () => {
  if (!(await page.exists('#view h1'))) {
    await page.type('#login-password', password);
    await page.click('#login-submit');
  }
  await page.waitFor(`document.querySelector('#view h1')?.innerText === 'Dashboard'`, { timeout: 15000, label: 'dashboard' });
  assert.ok(await page.exists('#sign-out'), 'sign-out button is offered');
});

await step('Every navigation item opens its page', async () => {
  const routes = ['#/capture', '#/knowledge', '#/errors', '#/commands', '#/workflows', '#/review', '#/quiz', '#/map', '#/progress', '#/search', '#/courses', '#/courses/robotics', '#/install'];
  for (const route of routes) {
    await page.route(route);
    const heading = await h1();
    assert.ok(heading && heading.length > 0, `${route} has a heading`);
    assert.ok(!(await page.exists('#view .empty h3')) || (await page.text('#view .empty h3')) !== 'Could not load this page', `${route} loaded`);
  }
});

await step('Create a record through the form', async () => {
  await page.route('#/knowledge/new');
  await page.type('#f-title', title);
  await page.type('#f-what_is_it', 'Created by the production browser test.');
  await page.click('#save-record');
  await page.waitFor(`/^#\\/knowledge\\/\\d+$/.test(location.hash)`, { label: 'redirect to record', timeout: 10000 });
  recordId = Number((await page.evaluate('location.hash')).split('/').pop());
  // The record page renders after the URL changes; wait for its title rather than reading early.
  await page.waitFor(`document.querySelector('#view h1')?.innerText === ${JSON.stringify(title)}`, { label: 'record page rendered', timeout: 15000 });
});

await step('Edit the record and see the change', async () => {
  await page.route(`#/knowledge/${recordId}/edit`);
  await page.evaluate(`(() => { const el = document.getElementById('f-title'); el.value = ''; })()`);
  await page.type('#f-title', `${title} (edited)`);
  await page.click('#save-record');
  await page.waitFor(`document.querySelector('#view h1')?.innerText === ${JSON.stringify(`${title} (edited)`)}`, { label: 'edited title' });
});

await step('The record survives a reload and a fresh visit', async () => {
  await page.reload();
  await page.waitFor(`document.querySelector('#view h1')?.innerText === ${JSON.stringify(`${title} (edited)`)}`, { label: 'after reload', timeout: 15000 });
  await page.route('#/search?q=' + encodeURIComponent(title));
  await page.waitFor(`document.querySelectorAll('#view a').length > 0`);
  assert.ok((await page.text('#view')).includes(`${title} (edited)`), 'found by search');
});

await step('The record can be deleted, and it is gone', async () => {
  await page.route(`#/knowledge/${recordId}`);
  await page.click('#delete-record');
  await page.waitFor(`document.querySelector('dialog[open]')`);
  await page.click('dialog[open] [data-action="confirm"]');
  await page.waitFor(`!location.hash.startsWith('#/knowledge/${recordId}')`, { label: 'left deleted record', timeout: 10000 });
  const status = await page.evaluate(`fetch('/api/knowledge/${recordId}').then((r) => r.status)`);
  assert.equal(status, 404);
});

await step('Course progress is saved and restored', async () => {
  await page.route('#/courses/robotics/types-of-robots');
  await page.waitFor(`document.getElementById('lesson-complete')`);
  const before = await page.evaluate(`document.getElementById('lesson-complete').getAttribute('aria-pressed')`);
  await page.click('#lesson-complete');
  await page.waitFor(`document.getElementById('lesson-complete').getAttribute('aria-pressed') !== ${JSON.stringify(before)}`);
  await page.reload();
  await page.waitFor(`document.getElementById('lesson-complete')`, { timeout: 15000 });
  const after = await page.evaluate(`document.getElementById('lesson-complete').getAttribute('aria-pressed')`);
  assert.notEqual(after, before, 'completion survives reload');
  await page.click('#lesson-complete'); // leave the database as it was
});

await step('Installed-app files are served and the page is installable', async () => {
  const manifest = await page.evaluate(`fetch('/manifest.webmanifest').then((r) => r.json())`);
  assert.equal(manifest.display, 'standalone');
  for (const icon of manifest.icons) assert.equal(await page.evaluate(`fetch(${JSON.stringify(icon.src)}).then((r) => r.status)`), 200, icon.src);
  assert.equal(await page.evaluate(`fetch('/sw.js').then((r) => r.status)`), 200);
});

await step('No horizontal scrolling on phone-sized screens', async () => {
  for (const route of ['#/', '#/knowledge', '#/courses/robotics', '#/courses/robotics/pid-control']) {
    await page.route(route);
    const overflow = await page.evaluate('document.documentElement.scrollWidth - window.innerWidth');
    assert.ok(overflow <= 0, `${route} overflows by ${overflow}px`);
  }
  await shot('mobile-dashboard');
});

await step('Sign out ends the session, and the data is locked again', async () => {
  await page.route('#/');
  await page.click('#sign-out');
  await page.waitFor(`document.querySelector('#login-form')`, { label: 'login after sign out' });
  assert.equal(await page.evaluate(`fetch('/api/dashboard').then((r) => r.status)`), 401);
});

await step('Signing back in restores access', async () => {
  await page.type('#login-password', password);
  await page.click('#login-submit');
  await page.waitFor(`document.querySelector('#view h1')?.innerText === 'Dashboard'`, { timeout: 15000 });
});

await step('No uncaught exceptions or console errors', async () => {
  assert.deepEqual(problems, []);
});

await page.close();
rmSync(temp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} browser checks passed against ${url.origin}`);
process.exit(failed ? 1 : 0);
