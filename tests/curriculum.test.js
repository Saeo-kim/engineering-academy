// The built-in Korean study curriculum (develop's content) must install once,
// and be served by the shared API used by both the Node server and the Worker.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createApiContext, handleApi } from '../server/api.js';
import { installCurriculum } from '../server/curriculum.js';
import { openDatabase } from '../server/db.js';
import { createRepository } from '../server/repository.js';

const call = (ctx, path) => handleApi(ctx, { method: 'GET', headers: { host: 'localhost' }, socket: { remoteAddress: '' }, json: async () => null }, new URL(path, 'http://localhost'));

describe('Korean study curriculum', () => {
  it('installs once per database, never duplicating on restart', () => {
    const db = openDatabase(':memory:');
    const repo = createRepository(db);
    assert.equal(installCurriculum(repo), true);
    const count = repo.dashboard().totals.knowledge;
    assert.ok(count > 0);
    assert.equal(installCurriculum(repo), false, 'second start adds nothing');
    assert.equal(repo.dashboard().totals.knowledge, count);
    db.close();
  });

  it('is served by the shared API with live stage information', async () => {
    const db = openDatabase(':memory:');
    const repo = createRepository(db);
    installCurriculum(repo);
    const ctx = createApiContext(repo, { auth: { enabled: false, isAuthenticated: () => true } });
    const res = await call(ctx, '/api/curriculum');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body) && res.body.length > 0);
    assert.ok(res.body.every((track) => Array.isArray(track.items)));
    db.close();
  });
});
