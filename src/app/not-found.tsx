import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-surface-muted text-muted-foreground">
        <Compass aria-hidden className="size-7" />
      </div>
      <p className="mt-6 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
        404
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The post may have been deleted, is still a draft, or the link is wrong. Try the
        homepage instead.
      </p>
      <div className="mt-7 flex gap-3">
        <Link href="/" className={buttonStyles()}>
          Back to home
        </Link>
        <Link href="/tags" className={buttonStyles({ variant: "outline" })}>
          Browse topics
        </Link>
      </div>
    </div>
  );
}
