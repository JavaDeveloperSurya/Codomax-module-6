"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Optimistic like toggle — the counter and heart update instantly, then
 * reconcile with the server response (rollback on failure).
 */
export function LikeButton({
  postId,
  initialCount,
  initialLiked,
  isAuthenticated,
}: {
  postId: string;
  initialCount: number;
  initialLiked: boolean;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState({ liked: initialLiked, count: initialCount });
  const [optimistic, applyOptimistic] = useOptimistic(state, (_current, next: { liked: boolean; count: number }) => next);
  const [, startTransition] = useTransition();

  async function toggle() {
    if (!isAuthenticated) {
      toast.error("Sign in to like this post");
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    const next = { liked: !optimistic.liked, count: optimistic.count + (optimistic.liked ? -1 : 1) };

    startTransition(async () => {
      applyOptimistic(next);
      try {
        const response = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
        if (!response.ok) throw new Error("Request failed");
        const data = (await response.json()) as { liked: boolean; count: number };
        setState({ liked: data.liked, count: data.count });
      } catch {
        setState((current) => current); // revert to last known good value
        toast.error("Could not update your like. Try again.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={optimistic.liked}
      aria-label={optimistic.liked ? "Remove like" : "Like this post"}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all",
        optimistic.liked
          ? "border-rose-500/30 bg-rose-500/10 text-rose-500"
          : "border-border text-muted-foreground hover:border-rose-500/30 hover:text-rose-500",
      )}
    >
      <Heart
        aria-hidden
        className={cn("size-4 transition-transform", optimistic.liked && "scale-110 fill-current")}
      />
      {optimistic.count}
    </button>
  );
}
