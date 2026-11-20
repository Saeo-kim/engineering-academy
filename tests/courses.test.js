import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { createApp } from '../server/app.js';
import { createAuth } from '../server/auth.js';
import { cleanVideoUrl, TRACKS } from '../server/courses.js';
import { ROBOTICS } from '../server/curriculum/robotics.js';
import { PROJECT_STRUCTURE } from '../server/curriculum/project-structure/index.js';
import { openDatabase } from '../server/db.js';
import { createRepository, ValidationError } from '../server/repository.js';
import { CATEGORIES } from '../server/resources.js';

const dir = mkdtempSync(join(tmpdir(), 'academy-courses-'));
const mediaDir = join(dir, 'videos');
mkdirSync(mediaDir);
// 1,000 bytes with a recognisable pattern, so ranges can be checked exactly.
const VIDEO = Buffer.from(Array.from({ length: 1000 }, (_, i) => i % 256));
writeFileSync(join(mediaDir, 'lecture 1.mp4'), VIDEO);
writeFileSync(join(mediaDir, 'notes.txt'), 'not a video');

function startServer(options = {}) {
  const db = openDatabase(join(dir, `${Math.random().toString(36).slice(2)}.db`));
  const repo = createRepository(db);
  const server = createApp(repo, { mediaDir, ...options });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      const raw = (method, path, { headers = {}, body } = {}) =>
        new Promise((done, reject) => {
          const req = httpRequest({ host: '127.0.0.1', port, method, path, headers }, (res) => {
            const chunks = [];
            res.on('data', (c) => chunks.push(c));
            res.on('end', () => {
              const buffer = Buffer.concat(chunks);
              let json = null;
              try {
                json = JSON.parse(buffer.toString());
              } catch {
                /* not JSON */
              }
              done({ status: res.statusCode, headers: res.headers, buffer, json });
            });
          });
          req.on('error', reject);
          req.end(body);
        });
      const api = (method, path, body) => {
        const payload = body === undefined ? undefined : JSON.stringify(body);
        return raw(method, `/api/${path}`, {
          headers: payload === undefined ? {} : { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
          body: payload,
        });
      };
      const close = async () => {
        server.closeAllConnections();
        await new Promise((r) => server.close(r));
        db.close();
      };
      resolve({ api, raw, repo, close });
    });
  });
}

after(() => rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }));

describe('Robotics Engineering curriculum', () => {
  const lessons = ROBOTICS.modules.flatMap((m) => m.lessons);

  it('covers every required topic area as a module', () => {
    const titles = ROBOTICS.modules.map((m) => m.title).join(' | ');
    for (const topic of ['Fundamentals', 'Mechanical', 'Electronics', 'Sensors', 'Programming', 'Control', 'Artificial Intelligence', 'Autonomous', 'Human-Robot Interaction', 'Safety', 'Capstone']) {
      assert.match(titles, new RegExp(topic), `missing module for ${topic}`);
    }
  });

  it('progresses from beginner to advanced and ends in practical projects', () => {
    const order = ['Beginner', 'Intermediate', 'Advanced', 'Project'];
    const levels = ROBOTICS.modules.map((m) => order.indexOf(m.level));
    assert.ok(levels.every((l) => l >= 0), 'every module has a known level');
    assert.deepEqual(levels, [...levels].sort((a, b) => a - b), 'levels never go backwards');
    assert.equal(ROBOTICS.modules.at(-1).id, 'capstone');
    for (const m of ROBOTICS.modules) {
      assert.ok(m.project?.title && m.project.deliverables.length >= 3, `${m.id} ends with a hands-on project`);
    }
  });

  it('places every module in exactly one stage', () => {
    const staged = ROBOTICS.stages.flatMap((s) => s.modules);
    assert.deepEqual([...staged].sort(), ROBOTICS.modules.map((m) => m.id).sort());
  });

  it('gives every lesson complete, structured content with unique ids', () => {
    assert.equal(new Set(lessons.map((l) => l.id)).size, lessons.length, 'lesson ids are unique');
    assert.ok(lessons.length >= 40);
    for (const l of lessons) {
      assert.match(l.id, /^[a-z0-9-]+$/, l.id);
      for (const field of ['title', 'summary', 'why', 'example', 'practice', 'videoQuery']) assert.ok(l[field]?.trim(), `${l.id}.${field}`);
      assert.ok(l.minutes > 0, `${l.id}.minutes`);
      assert.ok(l.objectives.length >= 3, `${l.id} has learning objectives`);
      assert.ok(l.sections.length >= 2 && l.sections.every((s) => s.heading && s.body), `${l.id} has lesson sections`);
      assert.ok(l.keyTerms.length >= 4 && l.keyTerms.every(([t, d]) => t && d), `${l.id} has key terms`);
    }
  });

  it('is written entirely in English', () => {
    const text = JSON.stringify(ROBOTICS);
    assert.doesNotMatch(text, /[ㄱ-힣぀-ヿ一-鿿]/, 'no Korean, Japanese or Chinese characters');
  });

  it('adds Robotics as a Knowledge Library category', () => {
    assert.ok(CATEGORIES.includes('Robotics'));
  });
});

describe('lecture video links', () => {
  it('accepts https links and media-folder files', () => {
    assert.equal(cleanVideoUrl('https://www.youtube.com/watch?v=abcdefghijk'), 'https://www.youtube.com/watch?v=abcdefghijk');
    assert.equal(cleanVideoUrl('  https://vimeo.com/123  '), 'https://vimeo.com/123');
    assert.equal(cleanVideoUrl('/media/lecture%201.mp4'), '/media/lecture%201.mp4');
    assert.equal(cleanVideoUrl(''), '');
    assert.equal(cleanVideoUrl(null), '');
  });

  it('rejects unsafe or unplayable links', () => {
    for (const bad of ['javascript:alert(1)', 'data:video/mp4;base64,AAAA', 'http://example.com/a.mp4', 'not a url', '/media/../academy.db', '/media/notes.txt', '/media/%E0%A4%A', 42]) {
      assert.throws(() => cleanVideoUrl(bad), ValidationError, String(bad));
    }
  });
});

describe('courses API', () => {
  let s;
  before(async () => {
    s = await startServer();
  });
  after(() => s.close());

  it('lists the Robotics Engineering track with progress', async () => {
    const res = await s.api('GET', 'courses');
    assert.equal(res.status, 200);
    const robotics = res.json.find((c) => c.id === 'robotics');
    assert.equal(robotics.title, 'Robotics Engineering');
    assert.equal(robotics.modules, 11);
    assert.equal(robotics.completed, 0);
    assert.equal(robotics.started, false);
    assert.equal(robotics.next.id, 'what-is-a-robot');
  });

  it('returns the syllabus and individual lessons, and 404s unknown ones', async () => {
    const track = await s.api('GET', 'courses/robotics');
    assert.equal(track.status, 200);
    assert.equal(track.json.moduleList.length, 11);
    assert.equal(track.json.moduleList[0].lessons[0].number, 1);

    const lesson = await s.api('GET', 'courses/robotics/lessons/pid-control');
    assert.equal(lesson.status, 200);
    assert.equal(lesson.json.title, 'PID control');
    assert.equal(lesson.json.module.id, 'control');
    assert.ok(lesson.json.previous && lesson.json.next);
    assert.deepEqual(lesson.json.state, { completed: false, completedAt: null, videoUrl: '', videoPosition: 0, knowledgeId: null });

    const last = await s.api('GET', 'courses/robotics/lessons/mobile-kinematics');
    assert.equal(last.json.module.project.title, 'Precise driving challenge', 'the last lesson of a module shows its project');

    assert.equal((await s.api('GET', 'courses/nope')).status, 404);
    assert.equal((await s.api('GET', 'courses/robotics/lessons/nope')).status, 404);
  });

  it('records completion and moves "next" forward', async () => {
    const done = await s.api('PUT', 'courses/robotics/lessons/what-is-a-robot', { completed: true });
    assert.equal(done.status, 200);
    assert.equal(done.json.completed, true);
    const list = (await s.api('GET', 'courses')).json[0];
    assert.equal(list.completed, 1);
    assert.equal(list.started, true);
    assert.equal(list.next.id, 'types-of-robots');

    const undo = await s.api('PUT', 'courses/robotics/lessons/what-is-a-robot', { completed: false });
    assert.equal(undo.json.completed, false);
    assert.equal((await s.api('PUT', 'courses/robotics/lessons/what-is-a-robot', { completed: 'yes' })).status, 400);
    assert.equal((await s.api('PUT', 'courses/robotics/lessons/what-is-a-robot', {})).status, 400);
  });

  it('attaches, validates and clears a lecture video, and remembers the position', async () => {
    const path = 'courses/robotics/lessons/types-of-robots';
    const set = await s.api('PUT', path, { videoUrl: 'https://youtu.be/abcdefghijk' });
    assert.equal(set.status, 200);
    assert.equal(set.json.videoUrl, 'https://youtu.be/abcdefghijk');
    assert.equal((await s.api('PUT', path, { videoPosition: 125.4 })).json.videoPosition, 125);
    assert.equal((await s.api('PUT', path, { videoPosition: -1 })).status, 400);
    const syllabus = (await s.api('GET', 'courses/robotics')).json;
    assert.equal(syllabus.moduleList[0].lessons[1].hasVideo, true);

    const bad = await s.api('PUT', path, { videoUrl: 'javascript:alert(1)' });
    assert.equal(bad.status, 400);
    assert.equal((await s.api('GET', `${path}`)).json.state.videoUrl, 'https://youtu.be/abcdefghijk', 'a rejected link changes nothing');

    const cleared = await s.api('PUT', path, { videoUrl: '' });
    assert.equal(cleared.json.videoUrl, '');
    assert.equal(cleared.json.videoPosition, 0);
  });

  it('saves a lesson to the Knowledge Library once, and again after the record is deleted', async () => {
    const path = 'courses/robotics/lessons/sensor-fusion/save';
    const first = await s.api('POST', path);
    assert.equal(first.status, 201);
    assert.equal(first.json.created, true);
    const record = (await s.api('GET', `knowledge/${first.json.id}`)).json;
    assert.equal(record.title, 'Filtering and sensor fusion');
    assert.equal(record.category, 'Robotics');
    assert.ok(record.what_is_it && record.why_needed && record.how_it_works && record.real_example && record.exercise);
    assert.ok(record.tags.includes('robotics'));

    const again = await s.api('POST', path);
    assert.deepEqual(again.json, { id: first.json.id, created: false });

    await s.api('DELETE', `knowledge/${first.json.id}`);
    assert.equal((await s.api('GET', 'courses/robotics/lessons/sensor-fusion')).json.state.knowledgeId, null);
    const third = await s.api('POST', path);
    assert.equal(third.json.created, true);
    assert.notEqual(third.json.id, first.json.id);
  });

  it('lists only playable files in the media folder', async () => {
    const res = await s.api('GET', 'media');
    assert.deepEqual(res.json, [{ name: 'lecture 1.mp4', url: '/media/lecture%201.mp4', size: 1000 }]);
  });
});

describe('video serving', () => {
  let s;
  before(async () => {
    s = await startServer();
  });
  after(() => s.close());

  it('serves whole files with Accept-Ranges and the right type', async () => {
    const res = await s.raw('GET', '/media/lecture%201.mp4');
    assert.equal(res.status, 200);
    assert.equal(res.headers['content-type'], 'video/mp4');
    assert.equal(res.headers['accept-ranges'], 'bytes');
    assert.equal(Number(res.headers['content-length']), 1000);
    assert.deepEqual(res.buffer, VIDEO);
  });

  it('answers byte ranges the way iPhone Safari requests them', async () => {
    const probe = await s.raw('GET', '/media/lecture%201.mp4', { headers: { Range: 'bytes=0-1' } });
    assert.equal(probe.status, 206);
    assert.equal(probe.headers['content-range'], 'bytes 0-1/1000');
    assert.deepEqual(probe.buffer, VIDEO.subarray(0, 2));

    const middle = await s.raw('GET', '/media/lecture%201.mp4', { headers: { Range: 'bytes=500-' } });
    assert.equal(middle.headers['content-range'], 'bytes 500-999/1000');
    assert.deepEqual(middle.buffer, VIDEO.subarray(500));

    const suffix = await s.raw('GET', '/media/lecture%201.mp4', { headers: { Range: 'bytes=-100' } });
    assert.deepEqual(suffix.buffer, VIDEO.subarray(900));

    const beyond = await s.raw('GET', '/media/lecture%201.mp4', { headers: { Range: 'bytes=5000-' } });
    assert.equal(beyond.status, 416);
    assert.equal(beyond.headers['content-range'], 'bytes */1000');
  });

  it('never serves anything outside the media folder or that is not a video', async () => {
    for (const path of ['/media/notes.txt', '/media/..%2Fvideos%2Fnotes.txt', '/media/%2e%2e%2facademy.db', '/media/missing.mp4']) {
      assert.equal((await s.raw('GET', path)).status, 404, path);
    }
  });

  it('requires sign-in for personal videos when a password is set', async () => {
    const locked = await startServer({ auth: createAuth({ password: 'correct horse battery' }) });
    try {
      assert.equal((await locked.raw('GET', '/media/lecture%201.mp4')).status, 401);
      assert.equal((await locked.api('GET', 'courses')).status, 401);
    } finally {
      await locked.close();
    }
  });
});

describe('installable app', () => {
  let s;
  before(async () => {
    s = await startServer();
  });
  after(() => s.close());

  it('serves the manifest, service worker and icons with the right types', async () => {
    const manifest = await s.raw('GET', '/manifest.webmanifest');
    assert.equal(manifest.status, 200);
    assert.match(manifest.headers['content-type'], /^application\/manifest\+json/);
    assert.equal(manifest.json.display, 'standalone');
    assert.equal(manifest.json.start_url, '/');

    const sw = await s.raw('GET', '/sw.js');
    assert.equal(sw.status, 200);
    assert.match(sw.headers['content-type'], /javascript/);
    assert.equal(sw.headers['service-worker-allowed'], '/');
    assert.equal(sw.headers['cache-control'], 'no-cache', 'browsers must always check for a new service worker');

    for (const icon of ['/icons/apple-touch-icon.png', '/apple-touch-icon.png', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png']) {
      const res = await s.raw('GET', icon);
      assert.equal(res.status, 200, icon);
      assert.equal(res.headers['content-type'], 'image/png', icon);
    }
  });

  it('allows embedded lecture players and video files, and nothing else new', async () => {
    const csp = (await s.raw('GET', '/')).headers['content-security-policy'];
    assert.match(csp, /default-src 'self'/);
    assert.match(csp, /frame-src https:\/\/www\.youtube-nocookie\.com https:\/\/player\.vimeo\.com/);
    assert.match(csp, /media-src 'self' https:/);
    assert.doesNotMatch(csp, /script-src|unsafe-inline|unsafe-eval/);
    assert.match(csp, /frame-ancestors 'none'/);
  });

  it('declares iPhone home-screen support in the page', async () => {
    const html = (await s.raw('GET', '/')).buffer.toString();
    assert.match(html, /<link rel="manifest" href="\/manifest\.webmanifest"/);
    assert.match(html, /<link rel="apple-touch-icon" href="\/icons\/apple-touch-icon\.png"/);
    assert.match(html, /name="apple-mobile-web-app-capable" content="yes"/);
    assert.match(html, /name="apple-mobile-web-app-title" content="Eng Academy"/);
    assert.match(html, /viewport-fit=cover/);
  });
});

describe('Project Structure & File Literacy course', () => {
  const lessons = PROJECT_STRUCTURE.modules.flatMap((m) => m.lessons);
  const topic = (id) => PROJECT_STRUCTURE.modules.find((m) => m.id === id);

  it('is registered after Robotics Engineering, with its Korean title', () => {
    assert.ok(TRACKS.includes(PROJECT_STRUCTURE));
    assert.equal(PROJECT_STRUCTURE.title, 'Project Structure & File Literacy');
    assert.equal(PROJECT_STRUCTURE.titleKo, '프로젝트 구조와 파일 이해');
    assert.equal(TRACKS[0].id, 'robotics', 'the existing course keeps its position');
  });

  it('has the seven modules in the requested order', () => {
    assert.deepEqual(
      PROJECT_STRUCTURE.modules.map((m) => m.id),
      ['anatomy', 'folder-roles', 'file-types', 'configuration', 'backend', 'frontend', 'reading-lab'],
    );
  });

  it('covers every requested topic in its own lesson', () => {
    const has = (id, ...words) => {
      const titles = topic(id).lessons.map((l) => l.title.toLowerCase());
      for (const w of words) assert.ok(titles.some((t) => t.includes(w.toLowerCase())), `${id} is missing "${w}"`);
    };
    has('anatomy', 'project vs repository', 'folder vs directory', 'file and file extension', 'file path', 'root directory', 'source code vs resources');
    has('folder-roles', 'src', 'main', 'test', 'static', 'templates', 'config', 'resources', 'build', 'target', 'dist', 'static vs templates vs config');
    has('file-types', '.java', '.html', '.css', '.js', '.json', '.xml', '.yml', '.properties', '.gradle', '.md', '.env', '.gitignore', 'dockerfile');
    has('configuration', 'application.properties', 'application.yml', 'build.gradle', 'environment variables', 'development vs production');
    has('backend', 'controller', 'service', 'repository', 'entity', 'dto', 'relationships');
    has('frontend', 'html', 'templates', 'static resources', 'css', 'javascript', 'components', 'frontend and backend');
    has('reading-lab', 'explore a real github', 'folder responsibilities', 'individual files', 'file dependencies', 'browser to backend', 'architecture map');
  });

  it('gives every lesson the six questions, in order, each with content', () => {
    const headings = [/무엇인가/, /왜 존재/, /위치/, /없으면/, /연결/, /실제 프로젝트/];
    for (const l of lessons) {
      assert.equal(l.sections.length, 6, `${l.id} has six sections`);
      l.sections.forEach((s, i) => {
        assert.match(s.heading, headings[i], `${l.id} section ${i + 1}`);
        assert.ok(s.body.trim().length >= 30, `${l.id}: "${s.heading}" has a real answer`);
      });
    }
  });

  it('gives every lesson key terms, a Korean explanation, an exercise and knowledge checks', () => {
    for (const l of lessons) {
      assert.ok(l.keyTerms.length >= 1, `${l.id} has key terms`);
      assert.ok(l.practice.trim().length > 20, `${l.id} has an exercise`);
      assert.ok(l.knowledgeCheck.length >= 2, `${l.id} has knowledge checks`);
      for (const c of l.knowledgeCheck) assert.ok(c.q && c.a, `${l.id} check is complete`);
      assert.match(l.sections.map((s) => s.body).join(' '), /[가-힣]/, `${l.id} is explained in Korean`);
    }
  });

  it('has unique lesson ids and a hands-on project per module', () => {
    const ids = lessons.map((l) => l.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const m of PROJECT_STRUCTURE.modules) assert.ok(m.project?.title && m.project.deliverables.length >= 2, `${m.id} has a project`);
  });

  it('keeps the static, templates and config comparison as its own lesson', () => {
    const cmp = lessons.find((l) => l.id === 'static-vs-templates-vs-config');
    assert.ok(cmp, 'comparison lesson exists');
    assert.match(cmp.title, /static vs templates vs config/);
  });

  it('serves the course through the courses API and keeps progress separate per course', async () => {
    const s = await startServer();
    try {
      const list = (await s.api('GET', 'courses')).json;
      assert.equal(list[0].id, 'robotics');
      const pst = list.find((c) => c.id === 'project-structure');
      assert.equal(pst.titleKo, '프로젝트 구조와 파일 이해');
      assert.equal(pst.lessons, 54);
      const lesson = await s.api('GET', 'courses/project-structure/lessons/folder-templates');
      assert.equal(lesson.status, 200);
      assert.equal(lesson.json.knowledgeCheck.length, 2);
      assert.equal((await s.api('PUT', 'courses/project-structure/lessons/folder-src', { completed: true })).json.completed, true);
      assert.equal((await s.api('GET', 'courses/robotics/lessons/what-is-a-robot')).json.state.completed, false, 'other courses are unaffected');
    } finally {
      await s.close();
    }
  });
});
