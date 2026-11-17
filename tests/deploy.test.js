import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { request as httpRequest } from 'node:http';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createApp } from '../server/app.js';
import { loadConfig, platformHosts } from '../server/config.js';
import { openDatabase } from '../server/db.js';
import { createRepository } from '../server/repository.js';

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
