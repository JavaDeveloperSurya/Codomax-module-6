import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Eye, Heart, MessageSquare } from "lucide-react";
import { CommentDelete } from "@/components/blog/comment-delete";
import { CommentForm } from "@/components/blog/comment-form";
import { LikeButton } from "@/components/blog/like-button";
import { Markdown } from "@/components/blog/markdown";
import { PostCard } from "@/components/blog/post-card";
import { PostCover } from "@/components/blog/post-cover";
import { ShareButton } from "@/components/blog/share-button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPostBySlug, getRelatedPosts, incrementViews } from "@/lib/queries";
import { absoluteUrl, formatDate, formatRelative, readingTime } from "@/lib/utils";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: absoluteUrl(`/posts/${post.slug}`) },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: absoluteUrl(`/posts/${post.slug}`),
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const [post, user] = await Promise.all([getPostBySlug(slug), getCurrentUser()]);

  if (!post) notFound();

  const isOwner = user?.id === post.author.id;
  const canView = post.status === "PUBLISHED" || isOwner || user?.role === "ADMIN";
  if (!canView) notFound();

  const [liked, related] = await Promise.all([
    user
      ? prisma.like
          .findUnique({ where: { postId_userId: { postId: post.id, userId: user.id } } })
          .then(Boolean)
      : Promise.resolve(false),
    getRelatedPosts(post.id, post.tags),
  ]);

  if (post.status === "PUBLISHED") await incrementViews(post.id);

  const published = post.publishedAt ?? post.createdAt;

  return (
    <div className="container-page py-8 sm:py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Back to all posts
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
        <article className="min-w-0">
          <header>
            <div className="flex flex-wrap items-center gap-2">
              {post.status === "DRAFT" ? <Badge tone="warning">Draft — only visible to you</Badge> : null}
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/?tag=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:border-ring/40 hover:text-foreground"
                >
                  #{tag}
                </Link>
              ))}
            </div>

            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              {post.title}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {post.excerpt}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-border py-4">
              <Link href={`/authors/${post.author.id}`} className="group flex items-center gap-2.5">
                <Avatar name={post.author.name} size="md" />
                <span>
                  <span className="block text-sm font-medium group-hover:text-primary">
                    {post.author.name}
                  </span>
                  <time dateTime={new Date(published).toISOString()} className="block text-xs text-muted-foreground">
                    {formatDate(published)}
                  </time>
                </span>
              </Link>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock aria-hidden className="size-3.5" />
                  {readingTime(post.content)} min read
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Eye aria-hidden className="size-3.5" />
                  {post.views.toLocaleString("en-GB")} views
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MessageSquare aria-hidden className="size-3.5" />
                  {post.comments.length} comments
                </span>
              </div>
            </div>
          </header>

          <PostCover
            slug={post.slug}
            title={post.title}
            image={post.coverImage}
            ratio="aspect-[16/8]"
            className="mt-6 rounded-2xl border border-border"
          />

          <div className="mt-8 max-w-[68ch]">
            <Markdown content={post.content} />
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
            <div className="flex items-center gap-2">
              <LikeButton
                postId={post.id}
                initialCount={post._count.likes}
                initialLiked={liked}
                isAuthenticated={Boolean(user)}
              />
              <span className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-2 text-sm text-muted-foreground">
                <MessageSquare aria-hidden className="size-4" />
                {post.comments.length}
              </span>
            </div>
            <ShareButton title={post.title} />
          </div>

          {/* Author card */}
          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-center">
            <Avatar name={post.author.name} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Written by
              </p>
              <Link href={`/authors/${post.author.id}`} className="text-base font-semibold hover:text-primary">
                {post.author.name}
              </Link>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {post.author.bio ??
                  "Writes about full-stack development, databases and shipping products."}
              </p>
            </div>
            <Link
              href={`/authors/${post.author.id}`}
              className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-muted"
            >
              View profile
            </Link>
          </div>

          {/* Comments */}
          <section id="comments" className="mt-12 scroll-mt-20">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <MessageSquare aria-hidden className="size-5 text-muted-foreground" />
              Comments
              <span className="text-sm font-normal text-muted-foreground">({post.comments.length})</span>
            </h2>

            <div className="mt-5">
              <CommentForm postId={post.id} user={user ? { id: user.id, name: user.name } : null} />
            </div>

            <ul className="mt-8 space-y-4">
              {post.comments.length === 0 ? (
                <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No comments yet — start the conversation.
                </li>
              ) : (
                post.comments.map((comment) => {
                  const canDelete =
                    user &&
                    (comment.authorId === user.id ||
                      post.authorId === user.id ||
                      user.role === "ADMIN");
                  return (
                    <li key={comment.id} className="flex gap-3 rounded-xl border border-border bg-surface p-4">
                      <Avatar name={comment.author.name} size="sm" className="mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{comment.author.name}</span>
                          <time
                            dateTime={new Date(comment.createdAt).toISOString()}
                            className="text-xs text-muted-foreground"
                          >
                            {formatRelative(comment.createdAt)}
                          </time>
                          {canDelete ? (
                            <span className="ml-auto">
                              <CommentDelete commentId={comment.id} />
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                          {comment.body}
                        </p>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </section>
        </article>

        {/* Sidebar: table of contents / meta */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-5">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="text-sm font-semibold">In this article</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {post.content
                  .split("\n")
                  .filter((line) => /^##\s+/.test(line))
                  .slice(0, 8)
                  .map((line) => (
                    <li key={line} className="truncate border-l border-border pl-3">
                      {line.replace(/^##\s+/, "")}
                    </li>
                  ))}
                {!/^##\s+/m.test(post.content) ? (
                  <li className="text-xs">No headings in this post.</li>
                ) : null}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="text-sm font-semibold">Engagement</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <Heart aria-hidden className="size-3.5" /> Likes
                  </dt>
                  <dd className="font-medium">{post._count.likes}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <Eye aria-hidden className="size-3.5" /> Views
                  </dt>
                  <dd className="font-medium tabular-nums">{post.views.toLocaleString("en-GB")}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock aria-hidden className="size-3.5" /> Read time
                  </dt>
                  <dd className="font-medium">{readingTime(post.content)} min</dd>
                </div>
              </dl>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">Keep reading</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item, index) => (
              <PostCard key={item.id} post={item} index={index} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
