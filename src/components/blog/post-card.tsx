import Link from "next/link";
import { ArrowUpRight, Clock, Eye, Heart, MessageCircle } from "lucide-react";
import { PostCover } from "@/components/blog/post-cover";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { PostCardData } from "@/lib/queries";
import { cn, formatDate } from "@/lib/utils";

export function PostCard({
  post,
  featured = false,
  index = 0,
}: {
  post: PostCardData;
  featured?: boolean;
  index?: number;
}) {
  const published = post.publishedAt ?? post.createdAt;

  return (
    <article
      className={cn(
        "group card-hover relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface",
        "hover:border-ring/40 hover:shadow-[0_18px_40px_-24px_rgba(79,70,229,0.55)]",
        featured &&
          "sm:col-span-2 md:items-stretch lg:col-span-3 lg:grid lg:grid-cols-[1.05fr_1fr]",
      )}
      style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
    >
      <Link
        href={`/posts/${post.slug}`}
        aria-label={post.title}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />

      <div className={cn("relative", featured && "lg:order-2 lg:h-full")}>
        <PostCover
          slug={post.slug}
          title={post.title}
          image={post.coverImage}
          ratio={featured ? "aspect-[16/9] lg:aspect-auto lg:h-full" : "aspect-[16/9]"}
        />
        <div className="absolute left-3 top-3 flex gap-2">
          {post.status === "DRAFT" ? (
            <Badge tone="warning" className="backdrop-blur">
              Draft
            </Badge>
          ) : null}
          {post.tags[0] ? (
            <span className="rounded-full bg-black/35 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur">
              {post.tags[0]}
            </span>
          ) : null}
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col p-5", featured && "md:order-1 md:justify-center md:p-7")}>
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <time dateTime={new Date(published).toISOString()}>{formatDate(published)}</time>
          <span aria-hidden>•</span>
          <span className="inline-flex items-center gap-1">
            <Clock aria-hidden className="size-3.5" />
            {post.readingMinutes} min read
          </span>
          <span aria-hidden>•</span>
          <span className="inline-flex items-center gap-1">
            <Eye aria-hidden className="size-3.5" />
            {post.views.toLocaleString("en-GB")}
          </span>
        </div>

        <h3
          className={cn(
            "font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary",
            featured ? "text-xl sm:text-2xl lg:text-[1.7rem] lg:leading-tight" : "text-lg",
          )}
        >
          {post.title}
        </h3>

        <p className={cn("mt-2 text-sm leading-relaxed text-muted-foreground", featured ? "line-clamp-4" : "line-clamp-3")}>
          {post.excerpt}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <Avatar name={post.author.name} size="sm" />
            <span className="text-xs font-medium text-foreground">{post.author.name}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Heart aria-hidden className="size-3.5" />
              {post._count.likes}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle aria-hidden className="size-3.5" />
              {post._count.comments}
            </span>
            <ArrowUpRight
              aria-hidden
              className="size-4 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
