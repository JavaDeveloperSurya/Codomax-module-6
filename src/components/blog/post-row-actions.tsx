"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function PostRowActions({
  postId,
  slug,
  title,
}: {
  postId: string;
  slug: string;
  title: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "failed");
      }
      toast.success("Post deleted");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete the post.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/posts/${slug}`}
        aria-label={`View ${title}`}
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
      >
        <Eye aria-hidden className="size-4" />
      </Link>
      <Link
        href={`/dashboard/posts/${postId}/edit`}
        aria-label={`Edit ${title}`}
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
      >
        <Pencil aria-hidden className="size-4" />
      </Link>
      <button
        type="button"
        onClick={remove}
        disabled={deleting}
        aria-label={`Delete ${title}`}
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
      >
        <Trash2 aria-hidden className="size-4" />
      </button>
    </div>
  );
}
