// All UI is built through h(), which assigns text with text nodes rather than
// innerHTML. Captured terminal output can contain anything, including HTML,
// and it must only ever render as text.

import { annotate, looksLikeCode } from './explain.js';

export function h(tag, props, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key === 'dataset') Object.assign(el.dataset, value);
    else if (key === 'style') Object.assign(el.style, value);
    else if (key.startsWith('on')) el.addEventListener(key.slice(2), value);
    else if (key in el && key !== 'list') el[key] = value;
    else el.setAttribute(key, value === true ? '' : value);
  }
  append(el, children);
  return el;
}

function append(el, children) {
  for (const child of children.flat(Infinity)) {
    if (child === undefined || child === null || child === false) continue;
    el.append(child instanceof Node ? child : String(child));
  }
}

export function replaceChildren(el, ...children) {
  el.replaceChildren();
  append(el, children);
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const ICONS = {
  dashboard: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  capture: 'M12 5v14M5 12h14',
  library: 'M4 4h5v16H4zM9 7h5v13H9zM15.5 5.5l4.5 1.2-3.4 13.1-4.5-1.2',
  errors: 'M12 3l10 18H2zM12 10v5M12 18v.5',
  commands: 'M4 5l7 7-7 7M13 19h8',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5',
  workflows: 'M5 4h4v4H5zM15 10h4v4h-4zM5 16h4v4H5zM9 6h3a2 2 0 0 1 2 2v2.5M9 18h3a2 2 0 0 0 2-2v-2',
  review: 'M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4M12 8v4l3 2',
  quiz: 'M9 11l2 2 4-4M5 4h14v16H5z',
  map: 'M6 6a2 2 0 1 0 0 .1M18 8a2 2 0 1 0 0 .1M12 18a2 2 0 1 0 0 .1M7.7 7l8.6.6M7 8l4 8.3M17 10l-4 6.3',
  progress: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  curriculum: 'M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z',
  explain: 'M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM14.5 14.5L20 20M8 10h4M10 8v4',
  courses: 'M2 9l10-5 10 5-10 5zM6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6',
  home: 'M3 11l9-7 9 7M5 10v10h5v-6h4v6h5V10',
  play: 'M8 5v14l11-7z',
  check: 'M5 12l5 5L20 7',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'M6 6l12 12M18 6L6 18',
  install: 'M12 3v12M7 10l5 5 5-5M5 21h14',
  share: 'M12 15V3M8 7l4-4 4 4M7 11H5v10h14V11h-2',
  addSquare: 'M4 4h16v16H4zM12 8v8M8 12h8',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  external: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  video: 'M3 6h13v12H3zM16 10l5-3v10l-5-3',
};

export function icon(name) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', ICONS[name]);
  svg.append(path);
  return svg;
}

function inlineCode(text) {
  return text
    .split(/`([^`\n]+)`/g)
    .map((part, i) => (i % 2 ? h('code', null, annotate(part)) : part.split(/\*\*([^*\n]+)\*\*/g).map((p, j) => (j % 2 ? h('strong', null, p) : p))));
}

// Deliberately small subset of Markdown: ``` fences, `inline code`, paragraphs.
export function richText(text) {
  const root = h('div', { class: 'prose' });
  // ```text fences are tables and diagrams: shown as plain text, not explorable code.
  const parts = text.split(/```([^\n`]*)\n?([\s\S]*?)```/g);
  parts.forEach((part, i) => {
    if (i % 3 === 1) return; // fence language
    if (i % 3 === 2) {
      root.append(codeBlock(part.replace(/\n$/, ''), { plain: parts[i - 1].trim() === 'text' }));
      return;
    }
    for (const para of part.split(/\n{2,}/)) {
      if (para.trim()) root.append(h('p', null, inlineCode(para.trim())));
    }
  });
  return root;
}

export function codeBlock(text, { copy = false, tone, plain = false } = {}) {
  const explorable = !plain && looksLikeCode(text);
  return h(
    'div',
    { class: `code-block${tone ? ` ${tone}` : ''}${explorable ? ' explorable' : ''}` },
    h('pre', { tabIndex: 0 }, h('code', null, explorable ? annotate(text) : text)),
    (explorable || copy) &&
      h(
        'div',
        { class: 'code-tools' },
        explorable && h('a', { class: 'copy', href: '#/explain', title: 'Explain this code line by line in the Code Explainer', onclick: () => stashCode(text) }, 'Explain'),
        copy && copyButton(text),
      ),
  );
}

// Hands a code block to the Code Explainer page.
export function stashCode(text) {
  try {
    sessionStorage.setItem('ea-explain-code', text);
  } catch {
    /* the page then starts empty */
  }
}

export function copyButton(text) {
  const button = h(
    'button',
    {
      type: 'button',
      class: 'copy',
      onclick: async (event) => {
        event.preventDefault();
        event.stopPropagation();
        try {
          await navigator.clipboard.writeText(text);
          button.textContent = 'Copied';
          setTimeout(() => (button.textContent = 'Copy'), 1400);
        } catch {
          toast('Your browser blocked clipboard access.', 'error');
        }
      },
    },
    'Copy',
  );
  return button;
}

export function highlight(text, words) {
  const usable = words.filter(Boolean).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!usable.length) return text;
  const pattern = new RegExp(`(${usable.join('|')})`, 'gi');
  return text.split(pattern).map((part, i) => (i % 2 ? h('mark', null, part) : part));
}

export function toast(message, tone = 'ok') {
  const el = h('div', { class: `toast ${tone}` }, message);
  document.getElementById('toasts').append(el);
  setTimeout(() => el.remove(), tone === 'error' ? 6000 : 3200);
}

export function confirmDialog({ title, body, confirmLabel = 'Confirm', danger = false }) {
  return new Promise((resolve) => {
    const finish = (result) => {
      dialog.close();
      dialog.remove();
      resolve(result);
    };
    const dialog = h(
      'dialog',
      { class: 'dialog', oncancel: (e) => (e.preventDefault(), finish(false)) },
      h('h2', null, title),
      h('p', null, body),
      h(
        'div',
        { class: 'dialog-actions' },
        h('button', { type: 'button', class: 'button', onclick: () => finish(false), dataset: { action: 'cancel' } }, 'Cancel'),
        h(
          'button',
          { type: 'button', class: `button ${danger ? 'danger' : 'primary'}`, onclick: () => finish(true), dataset: { action: 'confirm' } },
          confirmLabel,
        ),
      ),
    );
    document.body.append(dialog);
    dialog.showModal();
  });
}

export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatDate(value) {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function timeAgo(iso) {
  const days = Math.floor((startOfDay(new Date()) - startOfDay(new Date(iso))) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
