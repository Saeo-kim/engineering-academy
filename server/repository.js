import { CAPTURE_TYPES, CATEGORIES, isKind, KINDS, RESOURCES } from './resources.js';

export class ValidationError extends Error {}
export class NotFoundError extends Error {}

const MAX_TITLE = 300;
const MAX_TEXT = 200_000;
const MAX_TAGS = 30;
const ACTIVITY_DAYS = 182; // the dashboard chart shows 26 weeks

const pad = (n) => String(n).padStart(2, '0');
export const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function normalizeTags(input) {
  let raw = input ?? [];
  if (typeof raw === 'string') raw = raw.split(',');
  if (!Array.isArray(raw)) throw new ValidationError('Tags must be a list.');
  const tags = [...new Set(raw.map((t) => String(t).trim().toLowerCase()).filter(Boolean))];
  if (tags.length > MAX_TAGS) throw new ValidationError(`Use at most ${MAX_TAGS} tags.`);
  return tags;
}

function clean(kind, input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new ValidationError('Expected a JSON object.');
  }
  const resource = RESOURCES[kind];
  const row = {};
  for (const field of resource.text) {
    const value = input[field] ?? '';
    if (typeof value !== 'string') throw new ValidationError(`${field} must be text.`);
    if (value.length > MAX_TEXT) throw new ValidationError(`${field} is too long.`);
    row[field] = value;
  }
  if (typeof (input.title ?? '') !== 'string') throw new ValidationError('title must be text.');
  row.title = (input.title ?? '').trim();
  if (row.title.length > MAX_TITLE) throw new ValidationError(`Title must be ${MAX_TITLE} characters or fewer.`);

  for (const field of resource.required) {
    if (!row[field].trim()) {
      throw new ValidationError(`${resource.labels[field] ?? 'Title'} is required.`);
    }
  }

  row.category = input.category || 'Other';
  if (!CATEGORIES.includes(row.category)) throw new ValidationError('Unknown category.');

  row.entry_date = input.entry_date || localDate();
  if (!isValidDate(row.entry_date)) throw new ValidationError('Date must be a valid YYYY-MM-DD date.');

  row.tags = JSON.stringify(normalizeTags(input.tags));

  if (kind === 'knowledge') {
    row.capture_type = input.capture_type || 'note';
    const allowed = CAPTURE_TYPES.filter((t) => t.kind === 'knowledge').map((t) => t.id);
    if (!allowed.includes(row.capture_type)) throw new ValidationError('Unknown capture type.');
  }
  return row;
}

function decode(row) {
  return row && { ...row, tags: JSON.parse(row.tags), is_sample: Boolean(row.is_sample) };
}

// Escapes LIKE wildcards so searching for "100%" or "snake_case" is literal.
const likePattern = (term) => `%${term.replace(/[\\%_]/g, '\\$&')}%`;
const terms = (q) => String(q ?? '').trim().split(/\s+/).filter(Boolean).slice(0, 10);

function haystack(resource) {
  return resource.searchable.map((c) => `coalesce(${c}, '')`).join(` || ' ' || `);
}

function makeSnippet(row, resource, words) {
  const lowered = words.map((w) => w.toLowerCase());
  for (const field of resource.text) {
    if (field === 'capture_type') continue;
    const value = row[field] ?? '';
    const lower = value.toLowerCase();
    const hit = lowered.map((w) => lower.indexOf(w)).filter((i) => i >= 0).sort((a, b) => a - b)[0];
    if (hit === undefined) continue;
    const start = Math.max(0, hit - 60);
    const text = value.slice(start, start + 200).replace(/\s+/g, ' ').trim();
    return {
      field: resource.labels[field] ?? field,
      text: `${start > 0 ? '…' : ''}${text}${start + 200 < value.length ? '…' : ''}`,
    };
  }
  return null;
}

export function createRepository(db) {
  const now = () => new Date().toISOString();

  function transaction(fn) {
    // Durable Objects provide their own transaction API instead of BEGIN/COMMIT.
    if (db.transaction) return db.transaction(fn);
    db.exec('BEGIN IMMEDIATE');
    try {
      const result = fn();
      db.exec('COMMIT');
      return result;
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  }

  function logActivity(action, kind, id, title, isSample = 0, at = now()) {
    db.prepare('INSERT INTO activity (action, kind, item_id, title, is_sample, at) VALUES (?, ?, ?, ?, ?, ?)').run(
      action,
      kind,
      id,
      title,
      isSample ? 1 : 0,
      at,
    );
  }

  function forgetLearning(kind, id) {
    db.prepare('DELETE FROM attempts WHERE kind = ? AND item_id = ?').run(kind, id);
    db.prepare('DELETE FROM reviews WHERE kind = ? AND item_id = ?').run(kind, id);
  }

  const rawGet = (kind, id) => db.prepare(`SELECT * FROM ${RESOURCES[kind].table} WHERE id = ?`).get(id);

  function requireRow(kind, id) {
    const row = rawGet(kind, id);
    if (!row) throw new NotFoundError('Record not found.');
    return row;
  }

  function orderedPair(kindA, idA, kindB, idB) {
    return kindA < kindB || (kindA === kindB && idA < idB) ? [kindA, idA, kindB, idB] : [kindB, idB, kindA, idA];
  }

  function setLinks(kind, id, links) {
    if (links === undefined) return;
    if (!Array.isArray(links)) throw new ValidationError('links must be a list.');
    db.prepare('DELETE FROM links WHERE (a_kind = ? AND a_id = ?) OR (b_kind = ? AND b_id = ?)').run(kind, id, kind, id);
    const insert = db.prepare('INSERT OR IGNORE INTO links (a_kind, a_id, b_kind, b_id) VALUES (?, ?, ?, ?)');
    for (const link of links) {
      if (!link || !isKind(link.kind) || !Number.isInteger(link.id)) throw new ValidationError('Invalid link.');
      if (link.kind === kind && link.id === id) continue;
      if (!rawGet(link.kind, link.id)) continue; // target removed while the form was open
      insert.run(...orderedPair(kind, id, link.kind, link.id));
    }
  }

  function getLinks(kind, id) {
    const pairs = db
      .prepare(
        `SELECT b_kind AS kind, b_id AS id FROM links WHERE a_kind = ? AND a_id = ?
         UNION ALL
         SELECT a_kind, a_id FROM links WHERE b_kind = ? AND b_id = ?`,
      )
      .all(kind, id, kind, id);
    return pairs
      .map((link) => {
        const row = rawGet(link.kind, link.id);
        return row ? { kind: link.kind, id: link.id, title: row.title } : null;
      })
      .filter(Boolean);
  }

  function matchClause(resource, words) {
    return {
      sql: words.map(() => `(${haystack(resource)}) LIKE ? ESCAPE '\\'`),
      params: words.map(likePattern),
    };
  }

  function list(kind, { q, category, tag, type, status } = {}) {
    const resource = RESOURCES[kind];
    const match = matchClause(resource, terms(q));
    const where = [...match.sql];
    const params = [...match.params];
    if (category) {
      where.push('category = ?');
      params.push(category);
    }
    if (tag) {
      where.push('EXISTS (SELECT 1 FROM json_each(tags) WHERE value = ?)');
      params.push(tag.toLowerCase());
    }
    if (type && kind === 'knowledge') {
      where.push('capture_type = ?');
      params.push(type);
    }
    if (kind === 'errors' && status === 'resolved') where.push("trim(solution) <> ''");
    if (kind === 'errors' && status === 'open') where.push("trim(solution) = ''");
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    return db
      .prepare(`SELECT * FROM ${resource.table} ${clause} ORDER BY entry_date DESC, created_at DESC, id DESC`)
      .all(...params)
      .map(decode);
  }

  function get(kind, id) {
    return { ...decode(requireRow(kind, id)), links: getLinks(kind, id) };
  }

  function insertRow(kind, row, { isSample = false, at = now() } = {}) {
    const columns = Object.keys(row);
    const info = db
      .prepare(
        `INSERT INTO ${RESOURCES[kind].table} (${columns.join(', ')}, is_sample, created_at, updated_at)
         VALUES (${columns.map(() => '?').join(', ')}, ?, ?, ?)`,
      )
      .run(...columns.map((c) => row[c]), isSample ? 1 : 0, at, at);
    return Number(info.lastInsertRowid);
  }

  function create(kind, input) {
    const row = clean(kind, input);
    return transaction(() => {
      const id = insertRow(kind, row);
      setLinks(kind, id, input.links);
      logActivity('created', kind, id, row.title);
      return get(kind, id);
    });
  }

  function update(kind, id, input) {
    const existing = requireRow(kind, id);
    const row = clean(kind, input);
    return transaction(() => {
      const columns = Object.keys(row);
      db.prepare(
        `UPDATE ${RESOURCES[kind].table} SET ${columns.map((c) => `${c} = ?`).join(', ')}, updated_at = ? WHERE id = ?`,
      ).run(...columns.map((c) => row[c]), now(), id);
      setLinks(kind, id, input.links);
      logActivity('updated', kind, id, row.title, existing.is_sample);
      return get(kind, id);
    });
  }

  function remove(kind, id) {
    const existing = requireRow(kind, id);
    transaction(() => {
      db.prepare(`DELETE FROM ${RESOURCES[kind].table} WHERE id = ?`).run(id);
      db.prepare('DELETE FROM links WHERE (a_kind = ? AND a_id = ?) OR (b_kind = ? AND b_id = ?)').run(kind, id, kind, id);
      forgetLearning(kind, id);
      logActivity('deleted', kind, id, existing.title, existing.is_sample);
    });
  }

  function markStudied(kind, id) {
    const existing = requireRow(kind, id);
    return transaction(() => {
      db.prepare(
        `UPDATE ${RESOURCES[kind].table} SET last_studied_at = ?, study_count = study_count + 1 WHERE id = ?`,
      ).run(now(), id);
      logActivity('studied', kind, id, existing.title, existing.is_sample);
      return get(kind, id);
    });
  }

  // Routes a raw capture to the collection that can give it the right structure.
  function capture(input) {
    if (!input || typeof input !== 'object') throw new ValidationError('Expected a JSON object.');
    const type = CAPTURE_TYPES.find((t) => t.id === input.capture_type);
    if (!type) throw new ValidationError('Choose what you are capturing.');
    if (typeof input.content !== 'string' || !input.content.trim()) throw new ValidationError('Content is required.');
    const shared = { title: input.title, category: input.category, tags: input.tags, entry_date: input.entry_date };
    let payload;
    if (type.kind === 'commands') payload = { ...shared, command: input.content };
    else if (type.kind === 'errors') payload = { ...shared, error_message: input.content };
    else if (type.kind === 'workflows') payload = { ...shared, steps: input.content };
    else payload = { ...shared, content: input.content, capture_type: type.id };
    return { kind: type.kind, record: create(type.kind, payload) };
  }

  function search(q) {
    const words = terms(q);
    if (!words.length) return [];
    const lowered = words.map((w) => w.toLowerCase());
    const results = KINDS.flatMap((kind) =>
      list(kind, { q }).map((row) => {
        const title = row.title.toLowerCase();
        const titleHits = lowered.filter((w) => title.includes(w)).length;
        return {
          kind,
          id: row.id,
          title: row.title,
          category: row.category,
          tags: row.tags,
          entry_date: row.entry_date,
          is_sample: row.is_sample,
          snippet: makeSnippet(row, RESOURCES[kind], words),
          score: titleHits * 10 + (title === q.trim().toLowerCase() ? 100 : 0),
        };
      }),
    );
    return results.sort((a, b) => b.score - a.score || b.entry_date.localeCompare(a.entry_date));
  }

  const count = (table, where = '') => db.prepare(`SELECT count(*) AS n FROM ${table} ${where}`).get().n;

  function dashboard() {
    const unionOf = (columns) =>
      KINDS.map((kind) => `SELECT '${kind}' AS kind, id, title, category, is_sample, ${columns} FROM ${RESOURCES[kind].table}`).join(
        ' UNION ALL ',
      );
    const flag = (row) => ({ ...row, is_sample: Boolean(row.is_sample) });

    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (ACTIVITY_DAYS - 1));
    const weekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
    const activity = db
      .prepare(
        `SELECT date(at, 'localtime') AS day,
                count(*) AS total,
                sum(action = 'studied') AS studied,
                sum(action = 'created') AS created,
                sum(action = 'updated') AS updated
         FROM activity WHERE action <> 'deleted' AND date(at, 'localtime') >= ?
         GROUP BY day ORDER BY day`,
      )
      .all(localDate(from));

    return {
      totals: {
        knowledge: count('knowledge'),
        errors: count('errors'),
        commands: count('commands'),
        workflows: count('workflows'),
        unresolved: count('errors', "WHERE trim(solution) = ''"),
        studiedThisWeek: db
          .prepare("SELECT count(*) AS n FROM activity WHERE action = 'studied' AND date(at, 'localtime') >= ?")
          .get(localDate(weekAgo)).n,
        samples: KINDS.reduce((sum, kind) => sum + count(RESOURCES[kind].table, 'WHERE is_sample = 1'), 0),
      },
      recentCaptures: db
        .prepare(`SELECT * FROM (${unionOf('created_at')}) ORDER BY created_at DESC, id DESC LIMIT 8`)
        .all()
        .map(flag),
      recentlyStudied: db
        .prepare(
          `SELECT * FROM (${unionOf('last_studied_at, study_count')})
           WHERE last_studied_at IS NOT NULL ORDER BY last_studied_at DESC LIMIT 6`,
        )
        .all()
        .map(flag),
      activity,
      activityDays: ACTIVITY_DAYS,
    };
  }

  function meta() {
    const counts = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
    for (const row of db.prepare('SELECT category, count(*) AS n FROM knowledge GROUP BY category').all()) {
      counts[row.category] = row.n;
    }
    const tags = db
      .prepare(
        `SELECT value AS tag, count(*) AS n FROM (
           ${KINDS.map((k) => `SELECT json_each.value FROM ${RESOURCES[k].table}, json_each(${RESOURCES[k].table}.tags)`).join(
             ' UNION ALL ',
           )}
         ) GROUP BY value ORDER BY n DESC, value`,
      )
      .all();
    return { categories: CATEGORIES, captureTypes: CAPTURE_TYPES, knowledgeByCategory: counts, tags };
  }

  // Lightweight list for the "related records" picker.
  function options() {
    return KINDS.flatMap((kind) =>
      db
        .prepare(`SELECT id, title FROM ${RESOURCES[kind].table} ORDER BY title COLLATE NOCASE`)
        .all()
        .map((row) => ({ kind, id: row.id, title: row.title })),
    );
  }

  function removeSamples() {
    return transaction(() => {
      let removed = 0;
      for (const kind of KINDS) {
        const table = RESOURCES[kind].table;
        for (const { id } of db.prepare(`SELECT id FROM ${table} WHERE is_sample = 1`).all()) {
          db.prepare('DELETE FROM links WHERE (a_kind = ? AND a_id = ?) OR (b_kind = ? AND b_id = ?)').run(kind, id, kind, id);
          forgetLearning(kind, id);
        }
        removed += Number(db.prepare(`DELETE FROM ${table} WHERE is_sample = 1`).run().changes);
      }
      db.prepare('DELETE FROM activity WHERE is_sample = 1').run();
      return removed;
    });
  }

  return {
    list,
    get,
    create,
    update,
    remove,
    markStudied,
    capture,
    search,
    dashboard,
    meta,
    options,
    removeSamples,
    // Used by the seeder only.
    internals: { clean, insertRow, logActivity, transaction, orderedPair, rawGet, requireRow, decode, db },
  };
}
