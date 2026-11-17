import { createApp } from './app.js';
import { createAuth } from './auth.js';
import { loadConfig } from './config.js';
import { openDatabase } from './db.js';
import { createEvaluator } from './evaluator.js';
import { createRepository } from './repository.js';
import { seedIfFirstRun } from './seed.js';

const config = loadConfig();

if (config.exposed && config.password.length < 12) {
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
const server = createApp(repo, { auth, allowedHosts: config.allowedHosts, evaluator: createEvaluator(config.evaluator), mediaDir: config.mediaDir });

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
