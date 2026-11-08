import { api } from '../api.js';
import { categoryLabel, emptyState, pageHeader, progressMeter, recordHref, sampleBadge, selectField, statusBadge } from '../components.js';
import { copyButton, debounce, formatDate, h, replaceChildren } from '../dom.js';
import { KIND_UI } from '../schema.js';

function tagList(tags) {
  return tags.length > 0 && h('span', { class: 'tags' }, tags.slice(0, 4).map((t) => h('span', { class: 'tag' }, t)));
}

function foot(record, ...extra) {
  return h('div', { class: 'card-foot' }, categoryLabel(record.category), h('span', { class: 'meta-item' }, formatDate(record.entry_date)), tagList(record.tags), extra);
}

const preview = (text) => (text.length > 170 ? `${text.slice(0, 170).trim()}…` : text);

const renderers = {
  knowledge: (record, types) =>
    h(
      'a',
      { class: 'card', href: recordHref('knowledge', record.id) },
      h('div', { class: 'card-top' }, h('span', { class: 'eyebrow' }, types[record.capture_type] ?? 'Note'), sampleBadge(record), progressMeter('knowledge', record, { compact: true })),
      h('h3', null, record.title),
      h('p', { class: 'excerpt' }, preview(record.what_is_it || record.content || 'No content yet.')),
      foot(record),
    ),
  commands: (record) =>
    h(
      'div',
      { class: 'card command-card' },
      h('div', { class: 'card-top' }, h('a', { class: 'card-link', href: recordHref('commands', record.id) }, h('h3', null, record.title)), sampleBadge(record)),
      h('div', { class: 'command-line' }, h('code', null, record.command), copyButton(record.command)),
      record.purpose && h('p', { class: 'excerpt' }, preview(record.purpose)),
      foot(record),
    ),
  errors: (record) =>
    h(
      'a',
      { class: 'card error-card', href: recordHref('errors', record.id) },
      h('div', { class: 'card-top' }, statusBadge(record), sampleBadge(record), progressMeter('errors', record, { compact: true })),
      h('h3', null, record.title),
      h('code', { class: 'error-line' }, preview(record.error_message.trim().replace(/\s+/g, ' '))),
      foot(record),
    ),
};

export function listView(kind) {
  return async ({ query }) => {
    const ui = KIND_UI[kind];
    const meta = await api.meta();
    const filters = Object.fromEntries(query);
    const typeLabels = Object.fromEntries(meta.captureTypes.map((t) => [t.id, t.label]));
    const results = h('div', { id: 'results', class: kind === 'knowledge' ? 'cards' : 'cards single', 'aria-live': 'polite' });
    const count = h('p', { class: 'result-count', id: 'result-count' });

    const writeUrl = () => {
      const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();
      history.replaceState(null, '', `#/${kind}${qs ? `?${qs}` : ''}`);
    };

    let latest = 0;
    async function refresh() {
      const ticket = (latest += 1);
      const records = await api.list(kind, filters);
      if (ticket !== latest) return; // a newer filter change has already run
      count.textContent = `${records.length} ${records.length === 1 ? ui.singular : ui.plural}`;
      if (records.length) {
        replaceChildren(results, records.map((r) => renderers[kind](r, typeLabels)));
      } else {
        const filtered = Object.values(filters).some(Boolean);
        replaceChildren(
          results,
          filtered
            ? emptyState('No matches', 'Try fewer filters or a different search term.')
            : emptyState(`No ${ui.plural} yet`, ui.emptyHint, h('a', { class: 'button primary', href: '#/capture' }, 'Capture something')),
        );
      }
    }

    const setFilter = (key, value) => {
      filters[key] = value;
      writeUrl();
      refresh();
    };

    const categoryOptions = [['', 'All categories'], ...meta.categories.map((c) => [c, c])];
    const tagOptions = [['', 'All tags'], ...meta.tags.map((t) => [t.tag, `${t.tag} (${t.n})`])];
    const search = h('input', {
      type: 'search',
      id: 'list-search',
      value: filters.q ?? '',
      placeholder: `Filter ${ui.heading}`,
      'aria-label': `Filter ${ui.heading}`,
      autocomplete: 'off',
      spellcheck: false,
      oninput: debounce((e) => setFilter('q', e.target.value.trim()), 180),
    });

    const controls = [h('label', { class: 'filter grow' }, h('span', null, 'Search'), search)];
    if (kind !== 'knowledge') controls.push(selectField('Category', filters.category, categoryOptions, (v) => setFilter('category', v)));
    if (kind === 'knowledge') {
      const options = [['', 'All types'], ...meta.captureTypes.filter((t) => t.kind === 'knowledge').map((t) => [t.id, t.label])];
      controls.push(selectField('Type', filters.type, options, (v) => setFilter('type', v)));
    }
    if (kind === 'errors') {
      controls.push(selectField('Status', filters.status, [['', 'All'], ['open', 'Open'], ['resolved', 'Resolved']], (v) => setFilter('status', v)));
    }
    controls.push(selectField('Tag', filters.tag, tagOptions, (v) => setFilter('tag', v)));

    let rail = null;
    if (kind === 'knowledge') {
      const total = Object.values(meta.knowledgeByCategory).reduce((a, b) => a + b, 0);
      const buttons = [['', 'All knowledge', total], ...meta.categories.map((c) => [c, c, meta.knowledgeByCategory[c]])].map(([value, label, n]) => {
        const button = h(
          'button',
          {
            type: 'button',
            class: `rail-item${(filters.category ?? '') === value ? ' active' : ''}`,
            dataset: { category: value },
            onclick: () => {
              buttons.forEach((b) => b.classList.toggle('active', b === button));
              setFilter('category', value);
            },
          },
          h('span', null, label),
          h('span', { class: 'rail-count' }, n),
        );
        return button;
      });
      rail = h('nav', { class: 'rail', 'aria-label': 'Categories' }, buttons);
    }

    await refresh();

    return h(
      'div',
      { class: 'page' },
      pageHeader(ui.heading, ui.intro, h('a', { class: 'button primary', href: `#/${kind}/new`, id: 'new-record' }, `New ${ui.singular}`)),
      h('div', { class: rail ? 'with-rail' : '' }, rail, h('div', { class: 'list-main' }, h('div', { class: 'filters' }, controls), count, results)),
    );
  };
}
