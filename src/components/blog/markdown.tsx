"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

/**
 * Renders untrusted-ish markdown safely: react-markdown never uses
 * dangerouslySetInnerHTML, so raw HTML in a post body is rendered as text.
 */
export function Markdown({ content }: { content: string }) {
  return (
    <div className="prose prose-article prose-article:prose-lg max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children, ...props }) {
            const url = href ?? "";
            const internal = url.startsWith("/");
            if (internal) {
              return (
                <Link href={url} className="font-medium text-primary hover:underline">
                  {children}
                </Link>
              );
            }
            return (
              <a href={url} target="_blank" rel="noreferrer noopener" {...props}>
                {children}
              </a>
            );
          },
          img({ src, alt }) {
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={typeof src === "string" ? src : ""}
                alt={alt ?? ""}
                loading="lazy"
                className="mx-auto rounded-xl border border-border"
              />
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto">
                <table>{children}</table>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
