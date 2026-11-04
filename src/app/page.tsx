import Link from "next/link";
import { ArrowRight, FileText, MessageSquare, PenSquare, Sparkles, Users } from "lucide-react";
import { PostCard } from "@/components/blog/post-card";
import { SearchInput } from "@/components/blog/search-input";
import { Pagination } from "@/components/blog/pagination";
import { buttonStyles } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getPopularTags, getSiteStats, listPosts } from "@/lib/queries";
import { cn } from "@/lib/utils";

type SearchParams = Promise<{ q?: string; tag?: string; page?: string }>;

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const { q, tag, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1") || 1);

  const [user, tags, stats, result] = await Promise.all([
    getCurrentUser(),
    getPopularTags(8),
    getSiteStats(),
    listPosts({ q, tag, page }),
  ]);

  const isFiltering = Boolean(q || tag);
  const [featured, ...rest] = result.items;
  const posts = !isFiltering && page === 1 && featured ? rest : result.items;

  return (
    <div className="pb-4">
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(60rem 30rem at 12% -10%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 70%), radial-gradient(45rem 28rem at 88% 0%, color-mix(in oklab, var(--accent) 16%, transparent), transparent 70%)",
          }}
        />
        <div className="container-page grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles aria-hidden className="size-3.5" />
              Codomax Full Stack Internship · Module 6
            </span>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
              Where full-stack builders{" "}
              <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                write it down
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              A production-grade blogging platform with authentication, a full authoring
              dashboard, comments, likes and search — built on Next.js 15, Prisma and
              PostgreSQL, and deployed on Vercel.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={user ? "/dashboard/posts/new" : "/register"} className={buttonStyles({ size: "lg" })}>
                <PenSquare aria-hidden className="size-4" />
                {user ? "Write a post" : "Start writing free"}
              </Link>
              <Link href="#feed" className={buttonStyles({ size: "lg", variant: "outline" })}>
                Browse articles
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
              <Stat icon={<FileText aria-hidden className="size-4" />} value={stats.posts} label="Articles" />
              <Stat icon={<Users aria-hidden className="size-4" />} value={stats.authors} label="Writers" />
              <Stat icon={<MessageSquare aria-hidden className="size-4" />} value={stats.comments} label="Comments" />
            </dl>
          </div>

          {/* Decorative card stack */}
          <div className="relative hidden lg:block" aria-hidden>
            <div className="absolute -left-6 top-10 h-56 w-72 rotate-[-7deg] rounded-2xl border border-border bg-surface/80 shadow-xl backdrop-blur" />
            <div className="absolute left-10 top-2 h-56 w-72 rotate-[4deg] rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 opacity-90 shadow-2xl" />
            <div className="relative ml-2 w-80 rotate-[-2deg] rounded-2xl border border-border bg-surface p-5 shadow-2xl">
              <div className="h-2.5 w-24 rounded-full bg-primary/30" />
              <div className="mt-4 space-y-2.5">
                <div className="h-3 w-full rounded-full bg-surface-muted" />
                <div className="h-3 w-11/12 rounded-full bg-surface-muted" />
                <div className="h-3 w-9/12 rounded-full bg-surface-muted" />
              </div>
              <div className="mt-5 flex items-center gap-2">
                <div className="size-8 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500" />
                <div className="space-y-1.5">
                  <div className="h-2 w-20 rounded-full bg-surface-muted" />
                  <div className="h-2 w-14 rounded-full bg-surface-muted" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- Feed */}
      <section id="feed" className="container-page scroll-mt-20 py-12">
        <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {q ? `Results for “${q}”` : tag ? `#${tag}` : "Latest articles"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.total} {result.total === 1 ? "post" : "posts"}
              {isFiltering ? " match your filters" : " published so far"}
            </p>
          </div>
          <SearchInput />
        </div>

        {/* Tag pills */}
        {tags.length > 0 ? (
          <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
            <Link
              href="/"
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                !tag && !q
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-surface-muted hover:text-foreground",
              )}
            >
              All
            </Link>
            {tags.map((item) => (
              <Link
                key={item.name}
                href={`/?tag=${encodeURIComponent(item.name)}`}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  tag === item.name
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                )}
              >
                #{item.name}
                <span className="ml-1.5 opacity-60">{item.count}</span>
              </Link>
            ))}
          </div>
        ) : null}

        {/* Grid */}
        {result.items.length === 0 ? (
          <div className="mt-14 flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
            <div className="mb-4 grid size-12 place-items-center rounded-xl bg-surface-muted text-muted-foreground">
              <FileText aria-hidden className="size-6" />
            </div>
            <h3 className="text-lg font-semibold">No posts found</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {isFiltering
                ? "Try a different search term or clear the filters to see everything."
                : "The blog is empty — be the first to publish something."}
            </p>
            <div className="mt-6 flex gap-2">
              {isFiltering ? (
                <Link href="/" className={buttonStyles({ variant: "outline", size: "sm" })}>
                  Clear filters
                </Link>
              ) : null}
              <Link href={user ? "/dashboard/posts/new" : "/register"} className={buttonStyles({ size: "sm" })}>
                Write the first post
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {!isFiltering && page === 1 && featured ? (
                <PostCard post={featured} featured index={0} />
              ) : null}
              {posts.map((post, index) => (
                <PostCard key={post.id} post={post} index={index + 1} />
              ))}
            </div>

            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              basePath="/"
              params={{ q, tag }}
            />
          </>
        )}
      </section>

      {/* ---------------------------------------------------------------- CTA */}
      <section className="container-page">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-12 text-center text-white sm:px-12">
          <div
            aria-hidden
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(30rem 16rem at 20% 0%, rgba(255,255,255,.6), transparent 60%), radial-gradient(28rem 14rem at 90% 100%, rgba(0,0,0,.5), transparent 60%)",
            }}
          />
          <div className="relative">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Have something worth sharing?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/85 sm:text-base">
              Create an account, draft in Markdown with a live preview, and publish in one click.
              Comments, likes and search are built in.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href={user ? "/dashboard/posts/new" : "/register"}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-indigo-700 shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <PenSquare aria-hidden className="size-4" />
                {user ? "Start a new post" : "Create your account"}
              </Link>
              <Link
                href="/about"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/40 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                How it was built
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-semibold tracking-tight">{value}</dd>
    </div>
  );
}
