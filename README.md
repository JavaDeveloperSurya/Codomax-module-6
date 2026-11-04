# Codomax Blog

**A production-ready full-stack blogging platform** — authentication, a Markdown authoring dashboard, comments, likes, search and tag filtering, built with Next.js 15, PostgreSQL and Prisma, and deployed on Vercel.

`Next.js 15` · `React 19` · `TypeScript` · `PostgreSQL` · `Prisma 6` · `Tailwind CSS v4` · `Vercel`

> **Codomax Full Stack Development Internship — Module 6 (Final)**
> Finalise the application · improve the UI, fix bugs & ensure mobile responsiveness · write a professional README · deploy with Vercel.

---

## Table of contents

- [Live demo](#live-demo)
- [Screenshots](#screenshots)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Database](#database)
- [API reference](#api-reference)
- [Authentication & security](#authentication--security)
- [Responsive design](#responsive-design)
- [Deploying to Vercel](#deploying-to-vercel)
- [Project structure](#project-structure)
- [Quality assurance](#quality-assurance)
- [Roadmap](#roadmap)
- [License](#license)

---

## Live demo

| Environment | URL |
| --- | --- |
| Production | _add your Vercel URL here after deploying, e.g._ `https://codomax-blog.vercel.app` |
| Repository | _add your GitHub URL here_ |

**Demo account** — email `ada@codomax.dev`, password `password123`.
The database is seeded with 3 authors, 8 published articles and 1 private draft.

---

## Screenshots

| Home feed (light) | Home feed (dark) |
| --- | --- |
| ![Home page](docs/screenshots/01-home-light.jpg) | ![Home page dark](docs/screenshots/02-home-dark.jpg) |

| Article page | Writer dashboard |
| --- | --- |
| ![Article page](docs/screenshots/04-post-detail.jpg) | ![Dashboard](docs/screenshots/10-dashboard.jpg) |

| Markdown editor with live preview | Mobile (390 px) |
| --- | --- |
| ![Editor](docs/screenshots/12-editor-preview.jpg) | ![Mobile](docs/screenshots/03-home-mobile.jpg) |

More in [`docs/screenshots`](docs/screenshots): topics index, login, about, search results, 404, mobile navigation and the mobile dashboard.

---

## Features

**For readers**

- Responsive article feed with a featured post, tag filters and pagination
- Debounced full-text search across titles, excerpts, bodies and tags (`/?q=prisma`)
- Article pages with generated cover art, table of contents, reading time and view counts
- Comments and optimistic likes (sign-in required)
- Light / dark / system theme, persisted across sessions
- SEO: per-page metadata, Open Graph tags, `sitemap.xml`, `robots.txt`

**For writers**

- Email + password authentication with hashed credentials and signed session cookies
- Dashboard with per-post views, likes, comments and draft/published status
- Markdown editor with a Write / Preview toggle and live reading-time estimate
- Tag chips (max 6), optional cover image, draft-then-publish workflow
- Full CRUD with ownership checks — authors can only edit or delete their own posts
- Public author profile pages

**Under the hood**

- Server Components for reading, Route Handlers for writing — no client-side data fetching for first paint
- Zod-validated request bodies with field-level error messages surfaced in the UI
- Prisma schema with migrations, cascade deletes and a unique constraint on `(postId, userId)` likes
- Skeleton loading states, error boundary, custom 404 and toast notifications

---

## Tech stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js 15** (App Router) | Server Components cut client JS; one project covers UI + API |
| Language | **TypeScript** (strict) | Types flow from the Prisma schema to the components |
| Database | **PostgreSQL** | Relational integrity for posts, comments and likes |
| ORM | **Prisma 6** | Declarative schema, versioned migrations, typed client |
| Styling | **Tailwind CSS v4** | Design tokens via CSS variables, dark mode, zero runtime CSS |
| Auth | **jose** (JWT) + **bcryptjs** | Stateless sessions that survive serverless cold starts |
| Validation | **Zod 4** | One schema validates the API and shapes form errors |
| Content | **react-markdown** + **remark-gfm** | Renders Markdown without `dangerouslySetInnerHTML` |
| Icons / UI | **lucide-react**, **sonner**, **next-themes** | Small, accessible, tree-shakeable |
| Hosting | **Vercel** + **Neon Postgres** | Git-based deploys, preview URLs, serverless Postgres |

---

## Architecture

```
Browser
  │
  ├─ Server Components (RSC) ──► Prisma ──► PostgreSQL      ← reads
  │     app/page.tsx, app/posts/[slug]/page.tsx
  │
  └─ Client Components ──► fetch ──► Route Handlers ──► Prisma ──► PostgreSQL   ← writes
        like, comment, editor, forms        app/api/**
```

**Why the split?** Reads benefit from rendering on the server (one round trip, no loading spinner, better SEO). Writes need optimistic UI, validation feedback and cache invalidation, so they go through explicit REST endpoints that any client — or `curl` — can call.

**Data model**

```
User 1─┬─* Post 1─┬─* Comment
       │          └─* Like  *──1 User
       └─* Comment / Like
```

- `Post.status` is `DRAFT` or `PUBLISHED`; drafts are only visible to their author.
- `Post.tags` is a `String[]`, indexed by Postgres for tag filtering.
- Deleting a post cascades to its comments and likes.
- `Like` has a `@@unique([postId, userId])` constraint, so a double like is impossible at the database level.

---

## Quick start

**Prerequisites:** Node.js 20+, npm 10+, and a PostgreSQL 14+ database (local, Docker, Neon or Supabase).

```bash
# 1. clone
git clone https://github.com/<your-username>/codomax-blog.git
cd codomax-blog

# 2. install dependencies (also runs `prisma generate`)
npm install

# 3. configure the environment
cp .env.example .env
#    then edit DATABASE_URL and AUTH_SECRET

# 4. create the schema and load demo content
npm run db:deploy     # apply the committed migration
npm run db:seed       # 3 authors, 8 posts, comments and likes

# 5. run it
npm run dev           # http://localhost:3000
```

Sign in with **ada@codomax.dev / password123**.

<details>
<summary>No local PostgreSQL? Start one with Docker</summary>

```bash
docker run --name codomax-pg -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres -e POSTGRES_DB=codomax_blog \
  -p 5432:5432 -d postgres:16
```

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codomax_blog?schema=public"
```
</details>

---

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | PostgreSQL connection string. Use the **pooled** string on Vercel (`-pooler` host for Neon). |
| `AUTH_SECRET` | ✅ | 32+ character random string used to sign session JWTs. Generate with `openssl rand -base64 32`. |
| `NEXT_PUBLIC_SITE_URL` | ➖ | Public base URL, used for canonical URLs, Open Graph and `sitemap.xml`. Defaults to `http://localhost:3000`. |

> The app refuses to sign or verify sessions if `AUTH_SECRET` is missing or shorter than 32 characters — a misconfiguration fails loudly instead of silently issuing weak tokens.

---

## Database

```bash
npm run db:migrate    # create + apply a migration from schema changes (development)
npm run db:deploy     # apply pending migrations (CI / production)
npm run db:seed       # insert demo authors, posts, comments, likes
npm run db:reset      # drop, migrate and re-seed from scratch
npm run db:studio     # browse data in Prisma Studio
```

Migrations live in `prisma/migrations/` and are committed. Never run `prisma db push` against a database with data you care about.

---

## API reference

All endpoints return JSON. Mutations require a valid session cookie; unauthorised requests get `401`, forbidden ones `403`, validation failures `422` with a `fields` map.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | — | Create an account and start a session |
| `POST` | `/api/auth/login` | — | Sign in |
| `POST` | `/api/auth/logout` | ✅ | Clear the session cookie |
| `GET` | `/api/posts` | — | List published posts (`?q=&tag=&page=&perPage=`) |
| `POST` | `/api/posts` | ✅ | Create a post (draft or published) |
| `GET` | `/api/posts/:id` | — | Fetch a single post |
| `PATCH` | `/api/posts/:id` | ✅ owner/admin | Update a post |
| `DELETE` | `/api/posts/:id` | ✅ owner/admin | Delete a post (cascades) |
| `POST` | `/api/posts/:id/like` | ✅ | Toggle like, returns `{ liked, count }` |
| `GET` | `/api/posts/:id/comments` | — | List comments |
| `POST` | `/api/posts/:id/comments` | ✅ | Add a comment |
| `DELETE` | `/api/comments/:id` | ✅ owner/admin | Delete a comment |

**Example**

```bash
curl -s "http://localhost:3000/api/posts?tag=prisma&perPage=3" | jq '.items[].title'

curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@codomax.dev","password":"password123"}' -c cookies.txt

curl -s -X POST http://localhost:3000/api/posts -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"title":"Hello world","excerpt":"A first post with enough characters.","content":"## Body\n\nAt least fifty characters of markdown content.","tags":["hello"],"status":"PUBLISHED"}'
```

---

## Authentication & security

- Passwords are hashed with **bcrypt** (cost factor 12) and never returned by any endpoint.
- Sessions are **stateless JWTs** (HS256, 7-day expiry) stored in an `httpOnly`, `Secure` (in production), `SameSite=Lax` cookie — unreadable by JavaScript, so XSS cannot exfiltrate them.
- `middleware.ts` bounces cookie-less requests away from `/dashboard` at the edge; the dashboard layout **and** every mutating handler then resolve the user from the database, so a deleted account or a role change takes effect immediately.
- Login returns the same message and timing for unknown emails and wrong passwords, preventing account enumeration.
- Ownership is enforced server-side on every post and comment mutation.
- Markdown is rendered by `react-markdown` — no `dangerouslySetInnerHTML`, so raw HTML in a post body is displayed as text.
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) are set in `next.config.ts`.

---

## Responsive design

Layouts were built mobile-first and verified from **320 px** upward.

| Breakpoint | Feed | Navigation | Dashboard |
| --- | --- | --- | --- |
| `< 640 px` | 1 column, full-width cards, scrollable tag row | Hamburger drawer with account actions | Stacked cards instead of a table |
| `640 – 1023 px` | 2 columns, featured post spans both | Inline nav, icon-only account menu | Table appears |
| `≥ 1024 px` | 3 columns, full-width featured hero | Full nav + labelled account menu | Sidebar + table, sticky article TOC |

Tap targets are at least 40×40 px, focus states are visible everywhere, `prefers-reduced-motion` disables animations, and there is a skip-to-content link.

---

## Deploying to Vercel

1. **Create the database.** In [Neon](https://neon.tech) (or Vercel → Storage → Postgres) create a project and copy the **pooled** connection string.
2. **Push the code to GitHub.**
   ```bash
   git init && git add . && git commit -m "feat: Codomax Blog — module 6"
   git branch -M main
   git remote add origin https://github.com/<your-username>/codomax-blog.git
   git push -u origin main
   ```
3. **Import the repo** in [vercel.com/new](https://vercel.com/new). Framework preset: **Next.js** — no other build settings needed.
4. **Add environment variables** (Production, Preview and Development):
   | Key | Value |
   | --- | --- |
   | `DATABASE_URL` | Neon pooled connection string |
   | `AUTH_SECRET` | output of `openssl rand -base64 32` |
   | `NEXT_PUBLIC_SITE_URL` | `https://<your-project>.vercel.app` |
5. **Deploy.** Vercel runs `npm install` → `postinstall` (`prisma generate`) → `vercel-build` (`prisma generate && prisma migrate deploy && next build`), so the schema is migrated automatically on every deploy.
6. **Seed the production data** once, from your machine:
   ```bash
   DATABASE_URL="<neon-pooled-url>" npm run db:seed
   ```
7. **Smoke test:** register an account, publish a post, add a comment, then check `/sitemap.xml` and `/robots.txt`.

<details>
<summary>Troubleshooting</summary>

| Symptom | Fix |
| --- | --- |
| `Can't reach database server` | Use the pooled `-pooler` host and append `?sslmode=require` |
| `Prisma Client is not generated` | Ensure `postinstall: prisma generate` is intact and the build cache isn't stale |
| Build fails on `prisma migrate deploy` | Check `DIRECT_URL`/pooling settings; migrations need a direct (non-pooled) connection on some providers |
| Sessions don't persist | `AUTH_SECRET` must be identical across environments; cookies are `Secure`, so test over HTTPS |
| Dashboard redirects in a loop | Clear cookies for the domain and confirm the cookie path is `/` |
</details>

---

## Project structure

```
codomax-blog/
├── prisma/
│   ├── schema.prisma           # User, Post, Comment, Like
│   ├── migrations/             # committed SQL migrations
│   └── seed.ts                 # demo authors, posts, comments, likes
├── src/
│   ├── app/
│   │   ├── layout.tsx          # shell: header, footer, theme, toaster
│   │   ├── page.tsx            # feed: hero, search, tags, pagination
│   │   ├── posts/[slug]/       # article page + comments
│   │   ├── authors/[id]/       # public author profile
│   │   ├── dashboard/          # protected: overview, new, edit
│   │   ├── login|register/     # auth pages
│   │   ├── tags|about/         # topics index, project write-up
│   │   ├── api/                # REST route handlers
│   │   ├── sitemap.ts, robots.ts, error.tsx, not-found.tsx
│   ├── components/
│   │   ├── ui/                 # button, input, badge, avatar, skeleton
│   │   ├── blog/               # cards, editor, comments, likes, search
│   │   ├── site-header.tsx, site-footer.tsx, theme-toggle.tsx
│   ├── lib/
│   │   ├── prisma.ts           # singleton client
│   │   ├── auth.ts             # JWT sessions, bcrypt
│   │   ├── queries.ts          # read layer (feed, tags, stats)
│   │   ├── posts.ts            # slug + tag helpers
│   │   ├── validation.ts       # Zod schemas
│   │   └── utils.ts            # cn, dates, reading time, cover art
│   └── middleware.ts           # dashboard edge guard
├── docs/screenshots/           # UI captures used in this README
├── .env.example
└── next.config.ts              # security headers, dev origins
```

---

## Quality assurance

Verified before the final deployment:

- **Auth** — register, login, logout, duplicate email (`409`), wrong password (`401`), redirect-back after login, dashboard guard.
- **CRUD** — draft → publish → edit (slug regenerates only when the title changes) → delete; drafts never appear in the public feed or search.
- **Permissions** — authors cannot edit/delete another author's post; only the comment author, the post author or an admin can delete a comment.
- **Validation** — empty/short title, over-long excerpt, 7th tag, bad cover URL and 1-character comment all produce inline field errors.
- **Responsiveness** — Chrome DevTools at 320, 375, 414, 768, 1024 and 1440 px; no horizontal scrolling; drawer nav closes on navigation.
- **Build** — `npm run lint`, `npm run typecheck` and `npm run build` pass with zero errors.
- **SEO** — `/sitemap.xml` and `/robots.txt` resolve; per-page titles and Open Graph tags present.

---

## Roadmap

- [ ] Integration tests for the auth and post endpoints (Vitest + Supertest)
- [ ] Image uploads to Vercel Blob
- [ ] RSS feed and a weekly email digest
- [ ] Comment moderation queue for post authors
- [ ] `revalidateTag` on publish to cache the feed at the edge

---

## License

MIT © 2026 — built as part of the Codomax Full Stack Development internship.
