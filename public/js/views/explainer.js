// Code Explainer: paste code, read it line by line, click any word to go deeper.
import { pageHeader } from '../components.js';
import { h, replaceChildren } from '../dom.js';
import { annotate, explainHistory, openTerm, readLine } from '../explain.js';
import { GLOSSARY_GROUPS, term } from '../glossary.js';

const SAMPLE = 'List<Store> stores = storeRepository.findAll();\nfor (Store store : stores) {\n    long count = store.getReviews().size();\n}';

function takeStashed() {
  try {
    const code = sessionStorage.getItem('ea-explain-code');
    sessionStorage.removeItem('ea-explain-code');
    return code;
  } catch {
    return null;
  }
}

export async function explainerView({ query }) {
  const initial = takeStashed() ?? SAMPLE;
  const output = h('div', { class: 'xlines', id: 'xlines' });

  const render = (code) => {
    const lines = code.replace(/\r/g, '').split('\n');
    replaceChildren(
      output,
      lines.map((line, i) => {
        if (!line.trim()) return null;
        const { text, sql } = readLine(line);
        return h(
          'div',
          { class: `xline${sql.length ? ' has-sql' : ''}` },
          h('span', { class: 'xline-no' }, String(i + 1)),
          h('div', { class: 'xline-main' }, h('pre', null, h('code', null, annotate(line))), text && h('p', { class: 'xline-read' }, 'How to read it: ', text), sql.length > 0 && h('p', { class: 'xline-sql' }, `🔶 This line may send SQL: ${sql.join(', ')}`)),
        );
      }),
    );
  };

  const input = h('textarea', { id: 'explain-input', rows: 6, spellcheck: false, value: initial, 'aria-label': 'Code to explain', oninput: (e) => render(e.target.value) });
  render(initial);

  const recent = explainHistory();
  const opened = query.get('term');
  if (opened && term(opened)) queueMicrotask(() => openTerm(opened, { reset: true }));

  return h(
    'div',
    { class: 'page', id: 'explainer' },
    pageHeader('Code Explainer', 'Paste code you do not understand. Hover a word for a one-line explanation; click it for a detailed explanation in the panel on the right. Keep clicking inside explanations to go deeper, and use "← Previous explanation" (or Alt + ←) to go back at any time.'),
    h(
      'div',
      { class: 'explain-grid' },
      h(
        'section',
        { class: 'panel' },
        h('div', { class: 'panel-head' }, h('h2', null, 'Paste code'), h('button', { type: 'button', class: 'link-button', onclick: () => ((input.value = SAMPLE), render(SAMPLE)) }, 'Example: N+1 code')),
        h('div', { class: 'explain-input' }, input),
        h('div', { class: 'panel-head' }, h('h2', null, 'Line by line'), h('span', { class: 'panel-note' }, 'Underline = has an explanation · orange = SQL')),
        output,
      ),
      h(
        'aside',
        { class: 'explain-side' },
        recent.length > 0 &&
          h(
            'section',
            { class: 'panel' },
            h('div', { class: 'panel-head' }, h('h2', null, 'Recently viewed'), h('span', { class: 'panel-note' }, 'Start again from here')),
            h('div', { class: 'chip-list' }, recent.slice(0, 12).map((r) => h('button', { type: 'button', class: 'chip', onclick: () => openTerm(r.id, { reset: true }) }, r.label))),
          ),
        h(
          'section',
          { class: 'panel' },
          h('div', { class: 'panel-head' }, h('h2', null, 'Glossary')),
          GLOSSARY_GROUPS.map(([group, ids]) =>
            h('div', { class: 'gloss-group' }, h('h3', null, group), h('div', { class: 'chip-list' }, ids.map(term).filter(Boolean).map((t) => h('button', { type: 'button', class: 'chip', onclick: () => openTerm(t.id, { reset: true }) }, t.label)))),
          ),
        ),
      ),
    ),
  );
}
