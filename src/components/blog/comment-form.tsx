"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonStyles } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";

export function CommentForm({
  postId,
  user,
}: {
  postId: string;
  user: { id: string; name: string } | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-muted/50 p-5 text-center">
        <p className="text-sm text-muted-foreground">
          Join the discussion — sign in to leave a comment.
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <Link
            href={`/login?next=${encodeURIComponent(pathname)}`}
            className={buttonStyles({ size: "sm" })}
          >
            Sign in
          </Link>
          <Link
            href={`/register?next=${encodeURIComponent(pathname)}`}
            className={buttonStyles({ size: "sm", variant: "outline" })}
          >
            Create account
          </Link>
        </div>
      </div>
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmed = body.trim();
    if (trimmed.length < 2) {
      setError("Comment is too short.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error ?? "Could not post your comment.");
        return;
      }

      setBody("");
      formRef.current?.reset();
      toast.success("Comment posted");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={submit} className="space-y-3">
      <div className="flex items-start gap-3">
        <Avatar name={user.name} size="md" className="mt-1" />
        <div className="flex-1 space-y-2">
          <label htmlFor="comment-body" className="sr-only">
            Your comment
          </label>
          <Textarea
            id="comment-body"
            rows={3}
            value={body}
            maxLength={1000}
            onChange={(event) => setBody(event.target.value)}
            placeholder={`Share your thoughts, ${user.name.split(" ")[0]}…`}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "comment-error" : undefined}
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">{body.length}/1000</p>
            <Button type="submit" size="sm" loading={submitting} disabled={!body.trim()}>
              <Send aria-hidden className="size-4" />
              Post comment
            </Button>
          </div>
          {error ? (
            <p id="comment-error" role="alert" className="text-xs font-medium text-red-500">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
