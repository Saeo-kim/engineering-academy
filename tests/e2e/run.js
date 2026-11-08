// End-to-end suite: drives the real app in headless Chrome or Edge against a
// throwaway database. It never touches data/academy.db or your browser profile.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './cdp.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const artifacts = join(here, '.artifacts');
mkdirSync(artifacts, { recursive: true });

const temp = mkdtempSync(join(tmpdir(), 'academy-e2e-'));
const PORT = 4399;
const BASE = `http://127.0.0.1:${PORT}/`;

let server;
function startServer() {
  return new Promise((resolve, reject) => {
    server = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', 'server/index.js'], {
      cwd: root,
      env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot, PORT: String(PORT), ACADEMY_DB: join(temp, 'e2e.db') },
    });
    let log = '';
    const onData = (chunk) => {
      log += chunk;
      if (log.includes('running at')) resolve();
    };
    server.stdout.on('data', onData);
    server.stderr.on('data', onData);
    server.on('exit', (code) => reject(new Error(`Server exited (${code}):\n${log}`)));
  });
}

function stopServer() {
  return new Promise((resolve) => {
    server.removeAllListeners('exit');
    server.once('exit', resolve);
    server.kill();
  });
}

const page = await launch({ profileDir: join(temp, 'profile') });
const problems = [];
page.on('Runtime.exceptionThrown', (e) => problems.push(`exception: ${e.exceptionDetails.exception?.description ?? e.exceptionDetails.text}`));
page.on('Runtime.consoleAPICalled', (e) => {
  if (e.type === 'error') problems.push(`console.error: ${e.args.map((a) => a.value ?? a.description).join(' ')}`);
});
page.on('Log.entryAdded', ({ entry }) => {
  // Network-level 4xx lines are expected from the validation tests.
  if (entry.level === 'error' && entry.source !== 'network') problems.push(`${entry.source}: ${entry.text}`);
});

const shot = (name) => page.screenshot(join(artifacts, `${name}.png`), writeFileSync);
const h1 = () => page.text('#view h1');

const results = [];
async function step(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  pass  ${name}`);
  } catch (err) {
    results.push({ name, ok: false, err });
    console.log(`  FAIL  ${name}\n        ${String(err.message).split('\n').join('\n        ')}`);
    await shot(`FAIL-${results.length}`).catch(() => {});
  }
}

async function confirmModal(action) {
  await page.waitFor(`document.querySelector('dialog[open]')`, { label: 'dialog' });
  await page.click(`dialog[open] [data-action="${action}"]`);
  await page.waitFor(`!document.querySelector('dialog[open]')`, { label: 'dialog closed' });
}

const statValue = (label) => page.evaluate(`Number(document.querySelector('[data-stat="${label}"] .stat-value').innerText)`);

await startServer();
await page.goto(BASE);
await page.waitFor(`Boolean(document.getElementById('view').dataset.ready)`, { label: 'first render', timeout: 8000 });

let knowledgeHash;

await step('Dashboard shows totals, recent captures, activity, and studied concepts', async () => {
  assert.equal(await h1(), 'Dashboard');
  assert.equal(await statValue('Knowledge entries'), 5);
  assert.equal(await statValue('Recorded errors'), 3);
  assert.equal(await statValue('Saved commands'), 3);
  assert.ok((await page.count('#recent-captures li')) > 0);
  assert.ok((await page.count('#recently-studied li')) > 0);
  assert.equal(await page.count('#heatmap .cell'), 182);
  assert.ok((await page.count('#heatmap .cell.l1, #heatmap .cell.l2, #heatmap .cell.l3, #heatmap .cell.l4')) > 0);
  assert.match(await page.text('.notice'), /11 example records/);
  assert.ok((await page.count('#recent-captures .badge.sample')) > 0, 'examples are labelled');
  await shot('dashboard');
});

await step('Sidebar navigation reaches every section', async () => {
  const expected = [
    ['Quick Capture', 'Quick Capture'],
    ['Knowledge Library', 'Knowledge Library'],
    ['Error Archive', 'Error Archive'],
    ['Command Library', 'Command Library'],
    ['Search', 'Search'],
    ['Dashboard', 'Dashboard'],
  ];
  for (const [link, heading] of expected) {
    const before = await page.evaluate(`document.getElementById('view').dataset.ready`);
    await page.evaluate(`[...document.querySelectorAll('.nav-link')].find((a) => a.innerText.trim() === ${JSON.stringify(link)}).click()`);
    await page.waitFor(`document.getElementById('view').dataset.ready !== ${JSON.stringify(before)}`, { label: link });
    assert.equal(await h1(), heading);
    assert.equal(await page.text('.nav-link.active'), link);
  }
});

await step('Create a knowledge entry through the form', async () => {
  await page.route('#/knowledge');
  await page.click('#new-record');
  await page.waitFor(`document.querySelector('#record-form')`);
  await page.type('#f-title', 'E2E Quantum Widget');
  await page.select('#f-category', 'DevOps');
  await page.type('#f-tags', 'e2e, Widgets');
  await page.type('#f-content', 'captured text');
  await page.type('#f-what_is_it', 'A widget for testing.');
  await page.type('#f-why_needed', 'To prove `saving` works.');
  await page.type('#f-how_it_works', 'Step one.\n\nStep two.');
  await page.type('#f-real_example', '```js\nconsole.log("hi");\n```');
  await page.type('#f-exercise', 'Run the suite.');
  await page.click('#save-record');
  await page.waitFor(`document.querySelector('#detail h1')?.innerText === 'E2E Quantum Widget'`);
  knowledgeHash = await page.evaluate('location.hash');
  assert.match(knowledgeHash, /^#\/knowledge\/\d+$/);
  for (const heading of ['What is it?', 'Why is it needed?', 'How does it work?', 'Real-world example', 'Practical exercise', 'Related knowledge']) {
    assert.ok((await page.text('#detail')).includes(heading), heading);
  }
  assert.match(await page.text('.meter-label'), /5 of 5/);
  assert.equal(await page.text('[data-field="real_example"] pre'), 'console.log("hi");');
  assert.equal(await page.text('[data-field="why_needed"] p code'), 'saving');
  await shot('knowledge-detail');
});

await step('Validation error is shown when a required field is empty', async () => {
  await page.route('#/knowledge/new');
  await page.click('#save-record');
  await page.waitFor(`document.querySelector('.form-error:not([hidden])')`);
  assert.match(await page.text('.form-error'), /required/i);
  assert.match(await page.evaluate('location.hash'), /new$/);
});

await step('Edit a knowledge entry', async () => {
  await page.route(knowledgeHash);
  await page.click('#edit-record');
  await page.waitFor(`document.querySelector('#f-title')?.value === 'E2E Quantum Widget'`);
  assert.equal(await page.evaluate(`document.querySelector('#f-category').value`), 'DevOps');
  assert.equal(await page.evaluate(`document.querySelector('#f-tags').value`), 'e2e, widgets');
  await page.type('#f-title', 'E2E Quantum Widget v2');
  await page.type('#f-exercise', 'Edited exercise.');
  await page.click('#save-record');
  await page.waitFor(`document.querySelector('#detail h1')?.innerText === 'E2E Quantum Widget v2'`);
  assert.ok((await page.text('[data-field="exercise"]')).includes('Edited exercise.'));
});

await step('Data persists after a browser refresh', async () => {
  await page.reload();
  await page.waitFor(`document.querySelector('#detail h1')?.innerText === 'E2E Quantum Widget v2'`);
  assert.ok((await page.text('[data-field="exercise"]')).includes('Edited exercise.'));
});

await step('Data persists after the server restarts', async () => {
  await stopServer();
  await startServer();
  await page.reload();
  await page.waitFor(`document.querySelector('#detail h1')?.innerText === 'E2E Quantum Widget v2'`);
  await page.route('#/');
  assert.equal(await statValue('Knowledge entries'), 6, 'no duplicate seeding on restart');
});

await step('Global search finds saved knowledge and highlights it', async () => {
  await page.route('#/');
  await page.type('#global-search', 'quantum wid');
  await page.waitFor(`document.querySelector('#search-summary')?.innerText.includes('1 result')`);
  assert.equal(await page.text('#search-results h3'), 'E2E Quantum Widget v2');
  assert.equal(await page.count('#search-results h3 mark'), 2);
  await page.click('#search-results a');
  await page.waitFor(`document.querySelector('#detail h1')?.innerText === 'E2E Quantum Widget v2'`);
  assert.equal(await page.evaluate(`document.querySelector('#global-search').value`), '', 'search box clears on leaving');
});

await step('Global search spans knowledge, commands, and errors', async () => {
  await page.route('#/search?q=git');
  await page.waitFor(`document.querySelector('#search-results')`);
  const kinds = await page.evaluate(`[...new Set([...document.querySelectorAll('#search-results a')].map((a) => a.dataset.kind))].sort().join()`);
  assert.equal(kinds, 'commands,errors,knowledge');
  await shot('search');
  await page.click('[data-tab="errors"]');
  await page.waitFor(`[...document.querySelectorAll('#search-results a')].every((a) => a.dataset.kind === 'errors')`);
});

await step('Search with no match shows an empty state', async () => {
  await page.route('#/search?q=zzzznothing');
  assert.equal(await page.text('#view .empty h3'), 'No results');
});

await step('Knowledge Library filters by category, type, search, and tag', async () => {
  await page.route('#/knowledge');
  await page.waitFor(`document.querySelector('#result-count')?.innerText === '6 knowledge entries'`);
  await shot('library');
  await page.click('[data-category="DevOps"]');
  await page.waitFor(`document.querySelector('#result-count').innerText.startsWith('1 ')`);
  assert.match(await page.evaluate('location.hash'), /category=DevOps/);
  await page.click('[data-category=""]');
  await page.waitFor(`document.querySelector('#result-count').innerText.startsWith('6 ')`);
  await page.select('.filter select[name="type"]', 'ai_explanation');
  await page.waitFor(`document.querySelector('#result-count').innerText.startsWith('2 ')`);
  await page.select('.filter select[name="type"]', '');
  await page.type('#list-search', 'B-tree');
  await page.waitFor(`document.querySelector('#result-count').innerText.startsWith('1 ')`);
  assert.equal(await page.text('#results h3'), 'How a B-tree index speeds up a WHERE clause');
  assert.equal(await page.evaluate(`document.activeElement.id`), 'list-search', 'focus kept while filtering');
  await page.reload();
  await page.waitFor(`document.querySelector('#result-count')?.innerText.startsWith('1 ')`);
  assert.equal(await page.evaluate(`document.querySelector('#list-search').value`), 'B-tree', 'filters survive refresh');
  await page.route('#/knowledge?tag=jpa');
  await page.waitFor(`document.querySelector('#result-count')?.innerText.startsWith('1 ')`);
});

await step('Quick Capture saves every capture type to the right collection', async () => {
  const cases = [
    ['command', 'Command Library', 'commands', 'docker ps --all'],
    ['output', 'Knowledge Library', 'knowledge', 'CONTAINER ID   IMAGE'],
    ['error', 'Error Archive', 'errors', 'NullPointerException at Foo.java:12'],
    ['snippet', 'Knowledge Library', 'knowledge', 'const capturedSnippet = 1;'],
    ['ai_explanation', 'Knowledge Library', 'knowledge', 'Explained by the assistant.'],
    ['note', 'Knowledge Library', 'knowledge', 'A plain technical note.'],
  ];
  for (const [type, destination, kind, content] of cases) {
    await page.route('#/capture');
    await page.click(`input[name="capture_type"][value="${type}"]`);
    await page.type('#c-content', content);
    await page.type('#c-tags', 'captured');
    await page.select('#c-category', 'DevOps');
    assert.equal(await page.evaluate(`document.querySelector('#c-date').value.length`), 10, 'date defaults to today');
    await page.click('#capture-save');
    const savedNotice = `Saved to the ${destination}: ${content.replace(/\s+/g, ' ')}`; // innerText collapses spaces
    await page.waitFor(`document.querySelector('#capture-result .notice')?.innerText.includes(${JSON.stringify(savedNotice)})`, { label: `saved ${type}` });
    assert.equal(await page.evaluate(`document.querySelector('#c-content').value`), '', 'form clears for next capture');
    const results = await page.evaluate(`fetch('/api/${kind}?q=' + encodeURIComponent(${JSON.stringify(content)})).then((r) => r.json())`);
    assert.equal(results.length, 1, `${type} stored`);
    assert.equal(results[0].title, content, 'title defaults to first line');
    assert.equal(results[0].category, 'DevOps');
    assert.deepEqual(results[0].tags, ['captured']);
  }
  await shot('capture-saved');
});

await step('Quick Capture rejects empty content', async () => {
  await page.route('#/');
  await page.route('#/capture');
  await page.click('#capture-save');
  await page.waitFor(`document.querySelector('.form-error:not([hidden])')`);
});

await step('Quick Capture warns about secrets before saving', async () => {
  await page.route('#/');
  await page.route('#/capture');
  assert.equal(await page.evaluate(`document.querySelector('#secret-warning').hidden`), true);
  await page.type('#c-content', 'export DB_PASSWORD=hunter2\npassword=hunter2');
  await page.waitFor(`!document.querySelector('#secret-warning').hidden`);
  assert.match(await page.text('#secret-warning'), /password or secret/);
  await shot('secret-warning');
  await page.evaluate(`(() => { const c = document.querySelector('#c-content'); c.value = ''; c.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await page.waitFor(`document.querySelector('#secret-warning').hidden`);
});

await step('Captured HTML is rendered as inert text (XSS)', async () => {
  const payload = '<img src=x onerror="window.__xss=1"><script>window.__xss=2</script>';
  await page.route('#/');
  await page.route('#/capture');
  await page.click('input[name="capture_type"][value="note"]');
  await page.type('#c-title', payload);
  await page.type('#c-content', `${payload}\n\n\`${payload}\``);
  await page.type('#c-tags', '<b>tag</b>');
  await page.click('#capture-save');
  await page.waitFor(`document.querySelector('#capture-result .notice')`);
  assert.equal(await page.count('#view img, #view script, #view b'), 0);
  await page.click('#capture-continue');
  await page.waitFor(`document.querySelector('#f-title')`);
  await page.route(await page.evaluate(`location.hash.replace('/edit', '')`));
  await page.waitFor(`document.querySelector('#detail')`);
  assert.equal(await page.text('#detail h1'), payload);
  assert.equal(await page.count('#view img, #view script, #view b'), 0);
  await page.route('#/');
  await page.route(`#/search?q=${encodeURIComponent('onerror')}`);
  await page.waitFor(`document.querySelector('#search-results')`);
  assert.equal(await page.count('#view img, #view script, #view b'), 0);
  await new Promise((r) => setTimeout(r, 200));
  assert.equal(await page.evaluate('window.__xss'), undefined);
});

let errorHash;
await step('Error Archive records every field and moves from Open to Resolved', async () => {
  await page.route('#/errors');
  await page.click('#new-record');
  await page.waitFor(`document.querySelector('#record-form')`);
  await page.type('#f-title', 'E2E Bean creation failure');
  await page.type('#f-error_message', 'org.springframework.beans.factory.BeanCreationException: boom');
  await page.select('#f-category', 'Spring Boot');
  await page.click('#save-record');
  await page.waitFor(`document.querySelector('#detail h1')?.innerText === 'E2E Bean creation failure'`);
  errorHash = await page.evaluate('location.hash');
  assert.match(await page.text('.detail-badges'), /Open/);

  await page.click('#edit-record');
  await page.waitFor(`document.querySelector('#f-root_cause')`);
  const values = {
    root_cause: 'Missing bean.',
    investigation: 'Read the trace.',
    solution: 'Added @Component.',
    files_affected: 'src/Foo.java',
    verification: 'App boots.',
    lessons: 'Read the first cause.',
  };
  for (const [field, value] of Object.entries(values)) await page.type(`#f-${field}`, value);
  await page.click('#save-record');
  await page.waitFor(`document.querySelector('#detail h1') && document.querySelector('[data-field="lessons"]')?.innerText.includes('Read the first cause.')`);
  for (const [field, value] of Object.entries(values)) assert.ok((await page.text(`[data-field="${field}"]`)).includes(value), field);
  assert.match(await page.text('.detail-badges'), /Resolved/);
  await shot('error-detail');

  await page.route('#/errors?status=resolved');
  await page.waitFor(`document.querySelector('#results')`);
  assert.ok((await page.text('#results')).includes('E2E Bean creation failure'));
  await shot('errors');
});

let commandHash;
await step('Command Library stores all fields and copies to the clipboard', async () => {
  await page.route('#/commands');
  await page.click('#new-record');
  await page.waitFor(`document.querySelector('#record-form')`);
  await page.type('#f-title', 'E2E list containers');
  await page.type('#f-command', 'docker container ls');
  await page.type('#f-purpose', 'See running containers.');
  await page.type('#f-explanation', 'ls lists.');
  await page.type('#f-expected_output', 'CONTAINER ID');
  await page.type('#f-common_mistakes', 'Forgetting -a.');
  await page.select('#link-picker', `knowledge:${knowledgeHash.split('/').pop()}`);
  await page.waitFor(`document.querySelectorAll('#link-chips .chip').length === 1`);
  await page.click('#save-record');
  await page.waitFor(`document.querySelector('#detail h1')?.innerText === 'E2E list containers'`);
  commandHash = await page.evaluate('location.hash');
  for (const heading of ['Purpose', 'Explanation', 'Expected output', 'Common mistakes', 'Related concepts']) {
    assert.ok((await page.text('#detail')).includes(heading), heading);
  }
  assert.ok((await page.text('#related')).includes('E2E Quantum Widget v2'));
  await shot('command-detail');

  await page.send('Browser.grantPermissions', { origin: BASE.slice(0, -1), permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'] }).catch(() => {});
  await page.evaluate(`window.focus()`);
  await page.click('.code-block .copy');
  await page.waitFor(`document.querySelector('.code-block .copy').innerText === 'Copied'`);
  assert.equal(await page.evaluate('navigator.clipboard.readText()'), 'docker container ls');

  await page.route('#/commands');
  await page.waitFor(`document.querySelector('#results')`);
  await shot('commands');
});

await step('Links appear on both records', async () => {
  await page.route(knowledgeHash);
  await page.waitFor(`document.querySelector('#related')`);
  assert.ok((await page.text('#related')).includes('E2E list containers'));
});

await step('Mark studied updates the record and the dashboard', async () => {
  await page.route(knowledgeHash);
  await page.waitFor(`document.querySelector('#study-status')?.innerText === 'Not studied yet'`);
  await page.click('#mark-studied');
  await page.waitFor(`document.querySelector('#study-status').innerText.startsWith('Studied 1×')`);
  await page.route('#/');
  assert.ok((await page.text('#recently-studied li')).includes('E2E Quantum Widget v2'));
  assert.ok((await statValue('Studied this week')) > 0);
});

await step('Unsaved-changes guard keeps text when navigation is cancelled', async () => {
  await page.route('#/');
  await page.route('#/capture');
  await page.type('#c-content', 'do not lose me');
  await page.evaluate(`location.hash = '#/knowledge'`);
  await confirmModal('cancel');
  await page.waitFor(`location.hash === '#/capture'`);
  assert.equal(await page.evaluate(`document.querySelector('#c-content').value`), 'do not lose me');
  await page.evaluate(`location.hash = '#/knowledge'`);
  await confirmModal('confirm');
  await page.waitFor(`document.querySelector('#view h1')?.innerText === 'Knowledge Library'`);
});

await step('Delete asks for confirmation, then removes the entry for good', async () => {
  await page.route(knowledgeHash);
  await page.click('#delete-record');
  await confirmModal('cancel');
  assert.equal(await h1(), 'E2E Quantum Widget v2');

  await page.click('#delete-record');
  await confirmModal('confirm');
  await page.waitFor(`location.hash === '#/knowledge' && document.querySelector('#view h1')?.innerText === 'Knowledge Library'`);
  assert.ok(!(await page.text('#results')).includes('E2E Quantum Widget v2'));
  await page.reload();
  await page.waitFor(`document.querySelector('#results')`);
  assert.ok(!(await page.text('#results')).includes('E2E Quantum Widget v2'));

  await page.route(knowledgeHash);
  assert.match(await page.text('#view .empty h3'), /no longer exists/);

  await page.route(commandHash);
  await page.waitFor(`document.querySelector('#related')`);
  assert.ok(!(await page.text('#related')).includes('E2E Quantum Widget'), 'link removed');
});

await step('Keyboard shortcuts and the activity chart interactions work', async () => {
  await page.route('#/capture/x');
  await page.route('#/');
  await page.evaluate(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true }))`);
  assert.equal(await page.evaluate('document.activeElement.id'), 'global-search');

  await page.evaluate(`document.querySelector('#heatmap .cell.l1, #heatmap .cell.l2, #heatmap .cell.l3, #heatmap .cell.l4').dispatchEvent(new MouseEvent('mouseenter'))`);
  assert.match(await page.text('#chart-tooltip'), /\d+ events?/);
  await page.evaluate(`document.querySelector('#heatmap .cell.l1, #heatmap .cell.l2, #heatmap .cell.l3, #heatmap .cell.l4').dispatchEvent(new MouseEvent('mouseleave'))`);
  assert.equal(await page.evaluate(`document.querySelector('#chart-tooltip').hidden`), true);

  await page.click('.data-table summary');
  assert.ok((await page.count('.data-table tbody tr')) > 0);
  assert.equal(await page.evaluate(`document.querySelector('.data-table').open`), true);

  await page.route('#/capture');
  await page.click('input[name="capture_type"][value="note"]');
  await page.type('#c-content', 'Saved with the keyboard');
  await page.evaluate(`document.querySelector('#c-content').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }))`);
  await page.waitFor(`document.querySelector('#capture-result .notice')?.innerText.includes('Saved with the keyboard')`);
});

await step('Layout has no horizontal overflow from phone to desktop', async () => {
  const routes = ['#/', '#/capture', '#/knowledge', '#/errors', '#/commands', '#/search?q=git', '#/knowledge/1', '#/errors/1', '#/commands/1', '#/knowledge/1/edit'];
  for (const [width, height, mobile] of [[390, 844, true], [768, 1024, false], [1024, 768, false], [1440, 900, false]]) {
    await page.setViewport(width, height, mobile);
    for (const route of routes) {
      await page.route('#/capture/x');
      await page.route(route);
      await new Promise((r) => setTimeout(r, 60));
      const overflow = await page.evaluate('document.documentElement.scrollWidth - window.innerWidth');
      assert.ok(overflow <= 0, `${route} overflows by ${overflow}px at ${width}px`);
      if (width === 390 && ['#/', '#/knowledge', '#/errors/1'].includes(route)) {
        await shot(`mobile-${route.replace(/\W+/g, '-')}`);
      }
    }
  }
  await page.setViewport(1440, 960);
});

await step('Example records can be removed and do not return', async () => {
  await page.route('#/');
  await page.click('#remove-samples');
  await confirmModal('confirm');
  await page.waitFor(`document.querySelector('[data-stat="Knowledge entries"]') && !document.querySelector('#remove-samples')`);
  assert.equal(await page.count('.badge.sample'), 0);
  assert.ok((await statValue('Knowledge entries')) > 0, 'own records stay');
  await stopServer();
  await startServer();
  await page.reload();
  await page.waitFor(`document.querySelector('[data-stat="Knowledge entries"]')`);
  assert.equal(await page.exists('#remove-samples'), false);
});

await step('Empty states render safely with no data at all', async () => {
  await page.evaluate(`(async () => {
    for (const kind of ['knowledge', 'commands', 'errors']) {
      const rows = await (await fetch('/api/' + kind)).json();
      for (const row of rows) await fetch('/api/' + kind + '/' + row.id, { method: 'DELETE' });
    }
  })()`);
  await page.route('#/capture');
  await page.route('#/');
  assert.equal(await page.text('#view .empty h3'), 'Nothing captured yet');
  assert.equal(await statValue('Knowledge entries'), 0);
  await shot('empty-dashboard');
  for (const [kind, heading] of [['knowledge', 'No knowledge entries yet'], ['errors', 'No error records yet'], ['commands', 'No commands yet']]) {
    await page.route(`#/${kind}`);
    await page.waitFor(`document.querySelector('#results .empty')`);
    assert.equal(await page.text('#results .empty h3'), heading);
  }
  await page.route(`#/knowledge/new`);
  assert.match(await page.text('#link-picker'), /No other records/);
});

await step('A stopped server shows a recoverable error, not a blank page', async () => {
  await stopServer();
  await page.evaluate(`location.hash = '#/knowledge'`);
  await page.waitFor(`document.querySelector('#view .empty h3')?.innerText === 'Could not load this page'`);
  await startServer();
  await page.click('#view .empty button');
  await page.waitFor(`document.querySelector('#view h1')?.innerText === 'Knowledge Library'`);
});

await step('No uncaught exceptions, console errors, or CSP violations', async () => {
  // The previous step stops the server on purpose, so its failed fetch is expected.
  assert.deepEqual(problems, []);
});

await page.close();
await stopServer();
rmSync(temp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} browser checks passed. Screenshots: tests/e2e/.artifacts/`);
process.exit(failed.length ? 1 : 0);
