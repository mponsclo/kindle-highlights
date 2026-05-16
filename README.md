<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/lockup-dark.svg">
  <img src="public/lockup.svg" alt="Kindle Highlights" height="72">
</picture>

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A quiet home for your Kindle highlights. Drop a `My Clippings.txt` file on it
and the app parses every highlight, groups them by book, and gives you a
typographic reading interface — fast server-rendered pages, a real reading
measure, and an amber highlighter that marks every quote the way you'd
underline a book by hand.

![Landing page in light mode](docs/screenshots/landing-light.png)

---

## At a glance

| | |
|---|---|
| **Framework** | Next.js 15 (App Router, RSC, Turbopack) |
| **UI** | React 19 · Tailwind CSS v4 · Lucide icons |
| **Language** | TypeScript (strict) |
| **Database** | PostgreSQL via Prisma |
| **Tests** | Vitest · 52 unit + route tests |
| **CI** | GitHub Actions — lint, typecheck, test, build |
| **Design** | Near-monochrome zinc palette, amber-as-highlighter, Inter + JetBrains Mono |

---

## What it does

- **Parses `clippings.txt`** — supports books with or without trailing `(Author)`
  metadata, strips UTF-8 BOM, merges underscore/colon title variants (e.g. the
  Amazon export `Sapiens_ A Brief History` and `Sapiens: A Brief History` become
  one book).
- **Groups by book** — deep reads (more than 5 highlights) above lighter picks,
  sorted by highlight count.
- **Searches everywhere** — URL-synced server-side search on the dashboard;
  within-book search on the detail page, scoped to content only.
- **Paginates large books** — 50 highlights per page with a *Load more* button
  and abort-safe request sequencing, so fast search-while-loading can't
  duplicate rows.
- **Dedupe at the database** — `@@unique([bookId, content])` plus Prisma's
  `createMany({ skipDuplicates: true })`, so re-uploading the same file is a
  no-op instead of silent corruption.
- **Dark mode** — class-based via `@custom-variant dark` (Tailwind v4 no longer
  defaults to `prefers-color-scheme` only); theme flash script in the root
  layout prevents a light-mode flash on reload.
- **Accessible baseline** — real `<main>` landmark, working skip link, amber
  focus rings everywhere.

### Gallery

| | Light | Dark |
|---|---|---|
| **Landing** | ![Landing light](docs/screenshots/landing-light.png) | ![Landing dark](docs/screenshots/landing-dark.png) |
| **Dashboard** | ![Dashboard light](docs/screenshots/dashboard-light.png) | ![Dashboard dark](docs/screenshots/dashboard-dark.png) |
| **Book detail** | ![Book light](docs/screenshots/book-light.png) | ![Book dark](docs/screenshots/book-dark.png) |

The signature motif is the amber highlighter span behind every quote —
rendered with a two-stop linear gradient so the bottom ~40 % of the text is
washed in `--accent-tint`, mimicking a real marker that didn't quite line up.

---

## Run it locally

### Prerequisites

- Node 20+ (matches CI)
- A running PostgreSQL. Anything works — local install, Docker, Neon, Supabase,
  Vercel Postgres. The quickest way is Docker:

```bash
docker run --name kindle-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=kindle \
  -p 5432:5432 -d postgres:16
```

### Setup

```bash
git clone https://github.com/mponsclo/kindle-highlights.git
cd kindle-highlights
npm ci

# Env — validated by zod at startup (see src/lib/env.ts)
echo 'DATABASE_URL="postgres://postgres:postgres@localhost:5432/kindle"' > .env

# Apply the schema (no migrations folder — schema is the source of truth)
npx prisma generate
npx prisma db push

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and drop `My Clippings.txt`
on the upload card. Your library appears at `/dashboard`.

### npm scripts

| Script | What it does |
|---|---|
| `npm run dev` | Next.js dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start the built app |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Run the full Vitest suite once |
| `npm run test:watch` | Watch mode |
| `npm run fix-duplicates` | One-off script that merges books with near-identical titles (`scripts/fix-duplicates.ts`) |

---

## Finding your clippings file

1. Connect your Kindle to your computer via USB.
2. Open the Kindle drive → `documents/`.
3. Find `My Clippings.txt` and drop it on the upload card.

The parser accepts:

- Highlights (`- Your Highlight on page X | location A-B | Added on …`). Bookmarks
  and Notes are recognized but ignored — bookmarks have no content and notes
  aren't yet rendered.
- Titles with or without `(Author)` suffixes. A title without parens is kept
  and tagged `Unknown` rather than silently dropped.
- UTF-8 BOM at the start of title lines (Amazon sometimes adds it).
- Underscore↔colon equivalence, plus stripping of trailing `(Spanish Edition)`
  style qualifiers.

---

## Data model

```prisma
Book      (id, title, author, createdAt, @@index(title), @@index(author))
Highlight (id, content, page, location, dateAdded, bookId, createdAt,
           @@unique([bookId, content]), @@index(bookId))
Tag       (id, name @unique, color)
HighlightTag (highlightId, tagId)   // many-to-many; read path works, no write UI yet
```

`@@unique([bookId, content])` is the anti-duplicate source of truth. The upload
route deduplicates intra-batch first (a single file often contains the same
highlight twice if you re-marked it), then relies on `skipDuplicates: true` at
the DB layer.

---

## API

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/upload` | `multipart/form-data` with a `file` field. Returns `{ success, stats: { totalHighlights, newBooks, existingBooks, skippedHighlights, totalBooks } }` |
| `GET`  | `/api/books` | `?search=&page=&limit=&bookId=&includeAll=` (only `search`/pagination used by the dashboard — `bookId/includeAll` retained for legacy callers) |
| `GET`  | `/api/highlights` | `?bookId=&search=&limit=&offset=`. With `bookId`, `search` scopes to content. Returns `{ highlights, total, hasMore }` |
| `DELETE` | `/api/highlights?id=` | Single-row delete |

All responses that can fail return `{ success: false, error, code }`. The
generic `handleApiError` helper (`src/lib/utils.ts`) never leaks raw Prisma
error messages to clients — you'll see `INTERNAL_ERROR` instead of
`Can't reach database server at localhost:5432`.

---

## Project layout

```
src/
├── app/
│   ├── api/
│   │   ├── books/route.ts
│   │   ├── highlights/route.ts
│   │   └── upload/route.ts         # parses + createMany({ skipDuplicates })
│   ├── book/[id]/
│   │   ├── page.tsx                # RSC: metadata + notFound()
│   │   ├── BookDetailClient.tsx    # paginated, abort-safe, dedupeById
│   │   └── loading.tsx
│   ├── dashboard/
│   │   ├── page.tsx                # RSC: reads ?q= and queries Prisma directly
│   │   ├── DashboardSearch.tsx     # client input that syncs ?q=
│   │   └── loading.tsx
│   ├── globals.css                 # design tokens + @custom-variant dark + .highlighter
│   ├── layout.tsx
│   └── page.tsx                    # landing
├── components/
│   ├── BookCard.tsx                # typographic tile wrapped in <Link>
│   ├── HighlightCard.tsx           # blockquote + .highlighter span
│   ├── SearchBar.tsx               # debounced, accessible, aborts via useDebounce
│   ├── FileUploader.tsx            # drag/drop .txt, 10 MB cap
│   ├── ThemeToggle.tsx
│   ├── SkipToContent.tsx
│   └── ErrorBoundary.tsx
├── lib/
│   ├── env.ts                      # zod-validated DATABASE_URL/NODE_ENV
│   ├── parser.ts                   # handles BOM, no-author, dash duplication
│   ├── prisma.ts                   # singleton client
│   ├── validation.ts               # Validator class + schemas
│   ├── utils.ts                    # cn, debounce, AppError, handleApiError
│   └── types.ts
└── lib/*.test.ts                   # Vitest suites co-located with source
```

---

## Testing & CI

- **Vitest** covers the parser (Kindle edge cases — BOM, no-author, duplicate
  highlights, dash-author dedupe, all three date formats), the `Validator`, the
  utility helpers, and the `/api/upload` route with a mocked Prisma client.
- **GitHub Actions** (`.github/workflows/ci.yml`) runs `lint → typecheck →
  test → build` on every push to `prod` and every PR. A dummy `DATABASE_URL`
  is supplied because env validation runs at import time — Prisma doesn't
  connect during build/test, it just needs the value to exist.

Run the full pipeline locally:

```bash
DATABASE_URL="postgres://postgres:postgres@localhost:5432/kindle" \
  npm run lint && npm run typecheck && npm test && npm run build
```

---

## Deployment

- Any Next.js host works. Vercel is the path of least resistance because Prisma
  has first-class adapters there.
- Required env: `DATABASE_URL`. The `env.ts` validator fails fast if it's
  missing or not a URL.
- If you use a serverless Postgres (Neon, Vercel Postgres), set
  `?sslmode=require&pgbouncer=true` on the connection string for a pooled
  build.
- After deploy, run `npx prisma db push` against the target database to sync
  the schema — there's no `migrations/` folder; `db push` is the source of
  truth.

---

## Things to know

- **Branch**: `prod` is the default and the only long-lived branch.
- **Trademark**: "Kindle" is an Amazon trademark. This project is a fan
  utility — rename before publishing anywhere commercial.
- **Tags**: the `Tag` + `HighlightTag` models exist and are rendered by
  `HighlightCard` when present, but there's no write UI yet.
- **Rate limiting**: none on `/api/upload`. If you deploy this beyond a
  personal account, put it behind a rate limiter (Upstash, Vercel WAF).

## License

MIT.
