# Engineering Academy

A local-first knowledge base for learning software engineering while building real projects. It captures the commands, errors, code, and AI explanations that scroll past during development, then gives each one a structure that forces the useful questions: **why did this happen, how does it work, and could I reproduce the fix on my own?**

All data stays on your computer, in one SQLite file.

## Quick start

Requires **Node.js 22.13 or newer**. There are no packages to install.

```powershell
npm start
```

Open <http://localhost:4310>. The first run adds 11 records labelled **EXAMPLE**. Remove them at any time with one button on the Dashboard, and they will not come back.

To use a different port: `$env:PORT=4311; npm start`

## Features

| Section | What it does |
| --- | --- |
| **Dashboard** | Totals, recent captures, a 26-week learning activity chart, and recently studied records |
| **Quick Capture** | Saves terminal commands, terminal output, errors, code, AI explanations, and notes. Warns when pasted text looks like a credential. |
| **Knowledge Library** | Eleven categories with search and filters by type and tag |
| **Knowledge detail** | What is it, why is it needed, how does it work, real-world example, practical exercise, related knowledge |
| **Error Archive** | Original message, root cause, investigation, solution, files affected, verification, lessons learned. A record stays *Open* until it has a solution. |
| **Command Library** | Command, purpose, explanation, expected output, common mistakes, related concepts, and one-click copy |
| **Search** | Searches everything by substring, so a fragment of an error message or Korean text will match |

Quick Capture routes each item by type: commands go to the Command Library, errors to the Error Archive, and everything else to the Knowledge Library.

In long text fields, ```` ``` ```` makes a code block and `` ` `` makes inline code.

Keyboard shortcuts: `Ctrl K` focuses search, and `Ctrl Enter` saves a form.

## Your data

| | |
| --- | --- |
| Location | `data/academy.db` (excluded from Git) |
| Backup | Stop the server and copy that file |
| Reset | Stop the server and delete that file |
| Custom location | Set the `ACADEMY_DB` environment variable |

## Project structure

```text
server/
  index.js        Startup and configuration
  app.js          HTTP routes, static files, and request guards
  db.js           SQLite connection and versioned migrations
  repository.js   Validation, queries, and search
  resources.js    Categories, capture types, and field definitions
  seed.js         First-run example records
public/
  index.html      Application shell
  css/styles.css  Design tokens and layout
  js/
    main.js       Hash router and navigation
    api.js        Fetch wrapper
    dom.js        Safe DOM building and small helpers
    schema.js     How each record type is displayed and edited
    views/        One module per screen
scripts/check.js  Build check
tests/
  api.test.js     API, validation, and security tests
  e2e/            Browser tests using the DevTools Protocol
docs/ROADMAP.md   Future architecture and privacy requirements
```

To add a field: add a migration in `server/db.js`, list the field in `server/resources.js`, and add it to `public/js/schema.js`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm start` | Run the app |
| `npm run dev` | Run the app and restart when server files change |
| `npm run build` | Check that all JavaScript parses and that imports and page assets resolve. The app has no compile step. |
| `npm test` | Run the API tests against a temporary database |
| `npm run test:e2e` | Run the browser tests in headless Chrome or Edge against a temporary database. Set `CHROME_PATH` if the browser is not found. Screenshots go to `tests/e2e/.artifacts/`. |

## Security

The app has no login because it is designed for one person on one computer.

- The server listens on `127.0.0.1` only.
- Requests with a foreign `Host` header are rejected, which blocks DNS rebinding. Writes from a foreign `Origin` are rejected, which blocks cross-site requests.
- Captured text is only ever rendered as text, and a strict Content-Security-Policy backs that up.
- The database is excluded from Git.

Do not expose this server to a network without adding authentication first.

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for Claude Code Hooks integration, automatic capture, AI explanations, and the privacy requirements that must be met first.
