# HOME WORKSPACE HANDOFF

Written 2026-11-17 21:10 KST on the academy PC (KHBS_D_26). Read this first on the home laptop.
The same file is in GitHub: `Saeo-kim/engineering-academy` → `develop` → `workspace-kit/HOME_WORKSPACE_HANDOFF.md`.

---

## A. Workspace structure

| Item | Value |
|---|---|
| Permanent workspace | `Desktop\SAEO-WORKSPACE` (academy PC: `C:\Users\KHBS_D_26\Desktop\SAEO-WORKSPACE`) |
| Registry (for you and for Claude) | `SAEO-WORKSPACE\workspace.json`, `SAEO-WORKSPACE\CLAUDE.md` (copy at `~\.claude\CLAUDE.md`) |
| Scripts | `SAEO-WORKSPACE\scripts\` — `launch.ps1`, `create-shortcuts.ps1`, `backup-data.ps1`, `restore-data.ps1`, `clone-all.ps1`, `icons\` |
| Versioned copy of registry + scripts | `engineering-academy` repo, folder `workspace-kit/` |
| Data backups (not in GitHub) | `OneDrive\SAEO-backup\<date>\` (latest: `2026-11-17_21xx`) |
| Integration branch | **`develop`** in every repo. `main` is untouched. |

| Folder | Project | Purpose | GitHub (private, SSH) |
|---|---|---|---|
| `engineering-academy` | Engineering Academy | Learning app: curriculum, code dissection room, explain-back, reviews | git@github.com:Saeo-kim/engineering-academy.git |
| `owners-office` | Owner's Office | Business/finance: Cash Desk, ventures, goals, CEO Playbook | git@github.com:Saeo-kim/owners-office.git |
| `FOCUS_FLOW` | Focus Flow | Projects, tasks, work steps; JPA exam study project | git@github.com:Saeo-kim/FOCUS_FLOW.git |
| `the-expansion` | The Expansion | Public knowledge encyclopedia (Astro) | git@github.com:Saeo-kim/the-expansion.git |
| `saeo-labs` | SAEO LABS | Company / venture-studio website (Astro) | git@github.com:Saeo-kim/saeo-labs.git |
| `LiguaSpace` | Lingua Space | Language-learning PWA (Spring Boot; Render + PostgreSQL) | git@github.com:Saeo-kim/LiguaSpace.git |
| `global-tech-radar` | Global Tech Radar | Tech intelligence dashboard + live news | git@github.com:Saeo-kim/global-tech-radar.git |
| `freelance-manager` | freelance-manager | Older Spring project, not touched today | git@github.com:Saeo-kim/freelance-manager.git |

**Not found anywhere** (local disk, and GitHub `Saeo-kim` under 16 name variants): *Questions & Answers*, *Development Progress Manager*, *SAEO Personal App Hub*. If they exist, they are under another name or account. Nothing was created for them.

---

## B. GitHub status (verified with `git ls-remote` against GitHub at 21:08)

| Repo | develop (local = remote) | main (unchanged) | Feature branch also on GitHub | Uncommitted |
|---|---|---|---|---|
| engineering-academy | `ab7ec1c` + workspace-kit commit (see below) | `7b69ea1` | feature/curriculum-and-code-explainer | none |
| owners-office | `77c2ddc` | `47341eb` | feature/ceo-playbook | none |
| FOCUS_FLOW | `1b8c7a2` | `3486a46` | feature/study-plan | none |
| the-expansion | `4e77618` | `d477c0f` | feature/bash-and-ci | none |
| saeo-labs | `ba201dc` | `1cb06fe` | ci/actions-bot | none |
| global-tech-radar | `eb80534` (develop created from main) | `6e2ce9d` | ci/actions-bot | none |
| LiguaSpace | `dce6468` (develop created from main) | `5dde26d` | feature/local-h2-and-ci | `lingua-space/gradlew.bat` — line endings only, content identical. Safe to ignore or `git checkout -- lingua-space/gradlew.bat`. |
| freelance-manager | `b81708c` (develop created from main, no changes) | `b81708c` | — | none |

Branching notes:
- FOCUS_FLOW and the-expansion already used `develop` (their `main` is older); kept as is.
- saeo-labs already had `origin/develop`; reused.
- All merges into develop were fast-forward. No force push, no branch deleted.
- `gh` CLI on the academy PC is logged in as `e49r38in-lab` and cannot see these private repos, so GitHub Actions results and Pages URLs were **not** checked.

Other session on the same PC (FYI): another Claude session archived old copies to `Desktop\_archive\`, moved a stray `~\.git` (home folder had become a git repo) into the archive, and pushed rescue branches `the-expansion:rescue/home-folder-repo-2026-11-06` and `saeo-labs:rescue/ventures-updated-snapshot-2026-11-02`. Those are its work, not merged into develop.

---

## C. Application status

| App | Runs? (academy PC, today) | Recently changed | Incomplete | Start | Port |
|---|---|---|---|---|---|
| Engineering Academy | **Yes**. build OK, 51 tests pass | Curriculum v1+v2 (JPA, EAGER/LAZY, Review.store, Claude, tokens, Bash, computer basics), code dissection room, coach messages, campus theme, CI | Practice data is only local (DB) | `npm start` | 4310 |
| Owner's Office | **Yes**. 35 tests pass | Cash Desk, receivables/obligations (DB migration 2), Help, ledger theme, Playbook tabs, CI existed | 194 DEMO rows still in DB; delete in Settings. Pages deploy runs only from `main` | `npm start` | 4320 |
| Focus Flow | **Compiles only** (not started: no MySQL password on this PC) | Project *Purpose* field, JPA study project seeder, CI with MySQL | Run once to confirm seeder + Purpose UI | `Focus_Flow\start-focusflow.bat` | 8080 |
| The Expansion | **Yes**. build 36 pages, preview opened | Bash entry, CI | Not deployed | `npm install` then `npm run dev` | 4321 |
| SAEO LABS | **Not run today** | CI only | Verify `npm run build` | `npm install` then `npm run dev` | 4321 (use `-- --port 4322` if Expansion runs) |
| Lingua Space | **Yes** locally on H2; tests pass | H2 local mode, `gradlew.bat`, CI | Render URL unknown; production uses PostgreSQL | see D-5 | 8081 local |
| Global Tech Radar | **Yes** (demo/H2), 65 tests pass | CI | Taiwan: only TSMC company record | `.\gradlew.bat bootRun --args='--spring.profiles.active=demo'` | 8090 |
| freelance-manager | Not checked | — | — | — | — |

Deployment URLs: none verified. Lingua Space has a Render Dockerfile (URL not recorded in the repo); Owner's Office has a GitHub Pages workflow on `main`.

### Data that is NOT in GitHub

| Data | Location | Backup |
|---|---|---|
| Academy learning records | `engineering-academy\data\academy.db*` | OneDrive backup ✓ |
| Office records (ventures, demo data) | `owners-office\data\office.db*` | OneDrive backup ✓ |
| Lingua local H2 data | `LiguaSpace\data\` | OneDrive backup ✓ (test data only) |
| Focus Flow MySQL DB `focus_flow` | MySQL server | **Not backed up** (no credentials here) |
| Radar MySQL DB | MySQL server | Not needed (demo mode uses memory) |
| `application-local.properties` (passwords) | Focus Flow | None existed on this PC |

On a new machine the Academy and Office apps create a fresh DB with built-in curriculum/demo data, so they work even without restoring. Restore only if you want today's local records.

---

## D. Home laptop: exact steps

### D-1. One-time setup (skip what you already have)
1. Install: **Git**, **Node.js 22.13+** (24 recommended), **JDK 21**, **MySQL 8** (only for Focus Flow), **Microsoft Edge** or Chrome.
2. PowerShell: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
3. SSH key for GitHub (if `ssh -T git@github.com` does not say "Hi Saeo-kim"):
   `ssh-keygen -t ed25519` → copy `~\.ssh\id_ed25519.pub` → GitHub (Saeo-kim) → Settings → SSH keys → New.

### D-2. Get the workspace
If the laptop has **no** SAEO-WORKSPACE yet:
```powershell
cd ~\Desktop
git clone -b develop git@github.com:Saeo-kim/engineering-academy.git SAEO-WORKSPACE\engineering-academy
Copy-Item SAEO-WORKSPACE\engineering-academy\workspace-kit\* SAEO-WORKSPACE\ -Recurse -Force
powershell -ExecutionPolicy Bypass -File SAEO-WORKSPACE\scripts\clone-all.ps1
```
If it **already has** the repos: in each folder run
```powershell
git fetch origin
git switch develop        # first time: git switch -c develop --track origin/develop
git pull --ff-only
```

### D-3. Claude knows everything
```powershell
mkdir ~\.claude -Force; Copy-Item ~\Desktop\SAEO-WORKSPACE\CLAUDE.md ~\.claude\CLAUDE.md
```
Then start Claude Code in `Desktop\SAEO-WORKSPACE` and say: **"HOME_WORKSPACE_HANDOFF.md 읽고 이어서 하자"**.

### D-4. Optional: restore today's local data (OneDrive must be synced)
`powershell -ExecutionPolicy Bypass -File ~\Desktop\SAEO-WORKSPACE\scripts\restore-data.ps1`

### D-5. Start and verify each app
| App | Commands | Verify |
|---|---|---|
| Academy | `cd engineering-academy; npm start` | http://localhost:4310 → left menu has 커리큘럼 / 코드 해부실 |
| Office | `cd owners-office; npm start` | http://localhost:4320/#/cash shows Cash Desk |
| Expansion | `cd the-expansion; npm install; npm run dev` | http://localhost:4321/encyclopedia/bash/ |
| SAEO LABS | `cd saeo-labs; npm install; npm run dev -- --port 4322` | http://localhost:4322 |
| Lingua | `cd LiguaSpace; $env:DATABASE_URL='jdbc:h2:file:./data/lingua-local;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE'; $env:DATABASE_USERNAME='sa'; $env:DATABASE_PASSWORD=''; $env:PORT='8081'; .\gradlew.bat bootRun` | http://localhost:8081 |
| Radar | `cd global-tech-radar; .\gradlew.bat bootRun --args='--spring.profiles.active=demo'` | http://localhost:8090 |
| Focus Flow | `cd FOCUS_FLOW\Focus_Flow; copy application-local.properties.example application-local.properties; notepad application-local.properties` (enter MySQL user/password) → `.\start-focusflow.bat` | http://localhost:8080 → project "JPA 시험 · AI 코드 검증 대비" exists, Project Information shows *Purpose* |

Desktop icons with own windows: `powershell -ExecutionPolicy Bypass -File ~\Desktop\SAEO-WORKSPACE\scripts\create-shortcuts.ps1`, then right-click each icon → "작업 표시줄에 고정" (Windows does not allow scripts to pin).

Environment templates: `engineering-academy\.env.example`, `FOCUS_FLOW\Focus_Flow\application-local.properties.example`, Radar and Lingua variables in their READMEs. Never commit filled-in copies.

---

## E. Next tasks

### Must do immediately (home, first session)
1. Pull `develop` everywhere (D-2) and copy `CLAUDE.md` (D-3).
2. Run Focus Flow once with MySQL — first real run of the Purpose field and study seeder.
3. Office: Settings → delete DEMO data, then add your real bank account in Cash Desk.
4. `gh auth login` as **Saeo-kim** so Claude can read GitHub Actions results.
5. Run `npm run build` in saeo-labs (not verified today).

### Important, not urgent
- Decide whether to merge `develop` → `main` per repo (Office Pages deploy only from `main`).
- Weekly backup task: `schtasks` line at the top of `scripts\backup-data.ps1`.
- Focus Flow MySQL backup (`mysqldump`) once credentials exist.
- Record Lingua Space Render URL in `workspace.json`.
- Review the other session's `Desktop\_archive` and rescue branches; delete nothing until reviewed.

### Future business opportunities (hypotheses, revenue today: 0 won)
- Engineering Academy: 5 classmates → JPA exam pack (Office → Playbook → Academy 수익화, 홍보 영상).
- AI code-learning tutor on Claude API (Playbook → 나만의 AI 사업, venture paused).
- Online cohort "이해 보증반", self-study books, AI music — all recorded as paused ventures in Office.
