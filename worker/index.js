// Engineering Academy on Cloudflare: static files from the edge, API in a
// single Durable Object that owns the SQLite database.
//
//   iPhone ──► Cloudflare edge (nearest city)
//                ├─ /index.html, /js, /css, /icons ... ► static assets (CDN cache)
//                └─ /api/* ► Worker ► Durable Object "academy" (SQLite, durable)
//
// The Durable Object runs exactly the same API code as the Node server
// (server/api.js), so features, validation and security rules are identical.

import { DurableObject } from 'cloudflare:workers';
import { createApiContext, errorReply, guardRequest, handleApi, hostMatcher, HttpError, MAX_BODY_BYTES, parseJsonBody, SECURITY_HEADERS } from '../server/api.js';
import { createAuth } from '../server/auth.js';
import { createRepository } from '../server/repository.js';
import { seedIfFirstRun } from '../server/seed.js';
import { installCurriculum } from '../server/curriculum.js';
import { durableDatabase, migrate } from './sqlite.js';
import { STATIC_FILES } from './static.generated.js';
import { CSP } from '../server/api.js';

// Static files come from the bundle (worker/static.generated.js), with the same
// rules as public/_headers: strict CSP, and no caching of the service worker.
const decoded = new Map();
function staticResponse(pathname) {
  const key = pathname === '/' ? '/index.html' : pathname;
  const file = STATIC_FILES[key];
  if (!file) return null;
  let bytes = decoded.get(key);
  if (!bytes) {
    const binary = atob(file.base64);
    bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    decoded.set(key, bytes);
  }
  const headers = {
    'Content-Type': file.type,
    'Content-Security-Policy': CSP,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Cache-Control': 'no-cache',
  };
  if (pathname === '/sw.js') headers['Service-Worker-Allowed'] = '/';
  return new Response(bytes, { headers });
}

function toResponse({ status, body, headers = {} }) {
  return new Response(body === undefined ? '' : JSON.stringify(body), {
    status,
    headers: { ...SECURITY_HEADERS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}

export class Academy extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    migrate(ctx.storage);
    const repo = createRepository(durableDatabase(ctx.storage));
    if (env.ACADEMY_SEED !== 'false') seedIfFirstRun(repo);
    // Study curriculum: installed once per database, like the Node server does.
    if (env.ACADEMY_SEED !== 'false') installCurriculum(repo);
    this.api = createApiContext(repo, {
      // Every response is HTTPS, and CF-Connecting-IP is set by Cloudflare
      // itself, so it is safe to trust for per-client sign-in rate limiting.
      auth: createAuth({ password: env.ACADEMY_PASSWORD, secret: env.ACADEMY_SESSION_SECRET, secureCookies: true, trustProxy: true }),
    });
  }

  async fetch(request) {
    const url = new URL(request.url);
    const headers = Object.fromEntries(request.headers);
    const text = request.method === 'GET' || request.method === 'HEAD' ? '' : await request.text();
    const req = {
      method: request.method,
      headers,
      socket: { remoteAddress: headers['cf-connecting-ip'] ?? '' },
      json: async () => parseJsonBody(headers['content-type'], text),
    };
    return toResponse(await handleApi(this.api, req, url));
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/healthz') return toResponse({ status: 200, body: { ok: true } });
    const isApi = url.pathname === '/api' || url.pathname.startsWith('/api/');
    if (!isApi && !url.pathname.startsWith('/media/')) {
      const found = staticResponse(url.pathname);
      return found ?? new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
    }

    // Never run an unprotected deployment: no password, no data.
    if ((env.ACADEMY_PASSWORD ?? '').length < 12 || !env.ACADEMY_SESSION_SECRET) {
      return toResponse({ status: 503, body: { error: 'This deployment is not configured yet: set the ACADEMY_PASSWORD and ACADEMY_SESSION_SECRET secrets.' } });
    }
    // Self-hosted video files need a disk; the cloud version uses video links.
    if (!isApi) return toResponse({ status: 404, body: { error: 'Not found.' } });
    try {
      guardRequest({ method: request.method, headers: Object.fromEntries(request.headers) }, hostMatcher([url.hostname]));
      if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) throw new HttpError(413, 'Request is too large.');
    } catch (err) {
      return toResponse(errorReply(err));
    }
    // One Durable Object holds the whole (single-user) database. The location
    // hint only matters the first time it is created.
    const id = env.ACADEMY.idFromName('academy');
    const stub = env.ACADEMY.get(id, env.ACADEMY_LOCATION_HINT ? { locationHint: env.ACADEMY_LOCATION_HINT } : undefined);
    return stub.fetch(request);
  },
};
