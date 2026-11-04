import type { ReactNode } from "react";
import { Quote } from "lucide-react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="container-page grid min-h-[calc(100dvh-4rem)] items-center gap-12 py-12 lg:grid-cols-2">
      <div className="flex justify-center lg:justify-start">{children}</div>

      <div className="relative hidden overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-10 text-white lg:block">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(28rem 16rem at 15% 10%, rgba(255,255,255,.55), transparent 60%), radial-gradient(24rem 14rem at 95% 90%, rgba(0,0,0,.45), transparent 60%)",
          }}
        />
        <div className="relative flex h-full flex-col justify-between">
          <Quote aria-hidden className="size-10 opacity-70" />
          <div>
            <p className="text-xl font-medium leading-relaxed text-balance">
              “The best way to learn full-stack development is to ship something real —
              authentication, database, deployment and all.”
            </p>
            <p className="mt-5 text-sm text-white/80">Codomax Full Stack Internship · Module 6</p>
            <ul className="mt-8 space-y-2.5 text-sm text-white/85">
              <li>✓ Markdown editor with live preview</li>
              <li>✓ Secure JWT sessions &amp; hashed passwords</li>
              <li>✓ Comments, likes and full-text search</li>
              <li>✓ Deployed on Vercel with a serverless Postgres</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
