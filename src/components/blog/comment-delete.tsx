"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function CommentDelete({ commentId }: { commentId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    if (!window.confirm("Delete this comment?")) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("failed");
      toast.success("Comment deleted");
      router.refresh();
    } catch {
      toast.error("Could not delete the comment.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={deleting}
      aria-label="Delete comment"
      className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
    >
      <Trash2 aria-hidden className="size-3.5" />
    </button>
  );
}
