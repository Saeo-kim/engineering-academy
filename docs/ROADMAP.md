# Future architecture

None of this is implemented. The MVP is deliberately manual; this document records how it could grow and what must be true before it does.

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

The `links` table already stores an undirected graph across all record types. Next steps are link types (*causes*, *fixes*, *requires*), suggested links based on shared tags and text, and a graph view.

### Learning progress tracking

`activity`, `study_count`, and `last_studied_at` already record the raw data. Add spaced repetition with a `next_review_at` column and a review queue on the Dashboard, plus progress per category.

### Practical exercises and quizzes

Promote the free-text exercise field to an `exercises` table with attempts and outcomes. Quiz prompts can come from a record's own fields, for example showing an error message and asking for the root cause.

## Likely technical changes

| Trigger | Change |
| --- | --- |
| Search feels slow or needs ranking, likely beyond tens of thousands of records | SQLite FTS5, with a trigram tokenizer to preserve substring and Korean matching |
| More than one device | Sync the database file, or add a server with real authentication |
| Frontend grows substantially | Adopt a component framework and a bundler. The JSON API can stay as it is. |
