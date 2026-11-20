// The JSON API, independent of any HTTP server. Node (server/app.js) and the
// Cloudflare Worker (worker/index.js) both adapt their requests to this.
//
// A request is { method, headers, socket: { remoteAddress }, json() }, with
// lower-case header names. A response is { status, body, headers }.

import { createAuth } from './auth.js';
import { curriculum } from './curriculum.js';
import { createCourses } from './courses.js';
import { createEvaluator } from './evaluator.js';
import { createLearning } from './learning.js';
import { NotFoundError, ValidationError } from './repository.js';
import { isKind } from './resources.js';

export const MAX_BODY_BYTES = 2 * 1024 * 1024;

// Lecture videos may be embedded from YouTube (privacy-enhanced domain) and
// Vimeo, or played from any https video file. Everything else stays 'self'.
export const CSP = [
  "default-src 'self'",
  'frame-src https://www.youtube-nocookie.com https://player.vimeo.com',
  "media-src 'self' https:",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

export const SECURITY_HEADERS = {
  'Content-Security-Policy': CSP,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
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
export function guardRequest(req, hostAllowed) {
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

const reply = (status, body, headers = {}) => ({ status, body, headers });

export function parseId(value) {
  if (!/^\d+$/.test(value ?? '')) throw new NotFoundError('Record not found.');
  return Number(value);
}

async function routeApi(ctx, req, url) {
  const { repo, learning, auth, evaluator, courses } = ctx;
  const parts = url.pathname.split('/').filter(Boolean).slice(1); // drop "api"
  const { method } = req;
  const query = Object.fromEntries(url.searchParams);
  const route = parts.join('/');

  // Session endpoints are reachable without signing in.
  if (route === 'session' && method === 'GET') {
    return reply(200, { authRequired: auth.enabled, authenticated: auth.isAuthenticated(req) });
  }
  if (route === 'login' && method === 'POST') {
    if (!auth.enabled) return reply(200, { ok: true });
    try {
      const cookie = auth.login(req, await req.json());
      return reply(200, { ok: true }, { 'Set-Cookie': cookie });
    } catch (err) {
      if (err.status) throw new HttpError(err.status, err.message);
      throw err;
    }
  }
  if (route === 'logout' && method === 'POST') {
    return reply(200, { ok: true }, auth.enabled ? { 'Set-Cookie': auth.logout(req) } : {});
  }
  if (!auth.isAuthenticated(req)) throw new HttpError(401, 'Sign in to continue.');

  if (parts.length === 1) {
    const [name] = parts;
    if (name === 'meta' && method === 'GET') {
      return reply(200, { ...repo.meta(), evaluator: { id: evaluator.id, label: evaluator.label, description: evaluator.description, ai: evaluator.ai }, authEnabled: auth.enabled });
    }
    if (name === 'dashboard' && method === 'GET') return reply(200, { ...repo.dashboard(), learning: learning.summary() });
    if (name === 'options' && method === 'GET') return reply(200, repo.options());
    if (name === 'search' && method === 'GET') return reply(200, repo.search(query.q ?? ''));
    if (name === 'capture' && method === 'POST') return reply(201, repo.capture(await req.json()));
    if (name === 'samples' && method === 'DELETE') return reply(200, { removed: repo.removeSamples() });
    if (name === 'review' && method === 'GET') return reply(200, learning.reviewQueue());
    if (name === 'progress' && method === 'GET') return reply(200, learning.progress());
    if (name === 'curriculum' && method === 'GET') return reply(200, curriculum(repo, learning));
    if (name === 'map' && method === 'GET') return reply(200, learning.map());
    if (name === 'links' && method === 'POST') return reply(201, learning.addLink(await req.json()));
    if (name === 'links' && method === 'DELETE') return reply(200, learning.removeLink(await req.json()));
    if (name === 'quizzes' && method === 'GET') return reply(200, learning.quizHistory());
    if (name === 'quizzes' && method === 'POST') return reply(201, learning.createQuiz(await req.json()));
    if (name === 'courses' && method === 'GET') return reply(200, courses.list());
    if (name === 'media' && method === 'GET') return reply(200, ctx.listMedia ? ctx.listMedia() : []);
  }

  // Courses: /courses/:track, /courses/:track/lessons/:lesson[/save]
  if (parts[0] === 'courses' && parts.length >= 2) {
    const [, trackId, sub, lessonId, action] = parts;
    if (parts.length === 2 && method === 'GET') return reply(200, courses.track(trackId));
    if (sub === 'lessons' && lessonId) {
      if (parts.length === 4 && method === 'GET') return reply(200, courses.lesson(trackId, lessonId));
      if (parts.length === 4 && method === 'PUT') return reply(200, courses.updateLesson(trackId, lessonId, await req.json()));
      if (parts.length === 5 && action === 'save' && method === 'POST') return reply(201, courses.saveToLibrary(trackId, lessonId));
    }
  }

  if (parts[0] === 'quizzes' && parts.length === 2 && method === 'GET') return reply(200, learning.getQuiz(parseId(parts[1])));
  if (parts[0] === 'quizzes' && parts.length === 3 && parts[2] === 'submit' && method === 'POST') {
    return reply(200, learning.submitQuiz(parseId(parts[1]), await req.json()));
  }
  if (parts[0] === 'attempts' && parts.length === 3 && parts[2] === 'rating' && method === 'POST') {
    return reply(200, learning.rateAttempt(parseId(parts[1]), await req.json()));
  }
  if ((parts[0] === 'learn' || parts[0] === 'review') && isKind(parts[1])) {
    const id = parseId(parts[2]);
    if (parts[0] === 'learn' && parts.length === 3 && method === 'GET') return reply(200, learning.state(parts[1], id));
    if (parts[0] === 'learn' && parts.length === 4 && parts[3] === 'attempts' && method === 'POST') {
      return reply(201, learning.attempt(parts[1], id, await req.json()));
    }
    if (parts[0] === 'review' && parts.length === 3 && method === 'POST') return reply(200, learning.review(parts[1], id, await req.json()));
  }

  const [kind, rawId, action] = parts;
  if (isKind(kind)) {
    if (parts.length === 1) {
      if (method === 'GET') return reply(200, repo.list(kind, query));
      if (method === 'POST') return reply(201, repo.create(kind, await req.json()));
    }
    if (parts.length === 2) {
      const id = parseId(rawId);
      if (method === 'GET') return reply(200, repo.get(kind, id));
      if (method === 'PUT') return reply(200, repo.update(kind, id, await req.json()));
      if (method === 'DELETE') {
        repo.remove(kind, id);
        return reply(200, { ok: true });
      }
    }
    if (parts.length === 3 && action === 'study' && method === 'POST') {
      return reply(200, repo.markStudied(kind, parseId(rawId)));
    }
  }
  throw new HttpError(404, 'Unknown API route.');
}

// Heavy read-only screens are computed once and reused until something is
// written (any non-GET request) or a minute passes (due dates and "this week"
// depend on the clock). Safe because one process owns the database: the Node
// server, or the single Durable Object in the cloud.
const CACHEABLE = new Set(['dashboard', 'progress', 'map', 'review', 'courses', 'options']);
const CACHE_MS = 60_000;

function cachedRoute(ctx, req, url) {
  const route = url.pathname.slice('/api/'.length);
  if (req.method !== 'GET') {
    ctx.cache.clear();
    return null;
  }
  if (!CACHEABLE.has(route) && !route.startsWith('courses/robotics')) return null;
  const key = `${route}?${url.search}`;
  const hit = ctx.cache.get(key);
  return hit && Date.now() - hit.at < CACHE_MS ? { key, hit } : { key };
}

export function createApiContext(repo, options = {}) {
  const evaluator = options.evaluator ?? createEvaluator();
  return {
    cache: new Map(),
    repo,
    evaluator,
    learning: options.learning ?? createLearning(repo, evaluator),
    auth: options.auth ?? createAuth(),
    courses: options.courses ?? createCourses(repo),
    listMedia: options.listMedia ?? null,
  };
}

export function errorReply(err) {
  if (err instanceof ValidationError) return reply(400, { error: err.message });
  if (err instanceof NotFoundError) return reply(404, { error: err.message });
  if (err instanceof HttpError) return reply(err.status, { error: err.message });
  if (err instanceof URIError) return reply(400, { error: 'Malformed URL.' });
  console.error(err);
  return reply(500, { error: 'Something went wrong on the server.' });
}

// Runs one API request; never throws.
export async function handleApi(ctx, req, url) {
  try {
    const cached = ctx.auth.isAuthenticated(req) ? cachedRoute(ctx, req, url) : null;
    if (cached?.hit) return cached.hit.result;
    const result = await routeApi(ctx, req, url);
    if (cached && result.status === 200) ctx.cache.set(cached.key, { at: Date.now(), result });
    return result;
  } catch (err) {
    return errorReply(err);
  }
}

// Parses a JSON body that has already been read as text.
export function parseJsonBody(contentType, text) {
  if (!/^application\/json\b/i.test(contentType ?? '')) throw new HttpError(415, 'Content-Type must be application/json.');
  if (text.length > MAX_BODY_BYTES) throw new HttpError(413, 'Request is too large.');
  try {
    return JSON.parse(text || 'null');
  } catch {
    throw new HttpError(400, 'Invalid JSON.');
  }
}
