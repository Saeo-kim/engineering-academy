import { confirmDialog, debounce, h, icon, replaceChildren } from './dom.js';
import { captureView } from './views/capture.js';
import { dashboardView } from './views/dashboard.js';
import { detailView } from './views/detail.js';
import { formView } from './views/form.js';
import { listView } from './views/list.js';
import { searchView } from './views/search.js';

const NAV = [
  { group: 'Workspace' },
  { href: '#/', label: 'Dashboard', icon: 'dashboard', match: '' },
  { href: '#/capture', label: 'Quick Capture', icon: 'capture', match: 'capture' },
  { group: 'Archive' },
  { href: '#/knowledge', label: 'Knowledge Library', icon: 'library', match: 'knowledge' },
  { href: '#/errors', label: 'Error Archive', icon: 'errors', match: 'errors' },
  { href: '#/commands', label: 'Command Library', icon: 'commands', match: 'commands' },
  { group: 'Find' },
  { href: '#/search', label: 'Search', icon: 'search', match: 'search' },
];

const routes = [
  [/^$/, dashboardView],
  [/^capture$/, captureView],
  [/^search$/, searchView],
];
for (const kind of ['knowledge', 'commands', 'errors']) {
  routes.push(
    [new RegExp(`^${kind}$`), listView(kind)],
    [new RegExp(`^${kind}/new$`), formView(kind)],
    [new RegExp(`^${kind}/(?<id>\\d+)$`), detailView(kind)],
    [new RegExp(`^${kind}/(?<id>\\d+)/edit$`), formView(kind)],
  );
}

const view = document.getElementById('view');
const nav = document.getElementById('nav');
const searchInput = document.getElementById('global-search');

let dirty = false;
let renderToken = 0;
let currentHash = location.hash;
let revertingHash = false;

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs] = raw.split('?');
  return { path: path.replace(/\/$/, ''), query: new URLSearchParams(qs ?? '') };
}

function renderNav(path) {
  const section = path.split('/')[0];
  replaceChildren(
    nav,
    NAV.map((item) =>
      item.group
        ? h('p', { class: 'nav-group' }, item.group)
        : h('a', { class: `nav-link${item.match === section ? ' active' : ''}`, href: item.href, 'aria-current': item.match === section ? 'page' : undefined }, icon(item.icon), h('span', null, item.label)),
    ),
  );
}

function errorPanel(err) {
  const missing = err.status === 404;
  return h(
    'div',
    { class: 'page narrow' },
    h(
      'section',
      { class: 'panel empty' },
      h('h3', null, missing ? 'That record no longer exists' : 'Could not load this page'),
      h('p', null, missing ? 'It may have been deleted.' : err.message),
      missing ? h('a', { class: 'button', href: '#/' }, 'Back to Dashboard') : h('button', { type: 'button', class: 'button', onclick: render }, 'Try again'),
    ),
  );
}

async function render() {
  const token = (renderToken += 1);
  const { path, query } = parseHash();
  renderNav(path);
  document.getElementById('chart-tooltip').hidden = true;
  dirty = false;
  currentHash = location.hash;
  if (path !== 'search') searchInput.value = '';
  else if (document.activeElement !== searchInput) searchInput.value = query.get('q') ?? '';

  let node;
  try {
    let matched = null;
    for (const [pattern, factory] of routes) {
      const match = pattern.exec(path);
      if (match) {
        matched = await factory({
          params: match.groups ?? {},
          query,
          rerender: render,
          setDirty: (value) => {
            dirty = value;
          },
        });
        break;
      }
    }
    node = matched ?? errorPanel({ status: 404 });
  } catch (err) {
    node = errorPanel(err);
  }
  if (token !== renderToken) return; // the user has already navigated elsewhere
  view.replaceChildren(node);
  view.dataset.ready = String(token);
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', async () => {
  if (revertingHash) {
    revertingHash = false;
    return;
  }
  if (dirty) {
    const target = location.hash;
    revertingHash = true;
    location.hash = currentHash;
    const leave = await confirmDialog({ title: 'Discard unsaved changes?', body: 'What you typed on this page has not been saved.', confirmLabel: 'Discard', danger: true });
    if (!leave) return;
    dirty = false;
    location.hash = target;
    return;
  }
  render();
});

window.addEventListener('beforeunload', (e) => {
  if (dirty) e.preventDefault();
});

const runSearch = debounce(() => {
  const q = searchInput.value.trim();
  const target = q ? `#/search?q=${encodeURIComponent(q)}` : '#/search';
  if (location.hash === target) return;
  if (parseHash().path === 'search') {
    history.replaceState(null, '', target);
    render();
  } else {
    location.hash = target;
  }
}, 180);

searchInput.addEventListener('input', runSearch);
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') runSearch();
});

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
});

render();
