import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validation";
import { fail, handleError, ok, withUser } from "@/lib/api";
import { normalizeTags, uniqueSlug } from "@/lib/posts";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true } }, _count: { select: { likes: true, comments: true } } },
  });
  if (!post) return fail("Post not found.", 404);
  return ok({ post });
}

/** PATCH /api/posts/:id — update a post (author or admin only). */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { user, response } = await withUser();
    if (!user) return response;
    const { id } = await params;

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) return fail("Post not found.", 404);
    if (existing.authorId !== user.id && user.role !== "ADMIN") {
      return fail("You can only edit your own posts.", 403);
    }

    const data = postSchema.parse(await request.json());
    const slug =
      data.title !== existing.title ? await uniqueSlug(data.title, existing.id) : existing.slug;

    const publishedAt =
      data.status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : null;

    const post = await prisma.post.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage ?? null,
        tags: normalizeTags(data.tags),
        status: data.status,
        publishedAt,
      },
      select: { id: true, slug: true, status: true },
    });

    return ok({ post });
  } catch (error) {
    return handleError(error);
  }
}

/** DELETE /api/posts/:id — remove a post and its comments/likes (cascade). */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { user, response } = await withUser();
    if (!user) return response;
    const { id } = await params;

    const existing = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
    if (!existing) return fail("Post not found.", 404);
    if (existing.authorId !== user.id && user.role !== "ADMIN") {
      return fail("You can only delete your own posts.", 403);
    }

    await prisma.post.delete({ where: { id } });
    return ok({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
