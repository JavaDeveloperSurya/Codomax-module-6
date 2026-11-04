"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

const NEXT = { system: "light", light: "dark", dark: "system" } as const;

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = (theme ?? "system") as keyof typeof NEXT;
  const Icon = !mounted ? Monitor : current === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;
  const label = !mounted
    ? "Toggle theme"
    : `Theme: ${current}. Click to switch to ${NEXT[current]}.`;

  return (
    <button
      type="button"
      onClick={() => setTheme(NEXT[current])}
      aria-label={label}
      title={label}
      className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
    >
      <Icon aria-hidden className="size-[18px]" />
    </button>
  );
}
