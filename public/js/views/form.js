import { api } from '../api.js';
import { pageHeader, recordHref } from '../components.js';
import { h, replaceChildren, today, toast } from '../dom.js';
import { KIND_UI } from '../schema.js';

function linksField(field, initial, options, self, markDirty) {
  const chosen = [...initial];
  const refKey = (r) => `${r.kind}:${r.id}`;
  const selfKey = self ? refKey(self) : null;
  const chips = h('div', { class: 'chips', id: 'link-chips' });

  const select = h('select', { id: 'link-picker', 'aria-label': 'Add a related record' });
  function renderSelect() {
    const taken = new Set(chosen.map(refKey));
    const available = options.filter((o) => !taken.has(refKey(o)) && refKey(o) !== selfKey);
    const groups = Object.keys(KIND_UI).map((kind) =>
      h(
        'optgroup',
        { label: KIND_UI[kind].heading },
        available.filter((o) => o.kind === kind).map((o) => h('option', { value: refKey(o) }, o.title)),
      ),
    );
    replaceChildren(select, h('option', { value: '' }, available.length ? 'Choose a record to link' : 'No other records to link'), groups);
  }

  function renderChips() {
    replaceChildren(
      chips,
      chosen.map((ref) =>
        h(
          'span',
          { class: 'chip' },
          ref.title,
          h(
            'button',
            {
              type: 'button',
              'aria-label': `Remove link to ${ref.title}`,
              onclick: () => {
                chosen.splice(chosen.indexOf(ref), 1);
                markDirty();
                renderAll();
              },
            },
            '×',
          ),
        ),
      ),
    );
  }

  function renderAll() {
    renderChips();
    renderSelect();
  }

  select.addEventListener('change', () => {
    const option = options.find((o) => refKey(o) === select.value);
    if (!option) return;
    chosen.push(option);
    markDirty();
    renderAll();
  });
  renderAll();

  return {
    el: h('div', { class: 'field' }, h('label', { for: 'link-picker' }, field.label), select, chips),
    value: () => chosen.map(({ kind, id }) => ({ kind, id })),
  };
}

export function formView(kind) {
  return async ({ params, setDirty }) => {
    const ui = KIND_UI[kind];
    const editing = params.id !== undefined;
    const [meta, options, record] = await Promise.all([api.meta(), api.options(), editing ? api.get(kind, Number(params.id)) : null]);
    const message = h('p', { class: 'form-error', role: 'alert', hidden: true });
    const markDirty = () => setDirty(true);

    let links = null;
    const inputs = {};
    const value = (name, fallback = '') => record?.[name] ?? fallback;

    function control(field) {
      const id = `f-${field.name}`;
      const base = { name: field.name, id, required: field.required };
      switch (field.type) {
        case 'textarea':
          return h('textarea', { ...base, rows: field.rows ?? 4, value: value(field.name) });
        case 'code':
          return h('textarea', { ...base, class: 'mono', spellcheck: false, rows: field.rows ?? 5, value: value(field.name) });
        case 'category':
          return h('select', base, meta.categories.map((c) => h('option', { value: c, selected: c === value('category', 'Other') }, c)));
        case 'captureType':
          return h('select', base, meta.captureTypes.filter((t) => t.kind === 'knowledge').map((t) => h('option', { value: t.id, selected: t.id === value('capture_type', 'note') }, t.label)));
        case 'date':
          return h('input', { ...base, type: 'date', value: value('entry_date', today()) });
        case 'tags':
          return h('input', { ...base, placeholder: 'comma, separated', autocomplete: 'off', value: (record?.tags ?? []).join(', ') });
        default:
          return h('input', { ...base, maxLength: 300, autocomplete: 'off', value: value(field.name) });
      }
    }

    function fieldNode(field) {
      if (field.type === 'links') {
        links = linksField(field, record?.links ?? [], options, editing ? { kind, id: Number(params.id) } : null, markDirty);
        return links.el;
      }
      const input = control(field);
      inputs[field.name] = input;
      return h('div', { class: 'field' }, h('label', { for: input.id }, field.label, field.required && h('span', { class: 'req' }, ' required')), input);
    }

    // Consecutive half/third-width fields share a row.
    const nodes = [];
    let row = null;
    for (const field of ui.form) {
      if (field.group) {
        row = null;
        nodes.push(h('div', { class: 'form-group-head' }, h('h2', null, field.group), field.note && h('p', null, field.note)));
        continue;
      }
      if (field.half || field.third) {
        if (!row || row.dataset.span !== (field.half ? 'half' : 'third')) {
          row = h('div', { class: 'field-row', dataset: { span: field.half ? 'half' : 'third' } });
          nodes.push(row);
        }
        row.append(fieldNode(field));
      } else {
        row = null;
        nodes.push(fieldNode(field));
      }
    }

    const cancelHref = editing ? recordHref(kind, params.id) : `#/${kind}`;
    const form = h(
      'form',
      {
        class: 'panel form',
        id: 'record-form',
        novalidate: true,
        oninput: markDirty,
        onkeydown: (e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') form.requestSubmit();
        },
        onsubmit: async (e) => {
          e.preventDefault();
          message.hidden = true;
          const body = Object.fromEntries(Object.entries(inputs).map(([name, input]) => [name, input.value]));
          if (links) body.links = links.value();
          try {
            const saved = editing ? await api.update(kind, Number(params.id), body) : await api.create(kind, body);
            setDirty(false);
            toast('Saved.');
            location.hash = recordHref(kind, saved.id);
          } catch (err) {
            message.textContent = err.message;
            message.hidden = false;
            message.scrollIntoView({ block: 'center' });
          }
        },
      },
      nodes,
      message,
      h('div', { class: 'form-actions' }, h('button', { class: 'button primary', type: 'submit', id: 'save-record' }, 'Save'), h('a', { class: 'button', href: cancelHref }, 'Cancel'), h('span', { class: 'hint' }, 'Ctrl + Enter')),
    );

    return h('div', { class: 'page narrow' }, pageHeader(editing ? `Edit ${ui.singular}` : `New ${ui.singular}`, editing ? record.title : null), form);
  };
}
