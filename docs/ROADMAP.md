# Future architecture

Capture stays deliberately manual. This document records how the app could grow and what must be true before it does.

## Shipped in v0.2

- **Learning loop.** Explain-back exercises, rebuild challenges, generated assessments, a spaced-repetition Review Center, and a five-stage progress model per record (`server/learning.js`).
- **Pluggable evaluator.** Answers are scored by a local, deterministic provider. AI providers plug into the same interface (`server/evaluator.js`).
- **Knowledge map.** A graph of all records and links, grouped by category, with tag-based link suggestions.
- **Workflows.** A fourth collection for implementation procedures.
- **Optional password protection.** Allows a tunnel or proxy deployment. The server refuses to start exposed without a password.

## Privacy comes first

Automatic capture would turn this app from a place where you decide what to save into a recorder of everything in your terminal. Terminals contain API keys, tokens, connection strings, customer data, and file paths that reveal private details. Before any automatic collection ships, all of these must be in place:

1. **Off by default.** Collection is enabled per project and is easy to pause. A visible indicator shows when it is on.
2. **Inbox before archive.** Automatic captures land in a separate review queue and join the knowledge base only when approved. Unreviewed items expire, for example after 14 days.
3. **Redaction before storage.** Secrets are removed before anything is written to disk, not when it is displayed. Extend the patterns in `public/js/views/capture.js`, move them to the server, and add entropy-based detection. Store a marker such as `[REDACTED:github-token]`, never the value.
4. **Project and path exclusions.** A deny-list covers paths and commands such as `.env`, `*.pem`, `~/.ssh`, and `aws configure`. Failure mode is to drop the capture.
5. **Nothing leaves the machine by default.** Any feature that calls an external AI service needs an explicit opt-in, shows exactly what will be sent, and sends only redacted text.
6. **Authenticated ingest.** The current write API trusts any local process. Ingest endpoints need a per-install token, and the token must stay out of the database and Git.
7. **Deletion that means it.** Purging a project removes its records, links, and activity. Run `VACUUM` afterwards so deleted content does not linger in the file.
8. **Encryption at rest, as an option.** Today's database is a plain file protected only by operating system permissions.

## Planned capabilities

### Claude Code Hooks integration

Claude Code hooks run a local script on events such as `PostToolUse` and `Stop`. A small hook script would read the event JSON, apply redaction and exclusions, and POST the result to a new `/api/inbox` endpoint. The hook must fail silently and quickly so it never slows or blocks the coding session.

### Development session capture

Add a `sessions` table (project, started, ended, summary) and a nullable `session_id` on existing records. A session view then reads as a timeline: what was attempted, what broke, what fixed it.

### Terminal command capture

A shell hook (PowerShell `PSReadLine` history handler, or `preexec` in bash and zsh) records the command, exit code, and working directory. Save only the commands that failed or that repeat often, since most history is noise. Output is much riskier than the command text, so capture it only on explicit request.

### Error detection and classification

Run rules first: match known signatures such as `BeanCreationException`, `EADDRINUSE`, and `non-fast-forward`. Normalize volatile parts (paths, ports, line numbers) into a fingerprint. Then Quick Capture can answer the most valuable question in this app: *have I seen this before, and how did I fix it?*

### Automatic knowledge extraction

From a reviewed session, propose draft records for a person to accept, edit, or reject. Mark drafts as machine-generated with a new `origin` column, so that writing an explanation yourself stays distinct from accepting one.

### AI-generated beginner explanations

A "Draft explanation" action fills empty What/Why/How fields, shown side by side with your own wording. Keep the model provider behind a small interface and consider a local model as the default. Requires the opt-in in privacy item 5. Generated text should prompt you to rewrite it, because explaining something yourself is the point of this app.

### Knowledge relationship mapping

Shipped: the graph view and tag-based link suggestions. Next steps are link types (*causes*, *fixes*, *requires*) and suggestions based on text similarity, not only shared tags.

### Learning progress tracking

Shipped: spaced repetition (`reviews` table), the Review Center, and progress per category and per stage. Next: a daily new-card limit setting, and review statistics such as retention rate per category.

### Practical exercises and quizzes

Shipped: `attempts` and `quizzes` tables, with assessments generated from records' own fields (definition → concept, purpose → command, error → root cause, goal → workflow). Next: free-text assessment questions scored by the evaluator, and per-question difficulty from historical accuracy.

## Likely technical changes

| Trigger | Change |
| --- | --- |
| Search feels slow or needs ranking, likely beyond tens of thousands of records | SQLite FTS5, with a trigram tokenizer to preserve substring and Korean matching |
| More than one device | Sync the database file, or add a server with real authentication |
| Frontend grows substantially | Adopt a component framework and a bundler. The JSON API can stay as it is. |
