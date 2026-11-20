// Reads configuration from environment variables. Every variable is optional;
// .env.example documents each one.
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const list = (value) => (value ?? '').split(',').map((s) => s.trim()).filter(Boolean);
const flag = (value) => /^(1|true|yes)$/i.test(value ?? '');

// Public hostnames that cloud platforms announce to the app, so a deployment
// accepts its own URL without hand-copying it into ACADEMY_ALLOWED_HOSTS.
export function platformHosts(env) {
  return [
    env.RENDER_EXTERNAL_HOSTNAME, // Render: <service>.onrender.com
    env.RAILWAY_PUBLIC_DOMAIN, // Railway: <service>.up.railway.app
    env.FLY_APP_NAME && `${env.FLY_APP_NAME}.fly.dev`, // Fly.io
  ].filter(Boolean);
}

export function loadConfig(env = process.env) {
  const config = {
    dbPath: env.ACADEMY_DB ?? join(root, 'data', 'academy.db'),
    // Lecture videos you host yourself, served at /media/<file name>.
    mediaDir: env.ACADEMY_MEDIA_DIR ?? join(root, 'data', 'videos'),
    port: Number(env.PORT ?? 4310),
    // Loopback by default: without a password this app must not be reachable from a network.
    host: env.HOST ?? '127.0.0.1',
    password: env.ACADEMY_PASSWORD ?? '',
    allowedHosts: [...new Set([...list(env.ACADEMY_ALLOWED_HOSTS), ...platformHosts(env)])],
    trustProxy: flag(env.ACADEMY_TRUST_PROXY),
    secureCookies: flag(env.ACADEMY_SECURE_COOKIES),
    sessionSecret: env.ACADEMY_SESSION_SECRET ?? '',
    evaluator: env.ACADEMY_EVALUATOR ?? 'local',
    seed: env.ACADEMY_SEED === undefined ? true : flag(env.ACADEMY_SEED),
    // The built-in Korean study curriculum. On by default; set ACADEMY_CURRICULUM=false to skip it (the browser tests do).
    curriculum: env.ACADEMY_CURRICULUM === undefined ? true : flag(env.ACADEMY_CURRICULUM),
  };
  config.exposed = !/^(127\.0\.0\.1|localhost|::1)$/.test(config.host) || config.allowedHosts.length > 0;
  return config;
}
