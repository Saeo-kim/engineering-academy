import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NotFoundError, ValidationError } from './repository.js';
import { isKind } from './resources.js';

const PUBLIC_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../public');
const MAX_BODY_BYTES = 2 * 1024 * 1024;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
};

const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function send(res, status, body) {
  const payload = body === undefined ? '' : JSON.stringify(body);
  res.writeHead(status, {
    ...SECURITY_HEADERS,
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
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

// Binding to loopback is not enough: a malicious website can still reach
// localhost through the visitor's browser. Rejecting foreign Host headers stops
// DNS rebinding, and rejecting foreign Origins stops cross-site writes.
function guardRequest(req) {
  const allowedHost = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i;
  const host = req.headers.host ?? '';
  if (!allowedHost.test(host)) throw new HttpError(403, 'Forbidden host.');
  const origin = req.headers.origin;
  if (origin && req.method !== 'GET') {
    let originHost = '';
    try {
      originHost = new URL(origin).host;
    } catch {
      /* falls through to the rejection below */
    }
    if (originHost !== host) throw new HttpError(403, 'Forbidden origin.');
  }
}

function serveStatic(req, res, pathname) {
  const relative = pathname === '/' ? 'index.html' : decodeURIComponent(pathname).replace(/^\/+/, '');
  const file = resolve(PUBLIC_DIR, relative);
  const insidePublic = file === PUBLIC_DIR || file.startsWith(PUBLIC_DIR + sep);
  if (!insidePublic || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain' });
    return res.end('Not found');
  }
  res.writeHead(200, {
    ...SECURITY_HEADERS,
    'Content-Type': MIME[extname(file)] ?? 'application/octet-stream',
    'Cache-Control': 'no-cache',
  });
  if (req.method === 'HEAD') return res.end();
  createReadStream(file).pipe(res);
}

function parseId(value) {
  if (!/^\d+$/.test(value)) throw new NotFoundError('Record not found.');
  return Number(value);
}

async function routeApi(repo, req, res, url) {
  const parts = url.pathname.split('/').filter(Boolean).slice(1); // drop "api"
  const { method } = req;
  const query = Object.fromEntries(url.searchParams);

  if (parts.length === 1) {
    const [name] = parts;
    if (name === 'meta' && method === 'GET') return send(res, 200, repo.meta());
    if (name === 'dashboard' && method === 'GET') return send(res, 200, repo.dashboard());
    if (name === 'options' && method === 'GET') return send(res, 200, repo.options());
    if (name === 'search' && method === 'GET') return send(res, 200, repo.search(query.q ?? ''));
    if (name === 'capture' && method === 'POST') return send(res, 201, repo.capture(await readJson(req)));
    if (name === 'samples' && method === 'DELETE') return send(res, 200, { removed: repo.removeSamples() });
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

export function createApp(repo) {
  return createServer(async (req, res) => {
    try {
      guardRequest(req);
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
        return await routeApi(repo, req, res, url);
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') throw new HttpError(405, 'Method not allowed.');
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
