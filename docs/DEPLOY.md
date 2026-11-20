# Cloud deployment

Engineering Academy needs a small backend: sign-in must check a secret, your records must persist off the phone, and assessments keep their answer key on the server. Everything else (HTML, JS, CSS, icons, the curriculum text) is static.

## Recommended: Cloudflare Workers + one SQLite Durable Object ($0)

```text
iPhone ──► Cloudflare edge (nearest city, HTTPS, HTTP/3, brotli)
             ├─ /, /js, /css, /icons, /manifest ──► static assets (edge cache)
             └─ /api/* ──► Worker ──► Durable Object "academy"
                                       └─ SQLite (durable, replicated, 30-day point-in-time recovery)
```

| Concern | How it is handled |
| --- | --- |
| Cost | Workers **Free plan**: no card, nothing can be billed. 100,000 API requests/day; static files are free and unlimited; 5 GB of SQLite storage. |
| Cold starts | No sleeping server. Workers start in milliseconds; the Durable Object wakes in tens of milliseconds. (Render's free tier sleeps after 15 minutes and takes ~30–60 s to wake, which is what makes those apps feel slow.) |
| Speed | Static files come from the nearest of 300+ Cloudflare cities. The service worker opens the app from the phone's cache, so a launch waits only for one parallel round of API calls. |
| Persistence | Durable Object storage is written durably before each response is sent, survives every deploy and restart, and can be restored to any point in the last 30 days. |
| Security | Same code as the Node server (`server/api.js`): password sign-in, signed `HttpOnly; Secure; SameSite=Strict` cookie, Origin checks, sign-in rate limiting, strict CSP (`public/_headers`). The Worker refuses all API calls until both secrets are set. |
| CPU limit | The Free plan allows 10 ms of CPU per request. Measured with 300+ records: lesson and course pages under 1 ms, dashboard summary ~6 ms (cached in memory until the next write), assessments ~7 ms. If a very large library ever exceeds it, Workers Paid ($5/month) raises the limit; this needs your approval. |
| Not available in the cloud | Self-hosted video files (`/media/`), which need a disk. YouTube, Vimeo and https video links work. |

### Deploy

Requires a free Cloudflare account and an API token from the **Edit Cloudflare Workers** template.

```sh
npm install                                   # Wrangler (deploy tool only)
npx wrangler secret put ACADEMY_PASSWORD      # 12+ characters
npx wrangler secret put ACADEMY_SESSION_SECRET
npm run cloud:deploy                          # versions the service worker, checks, deploys
npm run cloud:smoke -- https://engineering-academy.<you>.workers.dev <password>
```

`ACADEMY_LOCATION_HINT` in `wrangler.jsonc` is set to `apac` (Asia-Pacific, for South Korea). The database is created there on first use and cannot move later.

### Data

- The cloud database starts fresh, with the removable EXAMPLE records. Your local `data/academy.db` is never uploaded or changed.
- Each deploy keeps the data: the database belongs to the Durable Object, not to the code.

## Alternative: Render web service (~$7.25/month)

`Dockerfile` and `render.yaml` describe an always-on Starter instance with a 1 GB persistent disk. It is simpler but costs money, runs in one region, and serves every file from that region. Render's free plan is not suitable: it sleeps (slow first load) and has no persistent disk (data is lost on redeploy).

The same Docker image also runs on Railway or Fly.io with a volume at `/var/data`.

## Resetting the sign-in password

The password is a Cloudflare secret (`ACADEMY_PASSWORD`). Cloudflare never shows a secret's value after it is saved, so a lost password cannot be read back. It can only be replaced. Only someone who can log in to the Cloudflare account can do this, so the account's own login and two-factor protection guard it. The new password is never written to Git, logs, or the database, and your records are untouched.

1. Open the Cloudflare dashboard and go to **Workers & Pages → engineering-academy → Settings → Variables and Secrets**.
2. Next to `ACADEMY_PASSWORD`, choose **Edit**, enter the new password (at least 12 characters), and save.
3. Confirm `ACADEMY_SESSION_SECRET` is still listed (see below), then redeploy so the running app picks up the new value (`npm run cloud:deploy` from a machine with Wrangler and the account's API token).
4. Sign in on the phone with the new password.

Changing `ACADEMY_SESSION_SECRET` signs out every existing session. Set it from a machine with Wrangler and the account's API token, so its value is never shown: `node -e "process.stdout.write(require('crypto').randomBytes(32).toString('base64url'))" | npx wrangler secret put ACADEMY_SESSION_SECRET`, then redeploy.

**If the site says "not configured yet"**, one of the two secrets is missing or the password is shorter than 12 characters. Check both names exist (`npx wrangler secret list`). Saving a secret in the dashboard once removed `ACADEMY_SESSION_SECRET` in this deployment, so after any dashboard change, confirm both are still listed.
