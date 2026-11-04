import { prisma } from "@/lib/prisma";
import { fail, handleError, ok, withUser } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

/** DELETE /api/comments/:id — comment author, post author or admin. */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { user, response } = await withUser();
    if (!user) return response;
    const { id } = await params;

    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true, post: { select: { authorId: true } } },
    });
    if (!comment) return fail("Comment not found.", 404);

    const canDelete =
      comment.authorId === user.id ||
      comment.post.authorId === user.id ||
      user.role === "ADMIN";

    if (!canDelete) return fail("You cannot delete this comment.", 403);

    await prisma.comment.delete({ where: { id } });
    return ok({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
