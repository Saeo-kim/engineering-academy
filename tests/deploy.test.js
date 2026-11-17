import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { request as httpRequest } from 'node:http';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { CSP } from '../server/api.js';
import { createApp } from '../server/app.js';
import { loadConfig, platformHosts } from '../server/config.js';
import { openDatabase } from '../server/db.js';
import { createApiContext, handleApi } from '../server/api.js';
import { createRepository } from '../server/repository.js';
import { seedIfFirstRun } from '../server/seed.js';
import { computeVersion, currentVersion } from '../scripts/sw-version.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('cloud configuration', () => {
  it('stays local-only and password-free by default', () => {
    const config = loadConfig({});
    assert.equal(config.host, '127.0.0.1');
    assert.equal(config.exposed, false);
    assert.deepEqual(config.allowedHosts, []);
  });

  it('accepts the hostname a cloud platform announces, and counts as exposed', () => {
    assert.deepEqual(platformHosts({ RENDER_EXTERNAL_HOSTNAME: 'ea.onrender.com' }), ['ea.onrender.com']);
    assert.deepEqual(platformHosts({ RAILWAY_PUBLIC_DOMAIN: 'ea.up.railway.app' }), ['ea.up.railway.app']);
    assert.deepEqual(platformHosts({ FLY_APP_NAME: 'ea' }), ['ea.fly.dev']);
    const config = loadConfig({ RENDER_EXTERNAL_HOSTNAME: 'ea.onrender.com', ACADEMY_ALLOWED_HOSTS: 'learn.example.com, ea.onrender.com' });
    assert.deepEqual(config.allowedHosts, ['learn.example.com', 'ea.onrender.com']);
    assert.equal(config.exposed, true, 'so the server refuses to start without a password');
  });

  it('answers health checks from internal hosts but keeps every other route guarded', async () => {
    const db = openDatabase(':memory:');
    const server = createApp(createRepository(db), { allowedHosts: ['ea.onrender.com'] });
    await new Promise((r) => server.listen(0, '127.0.0.1', r));
    const get = (path, host) =>
      new Promise((resolve, reject) => {
        const req = httpRequest({ host: '127.0.0.1', port: server.address().port, path, headers: { Host: host } }, (res) => {
          res.resume();
          res.on('end', () => resolve(res.statusCode));
        });
        req.on('error', reject);
        req.end();
      });
    try {
      assert.equal(await get('/healthz', '10.214.3.7:10000'), 200);
      assert.equal(await get('/', '10.214.3.7:10000'), 403);
      assert.equal(await get('/api/courses', 'evil.example'), 403);
      assert.equal(await get('/', 'ea.onrender.com'), 200);
    } finally {
      server.closeAllConnections();
      await new Promise((r) => server.close(r));
      db.close();
    }
  });

  it('keeps the database on the persistent disk in the container image', () => {
    const dockerfile = readFileSync(join(root, 'Dockerfile'), 'utf8');
    const blueprint = readFileSync(join(root, 'render.yaml'), 'utf8');
    assert.match(dockerfile, /ACADEMY_DB=\/var\/data\/academy\.db/);
    assert.match(dockerfile, /HOST=0\.0\.0\.0/);
    assert.match(blueprint, /mountPath: \/var\/data/);
    assert.match(blueprint, /healthCheckPath: \/healthz/);
    assert.match(blueprint, /key: ACADEMY_PASSWORD\n\s+sync: false/, 'the password is never committed');
    const ignored = readFileSync(join(root, '.dockerignore'), 'utf8');
    for (const entry of ['data', '.env', '*.db']) assert.ok(ignored.split('\n').includes(entry), `${entry} stays out of the image`);
  });
});

describe('fast loading', () => {
  it('compresses text files and answers revalidation with 304', async () => {
    const db = openDatabase(':memory:');
    const server = createApp(createRepository(db));
    await new Promise((r) => server.listen(0, '127.0.0.1', r));
    const get = (path, headers = {}) =>
      new Promise((resolve, reject) => {
        const req = httpRequest({ host: '127.0.0.1', port: server.address().port, path, headers }, (res) => {
          const chunks = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
        });
        req.on('error', reject);
        req.end();
      });
    try {
      const plain = readFileSync(join(root, 'public/js/views/courses.js'));
      const zipped = await get('/js/views/courses.js', { 'Accept-Encoding': 'gzip, br' });
      assert.equal(zipped.headers['content-encoding'], 'gzip');
      assert.ok(zipped.body.length < plain.length / 2, 'at least 2x smaller');
      assert.deepEqual(gunzipSync(zipped.body), plain);
      const again = await get('/js/views/courses.js', { 'If-None-Match': zipped.headers.etag });
      assert.equal(again.status, 304);
      assert.equal(again.body.length, 0);
      assert.equal((await get('/icons/icon-192.png', { 'Accept-Encoding': 'gzip' })).headers['content-encoding'], undefined, 'PNGs are already compressed');
      assert.equal((await get('/_headers')).status, 404, 'Cloudflare config is not served as content');
    } finally {
      server.closeAllConnections();
      await new Promise((r) => server.close(r));
      db.close();
    }
  });

  it('versions the service worker by the content of the files it caches', () => {
    assert.equal(currentVersion(), computeVersion(), 'run: node scripts/sw-version.js');
    const sw = readFileSync(join(root, 'public/sw.js'), 'utf8');
    assert.doesNotMatch(sw, /'\/index\.html'/, 'never precache a URL that Cloudflare redirects');
    assert.match(sw, /cacheFirst/);
  });
});

describe('Cloudflare deployment', () => {
  it('sends the same security headers for static files as the API', () => {
    const headers = readFileSync(join(root, 'public/_headers'), 'utf8');
    assert.ok(headers.includes(`Content-Security-Policy: ${CSP}`), 'regenerate public/_headers from server/api.js');
    assert.match(headers, /\/sw\.js\n\s+Cache-Control: no-cache/);
  });

  it('bundles the static files that the Worker serves, kept in sync with public/', () => {
    const out = spawnSync(process.execPath, [join(root, 'scripts/bundle-static.js'), '--check'], { encoding: 'utf8' });
    assert.equal(out.status, 0, out.stderr);
  });

  it('runs on the Free plan with a SQLite Durable Object and no committed secrets', () => {
    const config = readFileSync(join(root, 'wrangler.jsonc'), 'utf8');
    assert.match(config, /"new_sqlite_classes": \["Academy"\]/);
    assert.doesNotMatch(config, /"assets"/, 'static files are bundled into the Worker');
    assert.doesNotMatch(config, /ACADEMY_PASSWORD"\s*:/, 'the password is a secret, never a var');
    const ignore = readFileSync(join(root, '.gitignore'), 'utf8');
    assert.match(ignore, /^\.dev\.vars$/m);
  });
});

describe('server work per request', () => {
  const setup = () => {
    const repo = createRepository(openDatabase(':memory:'));
    seedIfFirstRun(repo);
    for (let i = 0; i < 40; i += 1) repo.create('knowledge', { title: `Extra ${i}`, what_is_it: `Definition number ${i} with enough words to quiz.` });
    return { repo, ctx: createApiContext(repo) };
  };
  const call = (ctx, method, path, body) =>
    handleApi(ctx, { method, headers: { host: 'localhost' }, socket: { remoteAddress: '' }, json: async () => body }, new URL(path, 'http://localhost'));

  it('computes the dashboard summary with the same numbers as Progress and the Review Center', () => {
    const { ctx } = setup();
    const summary = ctx.learning.summary();
    const progress = ctx.learning.progress();
    const queue = ctx.learning.reviewQueue();
    assert.deepEqual(summary.stages, progress.stages);
    assert.equal(summary.total, progress.total);
    assert.deepEqual(summary.focus, progress.focus.slice(0, 4));
    assert.equal(summary.due, queue.counts.due);
    assert.equal(summary.newCards, queue.counts.newThisSession);
  });

  it('reuses heavy screens until something is written, then recomputes', async () => {
    const { ctx } = setup();
    const first = await call(ctx, 'GET', '/api/dashboard');
    assert.equal(await call(ctx, 'GET', '/api/dashboard'), first, 'served from memory');
    const created = await call(ctx, 'POST', '/api/knowledge', { title: 'New after caching' });
    assert.equal(created.status, 201);
    const after = await call(ctx, 'GET', '/api/dashboard');
    assert.notEqual(after, first);
    assert.equal(after.body.totals.knowledge, first.body.totals.knowledge + 1, 'never stale after a write');

    const lesson = '/api/courses/robotics/lessons/what-is-a-robot';
    assert.equal((await call(ctx, 'GET', lesson)).body.state.completed, false);
    await call(ctx, 'PUT', lesson, { completed: true });
    assert.equal((await call(ctx, 'GET', lesson)).body.state.completed, true);
  });
});
