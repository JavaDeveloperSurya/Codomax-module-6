import type { Metadata } from "next";
import Link from "next/link";
import { Eye, FileText, Heart, MessageSquare, PenSquare, Send, Sparkles } from "lucide-react";
import { PostRowActions } from "@/components/blog/post-row-actions";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [posts, aggregates] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        views: true,
        tags: true,
        updatedAt: true,
        publishedAt: true,
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.post.aggregate({
      where: { authorId: user.id },
      _sum: { views: true },
    }),
  ]);

  const published = posts.filter((post) => post.status === "PUBLISHED");
  const drafts = posts.filter((post) => post.status === "DRAFT");
  const likes = posts.reduce((total, post) => total + post._count.likes, 0);
  const comments = posts.reduce((total, post) => total + post._count.comments, 0);

  const stats = [
    { label: "Published", value: published.length, icon: Send },
    { label: "Drafts", value: drafts.length, icon: FileText },
    { label: "Total views", value: aggregates._sum.views ?? 0, icon: Eye },
    { label: "Likes", value: likes, icon: Heart },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Hello, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {posts.length === 0
              ? "You haven't written anything yet — your first post is one click away."
              : `You have ${published.length} published ${published.length === 1 ? "post" : "posts"} and ${drafts.length} draft${drafts.length === 1 ? "" : "s"}.`}
          </p>
        </div>
        <Link href="/dashboard/posts/new" className={buttonStyles()}>
          <PenSquare aria-hidden className="size-4" />
          New post
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <stat.icon aria-hidden className="size-3.5" />
              {stat.label}
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
              {stat.value.toLocaleString("en-GB")}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Your posts</h2>
          <span className="text-xs text-muted-foreground">
            {comments} comment{comments === 1 ? "" : "s"} received
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="grid size-12 place-items-center rounded-xl bg-surface-muted text-muted-foreground">
              <Sparkles aria-hidden className="size-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold">No posts yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Drafts are private. Publish when you&apos;re ready — you can always edit later.
            </p>
            <Link href="/dashboard/posts/new" className={buttonStyles({ size: "sm", className: "mt-5" })}>
              <PenSquare aria-hidden className="size-4" />
              Write your first post
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Title</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Stats</th>
                    <th className="px-3 py-3 font-medium">Updated</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="border-b border-border last:border-0 hover:bg-surface-muted/50">
                      <td className="max-w-xs px-5 py-3.5">
                        <Link
                          href={`/posts/${post.slug}`}
                          className="line-clamp-1 font-medium hover:text-primary"
                        >
                          {post.title}
                        </Link>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs text-muted-foreground">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        {post.status === "PUBLISHED" ? (
                          <Badge tone="success">Published</Badge>
                        ) : (
                          <Badge tone="warning">Draft</Badge>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Eye aria-hidden className="size-3.5" /> {post.views.toLocaleString("en-GB")}
                        </span>
                        <span className="ml-3 inline-flex items-center gap-1">
                          <Heart aria-hidden className="size-3.5" /> {post._count.likes}
                        </span>
                        <span className="ml-3 inline-flex items-center gap-1">
                          <MessageSquare aria-hidden className="size-3.5" /> {post._count.comments}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-xs text-muted-foreground">
                        {formatDate(post.updatedAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end">
                          <PostRowActions postId={post.id} slug={post.slug} title={post.title} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y divide-border md:hidden">
              {posts.map((post) => (
                <li key={post.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/posts/${post.slug}`} className="line-clamp-2 text-sm font-medium">
                      {post.title}
                    </Link>
                    <PostRowActions postId={post.id} slug={post.slug} title={post.title} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {post.status === "PUBLISHED" ? (
                      <Badge tone="success">Published</Badge>
                    ) : (
                      <Badge tone="warning">Draft</Badge>
                    )}
                    <span>{formatDate(post.updatedAt)}</span>
                    <span className="inline-flex items-center gap-1">
                      <Eye aria-hidden className="size-3.5" /> {post.views.toLocaleString("en-GB")}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Heart aria-hidden className="size-3.5" /> {post._count.likes}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare aria-hidden className="size-3.5" /> {post._count.comments}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
