import { api } from './api.js';
import { confirmDialog, debounce, h, icon, replaceChildren } from './dom.js';
import { clearPrivateCaches, initPwa, isUpdateReady } from './pwa.js';
import { captureView } from './views/capture.js';
import { courseView, coursesView, lessonView } from './views/courses.js';
import { dashboardView } from './views/dashboard.js';
import { detailView } from './views/detail.js';
import { formView } from './views/form.js';
import { installView } from './views/install.js';
import { listView } from './views/list.js';
import { loginView } from './views/login.js';
import { mapView } from './views/map.js';
import { practiceView } from './views/practice.js';
import { progressView } from './views/progress.js';
import { quizHomeView, quizView } from './views/quiz.js';
import { reviewView } from './views/review.js';
import { searchView } from './views/search.js';

const NAV = [
  { group: 'Workspace' },
  { href: '#/', label: 'Dashboard', icon: 'dashboard', match: '' },
  { href: '#/capture', label: 'Quick Capture', icon: 'capture', match: 'capture' },
  { group: 'Archive' },
  { href: '#/knowledge', label: 'Knowledge Library', icon: 'library', match: 'knowledge' },
  { href: '#/errors', label: 'Error Archive', icon: 'errors', match: 'errors' },
  { href: '#/commands', label: 'Command Library', icon: 'commands', match: 'commands' },
  { href: '#/workflows', label: 'Workflows', icon: 'workflows', match: 'workflows' },
  { group: 'Learn' },
  { href: '#/courses', label: 'Courses', icon: 'courses', match: 'courses' },
  { href: '#/review', label: 'Review Center', icon: 'review', match: 'review' },
  { href: '#/quiz', label: 'Assessment', icon: 'quiz', match: 'quiz' },
  { href: '#/map', label: 'Knowledge Map', icon: 'map', match: 'map' },
  { href: '#/progress', label: 'Progress', icon: 'progress', match: 'progress' },
  { group: 'Find' },
  { href: '#/search', label: 'Search', icon: 'search', match: 'search' },
  { group: 'App' },
  { href: '#/install', label: 'Install App', icon: 'install', match: 'install' },
];

// Bottom tab bar on phones: the screens you reach for most, one thumb away.
const TABS = [
  { href: '#/', label: 'Home', icon: 'home', match: '' },
  { href: '#/courses', label: 'Courses', icon: 'courses', match: 'courses' },
  { href: '#/capture', label: 'Capture', icon: 'capture', match: 'capture', primary: true },
  { href: '#/review', label: 'Review', icon: 'review', match: 'review' },
  { href: '#/progress', label: 'Progress', icon: 'progress', match: 'progress' },
];

const routes = [
  [/^$/, dashboardView],
  [/^capture$/, captureView],
  [/^search$/, searchView],
  [/^review$/, reviewView],
  [/^quiz$/, quizHomeView],
  [/^quiz\/(?<id>\d+)$/, quizView],
  [/^map$/, mapView],
  [/^progress$/, progressView],
  [/^courses$/, coursesView],
  [/^courses\/(?<track>[a-z0-9-]+)$/, courseView],
  [/^courses\/(?<track>[a-z0-9-]+)\/(?<lesson>[a-z0-9-]+)$/, lessonView],
  [/^install$/, installView],
  [/^practice\/(?<kind>[a-z]+)\/(?<id>\d+)\/(?<mode>explain|rebuild)$/, practiceView],
];
for (const kind of ['knowledge', 'commands', 'errors', 'workflows']) {
  routes.push(
    [new RegExp(`^${kind}$`), listView(kind)],
    [new RegExp(`^${kind}/new$`), formView(kind)],
    [new RegExp(`^${kind}/(?<id>\\d+)$`), detailView(kind)],
    [new RegExp(`^${kind}/(?<id>\\d+)/edit$`), formView(kind)],
  );
}

const view = document.getElementById('view');
const nav = document.getElementById('nav');
const tabbar = document.getElementById('tabbar');
const shellEl = document.querySelector('.shell');
const menuToggle = document.getElementById('menu-toggle');
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
  replaceChildren(
    tabbar,
    TABS.map((tab) =>
      h(
        'a',
        { class: `tab-link${tab.match === section ? ' active' : ''}${tab.primary ? ' primary' : ''}`, href: tab.href, 'aria-current': tab.match === section ? 'page' : undefined },
        icon(tab.icon),
        h('span', null, tab.label),
      ),
    ),
  );
}

function setMenu(open) {
  shellEl.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  replaceChildren(menuToggle, icon(open ? 'close' : 'menu'), h('span', null, open ? 'Close' : 'Menu'));
}
menuToggle.addEventListener('click', () => setMenu(!shellEl.classList.contains('menu-open')));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && shellEl.classList.contains('menu-open')) setMenu(false);
});
setMenu(false);

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
  setMenu(false);
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
  // A new version of the app is installed: load it now, between pages.
  if (isUpdateReady()) {
    location.reload();
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

// Password-protected deployments: show the sign-in screen instead of the app.
const shell = document.querySelector('.shell');
const loginRoot = document.getElementById('login-root');
let signedIn = true;

function showLogin() {
  if (!signedIn && !loginRoot.hidden) return;
  signedIn = false;
  dirty = false;
  shell.hidden = true;
  loginRoot.hidden = false;
  replaceChildren(
    loginRoot,
    loginView(() => {
      signedIn = true;
      loginRoot.hidden = true;
      loginRoot.replaceChildren();
      shell.hidden = false;
      render();
    }),
  );
}

function enableSignOut() {
  const foot = document.querySelector('.sidebar-foot');
  replaceChildren(
    foot,
    h('span', null, 'Password protected'),
    h(
      'button',
      {
        type: 'button',
        class: 'link-button',
        id: 'sign-out',
        onclick: async () => {
          await api.logout().catch(() => {});
          await clearPrivateCaches();
          showLogin();
        },
      },
      icon('logout'),
      'Sign out',
    ),
  );
}

window.addEventListener('auth-required', showLogin);

// The session check and the first page load run in parallel: one round trip
// instead of two before anything appears. If the session has expired, the
// page's own API call answers 401 and the sign-in screen takes over.
async function boot() {
  const session = api.session().catch(() => null);
  render();
  const s = await session;
  if (s?.authRequired) enableSignOut();
  if (s?.authRequired && !s.authenticated) showLogin();
}

initPwa();
boot();
