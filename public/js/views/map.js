import { api } from '../api.js';
import { emptyState, kindBadge, pageHeader, recordHref, selectField, stageBadge } from '../components.js';
import { h, replaceChildren, toast } from '../dom.js';
import { KIND_UI } from '../schema.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
function s(tag, attrs = {}, ...children) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) el.setAttribute(k, v);
  for (const c of children.flat()) if (c) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return el;
}

// Deterministic layout: one cluster per category, laid out on a grid, with
// records on a sunflower spiral inside each cluster (most-linked at the centre).
// Most records have no links, so a force simulation would only push them to
// the walls; this keeps spacing even at any size and the same data always
// draws the same map. Links are drawn across clusters.
export function layout(nodes, edges, { width = 1000, height = 640 } = {}) {
  const degree = new Map(nodes.map((n) => [n.key, 0]));
  for (const e of edges) {
    if (degree.has(e.a)) degree.set(e.a, degree.get(e.a) + 1);
    if (degree.has(e.b)) degree.set(e.b, degree.get(e.b) + 1);
  }
  const groups = new Map();
  for (const n of nodes) groups.set(n.category, [...(groups.get(n.category) ?? []), n]);
  const ordered = [...groups.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  const cols = Math.max(1, Math.min(ordered.length, Math.round(Math.sqrt((ordered.length * width) / height))));
  const rows = Math.ceil(ordered.length / cols);
  const cellW = width / cols;
  const cellH = height / rows;
  const pos = new Map();
  const clusters = [];
  ordered.forEach(([category, members], i) => {
    const cx = cellW * ((i % cols) + 0.5);
    const cy = cellH * (Math.floor(i / cols) + 0.5) + 10;
    members.sort((a, b) => degree.get(b.key) - degree.get(a.key) || a.key.localeCompare(b.key));
    const spread = Math.min(cellW, cellH - 20) * 0.38;
    const step = spread / Math.sqrt(Math.max(1, members.length));
    members.forEach((n, j) => {
      const r = members.length === 1 ? 0 : step * Math.sqrt(j + 0.5);
      const angle = j * 2.399963; // golden angle
      pos.set(n.key, { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
    });
    clusters.push({ category, count: members.length, x: cx, y: cy - cellH / 2 + 16 });
  });
  return { pos, clusters, degree };
}

const clipLabel = (t) => (t.length > 24 ? `${t.slice(0, 23)}…` : t);

function graph(nodes, edges) {
  // The frame matches the screen, so one unit is about one pixel and labels stay legible on phones.
  const w = Math.round(Math.min(1000, Math.max(340, window.innerWidth - (window.innerWidth > 1080 ? 640 : 40))));
  const base = w < 600 ? w * 1.25 : Math.max(480, w * 0.66);
  const hgt = Math.round(Math.min(1600, Math.max(base, Math.sqrt(nodes.length) * 52)));
  const { pos, clusters, degree } = layout(nodes, edges, { width: w, height: hgt });
  const minX = 0;
  const minY = 0;


  const neighbours = new Map(nodes.map((n) => [n.key, new Set([n.key])]));
  for (const e of edges) {
    neighbours.get(e.a)?.add(e.b);
    neighbours.get(e.b)?.add(e.a);
  }
  // Labels for every record only while they fit; otherwise hubs, plus whatever is hovered.
  const showAllLabels = nodes.length <= 14;

  const svg = s('svg', { viewBox: `${minX} ${minY} ${w} ${hgt}`, class: 'map-svg', id: 'map-svg', role: 'group', 'aria-label': `Knowledge map: ${nodes.length} records, ${edges.length} links` });
  const edgeEls = edges.map((e) => {
    const a = pos.get(e.a);
    const b = pos.get(e.b);
    return s('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: 'map-edge', 'data-a': e.a, 'data-b': e.b });
  });
  const nodeEls = nodes.map((n) => {
    const p = pos.get(n.key);
    const r = 6 + Math.min(6, degree.get(n.key) * 2);
    const circumference = 2 * Math.PI * (r + 4);
    const link = s(
      'a',
      { href: recordHref(n.kind, n.id), class: `map-node kind-${n.kind}${showAllLabels || degree.get(n.key) > 1 ? ' labelled' : ''}`, 'data-key': n.key, 'aria-label': `${KIND_UI[n.kind].label}: ${n.title}, stage ${n.stage} of 5` },
      s('title', {}, `${n.title}\n${KIND_UI[n.kind].label} · ${n.category} · stage ${n.stage}/5`),
      s('circle', { cx: p.x, cy: p.y, r: r + 4, class: 'stage-track' }),
      s('circle', { cx: p.x, cy: p.y, r: r + 4, class: 'stage-ring', 'stroke-dasharray': `${(n.stage / 5) * circumference} ${circumference}`, transform: `rotate(-90 ${p.x} ${p.y})` }),
      s('circle', { cx: p.x, cy: p.y, r, class: 'node-dot' }),
      s('text', { x: p.x, y: p.y + r + 18, 'text-anchor': 'middle' }, clipLabel(n.title)),
    );
    const focus = (on) => {
      svg.classList.toggle('focusing', on);
      const near = neighbours.get(n.key);
      nodeEls.forEach((el) => el.classList.toggle('lit', on && near.has(el.dataset.key)));
      edgeEls.forEach((el) => el.classList.toggle('lit', on && (el.dataset.a === n.key || el.dataset.b === n.key)));
    };
    link.addEventListener('mouseenter', () => focus(true));
    link.addEventListener('mouseleave', () => focus(false));
    link.addEventListener('focus', () => focus(true));
    link.addEventListener('blur', () => focus(false));
    return link;
  });
  const clusterEls = clusters.map((c) => s('text', { x: c.x, y: c.y, 'text-anchor': 'middle', class: 'map-cluster' }, `${c.category} · ${c.count}`));
  svg.append(s('g', {}, clusterEls), s('g', {}, edgeEls), s('g', {}, nodeEls));
  return svg;
}

export async function mapView({ rerender }) {
  const data = await api.map();
  const filters = { category: '', kind: '', linkedOnly: false };
  const canvas = h('div', { class: 'map-canvas', id: 'map-canvas' });
  const listing = h('div', { id: 'map-list' });
  const count = h('p', { class: 'result-count', id: 'map-count' });

  function draw() {
    let nodes = data.nodes.filter((n) => (!filters.category || n.category === filters.category) && (!filters.kind || n.kind === filters.kind));
    const keys = new Set(nodes.map((n) => n.key));
    const edges = data.edges.filter((e) => keys.has(e.a) && keys.has(e.b));
    if (filters.linkedOnly) {
      const linked = new Set(edges.flatMap((e) => [e.a, e.b]));
      nodes = nodes.filter((n) => linked.has(n.key));
    }
    count.textContent = `${nodes.length} records · ${edges.length} links`;
    replaceChildren(canvas, nodes.length ? graph(nodes, edges) : emptyState('Nothing to map', 'No records match these filters.'));

    const byKey = new Map(data.nodes.map((n) => [n.key, n]));
    replaceChildren(
      listing,
      h(
        'ul',
        { class: 'feed' },
        nodes.map((n) => {
          const links = edges.filter((e) => e.a === n.key || e.b === n.key).map((e) => byKey.get(e.a === n.key ? e.b : e.a));
          return h(
            'li',
            null,
            h('a', { class: 'feed-row', href: recordHref(n.kind, n.id) }, kindBadge(n.kind), h('span', { class: 'feed-title' }, n.title), stageBadge(n.stage), h('span', { class: 'feed-meta' }, `${links.length} ${links.length === 1 ? 'link' : 'links'}`)),
          );
        }),
      ),
    );
  }

  const suggestions = data.suggestions.length
    ? h(
        'ul',
        { class: 'feed', id: 'suggestions' },
        data.suggestions.map((sg) =>
          h(
            'li',
            { class: 'suggestion' },
            h('div', { class: 'suggestion-pair' }, h('a', { href: recordHref(sg.a.kind, sg.a.id) }, kindBadge(sg.a.kind), ' ', sg.a.title), h('span', { class: 'hint' }, '↔'), h('a', { href: recordHref(sg.b.kind, sg.b.id) }, kindBadge(sg.b.kind), ' ', sg.b.title)),
            h('span', { class: 'hint' }, `shared: ${sg.tags.join(', ')}`),
            h(
              'button',
              {
                type: 'button',
                class: 'button small',
                onclick: async (e) => {
                  e.target.disabled = true;
                  try {
                    await api.link({ kind: sg.a.kind, id: sg.a.id }, { kind: sg.b.kind, id: sg.b.id });
                    toast('Linked.');
                    rerender();
                  } catch (err) {
                    toast(err.message, 'error');
                    e.target.disabled = false;
                  }
                },
              },
              'Link',
            ),
          ),
        ),
      )
    : emptyState('No suggestions', 'Records that share a tag but are not linked will appear here.');

  const kinds = [['', 'All types'], ...Object.keys(KIND_UI).map((k) => [k, KIND_UI[k].heading])];
  const categories = [['', 'All categories'], ...[...new Set(data.nodes.map((n) => n.category))].sort().map((c) => [c, c])];

  if (!data.nodes.length) {
    return h('div', { class: 'page' }, pageHeader('Knowledge Map', 'How your records connect.'), h('section', { class: 'panel' }, emptyState('Nothing to map yet', 'Capture a few records and link related ones together.', h('a', { class: 'button primary', href: '#/capture' }, 'Capture something'))));
  }

  draw();
  return h(
    'div',
    { class: 'page' },
    pageHeader('Knowledge Map', 'Every record, grouped by category, with the links between them. The ring around each record shows how far it is through the learning loop. Hover a record to highlight its connections.'),
    h(
      'div',
      { class: 'filters' },
      selectField('Type', '', kinds, (v) => ((filters.kind = v), draw())),
      selectField('Category', '', categories, (v) => ((filters.category = v), draw())),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', id: 'linked-only', onchange: (e) => ((filters.linkedOnly = e.target.checked), draw()) }), h('span', null, 'Linked records only')),
    ),
    count,
    h(
      'div',
      { class: 'map-grid' },
      h(
        'section',
        { class: 'panel map-panel' },
        canvas,
        h(
          'div',
          { class: 'map-legend' },
          Object.keys(KIND_UI).map((k) => h('span', { class: `legend-item kind-${k}` }, h('span', { class: 'legend-dot' }), KIND_UI[k].heading)),
          h('span', { class: 'legend-item' }, h('span', { class: 'legend-ring' }), 'Ring = learning stage'),
        ),
        h('details', { class: 'data-table' }, h('summary', null, 'View as list'), listing),
      ),
      h('section', { class: 'panel' }, h('div', { class: 'panel-head' }, h('h2', null, 'Suggested connections')), suggestions),
    ),
  );
}
