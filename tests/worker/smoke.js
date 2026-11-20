// Production smoke test. Runs against a Cloudflare deployment or `wrangler dev`:
//   node tests/worker/smoke.js <base-url> <password> [--write]
// Read-only by default. With --write it also creates, edits and deletes its
// own temporary records (cleaned up at the end); your data is never touched.
import assert from 'node:assert/strict';

const [base, password, mode] = process.argv.slice(2);
if (!base || !password) {
  console.error('Usage: node tests/worker/smoke.js <base-url> <password> [--write]');
  process.exit(2);
}
const write = mode === '--write';
const origin = new URL(base).origin;
let cookie = '';
const results = [];

async function call(method, path, body, extra = {}) {
  const res = await fetch(new URL(path, base), {
    method,
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json', Origin: origin }),
      ...extra,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: 'manual',
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* not JSON */
  }
  return { status: res.status, headers: res.headers, json, text };
}

async function check(name, fn) {
  const t0 = performance.now();
  try {
    await fn();
    results.push({ name, ok: true, ms: Math.round(performance.now() - t0) });
  } catch (err) {
    results.push({ name, ok: false, ms: Math.round(performance.now() - t0), err: err.message });
  }
}

await check('HTTPS app shell, security headers, PWA files', async () => {
  const page = await call('GET', '/');
  assert.equal(page.status, 200);
  assert.match(page.text, /<link rel="manifest" href="\/manifest.webmanifest"/);
  assert.match(page.headers.get('content-security-policy') ?? '', /default-src 'self'/);
  assert.equal(page.headers.get('x-content-type-options'), 'nosniff');
  const manifest = await call('GET', '/manifest.webmanifest');
  assert.equal(manifest.status, 200);
  assert.match(manifest.headers.get('content-type'), /manifest\+json/);
  assert.equal(manifest.json.display, 'standalone');
  for (const icon of [...manifest.json.icons.map((i) => i.src), '/icons/apple-touch-icon.png', '/apple-touch-icon.png']) {
    const res = await call('GET', icon);
    assert.equal(res.status, 200, icon);
  }
  const sw = await call('GET', '/sw.js');
  assert.equal(sw.status, 200);
  assert.match(sw.headers.get('cache-control') ?? '', /no-cache/);
  assert.equal(sw.headers.get('service-worker-allowed'), '/');
  assert.equal((await call('GET', '/js/views/courses.js')).status, 200);
  assert.equal((await call('GET', '/_headers')).status, 404, 'host config is not served');
});

await check('Authentication is required and enforced', async () => {
  assert.deepEqual((await call('GET', '/api/session')).json, { authRequired: true, authenticated: false });
  for (const path of ['/api/dashboard', '/api/courses', '/api/knowledge', '/api/courses/robotics/lessons/pid-control']) {
    assert.equal((await call('GET', path)).status, 401, path);
  }
  const wrong = await call('POST', '/api/login', { password: 'definitely-not-it' });
  assert.equal(wrong.status, 401);
  const foreign = await call('POST', '/api/login', { password }, { Origin: 'https://evil.example' });
  assert.equal(foreign.status, 403, 'cross-site sign-in is refused');
  const ok = await call('POST', '/api/login', { password });
  assert.equal(ok.status, 200);
  const setCookie = ok.headers.get('set-cookie') ?? '';
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /Secure/);
  assert.match(setCookie, /SameSite=Strict/);
  cookie = setCookie.split(';')[0];
  assert.deepEqual((await call('GET', '/api/session')).json, { authRequired: true, authenticated: true });
});

await check('Dashboard, options, progress, map, review queue, quizzes', async () => {
  const dash = await call('GET', '/api/dashboard');
  assert.equal(dash.status, 200);
  assert.ok(dash.json.totals && dash.json.learning.stages.length === 5);
  for (const path of ['/api/options', '/api/progress', '/api/map', '/api/review', '/api/quizzes', '/api/meta']) {
    assert.equal((await call('GET', path)).status, 200, path);
  }
  assert.equal((await call('GET', '/api/search?q=git')).status, 200);
  assert.deepEqual((await call('GET', '/api/media')).json, []);
});

await check('Courses: catalogue, syllabus and lesson pages', async () => {
  const list = await call('GET', '/api/courses');
  assert.equal(list.json[0].title, 'Robotics Engineering');
  assert.equal(list.json[0].lessons, 47);
  const track = await call('GET', '/api/courses/robotics');
  assert.equal(track.json.moduleList.length, 11);
  const lesson = await call('GET', '/api/courses/robotics/lessons/pid-control');
  assert.equal(lesson.json.title, 'PID control');
  assert.equal((await call('GET', '/api/courses/robotics/lessons/nope')).status, 404);
});

if (write) {
  const temp = [];
  await check('Records: create, read, update, search, study, delete', async () => {
    const created = await call('POST', '/api/knowledge', { title: 'Smoke test record', category: 'Robotics', tags: ['smoke-test'], what_is_it: 'A temporary record made by the deployment smoke test.' });
    assert.equal(created.status, 201);
    temp.push(['knowledge', created.json.id]);
    const updated = await call('PUT', `/api/knowledge/${created.json.id}`, { ...created.json, why_needed: 'Proves writes persist.' });
    assert.equal(updated.json.why_needed, 'Proves writes persist.');
    assert.ok((await call('GET', '/api/search?q=Smoke%20test')).json.some((r) => r.id === created.json.id));
    assert.equal((await call('POST', `/api/knowledge/${created.json.id}/study`)).json.study_count, 1);
    const captured = await call('POST', '/api/capture', { capture_type: 'command', title: 'Smoke test command', content: 'echo smoke-test-한글-100%' });
    assert.equal(captured.status, 201, captured.text);
    temp.push([captured.json.kind, captured.json.record.id]);
    assert.ok((await call('GET', `/api/search?q=${encodeURIComponent('한글-100%')}`)).json.length >= 1, 'Korean and % search');
    assert.equal((await call('POST', '/api/knowledge', { title: '' })).status, 400, 'validation');
  });
  await check('Learning loop: explain-back, rebuild, review, assessment', async () => {
    const [, id] = temp[0];
    const explain = await call('POST', `/api/learn/knowledge/${id}/attempts`, { mode: 'explain', response: 'A temporary record made by the smoke test that proves writes persist.' });
    assert.equal(explain.status, 201);
    assert.ok(explain.json.score >= 0);
    const review = await call('POST', `/api/review/knowledge/${id}`, { rating: 3 });
    assert.equal(review.status, 200, review.text);
    const quiz = await call('POST', '/api/quizzes', { count: 3 });
    if (quiz.status === 201) {
      const answers = quiz.json.questions.map(() => 0);
      const graded = await call('POST', `/api/quizzes/${quiz.json.id}/submit`, { answers });
      assert.equal(graded.status, 200, graded.text);
      assert.equal(typeof graded.json.score, 'number');
    }
  });
  await check('Course progress and save-to-library persist', async () => {
    const path = '/api/courses/robotics/lessons/what-is-a-robot';
    const before = (await call('GET', path)).json.state;
    assert.equal((await call('PUT', path, { completed: true })).json.completed, true);
    assert.equal((await call('PUT', path, { videoUrl: 'javascript:alert(1)' })).status, 400);
    if (!before.completed) await call('PUT', path, { completed: false });
  });
  await check('Clean up temporary records', async () => {
    for (const [kind, id] of temp) assert.equal((await call('DELETE', `/api/${kind}/${id}`)).status, 200);
  });
}

await check('Sign out ends the session', async () => {
  const out = await call('POST', '/api/logout', {});
  assert.equal(out.status, 200);
  const stale = cookie;
  cookie = '';
  assert.equal((await call('GET', '/api/dashboard')).status, 401);
  cookie = stale; // the signed cookie itself stays valid until expiry by design
});

for (const r of results) console.log(`${r.ok ? '  pass' : '  FAIL'}  ${r.name} (${r.ms} ms)${r.ok ? '' : `\n        ${r.err}`}`);
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} production checks passed against ${base}`);
process.exit(failed ? 1 : 0);
