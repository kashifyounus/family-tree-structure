# Cloud preview (agent VM)

Run the full Next.js app with embedded PostgreSQL when Docker is unavailable.

```bash
# One-time DB + migrate + seed
node scripts/cloud-preview-boot.mjs

# Dev server (binds 0.0.0.0:3000)
export DATABASE_URL=$(cat .cloud-database-url)
npx next dev --hostname 0.0.0.0 -p 3000
```

Or: `./scripts/run-cloud-preview.sh`

## Public URL (phone / remote web)

```bash
cloudflared tunnel --url http://127.0.0.1:3000
```

Use the `https://….trycloudflare.com` URL in the Android app: **Account → Shared online → family website address → Test connection → Save**.

Demo sign-in: `contributor@mughals.local` / `contributor` (or owner `kashifyounus@mughals.local` / `mughal`).

Sample tree: `/tree/FAM-10004`

**Note:** Quick tunnels change when `cloudflared` restarts. For a stable URL, deploy to Vercel or your own host.
