import { api } from '../api.js';
import { emptyState, pageHeader } from '../components.js';
import { h, icon, toast } from '../dom.js';
import { parseVideo, searchUrl, videoPlayer } from '../video.js';

const courseHref = (trackId) => `#/courses/${trackId}`;
const lessonHref = (trackId, lessonId) => `#/courses/${trackId}/${lessonId}`;

function hours(minutes) {
  const h = minutes / 60;
  return h < 1 ? `${minutes} min` : `${Math.round(h)} h`;
}

function progressBar(percent, label) {
  return h(
    'div',
    { class: 'course-progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(percent), 'aria-label': label },
    h('span', { class: 'course-progress-fill', style: { width: `${percent}%` } }),
  );
}

function continueButton(course, { className = 'button primary' } = {}) {
  if (!course.next) return h('a', { class: 'button', href: courseHref(course.id) }, 'Review the course');
  return h(
    'a',
    { class: className, href: lessonHref(course.id, course.next.id), id: 'course-continue' },
    icon('play'),
    h('span', null, course.started ? 'Continue' : 'Start learning'),
  );
}

// Compact "continue where you left off" panel, also used on the Dashboard.
export function continuePanel(courses) {
  const course = courses.find((c) => c.started && c.next) ?? courses.find((c) => c.next) ?? courses[0];
  if (!course) return null;
  return h(
    'section',
    { class: 'panel continue-panel', id: 'continue-course' },
    h(
      'div',
      { class: 'continue-body' },
      h('span', { class: 'continue-icon', 'aria-hidden': 'true' }, icon('courses')),
      h(
        'div',
        { class: 'continue-text' },
        h('a', { class: 'continue-title', href: courseHref(course.id) }, course.title),
        h('span', { class: 'continue-meta' }, course.next ? `${course.started ? 'Next' : 'First lesson'}: ${course.next.title}` : 'Course complete'),
        progressBar(course.percent, `${course.title} progress`),
        h('span', { class: 'continue-meta' }, `${course.completed} of ${course.lessons} lessons · ${course.percent}%`),
      ),
    ),
    continueButton(course),
  );
}

export async function coursesView() {
  const courses = await api.courses();
  return h(
    'div',
    { class: 'page' },
    pageHeader('Courses', 'Structured engineering tracks with video lectures. Each lesson can be saved to your Knowledge Library, so the learning loop can test you on it later.'),
    courses.length
      ? h(
          'ul',
          { class: 'course-grid', id: 'course-list' },
          courses.map((c) =>
            h(
              'li',
              { class: 'panel course-card', dataset: { course: c.id } },
              h('span', { class: 'badge level' }, c.level),
              h('h2', null, h('a', { href: courseHref(c.id) }, c.title)),
              h('p', { class: 'course-tagline' }, c.tagline),
              h(
                'ul',
                { class: 'course-facts' },
                h('li', null, h('strong', null, c.modules), ' modules'),
                h('li', null, h('strong', null, c.lessons), ' lessons'),
                h('li', null, icon('clock'), ` about ${hours(c.minutes)} + videos`),
              ),
              progressBar(c.percent, `${c.title} progress`),
              h('p', { class: 'course-status' }, c.percent === 100 ? 'Completed' : c.started ? `${c.completed} of ${c.lessons} lessons complete` : 'Not started'),
              h('div', { class: 'course-actions' }, continueButton(c), h('a', { class: 'button', href: courseHref(c.id) }, 'Syllabus')),
            ),
          ),
        )
      : h('section', { class: 'panel' }, emptyState('No courses yet', 'Courses appear here when a learning track is added.')),
  );
}

function lessonRow(trackId, lesson, isNext) {
  return h(
    'li',
    null,
    h(
      'a',
      { class: `lesson-row${lesson.completed ? ' done' : ''}${isNext ? ' next' : ''}`, href: lessonHref(trackId, lesson.id), dataset: { lesson: lesson.id } },
      h('span', { class: 'lesson-check', 'aria-hidden': 'true' }, lesson.completed ? icon('check') : String(lesson.number)),
      h('span', { class: 'lesson-title' }, lesson.title, isNext && h('span', { class: 'badge next-badge' }, 'Up next')),
      h('span', { class: 'lesson-meta' }, lesson.hasVideo && h('span', { class: 'has-video', title: 'Lecture video attached' }, icon('video')), `${lesson.minutes} min`),
      h('span', { class: 'visually-hidden' }, lesson.completed ? ' (completed)' : ''),
    ),
  );
}

function projectCard(project, { id } = {}) {
  return h(
    'div',
    { class: 'project-card', id },
    h('p', { class: 'project-label' }, 'Hands-on project'),
    h('h4', null, project.title),
    h('p', null, project.description),
    h('ul', { class: 'bullets' }, project.deliverables.map((d) => h('li', null, d))),
  );
}

export async function courseView({ params, query }) {
  const course = await api.course(params.track);
  const nextId = course.next?.id;
  // ?module=<id> opens that module and scrolls to it (used by lesson breadcrumbs).
  const focusModule = query.get('module');
  if (focusModule) requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(`module-${focusModule}`)?.scrollIntoView({ block: 'start' })));
  const modules = new Map(course.moduleList.map((m) => [m.id, m]));

  const moduleBlock = (m) =>
    h(
      'details',
      { class: 'panel module', id: `module-${m.id}`, open: m.id === focusModule || (!focusModule && m.lessons.some((l) => l.id === nextId)) || undefined },
      h(
        'summary',
        null,
        h('span', { class: 'module-number' }, String(m.number).padStart(2, '0')),
        h(
          'span',
          { class: 'module-heading' },
          h('span', { class: 'module-title' }, m.title),
          h('span', { class: 'module-meta' }, `${m.level} · ${m.lessons.length} lessons · ${m.completed}/${m.lessons.length} done`),
        ),
        m.completed === m.lessons.length && h('span', { class: 'module-done', title: 'Module complete' }, icon('check')),
      ),
      h(
        'div',
        { class: 'module-body' },
        h('p', { class: 'module-summary' }, m.summary),
        h('h3', { class: 'mini-heading' }, 'Learning objectives'),
        h('ul', { class: 'bullets' }, m.objectives.map((o) => h('li', null, o))),
        h('h3', { class: 'mini-heading' }, 'Lessons'),
        h('ol', { class: 'lesson-list' }, m.lessons.map((l) => lessonRow(course.id, l, l.id === nextId))),
        projectCard(m.project),
      ),
    );

  return h(
    'div',
    { class: 'page narrow course-page' },
    h('nav', { class: 'crumbs', 'aria-label': 'Breadcrumb' }, h('a', { href: '#/courses' }, 'Courses'), h('span', { 'aria-hidden': 'true' }, '›'), h('span', null, course.title)),
    h(
      'header',
      { class: 'course-hero' },
      h('span', { class: 'badge level' }, course.level),
      h('h1', null, course.title),
      h('p', { class: 'intro' }, course.tagline),
      h(
        'ul',
        { class: 'course-facts' },
        h('li', null, h('strong', null, course.modules), ' modules'),
        h('li', null, h('strong', null, course.lessons), ' lessons'),
        h('li', null, icon('clock'), ` about ${hours(course.minutes)} + videos`),
      ),
      progressBar(course.percent, 'Course progress'),
      h('p', { class: 'course-status', id: 'course-status' }, `${course.completed} of ${course.lessons} lessons complete · ${course.percent}%`),
      h('div', { class: 'course-actions' }, continueButton(course), course.next && h('span', { class: 'hint' }, course.next.title)),
    ),
    h(
      'details',
      { class: 'panel about' },
      h('summary', null, 'About this course'),
      h(
        'div',
        { class: 'module-body' },
        h('p', null, course.description),
        h('h3', { class: 'mini-heading' }, 'What you will be able to do'),
        h('ul', { class: 'bullets' }, course.outcomes.map((o) => h('li', null, o))),
        h('h3', { class: 'mini-heading' }, 'Before you start'),
        h('ul', { class: 'bullets' }, course.prerequisites.map((o) => h('li', null, o))),
      ),
    ),
    course.stages.map((stage, i) =>
      h(
        'section',
        { class: 'stage', dataset: { stage: stage.id } },
        h('h2', { class: 'stage-title' }, h('span', { class: 'stage-step' }, `Stage ${i + 1}`), stage.label),
        stage.modules.map((id) => modules.get(id)).filter(Boolean).map(moduleBlock),
      ),
    ),
  );
}

// ───────────────────────────────────────────── Lesson

function videoSection(lesson, { onChange, onProgress, onEnded }) {
  const wrap = h('section', { class: 'video-section', 'aria-label': 'Lecture video' });
  let editing = false;

  const attachForm = async () => {
    // Text, not type=url: media-folder paths (/media/…) are valid here but are
    // not absolute URLs. inputmode still gives phones the URL keyboard.
    const input = h('input', {
      type: 'text',
      id: 'video-url',
      name: 'video-url',
      inputMode: 'url',
      autocomplete: 'off',
      autocapitalize: 'off',
      spellcheck: false,
      placeholder: 'https://www.youtube.com/watch?v=…',
      value: lesson.state.videoUrl.startsWith('/media/') ? '' : lesson.state.videoUrl,
    });
    const files = await api.media().catch(() => []);
    const picker =
      files.length > 0 &&
      h(
        'label',
        { class: 'field' },
        h('span', { class: 'field-label' }, 'Or choose a video from your media folder'),
        h(
          'select',
          { id: 'video-file', onchange: (e) => (input.value = e.target.value) },
          h('option', { value: '' }, '—'),
          files.map((f) => h('option', { value: f.url, selected: f.url === lesson.state.videoUrl }, f.name)),
        ),
      );
    const save = async (value) => {
      try {
        lesson.state = { ...lesson.state, ...(await api.updateLesson(lesson.track.id, lesson.id, { videoUrl: value })) };
        editing = false;
        toast(value ? 'Lecture video attached.' : 'Lecture video removed.');
        onChange?.();
        render();
      } catch (err) {
        toast(err.message, 'error');
      }
    };
    return h(
      'form',
      {
        class: 'panel video-form',
        id: 'video-form',
        onsubmit: (e) => {
          e.preventDefault();
          const value = input.value.trim();
          if (value && !parseVideo(value)) return toast('Enter a full https:// link to a YouTube or Vimeo video, or a video file.', 'error');
          save(value);
        },
      },
      h('h3', null, 'Attach a lecture video'),
      h('p', { class: 'hint' }, 'Paste a YouTube or Vimeo link, or a direct link to an .mp4 or .webm file. It plays right here, full screen on your phone.'),
      h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Video link'), input),
      picker,
      h(
        'div',
        { class: 'form-actions' },
        h('button', { type: 'submit', class: 'button primary', id: 'video-save' }, 'Save video'),
        h('button', { type: 'button', class: 'button', onclick: () => ((editing = false), render()) }, 'Cancel'),
        lesson.state.videoUrl && h('button', { type: 'button', class: 'button danger-quiet', id: 'video-remove', onclick: () => save('') }, 'Remove video'),
      ),
    );
  };

  async function render() {
    const video = parseVideo(lesson.state.videoUrl);
    const findLink = h('a', { class: 'button', href: searchUrl(lesson.videoQuery), target: '_blank', rel: 'noopener noreferrer', id: 'video-find' }, icon('external'), h('span', null, 'Find lecture videos'));
    const changeButton = h('button', { type: 'button', class: `button${video?.type === 'embed' || video?.type === 'file' ? ' small' : ''}`, id: 'video-change', onclick: () => ((editing = true), render()) }, video ? 'Change video' : 'Attach a video');
    let body;
    if (video?.type === 'embed' || video?.type === 'file') {
      body = [
        videoPlayer(video, { title: lesson.title, startAt: lesson.state.videoPosition, onProgress, onEnded }),
        h(
          'div',
          { class: 'video-actions' },
          video.open && h('a', { class: 'button small', href: video.open, target: '_blank', rel: 'noopener noreferrer' }, icon('external'), h('span', null, `Open in ${video.provider}`)),
          changeButton,
        ),
      ];
    } else if (video?.type === 'link') {
      body = h(
        'div',
        { class: 'video-empty' },
        h('span', { class: 'video-empty-icon', 'aria-hidden': 'true' }, icon('video')),
        h('p', null, h('strong', null, 'Lecture link attached.'), ' This site cannot be embedded, so it opens in a new tab.'),
        h('div', { class: 'video-actions' }, h('a', { class: 'button primary', href: video.href, target: '_blank', rel: 'noopener noreferrer' }, icon('play'), h('span', null, 'Open lecture')), changeButton),
      );
    } else {
      body = h(
        'div',
        { class: 'video-empty', id: 'video-empty' },
        h('span', { class: 'video-empty-icon', 'aria-hidden': 'true' }, icon('play')),
        h('p', null, h('strong', null, 'No lecture video attached yet.'), ' Find a lecture you like, then attach its link. It will play here every time you open this lesson.'),
        h('div', { class: 'video-actions' }, findLink, changeButton),
      );
    }
    wrap.replaceChildren(...[body, editing ? await attachForm() : null].flat().filter(Boolean));
    if (editing) wrap.querySelector('#video-url')?.focus({ preventScroll: true });
  }
  render();
  return wrap;
}

export async function lessonView({ params }) {
  const lesson = await api.lesson(params.track, params.lesson);
  const trackId = lesson.track.id;

  const completeButton = h('button', { type: 'button', class: 'button', id: 'lesson-complete' });
  const syncComplete = () => {
    const done = lesson.state.completed;
    completeButton.className = `button ${done ? 'done' : 'primary'}`;
    completeButton.setAttribute('aria-pressed', String(done));
    completeButton.replaceChildren(icon('check'), h('span', null, done ? 'Completed' : 'Mark as complete'));
  };
  const setComplete = async (completed, { quiet = false } = {}) => {
    try {
      lesson.state = { ...lesson.state, ...(await api.updateLesson(trackId, lesson.id, { completed })) };
      syncComplete();
      if (!quiet) toast(completed ? (lesson.next ? `Lesson complete. Next: ${lesson.next.title}` : 'Lesson complete. You finished the course!') : 'Marked as not complete.');
    } catch (err) {
      toast(err.message, 'error');
    }
  };
  completeButton.addEventListener('click', () => setComplete(!lesson.state.completed));
  syncComplete();

  const libraryButton = () =>
    lesson.state.knowledgeId
      ? h('a', { class: 'button', href: `#/knowledge/${lesson.state.knowledgeId}`, id: 'lesson-library' }, 'Open in Knowledge Library')
      : h(
          'button',
          {
            type: 'button',
            class: 'button',
            id: 'lesson-save',
            onclick: async (e) => {
              e.currentTarget.disabled = true;
              try {
                const { id } = await api.saveLesson(trackId, lesson.id);
                lesson.state.knowledgeId = id;
                toast('Saved to your Knowledge Library. Practise it with explain-back and reviews.');
                libraryWrap.replaceChildren(libraryButton());
              } catch (err) {
                toast(err.message, 'error');
                e.currentTarget.disabled = false;
              }
            },
          },
          'Save to Knowledge Library',
        );
  const libraryWrap = h('span', { class: 'library-wrap' }, libraryButton());

  const video = videoSection(lesson, {
    onProgress: (position) => api.updateLesson(trackId, lesson.id, { videoPosition: position }).catch(() => {}),
    onEnded: () => !lesson.state.completed && setComplete(true),
  });

  const section = (title, ...content) => h('section', { class: 'lesson-block' }, h('h2', null, title), content);

  return h(
    'article',
    { class: 'page narrow lesson-page', dataset: { lesson: lesson.id } },
    h(
      'nav',
      { class: 'crumbs', 'aria-label': 'Breadcrumb' },
      h('a', { href: '#/courses' }, 'Courses'),
      h('span', { 'aria-hidden': 'true' }, '›'),
      h('a', { href: courseHref(trackId) }, lesson.track.title),
      h('span', { 'aria-hidden': 'true' }, '›'),
      h('a', { href: `${courseHref(trackId)}?module=${lesson.module.id}` }, `Module ${lesson.module.number}`),
    ),
    h(
      'header',
      { class: 'lesson-header' },
      h('p', { class: 'lesson-kicker' }, `Module ${lesson.module.number} · ${lesson.module.title}`),
      h('h1', null, lesson.title),
      h(
        'p',
        { class: 'lesson-meta-line' },
        h('span', null, `Lesson ${lesson.number} of ${lesson.total}`),
        h('span', null, icon('clock'), ` ${lesson.minutes} min read`),
        h('span', { class: 'badge level' }, lesson.module.level),
      ),
    ),
    video,
    h('div', { class: 'lesson-actions' }, completeButton, libraryWrap),
    section('Learning objectives', h('ul', { class: 'objectives' }, lesson.objectives.map((o) => h('li', null, icon('check'), h('span', null, o))))),
    section('Overview', h('p', { class: 'lead' }, lesson.summary), h('p', { class: 'why' }, h('strong', null, 'Why it matters. '), lesson.why)),
    lesson.sections.map((s) => section(s.heading, h('p', null, s.body))),
    section('Key terms', h('dl', { class: 'terms' }, lesson.keyTerms.map(([term, def]) => [h('dt', null, term), h('dd', null, def)]))),
    section('Real-world example', h('p', null, lesson.example)),
    section('Practice', h('div', { class: 'practice-box' }, h('p', null, lesson.practice))),
    lesson.module.project && section(`Module ${lesson.module.number} project`, projectCard(lesson.module.project, { id: 'module-project' })),
    h(
      'nav',
      { class: 'lesson-nav', 'aria-label': 'Lesson navigation' },
      lesson.previous
        ? h('a', { class: 'lesson-nav-link prev', href: lessonHref(trackId, lesson.previous.id), id: 'lesson-prev' }, h('span', { class: 'lesson-nav-dir' }, '← Previous'), h('span', { class: 'lesson-nav-title' }, lesson.previous.title))
        : h('span'),
      lesson.next
        ? h(
            'a',
            {
              class: 'lesson-nav-link next',
              href: lessonHref(trackId, lesson.next.id),
              id: 'lesson-next',
              onclick: () => {
                // Finishing a lesson and moving on counts as completing it.
                if (!lesson.state.completed) api.updateLesson(trackId, lesson.id, { completed: true }).catch(() => {});
              },
            },
            h('span', { class: 'lesson-nav-dir' }, 'Next →'),
            h('span', { class: 'lesson-nav-title' }, lesson.next.title),
          )
        : h('a', { class: 'lesson-nav-link next', href: courseHref(trackId), id: 'lesson-finish', onclick: () => !lesson.state.completed && setComplete(true, { quiet: true }) }, h('span', { class: 'lesson-nav-dir' }, 'Finish'), h('span', { class: 'lesson-nav-title' }, 'Back to the course')),
    ),
  );
}
