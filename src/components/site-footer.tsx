import Link from "next/link";
import { Sparkles } from "lucide-react";
import { GithubIcon, LinkedinIcon, XIcon } from "@/components/brand-icons";

const LINKS = [
  {
    title: "Product",
    items: [
      { href: "/", label: "Latest posts" },
      { href: "/tags", label: "Topics" },
      { href: "/dashboard", label: "Writer dashboard" },
    ],
  },
  {
    title: "Company",
    items: [
      { href: "/about", label: "About" },
      { href: "/about#stack", label: "Tech stack" },
      { href: "/register", label: "Write for us" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-surface/60">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white">
              <Sparkles aria-hidden className="size-[18px]" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">Codomax Blog</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            A full-stack publishing platform built during the Codomax Full Stack Development
            internship — Next.js, PostgreSQL, Prisma and Tailwind CSS.
          </p>
          <div className="mt-5 flex items-center gap-2">
            <Social href="https://github.com" label="GitHub">
              <GithubIcon className="size-4" />
            </Social>
            <Social href="https://twitter.com" label="Twitter">
              <XIcon className="size-4" />
            </Social>
            <Social href="https://linkedin.com" label="LinkedIn">
              <LinkedinIcon className="size-4" />
            </Social>
          </div>
        </div>

        {LINKS.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Codomax Blog. Built for the Codomax internship.</p>
          <p>Next.js 15 · Prisma · PostgreSQL · Tailwind CSS · Vercel</p>
        </div>
      </div>
    </footer>
  );
}

function Social({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-ring/40 hover:bg-surface-muted hover:text-foreground"
    >
      {children}
    </a>
  );
}
