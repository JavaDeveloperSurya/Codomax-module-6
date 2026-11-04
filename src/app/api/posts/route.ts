import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validation";
import { created, handleError, ok, withUser } from "@/lib/api";
import { listPosts } from "@/lib/queries";
import { normalizeTags, uniqueSlug } from "@/lib/posts";

/** GET /api/posts?q=&tag=&page=&perPage=&status= — public feed with pagination. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? "1");
    const perPage = Math.min(24, Number(searchParams.get("perPage") ?? "9"));

    const result = await listPosts({
      page: Number.isFinite(page) ? page : 1,
      perPage: Number.isFinite(perPage) ? perPage : 9,
      q: searchParams.get("q") ?? undefined,
      tag: searchParams.get("tag") ?? undefined,
      status: searchParams.get("status") === "DRAFT" ? "DRAFT" : "PUBLISHED",
    });

    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}

/** POST /api/posts — create a post for the signed-in author. */
export async function POST(request: Request) {
  try {
    const { user, response } = await withUser();
    if (!user) return response;

    const data = postSchema.parse(await request.json());
    const slug = await uniqueSlug(data.title);

    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage ?? null,
        tags: normalizeTags(data.tags),
        status: data.status,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        authorId: user.id,
      },
      select: { id: true, slug: true, status: true },
    });

    return created({ post });
  } catch (error) {
    return handleError(error);
  }
}
