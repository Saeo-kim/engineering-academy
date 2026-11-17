// Optional password protection, required whenever the app is reachable from
// anything other than this computer (see server/config.js).
//
// Sessions are stateless signed cookies: "<expiresAt>.<hmac>". The signing key
// comes from ACADEMY_SESSION_SECRET, or is generated at startup (which signs
// everyone out on restart, an acceptable trade for a single-user app).

import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const COOKIE = 'ea_session';
const SESSION_MS = 30 * 86_400_000;
const WINDOW_MS = 15 * 60_000;
const MAX_FAILURES = 8;

const digest = (value) => createHash('sha256').update(String(value)).digest();

function safeEqual(a, b) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

export function createAuth({ password, secret, secureCookies = false, trustProxy = false } = {}) {
  if (!password) {
    return { enabled: false, isAuthenticated: () => true, login: () => null, logout: () => null, clientIp: () => '' };
  }
  const key = secret ? digest(secret) : randomBytes(32);
  const expected = digest(password);
  const failures = new Map();

  const sign = (expires) => createHmac('sha256', key).update(String(expires)).digest('base64url');

  function clientIp(req) {
    if (trustProxy) {
      const forwarded = req.headers['cf-connecting-ip'] ?? req.headers['x-forwarded-for']?.split(',')[0];
      if (forwarded) return String(forwarded).trim();
    }
    return req.socket.remoteAddress ?? '';
  }

  function isSecure(req) {
    return secureCookies || (trustProxy && req.headers['x-forwarded-proto'] === 'https');
  }

  function cookie(req, value, maxAgeSeconds) {
    return [`${COOKIE}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Strict', `Max-Age=${maxAgeSeconds}`, isSecure(req) && 'Secure']
      .filter(Boolean)
      .join('; ');
  }

  function isAuthenticated(req) {
    const token = parseCookies(req.headers.cookie)[COOKIE];
    if (!token) return false;
    const [expires, mac] = token.split('.');
    if (!/^\d+$/.test(expires ?? '') || !mac) return false;
    return Number(expires) > Date.now() && safeEqual(mac, sign(expires));
  }

  // Returns the Set-Cookie header on success; throws a status-carrying error on failure.
  function login(req, input) {
    const ip = clientIp(req);
    const nowMs = Date.now();
    const record = failures.get(ip);
    if (record && nowMs - record.first < WINDOW_MS && record.count >= MAX_FAILURES) {
      throw Object.assign(new Error('Too many failed attempts. Try again in a few minutes.'), { status: 429 });
    }
    const given = typeof input?.password === 'string' ? input.password : '';
    if (!timingSafeEqual(digest(given), expected)) {
      const fresh = !record || nowMs - record.first >= WINDOW_MS;
      failures.set(ip, { first: fresh ? nowMs : record.first, count: fresh ? 1 : record.count + 1 });
      throw Object.assign(new Error('Wrong password.'), { status: 401 });
    }
    failures.delete(ip);
    const expires = nowMs + SESSION_MS;
    return cookie(req, `${expires}.${sign(expires)}`, SESSION_MS / 1000);
  }

  const logout = (req) => cookie(req, '', 0);

  return { enabled: true, isAuthenticated, login, logout, clientIp };
}
