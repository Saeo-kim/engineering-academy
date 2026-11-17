import { api } from '../api.js';
import { categoryLabel, kindBadge, practiceHref, progressMeter, recordHref, sampleBadge, stageStepper, statusBadge } from '../components.js';

function timeAgoFuture(iso) {
  const ms = new Date(iso) - Date.now();
  if (ms <= 0) return 'is due now';
  const days = Math.round(ms / 86_400_000);
  if (days < 1) return 'later today';
  return days === 1 ? 'tomorrow' : `in ${days} days`;
}
import { codeBlock, confirmDialog, formatDate, h, replaceChildren, richText, timeAgo, toast } from '../dom.js';
import { KIND_UI } from '../schema.js';

function sectionBody(section, record) {
  const value = record[section.field] ?? '';
  if (!value.trim()) return null;
  let mode = section.mode;
  if (section.captured) mode = ['output', 'snippet'].includes(record.capture_type) ? 'code' : 'rich';
  return mode === 'code' ? codeBlock(value, { copy: section.copy, tone: section.tone }) : richText(value);
}

export function detailView(kind) {
  return async ({ params, rerender }) => {
    const ui = KIND_UI[kind];
    const id = Number(params.id);
    const [record, learning] = await Promise.all([api.get(kind, id), api.learning(kind, id)]);

    const exerciseButton = (mode, label) => {
      const ex = learning.exercises[mode];
      return ex.available
        ? h('a', { class: 'button', href: practiceHref(kind, id, mode), id: `practice-${mode}` }, label)
        : h('button', { type: 'button', class: 'button', disabled: true, title: ex.missing, id: `practice-${mode}` }, label);
    };
    const lastAttempt = learning.attempts[0];
    const learningPanel = h(
      'section',
      { class: 'panel learning-panel', id: 'learning' },
      h('div', { class: 'panel-head' }, h('h2', null, 'Learning loop'), h('span', { class: 'panel-note' }, `Stage ${learning.stage} of 5`)),
      h('div', { class: 'learning-body' }, stageStepper(learning.steps)),
      h(
        'div',
        { class: 'learning-actions' },
        exerciseButton('explain', 'Explain it back'),
        exerciseButton('rebuild', 'Rebuild challenge'),
        h('span', { class: 'hint' }, [
          learning.review ? `Next review ${timeAgoFuture(learning.review.due_at)}` : 'Not in review yet',
          lastAttempt ? ` · last practice ${timeAgo(lastAttempt.created_at)}` : '',
        ]),
      ),
      [learning.exercises.explain, learning.exercises.rebuild].some((e) => !e.available) &&
        h('p', { class: 'hint learning-locked' }, [learning.exercises.explain, learning.exercises.rebuild].filter((e) => !e.available).map((e) => e.missing).join(' ')),
    );

    const studyStatus = h('span', { class: 'study-status', id: 'study-status' });
    const showStudy = (r) => {
      studyStatus.textContent = r.last_studied_at ? `Studied ${r.study_count}× · last ${timeAgo(r.last_studied_at)}` : 'Not studied yet';
    };
    showStudy(record);

    const onStudy = async (e) => {
      e.target.disabled = true;
      try {
        showStudy(await api.study(kind, id));
        toast('Marked as studied.');
      } catch (err) {
        toast(err.message, 'error');
      } finally {
        e.target.disabled = false;
      }
    };

    const onDelete = async () => {
      const ok = await confirmDialog({
        title: `Delete this ${ui.singular}?`,
        body: `"${record.title}" will be permanently removed. This cannot be undone.`,
        confirmLabel: 'Delete',
        danger: true,
      });
      if (!ok) return;
      try {
        await api.remove(kind, id);
        toast('Deleted.');
        location.hash = `#/${kind}`;
      } catch (err) {
        toast(err.message, 'error');
        rerender();
      }
    };

    const sections = ui.sections.filter((s) => !s.captured || record[s.field]?.trim());
    const editHref = `${recordHref(kind, id)}/edit`;

    const body = h('div', { class: 'detail-sections' });
    replaceChildren(
      body,
      sections.map((section, i) => {
        const content = sectionBody(section, record);
        return h(
          'section',
          { class: 'detail-section', dataset: { field: section.field } },
          h('h2', null, ui.numbered && h('span', { class: 'step' }, String(i + 1).padStart(2, '0')), section.label),
          content ?? h('p', { class: 'not-written' }, section.prompt ?? 'Not written yet. ', ' ', h('a', { href: editHref }, 'Write it')),
        );
      }),
    );

    return h(
      'article',
      { class: 'page narrow detail', id: 'detail' },
      h('a', { class: 'back', href: `#/${kind}` }, `← ${ui.heading}`),
      h(
        'header',
        { class: 'detail-head' },
        h('div', { class: 'detail-badges' }, kindBadge(kind), kind === 'errors' && statusBadge(record), sampleBadge(record)),
        h('h1', null, record.title),
        h(
          'div',
          { class: 'detail-meta' },
          categoryLabel(record.category),
          h('span', { class: 'meta-item' }, formatDate(record.entry_date)),
          record.tags.map((t) => h('a', { class: 'tag', href: `#/${kind}?tag=${encodeURIComponent(t)}` }, t)),
        ),
        h('div', { class: 'detail-progress' }, progressMeter(kind, record), studyStatus),
        h(
          'div',
          { class: 'detail-actions' },
          h('button', { type: 'button', class: 'button primary', id: 'mark-studied', onclick: onStudy }, 'Mark studied'),
          h('a', { class: 'button', href: editHref, id: 'edit-record' }, 'Edit'),
          h('button', { type: 'button', class: 'button danger-quiet', id: 'delete-record', onclick: onDelete }, 'Delete'),
        ),
      ),
      learningPanel,
      body,
      h(
        'section',
        { class: 'detail-section', id: 'related' },
        h('h2', null, ui.relatedLabel),
        record.links.length
          ? h('ul', { class: 'feed' }, record.links.map((l) => h('li', null, h('a', { class: 'feed-row', href: recordHref(l.kind, l.id) }, kindBadge(l.kind), h('span', { class: 'feed-title' }, l.title)))))
          : h('p', { class: 'not-written' }, 'Nothing linked yet. Connecting records shows how the ideas fit together. ', h('a', { href: editHref }, 'Add a link')),
      ),
    );
  };
}
