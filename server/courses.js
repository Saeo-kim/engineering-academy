// Courses: structured learning tracks (modules → lessons) with video lectures.
//
// The curriculum itself is static content in server/curriculum/. This module
// joins it with your progress from the lesson_progress table: completion,
// the lecture video attached to each lesson, where you stopped watching, and
// the Knowledge Library record a lesson was saved as.

import { ROBOTICS } from './curriculum/robotics.js';
import { NotFoundError, ValidationError } from './repository.js';

export const TRACKS = [ROBOTICS];

const MAX_URL = 2048;
// Files in the media folder are served at /media/<name>. Names stay simple so
// they can never escape the folder.
export const MEDIA_NAME = /^[A-Za-z0-9][A-Za-z0-9._ -]{0,180}\.(mp4|m4v|webm|mov)$/i;
export const MEDIA_TYPES = { '.mp4': 'video/mp4', '.m4v': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime' };

// Lecture videos must be https links (YouTube, Vimeo, or a direct video file)
// or a file from the local media folder. Anything else (javascript:, data:,
// plain http that an https page would block) is rejected.
export function cleanVideoUrl(value) {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'string') throw new ValidationError('Video link must be text.');
  const url = value.trim();
  if (!url) return '';
  if (url.length > MAX_URL) throw new ValidationError('Video link is too long.');
  if (url.startsWith('/media/')) {
    let name;
    try {
      name = decodeURIComponent(url.slice('/media/'.length));
    } catch {
      throw new ValidationError('Video file name is not valid.');
    }
    if (!MEDIA_NAME.test(name)) throw new ValidationError('Video files must be .mp4, .m4v, .webm or .mov files in the media folder.');
    return url;
  }
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new ValidationError('Enter a full video link starting with https://');
  }
  if (parsed.protocol !== 'https:') throw new ValidationError('Video links must start with https://');
  return parsed.href;
}

function indexTrack(track) {
  const lessons = [];
  for (const module of track.modules) {
    for (const lesson of module.lessons) lessons.push({ module, lesson });
  }
  return { track, lessons, byId: new Map(lessons.map((entry, i) => [entry.lesson.id, { ...entry, index: i }])) };
}

export function createCourses(repo, tracks = TRACKS) {
  const { db, transaction, clean, insertRow, logActivity } = repo.internals;
  const indexed = new Map(tracks.map((t) => [t.id, indexTrack(t)]));
  const now = () => new Date().toISOString();

  function requireTrack(trackId) {
    const entry = indexed.get(trackId);
    if (!entry) throw new NotFoundError('Course not found.');
    return entry;
  }

  function requireLesson(trackId, lessonId) {
    const entry = requireTrack(trackId);
    const found = entry.byId.get(lessonId);
    if (!found) throw new NotFoundError('Lesson not found.');
    return { ...entry, ...found };
  }

  const progressRows = (trackId) =>
    new Map(db.prepare('SELECT * FROM lesson_progress WHERE track_id = ?').all(trackId).map((r) => [r.lesson_id, r]));

  const knowledgeExists = (id) => id != null && Boolean(db.prepare('SELECT 1 FROM knowledge WHERE id = ?').get(id));

  function summarize({ track, lessons }, rows) {
    const done = lessons.filter(({ lesson }) => rows.get(lesson.id)?.completed_at).length;
    const next = lessons.find(({ lesson }) => !rows.get(lesson.id)?.completed_at) ?? null;
    const started = rows.size > 0;
    return {
      id: track.id,
      title: track.title,
      tagline: track.tagline,
      level: track.level,
      modules: track.modules.length,
      lessons: lessons.length,
      minutes: lessons.reduce((sum, { lesson }) => sum + lesson.minutes, 0),
      completed: done,
      percent: lessons.length ? Math.round((done / lessons.length) * 100) : 0,
      started,
      next: next && { id: next.lesson.id, title: next.lesson.title, module: next.module.title },
    };
  }

  function list() {
    return [...indexed.values()].map((entry) => summarize(entry, progressRows(entry.track.id)));
  }

  function track(trackId) {
    const entry = requireTrack(trackId);
    const rows = progressRows(trackId);
    const t = entry.track;
    let number = 0;
    return {
      ...summarize(entry, rows),
      description: t.description,
      prerequisites: t.prerequisites,
      outcomes: t.outcomes,
      stages: t.stages,
      moduleList: t.modules.map((m, i) => ({
        id: m.id,
        number: i + 1,
        title: m.title,
        level: m.level,
        summary: m.summary,
        objectives: m.objectives,
        project: m.project,
        completed: m.lessons.filter((l) => rows.get(l.id)?.completed_at).length,
        lessons: m.lessons.map((l) => {
          number += 1;
          const row = rows.get(l.id);
          return { id: l.id, number, title: l.title, minutes: l.minutes, completed: Boolean(row?.completed_at), hasVideo: Boolean(row?.video_url) };
        }),
      })),
    };
  }

  function lessonState(trackId, lessonId) {
    const row = db.prepare('SELECT * FROM lesson_progress WHERE track_id = ? AND lesson_id = ?').get(trackId, lessonId);
    return {
      completed: Boolean(row?.completed_at),
      completedAt: row?.completed_at ?? null,
      videoUrl: row?.video_url ?? '',
      videoPosition: row?.video_position ?? 0,
      knowledgeId: knowledgeExists(row?.knowledge_id) ? row.knowledge_id : null,
    };
  }

  function lesson(trackId, lessonId) {
    const { track: t, lessons, module, lesson: l, index } = requireLesson(trackId, lessonId);
    const ref = (entry) => entry && { id: entry.lesson.id, title: entry.lesson.title };
    const moduleIndex = t.modules.indexOf(module);
    return {
      track: { id: t.id, title: t.title },
      module: {
        id: module.id,
        number: moduleIndex + 1,
        title: module.title,
        level: module.level,
        lessonIndex: module.lessons.indexOf(l) + 1,
        lessonCount: module.lessons.length,
        // The module project is shown after its last lesson.
        project: module.lessons.at(-1) === l ? module.project : null,
      },
      number: index + 1,
      total: lessons.length,
      previous: ref(lessons[index - 1]),
      next: ref(lessons[index + 1]),
      ...l,
      state: lessonState(t.id, l.id),
    };
  }

  function upsert(trackId, lessonId, changes) {
    const existing = db.prepare('SELECT * FROM lesson_progress WHERE track_id = ? AND lesson_id = ?').get(trackId, lessonId);
    const row = {
      completed_at: existing?.completed_at ?? null,
      video_url: existing?.video_url ?? '',
      video_position: existing?.video_position ?? 0,
      knowledge_id: existing?.knowledge_id ?? null,
      ...changes,
    };
    db.prepare(
      `INSERT INTO lesson_progress (track_id, lesson_id, completed_at, video_url, video_position, knowledge_id, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (track_id, lesson_id) DO UPDATE SET
         completed_at = excluded.completed_at, video_url = excluded.video_url,
         video_position = excluded.video_position, knowledge_id = excluded.knowledge_id, updated_at = excluded.updated_at`,
    ).run(trackId, lessonId, row.completed_at, row.video_url, row.video_position, row.knowledge_id, now());
  }

  function updateLesson(trackId, lessonId, input) {
    requireLesson(trackId, lessonId);
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ValidationError('Expected an object.');
    const changes = {};
    if ('completed' in input) {
      if (typeof input.completed !== 'boolean') throw new ValidationError('completed must be true or false.');
      const current = lessonState(trackId, lessonId);
      changes.completed_at = input.completed ? (current.completedAt ?? now()) : null;
    }
    if ('videoUrl' in input) {
      changes.video_url = cleanVideoUrl(input.videoUrl);
      changes.video_position = 0;
    }
    if ('videoPosition' in input) {
      const position = Number(input.videoPosition);
      if (!Number.isFinite(position) || position < 0 || position > 86_400) throw new ValidationError('videoPosition must be a number of seconds.');
      changes.video_position = Math.round(position);
    }
    if (!Object.keys(changes).length) throw new ValidationError('Nothing to update.');
    transaction(() => upsert(trackId, lessonId, changes));
    return lessonState(trackId, lessonId);
  }

  // Copies a lesson into the Knowledge Library so the learning loop
  // (explain-back, review, assessment) can work on it. Saving twice returns
  // the existing record instead of creating a duplicate.
  function saveToLibrary(trackId, lessonId) {
    const { track: t, module, lesson: l } = requireLesson(trackId, lessonId);
    const current = lessonState(trackId, lessonId);
    if (current.knowledgeId) return { id: current.knowledgeId, created: false };
    return transaction(() => {
      const row = clean('knowledge', {
        title: l.title,
        category: 'Robotics',
        capture_type: 'note',
        tags: ['robotics', module.id, l.id],
        content: `${t.title} › ${module.title}\n\nKey terms:\n${l.keyTerms.map(([term, def]) => `- ${term}: ${def}`).join('\n')}`,
        what_is_it: l.summary,
        why_needed: l.why,
        how_it_works: l.sections.map((s) => `${s.heading}: ${s.body}`).join('\n\n'),
        real_example: l.example,
        exercise: l.practice,
      });
      const id = insertRow('knowledge', row);
      logActivity('created', 'knowledge', id, row.title);
      upsert(trackId, lessonId, { knowledge_id: id });
      return { id, created: true };
    });
  }

  return { list, track, lesson, updateLesson, saveToLibrary };
}
