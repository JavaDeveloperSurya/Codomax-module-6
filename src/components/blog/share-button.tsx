"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { XIcon } from "@/components/brand-icons";
import { toast } from "sonner";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the link");
    }
  }

  function shareOnX() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title,
    )}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=520");
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
      >
        {copied ? <Check aria-hidden className="size-4 text-emerald-500" /> : <Link2 aria-hidden className="size-4" />}
        {copied ? "Copied" : "Copy link"}
      </button>
      <button
        type="button"
        onClick={shareOnX}
        aria-label="Share on X"
        className="inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
      >
        <XIcon className="size-4" />
      </button>
    </div>
  );
}
