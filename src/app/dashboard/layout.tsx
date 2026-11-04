import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, LayoutDashboard, PenSquare, User } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const nav = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/posts/new", label: "New post", icon: PenSquare },
    { href: `/authors/${user.id}`, label: "Public profile", icon: User },
  ];

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
            <Avatar name={user.name} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.role.toLowerCase()}</p>
            </div>
          </div>

          <nav className="mt-4 flex gap-1 overflow-x-auto lg:flex-col" aria-label="Dashboard">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                <item.icon aria-hidden className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-4 hidden rounded-xl border border-dashed border-border p-3.5 lg:block">
            <p className="flex items-center gap-1.5 text-xs font-medium">
              <FileText aria-hidden className="size-3.5" /> Writing tip
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Posts with a clear excerpt and at least one tag get noticeably more reads.
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
