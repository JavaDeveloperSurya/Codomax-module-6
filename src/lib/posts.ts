import "server-only";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

/** Lower-case, de-duplicate and strip leading `#` from tag input. */
export function normalizeTags(tags: string[] = []) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of tags) {
    const tag = raw.trim().replace(/^#/, "").toLowerCase().replace(/\s+/g, "-").slice(0, 24);
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    result.push(tag);
    if (result.length === 6) break;
  }
  return result;
}

/** Slug that is guaranteed unique, e.g. `hello-world`, `hello-world-2`. */
export async function uniqueSlug(title: string, excludeId?: string) {
  const base = slugify(title) || "post";
  let candidate = base;
  let suffix = 2;

  // Bounded loop: pathological titles still terminate.
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const existing = await prisma.post.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return `${base}-${Date.now().toString(36)}`;
}
