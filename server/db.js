import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const COMMON_COLUMNS = `
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  tags TEXT NOT NULL DEFAULT '[]',
  entry_date TEXT NOT NULL,
  is_sample INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_studied_at TEXT,
  study_count INTEGER NOT NULL DEFAULT 0
`;

// Append-only. Each entry runs once; PRAGMA user_version records progress.
const MIGRATIONS = [
  `
  CREATE TABLE knowledge (
    ${COMMON_COLUMNS},
    content TEXT NOT NULL DEFAULT '',
    capture_type TEXT NOT NULL DEFAULT 'note',
    what_is_it TEXT NOT NULL DEFAULT '',
    why_needed TEXT NOT NULL DEFAULT '',
    how_it_works TEXT NOT NULL DEFAULT '',
    real_example TEXT NOT NULL DEFAULT '',
    exercise TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE commands (
    ${COMMON_COLUMNS},
    command TEXT NOT NULL,
    purpose TEXT NOT NULL DEFAULT '',
    explanation TEXT NOT NULL DEFAULT '',
    expected_output TEXT NOT NULL DEFAULT '',
    common_mistakes TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE errors (
    ${COMMON_COLUMNS},
    error_message TEXT NOT NULL,
    root_cause TEXT NOT NULL DEFAULT '',
    investigation TEXT NOT NULL DEFAULT '',
    solution TEXT NOT NULL DEFAULT '',
    files_affected TEXT NOT NULL DEFAULT '',
    verification TEXT NOT NULL DEFAULT '',
    lessons TEXT NOT NULL DEFAULT ''
  );
  -- Undirected: each pair is stored once, with the smaller ref first.
  CREATE TABLE links (
    a_kind TEXT NOT NULL,
    a_id INTEGER NOT NULL,
    b_kind TEXT NOT NULL,
    b_id INTEGER NOT NULL,
    PRIMARY KEY (a_kind, a_id, b_kind, b_id)
  );
  CREATE INDEX links_b ON links (b_kind, b_id);
  CREATE TABLE activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    kind TEXT NOT NULL,
    item_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    is_sample INTEGER NOT NULL DEFAULT 0,
    at TEXT NOT NULL
  );
  CREATE INDEX activity_at ON activity (at);
  CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  `,
];

export function openDatabase(path) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec('PRAGMA synchronous = FULL; PRAGMA busy_timeout = 3000;');

  const { user_version: version } = db.prepare('PRAGMA user_version').get();
  for (let i = version; i < MIGRATIONS.length; i += 1) {
    db.exec('BEGIN IMMEDIATE');
    try {
      db.exec(MIGRATIONS[i]);
      db.exec(`PRAGMA user_version = ${i + 1}`);
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  }
  return db;
}
