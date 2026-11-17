import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { createApp } from '../server/app.js';
import { openDatabase } from '../server/db.js';
import { createRepository } from '../server/repository.js';
import { seedIfFirstRun } from '../server/seed.js';

const dir = mkdtempSync(join(tmpdir(), 'academy-api-'));
const dbPath = join(dir, 'test.db');
let db;
let repo;
let server;
let port;

function raw(method, path, { headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const req = httpRequest({ host: '127.0.0.1', port, method, path, headers }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString();
        let json = null;
        try {
          json = JSON.parse(text);
        } catch {
          /* static responses are not JSON */
        }
        resolve({ status: res.statusCode, headers: res.headers, text, json });
      });
    });
    req.on('error', reject);
    req.end(body);
  });
}

const api = (method, path, body) =>
  raw(method, `/api/${path}`, {
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

before(async () => {
  db = openDatabase(dbPath);
  repo = createRepository(db);
  server = createApp(repo);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  port = server.address().port;
});

after(async () => {
  server.closeAllConnections();
  await new Promise((r) => server.close(r));
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

describe('CRUD', () => {
  for (const [kind, extra] of [
    ['knowledge', { content: 'body', what_is_it: 'a thing' }],
    ['commands', { command: 'ls -la', purpose: 'list' }],
    ['errors', { error_message: 'boom', root_cause: 'bad input' }],
    ['workflows', { steps: '1. build\n2. ship', goal: 'release' }],
  ]) {
    it(`creates, reads, updates and deletes ${kind}`, async () => {
      const created = await api('POST', kind, { title: `T ${kind}`, category: 'Java', tags: 'One, two,one', ...extra });
      assert.equal(created.status, 201);
      assert.deepEqual(created.json.tags, ['one', 'two']);
      const { id } = created.json;

      assert.equal((await api('GET', `${kind}/${id}`)).json.title, `T ${kind}`);

      const updated = await api('PUT', `${kind}/${id}`, { ...created.json, title: 'Renamed' });
      assert.equal(updated.status, 200);
      assert.equal(updated.json.title, 'Renamed');
      assert.equal(updated.json.category, 'Java');

      assert.equal((await api('DELETE', `${kind}/${id}`)).status, 200);
      assert.equal((await api('GET', `${kind}/${id}`)).status, 404);
    });
  }

  it('rejects invalid input', async () => {
    assert.equal((await api('POST', 'knowledge', { title: '   ' })).status, 400);
    assert.equal((await api('POST', 'commands', { title: 'no command' })).status, 400);
    assert.equal((await api('POST', 'errors', { title: 'no message' })).status, 400);
    assert.equal((await api('POST', 'workflows', { title: 'no steps', goal: 'x' })).status, 400);
    assert.equal((await api('POST', 'knowledge', { title: 'x', category: 'Nope' })).status, 400);
    assert.equal((await api('POST', 'knowledge', { title: 'x', entry_date: '2026-02-31' })).status, 400);
    assert.equal((await api('POST', 'knowledge', { title: 'x', content: 42 })).status, 400);
    assert.equal((await api('POST', 'knowledge', [])).status, 400);
    assert.equal((await api('POST', 'knowledge', null)).status, 400);
  });

  it('returns 404 for missing records and routes', async () => {
    assert.equal((await api('PUT', 'knowledge/99999', { title: 'x' })).status, 404);
    assert.equal((await api('DELETE', 'errors/99999')).status, 404);
    assert.equal((await api('GET', 'knowledge/abc')).status, 404);
    assert.equal((await api('GET', 'nonsense')).status, 404);
  });

  it('ignores attempts to set server-controlled fields', async () => {
    const { json } = await api('POST', 'knowledge', { title: 'x', is_sample: 1, study_count: 99, id: 12345 });
    assert.equal(json.is_sample, false);
    assert.equal(json.study_count, 0);
    assert.notEqual(json.id, 12345);
    await api('DELETE', `knowledge/${json.id}`);
  });
});

describe('capture routing', () => {
  const cases = [
    ['command', 'commands', 'command'],
    ['error', 'errors', 'error_message'],
    ['output', 'knowledge', 'content'],
    ['snippet', 'knowledge', 'content'],
    ['ai_explanation', 'knowledge', 'content'],
    ['note', 'knowledge', 'content'],
    ['workflow', 'workflows', 'steps'],
  ];
  for (const [type, kind, field] of cases) {
    it(`sends ${type} to ${kind}`, async () => {
      const res = await api('POST', 'capture', { capture_type: type, title: `cap ${type}`, content: 'payload' });
      assert.equal(res.status, 201);
      assert.equal(res.json.kind, kind);
      assert.equal(res.json.record[field], 'payload');
      await api('DELETE', `${kind}/${res.json.record.id}`);
    });
  }

  it('requires content and a known type', async () => {
    assert.equal((await api('POST', 'capture', { capture_type: 'note', title: 'x', content: ' ' })).status, 400);
    assert.equal((await api('POST', 'capture', { capture_type: 'nope', title: 'x', content: 'y' })).status, 400);
  });
});

describe('search and filters', () => {
  let ids;
  before(async () => {
    ids = {
      k: (await api('POST', 'knowledge', { title: 'Zebra indexing', category: 'Java', tags: 'alpha', what_is_it: 'snake_case and 100% literal' })).json.id,
      c: (await api('POST', 'commands', { title: 'Zebra run', command: 'zebra --fast', tags: 'beta' })).json.id,
      e: (await api('POST', 'errors', { title: 'Crash', error_message: 'ZebraException: 한글 메시지', solution: 'restart' })).json.id,
    };
  });

  after(async () => {
    await api('DELETE', `knowledge/${ids.k}`);
    await api('DELETE', `commands/${ids.c}`);
    await api('DELETE', `errors/${ids.e}`);
  });

  const search = async (q) => (await api('GET', `search?q=${encodeURIComponent(q)}`)).json;

  it('finds across all three collections, title matches first', async () => {
    const results = await search('zebra');
    assert.deepEqual(new Set(results.map((r) => r.kind)), new Set(['knowledge', 'commands', 'errors']));
    assert.equal(results.at(-1).kind, 'errors');
    assert.equal(results.at(-1).snippet.field, 'Original error');
  });

  it('matches substrings, Korean text, and multiple terms', async () => {
    assert.equal((await search('ebraExcep')).length, 1);
    assert.equal((await search('한글')).length, 1);
    assert.equal((await search('zebra fast')).length, 1);
    assert.equal((await search('zebra nomatchterm')).length, 0);
  });

  it('treats LIKE wildcards literally', async () => {
    assert.equal((await search('snake_case')).length, 1);
    assert.equal((await search('snakeXcase')).length, 0);
    assert.equal((await search('100%')).length, 1);
    assert.equal((await search('%')).length, 1);
  });

  it('is safe against SQL metacharacters and empty queries', async () => {
    assert.deepEqual(await search(`'; DROP TABLE knowledge; --`), []);
    assert.deepEqual(await search('   '), []);
    assert.equal((await api('GET', 'knowledge')).status, 200);
  });

  it('filters lists by category, tag, type, and status', async () => {
    assert.equal((await api('GET', 'knowledge?category=Java&q=zebra')).json.length, 1);
    assert.equal((await api('GET', 'knowledge?category=Security&q=zebra')).json.length, 0);
    assert.equal((await api('GET', 'knowledge?tag=ALPHA')).json.length, 1);
    assert.equal((await api('GET', 'knowledge?type=snippet&q=zebra')).json.length, 0);
    assert.equal((await api('GET', 'errors?status=resolved&q=zebra')).json.length, 1);
    assert.equal((await api('GET', 'errors?status=open&q=zebra')).json.length, 0);
  });
});

describe('links', () => {
  it('are visible from both sides and removed with either record', async () => {
    const a = (await api('POST', 'knowledge', { title: 'A' })).json;
    const b = (await api('POST', 'commands', { title: 'B', command: 'b' })).json;
    const updated = await api('PUT', `knowledge/${a.id}`, {
      title: 'A',
      links: [{ kind: 'commands', id: b.id }, { kind: 'knowledge', id: a.id }, { kind: 'errors', id: 99999 }],
    });
    assert.deepEqual(updated.json.links, [{ kind: 'commands', id: b.id, title: 'B' }]);
    assert.deepEqual((await api('GET', `commands/${b.id}`)).json.links, [{ kind: 'knowledge', id: a.id, title: 'A' }]);

    await api('DELETE', `commands/${b.id}`);
    assert.deepEqual((await api('GET', `knowledge/${a.id}`)).json.links, []);
    assert.equal((await api('PUT', `knowledge/${a.id}`, { title: 'A', links: 'x' })).status, 400);
    await api('DELETE', `knowledge/${a.id}`);
  });
});

describe('study tracking and dashboard', () => {
  it('counts studies and reports them', async () => {
    const entry = (await api('POST', 'knowledge', { title: 'Studied thing' })).json;
    await api('POST', `knowledge/${entry.id}/study`);
    const second = await api('POST', `knowledge/${entry.id}/study`);
    assert.equal(second.json.study_count, 2);

    const dash = (await api('GET', 'dashboard')).json;
    assert.equal(dash.recentlyStudied[0].title, 'Studied thing');
    assert.ok(dash.totals.studiedThisWeek >= 2);
    assert.ok(dash.activity.length >= 1);
    await api('DELETE', `knowledge/${entry.id}`);
  });
});

describe('request guards', () => {
  it('rejects foreign Host headers (DNS rebinding)', async () => {
    assert.equal((await raw('GET', '/api/meta', { headers: { Host: 'evil.example' } })).status, 403);
  });

  it('rejects cross-origin writes', async () => {
    const res = await raw('POST', '/api/knowledge', {
      headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'pwn' }),
    });
    assert.equal(res.status, 403);
    assert.equal((await raw('DELETE', '/api/samples', { headers: { Origin: 'null' } })).status, 403);
  });

  it('requires JSON content type on writes', async () => {
    const res = await raw('POST', '/api/knowledge', { headers: { 'Content-Type': 'text/plain' }, body: '{"title":"x"}' });
    assert.equal(res.status, 415);
  });

  it('rejects malformed and oversized bodies', async () => {
    const headers = { 'Content-Type': 'application/json' };
    assert.equal((await raw('POST', '/api/knowledge', { headers, body: '{oops' })).status, 400);
    assert.equal((await raw('POST', '/api/knowledge', { headers, body: JSON.stringify({ title: 'x', content: 'a'.repeat(3_000_000) }) })).status, 413);
  });

  it('does not serve files outside public/', async () => {
    for (const path of ['/..%2f..%2fpackage.json', '/%2e%2e/server/index.js', '/../package.json', '/..%5c..%5cpackage.json']) {
      const res = await raw('GET', path);
      assert.equal(res.status, 404, path);
    }
  });

  it('sends a restrictive Content-Security-Policy', async () => {
    const res = await raw('GET', '/');
    assert.equal(res.status, 200);
    assert.match(res.headers['content-security-policy'], /default-src 'self'/);
  });
});

describe('persistence and sample data', () => {
  it('seeds once, labels examples, and never reseeds after removal', () => {
    const path = join(dir, 'seed.db');
    let database = openDatabase(path);
    let repository = createRepository(database);
    assert.equal(seedIfFirstRun(repository), true);
    assert.equal(seedIfFirstRun(repository), false);
    assert.equal(repository.dashboard().totals.samples, 13);
    assert.ok(repository.list('knowledge').every((r) => r.is_sample));

    const mine = repository.create('knowledge', { title: 'Mine' });
    assert.equal(repository.removeSamples(), 13);
    assert.equal(repository.dashboard().totals.samples, 0);
    assert.equal(repository.dashboard().activity.reduce((sum, a) => sum + a.total, 0), 1);
    database.close();

    database = openDatabase(path);
    repository = createRepository(database);
    assert.equal(seedIfFirstRun(repository), false);
    assert.deepEqual(repository.list('knowledge').map((r) => r.id), [mine.id]);
    database.close();
  });
});
