import { api } from '../api.js';
import { contextBlock, emptyState, kindBadge, recordHref, sampleBadge, stageStepper } from '../components.js';
import { codeBlock, h, replaceChildren, richText, toast } from '../dom.js';
import { KIND_UI, RATING_LABELS } from '../schema.js';
import { practiceCoach } from '../coach.js';

const MODES = {
  explain: {
    label: 'Explain-back',
    help: 'Answer from memory, in your own words. Your notes stay hidden until you check, then your answer is compared with them.',
    placeholder: 'Explain it as if teaching a new teammate…',
  },
  rebuild: {
    label: 'Rebuild challenge',
    help: 'Reproduce it from memory without looking. Your version is compared line by line with the reference.',
    placeholder: 'Write it out from memory…',
  },
};

export const intervalText = (days) => (days < 1 ? 'in 10 minutes' : days < 1.5 ? 'tomorrow' : `in ${Math.round(days)} days`);

export function scoreRing(score, passed) {
  return h(
    'div',
    { class: `score ${passed ? 'pass' : 'fail'}`, id: 'score', style: { '--p': `${score}` }, role: 'img', 'aria-label': `Score ${score} out of 100` },
    h('strong', null, score),
    h('span', null, '/100'),
  );
}

function ratingBar(attemptId, suggested, onDone) {
  const status = h('p', { class: 'hint', id: 'rating-status' }, 'How well did you really know it? This schedules your next review.');
  const buttons = [1, 2, 3, 4].map((rating) =>
    h(
      'button',
      {
        type: 'button',
        class: `button rate r${rating}${rating === suggested ? ' suggested' : ''}`,
        dataset: { rating },
        onclick: async () => {
          buttons.forEach((b) => (b.disabled = true));
          try {
            const result = await api.rateAttempt(attemptId, rating);
            status.textContent = `Rated ${result.label}. Next review ${intervalText(result.interval_days)}.`;
            buttons.forEach((b) => b.classList.toggle('chosen', b.dataset.rating === String(rating)));
            onDone?.();
          } catch (err) {
            toast(err.message, 'error');
            buttons.forEach((b) => (b.disabled = false));
          }
        },
      },
      RATING_LABELS[rating],
    ),
  );
  return h('div', { class: 'rating' }, h('div', { class: 'rating-buttons' }, buttons), status);
}

function resultPanel(result, response, done) {
  const comparison =
    result.mode === 'rebuild'
      ? h(
          'div',
          { class: 'compare' },
          h('div', null, h('h3', null, 'Your version'), codeBlock(response)),
          h(
            'div',
            null,
            h('h3', null, 'Reference'),
            h(
              'div',
              { class: 'code-block line-diff', id: 'line-diff' },
              h('pre', { tabIndex: 0 }, result.lines.map((l) => h('span', { class: `diff-line ${l.present ? 'present' : 'missing'}` }, h('span', { class: 'diff-mark', 'aria-label': l.present ? 'present' : 'missing' }, l.present ? '✓' : '✗'), l.line, '\n'))),
            ),
          ),
        )
      : h(
          'div',
          { class: 'compare' },
          h('div', null, h('h3', null, 'Your explanation'), richText(response)),
          h('div', null, h('h3', null, 'Your notes'), richText(result.reference)),
        );

  const terms =
    result.mode === 'explain' &&
    h(
      'div',
      { class: 'terms' },
      result.matched.length > 0 && h('div', null, h('span', { class: 'terms-label' }, 'Covered'), h('span', { class: 'chips', id: 'matched-terms' }, result.matched.map((t) => h('span', { class: 'chip hit' }, t)))),
      result.missed.length > 0 && h('div', null, h('span', { class: 'terms-label' }, 'Missed'), h('span', { class: 'chips', id: 'missed-terms' }, result.missed.map((t) => h('span', { class: 'chip miss' }, t)))),
    );

  return h(
    'section',
    { class: 'panel result-panel', id: 'practice-result' },
    h(
      'div',
      { class: 'result-head' },
      scoreRing(result.score, result.passed),
      h(
        'div',
        null,
        h('h2', null, result.passed ? 'Passed' : 'Not yet'),
        h('p', { class: 'hint' }, `Pass mark ${result.threshold}. Scored by ${result.evaluator.label.toLowerCase()}.`),
        h('ul', { class: 'feedback' }, result.feedback.map((f) => h('li', null, f))),
      ),
    ),
    terms,
    comparison,
    ratingBar(result.attemptId, result.suggestedRating, done),
  );
}

export async function practiceView({ params, setDirty, rerender }) {
  const { kind, mode } = params;
  const id = Number(params.id);
  if (!KIND_UI[kind] || !MODES[mode]) return null;
  const [record, learning, meta] = await Promise.all([api.get(kind, id), api.learning(kind, id), api.meta()]);
  const ex = learning.exercises[mode];
  const info = MODES[mode];

  const tabs = h(
    'div',
    { class: 'tabs', role: 'tablist' },
    Object.entries(MODES).map(([m, def]) =>
      h('a', { class: `tab${m === mode ? ' active' : ''}`, href: `#/practice/${kind}/${id}/${m}`, role: 'tab', 'aria-selected': String(m === mode), dataset: { mode: m } }, def.label, !learning.exercises[m].available && h('span', { class: 'rail-count' }, 'locked')),
    ),
  );

  const header = h(
    'header',
    { class: 'detail-head' },
    h('a', { class: 'back', href: recordHref(kind, id) }, `← ${record.title}`),
    h('div', { class: 'detail-badges' }, kindBadge(kind), sampleBadge(record)),
    h('h1', null, info.label),
    h('p', { class: 'intro' }, record.title),
    h('div', { class: 'detail-progress' }, stageStepper(learning.steps)),
  );

  if (!ex.available) {
    return h(
      'div',
      { class: 'page narrow practice' },
      header,
      tabs,
      h('section', { class: 'panel', id: 'practice-locked' }, emptyState('This exercise is locked', ex.missing, h('a', { class: 'button primary', href: `${recordHref(kind, id)}/edit` }, 'Write your notes'))),
    );
  }

  const answer = h('textarea', {
    id: 'practice-answer',
    class: ex.code ? 'mono' : '',
    rows: ex.code ? 10 : 8,
    spellcheck: !ex.code,
    placeholder: info.placeholder,
    'aria-label': 'Your answer',
    oninput: () => setDirty(Boolean(answer.value.trim())),
  });
  const message = h('p', { class: 'form-error', role: 'alert', hidden: true });
  const resultSlot = h('div', { id: 'result-slot' });
  const submit = h('button', { type: 'submit', class: 'button primary', id: 'check-answer' }, 'Check my answer');

  const form = h(
    'form',
    {
      class: 'panel form',
      id: 'practice-form',
      novalidate: true,
      onkeydown: (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') form.requestSubmit();
      },
      onsubmit: async (e) => {
        e.preventDefault();
        message.hidden = true;
        if (!answer.value.trim()) {
          message.textContent = 'Write your answer first.';
          message.hidden = false;
          return;
        }
        submit.disabled = true;
        try {
          const result = await api.attempt(kind, id, mode, answer.value);
          setDirty(false);
          answer.readOnly = true;
          submit.hidden = true;
          replaceChildren(
            resultSlot,
            practiceCoach(kind, id, result),
            resultPanel(result, answer.value, () => {
              replaceChildren(
                nextActions,
                h('a', { class: 'button', href: `#/practice/${kind}/${id}/${mode}`, onclick: (ev) => (ev.preventDefault(), rerender()), id: 'try-again' }, 'Try again'),
                h('a', { class: 'button', href: `#/practice/${kind}/${id}/${mode === 'explain' ? 'rebuild' : 'explain'}` }, mode === 'explain' ? 'Rebuild challenge' : 'Explain-back'),
                h('a', { class: 'button', href: '#/review' }, 'Review Center'),
                h('a', { class: 'button', href: recordHref(kind, id) }, 'Back to record'),
              );
            }),
            nextActions,
          );
          resultSlot.scrollIntoView({ block: 'start', behavior: 'smooth' });
        } catch (err) {
          message.textContent = err.message;
          message.hidden = false;
        } finally {
          submit.disabled = false;
        }
      },
    },
    h('div', { class: 'prompt' }, h('h2', { id: 'practice-prompt' }, ex.prompt), contextBlock(ex.context)),
    h('p', { class: 'hint' }, info.help),
    answer,
    message,
    h('div', { class: 'form-actions' }, submit, h('span', { class: 'hint' }, 'Ctrl + Enter'), !meta.evaluator.ai && h('span', { class: 'hint push' }, 'Local analysis · nothing leaves the server')),
  );
  const nextActions = h('div', { class: 'form-actions next-actions', id: 'next-actions' });

  return h('div', { class: 'page narrow practice' }, header, tabs, form, resultSlot);
}
