import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/lib/validation";
import { created, fail, handleError, ok, withUser } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

/** GET /api/posts/:id/comments */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const comments = await prisma.comment.findMany({
    where: { postId: id },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { id: true, name: true } } },
  });
  return ok({ comments });
}

/** POST /api/posts/:id/comments — add a comment as the signed-in user. */
export async function POST(request: Request, { params }: Params) {
  try {
    const { user, response } = await withUser();
    if (!user) return response;
    const { id } = await params;

    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!post) return fail("Post not found.", 404);
    if (post.status !== "PUBLISHED") return fail("This post is not published yet.", 403);

    const { body } = commentSchema.parse(await request.json());

    const comment = await prisma.comment.create({
      data: { body, postId: id, authorId: user.id },
      include: { author: { select: { id: true, name: true } } },
    });

    return created({ comment });
  } catch (error) {
    return handleError(error);
  }
}
