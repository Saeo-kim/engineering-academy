import { createReadStream, existsSync, readdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAuth } from './auth.js';
import { createCourses, MEDIA_NAME, MEDIA_TYPES } from './courses.js';
import { createEvaluator } from './evaluator.js';
import { createLearning } from './learning.js';
import { NotFoundError, ValidationError } from './repository.js';
import { isKind } from './resources.js';

const PUBLIC_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../public');
const MAX_BODY_BYTES = 2 * 1024 * 1024;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.vtt': 'text/vtt; charset=utf-8',
  ...MEDIA_TYPES,
};

// Lecture videos may be embedded from YouTube (privacy-enhanced domain) and
// Vimeo, or played from any https video file. Everything else stays 'self'.
const CSP = [
  "default-src 'self'",
  'frame-src https://www.youtube-nocookie.com https://player.vimeo.com',
  "media-src 'self' https:",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const SECURITY_HEADERS = {
  'Content-Security-Policy': CSP,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function send(res, status, body, headers = {}) {
  const payload = body === undefined ? '' : JSON.stringify(body);
  res.writeHead(status, {
    ...SECURITY_HEADERS,
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(payload);
}

function readJson(req) {
  if (!/^application\/json\b/i.test(req.headers['content-type'] ?? '')) {
    return Promise.reject(new HttpError(415, 'Content-Type must be application/json.'));
  }
  return new Promise((resolveBody, reject) => {
    const chunks = [];
    let size = 0;
    let tooLarge = false;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) tooLarge = true;
      else chunks.push(chunk);
    });
    req.on('error', reject);
    req.on('end', () => {
      if (tooLarge) return reject(new HttpError(413, 'Request is too large.'));
      try {
        resolveBody(JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null'));
      } catch {
        reject(new HttpError(400, 'Invalid JSON.'));
      }
    });
  });
}

const LOOPBACK = /^(localhost|127\.0\.0\.1|\[::1\])$/i;

// "example.com" matches exactly; "*.example.com" matches any subdomain.
export function hostMatcher(allowed = []) {
  const patterns = allowed.map((p) => p.trim().toLowerCase()).filter(Boolean);
  return (hostHeader) => {
    const host = String(hostHeader).toLowerCase().replace(/:\d+$/, '');
    if (LOOPBACK.test(host)) return true;
    return patterns.some((p) => (p.startsWith('*.') ? host.endsWith(p.slice(1)) && host.length > p.length - 1 : host === p));
  };
}

// Binding to loopback is not enough: a malicious website can still reach
// localhost through the visitor's browser. Rejecting foreign Host headers stops
// DNS rebinding, and rejecting foreign Origins stops cross-site writes.
function guardRequest(req, hostAllowed) {
  const host = req.headers.host ?? '';
  if (!/^[a-z0-9.\-[\]:]+$/i.test(host) || !hostAllowed(host)) throw new HttpError(403, 'Forbidden host.');
  const origin = req.headers.origin;
  if (origin && req.method !== 'GET' && req.method !== 'HEAD') {
    let originHost = '';
    try {
      originHost = new URL(origin).host;
    } catch {
      /* falls through to the rejection below */
    }
    if (originHost.toLowerCase() !== host.toLowerCase()) throw new HttpError(403, 'Forbidden origin.');
  }
}

// Streams a file, honouring a single HTTP Range. iPhone Safari will not play
// video from a server that ignores Range requests, and seeking needs it too.
function sendFile(req, res, file, headers = {}) {
  const { size } = statSync(file);
  const base = {
    ...SECURITY_HEADERS,
    'Content-Type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream',
    'Accept-Ranges': 'bytes',
    ...headers,
  };
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? '');
  if (range && (range[1] || range[2])) {
    let start;
    let end;
    if (range[1]) {
      start = Number(range[1]);
      end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    } else {
      start = Math.max(0, size - Number(range[2])); // suffix range: the last N bytes
      end = size - 1;
    }
    if (start >= size || start > end) {
      res.writeHead(416, { ...base, 'Content-Range': `bytes */${size}` });
      return res.end();
    }
    res.writeHead(206, { ...base, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
    if (req.method === 'HEAD') return res.end();
    return createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { ...base, 'Content-Length': size });
  if (req.method === 'HEAD') return res.end();
  createReadStream(file).pipe(res);
}

function notFound(res) {
  res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain' });
  return res.end('Not found');
}

function serveStatic(req, res, pathname) {
  const relative = pathname === '/' ? 'index.html' : decodeURIComponent(pathname).replace(/^\/+/, '');
  const file = resolve(PUBLIC_DIR, relative);
  const insidePublic = file === PUBLIC_DIR || file.startsWith(PUBLIC_DIR + sep);
  if (!insidePublic || !existsSync(file) || !statSync(file).isFile()) return notFound(res);
  // The service worker must be able to control the whole site from /sw.js.
  const extra = relative === 'sw.js' ? { 'Service-Worker-Allowed': '/' } : {};
  return sendFile(req, res, file, { 'Cache-Control': 'no-cache', ...extra });
}

// Lecture videos you host yourself: files placed in the media folder
// (data/videos by default). They are personal, so they require sign-in.
function serveMedia(req, res, pathname, mediaDir) {
  let name;
  try {
    name = decodeURIComponent(pathname.slice('/media/'.length));
  } catch {
    return notFound(res);
  }
  if (!mediaDir || !MEDIA_NAME.test(name)) return notFound(res);
  const file = resolve(mediaDir, name);
  if (!file.startsWith(resolve(mediaDir) + sep) || !existsSync(file) || !statSync(file).isFile()) return notFound(res);
  return sendFile(req, res, file, { 'Cache-Control': 'private, max-age=3600' });
}

function listMedia(mediaDir) {
  if (!mediaDir || !existsSync(mediaDir)) return [];
  return readdirSync(mediaDir)
    .filter((name) => MEDIA_NAME.test(name) && statSync(join(mediaDir, name)).isFile())
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ name, url: `/media/${encodeURIComponent(name)}`, size: statSync(join(mediaDir, name)).size }));
}

function parseId(value) {
  if (!/^\d+$/.test(value ?? '')) throw new NotFoundError('Record not found.');
  return Number(value);
}

async function routeApi(ctx, req, res, url) {
  const { repo, learning, auth, evaluator, courses } = ctx;
  const parts = url.pathname.split('/').filter(Boolean).slice(1); // drop "api"
  const { method } = req;
  const query = Object.fromEntries(url.searchParams);
  const route = parts.join('/');

  // Session endpoints are reachable without signing in.
  if (route === 'session' && method === 'GET') {
    return send(res, 200, { authRequired: auth.enabled, authenticated: auth.isAuthenticated(req) });
  }
  if (route === 'login' && method === 'POST') {
    if (!auth.enabled) return send(res, 200, { ok: true });
    try {
      const cookie = auth.login(req, await readJson(req));
      return send(res, 200, { ok: true }, { 'Set-Cookie': cookie });
    } catch (err) {
      if (err.status) throw new HttpError(err.status, err.message);
      throw err;
    }
  }
  if (route === 'logout' && method === 'POST') {
    return send(res, 200, { ok: true }, auth.enabled ? { 'Set-Cookie': auth.logout(req) } : {});
  }
  if (!auth.isAuthenticated(req)) throw new HttpError(401, 'Sign in to continue.');

  if (parts.length === 1) {
    const [name] = parts;
    if (name === 'meta' && method === 'GET') {
      return send(res, 200, { ...repo.meta(), evaluator: { id: evaluator.id, label: evaluator.label, description: evaluator.description, ai: evaluator.ai }, authEnabled: auth.enabled });
    }
    if (name === 'dashboard' && method === 'GET') return send(res, 200, { ...repo.dashboard(), learning: learning.summary() });
    if (name === 'options' && method === 'GET') return send(res, 200, repo.options());
    if (name === 'search' && method === 'GET') return send(res, 200, repo.search(query.q ?? ''));
    if (name === 'capture' && method === 'POST') return send(res, 201, repo.capture(await readJson(req)));
    if (name === 'samples' && method === 'DELETE') return send(res, 200, { removed: repo.removeSamples() });
    if (name === 'review' && method === 'GET') return send(res, 200, learning.reviewQueue());
    if (name === 'progress' && method === 'GET') return send(res, 200, learning.progress());
    if (name === 'map' && method === 'GET') return send(res, 200, learning.map());
    if (name === 'links' && method === 'POST') return send(res, 201, learning.addLink(await readJson(req)));
    if (name === 'links' && method === 'DELETE') return send(res, 200, learning.removeLink(await readJson(req)));
    if (name === 'quizzes' && method === 'GET') return send(res, 200, learning.quizHistory());
    if (name === 'quizzes' && method === 'POST') return send(res, 201, learning.createQuiz(await readJson(req)));
    if (name === 'courses' && method === 'GET') return send(res, 200, courses.list());
    if (name === 'media' && method === 'GET') return send(res, 200, listMedia(ctx.mediaDir));
  }

  // Courses: /courses/:track, /courses/:track/lessons/:lesson[/save]
  if (parts[0] === 'courses' && parts.length >= 2) {
    const [, trackId, sub, lessonId, action] = parts;
    if (parts.length === 2 && method === 'GET') return send(res, 200, courses.track(trackId));
    if (sub === 'lessons' && lessonId) {
      if (parts.length === 4 && method === 'GET') return send(res, 200, courses.lesson(trackId, lessonId));
      if (parts.length === 4 && method === 'PUT') return send(res, 200, courses.updateLesson(trackId, lessonId, await readJson(req)));
      if (parts.length === 5 && action === 'save' && method === 'POST') return send(res, 201, courses.saveToLibrary(trackId, lessonId));
    }
  }

  if (parts[0] === 'quizzes' && parts.length === 2 && method === 'GET') return send(res, 200, learning.getQuiz(parseId(parts[1])));
  if (parts[0] === 'quizzes' && parts.length === 3 && parts[2] === 'submit' && method === 'POST') {
    return send(res, 200, learning.submitQuiz(parseId(parts[1]), await readJson(req)));
  }
  if (parts[0] === 'attempts' && parts.length === 3 && parts[2] === 'rating' && method === 'POST') {
    return send(res, 200, learning.rateAttempt(parseId(parts[1]), await readJson(req)));
  }
  if ((parts[0] === 'learn' || parts[0] === 'review') && isKind(parts[1])) {
    const id = parseId(parts[2]);
    if (parts[0] === 'learn' && parts.length === 3 && method === 'GET') return send(res, 200, learning.state(parts[1], id));
    if (parts[0] === 'learn' && parts.length === 4 && parts[3] === 'attempts' && method === 'POST') {
      return send(res, 201, learning.attempt(parts[1], id, await readJson(req)));
    }
    if (parts[0] === 'review' && parts.length === 3 && method === 'POST') return send(res, 200, learning.review(parts[1], id, await readJson(req)));
  }

  const [kind, rawId, action] = parts;
  if (isKind(kind)) {
    if (parts.length === 1) {
      if (method === 'GET') return send(res, 200, repo.list(kind, query));
      if (method === 'POST') return send(res, 201, repo.create(kind, await readJson(req)));
    }
    if (parts.length === 2) {
      const id = parseId(rawId);
      if (method === 'GET') return send(res, 200, repo.get(kind, id));
      if (method === 'PUT') return send(res, 200, repo.update(kind, id, await readJson(req)));
      if (method === 'DELETE') {
        repo.remove(kind, id);
        return send(res, 200, { ok: true });
      }
    }
    if (parts.length === 3 && action === 'study' && method === 'POST') {
      return send(res, 200, repo.markStudied(kind, parseId(rawId)));
    }
  }
  throw new HttpError(404, 'Unknown API route.');
}

export function createApp(repo, options = {}) {
  const evaluator = options.evaluator ?? createEvaluator();
  const ctx = {
    repo,
    evaluator,
    learning: options.learning ?? createLearning(repo, evaluator),
    auth: options.auth ?? createAuth(),
    courses: options.courses ?? createCourses(repo),
    mediaDir: options.mediaDir ?? null,
  };
  const hostAllowed = hostMatcher(options.allowedHosts);

  return createServer(async (req, res) => {
    try {
      guardRequest(req, hostAllowed);
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === '/healthz') return send(res, 200, { ok: true });
      if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
        return await routeApi(ctx, req, res, url);
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') throw new HttpError(405, 'Method not allowed.');
      if (url.pathname.startsWith('/media/')) {
        if (!ctx.auth.isAuthenticated(req)) throw new HttpError(401, 'Sign in to continue.');
        return serveMedia(req, res, url.pathname, ctx.mediaDir);
      }
      return serveStatic(req, res, url.pathname);
    } catch (err) {
      if (res.headersSent) return res.destroy();
      if (err instanceof ValidationError) return send(res, 400, { error: err.message });
      if (err instanceof NotFoundError) return send(res, 404, { error: err.message });
      if (err instanceof HttpError) return send(res, err.status, { error: err.message });
      if (err instanceof URIError) return send(res, 400, { error: 'Malformed URL.' });
      console.error(err);
      return send(res, 500, { error: 'Something went wrong on the server.' });
    }
  });
}
