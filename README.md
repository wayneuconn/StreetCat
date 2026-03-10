# StreetCat Bar | 街猫酒吧

Mobile-first cocktail bar management app for party bartenders.

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up database (PostgreSQL required)
# Update DATABASE_URL in .env.local
pnpm db:push

# Set admin password
pnpm set-password yourpassword
# Copy the hash to .env.local ADMIN_PASSWORD_HASH=...

# Seed with classic cocktails (optional)
pnpm db:seed

# Start dev server
pnpm dev
```

## Features

- **Guest Menu** — Browse tonight's cocktail menu, view details, place orders
- **Order Tracking** — Real-time order status (polling)
- **Admin Queue** — Live order queue with SSE, recipe sidebar
- **Inventory** — Ingredient CRUD with categories and quantities
- **Recipe Book** — Build a recipe collection with ingredient picker
- **Events** — Create events, build menus, auto-generate shopping lists
- **i18n** — Chinese (default) / English

## Tech Stack

Next.js 15 (App Router) | TypeScript | Tailwind CSS v4 | Drizzle ORM | PostgreSQL | SSE | next-intl

## Deploy to Cloud Run

```bash
docker build -t streetcat .
docker run -p 3000:3000 -e DATABASE_URL=... -e ADMIN_PASSWORD_HASH=... streetcat
```
