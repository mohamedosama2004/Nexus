# Lesson 27 — Metadata & Technical SEO

Implementation report for the Nexus learning roadmap.

## 1. Objective

Upgrade Nexus from a bare-bones `title`/`description` pair to a **production-oriented metadata and technical SEO setup** using the native Next.js App Router Metadata API. This covers: a shared brand/site configuration, a global title template, Open Graph and Twitter (social) metadata, group-level robots policies, static page metadata, dynamic project metadata (`generateMetadata`), a `robots.txt`, a `sitemap.xml`, and a canonical URL strategy — with a clear separation between **public (indexable)** and **private (non-indexable)** content.

## 2. Current Nexus SEO Architecture

Before this lesson, the only metadata in the repo was in `src/app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  title: "Nexus ",
  description: "Project management SaaS",
};
```

There was no `metadataBase`, no Open Graph, no Twitter metadata, no per-page metadata, no `robots.ts`, no `sitemap.ts`, and no `generateMetadata`. The app already had `src/app/favicon.ico` (automatically served by Next.js) and an `APP_URL` environment variable used by `src/lib/oauth/google.ts` (`getAppUrl()`) and email-verification.

Route groups actually present in the repo:

| Group | Routes | Visibility |
| --- | --- | --- |
| `(marketing)` | `/` (home), `/pricing` | **Public** — indexable |
| `(auth)` | `/login`, `/register`, `/verify-email` | Auth-only — **noindex** |
| `(protected)` | `/dashboard`, `/dashboard/members`, `/dashboard/profile`, `/projects`, `/projects/[projectId]`, `/invitations/[id]`, `/settings` | Private — **noindex** |

Note: `/dashboard/members` is a `"use client"` page, so it cannot export `export const metadata` (the Metadata API is server-only). It is covered by the `(protected)` group layout's robots policy and inherits the global title template.

## 3. Files Changed

| File | Role |
| --- | --- |
| `src/lib/site.ts` | **New.** Single source of brand identity: `name`, `description`, and `url` (from `APP_URL`, falling back to `http://localhost:3000`). Consumed by the root layout, `robots.ts`, `sitemap.ts`, and the marketing/dynamic pages — keeps the base URL in one place instead of re-deriving it. |
| `src/app/layout.tsx` | Upgraded the global `metadata`: `metadataBase`, title template, description, `applicationName`, robots, Open Graph, Twitter, locale. |
| `src/app/robots.ts` | **New.** Emits `/robots.txt` — allows crawling of public content, disallows private/auth/api prefixes, and points at the sitemap. |
| `src/app/sitemap.ts` | **New.** Emits `/sitemap.xml` containing only the public URLs (`/` and `/pricing`). |
| `src/app/(marketing)/page.tsx` | Home page metadata: absolute title "Nexus", description, canonical `/`. |
| `src/app/(marketing)/pricing/page.tsx` | Pricing page metadata: `Pricing | Nexus`, description, canonical `/pricing`. |
| `src/app/(auth)/layout.tsx` | Group-level robots `noindex, nofollow` for all auth pages. |
| `src/app/(auth)/login/page.tsx` | `Sign in | Nexus` + description. |
| `src/app/(auth)/register/page.tsx` | `Create an account | Nexus` + description. |
| `src/app/(auth)/verify-email/page.tsx` | `Verify your email | Nexus` + description. |
| `src/app/(protected)/layout.tsx` | Group-level robots `noindex, nofollow` for all private pages. |
| `src/app/(protected)/dashboard/page.tsx` | `Dashboard | Nexus` + description. |
| `src/app/(protected)/projects/page.tsx` | `Projects | Nexus` + description. |
| `src/app/(protected)/projects/[projectId]/page.tsx` | **Dynamic metadata** via `generateMetadata()` using the real project data; robots `noindex, nofollow`; `cache()`-deduplicated project lookup. |
| `src/app/(protected)/settings/page.tsx` | `Settings | Nexus` + description. |
| `src/app/(protected)/dashboard/profile/page.tsx` | `Profile | Nexus` + description. |
| `src/app/(protected)/invitations/[id]/page.tsx` | `Invitation | Nexus` + description. |
| `docs/lesson-27-report.md` | This report. |

Unchanged static routes covered by group policies (no separate metadata file): `/dashboard/members` (client page), `/projects/[projectId]/not-found.tsx` and the global `not-found.tsx`.

## 4. Global Metadata

Defined in `src/app/layout.tsx`:

- **Title strategy** — template `"%s | Nexus"` with the default `Nexus` (for the home page). Pages set only their short title (`Dashboard`, `Settings`, …) and the template appends the brand, so branding is never duplicated (no "Nexus – Nexus – Projects").
- **Description** — one shared product sentence from `siteConfig.description`; used for the home page, Open Graph, and Twitter.
- **`metadataBase`** — `new URL(siteConfig.url)`, so every relative metadata URL and auto-generated canonical resolves against `APP_URL` (or `http://localhost:3000` in development).
- **Open Graph** — `type: "website"`, `siteName: "Nexus"`, title (with the same template), description, `url`, `locale: "en_US"`.
- **Social (Twitter)** — `card: "summary"`, title, description. `summary` (not `summary_large_image`) is used because the repo ships no Open Graph/Share image asset, and inventing an image path was explicitly avoided.
- **Robots** — global allow (`index, follow`), which is the effective default; the restrictive policies live at the auth/protected group level.
- **Icons** — no change: Next.js auto-detects `src/app/favicon.ico` and serves it (`<link rel="icon" href="/favicon.ico">`).
- **`applicationName`** — `"Nexus"`.

## 5. Static Metadata

| Page | Title | Robots |
| --- | --- | --- |
| `/` | `Nexus` (absolute) | indexed (global allow) |
| `/pricing` | `Pricing | Nexus` | indexed (global allow) |
| `/login` | `Sign in | Nexus` | `noindex, nofollow` (auth layout) |
| `/register` | `Create an account | Nexus` | `noindex, nofollow` (auth layout) |
| `/verify-email` | `Verify your email | Nexus` | `noindex, nofollow` (auth layout) |
| `/dashboard` | `Dashboard | Nexus` | `noindex, nofollow` (protected layout) |
| `/projects` | `Projects | Nexus` | `noindex, nofollow` (protected layout) |
| `/settings` | `Settings | Nexus` | `noindex, nofollow` (protected layout) |
| `/dashboard/profile` | `Profile | Nexus` | `noindex, nofollow` (protected layout) |
| `/invitations/[id]` | `Invitation | Nexus` | `noindex, nofollow` (protected layout) |

Descriptions are one concise, meaningful sentence — no keyword stuffing. Group-level robots were placed in the `(auth)` and `(protected)` layouts so every page in those groups is covered even without a per-page metadata export (e.g. the client-only members page).

## 6. Dynamic Metadata

`src/app/(protected)/projects/[projectId]/page.tsx` now exports `generateMetadata()`:

```tsx
const fetchProject = cache((projectId: string) => getProjectById(projectId));

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { projectId } = await params;
  const project = await fetchProject(projectId);
  if (!project) notFound();
  // title: project.title -> "… | Nexus" via the global template
  // description: project.description (capped at 160 chars)
  // robots: { index: false, follow: false }
}
```

- **Data source**: the existing `getProjectById()` server-side utility (which already enforces session + workspace + project-membership), re-used rather than duplicating a Prisma query.
- **Query deduplication**: the same project lookup is wrapped in React `cache()` so `generateMetadata` and the page render share **one** query per request.
- **Titles**: dynamic title = the real project name, e.g. project "Castle Gate Release" → `Castle Gate Release | Nexus` (verified live at runtime).
- **Descriptions**: the project's real description when present (truncated to ~160 characters), else a generic fallback.
- **Not-found**: if the project is missing/uninspectable, `notFound()` is called from `generateMetadata`, consistent with the page body's existing behavior and the `not-found.tsx` UI.
- **Privacy**: resources are read **only** for an authenticated, authorized member; the generated title contains no internal IDs (verified: no `projectId` leaks into `<title>`); `robots: noindex, nofollow` is set directly in the dynamic metadata; and no project-specific Open Graph is emitted — private pages inherit only the generic brand-level Open Graph so no project data travels in social tags.
- **No leakage unauthenticated**: a request without a session is redirected to `/login` (307) by the existing protected layout — verified — and `getProjectById` returns `null`, so no project data is ever serialized publicly.

## 7. Robots Strategy

`src/app/robots.ts` produces `/robots.txt`:

```text
User-Agent: *
Allow: /
Disallow: /api
Disallow: /login
Disallow: /register
Disallow: /verify-email
Disallow: /dashboard
Disallow: /projects
Disallow: /settings
Disallow: /invitations

Sitemap: <base-url>/sitemap.xml
```

- Public marketing content (home, pricing) is crawlable.
- Auth pages are disallowed (they are utility/noindex pages).
- The entire protected app area (dashboard, projects including `[projectId]`, settings, invitations) and `/api` are disallowed.
- This complements the per-layout `noindex` meta tags. **Robots is an SEO policy, not an authorization mechanism** — security still comes from the server-side `getCurrentUser()`/`getProjectById()` checks, which re-verify access regardless of what robots.txt says.

## 8. Sitemap Strategy

`src/app/sitemap.ts` emits `/sitemap.xml` with **only** the public, indexable URLs:

- `/` — priority 1, weekly.
- `/pricing` — priority 0.8, monthly.

No dashboard, settings, invitations, or private project URLs are included. Base URL comes from `siteConfig.url` (i.e. `APP_URL`), so the sitemap stays correct across environments and stays small because the app has exactly two indexable pages.

## 9. Canonical Strategy

- A global `metadataBase` establishes the production base URL from environment config (`APP_URL`) with a localhost fallback — no hard-coded production domain.
- Canonical links are then auto-resolved by Next.js from `metadataBase` + path (verified: `/` → `<link rel="canonical" href="http://localhost:3000">`, `/pricing` → `…/pricing`).
- The two public pages additionally set explicit relative `alternates.canonical` (`"/"`, `"/pricing"`) for clarity.
- Private pages deliberately carry **no** canonical overrides — they are `noindex` and not part of the crawlable surface.

## 10. SEO Decisions

- **Public pages are indexed** — `/` and `/pricing` are genuine marketing content that should appear in search results and gain from canonical + Open Graph tags.
- **Private pages are not indexed** — the whole `(protected)` group holds user data (projects, tasks, names, workspace secrets); `noindex, nofollow` meta + robots.txt disallow tells engines to stay out.
- **Login/register are not indexed** — auth pages are entry points, not destinations; indexing them wastes crawl budget and invites spam/credential-phishing confusion, so they are `noindex` too.
- **Robots is not an authorization mechanism** — robots.txt and `noindex` only *ask* crawlers to behave; they expose **nothing** and protect **nothing**. Real access control stays in the server layer (session checks, `getProjectById`'s membership filter, workspace authorization), which is preserved and strengthened by verifying no data path leaks without a valid session.

## 11. Security Considerations

Metadata must never leak private information, so:

- Dynamic titles use only the project's **title** — never internal IDs, task contents, member names, or workspace secrets (verified at runtime: the `projectId` does not appear in `<title>`).
- `getProjectById` returns `null` for anonymous users **before** any data is read, and the protected layout 307-redirects, so `generateMetadata` cannot emit project data without a session.
- Private routes emit `noindex, nofollow`, so even a compliant crawler is told not to index them.
- Open Graph on private projects is intentionally **not** padded with project data — only the generic brand-level OG tags appear, so even a misconfigured crawler that loads the page sees no project-specific social payload.
- No secrets (DB URLs, API keys) and no internal IDs are present in `robots.txt`, `sitemap.xml`, or any metadata.

## 12. Validation

| Command | Result |
| --- | --- |
| `pnpm exec tsc --noEmit` | **PASS** |
| `pnpm lint` | **PASS** (0 problems) |
| `pnpm build` | **PASS** — 23 routes generated, including the new `○ /robots.txt` and `○ /sitemap.xml` |
| Live checks (dev server on :3000) | **PASS** — see below |

Live verification results:

- `/login` → `<title>Sign in | Nexus</title>`, description, `noindex, nofollow`.
- `/` → `<title>Nexus</title>`, description, canonical `http://localhost:3000`, `og:type=website`, `og:site_name=Nexus`, `og:url`, `twitter:card=summary`, favicon link served.
- `/pricing` → `Pricing | Nexus`, canonical `/pricing`.
- `/robots.txt` → disallows `api`, auth, and protected prefixes; `Sitemap:` entry present.
- `/sitemap.xml` → exactly two public URLs (`/`, `/pricing`), no private pages.
- `/projects/<id>` unauthenticated → **307 redirect to `/login`** (no data leak).
- `/projects/<id>` authenticated (seeded test project "Castle Gate Release") → `<title>Castle Gate Release | Nexus</title>`, description from the project, `noindex, nofollow`, no leaked internal ID.
- `/dashboard`, `/projects`, `/settings`, `/register` → correct templated titles; `/dashboard` and `/projects` are `noindex, nofollow`.

Test data was seeded and fully removed afterwards (0 leftover rows verified).

## 13. Final Implementation Summary

Lesson 27 added a complete, idiomatic metadata and technical SEO layer to Nexus:

1. **Shared site config** (`src/lib/site.ts`) — one place for name, description, and base URL.
2. **Professional global metadata** — title template (`%s | Nexus`), description, `metadataBase`, Open Graph, Twitter, robots, `applicationName`.
3. **Static metadata** on every indexable/auth/protected page (10 pages).
4. **Dynamic project metadata** — real project titles/descriptions via `generateMetadata` reusing `getProjectById`, deduplicated with React `cache()`, graceful not-found, `noindex` enforced.
5. **`robots.txt`** and **`sitemap.xml`** scoped to the public surface only.
6. **Canonical strategy** via `metadataBase` + explicit public canonicals.
7. Clear **public vs private** SEO split without weakening any auth/authorization.

No new dependencies, no database changes, no CMS/SEO framework — only the built-in Next.js Metadata API.

## 14. Interview Questions

**Q1: What fields does the Next.js Metadata API support for global SEO?**
Metadata is a typed object in a server layout/page export. Key fields: `title` (string or `{ default, template }`), `description`, `metadataBase`, `openGraph`, `twitter`, `robots`, `alternates` (canonical), `icons`, `keywords`. Global/`template` titles support the `%s` placeholder so child pages supply only their short title.

**Q2: How does `generateMetadata` differ from static `export const metadata`?**
`export const metadata` is compiled statically. `generateMetadata` is a function executed per-request with access to `params`/`searchParams` (and server context), letting you build titles/descriptions from real data (e.g. Prisma) and return a `Metadata` object. In Nexus it reads the project by ID and shapes the title/description, or calls `notFound()`.

**Q3: What does Open Graph define and what are common tags?**
Open Graph lets platforms (Facebook, Slack, WhatsApp) render rich previews. Common tags: `og:type`, `og:title`, `og:description`, `og:url`, `og:image`, `og:site_name`, `og:locale`. In Next these map under the `openGraph` field and are rendered as `<meta property="og:…">`.

**Q4: What does `robots.ts` generate and what should it contain for an app like Nexus?**
It generates `/robots.txt`: allowed/blocked user agents, disallowed paths, sitemap location. For Nexus, public marketing paths are crawlable; `/api`, auth, and protected app paths are disallowed; the sitemap URL is listed.

**Q5: What is a sitemap and what belongs in one?**
A `sitemap.xml` lists the canonical, crawlable URLs (with optional `lastmod`, `changeFrequency`, `priority`) to help engines discover them. Only public, indexable URLs belong — never private pages like dashboards or user-specific projects.

**Q6: What is metadataBase and why is it used for canonical URLs?**
`metadataBase` sets the base URL Next uses to resolve relative metadata URLs into absolute ones. Canonical `<link>` tags (via `metadataBase` + `alternates`) point crawlers at the authoritative version of a page. Using `APP_URL` (with a localhost fallback) keeps canonical URLs correct across environments without hard-coding a domain.

**Q7: Why would a private SaaS page be `noindex` — and is `noindex`/robots.txt a security control?**
Private pages hold user data that shouldn't be indexed, so they carry `noindex, nofollow` and are disallowed in robots.txt to save crawl budget and avoid exposure. But robots directives are only guidance to cooperative crawlers — they're not authorization. Real protection comes from server-side auth/authorization; Nexus re-checks sessions and project membership before any data is read.

**Q8: How do you keep project metadata leak-free in Nexus?**
`generateMetadata` only runs with a valid session (else the protected layout redirects and `getProjectById` returns `null`), uses only the project title/description — never internal IDs, tasks, or members — truncates the description, forbids crawling with `robots.noindex`, and emits no project-specific Open Graph tags so private data doesn't travel in social metadata.