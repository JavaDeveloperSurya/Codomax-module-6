import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getCurrentUser } from "@/lib/auth";
import { absoluteUrl } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: {
    default: "Codomax Blog — Full-stack writing platform",
    template: "%s · Codomax Blog",
  },
  description:
    "A production-ready full-stack blog built with Next.js 15, PostgreSQL and Prisma during the Codomax Full Stack Development internship.",
  applicationName: "Codomax Blog",
  keywords: ["blog", "Next.js", "Prisma", "PostgreSQL", "full stack", "Codomax internship"],
  authors: [{ name: "Codomax Intern" }],
  openGraph: {
    type: "website",
    siteName: "Codomax Blog",
    title: "Codomax Blog — Full-stack writing platform",
    description: "Read, write and discuss full-stack engineering articles.",
    url: absoluteUrl(),
  },
  twitter: { card: "summary_large_image", title: "Codomax Blog" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#080a12" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <SiteHeader user={user} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <Toaster
            position="bottom-center"
            richColors
            closeButton
            toastOptions={{ className: "!rounded-xl !border-border" }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
