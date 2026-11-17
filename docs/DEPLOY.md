# Cloud deployment

Engineering Academy runs as a single always-on web service with a persistent disk for its SQLite database. It needs no personal computer, tunnel or terminal once deployed.

## Render (configured)

`render.yaml` describes the service:

| Setting | Value | Why |
| --- | --- | --- |
| Runtime | Docker (`Dockerfile`, `node:22-alpine`) | Same image everywhere; no npm dependencies |
| Plan | Starter, always on | The free plan sleeps and cannot attach a disk |
| Persistent disk | `academy-data`, 1 GB at `/var/data` | Holds `academy.db` and `videos/`; survives restarts and deploys, with daily snapshots |
| Branch | `claude/kind-goldberg-1bf39i`, auto-deploy on push | `main` is not deployed until you merge |
| Health check | `/healthz` | Restarts the service if it stops answering |
| HTTPS | Automatic, `https://<service>.onrender.com` | Render terminates TLS |

Environment and secrets (set in Render, never in Git):

| Variable | Value |
| --- | --- |
| `ACADEMY_PASSWORD` | Your sign-in password, 12+ characters. Change it any time under the service's **Environment** tab. |
| `ACADEMY_SESSION_SECRET` | Random; keeps sign-ins valid across deploys |
| `ACADEMY_TRUST_PROXY`, `ACADEMY_SECURE_COOKIES` | `true` |
| `RENDER_EXTERNAL_HOSTNAME` | Set by Render; the app allows its own `*.onrender.com` host automatically |

The server refuses to start in the cloud without a password, rejects requests for any other host name, and serves everything over HTTPS.

### Data

- The cloud database starts fresh, with the removable EXAMPLE records. Your local `data/academy.db` is never uploaded or changed.
- To move local data to the cloud later, upload `academy.db` to `/var/data/academy.db` with the service stopped (Render Shell or `scp` over Render SSH), then restart.
- Render keeps daily disk snapshots, restorable from the **Disks** section of the service.

## Other providers

The same image runs on Railway (attach a volume at `/var/data`; `RAILWAY_PUBLIC_DOMAIN` is allowed automatically) and Fly.io (volume at `/var/data`; `<app>.fly.dev` is allowed automatically). Set `ACADEMY_PASSWORD`, `ACADEMY_SESSION_SECRET`, `ACADEMY_TRUST_PROXY=true` and `ACADEMY_SECURE_COOKIES=true`.
