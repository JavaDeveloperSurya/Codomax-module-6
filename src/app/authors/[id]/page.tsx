import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, FileText, Heart, MessageSquare } from "lucide-react";
import { PostCard } from "@/components/blog/post-card";
import { Avatar } from "@/components/ui/avatar";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listPosts } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const author = await prisma.user.findUnique({ where: { id }, select: { name: true } });
  return { title: author ? `${author.name} — author` : "Author not found" };
}

export default async function AuthorPage({ params }: PageProps) {
  const { id } = await params;
  const [author, viewer] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        bio: true,
        createdAt: true,
        _count: { select: { posts: true, comments: true } },
      },
    }),
    getCurrentUser(),
  ]);

  if (!author) notFound();

  const isSelf = viewer?.id === author.id;
  const { items } = await listPosts({
    authorId: author.id,
    perPage: 24,
    viewerId: isSelf ? author.id : undefined,
  });

  const likes = await prisma.like.count({ where: { post: { authorId: author.id } } });

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(40rem 18rem at 10% -20%, color-mix(in oklab, var(--primary) 22%, transparent), transparent 70%)",
          }}
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar name={author.name} size="lg" className="size-20 text-xl" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{author.name}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {author.bio ?? "This writer hasn't added a bio yet."}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <FileText aria-hidden className="size-3.5" />
                {items.length} published
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Heart aria-hidden className="size-3.5" />
                {likes} likes received
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare aria-hidden className="size-3.5" />
                {author._count.comments} comments written
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays aria-hidden className="size-3.5" />
                Joined {formatDate(author.createdAt)}
              </span>
            </div>
          </div>
          {isSelf ? (
            <Link
              href="/dashboard"
              className="shrink-0 rounded-lg border border-border bg-surface px-3.5 py-2 text-sm font-medium transition-colors hover:bg-surface-muted"
            >
              Go to dashboard
            </Link>
          ) : null}
        </div>
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">
        Posts by {author.name.split(" ")[0]}
      </h2>

      {items.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No published posts yet.
        </p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
