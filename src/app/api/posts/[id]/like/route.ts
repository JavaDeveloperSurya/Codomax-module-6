import { prisma } from "@/lib/prisma";
import { fail, handleError, ok, withUser } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

/** POST /api/posts/:id/like — toggle the current user's like. */
export async function POST(_request: Request, { params }: Params) {
  try {
    const { user, response } = await withUser();
    if (!user) return response;
    const { id } = await params;

    const post = await prisma.post.findUnique({ where: { id }, select: { id: true } });
    if (!post) return fail("Post not found.", 404);

    const existing = await prisma.like.findUnique({
      where: { postId_userId: { postId: id, userId: user.id } },
    });

    if (existing) await prisma.like.delete({ where: { id: existing.id } });
    else await prisma.like.create({ data: { postId: id, userId: user.id } });

    const count = await prisma.like.count({ where: { postId: id } });
    return ok({ liked: !existing, count });
  } catch (error) {
    return handleError(error);
  }
}
