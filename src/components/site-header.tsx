"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LayoutDashboard, LogOut, Menu, PenSquare, Sparkles, User, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/tags", label: "Topics" },
  { href: "/about", label: "About" },
];

export function SiteHeader({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Close every menu on navigation.
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // Close the account menu on outside click / Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest("[data-account-menu]")) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setMenuOpen(false);
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-border glass">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg" aria-label="Codomax Blog home">
          <span className="relative inline-flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-sm">
            <Sparkles aria-hidden className="size-[18px]" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight">Codomax</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Blog
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-surface-muted text-foreground"
                  : "text-muted-foreground hover:bg-surface-muted/70 hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <div className="relative hidden md:block" data-account-menu>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-2.5 transition-colors hover:bg-surface-muted"
              >
                <Avatar name={user.name} size="sm" />
                <span className="max-w-24 truncate text-sm font-medium">{user.name.split(" ")[0]}</span>
                <ChevronDown aria-hidden className={cn("size-3.5 text-muted-foreground transition-transform", menuOpen && "rotate-180")} />
              </button>

              {menuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-surface p-1.5 shadow-xl shadow-black/10 animate-fade-up"
                >
                  <div className="border-b border-border px-3 py-2.5">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <MenuLink href="/dashboard" icon={<LayoutDashboard aria-hidden className="size-4" />}>
                    Dashboard
                  </MenuLink>
                  <MenuLink href="/dashboard/posts/new" icon={<PenSquare aria-hidden className="size-4" />}>
                    New post
                  </MenuLink>
                  <MenuLink href={`/authors/${user.id}`} icon={<User aria-hidden className="size-4" />}>
                    My profile
                  </MenuLink>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={logout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-60"
                  >
                    <LogOut aria-hidden className="size-4" />
                    {loggingOut ? "Signing out…" : "Sign out"}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login" className={buttonStyles({ variant: "ghost", size: "sm" })}>
                Log in
              </Link>
              <Link href="/register" className={buttonStyles({ size: "sm" })}>
                Start writing
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground md:hidden"
          >
            {mobileOpen ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div id="mobile-nav" className="border-t border-border bg-surface md:hidden">
          <nav className="container-page flex flex-col gap-1 py-4" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium",
                  isActive(item.href) ? "bg-surface-muted text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}

            <div className="my-2 h-px bg-border" />

            {user ? (
              <>
                <div className="mb-1 flex items-center gap-3 px-3 py-2">
                  <Avatar name={user.name} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Link href="/dashboard" className={buttonStyles({ variant: "secondary", className: "justify-start" })}>
                  <LayoutDashboard aria-hidden className="size-4" /> Dashboard
                </Link>
                <Link href="/dashboard/posts/new" className={buttonStyles({ className: "justify-start" })}>
                  <PenSquare aria-hidden className="size-4" /> New post
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  disabled={loggingOut}
                  className={buttonStyles({ variant: "ghost", className: "justify-start text-red-500" })}
                >
                  <LogOut aria-hidden className="size-4" /> {loggingOut ? "Signing out…" : "Sign out"}
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" className={buttonStyles({ variant: "secondary" })}>
                  Log in
                </Link>
                <Link href="/register" className={buttonStyles()}>
                  Start writing
                </Link>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function MenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
    >
      {icon}
      {children}
    </Link>
  );
}
