# SAEO Workspace — instructions for AI assistants

This file is the single source of truth for where things are. A copy lives at
`~/.claude/CLAUDE.md` so Claude Code reads it in every session, wherever it starts.
Machine-readable version: `workspace.json` (same folder). Current state and next tasks: `HOME_WORKSPACE_HANDOFF.md`. A copy of all three plus `scripts/` is versioned in the engineering-academy repo under `workspace-kit/`. Update both when a project is added or moved.

## Owner
- Saeo (GitHub: `Saeo-kim`, push over SSH `git@github.com:Saeo-kim/<repo>.git`).
- Korean speaker, learning Java/Spring at an academy (국비 과정). Explain for a beginner; Korean for explanations, English is fine for commands and code.
- `gh` CLI on this PC is logged in as a different account (`e49r38in-lab`), which cannot see Saeo-kim's private repos. Use git over SSH; ask before running `gh auth login`.

## Where things are (Windows: `C:\Users\KHBS_D_26\Desktop\SAEO-WORKSPACE`)
| Say | Folder | Stack | Run | URL |
|---|---|---|---|---|
| Academy | `engineering-academy` | Node, no deps, SQLite | `npm start` | http://localhost:4310 |
| Office | `owners-office` | Node, SQLite | `npm start` | http://localhost:4320 |
| Focus Flow | `FOCUS_FLOW/Focus_Flow` | Spring Boot, MySQL | `start-focusflow.bat` (needs `application-local.properties`) | http://localhost:8080 |
| Expansion | `the-expansion` | Astro | `npm run dev` / `npm run build` | http://localhost:4321 |
| SAEO LABS | `saeo-labs` | Astro | `npm run dev` | http://localhost:4321 |
| Lingua | `LiguaSpace` (repo name has no "n") | Spring Boot, PostgreSQL (Render) | see README | http://localhost:8080 |
| Radar | `global-tech-radar` | Spring Boot 4, MySQL or H2 demo | `gradlew.bat bootRun --args='--spring.profiles.active=demo'` | http://localhost:8090 |
| Freelance | `freelance-manager` | Spring Boot | — | — |

Shared scripts: `SAEO-WORKSPACE/scripts/` (launchers, desktop shortcuts, backup, restore, clone-all).

## Rules
1. **Originals live in SAEO-WORKSPACE.** Same-named folders under `Desktop/dev-playground` and `*-backup*` folders are old copies: read only, never edit them unless the owner names them.
2. **Academy course materials are read-only references**: `Desktop/파이널`, `workspace_*`, `CarProject*`, `세미프로젝트*`, etc. Never copy instructor files into products, Focus Flow, or public content. Summarise in the owner's own words (policy: Office → CEO Playbook → 운영 원칙).
3. **New project** → `SAEO-WORKSPACE/<kebab-name>`, its own git repo, add a row above and in `workspace.json`.
4. **Where content goes**
   - Learning notes, explanations, how-tos → Academy (`server/curriculum*.js` for built-in curriculum; the owner's own notes go through the app).
   - Business decisions, money, strategy, policies → Office (Playbook tabs, Ventures, Cash Desk).
   - Tasks, schedules, why a project matters → Focus Flow (Project "Purpose").
   - Public explanatory articles → The Expansion (`src/content/encyclopedia/*.md`).
   - Company mission for the public → SAEO LABS site.
5. **Never mix money kinds** in Office: actual (실제) vs promised (계약·청구) vs expected (예상).
6. Preserve existing features and data. Design-only requests change CSS only.
7. Verify by running the app; report what was not verified.
8. **`develop` is the integration branch** in every repo. Work on a feature branch, fast-forward or merge into `develop`, push. Never push to `main` without being asked. Never force-push.
9. **Point out inefficiency.** If the owner's request or workflow is clearly wasteful (huge multi-topic prompts, repeated manual steps, duplicate copies), say so first with the better approach and the time saved.
