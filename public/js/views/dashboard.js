import { api } from '../api.js';
import { categoryLabel, emptyState, kindBadge, pageHeader, recordHref, sampleBadge } from '../components.js';
import { confirmDialog, formatDate, h, timeAgo, toast } from '../dom.js';

const WEEKS = 26;
const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function statCard(label, value, detail, href) {
  return h(
    'a',
    { class: 'stat', href, dataset: { stat: label } },
    h('span', { class: 'stat-label' }, label),
    h('span', { class: 'stat-value' }, value),
    h('span', { class: 'stat-detail' }, detail),
  );
}

const level = (n) => (n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n <= 4 ? 3 : 4);

function showTooltip(cell, day, entry) {
  const tip = document.getElementById('chart-tooltip');
  tip.replaceChildren(
    h('strong', null, formatDate(day)),
    h('span', null, entry ? `${entry.total} ${entry.total === 1 ? 'event' : 'events'}` : 'No activity'),
    entry && h('small', null, `${entry.created} captured · ${entry.updated} edited · ${entry.studied} studied`),
  );
  tip.hidden = false;
  const box = cell.getBoundingClientRect();
  const left = Math.min(window.innerWidth - tip.offsetWidth - 8, Math.max(8, box.left + box.width / 2 - tip.offsetWidth / 2));
  tip.style.left = `${left}px`;
  tip.style.top = `${Math.max(8, box.top - tip.offsetHeight - 8)}px`;
}

const hideTooltip = () => {
  document.getElementById('chart-tooltip').hidden = true;
};

function currentStreak(byDay) {
  const cursor = new Date();
  if (!byDay.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1); // today can still be earned
  let streak = 0;
  while (byDay.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function activityChart(activity, hasSamples) {
  const byDay = new Map(activity.map((a) => [a.day, a]));
  const end = new Date();
  // Weeks start on Monday; the last column holds the current week.
  const mondayOffset = (end.getDay() + 6) % 7;
  const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - mondayOffset - (WEEKS - 1) * 7);

  const cells = [];
  const months = [];
  let lastMonth = -1;
  for (let i = 0; i < WEEKS * 7; i += 1) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const key = dayKey(date);
    if (i % 7 === 0) {
      const week = i / 7;
      const showMonth = date.getMonth() !== lastMonth;
      months.push(
        h(
          'span',
          { style: { gridColumn: `${week + 1}` } },
          showMonth && week < WEEKS - 1 ? date.toLocaleDateString('en-US', { month: 'short' }) : '',
        ),
      );
      lastMonth = date.getMonth();
    }
    if (date > end) {
      cells.push(h('span', { class: 'cell future', 'aria-hidden': 'true' }));
      continue;
    }
    const entry = byDay.get(key);
    cells.push(
      h('span', {
        class: `cell l${level(entry?.total ?? 0)}`,
        tabIndex: 0,
        role: 'img',
        'aria-label': `${formatDate(key)}: ${entry?.total ?? 0} events`,
        onmouseenter: (e) => showTooltip(e.target, key, entry),
        onmouseleave: hideTooltip,
        onfocus: (e) => showTooltip(e.target, key, entry),
        onblur: hideTooltip,
      }),
    );
  }

  const total = activity.reduce((sum, a) => sum + a.total, 0);
  const streak = currentStreak(byDay);
  const activeDays = [...activity].reverse();

  // On narrow screens the chart scrolls; start at the most recent weeks.
  const scroller = h(
    'div',
    { class: 'heatmap-scroll' },
    h(
      'div',
      { class: 'heatmap-frame' },
      h('div', { class: 'heatmap-days', 'aria-hidden': 'true' }, h('span', null, 'Mon'), h('span'), h('span', null, 'Wed'), h('span'), h('span', null, 'Fri'), h('span'), h('span')),
      h('div', null, h('div', { class: 'heatmap-months', 'aria-hidden': 'true' }, months), h('div', { class: 'heatmap', id: 'heatmap' }, cells)),
    ),
  );
  requestAnimationFrame(() => {
    scroller.scrollLeft = scroller.scrollWidth;
  });

  return h(
    'section',
    { class: 'panel activity' },
    h(
      'div',
      { class: 'panel-head' },
      h('h2', null, 'Learning activity'),
      hasSamples && h('span', { class: 'panel-note' }, 'Includes example activity'),
    ),
    h(
      'div',
      { class: 'activity-summary' },
      h('div', null, h('strong', null, activity.length), h('span', null, 'active days')),
      h('div', null, h('strong', null, total), h('span', null, 'events')),
      h('div', null, h('strong', null, streak), h('span', null, 'day streak')),
    ),
    scroller,
    h(
      'div',
      { class: 'heatmap-legend' },
      h('span', null, 'Less'),
      [0, 1, 2, 3, 4].map((l) => h('span', { class: `cell l${l}`, 'aria-hidden': 'true' })),
      h('span', null, 'More'),
    ),
    activeDays.length > 0 &&
      h(
        'details',
        { class: 'data-table' },
        h('summary', null, 'View as table'),
        h(
          'div',
          { class: 'table-scroll' },
          h(
            'table',
            null,
            h('thead', null, h('tr', null, ['Date', 'Captured', 'Edited', 'Studied', 'Total'].map((t) => h('th', { scope: 'col' }, t)))),
            h(
              'tbody',
              null,
              activeDays.map((a) => h('tr', null, h('td', null, formatDate(a.day)), h('td', null, a.created), h('td', null, a.updated), h('td', null, a.studied), h('td', null, a.total))),
            ),
          ),
        ),
      ),
  );
}

function recordRow(row, meta) {
  return h(
    'li',
    null,
    h(
      'a',
      { class: 'feed-row', href: recordHref(row.kind, row.id) },
      kindBadge(row.kind),
      h('span', { class: 'feed-title' }, row.title),
      sampleBadge(row),
      h('span', { class: 'feed-meta' }, meta),
    ),
  );
}

export async function dashboardView({ rerender }) {
  const data = await api.dashboard();
  const { totals } = data;
  const isBlank = totals.knowledge + totals.errors + totals.commands === 0;

  const removeSamples = async () => {
    const ok = await confirmDialog({
      title: 'Remove all example records?',
      body: `This permanently deletes ${totals.samples} records labelled EXAMPLE, including any edits you made to them. Your own records are not affected.`,
      confirmLabel: 'Remove examples',
      danger: true,
    });
    if (!ok) return;
    const { removed } = await api.removeSamples();
    toast(`Removed ${removed} example records.`);
    rerender();
  };

  return h(
    'div',
    { class: 'page' },
    pageHeader('Dashboard', new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })),
    totals.samples > 0 &&
      h(
        'div',
        { class: 'notice' },
        h('p', null, h('strong', null, `${totals.samples} example records loaded.`), ' Each one is labelled EXAMPLE so you can tell it from your own work.'),
        h('button', { type: 'button', class: 'button small', id: 'remove-samples', onclick: removeSamples }, 'Remove examples'),
      ),
    h(
      'div',
      { class: 'stats' },
      statCard('Knowledge entries', totals.knowledge, 'in the library', '#/knowledge'),
      statCard('Recorded errors', totals.errors, `${totals.unresolved} open`, '#/errors'),
      statCard('Saved commands', totals.commands, 'ready to reuse', '#/commands'),
      statCard('Studied this week', totals.studiedThisWeek, 'in the last 7 days', '#/knowledge'),
    ),
    isBlank
      ? h(
          'section',
          { class: 'panel' },
          emptyState('Nothing captured yet', 'Save your first command, error, or explanation and it will appear here.', h('a', { class: 'button primary', href: '#/capture' }, 'Capture something')),
        )
      : h(
          'div',
          { class: 'dash-grid' },
          activityChart(data.activity, totals.samples > 0),
          h(
            'section',
            { class: 'panel studied' },
            h('div', { class: 'panel-head' }, h('h2', null, 'Recently studied')),
            data.recentlyStudied.length
              ? h('ul', { class: 'feed', id: 'recently-studied' }, data.recentlyStudied.map((r) => recordRow(r, `${timeAgo(r.last_studied_at)} · ${r.study_count}×`)))
              : emptyState('Nothing studied yet', 'Open any record and choose Mark studied after you review it.'),
          ),
          h(
            'section',
            { class: 'panel captures' },
            h('div', { class: 'panel-head' }, h('h2', null, 'Recent captures')),
            h('ul', { class: 'feed', id: 'recent-captures' }, data.recentCaptures.map((r) => recordRow(r, [categoryLabel(r.category), ` · ${timeAgo(r.created_at)}`]))),
          ),
        ),
  );
}
