import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { createAuth } from './auth.js';
import { openDatabase } from './db.js';
import { createEvaluator } from './evaluator.js';
import { createRepository } from './repository.js';
import { seedIfFirstRun } from './seed.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const env = process.env;
const list = (value) => (value ?? '').split(',').map((s) => s.trim()).filter(Boolean);
const flag = (value) => /^(1|true|yes)$/i.test(value ?? '');

const config = {
  dbPath: env.ACADEMY_DB ?? join(root, 'data', 'academy.db'),
  port: Number(env.PORT ?? 4310),
  // Loopback by default: without a password this app must not be reachable from a network.
  host: env.HOST ?? '127.0.0.1',
  password: env.ACADEMY_PASSWORD ?? '',
  allowedHosts: list(env.ACADEMY_ALLOWED_HOSTS),
  trustProxy: flag(env.ACADEMY_TRUST_PROXY),
  secureCookies: flag(env.ACADEMY_SECURE_COOKIES),
  sessionSecret: env.ACADEMY_SESSION_SECRET ?? '',
  evaluator: env.ACADEMY_EVALUATOR ?? 'local',
  seed: env.ACADEMY_SEED === undefined ? true : flag(env.ACADEMY_SEED),
};

const exposed = !/^(127\.0\.0\.1|localhost|::1)$/.test(config.host) || config.allowedHosts.length > 0;
if (exposed && config.password.length < 12) {
  console.error(
    'Refusing to start: HOST or ACADEMY_ALLOWED_HOSTS exposes the app beyond this computer, ' +
      'so ACADEMY_PASSWORD must be set to a password of at least 12 characters.',
  );
  process.exit(1);
}

const db = openDatabase(config.dbPath);
const repo = createRepository(db);
const seeded = config.seed && seedIfFirstRun(repo);
const auth = createAuth({ password: config.password, secret: config.sessionSecret, secureCookies: config.secureCookies, trustProxy: config.trustProxy });
const server = createApp(repo, { auth, allowedHosts: config.allowedHosts, evaluator: createEvaluator(config.evaluator) });

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${config.port} is already in use. Start on another port with: $env:PORT=4311; npm start`);
    process.exit(1);
  }
  throw err;
});

server.listen(config.port, config.host, () => {
  if (seeded) console.log('First run: added example records (labelled EXAMPLE in the app).');
  console.log(`Engineering Academy running at http://localhost:${config.port}`);
  console.log(`Data file: ${config.dbPath}`);
  if (auth.enabled) console.log('Password protection: on');
  if (config.allowedHosts.length) console.log(`Also accepting hosts: ${config.allowedHosts.join(', ')}`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
  server.closeAllConnections();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
