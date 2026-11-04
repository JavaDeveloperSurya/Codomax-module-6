"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button, buttonStyles } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] route error:", error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-red-500/10 text-red-500">
        <AlertTriangle aria-hidden className="size-7" />
      </div>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        An unexpected error occurred while rendering this page. You can retry, or head back
        to safety.
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>
      ) : null}
      <div className="mt-7 flex gap-3">
        <Button onClick={reset}>
          <RotateCcw aria-hidden className="size-4" />
          Try again
        </Button>
        <Link href="/" className={buttonStyles({ variant: "outline" })}>
          Go home
        </Link>
      </div>
    </div>
  );
}
