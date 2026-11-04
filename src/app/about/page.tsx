import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Database,
  GitBranch,
  Layers,
  Lock,
  Palette,
  Rocket,
  Server,
  Smartphone,
  Sparkles,
  TestTube,
} from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSiteStats } from "@/lib/queries";

export const metadata: Metadata = {
  title: "About this project",
  description:
    "How the Codomax Blog was built: architecture, technology choices, features and deployment.",
};

const STACK = [
  { name: "Next.js 15", detail: "App Router, Server Components, Route Handlers", icon: Layers },
  { name: "TypeScript", detail: "End-to-end type safety, strict mode", icon: GitBranch },
  { name: "PostgreSQL", detail: "Relational data, full-text friendly queries", icon: Database },
  { name: "Prisma ORM", detail: "Schema, migrations & typed client", icon: Server },
  { name: "Tailwind CSS v4", detail: "Design tokens, dark mode, responsive utilities", icon: Palette },
  { name: "Auth", detail: "bcrypt hashing + signed JWT in httpOnly cookies", icon: Lock },
  { name: "Zod", detail: "Request validation with typed errors", icon: Check },
  { name: "Vercel", detail: "CI/CD from Git, edge CDN, serverless functions", icon: Rocket },
];

const MODULE_6 = [
  "Finalise the full-stack blog application",
  "Improve UI, fix bugs and ensure mobile responsiveness",
  "Add a professional README file",
  "Deploy the application using Vercel",
];

export default async function AboutPage() {
  const stats = await getSiteStats();

  return (
    <div className="container-page py-12 sm:py-16">
      {/* Intro */}
      <div className="max-w-3xl">
        <Badge tone="primary">
          <Sparkles aria-hidden className="size-3" />
          Codomax Full Stack Internship
        </Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          A blog platform built end-to-end, then shipped
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Codomax Blog started as a learning exercise and ended up as a genuinely usable
          product: authors sign up, write in Markdown, publish, and readers can search,
          like and comment. This page documents what was built and the decisions behind it.
        </p>
      </div>

      {/* Stats */}
      <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Published articles", value: stats.posts },
          { label: "Registered writers", value: stats.authors },
          { label: "Reader comments", value: stats.comments },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-surface p-4 sm:p-5">
            <p className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
              {item.value.toLocaleString("en-GB")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Module 6 checklist */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">Module 6 objectives</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {MODULE_6.map((item, index) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {index + 1}
              </span>
              <span className="text-sm font-medium">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Stack */}
      <section id="stack" className="mt-16 scroll-mt-20">
        <h2 className="text-xl font-semibold tracking-tight">Technology stack</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Chosen for type safety, fast iteration and a smooth path to production — every
          piece has a free tier that works on Vercel.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STACK.map((item) => (
            <div key={item.name} className="rounded-xl border border-border bg-surface p-4">
              <item.icon aria-hidden className="size-5 text-primary" />
              <p className="mt-3 text-sm font-semibold">{item.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">What&apos;s inside</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Feature title="Secure authentication">
            Registration and login with bcrypt-hashed passwords and a stateless JWT session
            stored in an httpOnly, SameSite cookie. Middleware shields the dashboard.
          </Feature>
          <Feature title="Full authoring workflow">
            Create, edit, publish and delete posts. Drafts stay private to the author;
            publishing stamps a date and generates a unique slug.
          </Feature>
          <Feature title="Markdown with live preview">
            Write in Markdown, toggle to a rendered preview. Tables, code blocks and links
            all render safely — no raw HTML injection.
          </Feature>
          <Feature title="Discovery">
            Debounced search across titles, excerpts, bodies and tags, tag filters and
            paginated feeds that keep state in the URL.
          </Feature>
          <Feature title="Engagement">
            Threaded-by-time comments with permission checks, optimistic likes and view
            counters on every article.
          </Feature>
          <Feature title="Polish">
            Dark mode, skeleton loading states, toast notifications, keyboard-accessible
            components and layouts tested from 320 px up.
          </Feature>
        </div>
      </section>

      {/* Responsiveness */}
      <section className="mt-16">
        <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <Smartphone aria-hidden className="size-5 text-primary" />
          Responsive by default
        </h2>
        <div className="mt-5 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Breakpoint</th>
                <th className="px-4 py-3 font-medium">Behaviour</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">Mobile (&lt; 640px)</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Single column, drawer navigation, stacked dashboard rows, full-width actions
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">Tablet (640–1024px)</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Two-column grid, collapsible editor sidebar
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">Desktop (&gt; 1024px)</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Three-column feed, sticky article sidebar, full dashboard table
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Testing */}
      <section className="mt-16">
        <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <TestTube aria-hidden className="size-5 text-primary" />
          How it was verified
        </h2>
        <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
          <li>• Auth flows: register, login, logout, duplicate email, wrong password, protected routes.</li>
          <li>• CRUD: create → publish → edit → delete, including slug regeneration on title change.</li>
          <li>• Permissions: authors cannot edit or delete another author&apos;s post; only comment owners and post owners can delete comments.</li>
          <li>• Responsiveness checked at 320 px, 768 px and 1440 px in Chrome DevTools device mode.</li>
          <li>• Production build (<code className="rounded bg-surface-muted px-1 py-0.5 text-xs">next build</code>) and lint run clean before every deployment.</li>
        </ul>
      </section>

      <div className="mt-16 rounded-2xl border border-border bg-surface p-8 text-center">
        <h2 className="text-xl font-semibold tracking-tight">Want to try it yourself?</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Create an account and publish a post — or sign in with the demo credentials on the
          login page.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/register" className={buttonStyles()}>
            Create an account
            <ArrowRight aria-hidden className="size-4" />
          </Link>
          <Link href="/" className={buttonStyles({ variant: "outline" })}>
            Read the blog
          </Link>
        </div>
      </div>
    </div>
  );
}

function Feature({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}
