import { api } from '../api.js';
import { contextBlock, emptyState, kindBadge, pageHeader, practiceHref, recordHref, selectField } from '../components.js';
import { confirmDialog, h, timeAgo } from '../dom.js';
import { scoreRing } from './practice.js';

const pct = (score, total) => (total ? Math.round((score / total) * 100) : 0);

function historyTable(history) {
  if (!history.length) return h('section', { class: 'panel' }, emptyState('No assessments yet', 'Your results will be listed here.'));
  return h(
    'section',
    { class: 'panel' },
    h('div', { class: 'panel-head' }, h('h2', null, 'History')),
    h(
      'div',
      { class: 'table-scroll tall' },
      h(
        'table',
        { id: 'quiz-history' },
        h('thead', null, h('tr', null, ['Taken', 'Questions', 'Score', ''].map((t) => h('th', { scope: 'col' }, t)))),
        h(
          'tbody',
          null,
          history.map((q) =>
            h(
              'tr',
              null,
              h('td', null, timeAgo(q.created_at)),
              h('td', null, q.total),
              h('td', null, q.completed_at ? `${q.score}/${q.total} (${pct(q.score, q.total)}%)` : 'Not submitted'),
              h('td', null, h('a', { href: `#/quiz/${q.id}` }, q.completed_at ? 'Review' : 'Continue')),
            ),
          ),
        ),
      ),
    ),
  );
}

export async function quizHomeView() {
  const [meta, history] = await Promise.all([api.meta(), api.quizzes()]);
  const filters = { size: '8', category: '' };
  const message = h('p', { class: 'form-error', role: 'alert', hidden: true });
  const start = h(
    'button',
    {
      type: 'submit',
      class: 'button primary',
      id: 'start-quiz',
    },
    'Start assessment',
  );
  const form = h(
    'form',
    {
      class: 'panel form',
      id: 'quiz-form',
      onsubmit: async (e) => {
        e.preventDefault();
        message.hidden = true;
        start.disabled = true;
        try {
          const quiz = await api.createQuiz({ size: Number(filters.size), category: filters.category || undefined });
          location.hash = `#/quiz/${quiz.id}`;
        } catch (err) {
          message.textContent = err.message;
          message.hidden = false;
        } finally {
          start.disabled = false;
        }
      },
    },
    h('p', null, 'Multiple-choice questions generated from your own records: definitions, commands, error causes and workflow goals. Weak and overdue material comes up first. Results feed your review schedule.'),
    h(
      'div',
      { class: 'filters' },
      selectField('Questions', filters.size, [['5', '5'], ['8', '8'], ['12', '12'], ['20', '20']], (v) => (filters.size = v)),
      selectField('Category', filters.category, [['', 'All categories'], ...meta.categories.map((c) => [c, c])], (v) => (filters.category = v)),
    ),
    message,
    h('div', { class: 'form-actions' }, start),
  );
  return h('div', { class: 'page narrow' }, pageHeader('Assessment', 'Verify what you actually know, not what you recognise.'), form, historyTable(history));
}

function questionBlock(q, i, { onChange } = {}) {
  const done = q.correct !== undefined;
  return h(
    'fieldset',
    { class: `panel question${done ? (q.correct ? ' correct' : ' wrong') : ''}`, dataset: { index: i } },
    h('legend', { class: 'visually-hidden' }, `Question ${i + 1}`),
    h('div', { class: 'card-top' }, h('span', { class: 'eyebrow' }, `Question ${i + 1}`), done && kindBadge(q.kind), done && h('span', { class: `badge ${q.correct ? 'resolved' : 'open'}` }, q.correct ? '✓ Correct' : q.chosen === null ? '— Skipped' : '✗ Wrong')),
    h('h2', null, q.prompt),
    contextBlock(q.stem.code ? q.stem : { text: q.stem.text }),
    h(
      'div',
      { class: 'options' },
      q.options.map((text, j) => {
        const cls = done ? (j === q.answer ? ' is-answer' : j === q.chosen ? ' is-wrong' : '') : '';
        return h(
          'label',
          { class: `option${cls}` },
          h('input', { type: 'radio', name: `q${i}`, value: j, disabled: done, checked: done && j === q.chosen, onchange: onChange }),
          q.code ? h('code', null, text) : h('span', null, text),
        );
      }),
    ),
    done &&
      q.title &&
      h('p', { class: 'hint' }, 'From ', h('a', { href: recordHref(q.kind, q.id) }, q.title), !q.correct && [' · ', h('a', { href: practiceHref(q.kind, q.id, 'explain') }, 'Practise it')]),
  );
}

export async function quizView({ params, setDirty, rerender }) {
  const quiz = await api.quiz(Number(params.id));
  const back = h('a', { class: 'back', href: '#/quiz' }, '← Assessment');

  if (quiz.completed_at) {
    const percent = pct(quiz.score, quiz.total);
    return h(
      'div',
      { class: 'page narrow' },
      back,
      h(
        'section',
        { class: 'panel result-panel', id: 'quiz-result' },
        h(
          'div',
          { class: 'result-head' },
          scoreRing(percent, percent >= 70),
          h('div', null, h('h1', null, `${quiz.score} of ${quiz.total} correct`), h('p', { class: 'hint' }, 'Correct answers moved those records forward in your review schedule; wrong ones come back in ten minutes.')),
        ),
        h('div', { class: 'form-actions' }, h('a', { class: 'button primary', href: '#/quiz' }, 'New assessment'), h('a', { class: 'button', href: '#/review' }, 'Review Center')),
      ),
      h('div', { class: 'questions' }, quiz.questions.map((q, i) => questionBlock(q, i))),
    );
  }

  const answered = h('span', { class: 'hint', id: 'answered' });
  const form = h('form', { id: 'quiz-run', novalidate: true });
  const answers = () => quiz.questions.map((_, i) => {
    const checked = form.querySelector(`input[name="q${i}"]:checked`);
    return checked ? Number(checked.value) : null;
  });
  const updateCount = () => {
    const n = answers().filter((a) => a !== null).length;
    answered.textContent = `${n} of ${quiz.total} answered`;
    setDirty(n > 0);
  };
  const message = h('p', { class: 'form-error', role: 'alert', hidden: true });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const chosen = answers();
    const blank = chosen.filter((a) => a === null).length;
    if (blank && !(await confirmDialog({ title: `Submit with ${blank} unanswered?`, body: 'Unanswered questions count as wrong.', confirmLabel: 'Submit' }))) return;
    try {
      await api.submitQuiz(quiz.id, chosen);
      setDirty(false);
      rerender();
    } catch (err) {
      message.textContent = err.message;
      message.hidden = false;
    }
  });
  form.append(
    h('div', { class: 'questions' }, quiz.questions.map((q, i) => questionBlock(q, i, { onChange: updateCount }))),
    message,
    h('div', { class: 'form-actions sticky-actions' }, h('button', { type: 'submit', class: 'button primary', id: 'submit-quiz' }, 'Submit answers'), answered),
  );
  updateCount();
  setDirty(false);
  return h('div', { class: 'page narrow' }, back, pageHeader('Assessment', `${quiz.total} questions. Choose the best answer for each.`), form);
}
