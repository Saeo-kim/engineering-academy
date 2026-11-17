import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createApp, hostMatcher } from '../server/app.js';
import { createAuth } from '../server/auth.js';
import { MIGRATIONS, openDatabase } from '../server/db.js';
import { createEvaluator, keyTerms, similarity } from '../server/evaluator.js';
import { schedule } from '../server/learning.js';
import { createRepository } from '../server/repository.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = mkdtempSync(join(tmpdir(), 'academy-learning-'));

function startServer(options = {}) {
  const db = openDatabase(join(dir, `${Math.random().toString(36).slice(2)}.db`));
  const repo = createRepository(db);
  const server = createApp(repo, options);
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      const raw = (method, path, { headers = {}, body } = {}) =>
        new Promise((done, reject) => {
          const req = httpRequest({ host: '127.0.0.1', port, method, path, headers }, (res) => {
            const chunks = [];
            res.on('data', (c) => chunks.push(c));
            res.on('end', () => {
              const text = Buffer.concat(chunks).toString();
              let json = null;
              try {
                json = JSON.parse(text);
              } catch {
                /* static file */
              }
              done({ status: res.statusCode, headers: res.headers, json, text });
            });
          });
          req.on('error', reject);
          req.end(body);
        });
      // Content-Length is explicit because Node does not send DELETE bodies chunked.
      const api = (method, path, body, headers = {}) => {
        const payload = body === undefined ? undefined : JSON.stringify(body);
        return raw(method, `/api/${path}`, {
          headers: payload === undefined ? headers : { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload), ...headers },
          body: payload,
        });
      };
      const close = async () => {
        server.closeAllConnections();
        await new Promise((r) => server.close(r));
        db.close();
      };
      resolve({ api, raw, db, repo, close });
    });
  });
}

after(() => rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }));

describe('evaluator', () => {
  const evaluator = createEvaluator();
  const reference =
    'The event loop schedules work in a single-threaded runtime. It runs the current task, then drains the microtask queue, so a resolved `Promise` callback runs before a `setTimeout` callback.';

  it('extracts code identifiers and frequent words as key terms', () => {
    const terms = keyTerms(reference).map((t) => t.term);
    assert.ok(terms.includes('Promise'));
    assert.ok(terms.includes('setTimeout'));
    assert.ok(terms.includes('microtask'));
    assert.ok(!terms.includes('the'));
  });

  it('scores a thorough explanation above a vague one', () => {
    const good = evaluator.explain({
      reference,
      response: 'A single-threaded runtime uses an event loop: it finishes the current task, drains every microtask such as Promise callbacks, then takes the next task like a setTimeout callback.',
    });
    const vague = evaluator.explain({ reference, response: 'It is about async stuff in JavaScript.' });
    assert.ok(good.score >= 70, `good scored ${good.score}`);
    assert.ok(vague.score < 30, `vague scored ${vague.score}`);
    assert.ok(vague.missed.length > good.missed.length);
    assert.ok(vague.feedback.some((f) => f.includes('short')));
  });

  it('treats inflections of a word as the same idea', () => {
    const result = evaluator.explain({ reference: 'The scheduler schedules resolved promises and indexes.', response: 'It will schedule a promise once resolve happens, using an index.' });
    for (const term of ['schedules', 'resolved', 'promises', 'indexes']) assert.ok(result.matched.includes(term), `${term} in ${result.matched}`);
  });

  it('handles Korean text', () => {
    const result = evaluator.explain({ reference: '인덱스는 정렬된 트리 구조로 전체 테이블 스캔을 피한다', response: '인덱스는 정렬된 트리라서 테이블 스캔을 피할 수 있다' });
    assert.ok(result.score > 30, `scored ${result.score}`);
  });

  it('compares rebuilds by token order, ignoring whitespace', () => {
    assert.equal(similarity('git reset --soft HEAD~1', 'git   reset --soft  HEAD~1'), 1);
    assert.ok(similarity('git reset --soft HEAD~1', 'git reset --hard HEAD~1') < 1);
    assert.ok(similarity('git reset --soft HEAD~1', 'HEAD~1 --soft reset git') < 0.6);
    assert.equal(similarity('', 'x'), 0);
    const result = evaluator.rebuild({ reference: 'a\nb\nc', response: 'a\nc' });
    assert.deepEqual(result.lines.map((l) => l.present), [true, false, true]);
  });
});

describe('review scheduling', () => {
  const now = new Date('2026-01-01T12:00:00Z');
  it('grows the interval on success and resets it on failure', () => {
    const first = schedule(null, 3, now);
    assert.equal(first.interval, 1);
    const second = schedule({ interval_days: first.interval, ease: first.ease, reps: first.reps, lapses: 0 }, 3, now);
    assert.equal(second.interval, 3);
    const third = schedule({ interval_days: second.interval, ease: second.ease, reps: second.reps, lapses: 0 }, 3, now);
    assert.equal(third.interval, 7.5);
    const lapse = schedule({ interval_days: 7.5, ease: 2.5, reps: 3, lapses: 0 }, 1, now);
    assert.equal(lapse.interval, 0);
    assert.equal(lapse.reps, 0);
    assert.equal(lapse.lapses, 1);
    assert.equal(new Date(lapse.due_at) - now, 10 * 60_000);
    assert.ok(schedule(null, 4, now).interval > first.interval);
  });

  it('never lets ease fall below 1.3', () => {
    let state = null;
    for (let i = 0; i < 20; i += 1) {
      const next = schedule(state, 1, now);
      state = { interval_days: next.interval, ease: next.ease, reps: next.reps, lapses: next.lapses };
    }
    assert.equal(state.ease, 1.3);
  });
});

describe('learning API', () => {
  let s;
  before(async () => {
    s = await startServer();
  });
  after(() => s.close());

  const full = {
    title: 'Event loop',
    category: 'JavaScript',
    tags: 'async',
    what_is_it: 'The event loop schedules work in a single-threaded runtime.',
    why_needed: 'It explains the order in which asynchronous callbacks run.',
    how_it_works: 'It runs the current task, then drains the microtask queue, so promise callbacks run before timer callbacks.',
    real_example: '```js\nsetTimeout(() => log("timeout"), 0);\nPromise.resolve().then(() => log("promise"));\n```',
  };
  const goodAnswer =
    'In a single-threaded runtime the event loop schedules work: it runs the current task, drains the microtask queue so promise callbacks run, and only then runs timer callbacks. That explains the order of asynchronous callbacks.';

  it('locks exercises until the notes exist, and explains why', async () => {
    const { json: bare } = await s.api('POST', 'knowledge', { title: 'Bare' });
    const state = (await s.api('GET', `learn/knowledge/${bare.id}`)).json;
    assert.equal(state.stage, 1);
    assert.equal(state.exercises.explain.available, false);
    assert.match(state.exercises.explain.missing, /What is it/);
    assert.equal(state.exercises.explain.reference, undefined, 'answer key is not sent before an attempt');
    const res = await s.api('POST', `learn/knowledge/${bare.id}/attempts`, { mode: 'explain', response: 'x' });
    assert.equal(res.status, 400);
  });

  it('moves a record through all five stages', async () => {
    const { json: rec } = await s.api('POST', 'knowledge', full);
    let state = (await s.api('GET', `learn/knowledge/${rec.id}`)).json;
    assert.equal(state.stage, 2, 'captured and understood');

    const explain = await s.api('POST', `learn/knowledge/${rec.id}/attempts`, { mode: 'explain', response: goodAnswer });
    assert.equal(explain.status, 201);
    assert.ok(explain.json.passed, `explain scored ${explain.json.score}`);
    assert.match(explain.json.reference, /event loop/);
    state = (await s.api('GET', `learn/knowledge/${rec.id}`)).json;
    assert.equal(state.stage, 3);

    const code = 'setTimeout(() => log("timeout"), 0);\nPromise.resolve().then(() => log("promise"));';
    const rebuild = await s.api('POST', `learn/knowledge/${rec.id}/attempts`, { mode: 'rebuild', response: code });
    assert.equal(rebuild.json.score, 100);
    state = (await s.api('GET', `learn/knowledge/${rec.id}`)).json;
    assert.equal(state.stage, 4);

    await s.api('POST', `review/knowledge/${rec.id}`, { rating: 3 });
    await s.api('POST', `review/knowledge/${rec.id}`, { rating: 3 });
    state = (await s.api('GET', `learn/knowledge/${rec.id}`)).json;
    assert.equal(state.stage, 5);
    assert.ok(state.steps.every((st) => st.done));
    assert.ok(state.attempts.length >= 4);

    const record = (await s.api('GET', `knowledge/${rec.id}`)).json;
    assert.equal(record.study_count, 4, 'each practice counts as study');
  });

  it('validates attempts and ratings', async () => {
    const { json: rec } = await s.api('POST', 'commands', { title: 'List', command: 'ls -la', purpose: 'List all files', explanation: '-l long, -a hidden' });
    const path = `learn/commands/${rec.id}/attempts`;
    assert.equal((await s.api('POST', path, { mode: 'teach', response: 'x' })).status, 400);
    assert.equal((await s.api('POST', path, { mode: 'explain', response: '   ' })).status, 400);
    assert.equal((await s.api('POST', path, { mode: 'explain', response: 42 })).status, 400);
    assert.equal((await s.api('POST', path, { mode: 'explain', response: 'x'.repeat(50_001) })).status, 400);
    assert.equal((await s.api('POST', 'learn/commands/99999/attempts', { mode: 'explain', response: 'x' })).status, 404);
    assert.equal((await s.api('POST', `learn/nope/${rec.id}/attempts`, { mode: 'explain', response: 'x' })).status, 404);

    const attempt = (await s.api('POST', path, { mode: 'rebuild', response: 'ls -la' })).json;
    assert.equal(attempt.score, 100);
    assert.equal(attempt.suggestedRating, 4);
    assert.equal((await s.api('POST', `attempts/${attempt.attemptId}/rating`, { rating: 5 })).status, 400);
    assert.equal((await s.api('POST', `attempts/${attempt.attemptId}/rating`, { rating: '3' })).status, 400);
    const rated = await s.api('POST', `attempts/${attempt.attemptId}/rating`, { rating: 4 });
    assert.equal(rated.status, 200);
    assert.equal(rated.json.interval_days, 4);
    assert.equal((await s.api('POST', `attempts/${attempt.attemptId}/rating`, { rating: 4 })).status, 400, 'rating twice is rejected');
    assert.equal((await s.api('POST', 'attempts/99999/rating', { rating: 3 })).status, 404);
  });

  it('queues new and due cards and removes them once reviewed', async () => {
    const { json: rec } = await s.api('POST', 'errors', { title: 'Port busy', error_message: 'EADDRINUSE :::4310', root_cause: 'Another process holds the port.' });
    let queue = (await s.api('GET', 'review')).json;
    const card = queue.cards.find((c) => c.kind === 'errors' && c.id === rec.id);
    assert.equal(card.status, 'new');
    assert.equal(card.reference, 'Another process holds the port.');
    assert.deepEqual(Object.keys(card.intervals), ['1', '2', '3', '4']);

    assert.equal((await s.api('POST', `review/errors/${rec.id}`, { rating: 0 })).status, 400);
    const again = (await s.api('POST', `review/errors/${rec.id}`, { rating: 1 })).json;
    assert.ok(new Date(again.due_at) - Date.now() <= 10 * 60_000);
    queue = (await s.api('GET', 'review')).json;
    assert.ok(!queue.cards.some((c) => c.kind === 'errors' && c.id === rec.id), 'not due again for ten minutes');
    assert.equal(queue.upcoming.length, 7);
  });

  it('builds assessments without leaking the answer key, and grades them once', async () => {
    const fresh = await startServer();
    try {
      assert.equal((await fresh.api('POST', 'quizzes', {})).status, 400, 'not enough material');
      for (const [title, def] of [['Mutex', 'A lock that lets one thread at a time into a section.'], ['Semaphore', 'A counter that limits concurrent access to N holders.'], ['Deadlock', 'Two threads each waiting forever for a lock the other holds.']]) {
        await fresh.api('POST', 'knowledge', { title, what_is_it: def });
      }
      assert.equal((await fresh.api('POST', 'quizzes', { size: 0 })).status, 400);
      assert.equal((await fresh.api('POST', 'quizzes', { size: 3, category: 'Nope' })).status, 400);
      const created = await fresh.api('POST', 'quizzes', { size: 3 });
      assert.equal(created.status, 201);
      const quiz = created.json;
      assert.equal(quiz.questions.length, 3);
      assert.ok(!created.text.includes('"answer"'), 'no answer key in the response');
      for (const q of quiz.questions) {
        assert.equal(q.options.length, 3);
        assert.ok(!q.stem.text.includes(q.options.find((o) => q.stem.text.includes(o)) ?? '\u0000'), 'definition does not contain its own title');
      }

      const key = JSON.parse(fresh.db.prepare('SELECT questions FROM quizzes WHERE id = ?').get(quiz.id).questions).map((q) => q.answer);
      assert.equal((await fresh.api('POST', `quizzes/${quiz.id}/submit`, { answers: [0] })).status, 400);
      assert.equal((await fresh.api('POST', `quizzes/${quiz.id}/submit`, { answers: [9, 0, 0] })).status, 400);
      const answers = [key[0], (key[1] + 1) % 3, null];
      const graded = await fresh.api('POST', `quizzes/${quiz.id}/submit`, { answers });
      assert.equal(graded.status, 200);
      assert.equal(graded.json.score, 1);
      assert.deepEqual(graded.json.questions.map((q) => q.correct), [true, false, false]);
      assert.ok(graded.json.questions.every((q) => typeof q.title === 'string'));
      assert.equal((await fresh.api('POST', `quizzes/${quiz.id}/submit`, { answers })).status, 400, 'cannot resubmit');
      assert.equal((await fresh.api('GET', 'quizzes')).json[0].score, 1);
      assert.equal((await fresh.api('GET', 'quizzes/99999')).status, 404);

      const progress = (await fresh.api('GET', 'progress')).json;
      assert.equal(progress.modes.quiz.count, 3);
      assert.equal(progress.modes.quiz.passRate, 33);
      const right = graded.json.questions[0];
      const state = (await fresh.api('GET', `learn/${right.kind}/${right.id}`)).json;
      assert.equal(state.steps.find((st) => st.key === 'verified').done, true, 'a correct answer verifies that record');
      const wrong = graded.json.questions[1];
      assert.equal((await fresh.api('GET', `learn/${wrong.kind}/${wrong.id}`)).json.review.last_rating, 1, 'a wrong answer schedules it again');
    } finally {
      await fresh.close();
    }
  });

  it('maps links, suggests connections by shared tags, and links on request', async () => {
    const fresh = await startServer();
    try {
      const a = (await fresh.api('POST', 'knowledge', { title: 'CORS', tags: 'http, browser' })).json;
      const b = (await fresh.api('POST', 'errors', { title: 'Blocked by CORS', error_message: 'blocked', tags: 'http, browser' })).json;
      const c = (await fresh.api('POST', 'commands', { title: 'curl', command: 'curl -i', tags: 'other' })).json;
      let map = (await fresh.api('GET', 'map')).json;
      assert.equal(map.nodes.length, 3);
      assert.equal(map.edges.length, 0);
      assert.equal(map.suggestions.length, 1);
      assert.deepEqual(map.suggestions[0].tags.sort(), ['browser', 'http']);

      const A = { kind: 'knowledge', id: a.id };
      const B = { kind: 'errors', id: b.id };
      assert.equal((await fresh.api('POST', 'links', { a: A, b: B })).status, 201);
      map = (await fresh.api('GET', 'map')).json;
      assert.equal(map.edges.length, 1);
      assert.equal(map.suggestions.length, 0);
      assert.deepEqual((await fresh.api('GET', `errors/${b.id}`)).json.links.map((l) => l.id), [a.id]);

      assert.equal((await fresh.api('POST', 'links', { a: A, b: A })).status, 400);
      assert.equal((await fresh.api('POST', 'links', { a: A, b: { kind: 'commands', id: 99999 } })).status, 404);
      assert.equal((await fresh.api('POST', 'links', { a: A, b: { kind: 'bad', id: c.id } })).status, 400);
      assert.equal((await fresh.api('POST', 'links', { a: A })).status, 400);

      assert.equal((await fresh.api('DELETE', 'links', { a: B, b: A })).status, 200, 'either order works');
      assert.equal((await fresh.api('GET', 'map')).json.edges.length, 0);
    } finally {
      await fresh.close();
    }
  });

  it('deleting a record removes its practice history and schedule', async () => {
    const { json: rec } = await s.api('POST', 'commands', { title: 'Temp', command: 'echo hi' });
    await s.api('POST', `learn/commands/${rec.id}/attempts`, { mode: 'rebuild', response: 'echo hi' });
    await s.api('POST', `review/commands/${rec.id}`, { rating: 3 });
    await s.api('DELETE', `commands/${rec.id}`);
    assert.equal(s.db.prepare('SELECT count(*) AS n FROM attempts WHERE kind = ? AND item_id = ?').get('commands', rec.id).n, 0);
    assert.equal(s.db.prepare('SELECT count(*) AS n FROM reviews WHERE kind = ? AND item_id = ?').get('commands', rec.id).n, 0);
  });

  it('includes the learning summary on the dashboard', async () => {
    const dash = (await s.api('GET', 'dashboard')).json;
    assert.equal(dash.learning.stages.length, 5);
    assert.ok(dash.learning.total >= 1);
    assert.equal(typeof dash.totals.workflows, 'number');
    const meta = (await s.api('GET', 'meta')).json;
    assert.equal(meta.evaluator.id, 'local');
    assert.equal(meta.evaluator.ai, false);
  });
});

describe('database upgrade', () => {
  it('upgrades a v1 database in place without losing records', () => {
    const path = join(dir, 'v1.db');
    const v1 = new DatabaseSync(path);
    v1.exec(MIGRATIONS[0]);
    v1.exec('PRAGMA user_version = 1');
    v1.prepare("INSERT INTO knowledge (title, entry_date, created_at, updated_at) VALUES ('Old note', '2026-01-01', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z')").run();
    v1.close();

    const db = openDatabase(path);
    assert.equal(db.prepare('PRAGMA user_version').get().user_version, MIGRATIONS.length);
    const repo = createRepository(db);
    assert.equal(repo.list('knowledge')[0].title, 'Old note');
    assert.equal(repo.create('workflows', { title: 'New', steps: 'a' }).title, 'New');
    db.close();

    const reopened = openDatabase(path);
    assert.equal(createRepository(reopened).list('workflows').length, 1);
    reopened.close();
  });
});

describe('password protection', () => {
  let s;
  before(async () => {
    s = await startServer({ auth: createAuth({ password: 'correct horse battery' }) });
  });
  after(() => s.close());

  const cookieFrom = (res) => res.headers['set-cookie']?.[0]?.split(';')[0];

  it('blocks the API but still serves the sign-in shell', async () => {
    assert.deepEqual((await s.api('GET', 'session')).json, { authRequired: true, authenticated: false });
    assert.equal((await s.api('GET', 'meta')).status, 401);
    assert.equal((await s.api('POST', 'knowledge', { title: 'x' })).status, 401);
    assert.equal((await s.raw('GET', '/')).status, 200);
    assert.equal((await s.raw('GET', '/healthz')).status, 200);
  });

  it('signs in with the right password and issues a hardened cookie', async () => {
    assert.equal((await s.api('POST', 'login', { password: 'wrong' })).status, 401);
    assert.equal((await s.api('POST', 'login', {})).status, 401);
    const ok = await s.api('POST', 'login', { password: 'correct horse battery' });
    assert.equal(ok.status, 200);
    const header = ok.headers['set-cookie'][0];
    assert.match(header, /HttpOnly/);
    assert.match(header, /SameSite=Strict/);
    const cookie = cookieFrom(ok);
    assert.equal((await s.api('GET', 'meta', undefined, { Cookie: cookie })).status, 200);
    assert.equal((await s.api('GET', 'session', undefined, { Cookie: cookie })).json.authenticated, true);

    const [expires, mac] = cookie.split('=')[1].split('.');
    const forged = `ea_session=${Number(expires) + 1000}.${mac}`;
    assert.equal((await s.api('GET', 'meta', undefined, { Cookie: forged })).status, 401, 'tampered expiry is rejected');
    assert.equal((await s.api('GET', 'meta', undefined, { Cookie: 'ea_session=garbage' })).status, 401);

    const out = await s.api('POST', 'logout', {}, { Cookie: cookie });
    assert.match(out.headers['set-cookie'][0], /Max-Age=0/);
  });

  it('rate-limits repeated failures', async () => {
    const fresh = await startServer({ auth: createAuth({ password: 'another long password' }) });
    try {
      for (let i = 0; i < 8; i += 1) assert.equal((await fresh.api('POST', 'login', { password: `guess${i}` })).status, 401);
      assert.equal((await fresh.api('POST', 'login', { password: 'another long password' })).status, 429);
    } finally {
      await fresh.close();
    }
  });
});

describe('host allow-list', () => {
  it('matches exact hosts and subdomain wildcards only', () => {
    const allowed = hostMatcher(['*.trycloudflare.com', 'academy.example.com']);
    assert.ok(allowed('localhost:4310'));
    assert.ok(allowed('127.0.0.1'));
    assert.ok(allowed('abc-def.trycloudflare.com'));
    assert.ok(allowed('academy.example.com:443'));
    assert.ok(!allowed('trycloudflare.com'));
    assert.ok(!allowed('trycloudflare.com.evil.example'));
    assert.ok(!allowed('evil-trycloudflare.com'));
    assert.ok(!allowed('sub.academy.example.com'));
    assert.ok(!hostMatcher([])('example.com'));
  });

  it('accepts requests for an allowed host', async () => {
    const s = await startServer({ allowedHosts: ['academy.example.com'] });
    try {
      assert.equal((await s.raw('GET', '/api/meta', { headers: { Host: 'academy.example.com' } })).status, 200);
      assert.equal((await s.raw('GET', '/api/meta', { headers: { Host: 'other.example.com' } })).status, 403);
    } finally {
      await s.close();
    }
  });

  it('refuses to start exposed to a network without a strong password', () => {
    for (const env of [{ HOST: '0.0.0.0' }, { ACADEMY_ALLOWED_HOSTS: 'x.example.com' }, { HOST: '0.0.0.0', ACADEMY_PASSWORD: 'short' }]) {
      const run = spawnSync(process.execPath, ['--disable-warning=ExperimentalWarning', 'server/index.js'], {
        cwd: root,
        env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot, ACADEMY_DB: join(dir, 'never.db'), PORT: '0', ...env },
        encoding: 'utf8',
        timeout: 10_000,
      });
      assert.equal(run.status, 1, JSON.stringify(env));
      assert.match(run.stderr, /Refusing to start/);
    }
  });
});
