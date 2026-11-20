// The learning loop on top of the archive:
// CAPTURE -> UNDERSTAND -> EXPLAIN -> REPRODUCE -> VERIFY.
//
// Records are captured and understood in the archive itself. This module adds
// explain-back exercises, rebuild challenges, generated assessments, a
// spaced-repetition review queue, the knowledge map, and progress reporting.

import { PASS } from './evaluator.js';
import { NotFoundError, ValidationError } from './repository.js';
import { CATEGORIES, isKind, KINDS, RESOURCES } from './resources.js';

const DAY = 86_400_000;
const NEW_PER_SESSION = 10;
const MAX_RESPONSE = 50_000;

const join = (...parts) => parts.map((p) => (p ?? '').trim()).filter(Boolean).join('\n\n');
const codeOf = (text) => [...String(text ?? '').matchAll(/```[^\n`]*\n?([\s\S]*?)```/g)].map((m) => m[1].trim()).join('\n\n');
const clip = (text, n) => {
  const t = String(text ?? '').trim().replace(/\s+/g, ' ');
  return t.length > n ? `${t.slice(0, n - 1).trim()}…` : t;
};

// What each record type asks you to explain and to rebuild. `reference` is the
// user's own text; an exercise is available only once that text exists.
const EXERCISES = {
  knowledge: {
    explain: (r) => ({
      prompt: `Explain “${r.title}” in your own words. What is it, why is it needed, and how does it work?`,
      reference: join(r.what_is_it, r.why_needed, r.how_it_works),
      missing: 'Write “What is it?”, “Why is it needed?” or “How does it work?” first. Your own notes are the answer key.',
    }),
    rebuild: (r) => ({
      prompt: `Rebuild the example for “${r.title}” from memory.`,
      context: r.what_is_it ? { text: r.what_is_it } : null,
      reference: codeOf(r.real_example) || (r.capture_type === 'snippet' ? r.content.trim() : ''),
      code: true,
      missing: 'Add a code example in “Real-world example” (inside ``` fences) to unlock this challenge.',
    }),
  },
  commands: {
    explain: (r) => ({
      prompt: 'What does this command do, and what does each part of it mean?',
      context: { text: r.command, code: true },
      reference: join(r.purpose, r.explanation),
      missing: 'Write the Purpose or Explanation first. Your own notes are the answer key.',
    }),
    rebuild: (r) => ({
      prompt: 'Write the command from memory.',
      context: { text: r.purpose || r.title },
      reference: r.command.trim(),
      code: true,
      missing: '',
    }),
  },
  errors: {
    explain: (r) => ({
      prompt: 'You hit this error. What is the root cause, beneath the symptom?',
      context: { text: r.error_message, code: true, tone: 'danger' },
      reference: r.root_cause.trim(),
      missing: 'Write the Root cause first. Your own notes are the answer key.',
    }),
    rebuild: (r) => ({
      prompt: 'Reproduce the fix: what exactly do you change, and how do you prove it worked?',
      context: { text: r.error_message, code: true, tone: 'danger' },
      reference: join(r.solution, r.verification),
      missing: 'Write the Solution first to unlock this challenge.',
    }),
  },
  workflows: {
    explain: (r) => ({
      prompt: `Explain “${r.title}”: what is the goal, what must be true first, and where does it usually go wrong?`,
      reference: join(r.goal, r.prerequisites, r.pitfalls),
      missing: 'Write the Goal, Prerequisites or Pitfalls first. Your own notes are the answer key.',
    }),
    rebuild: (r) => ({
      prompt: 'Write the steps from memory, in order.',
      context: { text: r.goal || r.title },
      reference: r.steps.trim(),
      code: true,
      missing: '',
    }),
  },
};

const UNDERSTOOD_FIELDS = {
  knowledge: ['what_is_it', 'why_needed', 'how_it_works'],
  commands: ['purpose', 'explanation'],
  errors: ['root_cause', 'solution'],
  workflows: ['goal', 'steps', 'verification'],
};

export const STAGES = [
  { key: 'captured', label: 'Captured' },
  { key: 'understood', label: 'Understood' },
  { key: 'explained', label: 'Explained' },
  { key: 'reproduced', label: 'Reproduced' },
  { key: 'verified', label: 'Verified' },
];

export const RATINGS = { 1: 'Again', 2: 'Hard', 3: 'Good', 4: 'Easy' };

// SM-2 style scheduling, simplified to four buttons.
export function schedule(prev, rating, now = new Date()) {
  const state = { interval: prev?.interval_days ?? 0, ease: prev?.ease ?? 2.5, reps: prev?.reps ?? 0, lapses: prev?.lapses ?? 0 };
  if (rating === 1) {
    state.lapses += prev ? 1 : 0;
    state.reps = 0;
    state.interval = 0;
    state.ease = Math.max(1.3, state.ease - 0.2);
  } else {
    // "Good" is the reference step; "Hard" is shorter and "Easy" always longer.
    const good = state.reps === 0 ? 1 : state.reps === 1 ? 3 : Math.max(state.interval + 1, state.interval * state.ease);
    if (rating === 2) {
      state.interval = Math.max(1, Math.min(good - 1, state.interval * 1.2));
      state.ease = Math.max(1.3, state.ease - 0.15);
    } else if (rating === 3) {
      state.interval = good;
    } else {
      state.interval = state.reps === 0 ? 4 : Math.max(good + 2, good * 1.3);
      state.ease += 0.15;
    }
    state.reps += 1;
  }
  state.interval = Math.round(state.interval * 10) / 10;
  // "Again" comes back in ten minutes, everything else on a day boundary.
  const due = rating === 1 ? new Date(now.getTime() + 10 * 60_000) : new Date(now.getTime() + state.interval * DAY);
  return { ...state, due_at: due.toISOString() };
}

const suggestRating = (score) => (score < 40 ? 1 : score < 60 ? 2 : score < 85 ? 3 : 4);

function parseRating(value) {
  if (![1, 2, 3, 4].includes(value)) throw new ValidationError('Rating must be 1 (Again), 2 (Hard), 3 (Good) or 4 (Easy).');
  return value;
}

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Hides the answer when a definition happens to contain its own title.
function maskTitle(text, title) {
  const escaped = title.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return escaped ? text.replace(new RegExp(escaped, 'gi'), '_____') : text;
}

const QUIZ_SOURCES = [
  {
    kind: 'knowledge',
    prompt: 'Which concept does this describe?',
    valid: (r) => r.what_is_it.trim(),
    stem: (r) => ({ text: clip(maskTitle(r.what_is_it, r.title), 500) }),
    answer: (r) => clip(r.title, 160),
  },
  {
    kind: 'commands',
    prompt: 'Which command does this?',
    valid: (r) => r.purpose.trim(),
    stem: (r) => ({ text: clip(r.purpose, 500) }),
    answer: (r) => clip(r.command.split('\n')[0], 160),
    code: true,
  },
  {
    kind: 'errors',
    prompt: 'What is the root cause of this error?',
    valid: (r) => r.root_cause.trim(),
    stem: (r) => ({ text: clip(r.error_message, 400), code: true, tone: 'danger' }),
    answer: (r) => clip(r.root_cause, 220),
  },
  {
    kind: 'workflows',
    prompt: 'Which workflow achieves this goal?',
    valid: (r) => r.goal.trim(),
    stem: (r) => ({ text: clip(r.goal, 500) }),
    answer: (r) => clip(r.title, 160),
  },
];

export function createLearning(repo, evaluator) {
  const { db, rawGet, requireRow, transaction, decode, orderedPair, logActivity } = repo.internals;
  const now = () => new Date();

  const allRecords = () => KINDS.flatMap((kind) => db.prepare(`SELECT * FROM ${RESOURCES[kind].table}`).all().map((r) => ({ kind, ...decode(r) })));
  const getReview = (kind, id) => db.prepare('SELECT * FROM reviews WHERE kind = ? AND item_id = ?').get(kind, id);

  function exercise(kind, record, mode) {
    const ex = EXERCISES[kind][mode](record);
    return { mode, available: Boolean(ex.reference), ...ex };
  }

  // Updates the study counters and the activity chart. Callers hold a transaction.
  function touchStudied(kind, record, at) {
    db.prepare(`UPDATE ${RESOURCES[kind].table} SET last_studied_at = ?, study_count = study_count + 1 WHERE id = ?`).run(at, record.id);
    logActivity('studied', kind, record.id, record.title, record.is_sample, at);
  }

  function applyRating(kind, id, rating, at) {
    const next = schedule(getReview(kind, id), rating, new Date(at));
    db.prepare(
      `INSERT INTO reviews (kind, item_id, due_at, interval_days, ease, reps, lapses, last_rating, last_reviewed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (kind, item_id) DO UPDATE SET due_at = excluded.due_at, interval_days = excluded.interval_days,
         ease = excluded.ease, reps = excluded.reps, lapses = excluded.lapses, last_rating = excluded.last_rating,
         last_reviewed_at = excluded.last_reviewed_at`,
    ).run(kind, id, next.due_at, next.interval, next.ease, next.reps, next.lapses, rating, at);
    return next;
  }

  function insertAttempt(kind, record, { mode, response = '', score = null, rating = null, at }) {
    const info = db
      .prepare('INSERT INTO attempts (kind, item_id, mode, response, score, rating, is_sample, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(kind, record.id, mode, response, score, rating, record.is_sample ? 1 : 0, at);
    return Number(info.lastInsertRowid);
  }

  // ---- Stages -------------------------------------------------------------

  function attemptStats() {
    const rows = db
      .prepare(
        `SELECT kind, item_id,
                max(CASE WHEN mode = 'explain' THEN score END) AS best_explain,
                max(CASE WHEN mode = 'rebuild' THEN score END) AS best_rebuild,
                max(CASE WHEN mode = 'quiz' AND score = 100 THEN 1 ELSE 0 END) AS quiz_pass,
                count(*) AS attempts,
                max(created_at) AS last_attempt_at
         FROM attempts GROUP BY kind, item_id`,
      )
      .all();
    return new Map(rows.map((r) => [`${r.kind}:${r.item_id}`, r]));
  }

  const reviewMap = () => new Map(db.prepare('SELECT * FROM reviews').all().map((r) => [`${r.kind}:${r.item_id}`, r]));

  function stageOf(kind, record, stats, review) {
    const understood = UNDERSTOOD_FIELDS[kind].every((f) => record[f]?.trim());
    const rebuildAvailable = exercise(kind, record, 'rebuild').available;
    const explained = (stats?.best_explain ?? -1) >= PASS.explain;
    const reproduced = rebuildAvailable ? (stats?.best_rebuild ?? -1) >= PASS.rebuild : null;
    const verified = Boolean(stats?.quiz_pass) || Boolean(review && review.reps >= 2 && review.last_rating >= 3);
    const steps = [
      { ...STAGES[0], done: true },
      { ...STAGES[1], done: understood, hint: `Fill in ${UNDERSTOOD_FIELDS[kind].map((f) => RESOURCES[kind].labels[f]).join(', ')}.` },
      { ...STAGES[2], done: explained, hint: `Score ${PASS.explain}+ on an explain-back exercise.` },
      reproduced === null
        ? { ...STAGES[3], done: true, na: true, hint: 'No rebuild material for this record.' }
        : { ...STAGES[3], done: reproduced, hint: `Score ${PASS.rebuild}+ on a rebuild challenge.` },
      { ...STAGES[4], done: verified, hint: 'Answer it correctly in an assessment, or recall it twice in review.' },
    ];
    let stage = 0;
    while (stage < steps.length && steps[stage].done) stage += 1;
    return { stage, steps };
  }

  function state(kind, id) {
    const record = decode(requireRow(kind, id));
    const stats = attemptStats().get(`${kind}:${id}`);
    const review = getReview(kind, id) ?? null;
    const attempts = db
      .prepare('SELECT id, mode, score, rating, created_at FROM attempts WHERE kind = ? AND item_id = ? ORDER BY created_at DESC, id DESC LIMIT 12')
      .all(kind, id);
    const strip = ({ reference, ...rest }) => rest; // the answer key stays hidden until an attempt is made
    return {
      ...stageOf(kind, record, stats, review),
      exercises: { explain: strip(exercise(kind, record, 'explain')), rebuild: strip(exercise(kind, record, 'rebuild')) },
      review,
      attempts,
      pass: PASS,
    };
  }

  // ---- Explain-back and rebuild ----------------------------------------------

  function attempt(kind, id, input) {
    const record = decode(requireRow(kind, id));
    const mode = input?.mode;
    if (mode !== 'explain' && mode !== 'rebuild') throw new ValidationError('Mode must be explain or rebuild.');
    if (typeof input.response !== 'string' || !input.response.trim()) throw new ValidationError('Write your answer before checking it.');
    if (input.response.length > MAX_RESPONSE) throw new ValidationError('Your answer is too long.');
    const ex = exercise(kind, record, mode);
    if (!ex.available) throw new ValidationError(ex.missing);

    const evaluation = evaluator[mode]({ reference: ex.reference, response: input.response, record, kind });
    const at = now().toISOString();
    const attemptId = transaction(() => {
      const newId = insertAttempt(kind, record, { mode, response: input.response, score: evaluation.score, at });
      touchStudied(kind, record, at);
      return newId;
    });
    return {
      attemptId,
      mode,
      reference: ex.reference,
      code: Boolean(ex.code),
      passed: evaluation.score >= PASS[mode],
      threshold: PASS[mode],
      suggestedRating: suggestRating(evaluation.score),
      evaluator: { id: evaluator.id, label: evaluator.label, ai: evaluator.ai },
      ...evaluation,
    };
  }

  function rateAttempt(attemptId, input) {
    const rating = parseRating(input?.rating);
    const row = db.prepare('SELECT * FROM attempts WHERE id = ?').get(attemptId);
    if (!row) throw new NotFoundError('Attempt not found.');
    if (row.rating !== null) throw new ValidationError('This attempt has already been rated.');
    return transaction(() => {
      db.prepare('UPDATE attempts SET rating = ? WHERE id = ?').run(rating, attemptId);
      const next = applyRating(row.kind, row.item_id, rating, now().toISOString());
      return { rating, label: RATINGS[rating], due_at: next.due_at, interval_days: next.interval };
    });
  }

  // ---- Review center --------------------------------------------------------

  function previewIntervals(review) {
    return Object.fromEntries([1, 2, 3, 4].map((r) => [r, r === 1 ? 0 : schedule(review, r).interval]));
  }

  function reviewQueue() {
    const at = now();
    const reviews = reviewMap();
    const cards = [];
    let newCount = 0;
    let dueCount = 0;
    const records = allRecords().sort((a, b) => a.created_at.localeCompare(b.created_at));
    for (const record of records) {
      const ex = exercise(record.kind, record, 'explain');
      if (!ex.available) continue;
      const review = reviews.get(`${record.kind}:${record.id}`);
      let status;
      if (!review) status = 'new';
      else if (review.due_at <= at.toISOString()) status = 'due';
      else continue;
      if (status === 'new') newCount += 1;
      else dueCount += 1;
      cards.push({
        kind: record.kind,
        id: record.id,
        title: record.title,
        category: record.category,
        is_sample: record.is_sample,
        status,
        prompt: ex.prompt,
        context: ex.context ?? null,
        reference: ex.reference,
        due_at: review?.due_at ?? null,
        intervals: previewIntervals(review),
      });
    }
    const due = cards.filter((c) => c.status === 'due').sort((a, b) => a.due_at.localeCompare(b.due_at));
    const fresh = cards.filter((c) => c.status === 'new').slice(0, NEW_PER_SESSION);

    const upcoming = [];
    for (let d = 1; d <= 7; d += 1) {
      const start = new Date(at.getFullYear(), at.getMonth(), at.getDate() + d);
      const end = new Date(start.getTime() + DAY);
      const n = db.prepare('SELECT count(*) AS n FROM reviews WHERE due_at >= ? AND due_at < ?').get(start.toISOString(), end.toISOString()).n;
      upcoming.push({ date: start.toISOString(), count: n });
    }
    const totals = db
      .prepare(
        `SELECT count(*) AS scheduled, sum(interval_days >= 21) AS mature, sum(interval_days > 0 AND interval_days < 21) AS young,
                sum(interval_days = 0) AS learning FROM reviews`,
      )
      .get();
    return {
      cards: [...due, ...fresh],
      counts: { due: dueCount, new: newCount, newThisSession: fresh.length },
      upcoming,
      totals: { scheduled: totals.scheduled, mature: totals.mature ?? 0, young: totals.young ?? 0, learning: totals.learning ?? 0 },
      ratings: RATINGS,
    };
  }

  function review(kind, id, input) {
    const rating = parseRating(input?.rating);
    const record = decode(requireRow(kind, id));
    const at = now().toISOString();
    return transaction(() => {
      insertAttempt(kind, record, { mode: 'review', rating, at });
      touchStudied(kind, record, at);
      const next = applyRating(kind, id, rating, at);
      return { rating, label: RATINGS[rating], due_at: next.due_at, interval_days: next.interval };
    });
  }

  // ---- Assessments ----------------------------------------------------------

  function createQuiz(input) {
    const size = input?.size ?? 8;
    if (!Number.isInteger(size) || size < 1 || size > 20) throw new ValidationError('An assessment has between 1 and 20 questions.');
    let filter = input?.category ?? '';
    if (filter && !CATEGORIES.includes(filter)) throw new ValidationError('Unknown category.');

    const records = allRecords();
    const stats = attemptStats();
    const reviews = reviewMap();
    const candidates = [];
    for (const source of QUIZ_SOURCES) {
      const pool = records.filter((r) => r.kind === source.kind && source.valid(r));
      const answers = new Set(pool.map(source.answer));
      if (answers.size < 3) continue; // a question needs at least two wrong options
      for (const subject of pool) {
        if (filter && subject.category !== filter) continue;
        const key = `${subject.kind}:${subject.id}`;
        const review = reviews.get(key);
        // Weakest and most overdue material first, with some randomness.
        const { stage } = stageOf(subject.kind, subject, stats.get(key), review);
        const overdue = review && review.due_at <= now().toISOString() ? 2 : 0;
        candidates.push({ source, subject, pool, priority: overdue + (5 - stage) * 0.6 + Math.random() * 2 });
      }
    }
    if (!candidates.length) {
      throw new ValidationError(
        filter
          ? `Not enough material in ${filter} for an assessment yet.`
          : 'Not enough material for an assessment yet. You need at least three records of one type with their explanation written (for example three knowledge entries with “What is it?”).',
      );
    }
    const chosen = candidates.sort((a, b) => b.priority - a.priority).slice(0, size);
    const questions = shuffle(chosen).map(({ source, subject, pool }) => {
      const answer = source.answer(subject);
      const others = shuffle(pool.filter((r) => r !== subject && source.answer(r) !== answer));
      others.sort((a, b) => (b.category === subject.category) - (a.category === subject.category));
      const distractors = [];
      for (const r of others) {
        const text = source.answer(r);
        if (!distractors.includes(text)) distractors.push(text);
        if (distractors.length === 3) break;
      }
      const options = shuffle([answer, ...distractors]);
      return {
        kind: subject.kind,
        id: subject.id,
        prompt: source.prompt,
        stem: source.stem(subject),
        options,
        code: Boolean(source.code),
        answer: options.indexOf(answer),
      };
    });
    const at = now().toISOString();
    const info = db.prepare('INSERT INTO quizzes (questions, total, created_at) VALUES (?, ?, ?)').run(JSON.stringify(questions), questions.length, at);
    return publicQuiz(db.prepare('SELECT * FROM quizzes WHERE id = ?').get(Number(info.lastInsertRowid)));
  }

  function publicQuiz(row) {
    const questions = JSON.parse(row.questions);
    const answers = row.answers ? JSON.parse(row.answers) : null;
    const completed = Boolean(row.completed_at);
    return {
      id: row.id,
      total: row.total,
      score: row.score,
      created_at: row.created_at,
      completed_at: row.completed_at,
      questions: questions.map(({ answer, ...q }, i) => {
        const title = rawGet(q.kind, q.id)?.title ?? null;
        if (!completed) return { prompt: q.prompt, stem: q.stem, options: q.options, code: q.code };
        return { ...q, title, answer, chosen: answers[i], correct: answers[i] === answer };
      }),
    };
  }

  function getQuiz(id) {
    const row = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(id);
    if (!row) throw new NotFoundError('Assessment not found.');
    return publicQuiz(row);
  }

  function submitQuiz(id, input) {
    const row = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(id);
    if (!row) throw new NotFoundError('Assessment not found.');
    if (row.completed_at) throw new ValidationError('This assessment has already been submitted.');
    const questions = JSON.parse(row.questions);
    const answers = input?.answers;
    if (!Array.isArray(answers) || answers.length !== questions.length) throw new ValidationError('Send one answer per question.');
    answers.forEach((a, i) => {
      if (a !== null && !(Number.isInteger(a) && a >= 0 && a < questions[i].options.length)) throw new ValidationError(`Answer ${i + 1} is not one of the options.`);
    });
    const at = now().toISOString();
    transaction(() => {
      let score = 0;
      questions.forEach((q, i) => {
        const correct = answers[i] === q.answer;
        if (correct) score += 1;
        const subject = rawGet(q.kind, q.id);
        if (!subject) return; // deleted since the assessment was generated
        const record = decode(subject);
        insertAttempt(q.kind, record, { mode: 'quiz', response: answers[i] === null ? '' : q.options[answers[i]], score: correct ? 100 : 0, at });
        touchStudied(q.kind, record, at);
        applyRating(q.kind, q.id, correct ? 3 : 1, at);
      });
      db.prepare('UPDATE quizzes SET answers = ?, score = ?, completed_at = ? WHERE id = ?').run(JSON.stringify(answers), score, at, id);
    });
    return getQuiz(id);
  }

  function quizHistory() {
    return db
      .prepare('SELECT id, score, total, created_at, completed_at FROM quizzes ORDER BY id DESC LIMIT 25')
      .all();
  }

  // ---- Knowledge map --------------------------------------------------------

  function map() {
    const records = allRecords();
    const stats = attemptStats();
    const reviews = reviewMap();
    const key = (kind, id) => `${kind}:${id}`;
    const nodes = records.map((r) => ({
      key: key(r.kind, r.id),
      kind: r.kind,
      id: r.id,
      title: r.title,
      category: r.category,
      tags: r.tags,
      is_sample: r.is_sample,
      stage: stageOf(r.kind, r, stats.get(key(r.kind, r.id)), reviews.get(key(r.kind, r.id))).stage,
    }));
    const edges = db.prepare('SELECT * FROM links').all().map((l) => ({ a: key(l.a_kind, l.a_id), b: key(l.b_kind, l.b_id) }));
    const linked = new Set(edges.map((e) => [e.a, e.b].sort().join('|')));

    // Suggest connections between records that share tags but are not linked yet.
    const byTag = new Map();
    for (const n of nodes) for (const t of n.tags) byTag.set(t, [...(byTag.get(t) ?? []), n]);
    const pairs = new Map();
    for (const [tag, group] of byTag) {
      if (group.length > 25) continue; // a tag on everything says nothing about any pair
      for (let i = 0; i < group.length; i += 1) {
        for (let j = i + 1; j < group.length; j += 1) {
          const pairKey = [group[i].key, group[j].key].sort().join('|');
          if (linked.has(pairKey)) continue;
          const entry = pairs.get(pairKey) ?? { a: group[i], b: group[j], tags: [] };
          entry.tags.push(tag);
          pairs.set(pairKey, entry);
        }
      }
    }
    const pick = ({ kind, id, title }) => ({ kind, id, title });
    const suggestions = [...pairs.values()]
      .sort((x, y) => y.tags.length - x.tags.length || x.a.title.localeCompare(y.a.title))
      .slice(0, 12)
      .map((p) => ({ a: pick(p.a), b: pick(p.b), tags: p.tags }));
    return { nodes, edges, suggestions, stages: STAGES };
  }

  function linkRefs(input) {
    const refs = [input?.a, input?.b];
    for (const ref of refs) {
      if (!ref || !isKind(ref.kind) || !Number.isInteger(ref.id)) throw new ValidationError('Invalid link.');
      if (!rawGet(ref.kind, ref.id)) throw new NotFoundError('Record not found.');
    }
    if (refs[0].kind === refs[1].kind && refs[0].id === refs[1].id) throw new ValidationError('A record cannot link to itself.');
    return orderedPair(refs[0].kind, refs[0].id, refs[1].kind, refs[1].id);
  }

  function addLink(input) {
    db.prepare('INSERT OR IGNORE INTO links (a_kind, a_id, b_kind, b_id) VALUES (?, ?, ?, ?)').run(...linkRefs(input));
    return { ok: true };
  }

  function removeLink(input) {
    db.prepare('DELETE FROM links WHERE a_kind = ? AND a_id = ? AND b_kind = ? AND b_id = ?').run(...linkRefs(input));
    return { ok: true };
  }

  // ---- Progress -------------------------------------------------------------

  // Every record with its learning stage. One pass, shared by Progress and the Dashboard.
  function stageAll(records, reviews) {
    const stats = attemptStats();
    return records.map((r) => {
      const key = `${r.kind}:${r.id}`;
      return { record: r, ...stageOf(r.kind, r, stats.get(key), reviews.get(key)) };
    });
  }

  const stageCounts = (staged) => {
    const counts = STAGES.map(() => 0);
    for (const x of staged) for (let i = 0; i < x.stage; i += 1) counts[i] += 1;
    return STAGES.map((s, i) => ({ ...s, count: counts[i] }));
  };

  function focusList(staged, limit) {
    const nextStep = (x) => x.steps.find((s) => !s.done);
    return staged
      .filter((x) => x.stage < STAGES.length)
      .sort((a, b) => a.stage - b.stage || b.record.created_at.localeCompare(a.record.created_at))
      .slice(0, limit)
      .map((x) => ({ kind: x.record.kind, id: x.record.id, title: x.record.title, stage: x.stage, next: nextStep(x)?.label, hint: nextStep(x)?.hint, is_sample: x.record.is_sample }));
  }

  function progress() {
    const records = allRecords();
    const reviews = reviewMap();
    const staged = stageAll(records, reviews);

    const stages = stageCounts(staged);
    const byCategory = CATEGORIES.map((category) => {
      const group = staged.filter((x) => x.record.category === category);
      return {
        category,
        total: group.length,
        mastery: group.length ? Math.round((group.reduce((sum, x) => sum + x.stage, 0) / (group.length * STAGES.length)) * 100) : 0,
        verified: group.filter((x) => x.stage === STAGES.length).length,
      };
    }).filter((c) => c.total > 0);
    const byKind = Object.fromEntries(
      KINDS.map((kind) => {
        const group = staged.filter((x) => x.record.kind === kind);
        return [kind, { total: group.length, verified: group.filter((x) => x.stage === STAGES.length).length }];
      }),
    );

    const modeStats = Object.fromEntries(
      db
        .prepare(
          `SELECT mode, count(*) AS count, round(avg(score)) AS avg,
                  sum(CASE WHEN mode = 'explain' THEN score >= ${PASS.explain}
                           WHEN mode = 'rebuild' THEN score >= ${PASS.rebuild}
                           WHEN mode = 'quiz' THEN score = 100
                           ELSE rating >= 3 END) AS passed
           FROM attempts GROUP BY mode`,
        )
        .all()
        .map((r) => [r.mode, { count: r.count, avg: r.avg, passRate: r.count ? Math.round((r.passed / r.count) * 100) : null }]),
    );

    const weeks = [];
    const today = now();
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));
    for (let w = 7; w >= 0; w -= 1) {
      const start = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() - w * 7);
      const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
      const row = db
        .prepare(`SELECT count(*) AS attempts, round(avg(score)) AS avg FROM attempts WHERE created_at >= ? AND created_at < ? AND score IS NOT NULL`)
        .get(start.toISOString(), end.toISOString());
      const reviewsDone = db
        .prepare(`SELECT count(*) AS n FROM attempts WHERE created_at >= ? AND created_at < ? AND mode = 'review'`)
        .get(start.toISOString(), end.toISOString()).n;
      weeks.push({ week: start.toISOString(), scored: row.attempts, avg: row.avg, reviews: reviewsDone });
    }

    const focus = focusList(staged, 8);

    const recent = db
      .prepare('SELECT id, kind, item_id, mode, score, rating, created_at FROM attempts ORDER BY created_at DESC, id DESC LIMIT 12')
      .all()
      .map((a) => ({ ...a, title: rawGet(a.kind, a.item_id)?.title ?? '(deleted)' }));

    const nowIso = today.toISOString();
    return {
      total: records.length,
      stages,
      byCategory,
      byKind,
      modes: modeStats,
      weeks,
      focus,
      recent,
      review: {
        due: db.prepare('SELECT count(*) AS n FROM reviews WHERE due_at <= ?').get(nowIso).n,
        scheduled: db.prepare('SELECT count(*) AS n FROM reviews').get().n,
        mature: db.prepare('SELECT count(*) AS n FROM reviews WHERE interval_days >= 21').get().n,
      },
      pass: PASS,
    };
  }

  // Compact numbers for the dashboard.
  // Computes only what the Dashboard shows: one pass over the records, no
  // review cards, charts or category tables. Same numbers as progress() and
  // reviewQueue(); tests/learning.test.js checks they agree.
  function summary() {
    const records = allRecords();
    const reviews = reviewMap();
    const at = now().toISOString();
    let due = 0;
    let fresh = 0;
    for (const r of records) {
      if (!exercise(r.kind, r, 'explain').available) continue;
      const review = reviews.get(`${r.kind}:${r.id}`);
      if (!review) fresh += 1;
      else if (review.due_at <= at) due += 1;
    }
    const staged = stageAll(records, reviews);
    return { stages: stageCounts(staged), total: records.length, due, newCards: Math.min(fresh, NEW_PER_SESSION), focus: focusList(staged, 4) };
  }

  return { state, attempt, rateAttempt, reviewQueue, review, createQuiz, getQuiz, submitQuiz, quizHistory, map, addLink, removeLink, progress, summary };
}
