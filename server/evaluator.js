// Scores explain-back and rebuild answers.
//
// The learning loop must work with no network and no paid API, so the default
// provider is a deterministic local analyser. An AI provider can be added later
// by implementing the same two methods (explain, rebuild) and registering it in
// PROVIDERS. Whatever the provider, it receives only the user's answer and the
// user's own reference text for one record, never the whole database.

const STOPWORDS = new Set(
  `a about above after again against all also am an and any are as at be because been before being below between both but by
  can could did do does doing down during each few for from further had has have having he her here hers him his how i if in
  into is it its itself just let like make makes made many may me more most must my no nor not now of off on once only or other
  our out over own same she should so some such than that the their them then there these they this those through to too
  under until up use used uses using very via was we were what when where which while who whom why will with would you your
  yours one two first next then get gets got set sets run runs thing things way ways need needs needed want lot each every
  은 는 이 가 을 를 에 의 와 과 도 로 으로 에서 하다 한다 있다 없다 그리고 그러나 하지만 또는 및 것 수 등 때 더`
    .split(/\s+/)
    .filter(Boolean),
);

const WORD = /[\p{L}\p{N}_]+(?:[.\-'][\p{L}\p{N}_]+)*/gu;

function words(text) {
  return (String(text).toLowerCase().match(WORD) ?? []).filter((w) => {
    if (STOPWORDS.has(w)) return false;
    if (/^\d+$/.test(w)) return false;
    // Hangul syllables carry more meaning per character than Latin letters.
    return /[ㄱ-힝]/.test(w) ? w.length >= 2 : w.length >= 3;
  });
}

// Light stemming so "indexes", "indexing" and "indexed" count as one idea.
function stem(word) {
  if (/[ㄱ-힝]/.test(word)) return word;
  // The trailing "e" goes too, so "schedule", "schedules" and "scheduled" agree.
  const base = word.length > 4 ? word.replace(/(?:ing|ed|es|s|ly)$/, '').replace(/e$/, '') : word;
  return base.replace(/(.)\1$/, '$1') || word;
}

// The terms that carry a reference text: code identifiers in backticks first,
// then the most frequent meaningful words, in order of first appearance.
export function keyTerms(reference, limit = 12) {
  const terms = new Map();
  for (const [, code] of String(reference).matchAll(/`([^`\n]{2,40})`/g)) {
    const key = code.trim().toLowerCase();
    if (!terms.has(key)) terms.set(key, { term: code.trim(), weight: 3, order: terms.size, code: true });
  }
  const seen = new Map();
  words(reference.replace(/```[\s\S]*?```/g, ' ')).forEach((w, i) => {
    const s = stem(w);
    const entry = seen.get(s) ?? { term: w, count: 0, order: i };
    entry.count += 1;
    seen.set(s, entry);
  });
  // Frequent words first; among equals, longer words are usually the more specific ideas.
  const ranked = [...seen.entries()].sort((a, b) => b[1].count - a[1].count || b[1].term.length - a[1].term.length || a[1].order - b[1].order);
  for (const [s, { term, count, order }] of ranked) {
    if (terms.size >= limit) break;
    if (![...terms.values()].some((t) => t.stem === s || t.term.toLowerCase() === term)) {
      terms.set(s, { term, stem: s, weight: count > 1 ? 2 : 1, order: 1000 + order });
    }
  }
  return [...terms.values()].slice(0, limit);
}

function coverage(reference, response) {
  const terms = keyTerms(reference);
  const answerText = String(response).toLowerCase();
  const answerStems = new Set(words(response).map(stem));
  const matched = [];
  const missed = [];
  let got = 0;
  let total = 0;
  for (const t of terms) {
    total += t.weight;
    const hit = t.code ? answerText.includes(t.term.toLowerCase()) : answerStems.has(t.stem) || answerText.includes(t.term);
    if (hit) {
      got += t.weight;
      matched.push(t.term);
    } else {
      missed.push(t.term);
    }
  }
  return { ratio: total ? got / total : 0, matched, missed };
}

const TOKEN = /[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]/gu;
const MAX_TOKENS = 1500;

// Token-level similarity (Dice coefficient over the longest common subsequence).
// Order matters, so "git push --force" and "--force push git" are not equal,
// but whitespace and indentation differences are ignored.
export function similarity(reference, response) {
  const a = (String(reference).match(TOKEN) ?? []).slice(0, MAX_TOKENS);
  const b = (String(response).match(TOKEN) ?? []).slice(0, MAX_TOKENS);
  if (!a.length && !b.length) return 1;
  if (!a.length || !b.length) return 0;
  let prev = new Uint16Array(b.length + 1);
  let row = new Uint16Array(b.length + 1);
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      row[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], row[j - 1]);
    }
    [prev, row] = [row, prev];
  }
  return (2 * prev[b.length]) / (a.length + b.length);
}

function lineDiff(reference, response) {
  const norm = (line) => line.trim().replace(/\s+/g, ' ');
  const mine = new Set(String(response).split('\n').map(norm).filter(Boolean));
  return String(reference)
    .split('\n')
    .map(norm)
    .filter(Boolean)
    .map((line) => ({ line, present: mine.has(line) }));
}

const localProvider = {
  id: 'local',
  label: 'Local analysis',
  description: 'Scored on this server by comparing your answer with your own reference notes. Nothing is sent to an external service.',
  ai: false,

  explain({ reference, response }) {
    const { ratio, matched, missed } = coverage(reference, response);
    const length = words(response).length;
    // A one-word answer that happens to name a key term is not an explanation.
    const lengthFactor = Math.min(1, length / 12);
    const score = Math.round(ratio * 100 * (0.6 + 0.4 * lengthFactor));
    const feedback = [];
    if (length < 12) feedback.push('Your answer is short. A good explanation usually needs a few full sentences.');
    if (missed.length) feedback.push(`Ideas from your notes that your answer did not mention: ${missed.slice(0, 6).join(', ')}.`);
    if (score >= 80) feedback.push('Strong coverage of the key ideas.');
    return { score, matched, missed, feedback };
  },

  rebuild({ reference, response }) {
    const score = Math.round(similarity(reference, response) * 100);
    const lines = lineDiff(reference, response);
    const missing = lines.filter((l) => !l.present).length;
    const feedback = [];
    if (score === 100) feedback.push('Exact reproduction.');
    else if (missing) feedback.push(`${missing} of ${lines.length} reference lines are not in your version. Compare them below.`);
    else feedback.push('Every reference line is present; the differences are extra lines or ordering.');
    return { score, lines, feedback };
  },
};

const PROVIDERS = { local: localProvider };

export function createEvaluator(name = 'local') {
  const provider = PROVIDERS[name];
  if (!provider) {
    console.warn(`Unknown ACADEMY_EVALUATOR "${name}". Falling back to local analysis.`);
    return localProvider;
  }
  return provider;
}

export const PASS = { explain: 60, rebuild: 80 };
