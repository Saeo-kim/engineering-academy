import { codeBlock, h } from './dom.js';
import { isResolved, KIND_UI, progress } from './schema.js';

export const sampleBadge = (record) => record.is_sample && h('span', { class: 'badge sample' }, 'EXAMPLE');
export const kindBadge = (kind) => h('span', { class: `badge kind-${kind}` }, KIND_UI[kind].label);
export const categoryLabel = (category) => h('span', { class: 'meta-item' }, category);

export function statusBadge(record) {
  const resolved = isResolved(record);
  return h('span', { class: `badge ${resolved ? 'resolved' : 'open'}` }, resolved ? '✓ Resolved' : '● Open');
}

export function progressMeter(kind, record, { compact = false } = {}) {
  const { done, total } = progress(kind, record);
  const noun = kind === 'knowledge' ? 'understanding sections' : 'sections';
  const bar = h('span', { class: 'meter-fill', style: { width: `${(done / total) * 100}%` } });
  return h(
    'span',
    { class: `meter${compact ? ' compact' : ''}`, title: `${done} of ${total} ${noun} written` },
    h('span', { class: 'meter-track' }, bar),
    h('span', { class: 'meter-label' }, compact ? `${done}/${total}` : `${done} of ${total} ${noun} written`),
  );
}

export function emptyState(title, body, action) {
  return h('div', { class: 'empty' }, h('h3', null, title), h('p', null, body), action);
}

export function pageHeader(title, intro, ...actions) {
  return h(
    'header',
    { class: 'page-header' },
    h('div', null, h('h1', null, title), intro && h('p', { class: 'intro' }, intro)),
    actions.length > 0 && h('div', { class: 'page-actions' }, actions),
  );
}

export function selectField(label, value, options, onchange) {
  return h(
    'label',
    { class: 'filter' },
    h('span', null, label),
    h(
      'select',
      { onchange: (e) => onchange(e.target.value), name: label.toLowerCase() },
      options.map(([v, text]) => h('option', { value: v, selected: v === (value ?? '') }, text)),
    ),
  );
}

export const recordHref = (kind, id) => `#/${kind}/${id}`;
export const practiceHref = (kind, id, mode) => `#/practice/${kind}/${id}/${mode}`;

export const STAGE_LABELS = ['Captured', 'Understood', 'Explained', 'Reproduced', 'Verified'];

// The five-step learning loop for one record.
export function stageStepper(steps) {
  return h(
    'ol',
    { class: 'stepper', id: 'stage-stepper', 'aria-label': 'Learning stage' },
    steps.map((s, i) =>
      h(
        'li',
        { class: `step-item${s.done ? ' done' : ''}${s.na ? ' na' : ''}`, title: s.done ? (s.na ? s.hint : `${s.label}: done`) : s.hint, dataset: { stage: s.key } },
        h('span', { class: 'step-dot', 'aria-hidden': 'true' }, s.done ? (s.na ? '–' : '✓') : String(i + 1)),
        h('span', { class: 'step-label' }, s.label),
        h('span', { class: 'visually-hidden' }, s.done ? (s.na ? ' (not applicable)' : ' (done)') : ` (to do: ${s.hint})`),
      ),
    ),
  );
}

export function stageBadge(stage) {
  const label = stage >= 5 ? 'Verified' : STAGE_LABELS[Math.max(0, stage - 1)];
  return h('span', { class: `badge stage s${stage}`, title: `Learning stage ${stage} of 5` }, `${stage}/5 ${label}`);
}

// The text an exercise shows next to its prompt: a command, an error, a goal.
export function contextBlock(context) {
  if (!context?.text) return null;
  return context.code ? codeBlock(context.text, { tone: context.tone }) : h('blockquote', { class: 'context' }, context.text);
}
