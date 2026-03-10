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
     │  Neon (PostgreSQL)│     │  Cloud Storage       │
     │  Serverless       │     │  streetcat-images-    │
     │  Free tier        │     │  489803               │
     │  Auto-suspend 5m  │     │  Public read          │
     │  us-east-1 (AWS)  │     │  (cocktail images)    │
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
| Database | PostgreSQL via Neon (serverless) | 17 |
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

**Recipe fields** (guest-facing): name, description, baseSpirit, flavor, characteristics, abv, price, imageUrl
**Recipe fields** (bartender-only): instructions, glassType, garnish

## Key Flows

**Guest**: `/menu` → `/menu/[itemId]` → `/order` → `/order/[orderId]/status` (polls every 5s)

**Admin**: `/admin/login` → `/admin` (dashboard) → `/admin/queue` (SSE live) → `/admin/inventory` → `/admin/recipes` → `/admin/events`

**Order real-time**: Guest places order → server action → DB insert → EventEmitter → SSE push → admin queue refreshes

**Shopping list**: For each menu item recipe, sum (ingredient amount × expected guests) − inventory on hand. Group by category.

**Guest name**: Persisted in localStorage so guests don't re-enter it between orders.

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

No manual deploy needed. Merge PR → auto-deploy in ~2 minutes.

---

## Cost Breakdown (Monthly Estimates)

### Scenario: Party Scale (1–2 events/month, 10–30 guests each)

| Service | Spec | Monthly Cost | Notes |
|---------|------|-------------|-------|
| **Neon** | Free tier, serverless PostgreSQL | **$0** | 0.5 GB storage, 190 compute hours. Auto-suspends after 5 min idle. |
| **Cloud Run** | 512 MB, 1 vCPU, min=0 | **$0** | Scale-to-zero. Free tier covers 2M requests/month. |
| **Artifact Registry** | Docker images | **~$0.02** | $0.10/GB storage. One image ~150 MB. |
| **Cloud Storage** | Cocktail images | **~$0.01** | A few MB of images. $0.020/GB/month. |
| **Secret Manager** | 2 secrets | **$0** | Free tier: 10,000 access operations/month. |
| **GitHub Actions** | ~2 min/deploy | **$0** | 2,000 free minutes/month. |
| | | | |
| **Total** | | **~$0/month** | Everything within free tiers |

### Why Neon over Cloud SQL

| | Cloud SQL (db-f1-micro) | Neon (free tier) |
|---|---|---|
| Cost | ~$9.37/mo | $0/mo |
| Always-on | Yes (24/7) | No (auto-suspends after 5 min idle) |
| Cold start | None | ~0.5s on first query after suspend |
| Storage | 10 GB SSD | 0.5 GB (plenty for party data) |
| Good for | Production apps needing constant uptime | Low-traffic apps with bursty usage |

Cloud SQL was 80%+ of cost. For 1–2 events/month, Neon's cold start is negligible and the savings are significant.

### Scaling Cost (if StreetCat grows)

| Scale | Database | Cloud Run | Total |
|-------|----------|-----------|-------|
| 1–2 parties/month, 10–30 guests | Neon free | min=0, max=2 | ~$0/mo |
| Weekly events, 50+ guests | Neon Launch ($19/mo) | min=0, max=4 | ~$19/mo |
| Daily bar operations | Neon Scale ($69/mo) | min=1, max=10 | ~$80/mo |

### Free Tier Summary (what you get for $0)

- **Neon**: 0.5 GB storage, 190 compute hours/month, auto-suspend
- **Cloud Run**: 2M requests, 180k vCPU-sec, 360k GB-sec/month
- **Cloud Storage**: 5 GB, 50k reads, 5k writes/month
- **Secret Manager**: 6 active secrets, 10k accesses/month
- **Artifact Registry**: 0.5 GB storage
- **GitHub Actions**: 2,000 minutes/month
