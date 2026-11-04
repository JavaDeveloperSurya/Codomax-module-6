import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function buildHref(base: string, params: Record<string, string | undefined>, page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `${base}?${query}` : base;
}

/** Compact page window: 1 … 4 5 6 … 20 */
function pageWindow(current: number, total: number) {
  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((page) => pages.add(page));
  if (current >= total - 2) [total - 1, total - 2, total - 3].forEach((page) => pages.add(page));
  return [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
}

export function Pagination({
  page,
  totalPages,
  basePath,
  params = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;
  const pages = pageWindow(page, totalPages);

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
      <Link
        href={buildHref(basePath, params, Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn(
          buttonStyles({ variant: "outline", size: "sm" }),
          page === 1 && "pointer-events-none opacity-40",
        )}
      >
        <ChevronLeft aria-hidden className="size-4" />
        <span className="hidden sm:inline">Prev</span>
      </Link>

      {pages.map((item, index) => {
        const previous = pages[index - 1];
        const gap = previous && item - previous > 1;
        return (
          <span key={item} className="flex items-center gap-1.5">
            {gap ? <span className="px-1 text-sm text-muted-foreground">…</span> : null}
            <Link
              href={buildHref(basePath, params, item)}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                item === page
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border text-muted-foreground hover:bg-surface-muted hover:text-foreground",
              )}
            >
              {item}
            </Link>
          </span>
        );
      })}

      <Link
        href={buildHref(basePath, params, Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={cn(
          buttonStyles({ variant: "outline", size: "sm" }),
          page === totalPages && "pointer-events-none opacity-40",
        )}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight aria-hidden className="size-4" />
      </Link>
    </nav>
  );
}
