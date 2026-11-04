import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names without Tailwind conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "Hello, World!" -> "hello-world" */
export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

/** Human readable date, e.g. "12 Mar 2025". Stable between server and client. */
export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatRelative(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(seconds) >= secondsInUnit) {
      return rtf.format(-Math.round(seconds / secondsInUnit), unit);
    }
  }
  return rtf.format(-seconds, "second");
}

/** ~200 words per minute. */
export function readingTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Truncate on a word boundary. */
export function truncate(text: string, length = 160) {
  if (text.length <= length) return text;
  return `${text.slice(0, text.lastIndexOf(" ", length))}…`;
}

/* -------------------------------------------------------------------------- */
/*  Deterministic cover art                                                   */
/* -------------------------------------------------------------------------- */

const PALETTES: [string, string, string][] = [
  ["#6366f1", "#8b5cf6", "#ec4899"],
  ["#0ea5e9", "#06b6d4", "#14b8a6"],
  ["#f97316", "#ef4444", "#f59e0b"],
  ["#10b981", "#059669", "#84cc16"],
  ["#8b5cf6", "#6366f1", "#0ea5e9"],
  ["#f43f5e", "#fb7185", "#fbbf24"],
  ["#14b8a6", "#0ea5e9", "#6366f1"],
  ["#7c3aed", "#c026d3", "#f97316"],
];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Every post gets a stable, attractive gradient derived from its slug.
 * This keeps the UI image-free (fast, no broken external URLs) while still
 * looking designed — a coverImage URL can always override it.
 */
export function coverArt(seed: string) {
  const hash = hashString(seed);
  const palette = PALETTES[hash % PALETTES.length];
  return {
    from: palette[0],
    via: palette[1],
    to: palette[2],
    angle: 115 + (hash % 70),
    blobX: 20 + (hash % 60),
    blobY: 15 + ((hash >> 3) % 70),
  };
}

export function absoluteUrl(path = "") {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  return `${base}${path}`;
}
