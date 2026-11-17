import { api } from '../api.js';
import { pageHeader, recordHref } from '../components.js';
import { h, replaceChildren, today } from '../dom.js';
import { CAPTURE_DESTINATIONS } from '../schema.js';

// Terminal output often contains credentials. Warn before they get archived.
const SECRET_PATTERNS = [
  ['a private key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['an AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['a GitHub token', /\bgh[pousr]_[A-Za-z0-9]{20,}\b|\bgithub_pat_[A-Za-z0-9_]{20,}\b/],
  ['an API key', /\bsk-[A-Za-z0-9_-]{20,}\b/],
  ['a JWT', /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}/],
  ['a password or secret value', /\b(password|passwd|pwd|secret|api[_-]?key|access[_-]?token)\b\s*[:=]\s*\S+/i],
  ['credentials in a URL', /\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@]+:[^\s/@]+@/i],
];

export function detectSecrets(text) {
  return SECRET_PATTERNS.filter(([, pattern]) => pattern.test(text)).map(([label]) => label);
}

const firstLine = (text) => text.trim().split('\n')[0].trim().slice(0, 80);

export async function captureView({ setDirty }) {
  const meta = await api.meta();
  const result = h('div', { id: 'capture-result' });
  const message = h('p', { class: 'form-error', role: 'alert', hidden: true });
  const warning = h('p', { class: 'secret-warning', id: 'secret-warning', hidden: true });

  const typeRadios = meta.captureTypes.map((type, i) =>
    h(
      'label',
      { class: 'segment' },
      h('input', { type: 'radio', name: 'capture_type', value: type.id, checked: i === 0 }),
      h('span', null, type.label),
    ),
  );

  const title = h('input', { name: 'title', id: 'c-title', maxLength: 300, placeholder: 'Leave blank to use the first line of the content', autocomplete: 'off' });
  const content = h('textarea', { name: 'content', id: 'c-content', class: 'mono', rows: 10, required: true, spellcheck: false });
  const category = h('select', { name: 'category', id: 'c-category' }, meta.categories.map((c) => h('option', { value: c, selected: c === 'Other' }, c)));
  const tags = h('input', { name: 'tags', id: 'c-tags', placeholder: 'git, docker', autocomplete: 'off' });
  const date = h('input', { name: 'entry_date', id: 'c-date', type: 'date', value: today(), required: true });

  const updateWarning = () => {
    const found = detectSecrets(`${title.value}\n${content.value}`);
    warning.hidden = found.length === 0;
    warning.textContent = found.length ? `This looks like it contains ${found.join(', ')}. Replace it with a placeholder before saving.` : '';
  };

  const form = h(
    'form',
    {
      class: 'panel form',
      id: 'capture-form',
      novalidate: true,
      oninput: () => {
        setDirty(Boolean(content.value.trim() || title.value.trim()));
        updateWarning();
      },
      onkeydown: (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') form.requestSubmit();
      },
      onsubmit: async (e) => {
        e.preventDefault();
        message.hidden = true;
        if (!content.value.trim()) {
          message.textContent = 'Paste or type something to capture.';
          message.hidden = false;
          content.focus();
          return;
        }
        try {
          const captureType = form.elements.capture_type.value;
          const { kind, record } = await api.capture({
            capture_type: captureType,
            title: title.value.trim() || firstLine(content.value),
            content: content.value,
            category: category.value,
            tags: tags.value,
            entry_date: date.value,
          });
          setDirty(false);
          title.value = '';
          content.value = '';
          tags.value = '';
          updateWarning();
          replaceChildren(
            result,
            h(
              'div',
              { class: 'notice success' },
              h('p', null, h('strong', null, 'Saved'), ` to the ${CAPTURE_DESTINATIONS[kind]}: ${record.title}`),
              h('a', { class: 'button small', href: `${recordHref(kind, record.id)}/edit`, id: 'capture-continue' }, 'Add explanation'),
            ),
          );
          content.focus();
        } catch (err) {
          message.textContent = err.message;
          message.hidden = false;
        }
      },
    },
    h('fieldset', { class: 'segments' }, h('legend', null, 'What are you capturing?'), typeRadios),
    h('div', { class: 'field' }, h('label', { for: 'c-content' }, 'Content', h('span', { class: 'req' }, ' required')), content),
    warning,
    h('div', { class: 'field' }, h('label', { for: 'c-title' }, 'Title'), title),
    h(
      'div',
      { class: 'field-row' },
      h('div', { class: 'field' }, h('label', { for: 'c-category' }, 'Category'), category),
      h('div', { class: 'field' }, h('label', { for: 'c-tags' }, 'Tags'), tags),
      h('div', { class: 'field' }, h('label', { for: 'c-date' }, 'Date'), date),
    ),
    message,
    h('div', { class: 'form-actions' }, h('button', { class: 'button primary', type: 'submit', id: 'capture-save' }, 'Save capture'), h('span', { class: 'hint' }, 'Ctrl + Enter')),
  );

  return h('div', { class: 'page narrow' }, pageHeader('Quick Capture', 'Save it now and explain it later. Commands go to the Command Library, errors to the Error Archive, workflow steps to Workflows, and everything else to the Knowledge Library.'), result, form);
}
