// 코드 해부실: paste code, read it line by line, click any word to go deeper.
import { pageHeader } from '../components.js';
import { h, replaceChildren } from '../dom.js';
import { annotate, explainHistory, openTerm, readLine } from '../explain.js';
import { GLOSSARY_GROUPS, term } from '../glossary.js';

const SAMPLE = 'List<Store> stores = storeRepository.findAll();\nfor (Store store : stores) {\n    long count = store.getReviews().size();\n}';

function takeStashed() {
  try {
    const code = sessionStorage.getItem('ea-explain-code');
    sessionStorage.removeItem('ea-explain-code');
    return code;
  } catch {
    return null;
  }
}

export async function explainerView({ query }) {
  const initial = takeStashed() ?? SAMPLE;
  const output = h('div', { class: 'xlines', id: 'xlines' });

  const render = (code) => {
    const lines = code.replace(/\r/g, '').split('\n');
    replaceChildren(
      output,
      lines.map((line, i) => {
        if (!line.trim()) return null;
        const { text, sql } = readLine(line);
        return h(
          'div',
          { class: `xline${sql.length ? ' has-sql' : ''}` },
          h('span', { class: 'xline-no' }, String(i + 1)),
          h('div', { class: 'xline-main' }, h('pre', null, h('code', null, annotate(line))), text && h('p', { class: 'xline-read' }, '읽는 법: ', text), sql.length > 0 && h('p', { class: 'xline-sql' }, `🔶 이 줄에서 SQL이 나갈 수 있음: ${sql.join(', ')}`)),
        );
      }),
    );
  };

  const input = h('textarea', { id: 'explain-input', rows: 6, spellcheck: false, value: initial, 'aria-label': '해석할 코드', oninput: (e) => render(e.target.value) });
  render(initial);

  const recent = explainHistory();
  const opened = query.get('term');
  if (opened && term(opened)) queueMicrotask(() => openTerm(opened, { reset: true }));

  return h(
    'div',
    { class: 'page', id: 'explainer' },
    pageHeader('코드 해부실', '모르는 코드를 붙여 넣으세요. 단어에 마우스를 올리면 한 줄 설명, 클릭하면 자세한 설명이 오른쪽에 열립니다. 설명 안에서도 계속 클릭해 더 깊이 들어가고, "← 이전 설명"(또는 Alt + ←)으로 언제든 돌아옵니다.'),
    h(
      'div',
      { class: 'explain-grid' },
      h(
        'section',
        { class: 'panel' },
        h('div', { class: 'panel-head' }, h('h2', null, '코드 붙여넣기'), h('button', { type: 'button', class: 'link-button', onclick: () => ((input.value = SAMPLE), render(SAMPLE)) }, '예시: N+1 코드')),
        h('div', { class: 'explain-input' }, input),
        h('div', { class: 'panel-head' }, h('h2', null, '한 줄씩 해석'), h('span', { class: 'panel-note' }, '밑줄 = 설명 있음 · 주황 = SQL')),
        output,
      ),
      h(
        'aside',
        { class: 'explain-side' },
        recent.length > 0 &&
          h(
            'section',
            { class: 'panel' },
            h('div', { class: 'panel-head' }, h('h2', null, '최근 본 설명'), h('span', { class: 'panel-note' }, '여기서 다시 시작')),
            h('div', { class: 'chip-list' }, recent.slice(0, 12).map((r) => h('button', { type: 'button', class: 'chip', onclick: () => openTerm(r.id, { reset: true }) }, r.label))),
          ),
        h(
          'section',
          { class: 'panel' },
          h('div', { class: 'panel-head' }, h('h2', null, '용어 사전')),
          GLOSSARY_GROUPS.map(([group, ids]) =>
            h('div', { class: 'gloss-group' }, h('h3', null, group), h('div', { class: 'chip-list' }, ids.map(term).filter(Boolean).map((t) => h('button', { type: 'button', class: 'chip', onclick: () => openTerm(t.id, { reset: true }) }, t.label)))),
          ),
        ),
      ),
    ),
  );
}
