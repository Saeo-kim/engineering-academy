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
      '커리큘럼',
      '위에서부터 순서대로. 각 기록에서 "Explain it back"으로 설명해 보고 3/5(Explained)가 되면 다음으로 넘어가세요. 코드 안의 단어는 마우스를 올리면 설명, 클릭하면 더 깊이 들어갑니다.',
      h('a', { class: 'button', href: '#/explain' }, '코드 해부실'),
    ),
    next &&
      h(
        'a',
        { class: 'notice next-step', href: recordHref(next.kind, next.id) },
        h('span', null, h('strong', null, '지금 할 것: '), next.title),
        h('span', null, '열기 →'),
      ),
    tracks.map((track) =>
      h(
        'section',
        { class: 'panel track', dataset: { track: track.id } },
        h('div', { class: 'panel-head' }, h('h2', null, track.title), h('span', { class: 'panel-note' }, `${track.items.filter((i) => i.stage >= 3).length} / ${track.items.length} 설명 가능`)),
        h('p', { class: 'track-intro' }, track.intro),
        h(
          'ol',
          { class: 'track-list' },
          track.items.map((item) =>
            h('li', null, h('a', { class: 'feed-row', href: recordHref(item.kind, item.id) }, kindBadge(item.kind), h('span', { class: 'feed-title' }, item.title), stageBadge(item.stage))),
          ),
          track.items.length === 0 && h('li', { class: 'not-written' }, '이 트랙의 기록이 삭제되었습니다.'),
        ),
      ),
    ),
  );
}
