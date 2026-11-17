// Runs the app's data layer on a Cloudflare Durable Object's built-in SQLite.
//
// The repository was written against node:sqlite (prepare().get/all/run with
// positional parameters). Durable Objects expose a synchronous SQL API too, so
// this thin adapter is all the cloud version needs: the same queries, the same
// business logic, and writes that are durable before a response is sent.

import { MIGRATIONS } from '../server/migrations.js';

const bind = (params) => params.map((v) => (v === undefined ? null : typeof v === 'boolean' ? Number(v) : v));

export function durableDatabase(storage) {
  const { sql } = storage;
  return {
    prepare(query) {
      return {
        get: (...params) => sql.exec(query, ...bind(params)).toArray()[0],
        all: (...params) => sql.exec(query, ...bind(params)).toArray(),
        run: (...params) => {
          sql.exec(query, ...bind(params)).toArray();
          const { changes, id } = sql.exec('SELECT changes() AS changes, last_insert_rowid() AS id').one();
          return { changes, lastInsertRowid: id };
        },
      };
    },
    exec: (query) => void sql.exec(query).toArray(),
    transaction: (fn) => storage.transactionSync(fn),
  };
}

// PRAGMA user_version is not available to Durable Objects, so the applied
// schema version lives in its own table. Each migration is atomic.
export function migrate(storage) {
  const { sql } = storage;
  sql.exec('CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL)');
  const row = sql.exec('SELECT version FROM schema_version').toArray()[0];
  let version = row?.version ?? 0;
  if (!row) sql.exec('INSERT INTO schema_version (version) VALUES (0)');
  for (; version < MIGRATIONS.length; version += 1) {
    const next = version + 1;
    storage.transactionSync(() => {
      sql.exec(MIGRATIONS[version]);
      sql.exec('UPDATE schema_version SET version = ?', next);
    });
  }
  return version;
}
