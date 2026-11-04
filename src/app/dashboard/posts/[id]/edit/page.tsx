import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PostForm } from "@/components/blog/post-form";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Edit post" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, user] = await Promise.all([params, getCurrentUser()]);
  if (!user) return null;

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();
  if (post.authorId !== user.id && user.role !== "ADMIN") notFound();

  return (
    <div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Back to dashboard
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Edit post</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Last updated {formatDate(post.updatedAt)} · <span className="font-mono text-xs">/posts/{post.slug}</span>
      </p>

      <div className="mt-6">
        <PostForm
          initial={{
            id: post.id,
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            coverImage: post.coverImage ?? "",
            tags: post.tags,
            status: post.status,
          }}
        />
      </div>
    </div>
  );
}
