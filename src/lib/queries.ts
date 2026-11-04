import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { readingTime } from "@/lib/utils";

export const POSTS_PER_PAGE = 6;

/** Columns needed to render a card, plus the body length for read time. */
export const postCardSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  tags: true,
  coverImage: true,
  status: true,
  views: true,
  publishedAt: true,
  createdAt: true,
  content: true,
  author: { select: { id: true, name: true } },
  _count: { select: { comments: true, likes: true } },
} satisfies Prisma.PostSelect;

type PostCardRow = Prisma.PostGetPayload<{ select: typeof postCardSelect }>;

/**
 * Cards only need the body to work out reading time, so it is reduced to a
 * number here and never shipped to the client.
 */
export type PostCardData = Omit<PostCardRow, "content"> & { readingMinutes: number };

function toCard({ content, ...post }: PostCardRow): PostCardData {
  return { ...post, readingMinutes: readingTime(content) };
}

export type ListPostsArgs = {
  page?: number;
  perPage?: number;
  q?: string;
  tag?: string;
  authorId?: string;
  status?: "PUBLISHED" | "DRAFT";
  /** When true, drafts belonging to `viewerId` are also returned. */
  viewerId?: string;
};

/**
 * Single source of truth for the public feed, search, tag pages,
 * author pages and the dashboard list.
 */
export async function listPosts({
  page = 1,
  perPage = POSTS_PER_PAGE,
  q,
  tag,
  authorId,
  status = "PUBLISHED",
  viewerId,
}: ListPostsArgs) {
  const where: Prisma.PostWhereInput = {};

  if (status) where.status = status;
  if (authorId) where.authorId = authorId;
  if (tag) where.tags = { has: tag };
  if (viewerId) {
    // Show my own drafts alongside everyone's published posts.
    where.OR = [{ status: "PUBLISHED" }, { authorId: viewerId }];
    delete where.status;
  }
  if (q) {
    const search: Prisma.PostWhereInput[] = [
      { title: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
      { tags: { has: q.toLowerCase() } },
    ];
    where.AND = [{ OR: search }];
  }

  const safePage = Math.max(1, page);
  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where,
      select: postCardSelect,
      orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
      skip: (safePage - 1) * perPage,
      take: perPage,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    items: items.map(toCard),
    total,
    page: safePage,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, bio: true, createdAt: true } },
      comments: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { id: true, name: true } } },
      },
      _count: { select: { likes: true, comments: true } },
    },
  });
}

export async function getRelatedPosts(postId: string, tags: string[], take = 3) {
  const rows = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: postId },
      ...(tags.length ? { tags: { hasSome: tags } } : {}),
    },
    select: postCardSelect,
    orderBy: { publishedAt: "desc" },
    take,
  });
  return rows.map(toCard);
}

export async function getPopularTags(limit = 10) {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { tags: true },
  });

  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export async function getSiteStats() {
  const [posts, authors, comments] = await Promise.all([
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.user.count(),
    prisma.comment.count(),
  ]);
  return { posts, authors, comments };
}

export async function getPostById(id: string) {
  return prisma.post.findUnique({ where: { id } });
}

export async function incrementViews(id: string) {
  try {
    await prisma.post.update({ where: { id }, data: { views: { increment: 1 } } });
  } catch {
    // Never let analytics break the page render.
  }
}
