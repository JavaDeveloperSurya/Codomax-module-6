/**
 * Seed script — `npm run db:seed`
 * Idempotent: it clears the tables it owns before inserting demo content.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PASSWORD = "password123";

type SeedPost = {
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  content: string;
  authorIndex: number;
  publishedDaysAgo: number | null;
  views: number;
};

const AUTHORS = [
  {
    name: "Ada Lovelace",
    email: "ada@codomax.dev",
    bio: "Full-stack developer and Codomax mentor. Writes about React internals, database design and the craft of shipping software that stays maintainable.",
  },
  {
    name: "Rohit Mehra",
    email: "rohit@codomax.dev",
    bio: "Backend engineer. Happiest when a query plan gets faster and a Docker image gets smaller.",
  },
  {
    name: "Sofia Alvarez",
    email: "sofia@codomax.dev",
    bio: "Design-minded front-end developer focused on accessibility, motion and responsive systems.",
  },
];

const POSTS: SeedPost[] = [
  {
    title: "Building a Full-Stack Blog with Next.js 15 App Router",
    slug: "building-a-full-stack-blog-with-nextjs-15",
    excerpt:
      "Server Components, Route Handlers and Prisma in one project — a walkthrough of the architecture behind this site, from the database schema to the deployed build.",
    tags: ["nextjs", "prisma", "postgresql", "architecture"],
    authorIndex: 0,
    publishedDaysAgo: 2,
    views: 1243,
    content: `When I started the Codomax internship, a "full-stack app" meant two repos, a CORS configuration and a deployment pipeline I was slightly afraid of. By the final module it meant one repository, one deploy and a schema I could reason about end to end.

Here is the architecture behind this blog.

## One app, two runtimes

Next.js 15 lets you mix two kinds of code in the same project:

- **Server Components** fetch data on the server and stream HTML. No loading spinner, no \`useEffect\` waterfall.
- **Route Handlers** under \`app/api\` are plain HTTP endpoints — the same REST API you would have written with Express, minus the server setup.

The homepage is a Server Component that queries Postgres directly through Prisma:

\`\`\`ts
const result = await listPosts({ q, tag, page });
\`\`\`

The "like" button, on the other hand, is a Client Component that calls \`POST /api/posts/:id/like\`. Different problems, different tools.

## The schema

Four tables carry the whole product.

| Table | Purpose | Notes |
| --- | --- | --- |
| \`User\` | Accounts and profiles | Password stored as a bcrypt hash |
| \`Post\` | Articles | \`status\` is \`DRAFT\` or \`PUBLISHED\` |
| \`Comment\` | Discussion | Cascades when the post is deleted |
| \`Like\` | Reactions | Unique on \`(postId, userId)\` |

The unique constraint on the like table is doing real work: it makes double-liking impossible at the database level, not just in application code.

\`\`\`prisma
model Like {
  postId String
  userId String
  @@unique([postId, userId])
}
\`\`\`

## Auth in one paragraph

Passwords are hashed with bcrypt (cost 12). A successful login signs a short JWT containing the user id and role, and stores it in an **httpOnly, SameSite=Lax** cookie. Middleware checks for the cookie at the edge to guard \`/dashboard\`, and every route handler re-validates the token against the database before mutating anything.

> Never trust the client for authorisation. The UI hiding an "edit" button is a UX decision; the API returning \`403\` is the security control.

## What I would do differently

1. **Start with the schema.** I rewrote it twice because I modelled tags as a separate table too early.
2. **Cache deliberately.** \`revalidateTag\` on publish would cut database reads further.
3. **Write tests earlier.** Even two integration tests on the auth routes would have caught a session bug immediately.

The full source is in the project README — including the deployment steps.`,
  },
  {
    title: "Prisma Migrations Without the Panic",
    slug: "prisma-migrations-without-the-panic",
    excerpt:
      "A practical workflow for evolving a PostgreSQL schema safely: dev migrations, shadow databases, and why you should never run `prisma db push` against production.",
    tags: ["prisma", "postgresql", "backend"],
    authorIndex: 1,
    publishedDaysAgo: 5,
    views: 876,
    content: `Migrations are the part of a full-stack project people learn last and fear most. Here is the workflow I use now, and the failure modes it prevents.

## The two commands that matter

\`\`\`bash
# In development: create + apply a migration from schema changes
npx prisma migrate dev --name add_post_status

# In CI/production: apply pending migrations, never invent new ones
npx prisma migrate deploy
\`\`\`

That is the whole discipline. \`migrate dev\` diffs \`schema.prisma\` against your database, writes a timestamped SQL file, applies it, and regenerates the client. \`migrate deploy\` only replays files that already exist — which is exactly what you want during a deploy.

## Never \`db push\` in production

\`prisma db push\` syncs the schema without writing a migration file. It is great for a throwaway prototype and dangerous on real data: nothing records what changed, so there is no way to open a migration and see the \`DROP COLUMN\` that lost Friday's signups.

## Adding a required column to a live table

Adding \`status PostStatus @default(DRAFT)\` to \`Post\` is safe because existing rows can be filled by the default. Adding \`slug String @unique\` to a table with rows is not — the migration fails on duplicates. The safe sequence is:

1. Add the column as nullable.
2. Backfill values with a script.
3. Add the unique constraint in a second migration.
4. Make the column required.

Four steps, zero downtime, no panic.

## Seeding

\`\`\`json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
\`\`\`

With that in \`package.json\`, \`npx prisma migrate reset\` rebuilds a fully populated database in one command. It is the fastest way to onboard a teammate — or your future self after a break.

## A checklist before merging

- [ ] Migration file is committed alongside the schema change
- [ ] \`migrate deploy\` runs in the Vercel build step
- [ ] \`DATABASE_URL\` uses the pooled connection string
- [ ] Rollback plan exists (usually: a forward-fix migration)

Boring, predictable and reversible beats clever.`,
  },
  {
    title: "Designing a Responsive Layout That Actually Holds Up",
    slug: "designing-a-responsive-layout-that-holds-up",
    excerpt:
      "Fluid grids, container-aware spacing and the three breakpoints that matter. A field guide to interfaces that survive a 320px phone and a 4K monitor.",
    tags: ["css", "tailwindcss", "ui", "responsive"],
    authorIndex: 2,
    publishedDaysAgo: 8,
    views: 1541,
    content: `Responsive design is not "make it smaller on phones". It is deciding what to remove.

## Start at 320 px

Everything else is an enhancement. If a card, a form or a nav bar works at 320 px with a thumb, it will work everywhere. I build mobile-first and add complexity upwards.

\`\`\`html
<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
  <!-- one column by default, two at 640px, three at 1024px -->
</div>
\`\`\`

## Three breakpoints, not seven

| Breakpoint | Typical device | What changes |
| --- | --- | --- |
| 0–639 px | Phone | Single column, drawer nav, stacked actions |
| 640–1023 px | Tablet | Two columns, condensed meta |
| 1024 px+ | Laptop | Sidebars appear, tables replace cards |

More breakpoints means more states to test. Three is enough for a content site.

## Cards become lists

A dashboard table is unusable at 375 px. Rather than shrinking columns, render a **different component** on small screens:

- Desktop: \`<table>\` with sortable columns.
- Mobile: stacked rows with the title, a status badge and an icon-only action group.

Same data, two presentations, one breakpoint.

## Touch targets are a layout constraint

44×44 px is the floor for anything tappable. That single rule changes padding, icon size and the number of actions you can put in a row — which is why mobile layouts often need to *remove* features rather than rearrange them.

## Test the awkward widths

Not just iPhone and MacBook. Try 320, 375, 414, 768, 820 (iPad portrait), 1024 and 1440. The breakage lives in the gaps.

\`\`\`css
/* Container queries finally make components portable */
.card { container-type: inline-size; }

@container (min-width: 30rem) {
  .card__body { display: grid; grid-template-columns: 12rem 1fr; }
}
\`\`\`

Container queries are the biggest shift since media queries: components adapt to *their* space instead of the viewport.`,
  },
  {
    title: "JWT Sessions vs. Database Sessions: Choosing for a Small App",
    slug: "jwt-vs-database-sessions",
    excerpt:
      "Both work. They fail differently. A short comparison with the trade-offs that actually matter when you are deploying to serverless.",
    tags: ["auth", "security", "backend", "nextjs"],
    authorIndex: 1,
    publishedDaysAgo: 12,
    views: 934,
    content: `Every tutorial picks one and moves on. The interesting part is why.

## Stateless JWT sessions

The server signs a token, the browser stores it in a cookie, and each request carries proof of identity.

**Pros**
- No database round-trip to check a session
- Perfect for serverless and edge functions
- Scales horizontally without shared state

**Cons**
- Revocation is hard — a stolen token is valid until it expires
- Role changes only apply when the token is refreshed
- You must never store secrets in the payload (it is signed, not encrypted)

## Database sessions

A random session id points at a row in your database.

**Pros**
- Instant revocation: delete the row, the session dies
- Full audit trail of active devices
- Easy "sign out everywhere"

**Cons**
- One extra query per authenticated request
- Requires shared storage across instances

## What this project does

A hybrid: the token is a JWT **and** every authenticated route resolves the user from the database before mutating data.

\`\`\`ts
const session = await readSessionToken(token);
const user = await prisma.user.findUnique({ where: { id: session.id } });
if (!user) return null; // deleted account = dead session
\`\`\`

That gives serverless-friendly verification with the revocation behaviour of a database session, at the cost of one indexed lookup per request. For a blog, that is the right trade.

## Practical rules

- Expire sessions in 7 days, not 7 months.
- \`httpOnly\`, \`Secure\`, \`SameSite=Lax\` — all three, not two.
- Rotate \`AUTH_SECRET\` and every session invalidates at once (a feature).
- Hash passwords with bcrypt or argon2. Never encrypt them; you never need them back.`,
  },
  {
    title: "The 12 Bugs I Fixed Before Deploying",
    slug: "twelve-bugs-i-fixed-before-deploying",
    excerpt:
      "Hydration mismatches, stale closures, duplicate slugs and a cookie that would not clear. A tour of the bugs found during the final QA pass — and the fix for each.",
    tags: ["debugging", "nextjs", "react", "qa"],
    authorIndex: 0,
    publishedDaysAgo: 16,
    views: 2104,
    content: `Module 6 was mostly bug hunting. Here are the ones worth remembering.

## 1. Hydration mismatch from a date

Formatting a date with \`toLocaleDateString()\` produced a different string on the server and the client. The fix: format with a fixed locale and timezone.

\`\`\`ts
new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ... }).format(date)
\`\`\`

## 2. Event handler in a Server Component

\`onError\` on an \`<img>\` inside a Server Component throws at build time. Either move it into a Client Component or drop the handler. I made the cover component a client component and kept the gradient fallback.

## 3. Stale closure in a debounced search

The debounce captured the first \`searchParams\`. Fix: include the dependency in the effect and rebuild the URL from the current value.

## 4. Duplicate slug on rapid double-publish

Two posts titled "Hello World" collided. Fix: a bounded loop that appends \`-2\`, \`-3\` before insert, plus a unique constraint as the real guarantee.

## 5. Cookie that would not clear

\`cookies().delete()\` silently failed with a mismatched path. Setting the same cookie name with \`maxAge: 0\` and the original path works everywhere.

## 6. Prisma client exhaustion in dev

Hot reload created a new \`PrismaClient\` per edit until Postgres refused connections. Fix: the \`globalThis\` singleton.

\`\`\`ts
export const prisma = globalThis.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
\`\`\`

## 7. Likes counted twice

Optimistic update *and* a refetch both incremented. Fix: server returns the authoritative count; the client replaces state with it.

## 8–12: the quieter ones

- Mobile drawer left \`body\` scroll locked after navigation.
- \`params\` and \`searchParams\` are promises in Next 15 — \`await\` them.
- Draft posts leaked into the public feed through the search branch.
- Long words in post titles overflowed cards (fixed with \`line-clamp\` and \`break-words\`).
- \`next/image\` rejected a remote host I had not whitelisted; a plain \`<img>\` with a gradient fallback was the right call for user-supplied URLs.

> The lesson: the last 10% of a project is not polish. It is the product.

Every fix above has a test or a manual step in the README's QA checklist, so I will not re-break them next time.`,
  },
  {
    title: "Deploying Next.js to Vercel: A Checklist That Prevents 3am Rollbacks",
    slug: "deploying-nextjs-to-vercel-checklist",
    excerpt:
      "Environment variables, pooled database connections, build commands and preview deployments — everything to configure once so deploys stay boring.",
    tags: ["vercel", "deployment", "devops", "nextjs"],
    authorIndex: 1,
    publishedDaysAgo: 20,
    views: 1789,
    content: `Deployment is a feature. Treat it like one.

## 1. Connect the repo

Import the GitHub repository in Vercel. Framework preset: **Next.js**. Build command: leave it to \`npm run build\` — or add a \`vercel-build\` script when you need migrations.

\`\`\`json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
\`\`\`

## 2. Environment variables

| Variable | Where it comes from |
| --- | --- |
| \`DATABASE_URL\` | Neon / Vercel Postgres — use the **pooled** string |
| \`AUTH_SECRET\` | \`openssl rand -base64 32\` |
| \`NEXT_PUBLIC_SITE_URL\` | Your production domain |

Set them for Production, Preview and Development. A missing variable in the Preview environment is the most common cause of a green build and a 500 at runtime.

## 3. Serverless needs a pooled connection

Every function invocation is its own process. Without pooling you exhaust Postgres connections under modest traffic. Neon's \`-pooler\` hostname (or Prisma Accelerate) handles this; set \`?pgbouncer=true&connection_limit=1\` if your provider asks for it.

## 4. Generate the client at build time

Vercel does not have your generated client unless the build step creates it. \`prisma generate\` in \`postinstall\` is the safest place.

\`\`\`json
{ "scripts": { "postinstall": "prisma generate" } }
\`\`\`

## 5. Verify before you announce

- Visit \`/sitemap.xml\` and \`/robots.txt\`
- Register a throwaway account in production
- Publish, edit and delete a post
- Check the cookie is \`Secure\` and \`httpOnly\` in DevTools
- Run Lighthouse on a cold cache

## 6. Preview deployments

Every pull request gets its own URL. Point it at a branch database and you can test migrations before they touch production data. This alone is worth using Vercel.

> A deploy you cannot reproduce locally is a deploy you cannot debug.

Ship small, ship often, and keep the checklist in the repo.`,
  },
  {
    title: "Writing a README Recruiters Actually Read",
    slug: "writing-a-readme-recruiters-actually-read",
    excerpt:
      "Badges, a one-line pitch, screenshots, and a five-command quick start. The anatomy of a project README that turns a repository into a portfolio piece.",
    tags: ["career", "documentation", "opensource"],
    authorIndex: 2,
    publishedDaysAgo: 26,
    views: 1320,
    content: `Most project READMEs open with "## Installation". Nobody installs anything before they know what the project does.

## Structure that works

1. **Name + one-line pitch** — one sentence, no jargon.
2. **Badges** — build status, stack, licence. Three is plenty.
3. **Screenshot** — the single highest-value asset in the file.
4. **Feature list** — six bullets, outcomes not technologies.
5. **Tech stack table** — why each choice was made.
6. **Quick start** — five commands, copy-pasteable.
7. **Environment variables** — a table with example values.
8. **API reference** — endpoints, method, auth, payload.
9. **Deployment** — how it ships, with a link to the live URL.
10. **Roadmap / licence** — signals the project is real.

## The five-command rule

\`\`\`bash
git clone https://github.com/you/project.git
cd project
npm install
cp .env.example .env
npm run dev
\`\`\`

If someone needs more than that, add a \`docker-compose.yml\` — do not add prose.

## Screenshots, done properly

- Use the real app, with real data.
- Capture desktop **and** mobile next to each other.
- Compress to WebP; a 4 MB PNG is a broken page on mobile data.
- Put them in \`docs/screenshots/\` and reference them relatively.

## Write for the skimmer

Headings, tables, short paragraphs and code blocks. Bold the outcome, not the tool: "One-click publishing" beats "Uses Prisma 6.19".

> A README is a product page for developers. You have about eight seconds.

Keep it truthful, keep it current, and update the screenshot the moment the UI changes.`,
  },
  {
    title: "From Internship to Portfolio: What I Learned Shipping Module 6",
    slug: "from-internship-to-portfolio-module-6",
    excerpt:
      "Six modules, one deployed product. Honest notes on scoping, debugging, responsive design and the difference between code that runs and code that ships.",
    tags: ["career", "learning", "fullstack"],
    authorIndex: 0,
    publishedDaysAgo: 31,
    views: 2540,
    content: `Six weeks ago I could build a React page. Today I can ship a database-backed product with authentication, a content workflow and a deployment pipeline. Here is what actually moved the needle.

## 1. Scope is a skill

My first plan had reactions, notifications, a rich-text editor and an admin analytics dashboard. The version that shipped has likes, comments, search and drafts — and it works. The rest is on the roadmap, which is a much better place for it than a half-finished branch.

## 2. Read your own error messages

Ninety percent of my bugs were solved by reading the stack trace properly instead of adding \`console.log\` in three places. Next.js error overlays tell you the file and line; the browser tells you the failed request and status; Prisma tells you the constraint that was violated.

## 3. Responsiveness is not optional polish

More than half of readers arrive on a phone. When I resized the feed to 375 px, three things broke: the header, the dashboard table and the editor sidebar. Each got a deliberate mobile design, not a shrink.

## 4. Deployment teaches you things localhost hides

Environment variables, connection pooling, \`NODE_ENV\` differences, build-time generation. The application I deployed is meaningfully different from the one that ran on my laptop — and better.

## 5. Documentation is part of the deliverable

The README, the \`.env.example\` and the seed script are the difference between "a project" and "a project someone else can run". Recruiters do try.

## What is next

- Integration tests around the auth routes
- Image uploads to Vercel Blob
- RSS feed and newsletter digest
- Comment moderation for the post owner

## The honest summary

The app is not the most advanced thing ever built. It is **complete**: schema, API, UI, auth, error states, responsive layout, README, deployment. Completeness is rarer than cleverness, and much more useful in a portfolio.`,
  },
];

const COMMENTS = [
  "This is the clearest explanation of that I have read. The table comparing the two approaches made it click.",
  "Bookmarked. I hit the exact hydration bug last week and had no idea why.",
  "The checklist at the end is going straight into my PR template.",
  "Would love a follow-up on caching and revalidation — this is where I still get confused.",
  "Great write-up. One nit: the pooled connection string caught me out too, took me an hour to spot the `-pooler` suffix.",
  "Thank you for including the parts that went wrong. Most tutorials skip the debugging entirely.",
];

async function main() {
  console.log("→ Clearing existing data…");
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  console.log("→ Creating authors…");
  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  const users = [];
  for (const author of AUTHORS) {
    users.push(
      await prisma.user.create({
        data: { ...author, passwordHash, role: "AUTHOR" },
      }),
    );
  }

  console.log("→ Creating posts…");
  const created = [];
  for (const post of POSTS) {
    const publishedAt =
      post.publishedDaysAgo === null
        ? null
        : new Date(Date.now() - post.publishedDaysAgo * 24 * 60 * 60 * 1000);

    created.push(
      await prisma.post.create({
        data: {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          tags: post.tags,
          status: publishedAt ? "PUBLISHED" : "DRAFT",
          publishedAt,
          views: post.views,
          authorId: users[post.authorIndex].id,
        },
      }),
    );
  }

  console.log("→ Adding comments and likes…");
  for (const [index, post] of created.entries()) {
    const commentCount = (index % 3) + 2;
    for (let i = 0; i < commentCount; i += 1) {
      const commenter = users[(index + i + 1) % users.length];
      await prisma.comment.create({
        data: {
          body: COMMENTS[(index + i) % COMMENTS.length],
          postId: post.id,
          authorId: commenter.id,
          createdAt: new Date(Date.now() - (i + 1) * 3 * 60 * 60 * 1000),
        },
      });
    }

    for (const user of users) {
      if (user.id === post.authorId) continue;
      if ((index + users.indexOf(user)) % 2 === 0) {
        await prisma.like.create({ data: { postId: post.id, userId: user.id } });
      }
    }
  }

  // A private draft so the dashboard shows both states.
  await prisma.post.create({
    data: {
      title: "Draft: Testing Strategy for a Small Next.js App",
      slug: "draft-testing-strategy-for-a-small-nextjs-app",
      excerpt:
        "Notes in progress on what is actually worth testing in a small full-stack app — and what is a waste of time.",
      content: `# Draft\n\nStill collecting notes.\n\n## Open questions\n\n- Is Playwright worth it for a project this size?\n- Where do integration tests stop and E2E start?\n`,
      tags: ["testing", "nextjs"],
      status: "DRAFT",
      authorId: users[0].id,
      views: 0,
    },
  });

  const counts = {
    users: await prisma.user.count(),
    posts: await prisma.post.count(),
    comments: await prisma.comment.count(),
    likes: await prisma.like.count(),
  };

  console.log("\n✓ Seed complete");
  console.table(counts);
  console.log(`\nLogin with: ${AUTHORS[0].email} / ${PASSWORD}\n`);
}

main()
  .catch((error) => {
    console.error("✗ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
