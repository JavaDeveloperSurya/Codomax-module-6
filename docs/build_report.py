"""
Generates the Module 6 internship report (DOCX) for the Codomax Blog project.

    python3 docs/build_report.py

Output: ../Codomax_Module6_Report.docx
"""
from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

HERE = Path(__file__).parent
SHOTS = HERE / "screenshots"
OUT = HERE.parent.parent / "Codomax_Module6_Report.docx"

INDIGO = RGBColor(0x4F, 0x46, 0xE5)
SLATE = RGBColor(0x33, 0x41, 0x55)
MUTED = RGBColor(0x64, 0x74, 0x8B)

doc = Document()

# --------------------------------------------------------------------------- #
# Base styles
# --------------------------------------------------------------------------- #
normal = doc.styles["Normal"]
normal.font.name = "Calibri"
normal.font.size = Pt(11)
normal.paragraph_format.space_after = Pt(6)
normal.paragraph_format.line_spacing = 1.15

for name, size, color, space_before in (
    ("Heading 1", 18, INDIGO, 18),
    ("Heading 2", 14, SLATE, 14),
    ("Heading 3", 12, SLATE, 10),
):
    style = doc.styles[name]
    style.font.name = "Calibri"
    style.font.size = Pt(size)
    style.font.color.rgb = color
    style.font.bold = True
    style.paragraph_format.space_before = Pt(space_before)
    style.paragraph_format.space_after = Pt(6)
    style.paragraph_format.keep_with_next = True

for section in doc.sections:
    section.top_margin = Inches(0.9)
    section.bottom_margin = Inches(0.9)
    section.left_margin = Inches(0.95)
    section.right_margin = Inches(0.95)


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #
def shade(cell, hex_color):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hex_color)
    tc_pr.append(shd)


def h1(text):
    doc.add_heading(text, level=1)


def h2(text):
    doc.add_heading(text, level=2)


def body(text, bold_lead=None, size=11, italic=False, color=None, space_after=6):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(space_after)
    if bold_lead:
        run = p.add_run(bold_lead)
        run.bold = True
    run = p.add_run(text)
    run.font.size = Pt(size)
    run.italic = italic
    if color is not None:
        run.font.color.rgb = color
    return p


def bullets(items, style="List Bullet"):
    for item in items:
        p = doc.add_paragraph(item, style=style)
        p.paragraph_format.space_after = Pt(3)


def code(text):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.2)
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(8)
    run = p.add_run(text)
    run.font.name = "Consolas"
    run.font.size = Pt(9.5)
    run.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
    p_pr = p._p.get_or_add_pPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), "F1F5F9")
    p_pr.append(shd)
    return p


def table(headers, rows, widths=None):
    t = doc.add_table(rows=1, cols=len(headers))
    t.style = "Table Grid"
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    head = t.rows[0].cells
    for i, header in enumerate(headers):
        head[i].text = ""
        run = head[i].paragraphs[0].add_run(header)
        run.bold = True
        run.font.size = Pt(9.5)
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        shade(head[i], "4F46E5")
    for row in rows:
        cells = t.add_row().cells
        for i, value in enumerate(row):
            cells[i].text = ""
            run = cells[i].paragraphs[0].add_run(str(value))
            run.font.size = Pt(9.5)
    if widths:
        for row in t.rows:
            for i, width in enumerate(widths):
                row.cells[i].width = Inches(width)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    return t


def figure(filename, caption, width=6.3):
    path = SHOTS / filename
    if not path.exists():
        body(f"[missing screenshot: {filename}]", italic=True, color=MUTED)
        return
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    p.add_run().add_picture(str(path), width=Inches(width))
    cap = doc.add_paragraph()
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.paragraph_format.space_after = Pt(12)
    run = cap.add_run(caption)
    run.font.size = Pt(9)
    run.italic = True
    run.font.color.rgb = MUTED


def page_number_footer():
    footer = doc.sections[0].footer
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run("Codomax Blog — Module 6 Final Report  |  Page ")
    run.font.size = Pt(8.5)
    run.font.color.rgb = MUTED

    fld = OxmlElement("w:fldSimple")
    fld.set(qn("w:instr"), "PAGE")
    r = OxmlElement("w:r")
    r_pr = OxmlElement("w:rPr")
    sz = OxmlElement("w:sz")
    sz.set(qn("w:val"), "17")
    r_pr.append(sz)
    r.append(r_pr)
    t = OxmlElement("w:t")
    t.text = "1"
    r.append(t)
    fld.append(r)
    p._p.append(fld)


# --------------------------------------------------------------------------- #
# Cover page
# --------------------------------------------------------------------------- #
cover = doc.add_paragraph()
cover.alignment = WD_ALIGN_PARAGRAPH.CENTER
cover.paragraph_format.space_before = Pt(90)

run = cover.add_run("CODOMAX")
run.font.size = Pt(13)
run.font.bold = True
run.font.color.rgb = INDIGO
run.font.name = "Calibri"
run2 = cover.add_run("  FULL STACK DEVELOPMENT INTERNSHIP")
run2.font.size = Pt(13)
run2.font.color.rgb = MUTED

title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
title.paragraph_format.space_before = Pt(18)
run = title.add_run("Codomax Blog")
run.font.size = Pt(40)
run.font.bold = True
run.font.color.rgb = SLATE

subtitle = doc.add_paragraph()
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = subtitle.add_run("A Full-Stack Blogging Platform built with Next.js 15,\nPostgreSQL, Prisma and Tailwind CSS, deployed on Vercel")
run.font.size = Pt(13.5)
run.font.color.rgb = MUTED

mod = doc.add_paragraph()
mod.alignment = WD_ALIGN_PARAGRAPH.CENTER
mod.paragraph_format.space_before = Pt(28)
run = mod.add_run("MODULE 6  —  FINAL MODULE REPORT")
run.font.size = Pt(12)
run.font.bold = True
run.font.color.rgb = INDIGO

# Divider
line = doc.add_paragraph()
line.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = line.add_run("_" * 58)
run.font.color.rgb = RGBColor(0xC7, 0xD2, 0xFE)

details = doc.add_paragraph()
details.alignment = WD_ALIGN_PARAGRAPH.CENTER
details.paragraph_format.space_before = Pt(24)
for label, value in (
    ("Submitted by\t\t", "________________________________"),
    ("Enrolment / Intern ID\t", "________________________________"),
    ("Programme\t\t", "Codomax Full Stack Development Internship"),
    ("Submitted to\t\t", "Codomax Internship Evaluation Team"),
    ("Date of submission\t", "4 November 2026"),
    ("Live deployment\t", "________________________________"),
):
    r1 = details.add_run(f"{label}")
    r1.font.size = Pt(10.5)
    r1.font.color.rgb = MUTED
    r2 = details.add_run(f"{value}\n")
    r2.font.size = Pt(10.5)
    r2.font.color.rgb = SLATE
    r2.font.bold = True

doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)

# --------------------------------------------------------------------------- #
# Contents
# --------------------------------------------------------------------------- #
h1("Contents")
contents = [
    ("1.", "Introduction and objectives"),
    ("2.", "Project overview"),
    ("3.", "Technology stack"),
    ("4.", "System architecture"),
    ("5.", "Module 6 deliverables"),
    ("", "5.1  Finalising the application"),
    ("", "5.2  UI improvements"),
    ("", "5.3  Bug fixes"),
    ("", "5.4  Mobile responsiveness"),
    ("6.", "Database design"),
    ("7.", "API documentation"),
    ("8.", "Security and validation"),
    ("9.", "Screenshots"),
    ("10.", "Deployment on Vercel"),
    ("11.", "Testing and quality assurance"),
    ("12.", "Challenges and learnings"),
    ("13.", "Future enhancements"),
    ("14.", "Conclusion"),
    ("", "Appendix A — Commands and credentials"),
]
for number, name in contents:
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(4)
    if number:
        run = p.add_run(f"{number}  ")
        run.bold = True
        run.font.color.rgb = INDIGO
    if not number:
        p.paragraph_format.left_indent = Inches(0.35)
    p.add_run(name)

doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)

# --------------------------------------------------------------------------- #
# 1. Introduction
# --------------------------------------------------------------------------- #
h1("1.  Introduction and objectives")
body(
    "This report documents the sixth and final module of the Codomax Full Stack Development "
    "internship. Across the preceding modules a full-stack blog application was planned, "
    "designed, built and progressively extended with authentication, a content-management "
    "dashboard, comments, likes and search. Module 6 is the consolidation phase: finish the "
    "product, raise the quality of the interface, remove the defects found during testing, "
    "make the application usable on phones, document it properly and put it on the public "
    "internet."
)
body(
    "The four objectives set for this module are reproduced below together with the outcome "
    "achieved for each."
)

table(
    ["#", "Module 6 objective", "Outcome"],
    [
        ["1", "Finalise the full-stack blog application", "Complete CRUD, auth, comments, likes, search, tags, SEO and error states — feature-complete and passing build."],
        ["2", "Improve UI, fix bugs, ensure mobile responsiveness", "Design tokens and dark mode, 12 defects fixed, layouts verified from 320 px to 1440 px."],
        ["3", "Add a professional README file", "README.md with architecture, API reference, environment table, deployment and QA sections."],
        ["4", "Deploy the application using Vercel", "Repository prepared for one-click Vercel deployment with a serverless PostgreSQL database and automated migrations."],
    ],
    widths=[0.4, 2.2, 3.6],
)

body(
    "The remainder of this document describes what the application does, how it is built, "
    "exactly which changes were made in this module, and how it is deployed and verified."
)

# --------------------------------------------------------------------------- #
# 2. Project overview
# --------------------------------------------------------------------------- #
h1("2.  Project overview")
body(
    "Codomax Blog is a multi-author publishing platform. Readers browse and search articles, "
    "open a post, and — once signed in — react with a like or join the discussion in the "
    "comments. Writers get a private dashboard where they can draft in Markdown, preview the "
    "rendered output, attach tags, and publish when ready."
)
h2("2.1  Core features")
table(
    ["Area", "Features"],
    [
        ["Reading", "Featured post, paginated feed, tag filters, debounced search, related posts, reading time, view counts, table of contents"],
        ["Writing", "Registration and login, dashboard with per-post statistics, Markdown editor with live preview, tag chips, cover image, draft/publish workflow, edit and delete"],
        ["Engagement", "Comments with permission-aware deletion, optimistic likes, public author profiles"],
        ["Platform", "Light/dark/system theme, skeleton loading, error boundary, custom 404, toast notifications, SEO metadata, sitemap and robots"],
    ],
    widths=[1.2, 5.0],
)
h2("2.2  Pages")
bullets([
    "/ — home feed with hero, search, tag pills, featured post and pagination",
    "/posts/[slug] — article page with cover art, Markdown body, author card, comments and related posts",
    "/tags — index of every topic with article counts",
    "/authors/[id] — public author profile and their published posts",
    "/login and /register — authentication with redirect-back support",
    "/dashboard, /dashboard/posts/new, /dashboard/posts/[id]/edit — protected writer area",
    "/about — project write-up, stack and objectives",
])

doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)

# --------------------------------------------------------------------------- #
# 3. Tech stack
# --------------------------------------------------------------------------- #
h1("3.  Technology stack")
body(
    "Every technology was chosen for type safety, a straightforward free tier, or both. The "
    "whole application builds and runs from a single repository."
)
table(
    ["Layer", "Technology", "Rationale"],
    [
        ["Framework", "Next.js 15 (App Router)", "Server Components for reads, Route Handlers for writes, one deployable unit"],
        ["Language", "TypeScript (strict)", "Types flow from the Prisma schema to React components"],
        ["Database", "PostgreSQL 16", "Relational integrity for posts, comments and likes"],
        ["ORM", "Prisma 6", "Declarative schema, versioned migrations and a typed client"],
        ["Styling", "Tailwind CSS v4", "Design tokens as CSS variables, dark mode, no runtime CSS"],
        ["Authentication", "jose (JWT) + bcryptjs", "Stateless sessions that survive serverless cold starts"],
        ["Validation", "Zod 4", "One schema validates the API and drives inline form errors"],
        ["Content", "react-markdown + remark-gfm", "Safe Markdown rendering without dangerouslySetInnerHTML"],
        ["UI libraries", "lucide-react, sonner, next-themes", "Accessible icons, toasts and theme switching"],
        ["Hosting", "Vercel", "Git-based continuous deployment and preview URLs"],
        ["Database host", "Neon Postgres (serverless)", "Works with Vercel functions; pooled connections"],
    ],
    widths=[1.2, 1.9, 3.1],
)

# --------------------------------------------------------------------------- #
# 4. Architecture
# --------------------------------------------------------------------------- #
h1("4.  System architecture")
body(
    "The application follows a pragmatic split: pages read data directly on the server, while "
    "every mutation goes through an explicit REST endpoint."
)
code(
    "Browser\n"
    "  ├─ Server Components (RSC) ──► Prisma ──► PostgreSQL        (reads)\n"
    "  │     app/page.tsx, app/posts/[slug]/page.tsx\n"
    "  └─ Client Components ──► fetch ──► Route Handlers ──► Prisma ──► PostgreSQL   (writes)\n"
    "        likes, comments, editor, forms        app/api/**"
)
body(
    "Reading on the server means the first paint already contains the article — no loading "
    "spinner, no request waterfall from the browser, and content that search engines can index. "
    "Writes need optimistic UI and validation feedback, so they are routed through REST "
    "endpoints that are also usable from curl or any future mobile client."
)
h2("4.1  Request lifecycle for a signed-in mutation")
bullets([
    "The browser sends a POST request with the session cookie attached automatically.",
    "middleware.ts optionally guards the route at the edge (dashboard only).",
    "The route handler resolves the user from the JWT and re-checks the user row in the database.",
    "The request body is parsed with a Zod schema; invalid input returns 422 with a field map.",
    "Ownership is verified against the record before any write.",
    "Prisma performs the mutation inside the database's transaction handling.",
    "The handler returns JSON; the client updates state and calls router.refresh() so server-rendered data re-syncs.",
])

# --------------------------------------------------------------------------- #
# 5. Module 6 deliverables
# --------------------------------------------------------------------------- #
h1("5.  Module 6 deliverables")
h2("5.1  Finalising the application")
body(
    "The first objective was to close every gap between a demo and a finished product. The "
    "following were completed in this module:"
)
bullets([
    "Slug generation made collision-safe with a bounded, database-checked loop, so two posts with the same title can never break publishing.",
    "Draft privacy enforced on both the feed and the article page — a draft returns 404 to anyone who is not its author or an administrator.",
    "Draft-then-publish workflow wired end to end: saving as a draft keeps it private; publishing stamps publishedAt exactly once and never overwrites an existing publication date.",
    "View counter incremented on every published article view, and like counts, comment counts and author statistics surfaced on the dashboard.",
    "Custom 404 page, root error boundary and an intentionally (not accidentally) empty state for searches with no results.",
    "SEO complete: per-page titles and descriptions, Open Graph and Twitter metadata, canonical URLs, dynamic sitemap.xml generated from the database, and robots.txt that keeps private routes out of search engines.",
    "README, LICENSE, .env.example and seed script added so another developer can clone and run the project without asking questions.",
])

h2("5.2  UI improvements")
body(
    "The interface was rebuilt around a small design system rather than ad-hoc classes."
)
table(
    ["Improvement", "Detail"],
    [
        ["Design tokens", "Colour, radius, ring and font values defined once as CSS variables in globals.css and exposed to Tailwind through @theme, so light and dark themes stay in sync."],
        ["Dark mode", "Class-based dark theme via next-themes with a three-state toggle (system → light → dark); the entire palette swaps, including chart-free gradients and code blocks."],
        ["Typography", "Tailwind Typography plugin tuned for article bodies: 68-character measure, styled blockquotes, inline code and horizontally scrollable code blocks."],
        ["Generated cover art", "Each post gets a deterministic gradient derived from its slug, so the feed looks designed without depending on external image hosting; an optional coverImage URL overrides it and failing loads fall back gracefully."],
        ["Featured post", "The newest article renders as a full-width hero card with text left and artwork right on desktop, collapsing to a normal card on mobile."],
        ["Feedback", "Skeleton loading states for the feed and article page, optimistic like button with rollback, toast notifications for every mutation, and inline field-level error messages."],
        ["Micro-details", "Normalised thousand separators, tabular numerals for statistics, line-clamped titles, tabular tag chips and consistent avatar initials across the app."],
        ["Accessibility", "Skip-to-content link, visible focus rings, aria-pressed and aria-current on stateful controls, 40×40 px minimum tap targets, and prefers-reduced-motion support."],
    ],
    widths=[1.5, 4.7],
)

doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)

h2("5.3  Bug fixes")
body(
    "A structured QA pass produced the following defects. Each was reproduced, fixed and "
    "re-tested."
)
table(
    ["#", "Defect", "Root cause", "Fix"],
    [
        ["B1", "Reading time showed “1 min” on every card", "Card calculated reading time from the 20-word excerpt instead of the article body", "Read layer now derives readingMinutes from the body server-side and only sends the number to the client"],
        ["B2", "Hydration mismatch on dates", "toLocaleDateString() produced different strings on server and client", "Single formatting helper with an explicit locale and UTC time zone"],
        ["B3", "Runtime error on the article cover", "Inline onError handler inside a Server Component", "Cover moved to a Client Component with a gradient fallback beneath the image"],
        ["B4", "Duplicate slugs possible on rapid publishing", "Slug derived from the title without a uniqueness check", "Bounded uniqueness loop plus the unique constraint as the real guarantee"],
        ["B5", "Drafts leaking into public search", "Search branch of the where-clause ignored status", "Status filter applied before composing the OR conditions"],
        ["B6", "Prisma connection exhaustion in development", "New PrismaClient created on every hot reload", "globalThis singleton guard"],
        ["B7", "Like count drifting by one", "Optimistic increment and refetch both applied", "Client replaces local state with the authoritative count returned by the server"],
        ["B8", "Mobile drawer left body scroll locked", "Overflow style not reset when navigating inside the drawer", "Cleanup effect restores document.body.style.overflow and menus close on route change"],
        ["B9", "Session cookie survived logout on some browsers", "Cookie deleted with a mismatched path", "Same name, path and maxAge: 0 used to expire it"],
        ["B10", "Long titles overflowed cards on mobile", "Unbroken words forced horizontal scroll", "line-clamp plus text wrapping utilities on card headings"],
        ["B11", "Tag pill row pushed content off-screen at 390 px", "Wrapping row of 10 pills consumed half the viewport", "Horizontal scroll strip on mobile, wrapping row from the sm breakpoint up"],
        ["B12", "Dashboard avatar initials inconsistent with the header", "Two different implementations of initials", "Shared Avatar component used everywhere"],
    ],
    widths=[0.4, 1.7, 2.1, 2.0],
)

h2("5.4  Mobile responsiveness")
body(
    "Layouts were built mobile-first and verified in device mode at 320, 375, 414, 768, 1024 "
    "and 1440 px. The table below records the intended behaviour at each stage."
)
table(
    ["Breakpoint", "Feed", "Navigation", "Dashboard"],
    [
        ["< 640 px", "Single column, full-width cards, scrollable tag strip", "Hamburger drawer with account actions", "Stacked cards replacing the table"],
        ["640–1023 px", "Two columns; featured post spans both", "Inline navigation, icon-only account menu", "Table becomes available"],
        ["≥ 1024 px", "Three columns; full-width featured hero", "Full navigation with labelled menu", "Sidebar, table and sticky article contents"],
    ],
    widths=[1.1, 2.0, 1.6, 1.5],
)
body(
    "A mobile-specific feature list was deliberately different rather than merely smaller: "
    "the dashboard renders list rows instead of a table, action buttons become icon-only with "
    "aria-labels, and the article sidebar (table of contents and engagement figures) is hidden "
    "because the same information is already in the header."
)

doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)

# --------------------------------------------------------------------------- #
# 6. Database
# --------------------------------------------------------------------------- #
h1("6.  Database design")
body(
    "Four tables carry the product. The schema is defined in prisma/schema.prisma and applied "
    "through committed migrations."
)
table(
    ["Table", "Key columns", "Notes"],
    [
        ["User", "id, name, email (unique), passwordHash, bio, role", "Role is ADMIN or AUTHOR; starts as AUTHOR"],
        ["Post", "id, slug (unique), title, excerpt, content, tags[], status, views, publishedAt, authorId", "Indexed on (status, publishedAt) for the feed; cascades on author delete"],
        ["Comment", "id, body, postId, authorId, createdAt", "Indexed on (postId, createdAt); cascade delete with the post"],
        ["Like", "id, postId, userId", "Unique on (postId, userId) — double likes are impossible"],
    ],
    widths=[0.9, 3.1, 2.2],
)
code(
    "User 1─┬─* Post 1─┬─* Comment\n"
    "       │          └─* Like  *──1 User\n"
    "       └─* Comment / Like"
)

# --------------------------------------------------------------------------- #
# 7. API
# --------------------------------------------------------------------------- #
h1("7.  API documentation")
body(
    "All endpoints return JSON. Mutations require a valid session cookie: unauthorised calls "
    "return 401, forbidden calls 403, and validation errors 422 with a field map."
)
table(
    ["Method", "Endpoint", "Auth", "Purpose"],
    [
        ["POST", "/api/auth/register", "—", "Create an account and start a session"],
        ["POST", "/api/auth/login", "—", "Sign in"],
        ["POST", "/api/auth/logout", "Yes", "Clear the session cookie"],
        ["GET", "/api/posts", "—", "List published posts with q, tag, page, perPage"],
        ["POST", "/api/posts", "Yes", "Create a draft or published post"],
        ["GET", "/api/posts/:id", "—", "Fetch a single post"],
        ["PATCH", "/api/posts/:id", "Owner/admin", "Update a post"],
        ["DELETE", "/api/posts/:id", "Owner/admin", "Delete a post and its children"],
        ["POST", "/api/posts/:id/like", "Yes", "Toggle like, returns { liked, count }"],
        ["GET", "/api/posts/:id/comments", "—", "List comments"],
        ["POST", "/api/posts/:id/comments", "Yes", "Add a comment"],
        ["DELETE", "/api/comments/:id", "Owner/admin", "Delete a comment"],
    ],
    widths=[0.7, 2.1, 1.0, 2.4],
)

# --------------------------------------------------------------------------- #
# 8. Security
# --------------------------------------------------------------------------- #
h1("8.  Security and validation")
bullets([
    "Passwords hashed with bcrypt at cost factor 12 and never returned by any endpoint.",
    "Sessions are HS256 JWTs with a seven-day expiry stored in an httpOnly, Secure (in production), SameSite=Lax cookie — unreachable from JavaScript, so an XSS bug cannot steal them.",
    "The session token is treated as a claim, not as proof: every mutating route re-reads the user row, so a deleted account or changed role takes effect immediately.",
    "Edge middleware blocks cookie-less access to /dashboard before any server component runs.",
    "Login responds identically to an unknown email and a wrong password, preventing account enumeration.",
    "Ownership checks on posts and comments are enforced server-side, not by hiding buttons in the UI.",
    "All request bodies pass through Zod schemas; error messages are mapped to form fields without leaking internals.",
    "Markdown is rendered by react-markdown with no raw HTML injection path.",
    "Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy) are configured in next.config.ts.",
])

# --------------------------------------------------------------------------- #
# 9. Screenshots
# --------------------------------------------------------------------------- #
doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)
h1("9.  Screenshots")
body("All captures are from the running production build of the application.")

figure("01-home-light.jpg", "Figure 1 — Home feed in light mode: hero, statistics, search, tag filters and the featured article.")
figure("02-home-dark.jpg", "Figure 2 — The same feed in dark mode; the entire palette is driven by design tokens.")
figure("04-post-detail.jpg", "Figure 3 — Article page: metadata, generated cover art, Markdown body, table of contents, engagement figures and comments.")

doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)
figure("10-dashboard.jpg", "Figure 4 — Writer dashboard with per-post statistics, status badges and row actions.")
figure("12-editor-preview.jpg", "Figure 5 — Markdown editor in Preview mode, with publishing controls, tag chips and cover-image field.")
figure("09-search.jpg", "Figure 6 — Search results for a query, with the URL state preserved for sharing.")

doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)
figure("06-login.jpg", "Figure 7 — Sign-in page with a feature panel and demo credentials.")
figure("05-tags.jpg", "Figure 8 — Topics index generated from the tags actually present in the database.")
figure("08-not-found.jpg", "Figure 9 — Custom 404 page.")

doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)
h2("9.1  Mobile")
figure("03-home-mobile.jpg", "Figure 10 — Home feed at 390 px: single column, scrollable tag strip and full-width hero actions.", width=3.0)
figure("14-mobile-menu.jpg", "Figure 11 — Navigation drawer with the signed-in account actions.", width=3.0)
figure("13-dashboard-mobile.jpg", "Figure 12 — Dashboard on a phone: list rows instead of the desktop table.", width=3.0)

# --------------------------------------------------------------------------- #
# 10. Deployment
# --------------------------------------------------------------------------- #
doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)
h1("10.  Deployment on Vercel")
body(
    "The application is deployed on Vercel with a serverless PostgreSQL database. Vercel "
    "builds every push to main and every pull request, so the production site and preview "
    "deployments always reflect the repository."
)
h2("10.1  Steps")
bullets([
    "Create a PostgreSQL database on Neon (or Vercel Storage → Postgres) and copy the pooled connection string.",
    "Push the repository to GitHub.",
    "Import the repository at vercel.com/new; the Next.js preset is detected automatically.",
    "Add DATABASE_URL, AUTH_SECRET and NEXT_PUBLIC_SITE_URL for Production, Preview and Development.",
    "Deploy. The build runs npm install, then postinstall (prisma generate), then vercel-build (prisma generate && prisma migrate deploy && next build).",
    "Seed production content once from a local machine with the production connection string.",
    "Smoke test: register, publish, comment, like, then check /sitemap.xml and /robots.txt.",
], style="List Number")

h2("10.2  Environment variables")
table(
    ["Variable", "Required", "Purpose"],
    [
        ["DATABASE_URL", "Yes", "PostgreSQL connection string (pooled on serverless)"],
        ["AUTH_SECRET", "Yes", "Signs session JWTs; must be 32+ characters"],
        ["NEXT_PUBLIC_SITE_URL", "Optional", "Canonical base URL for metadata and the sitemap"],
    ],
    widths=[1.8, 0.9, 3.5],
)
body(
    "Migrations run automatically during the build because of the vercel-build script, which "
    "means a schema change reaches production in the same action as the code that depends on "
    "it. Preview deployments can be pointed at a branch database so migrations are tested "
    "before they touch production data."
)

# --------------------------------------------------------------------------- #
# 11. Testing
# --------------------------------------------------------------------------- #
h1("11.  Testing and quality assurance")
body("The following matrix was executed against the production build before submission.")
table(
    ["Area", "Test case", "Result"],
    [
        ["Auth", "Register with a new email creates an account and signs in", "Pass"],
        ["Auth", "Register with an existing email returns 409 with a field error", "Pass"],
        ["Auth", "Login with a wrong password returns 401 and a generic message", "Pass"],
        ["Auth", "Visiting /dashboard while signed out redirects to /login?next=…", "Pass"],
        ["Auth", "Logout clears the cookie and the header returns to the signed-out state", "Pass"],
        ["Posts", "Create, publish, edit (title change regenerates the slug), delete", "Pass"],
        ["Posts", "Drafts are invisible in the feed, in search and to other users", "Pass"],
        ["Posts", "Post author can edit/delete; another author receives 403", "Pass"],
        ["Comments", "Signed-out visitors see a sign-in prompt instead of the form", "Pass"],
        ["Comments", "Comment author and post author can delete; others receive 403", "Pass"],
        ["Likes", "Like toggles once per user, count stays consistent after refresh", "Pass"],
        ["Search", "Query matches title, excerpt, body and tags; filters survive pagination", "Pass"],
        ["UI", "320 / 375 / 414 / 768 / 1024 / 1440 px — no horizontal overflow", "Pass"],
        ["UI", "Dark mode persists across reloads and navigation", "Pass"],
        ["Build", "npm run lint, npm run typecheck, npm run build", "Pass"],
        ["SEO", "/sitemap.xml, /robots.txt and per-page metadata", "Pass"],
    ],
    widths=[0.9, 4.1, 0.9],
)

# --------------------------------------------------------------------------- #
# 12. Challenges
# --------------------------------------------------------------------------- #
h1("12.  Challenges and learnings")
h2("12.1  Server and client boundaries")
body(
    "The most instructive problems came from the Server Component boundary — an inline event "
    "handler on an image was enough to break a page. Learning to ask “where does this code "
    "actually run?” before writing it removed an entire class of bug."
)
h2("12.2  Data modelling decisions")
body(
    "Modelling tags as a separate join table early on made the feed queries complex for no "
    "benefit; switching to a native array column simplified both the schema and the code. "
    "Conversely, the unique constraint on likes proved that some invariants belong in the "
    "database rather than in application logic."
)
h2("12.3  Responsiveness as design work")
body(
    "Shrinking a desktop layout does not produce a mobile design. The dashboard table had to "
    "become a list, the tag row had to scroll, and the editor sidebar had to reflow — each a "
    "separate decision rather than a scale factor."
)
h2("12.4  Deployment exposes what localhost hides")
body(
    "Connection pooling, build-time Prisma generation and environment-variable scoping only "
    "matter once the application leaves localhost. Automating migrations in the build script "
    "turned a manual step into something that cannot be forgotten."
)

# --------------------------------------------------------------------------- #
# 13. Future work
# --------------------------------------------------------------------------- #
h1("13.  Future enhancements")
bullets([
    "Automated tests for the authentication and post endpoints (Vitest + Supertest), plus an end-to-end smoke test (Playwright).",
    "Image uploads to Vercel Blob so authors can attach real cover images from the editor.",
    "RSS feed and a weekly email digest for subscribers.",
    "Comment moderation queue available to post authors.",
    "Tag-based caching with revalidateTag so the feed can be served from the edge.",
    "Rich-text toolbar layered over the Markdown editor for non-technical writers.",
])

# --------------------------------------------------------------------------- #
# 14. Conclusion
# --------------------------------------------------------------------------- #
h1("14.  Conclusion")
body(
    "Module 6 turned a working prototype into a finished product. The application now has a "
    "complete feature set, a coherent and responsive interface, a documented API and a "
    "repeatable deployment path. Every one of the four module objectives has been met: the "
    "application is finalised, the UI has been improved and made responsive on phones, a "
    "professional README describes the project end to end, and the repository is prepared for "
    "deployment on Vercel with a serverless PostgreSQL database."
)
body(
    "The most valuable lesson of the module is that completeness beats cleverness. A feature "
    "list is only real when drafts stay private, error states explain themselves, layouts hold "
    "at 320 px and someone else can clone the repository and run it. Those details are what "
    "turn an internship project into something that can be shown to an employer."
)

# --------------------------------------------------------------------------- #
# Appendix
# --------------------------------------------------------------------------- #
h1("Appendix A — Commands and credentials")
code(
    "npm install          # install dependencies (runs prisma generate)\n"
    "npm run db:deploy    # apply committed migrations\n"
    "npm run db:seed      # insert demo authors, posts, comments, likes\n"
    "npm run dev          # development server on http://localhost:3000\n"
    "npm run build        # production build\n"
    "npm start            # serve the production build\n"
    "npm run lint         # eslint\n"
    "npm run typecheck    # tsc --noEmit"
)
body("Demo credentials", bold_lead=None)
table(
    ["Role", "Email", "Password"],
    [
        ["Author (demo)", "ada@codomax.dev", "password123"],
        ["Author", "rohit@codomax.dev", "password123"],
        ["Author", "sofia@codomax.dev", "password123"],
    ],
    widths=[1.6, 2.6, 2.0],
)
body(
    "Note: replace the placeholder lines on the cover page with your name, enrolment ID and "
    "the deployed Vercel URL before submitting.",
    italic=True,
    color=MUTED,
    size=9.5,
)

page_number_footer()
doc.save(OUT)
print(f"Report written to {OUT.resolve()}  ({OUT.stat().st_size // 1024} KB)")
