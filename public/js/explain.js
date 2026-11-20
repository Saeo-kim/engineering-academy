// Code Explainer: every word in a code block can be hovered (short explanation)
// and clicked (a side panel with the full explanation). Inside the panel,
// "Go deeper" buttons go one level down; "← Back" goes back up the trail, so
// you can always return to where you were studying.
//
// This module builds DOM with document.createElement and text nodes only.

import { lookup, lookupSql, term } from './glossary.js';

const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
};

// ── Tokenizer ──────────────────────────────────────────────
const TOKEN = /(\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(@[A-Za-z]\w*)|(Set-ExecutionPolicy|-[A-Z][A-Za-z]+|\.\\[\w.\\-]+|\.\/[\w./-]+)|([A-Za-z_$][\w$]*(?:\.bat)?)|(\d+L?)|(->|::|==|!=|<=|>=|&&|\|\|)|([.;(){}<>=,+\-*/!?:[\]])|(\s+)|(.)/g;

export function tokenize(text) {
  const out = [];
  for (const m of text.matchAll(TOKEN)) {
    const [raw, comment, str, anno, shell, ident, num, op, punct] = m;
    if (comment) out.push({ t: raw, type: 'comment' });
    else if (str) out.push({ t: raw, type: 'string' });
    else if (anno) out.push({ t: raw, type: 'word' });
    else if (shell) out.push({ t: raw, type: 'word' });
    else if (ident) out.push({ t: raw, type: 'word' });
    else if (num) out.push({ t: raw, type: 'num' });
    else if (op || punct) out.push({ t: raw, type: 'punct' });
    else out.push({ t: raw, type: 'space' });
  }
  return out;
}

const significant = (tokens, i, dir) => {
  for (let j = i + dir; j >= 0 && j < tokens.length; j += dir) {
    if (tokens[j].type !== 'space' && tokens[j].type !== 'comment') return tokens[j].t;
  }
  return '';
};

// Does this text look like code worth annotating?
export function looksLikeCode(text) {
  return /[.;(){}=@]|\b(select|from|git|npm|Set-ExecutionPolicy)\b/i.test(text) && text.length < 20000;
}

// ── Rendering ─────────────────────────────────────────────
export function annotate(text) {
  const frag = document.createDocumentFragment();
  if (!looksLikeCode(text)) {
    frag.append(text);
    return frag;
  }
  const tokens = tokenize(text);
  tokens.forEach((tok, i) => {
    if (tok.type === 'string' && /\b(select|update|delete|from|join)\b/i.test(tok.t)) {
      // JPQL / SQL inside a string: explain its keywords too.
      const span = el('span', 'xs-string');
      for (const part of tok.t.split(/(\b[A-Za-z]+\b)/)) {
        const entry = /^[A-Za-z]+$/.test(part) ? lookupSql(part) : null;
        span.append(entry ? termSpan(part, entry) : part);
      }
      frag.append(span);
      return;
    }
    if (tok.type === 'word' || tok.type === 'punct') {
      const entry = tok.type === 'word' ? lookup(tok.t, { prev: significant(tokens, i, -1), next: significant(tokens, i, 1) }) : punctEntry(tokens, i);
      if (entry) {
        frag.append(termSpan(tok.t, entry));
        return;
      }
    }
    const plain = el('span', tok.type === 'comment' ? 'xs-comment' : tok.type === 'string' ? 'xs-string' : '', tok.t);
    frag.append(tok.type === 'space' ? tok.t : plain);
  });
  return frag;
}

function punctEntry(tokens, i) {
  const t = tokens[i].t;
  if (t === '<' || t === '>') {
    // Only generics: List<Store>, not comparisons.
    const prev = significant(tokens, i, -1);
    if (t === '<' && !/^[A-Z]/.test(prev)) return null;
    if (t === '>' && !/^[A-Z]/.test(prev)) return null;
  }
  if (t === '(' || t === ')' || t === ',') return t === ',' ? null : lookup(t);
  return ['.', ';', '{', '}', '<', '>', '=', '->', '::', '=='].includes(t) ? lookup(t) : null;
}

function termSpan(text, entry) {
  const span = el('span', `xterm${entry.sql ? ' sql' : ''}${entry.generated ? ' gen' : ''}`, text);
  span.tabIndex = 0;
  span.setAttribute('role', 'button');
  span.dataset.term = entry.id;
  span.setAttribute('aria-label', `${text}: ${entry.short}`);
  return span;
}

// "Explain this line": read significant tokens left to right.
export function readLine(line) {
  const tokens = tokenize(line);
  const parts = [];
  const sql = [];
  tokens.forEach((tok, i) => {
    if (tok.type !== 'word') return;
    const entry = lookup(tok.t, { prev: significant(tokens, i, -1), next: significant(tokens, i, 1) });
    if (!entry) return;
    if (entry.sql) sql.push(tok.t);
    const reading = entry.read ?? '';
    if (reading) parts.push(reading);
  });
  return { text: parts.join(' → '), sql };
}

// ── Tooltip ──────────────────────────────────────────────
let tooltip;
function showTooltip(target) {
  const entry = term(target.dataset.term) ?? lookup(target.textContent);
  if (!entry) return;
  tooltip ??= document.body.appendChild(el('div', 'xtip'));
  tooltip.replaceChildren(el('strong', null, entry.label), el('span', null, entry.short), el('em', null, 'Click for details'));
  tooltip.hidden = false;
  const r = target.getBoundingClientRect();
  const w = Math.min(340, window.innerWidth - 24);
  tooltip.style.width = `${w}px`;
  tooltip.style.left = `${Math.max(12, Math.min(r.left, window.innerWidth - w - 12))}px`;
  const below = r.bottom + 8;
  tooltip.style.top = `${below + 120 > window.innerHeight ? Math.max(8, r.top - tooltip.offsetHeight - 8) : below}px`;
}
function hideTooltip() {
  if (tooltip) tooltip.hidden = true;
}

// ── Drawer with a back stack ─────────────────────────────
const stack = [];
let drawer;
const HISTORY_KEY = 'ea-explain-history';

function remember(entry) {
  try {
    const list = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]').filter((x) => x.id !== entry.id);
    list.unshift({ id: entry.id, label: entry.label });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 30)));
  } catch {
    /* storage unavailable: history is a convenience only */
  }
}

export function explainHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function openTerm(id, { reset = false } = {}) {
  const entry = term(id);
  if (!entry) return;
  if (reset) stack.length = 0;
  if (stack.at(-1) !== id) stack.push(id);
  remember(entry);
  renderDrawer();
}

function back() {
  stack.pop();
  if (stack.length) renderDrawer();
  else closeDrawer();
}

function closeDrawer() {
  stack.length = 0;
  if (drawer) drawer.hidden = true;
}

function renderDrawer() {
  if (!drawer) {
    drawer = document.body.appendChild(el('aside', 'xdrawer'));
    drawer.setAttribute('aria-label', 'Code explanation');
  }
  const entry = term(stack.at(-1));
  drawer.hidden = false;
  const head = el('div', 'xd-head');
  const backBtn = el('button', 'button', stack.length > 1 ? '← Previous explanation' : 'Close');
  backBtn.type = 'button';
  backBtn.id = 'xd-back';
  backBtn.onclick = back;
  const close = el('button', 'link-button', '✕');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close explanation');
  close.onclick = closeDrawer;
  head.append(backBtn, close);

  // Breadcrumb: every step of the trail is clickable.
  const crumbs = el('nav', 'xd-crumbs');
  crumbs.setAttribute('aria-label', 'Explanation path');
  stack.forEach((id, i) => {
    const t = term(id);
    if (i) crumbs.append(el('span', 'xd-sep', '›'));
    const b = el('button', `xd-crumb${i === stack.length - 1 ? ' current' : ''}`, t?.label ?? id);
    b.type = 'button';
    b.onclick = () => {
      stack.length = i + 1;
      renderDrawer();
    };
    crumbs.append(b);
  });

  const body = el('div', 'xd-body');
  body.append(el('h2', null, entry.label));
  if (entry.sql) body.append(el('p', 'xd-sql', '🔶 SQL may be sent from this code'));
  body.append(el('p', 'xd-short', entry.short));
  for (const para of entry.body ?? []) body.append(paragraph(para));
  if (entry.example) {
    const pre = el('pre', 'xd-example');
    const code = el('code');
    code.append(annotate(entry.example));
    pre.append(code);
    body.append(el('h3', null, 'Example (click the words here too)'), pre);
  }
  const deeper = (entry.deeper ?? []).map(term).filter(Boolean).filter((t) => !stack.includes(t.id));
  if (deeper.length) {
    body.append(el('h3', null, 'Still unclear? → Go deeper'));
    const list = el('div', 'xd-deeper');
    for (const t of deeper) {
      const b = el('button', 'xd-deep');
      b.type = 'button';
      b.append(el('strong', null, t.label), el('span', null, t.short));
      b.onclick = () => openTerm(t.id);
      list.append(b);
    }
    body.append(list);
  }
  const search = el('a', 'xd-search', `Search records for "${entry.label.replace(/[()@]/g, '').trim()}" →`);
  search.href = `#/search?q=${encodeURIComponent(entry.label.replace(/[()@]/g, '').split(/\s/)[0])}`;
  body.append(search);

  drawer.replaceChildren(head, crumbs, body);
  backBtn.focus({ preventScroll: true });
}

function paragraph(text) {
  const p = el('p');
  text.split(/`([^`]+)`/g).forEach((part, i) => {
    if (i % 2) {
      const c = el('code');
      c.append(annotate(part));
      p.append(c);
    } else p.append(part);
  });
  return p;
}

// ── Global listeners (installed once) ───────────────────
let installed = false;
export function installExplainer() {
  if (installed) return;
  installed = true;
  document.addEventListener('mouseover', (e) => {
    const t = e.target.closest?.('.xterm');
    if (t) showTooltip(t);
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest?.('.xterm')) hideTooltip();
  });
  document.addEventListener('focusin', (e) => {
    if (e.target.classList?.contains('xterm')) showTooltip(e.target);
  });
  document.addEventListener('focusout', hideTooltip);
  document.addEventListener('click', (e) => {
    const t = e.target.closest?.('.xterm');
    if (!t) return;
    e.preventDefault();
    hideTooltip();
    // A click from the page starts a new trail; a click inside the drawer goes deeper.
    openTerm(t.dataset.term, { reset: !t.closest('.xdrawer') });
  });
  document.addEventListener('keydown', (e) => {
    if (e.target.classList?.contains('xterm') && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openTerm(e.target.dataset.term, { reset: !e.target.closest('.xdrawer') });
    }
    if (drawer && !drawer.hidden) {
      if (e.key === 'Escape') closeDrawer();
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        back();
      }
    }
  });
  window.addEventListener('hashchange', hideTooltip);
}
