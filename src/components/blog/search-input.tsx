"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Debounced search box that keeps `?q=` in the URL so results are
 * shareable, bookmarkable and back-button friendly.
 */
export function SearchInput({ placeholder = "Search posts, tags, topics…" }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initial);
  const [isPending, setIsPending] = useState(false);
  const firstRender = useRef(true);

  // Keep the input in sync when the user navigates (e.g. logo click).
  useEffect(() => {
    setValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = value.trim();
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
      params.delete("page");

      const query = params.toString();
      setIsPending(true);
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, 350);

    return () => clearTimeout(timer);
  }, [value, pathname, router, searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => setIsPending(false), 500);
    return () => clearTimeout(timer);
  }, [searchParams]);

  return (
    <div className="relative w-full sm:max-w-sm">
      <Search
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-opacity",
          isPending && "animate-pulse",
        )}
      />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label="Search posts"
        className="h-10 w-full rounded-full border border-border bg-surface pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value ? (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <X aria-hidden className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
