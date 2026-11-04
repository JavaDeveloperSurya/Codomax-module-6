import type { Metadata } from "next";
import Link from "next/link";
import { Hash } from "lucide-react";
import { getPopularTags } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Topics",
  description: "Browse every topic covered on the Codomax Blog.",
};

export default async function TagsPage() {
  const tags = await getPopularTags(60);

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Browse by topic</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Every article is tagged so you can jump straight to what you need — from React
        patterns to database design.
      </p>

      {tags.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No tags yet.
        </p>
      ) : (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tags.map((tag) => (
            <Link
              key={tag.name}
              href={`/?tag=${encodeURIComponent(tag.name)}`}
              className="group flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-colors hover:border-ring/40 hover:bg-surface-muted"
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <Hash aria-hidden className="size-3.5 text-muted-foreground" />
                {tag.name}
              </span>
              <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-muted-foreground group-hover:bg-surface">
                {tag.count}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
