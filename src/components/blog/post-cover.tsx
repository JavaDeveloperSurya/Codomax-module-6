"use client";

import { coverArt, cn } from "@/lib/utils";

/**
 * Post cover art.
 *
 * Every post has a deterministic gradient derived from its slug, so the site
 * looks designed without depending on external image hosting. If the author
 * supplies a `coverImage` URL it is layered on top; a failed load simply
 * reveals the gradient underneath instead of a broken-image icon.
 */
export function PostCover({
  slug,
  title,
  image,
  className,
  ratio = "aspect-[16/9]",
  showTitle = false,
}: {
  slug: string;
  title: string;
  image?: string | null;
  className?: string;
  ratio?: string;
  showTitle?: boolean;
}) {
  const art = coverArt(slug);

  return (
    <div
      className={cn("relative isolate overflow-hidden bg-surface-muted", ratio, className)}
      style={{
        backgroundImage: `linear-gradient(${art.angle}deg, ${art.from}, ${art.via} 55%, ${art.to})`,
      }}
    >
      {/* soft light blobs for depth */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-70 mix-blend-soft-light"
        style={{
          backgroundImage: `radial-gradient(42rem 22rem at ${art.blobX}% ${art.blobY}%, rgba(255,255,255,0.55), transparent 65%),
                            radial-gradient(30rem 18rem at ${100 - art.blobX}% ${100 - art.blobY}%, rgba(0,0,0,0.35), transparent 70%)`,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.7) 1px, transparent 1px)",
          backgroundSize: "38px 38px",
          maskImage: "radial-gradient(120% 100% at 20% 0%, black, transparent 75%)",
          WebkitMaskImage: "radial-gradient(120% 100% at 20% 0%, black, transparent 75%)",
        }}
      />

      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : null}

      {showTitle ? (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-5 pt-16">
          <p className="line-clamp-2 text-lg font-semibold text-white drop-shadow">{title}</p>
        </div>
      ) : null}
    </div>
  );
}
