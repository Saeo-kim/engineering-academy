import { api } from '../api.js';
import { emptyState, kindBadge, pageHeader, practiceHref, recordHref, sampleBadge } from '../components.js';
import { h, timeAgo } from '../dom.js';
import { KIND_UI, MODE_LABELS, RATING_LABELS } from '../schema.js';

function funnel(stages, total) {
  return h(
    'section',
    { class: 'panel' },
    h('div', { class: 'panel-head' }, h('h2', null, 'Learning loop'), h('span', { class: 'panel-note' }, 'records that reached each stage')),
    h(
      'ol',
      { class: 'bars funnel', id: 'funnel' },
      stages.map((s) =>
        h(
          'li',
          { dataset: { stage: s.key } },
          h('span', { class: 'bar-label' }, s.label),
          h('span', { class: 'bar-track' }, h('span', { class: 'bar-fill', style: { width: `${total ? (s.count / total) * 100 : 0}%` } })),
          h('span', { class: 'bar-value' }, `${s.count}`),
        ),
      ),
    ),
  );
}

function modeTile(label, stat, note) {
  return h(
    'div',
    { class: 'stat static' },
    h('span', { class: 'stat-label' }, label),
    h('span', { class: 'stat-value' }, stat?.count ?? 0),
    h('span', { class: 'stat-detail' }, stat?.count ? note(stat) : 'none yet'),
  );
}

function weekly(weeks) {
  const max = Math.max(1, ...weeks.map((w) => w.scored + w.reviews));
  return h(
    'section',
    { class: 'panel' },
    h('div', { class: 'panel-head' }, h('h2', null, 'Practice per week'), h('span', { class: 'panel-note' }, 'last 8 weeks')),
    h(
      'div',
      { class: 'columns', id: 'weekly', role: 'img', 'aria-label': weeks.map((w) => `${new Date(w.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${w.scored} scored, ${w.reviews} reviews`).join('; ') },
      weeks.map((w) =>
        h(
          'div',
          { class: 'column', title: `${w.scored} scored attempts${w.avg !== null ? ` (avg ${w.avg})` : ''}, ${w.reviews} reviews` },
          h('div', { class: 'column-stack' }, h('span', { class: 'col-review', style: { height: `${(w.reviews / max) * 100}%` } }), h('span', { class: 'col-scored', style: { height: `${(w.scored / max) * 100}%` } })),
          h('span', { class: 'column-label' }, new Date(w.week).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })),
        ),
      ),
    ),
    h('div', { class: 'map-legend' }, h('span', { class: 'legend-item' }, h('span', { class: 'legend-swatch scored' }), 'Explain, rebuild & assessment'), h('span', { class: 'legend-item' }, h('span', { class: 'legend-swatch review' }), 'Reviews')),
  );
}

export async function progressView() {
  const p = await api.progress();
  if (!p.total) {
    return h('div', { class: 'page' }, pageHeader('Progress', 'How far your knowledge has moved through the learning loop.'), h('section', { class: 'panel' }, emptyState('No records yet', 'Progress appears once you capture and study something.', h('a', { class: 'button primary', href: '#/capture' }, 'Capture something'))));
  }
  const verified = p.stages.at(-1).count;
  return h(
    'div',
    { class: 'page' },
    pageHeader('Progress', 'How far your knowledge has moved through the learning loop: captured, understood, explained, reproduced, verified.'),
    h(
      'div',
      { class: 'stats' },
      h('div', { class: 'stat static', id: 'stat-verified' }, h('span', { class: 'stat-label' }, 'Verified'), h('span', { class: 'stat-value' }, `${Math.round((verified / p.total) * 100)}%`), h('span', { class: 'stat-detail' }, `${verified} of ${p.total} records`)),
      modeTile('Explain-backs', p.modes.explain, (s) => `avg ${s.avg} · ${s.passRate}% passed`),
      modeTile('Rebuilds', p.modes.rebuild, (s) => `avg ${s.avg} · ${s.passRate}% passed`),
      modeTile('Assessment answers', p.modes.quiz, (s) => `${s.passRate}% correct`),
    ),
    h(
      'div',
      { class: 'dash-grid progress-grid' },
      funnel(p.stages, p.total),
      h(
        'section',
        { class: 'panel focus-panel' },
        h('div', { class: 'panel-head' }, h('h2', null, 'Work on next')),
        p.focus.length
          ? h(
              'ul',
              { class: 'feed', id: 'focus' },
              p.focus.map((f) => {
                const href = f.next === 'Understood' ? `${recordHref(f.kind, f.id)}/edit` : f.next === 'Explained' ? practiceHref(f.kind, f.id, 'explain') : f.next === 'Reproduced' ? practiceHref(f.kind, f.id, 'rebuild') : f.next === 'Verified' ? '#/quiz' : recordHref(f.kind, f.id);
                return h('li', null, h('a', { class: 'feed-row', href, title: f.hint }, kindBadge(f.kind), h('span', { class: 'feed-title' }, f.title), sampleBadge(f), h('span', { class: 'feed-meta' }, `Next: ${f.next}`)));
              }),
            )
          : emptyState('Everything is verified', 'Capture something new to keep learning.'),
      ),
      h(
        'section',
        { class: 'panel' },
        h('div', { class: 'panel-head' }, h('h2', null, 'Mastery by category')),
        h(
          'div',
          { class: 'table-scroll tall' },
          h(
            'table',
            { id: 'category-table' },
            h('thead', null, h('tr', null, ['Category', 'Records', 'Verified', 'Mastery'].map((t) => h('th', { scope: 'col' }, t)))),
            h(
              'tbody',
              null,
              p.byCategory.map((c) =>
                h('tr', null, h('td', null, c.category), h('td', null, c.total), h('td', null, c.verified), h('td', null, h('span', { class: 'meter' }, h('span', { class: 'meter-track' }, h('span', { class: 'meter-fill', style: { width: `${c.mastery}%` } })), h('span', { class: 'meter-label' }, `${c.mastery}%`)))),
              ),
            ),
          ),
        ),
      ),
      weekly(p.weeks),
      h(
        'section',
        { class: 'panel' },
        h('div', { class: 'panel-head' }, h('h2', null, 'By type')),
        h('ul', { class: 'feed' }, Object.entries(p.byKind).map(([kind, v]) => h('li', null, h('a', { class: 'feed-row', href: `#/${kind}` }, kindBadge(kind), h('span', { class: 'feed-title' }, KIND_UI[kind].heading), h('span', { class: 'feed-meta' }, `${v.verified}/${v.total} verified`))))),
      ),
      h(
        'section',
        { class: 'panel' },
        h('div', { class: 'panel-head' }, h('h2', null, 'Recent practice'), h('span', { class: 'panel-note' }, `${p.review.due} reviews due`)),
        p.recent.length
          ? h(
              'ul',
              { class: 'feed', id: 'recent-attempts' },
              p.recent.map((a) =>
                h(
                  'li',
                  null,
                  h(
                    'a',
                    { class: 'feed-row', href: recordHref(a.kind, a.item_id) },
                    h('span', { class: 'badge' }, MODE_LABELS[a.mode]),
                    h('span', { class: 'feed-title' }, a.title),
                    h('span', { class: 'feed-meta' }, [a.score !== null ? `${a.score}/100` : null, a.rating ? RATING_LABELS[a.rating] : null, timeAgo(a.created_at)].filter(Boolean).join(' · ')),
                  ),
                ),
              ),
            )
          : emptyState('No practice yet', 'Open a record and try an explain-back exercise.'),
      ),
    ),
  );
}
