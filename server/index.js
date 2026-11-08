import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { openDatabase } from './db.js';
import { createRepository } from './repository.js';
import { seedIfFirstRun } from './seed.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = process.env.ACADEMY_DB ?? join(root, 'data', 'academy.db');
const port = Number(process.env.PORT ?? 4310);
const host = '127.0.0.1'; // Deliberately loopback-only: this app has no login.

const db = openDatabase(dbPath);
const repo = createRepository(db);
const seeded = seedIfFirstRun(repo);
const server = createApp(repo);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Start on another port with: $env:PORT=4311; npm start`);
    process.exit(1);
  }
  throw err;
});

server.listen(port, host, () => {
  if (seeded) console.log('First run: added example records (labelled EXAMPLE in the app).');
  console.log(`Engineering Academy running at http://localhost:${port}`);
  console.log(`Data file: ${dbPath}`);
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
