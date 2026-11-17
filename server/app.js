import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { gzipSync } from 'node:zlib';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApiContext, errorReply, guardRequest, handleApi, hostMatcher, HttpError, MAX_BODY_BYTES, SECURITY_HEADERS } from './api.js';
import { MEDIA_NAME, MEDIA_TYPES } from './courses.js';

const PUBLIC_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../public');

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

// Streams a file, honouring a single HTTP Range. iPhone Safari will not play
// video from a server that ignores Range requests, and seeking needs it too.
const COMPRESSIBLE = /^(text\/|application\/(json|manifest\+json)|image\/svg)/;
const gzipCache = new Map(); // file → { etag, body }, so each version is compressed once

function sendFile(req, res, file, headers = {}) {
  const { size, mtimeMs } = statSync(file);
  const etag = `"${size.toString(36)}-${Math.floor(mtimeMs).toString(36)}"`;
  const type = MIME[extname(file).toLowerCase()] ?? 'application/octet-stream';
  const base = {
    ...SECURITY_HEADERS,
    'Content-Type': type,
    'Accept-Ranges': 'bytes',
    ETag: etag,
    Vary: 'Accept-Encoding',
    ...headers,
  };
  // Unchanged since the browser's copy: answer in a few bytes.
  if (req.headers['if-none-match'] === etag && !req.headers.range) {
    res.writeHead(304, base);
    return res.end();
  }
  if (COMPRESSIBLE.test(type) && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '') && !req.headers.range) {
    let entry = gzipCache.get(file);
    if (entry?.etag !== etag) {
      entry = { etag, body: gzipSync(readFileSync(file)) };
      gzipCache.set(file, entry);
    }
    res.writeHead(200, { ...base, 'Content-Encoding': 'gzip', 'Content-Length': entry.body.length });
    return res.end(req.method === 'HEAD' ? undefined : entry.body);
  }
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
  // Files like _headers configure other hosts (Cloudflare) and are not content.
  const hidden = relative.split('/').some((part) => part.startsWith('_') || part.startsWith('.'));
  if (!insidePublic || hidden || !existsSync(file) || !statSync(file).isFile()) return notFound(res);
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

export { hostMatcher };

export function createApp(repo, options = {}) {
  const mediaDir = options.mediaDir ?? null;
  const ctx = createApiContext(repo, { ...options, listMedia: () => listMedia(mediaDir) });
  const hostAllowed = hostMatcher(options.allowedHosts);

  return createServer(async (req, res) => {
    try {
      // Health checks come from the hosting platform's internal network with an
      // internal Host header. The endpoint reveals nothing, so it skips the guard.
      if (req.url === '/healthz' && req.method === 'GET') return send(res, 200, { ok: true });
      guardRequest(req, hostAllowed);
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
        req.json = () => readJson(req);
        const result = await handleApi(ctx, req, url);
        return send(res, result.status, result.body, result.headers);
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') throw new HttpError(405, 'Method not allowed.');
      if (url.pathname.startsWith('/media/')) {
        if (!ctx.auth.isAuthenticated(req)) throw new HttpError(401, 'Sign in to continue.');
        return serveMedia(req, res, url.pathname, mediaDir);
      }
      return serveStatic(req, res, url.pathname);
    } catch (err) {
      if (res.headersSent) return res.destroy();
      const result = errorReply(err);
      return send(res, result.status, result.body, result.headers);
    }
  });
}
