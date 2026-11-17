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
function startServer(extraEnv = {}) {
  return new Promise((resolve, reject) => {
    server = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', 'server/index.js'], {
      cwd: root,
      env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot, PORT: String(PORT), ACADEMY_DB: join(temp, 'e2e.db'), ...extraEnv },
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
  assert.match(await page.text('.notice'), /13 example records/);
  assert.equal(await statValue('Workflows'), 2);
  assert.equal(await page.count('#learning-loop .loop-stages li'), 5);
  assert.ok((await page.count('#recent-captures .badge.sample')) > 0, 'examples are labelled');
  await shot('dashboard');
});

await step('Sidebar navigation reaches every section', async () => {
  const expected = [
    ['Quick Capture', 'Quick Capture'],
    ['Knowledge Library', 'Knowledge Library'],
    ['Error Archive', 'Error Archive'],
    ['Command Library', 'Command Library'],
    ['Workflows', 'Workflows'],
    ['Review Center', 'Review Center'],
    ['Assessment', 'Assessment'],
    ['Knowledge Map', 'Knowledge Map'],
    ['Progress', 'Progress'],
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

await step('Global search spans knowledge, commands, errors, and workflows', async () => {
  await page.route('#/search?q=git');
  await page.waitFor(`document.querySelector('#search-results')`);
  const kinds = await page.evaluate(`[...new Set([...document.querySelectorAll('#search-results a')].map((a) => a.dataset.kind))].sort().join()`);
  assert.equal(kinds, 'commands,errors,knowledge,workflows');
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
    ['workflow', 'Workflows', 'workflows', 'npm ci && npm test'],
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

await step('Workflows: create one through the form and see its numbered sections', async () => {
  await page.route('#/workflows');
  await page.waitFor(`document.querySelector('#result-count')?.innerText.startsWith('3 ')`); // 2 examples + 1 captured
  await page.click('#new-record');
  await page.waitFor(`document.querySelector('#record-form')`);
  await page.type('#f-title', 'E2E Release a version');
  await page.type('#f-goal', 'Publish a tagged release.');
  await page.type('#f-steps', 'npm test\ngit tag v1.0.0\ngit push --tags');
  await page.type('#f-verification', 'The tag is visible on the remote.');
  await page.click('#save-record');
  await page.waitFor(`document.querySelector('#detail h1')?.innerText === 'E2E Release a version'`);
  for (const heading of ['Goal', 'Prerequisites', 'Steps', 'Verification', 'Pitfalls']) assert.ok((await page.text('#detail')).includes(heading), heading);
  assert.equal(await page.text('[data-field="steps"] pre'), 'npm test\ngit tag v1.0.0\ngit push --tags');
  assert.equal(await page.count('#stage-stepper li'), 5);
  await shot('workflow-detail');
});

await step('Explain-back scores an answer, reveals the notes, and schedules a review', async () => {
  await page.route('#/knowledge/2');
  await page.waitFor(`document.querySelector('#learning #stage-stepper')`);
  await page.click('#practice-explain');
  await page.waitFor(`document.querySelector('#practice-form')`);
  assert.match(await page.text('#practice-prompt'), /JavaScript event loop/);
  assert.equal(await page.exists('#practice-result'), false, 'notes stay hidden before checking');
  await page.click('#check-answer');
  await page.waitFor(`document.querySelector('#practice-form .form-error:not([hidden])')`);
  await page.type('#practice-answer', 'The event loop is how a single-threaded runtime schedules work. It runs the current task, then drains the microtask queue, so promise callbacks run before a setTimeout task.');
  await page.click('#check-answer');
  await page.waitFor(`document.querySelector('#practice-result')`);
  assert.ok(Number(await page.text('#score strong')) >= 60);
  assert.ok((await page.count('#matched-terms .chip')) > 0);
  assert.ok((await page.text('#practice-result')).includes('Your notes'));
  await shot('practice-explain');
  await page.click('.rate[data-rating="3"]');
  await page.waitFor(`document.querySelector('#rating-status')?.innerText.startsWith('Rated Good')`);
  assert.ok(await page.exists('#try-again'));
});

await step('Rebuild challenge compares a command line by line', async () => {
  await page.route('#/practice/commands/1/rebuild');
  await page.waitFor(`document.querySelector('#practice-answer')`);
  await page.type('#practice-answer', 'netstat -ano | findstr :8080');
  await page.click('#check-answer');
  await page.waitFor(`document.querySelector('#practice-result')`);
  assert.equal(await page.text('#score strong'), '100');
  assert.equal(await page.count('#line-diff .diff-line.present'), 1);
  await page.route('#/');
  await page.route('#/practice/commands/1/rebuild');
  await page.waitFor(`document.querySelector('#practice-answer')`);
  await page.type('#practice-answer', 'netstat | findstr 8080');
  await page.click('#check-answer');
  await page.waitFor(`document.querySelector('#practice-result')`);
  assert.ok(Number(await page.text('#score strong')) < 80);
  assert.equal(await page.count('#line-diff .diff-line.missing'), 1);
  await shot('practice-rebuild');
});

await step('Locked exercises say what to write first', async () => {
  await page.route('#/knowledge/5');
  await page.waitFor(`document.querySelector('#practice-explain')`);
  assert.equal(await page.evaluate(`document.querySelector('#practice-explain').disabled`), true);
  assert.match(await page.text('.learning-locked'), /What is it/);
  await page.route('#/practice/knowledge/5/explain');
  await page.waitFor(`document.querySelector('#practice-locked')`);
  assert.match(await page.text('#practice-locked'), /Write your notes/);
});

await step('Review Center runs a keyboard-driven spaced-repetition session', async () => {
  await page.route('#/review');
  await page.waitFor(`document.querySelector('#start-review')`);
  const before = Number(await page.text('#stat-due .stat-value')) + Number(await page.text('#stat-new .stat-value'));
  assert.ok(before >= 2, `cards available: ${before}`);
  await page.click('#start-review');
  await page.waitFor(`document.querySelector('#flashcard')`);
  const firstTitle = await page.text('#flashcard h2');
  await page.evaluate(`document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))`);
  await page.waitFor(`document.querySelector('.card-answer .rate')`);
  assert.ok((await page.text('.card-answer')).includes('Your notes'));
  await shot('review-card');
  await page.evaluate(`document.dispatchEvent(new KeyboardEvent('keydown', { key: '3', bubbles: true }))`);
  await page.waitFor(`document.querySelector('.review-progress')?.innerText.startsWith('Card 2')`);
  assert.notEqual(await page.text('#flashcard h2'), firstTitle);
  await page.click('#show-answer');
  await page.click('.rate[data-rating="4"]');
  await page.waitFor(`document.querySelector('.review-progress')?.innerText.startsWith('Card 3') || document.querySelector('#review-summary')`);
  await page.route('#/');
  await page.route('#/review');
  await page.waitFor(`document.querySelector('#stat-scheduled')`);
  const after = Number(await page.text('#stat-due .stat-value')) + Number(await page.text('#stat-new .stat-value'));
  assert.equal(after, before - 2, 'reviewed cards leave the queue');
});

await step('Assessment generates questions, grades them, and keeps history', async () => {
  await page.route('#/quiz');
  await page.waitFor(`document.querySelector('#start-quiz')`);
  await page.select('#quiz-form select[name="questions"]', '5');
  await page.click('#start-quiz');
  await page.waitFor(`document.querySelector('#quiz-run .question')`);
  const total = await page.count('#quiz-run .question');
  assert.ok(total >= 3 && total <= 5, `questions: ${total}`);
  assert.ok((await page.count('#quiz-run .question:first-child .option')) >= 3);
  await page.evaluate(`document.querySelectorAll('#quiz-run .question').forEach((q) => q.querySelector('input').click())`);
  await page.waitFor(`document.querySelector('#answered').innerText.startsWith('${total} of')`);
  await shot('quiz');
  await page.click('#submit-quiz');
  await page.waitFor(`document.querySelector('#quiz-result')`);
  assert.match(await page.text('#quiz-result h1'), new RegExp(`of ${total} correct`));
  assert.equal(await page.count('.question.correct, .question.wrong'), total);
  assert.equal(await page.count('.option.is-answer'), total);
  await shot('quiz-result');
  await page.route('#/quiz');
  await page.waitFor(`document.querySelector('#quiz-history tbody tr')`);
  assert.match(await page.text('#quiz-history tbody tr'), /Review/);
});

await step('Knowledge Map draws every record and accepts a suggested link', async () => {
  await page.route('#/map');
  await page.waitFor(`document.querySelector('#map-svg')`);
  const nodes = await page.count('#map-svg .map-node');
  const totals = await page.evaluate(`fetch('/api/dashboard').then((r) => r.json()).then((d) => d.totals.knowledge + d.totals.commands + d.totals.errors + d.totals.workflows)`);
  assert.equal(nodes, totals);
  const edges = await page.count('#map-svg .map-edge');
  await page.evaluate(`document.querySelector('#map-svg .map-node').dispatchEvent(new MouseEvent('mouseenter'))`);
  assert.ok(await page.evaluate(`document.querySelector('#map-svg').classList.contains('focusing')`));
  await shot('map');
  assert.ok((await page.count('#suggestions li')) > 0, 'shared tags produce suggestions');
  await page.click('#suggestions button');
  await page.waitFor(`document.querySelectorAll('#map-svg .map-edge').length === ${edges + 1}`);
  await page.click('#linked-only');
  await page.waitFor(`document.querySelectorAll('#map-svg .map-node').length < ${nodes}`);
  await page.select('.filter select[name="type"]', 'workflows');
  await page.waitFor(`[...document.querySelectorAll('#map-svg .map-node')].every((n) => n.classList.contains('kind-workflows'))`);
});

await step('Progress shows the learning funnel, focus list, and recent practice', async () => {
  await page.route('#/progress');
  await page.waitFor(`document.querySelector('#funnel')`);
  assert.equal(await page.count('#funnel li'), 5);
  const counts = await page.evaluate(`[...document.querySelectorAll('#funnel .bar-value')].map((e) => Number(e.innerText))`);
  assert.ok(counts.every((c, i) => i === 0 || c <= counts[i - 1]), `funnel narrows: ${counts}`);
  assert.ok((await page.count('#focus li')) > 0);
  assert.ok((await page.count('#recent-attempts li')) >= 4, 'practice from earlier steps is listed');
  assert.ok((await page.count('#category-table tbody tr')) > 0);
  assert.equal(await page.count('#weekly .column'), 8);
  await shot('progress');
  await page.route('#/');
  assert.ok((await page.text('#learning-loop')).includes('Verified'));
});

await step('Layout has no horizontal overflow from phone to desktop', async () => {
  const routes = ['#/', '#/capture', '#/knowledge', '#/errors', '#/commands', '#/workflows', '#/search?q=git', '#/knowledge/1', '#/errors/1', '#/commands/1', '#/workflows/1', '#/knowledge/1/edit', '#/practice/knowledge/2/explain', '#/practice/commands/1/rebuild', '#/review', '#/quiz', '#/map', '#/progress'];
  for (const [width, height, mobile] of [[390, 844, true], [768, 1024, false], [1024, 768, false], [1440, 900, false]]) {
    await page.setViewport(width, height, mobile);
    for (const route of routes) {
      await page.route('#/capture/x');
      await page.route(route);
      await new Promise((r) => setTimeout(r, 60));
      const overflow = await page.evaluate('document.documentElement.scrollWidth - window.innerWidth');
      assert.ok(overflow <= 0, `${route} overflows by ${overflow}px at ${width}px`);
      if (width === 390 && ['#/', '#/knowledge', '#/errors/1', '#/review', '#/map', '#/progress'].includes(route)) {
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
    for (const kind of ['knowledge', 'commands', 'errors', 'workflows']) {
      const rows = await (await fetch('/api/' + kind)).json();
      for (const row of rows) await fetch('/api/' + kind + '/' + row.id, { method: 'DELETE' });
    }
  })()`);
  await page.route('#/capture');
  await page.route('#/');
  assert.equal(await page.text('#view .empty h3'), 'Nothing captured yet');
  assert.equal(await statValue('Knowledge entries'), 0);
  await shot('empty-dashboard');
  for (const [kind, heading] of [['knowledge', 'No knowledge entries yet'], ['errors', 'No error records yet'], ['commands', 'No commands yet'], ['workflows', 'No workflows yet']]) {
    await page.route(`#/${kind}`);
    await page.waitFor(`document.querySelector('#results .empty')`);
    assert.equal(await page.text('#results .empty h3'), heading);
  }
  await page.route(`#/knowledge/new`);
  assert.match(await page.text('#link-picker'), /No other records/);
  for (const [route, text] of [['#/review', 'Nothing to review'], ['#/map', 'Nothing to map yet'], ['#/progress', 'No records yet']]) {
    await page.route(route);
    assert.ok((await page.text('#view .empty')).includes(text), route);
  }
  await page.route('#/quiz');
  await page.click('#start-quiz');
  await page.waitFor(`document.querySelector('#quiz-form .form-error:not([hidden])')?.innerText.includes('Not enough material')`);
});

await step('A stopped server shows a recoverable error, not a blank page', async () => {
  await stopServer();
  await page.evaluate(`location.hash = '#/knowledge'`);
  await page.waitFor(`document.querySelector('#view .empty h3')?.innerText === 'Could not load this page'`);
  await startServer();
  await page.click('#view .empty button');
  await page.waitFor(`document.querySelector('#view h1')?.innerText === 'Knowledge Library'`);
});

await step('Password-protected mode requires signing in and supports signing out', async () => {
  await stopServer();
  await startServer({ ACADEMY_PASSWORD: 'e2e-very-long-password' });
  await page.reload();
  await page.waitFor(`document.querySelector('#login-form')`, { label: 'login form' });
  assert.equal(await page.evaluate(`document.querySelector('.shell').hidden`), true);
  await shot('login');
  await page.type('#login-password', 'wrong password');
  await page.click('#login-submit');
  await page.waitFor(`document.querySelector('#login-form .form-error:not([hidden])')?.innerText === 'Wrong password.'`);
  await page.evaluate(`document.querySelector('#login-password').value = ''`);
  await page.type('#login-password', 'e2e-very-long-password');
  await page.click('#login-submit');
  await page.waitFor(`!document.querySelector('.shell').hidden && document.querySelector('#view h1')`);
  assert.ok(await page.exists('#sign-out'));
  await page.reload();
  await page.waitFor(`document.querySelector('#view')?.dataset.ready && document.querySelector('#sign-out')`, { label: 'session survives reload' });
  await page.click('#sign-out');
  await page.waitFor(`document.querySelector('#login-form')`);
  assert.equal((await page.evaluate(`fetch('/api/meta').then((r) => r.status)`)), 401);
  await stopServer();
  await startServer();
  await page.reload();
  await page.waitFor(`document.querySelector('#view')?.dataset.ready`);
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
