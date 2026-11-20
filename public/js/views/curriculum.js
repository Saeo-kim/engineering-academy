import { api } from '../api.js';
import { kindBadge, pageHeader, recordHref, stageBadge } from '../components.js';
import { h } from '../dom.js';

export async function curriculumView() {
  const tracks = await api.curriculum();
  const all = tracks.flatMap((t) => t.items);
  const next = all.find((i) => i.stage < 3);

  return h(
    'div',
    { class: 'page narrow', id: 'curriculum' },
    pageHeader(
      'Curriculum',
      'Work from top to bottom. In each record, use "Explain it back"; when it reaches 3/5 (Explained), move on. Hover a word in the code for an explanation; click it to go deeper.',
      h('a', { class: 'button', href: '#/explain' }, 'Code Explainer'),
    ),
    next &&
      h(
        'a',
        { class: 'notice next-step', href: recordHref(next.kind, next.id) },
        h('span', null, h('strong', null, 'Do now: '), next.title),
        h('span', null, 'Open →'),
      ),
    tracks.map((track) =>
      h(
        'section',
        { class: 'panel track', dataset: { track: track.id } },
        h('div', { class: 'panel-head' }, h('h2', null, track.title), h('span', { class: 'panel-note' }, `${track.items.filter((i) => i.stage >= 3).length} / ${track.items.length} explainable`)),
        h('p', { class: 'track-intro' }, track.intro),
        h(
          'ol',
          { class: 'track-list' },
          track.items.map((item) =>
            h('li', null, h('a', { class: 'feed-row', href: recordHref(item.kind, item.id) }, kindBadge(item.kind), h('span', { class: 'feed-title' }, item.title), stageBadge(item.stage))),
          ),
          track.items.length === 0 && h('li', { class: 'not-written' }, 'The records in this track have been deleted.'),
        ),
      ),
    ),
  );
}
