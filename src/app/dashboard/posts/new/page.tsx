import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PostForm } from "@/components/blog/post-form";

export const metadata: Metadata = { title: "New post" };

export default function NewPostPage() {
  return (
    <div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Back to dashboard
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Write a new post</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Compose in Markdown, preview instantly, then save as a draft or publish.
      </p>

      <div className="mt-6">
        <PostForm />
      </div>
    </div>
  );
}
