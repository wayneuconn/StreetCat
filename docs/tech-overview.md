# StreetCat — Technical Overview & Cost Breakdown

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  GitHub (wayneuconn/StreetCat)                              │
│  push to main → GitHub Actions                              │
│    ├─ Auth via Workload Identity Federation (keyless)        │
│    ├─ docker build → Artifact Registry                      │
│    └─ gcloud run deploy → Cloud Run                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Cloud Run (streetcat)                    us-central1       │
│  ├─ Next.js 15 standalone (Node 20 Alpine)                  │
│  ├─ 512 MB RAM, 1 vCPU                                     │
│  ├─ Min instances: 0 (scale to zero)                        │
│  ├─ Max instances: 2                                        │
│  └─ Public HTTPS endpoint                                   │
│       https://streetcat-rr6gtedz6q-uc.a.run.app             │
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
     ┌─────────▼────────┐     ┌──────────▼──────────┐
     │  Cloud SQL        │     │  Cloud Storage       │
     │  PostgreSQL 15    │     │  streetcat-images-    │
     │  db-f1-micro      │     │  489803               │
     │  10 GB SSD        │     │  Public read          │
     │  (via Unix socket)│     │  (cocktail images)    │
     └──────────────────┘     └─────────────────────┘

     ┌──────────────────┐
     │  Secret Manager   │
     │  ├ DATABASE_URL   │
     │  └ ADMIN_PASSWORD │
     │    _HASH          │
     └──────────────────┘
```

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, Server Actions) | 15.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Database | PostgreSQL via Cloud SQL | 15 |
| ORM | Drizzle ORM | 0.38.x |
| Real-time | Server-Sent Events (SSE) | Native |
| i18n | next-intl | 4.x |
| Auth | bcrypt hash + HTTP-only cookie | Single admin password |
| Images | Google Cloud Storage | Public bucket |
| Deploy | Cloud Run (Docker, standalone output) | Managed |
| CI/CD | GitHub Actions + Workload Identity Federation | Keyless |
| Package Manager | pnpm | 10.x |

## Data Model

```
ingredients ──┐
              ├── recipe_ingredients ── recipes ── event_menu_items ── events
              │                                          │
              │                                     order_items ── orders
              │
              └── category: spirit | mixer | garnish | bitter | other
```

**7 tables**: ingredients, recipes, recipe_ingredients, events, event_menu_items, orders, order_items

All IDs use CUID2. Cascade deletes on foreign keys.

## Key Flows

**Guest**: `/menu` → `/menu/[itemId]` → `/order` → `/order/[orderId]/status` (polls every 5s)

**Admin**: `/admin/login` → `/admin` (dashboard) → `/admin/queue` (SSE live) → `/admin/inventory` → `/admin/recipes` → `/admin/events`

**Order real-time**: Guest places order → server action → DB insert → EventEmitter → SSE push → admin queue refreshes

**Shopping list**: For each menu item recipe, sum (ingredient amount × expected guests) − inventory on hand. Group by category.

## Secrets & Auth

| Secret | Storage | Access |
|--------|---------|--------|
| `DATABASE_URL` | GCP Secret Manager | Mounted as env var in Cloud Run |
| `ADMIN_PASSWORD_HASH` | GCP Secret Manager | Mounted as env var in Cloud Run |
| `WIF_PROVIDER` | GitHub Secrets | GitHub Actions → GCP auth |
| `WIF_SERVICE_ACCOUNT` | GitHub Secrets | GitHub Actions → GCP auth |

Admin auth: single bcrypt-hashed password, verified server-side, stored in HTTP-only cookie (7-day expiry). Middleware protects all `/admin/*` routes except `/admin/login`.

## CI/CD Pipeline

```
push to main
  → GitHub Actions (ubuntu-latest)
    → Auth to GCP via Workload Identity Federation (no service account keys)
    → docker build --platform=linux/amd64
    → push to Artifact Registry (us-central1-docker.pkg.dev)
    → gcloud run deploy (tagged with git SHA)
```

No manual deploy needed. Merge PR → auto-deploy in ~3 minutes.

---

## Cost Breakdown (Monthly Estimates)

### Scenario: Party Scale (2–4 events/month, ~50 guests each)

| Service | Spec | Monthly Cost | Notes |
|---------|------|-------------|-------|
| **Cloud SQL** | db-f1-micro, 10 GB SSD | **~$9.37** | Shared-core (0.6 GB RAM). Runs 24/7. Cheapest managed PG option. |
| **Cloud Run** | 512 MB, 1 vCPU, min=0 | **~$0–2** | Scale-to-zero. Only billed when handling requests. Free tier covers 2M requests/month. |
| **Artifact Registry** | Docker images | **~$0.10** | $0.10/GB storage. One image ~150 MB. |
| **Cloud Storage** | Cocktail images | **~$0.01** | A few MB of images. $0.020/GB/month + negligible egress. |
| **Secret Manager** | 2 secrets | **~$0** | Free tier covers 10,000 access operations/month. |
| **GitHub Actions** | ~3 min/deploy | **~$0** | 2,000 free minutes/month for public repos (or private with free tier). |
| | | | |
| **Total** | | **~$10–12/month** | |

### Cost Drivers & Optimization

**Cloud SQL is 80%+ of the cost.** Options to reduce:

| Option | Cost | Trade-off |
|--------|------|-----------|
| Keep db-f1-micro (current) | ~$9/mo | Simplest, always available |
| Stop instance between events | ~$2–4/mo | Manual start/stop, ~1 min cold start |
| Switch to Neon/Supabase free tier | $0 | External dependency, possible cold starts |
| SQLite on Cloud Run volume | $0 | No managed backups, single instance only |

**Cloud Run** is essentially free at party scale due to:
- Scale-to-zero (min instances = 0)
- Free tier: 180,000 vCPU-seconds + 360,000 GB-seconds/month
- Party traffic (~200 requests/event) is well within free tier

### Scaling Cost (if StreetCat grows)

| Scale | Cloud SQL | Cloud Run | Total |
|-------|-----------|-----------|-------|
| 2–4 parties/month | db-f1-micro | min=0, max=2 | ~$10/mo |
| Weekly events, 100+ guests | db-g1-small ($26/mo) | min=1, max=4 | ~$40/mo |
| Daily bar operations | db-custom-1-3840 ($50/mo) | min=1, max=10 | ~$80/mo |

### Free Tier Summary (what you get for $0)

- Cloud Run: 2M requests, 180k vCPU-sec, 360k GB-sec per month
- Cloud Storage: 5 GB, 50k reads, 5k writes per month
- Secret Manager: 6 active secrets, 10k accesses per month
- Artifact Registry: 0.5 GB storage
- GitHub Actions: 2,000 minutes/month
