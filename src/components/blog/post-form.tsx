"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Hash, ImageIcon, Pencil, Save, Send, X } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonStyles } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Markdown } from "@/components/blog/markdown";
import { readingTime } from "@/lib/utils";

export type PostFormValues = {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string[];
  status: "DRAFT" | "PUBLISHED";
};

const EMPTY: PostFormValues = {
  title: "",
  excerpt: "",
  content: "",
  coverImage: "",
  tags: [],
  status: "DRAFT",
};

export function PostForm({ initial }: { initial?: Partial<PostFormValues> }) {
  const router = useRouter();
  const [values, setValues] = useState<PostFormValues>({ ...EMPTY, ...initial });
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [saving, setSaving] = useState<"DRAFT" | "PUBLISHED" | null>(null);

  const isEdit = Boolean(initial?.id);
  const minutes = useMemo(() => readingTime(values.content || " "), [values.content]);

  function update<K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key as string]) return current;
      const next = { ...current };
      delete next[key as string];
      return next;
    });
  }

  function addTag(raw: string) {
    const tag = raw.trim().replace(/^#/, "").toLowerCase().replace(/\s+/g, "-");
    if (!tag) return;
    if (values.tags.includes(tag)) {
      setTagInput("");
      return;
    }
    if (values.tags.length >= 6) {
      toast.error("You can add up to 6 tags");
      return;
    }
    update("tags", [...values.tags, tag.slice(0, 24)]);
    setTagInput("");
  }

  function onTagKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(tagInput);
    } else if (event.key === "Backspace" && !tagInput && values.tags.length) {
      update("tags", values.tags.slice(0, -1));
    }
  }

  async function save(status: "DRAFT" | "PUBLISHED") {
    setSaving(status);
    setErrors({});

    const payload = {
      title: values.title.trim(),
      excerpt: values.excerpt.trim(),
      content: values.content.trim(),
      coverImage: values.coverImage.trim(),
      tags: values.tags,
      status,
    };

    try {
      const response = await fetch(isEdit ? `/api/posts/${initial?.id}` : "/api/posts", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.fields) setErrors(data.fields);
        toast.error(data.error ?? "Could not save the post.");
        return;
      }

      toast.success(
        status === "PUBLISHED"
          ? isEdit
            ? "Post updated and published"
            : "Post published 🎉"
          : "Draft saved",
      );
      router.push(status === "PUBLISHED" ? `/posts/${data.post.slug}` : "/dashboard");
      router.refresh();
    } catch {
      toast.error("Network error — check your connection and try again.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main column */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <Field label="Title" htmlFor="title" error={errors.title} hint="Min. 6 characters">
              <Input
                id="title"
                value={values.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="How I built a full-stack blog with Next.js"
                maxLength={120}
                aria-invalid={Boolean(errors.title)}
                className="h-12 text-base font-medium"
              />
            </Field>

            <div className="mt-5">
              <Field
                label="Excerpt"
                htmlFor="excerpt"
                error={errors.excerpt}
                hint={`${values.excerpt.length}/220`}
              >
                <Textarea
                  id="excerpt"
                  rows={2}
                  value={values.excerpt}
                  onChange={(event) => update("excerpt", event.target.value)}
                  placeholder="One or two sentences that make readers want to click."
                  maxLength={220}
                  aria-invalid={Boolean(errors.excerpt)}
                />
              </Field>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
              <div className="flex items-center gap-1" role="tablist" aria-label="Editor mode">
                <TabButton active={tab === "write"} onClick={() => setTab("write")} icon={<Pencil aria-hidden className="size-3.5" />}>
                  Write
                </TabButton>
                <TabButton active={tab === "preview"} onClick={() => setTab("preview")} icon={<Eye aria-hidden className="size-3.5" />}>
                  Preview
                </TabButton>
              </div>
              <span className="text-xs text-muted-foreground">
                Markdown · {minutes} min read
              </span>
            </div>

            {tab === "write" ? (
              <div className="p-2">
                <label htmlFor="content" className="sr-only">
                  Post content (markdown)
                </label>
                <Textarea
                  id="content"
                  value={values.content}
                  onChange={(event) => update("content", event.target.value)}
                  placeholder={"## Introduction\n\nWrite your story in Markdown…\n\n```ts\nconst hello = 'world';\n```"}
                  aria-invalid={Boolean(errors.content)}
                  className="min-h-[26rem] resize-y border-0 bg-transparent font-mono text-sm focus-visible:ring-0"
                />
              </div>
            ) : (
              <div className="min-h-[26rem] p-5 sm:p-6">
                {values.content.trim() ? (
                  <Markdown content={values.content} />
                ) : (
                  <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
                )}
              </div>
            )}
          </div>
          {errors.content ? (
            <p role="alert" className="text-xs font-medium text-red-500">
              {errors.content}
            </p>
          ) : null}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold">Publishing</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Current state:{" "}
              <span className={values.status === "PUBLISHED" ? "font-medium text-emerald-500" : "font-medium text-amber-500"}>
                {values.status === "PUBLISHED" ? "Published" : "Draft"}
              </span>
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Button type="button" onClick={() => save("PUBLISHED")} loading={saving === "PUBLISHED"} disabled={saving !== null}>
                <Send aria-hidden className="size-4" />
                {values.status === "PUBLISHED" ? "Update post" : "Publish"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => save("DRAFT")}
                loading={saving === "DRAFT"}
                disabled={saving !== null}
              >
                <Save aria-hidden className="size-4" />
                Save as draft
              </Button>
              <Link href="/dashboard" className={buttonStyles({ variant: "ghost", className: "justify-center" })}>
                Cancel
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold">
              <Hash aria-hidden className="size-4 text-muted-foreground" />
              Tags
            </h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {values.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 py-1 pl-2.5 pr-1 text-xs font-medium text-primary"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => update("tags", values.tags.filter((item) => item !== tag))}
                    aria-label={`Remove tag ${tag}`}
                    className="rounded-full p-0.5 hover:bg-primary/20"
                  >
                    <X aria-hidden className="size-3" />
                  </button>
                </span>
              ))}
              {values.tags.length === 0 ? (
                <span className="text-xs text-muted-foreground">No tags yet</span>
              ) : null}
            </div>
            <Input
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={onTagKeyDown}
              onBlur={() => addTag(tagInput)}
              placeholder="nextjs, prisma, css…"
              className="mt-3 h-9 text-xs"
              aria-label="Add a tag"
            />
            <p className="mt-2 text-xs text-muted-foreground">Press Enter or comma to add · max 6</p>
            {errors.tags ? (
              <p role="alert" className="mt-1 text-xs font-medium text-red-500">
                {errors.tags}
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold">
              <ImageIcon aria-hidden className="size-4 text-muted-foreground" />
              Cover image
            </h2>
            <Input
              id="coverImage"
              value={values.coverImage}
              onChange={(event) => update("coverImage", event.target.value)}
              placeholder="https://images.example.com/cover.jpg"
              className="mt-3 h-9 text-xs"
              aria-label="Cover image URL"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Optional. Without one, a generated gradient is used.
            </p>
            {errors.coverImage ? (
              <p role="alert" className="mt-1 text-xs font-medium text-red-500">
                {errors.coverImage}
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        active
          ? "inline-flex items-center gap-1.5 rounded-md bg-surface-muted px-2.5 py-1.5 text-xs font-medium text-foreground"
          : "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      }
    >
      {icon}
      {children}
    </button>
  );
}
