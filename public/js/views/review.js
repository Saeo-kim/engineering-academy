import { api } from '../api.js';
import { reviewCoach } from '../coach.js';
import { contextBlock, emptyState, kindBadge, pageHeader, practiceHref, recordHref, sampleBadge } from '../components.js';
import { h, replaceChildren, richText, toast } from '../dom.js';
import { RATING_LABELS } from '../schema.js';
import { intervalText } from './practice.js';

const shortInterval = (days) => (days < 1 ? '10m' : `${Math.round(days)}d`);

function statTile(label, value, id) {
  return h('div', { class: 'stat static', id }, h('span', { class: 'stat-label' }, label), h('span', { class: 'stat-value' }, value));
}

function upcomingChart(upcoming) {
  const max = Math.max(1, ...upcoming.map((u) => u.count));
  return h(
    'section',
    { class: 'panel' },
    h('div', { class: 'panel-head' }, h('h2', null, 'Next 7 days')),
    h(
      'ol',
      { class: 'bars', id: 'upcoming' },
      upcoming.map((u) =>
        h(
          'li',
          null,
          h('span', { class: 'bar-label' }, new Date(u.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })),
          h('span', { class: 'bar-track' }, h('span', { class: 'bar-fill', style: { width: `${(u.count / max) * 100}%` } })),
          h('span', { class: 'bar-value' }, u.count),
        ),
      ),
    ),
  );
}

export async function reviewView() {
  const queue = await api.reviewQueue();
  const cards = queue.cards;
  const stage = h('div', { id: 'review-stage' });
  const tally = { 1: 0, 2: 0, 3: 0, 4: 0 };
  let index = 0;
  let revealed = false;
  let busy = false;

  function onKey(e) {
    if (!document.body.contains(stage)) return document.removeEventListener('keydown', onKey);
    if (e.target.closest?.('input, textarea, select')) return;
    if (!revealed && (e.key === ' ' || e.key === 'Enter') && index < cards.length && stage.querySelector('#show-answer')) {
      e.preventDefault();
      reveal();
    } else if (revealed && ['1', '2', '3', '4'].includes(e.key)) {
      rate(Number(e.key));
    }
  }

  function summary() {
    const total = Object.values(tally).reduce((a, b) => a + b, 0);
    replaceChildren(
      stage,
      h(
        'section',
        { class: 'panel', id: 'review-summary' },
        reviewCoach(tally),
        emptyState(
          'Session complete',
          `You reviewed ${total} ${total === 1 ? 'card' : 'cards'}: ${[1, 2, 3, 4].map((r) => `${tally[r]} ${RATING_LABELS[r]}`).join(', ')}.`,
          h('div', { class: 'form-actions center' }, h('a', { class: 'button primary', href: '#/quiz' }, 'Take an assessment'), h('a', { class: 'button', href: '#/progress' }, 'See progress')),
        ),
      ),
    );
  }

  async function rate(rating) {
    if (busy) return;
    busy = true;
    const card = cards[index];
    try {
      const result = await api.review(card.kind, card.id, rating);
      tally[rating] += 1;
      toast(`${RATING_LABELS[rating]} · next review ${intervalText(result.interval_days)}`);
      index += 1;
      show();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      busy = false;
    }
  }

  function reveal() {
    revealed = true;
    const card = cards[index];
    replaceChildren(
      stage.querySelector('.card-answer'),
      h('h3', null, 'Your notes'),
      richText(card.reference),
      h(
        'div',
        { class: 'rating' },
        h(
          'div',
          { class: 'rating-buttons' },
          [1, 2, 3, 4].map((r) =>
            h('button', { type: 'button', class: `button rate r${r}`, dataset: { rating: r }, onclick: () => rate(r) }, h('span', null, RATING_LABELS[r]), h('small', null, `${r} · ${shortInterval(card.intervals[r])}`)),
          ),
        ),
        h('p', { class: 'hint' }, 'Be honest: “Again” brings it back in ten minutes.'),
      ),
    );
    stage.querySelector('.rate.r3')?.focus();
  }

  function show() {
    revealed = false;
    if (index >= cards.length) return summary();
    const card = cards[index];
    replaceChildren(
      stage,
      h('div', { class: 'review-progress' }, h('span', null, `Card ${index + 1} of ${cards.length}`), h('span', { class: 'bar-track' }, h('span', { class: 'bar-fill', style: { width: `${(index / cards.length) * 100}%` } }))),
      h(
        'article',
        { class: 'panel flashcard', id: 'flashcard', dataset: { kind: card.kind, id: card.id } },
        h('div', { class: 'card-top' }, kindBadge(card.kind), h('span', { class: `badge ${card.status === 'new' ? 'new' : 'due'}` }, card.status === 'new' ? 'New' : 'Due'), sampleBadge(card), h('a', { class: 'card-open', href: recordHref(card.kind, card.id) }, 'Open record')),
        h('h2', null, card.title),
        h('p', { class: 'prompt-text' }, card.prompt),
        contextBlock(card.context),
        h('p', { class: 'hint' }, 'Answer in your head or out loud first, then reveal your notes.'),
        h(
          'div',
          { class: 'card-answer' },
          h('div', { class: 'form-actions' }, h('button', { type: 'button', class: 'button primary', id: 'show-answer', onclick: reveal }, 'Show answer'), h('span', { class: 'hint' }, 'Space'), h('a', { class: 'button push', href: practiceHref(card.kind, card.id, 'explain') }, 'Write it out instead')),
        ),
      ),
    );
    stage.querySelector('#show-answer')?.focus();
  }

  const start = () => {
    document.addEventListener('keydown', onKey);
    show();
  };

  if (cards.length) {
    replaceChildren(
      stage,
      h(
        'section',
        { class: 'panel start-panel' },
        h(
          'div',
          null,
          h('h2', null, `${cards.length} ${cards.length === 1 ? 'card' : 'cards'} ready`),
          h('p', { class: 'hint' }, `${queue.counts.due} due for review and ${queue.counts.newThisSession} new. Keyboard: Space reveals, 1 to 4 rates.`),
        ),
        h('button', { type: 'button', class: 'button primary', id: 'start-review', onclick: start }, 'Start review'),
      ),
    );
  } else {
    const next = queue.upcoming.find((u) => u.count > 0);
    replaceChildren(
      stage,
      h(
        'section',
        { class: 'panel', id: 'review-empty' },
        emptyState(
          'All caught up',
          next
            ? `Nothing is due right now. Your next reviews are on ${new Date(next.date).toLocaleDateString('en-US', { weekday: 'long' })}.`
            : 'Nothing to review. Cards appear here once a record has its explanation written (for example “What is it?” on a knowledge entry).',
          h('a', { class: 'button primary', href: '#/knowledge' }, 'Open the library'),
        ),
      ),
    );
  }

  return h(
    'div',
    { class: 'page narrow' },
    pageHeader('Review Center', 'Spaced repetition over your own notes. Each card returns just before you would forget it.'),
    h(
      'div',
      { class: 'stats' },
      statTile('Due now', queue.counts.due, 'stat-due'),
      statTile('New', queue.counts.new, 'stat-new'),
      statTile('Scheduled', queue.totals.scheduled, 'stat-scheduled'),
      statTile('Mature (21d+)', queue.totals.mature, 'stat-mature'),
    ),
    stage,
    upcomingChart(queue.upcoming),
  );
}
