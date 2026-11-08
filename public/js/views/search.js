import { api } from '../api.js';
import { categoryLabel, emptyState, kindBadge, recordHref, sampleBadge } from '../components.js';
import { formatDate, h, highlight, replaceChildren } from '../dom.js';
import { KIND_UI } from '../schema.js';

function resultRow(result, words) {
  return h(
    'a',
    { class: 'card result', href: recordHref(result.kind, result.id), dataset: { kind: result.kind } },
    h('div', { class: 'card-top' }, kindBadge(result.kind), sampleBadge(result)),
    h('h3', null, highlight(result.title, words)),
    result.snippet && h('p', { class: 'excerpt' }, h('span', { class: 'snippet-field' }, `${result.snippet.field}: `), highlight(result.snippet.text, words)),
    h('div', { class: 'card-foot' }, categoryLabel(result.category), h('span', { class: 'meta-item' }, formatDate(result.entry_date)), result.tags.slice(0, 4).map((t) => h('span', { class: 'tag' }, highlight(t, words)))),
  );
}

export async function searchView({ query }) {
  const q = query.get('q')?.trim() ?? '';
  if (!q) {
    return h(
      'div',
      { class: 'page narrow' },
      h('header', { class: 'page-header' }, h('div', null, h('h1', null, 'Search'))),
      h('section', { class: 'panel' }, emptyState('Search everything', 'Type in the bar above to search knowledge, commands, and errors. Paste a fragment of an error message to find out whether you have solved it before.')),
    );
  }

  const results = await api.search(q);
  const words = q.split(/\s+/);
  const list = h('div', { class: 'cards single', id: 'search-results' });
  let active = '';

  const counts = Object.fromEntries(Object.keys(KIND_UI).map((k) => [k, results.filter((r) => r.kind === k).length]));
  const tabs = [
    ['', 'All', results.length],
    ...Object.keys(KIND_UI).map((k) => [k, KIND_UI[k].heading, counts[k]]),
  ].map(([value, label, n]) => {
    const tab = h(
      'button',
      {
        type: 'button',
        class: `tab${value === active ? ' active' : ''}`,
        dataset: { tab: value },
        onclick: () => {
          active = value;
          tabs.forEach((t) => t.classList.toggle('active', t === tab));
          render();
        },
      },
      label,
      h('span', { class: 'rail-count' }, n),
    );
    return tab;
  });

  function render() {
    replaceChildren(list, results.filter((r) => !active || r.kind === active).map((r) => resultRow(r, words)));
  }
  render();

  return h(
    'div',
    { class: 'page narrow' },
    h('header', { class: 'page-header' }, h('div', null, h('h1', null, 'Search'), h('p', { class: 'intro', id: 'search-summary' }, `${results.length} ${results.length === 1 ? 'result' : 'results'} for “${q}”`))),
    results.length
      ? [h('div', { class: 'tabs' }, tabs), list]
      : h('section', { class: 'panel' }, emptyState('No results', 'Try a shorter fragment. All words must appear in the same record.')),
  );
}
