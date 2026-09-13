# Lesson 28 — Application Security Hardening

Implementation report for the Nexus learning roadmap.

## 1. Objective

Perform a **production-oriented security hardening pass** on the Nexus codebase. This covers: server→client secret leakage, Content-Security-Policy and security headers, session lifecycle, CSRF / Origin checking for Route Handlers, rate limiting, magic-byte (content signature) file validation, cross-project data-leak (IDOR) fixes, invitation privilege-escalation guards, and a foundational security test suite — all preserving the existing DB-backed session / HTTP-only cookie / Server Action architecture.

## 2. Pre-existing Security Posture

Nexus already shipped with several sound security fundamentals:

- **DB-backed sessions** with `HttpOnly`, `SameSite=Lax`, and `Secure` (production) cookie properties — single 7-day TTL, no long-lived refresh token.
- **Server Actions** carry Next.js built-in Origin/Host CSRF protection; route handlers did not.
- **Zod validation** on every API input boundary.
- **`getCurrentUser()` / `requireWorkspacePermission()` / `requireProjectPermission()`** centralized auth+authorization checks at the data layer.
- **`FileRecord` uploads**: server-generated opaque keys (`category/<uuid>.<ext>`), SVG excluded globally, filename sanitization (`sanitizeFilename`), and a path-traversal guard in `LocalFileStorage.resolvePath()`.
- **`apiError()`**: generic messages with no stack traces, SQL, or internal error details leaked to the client.
- **OAuth PKCE flow**: complete with `state` + `nonce`, path-scoped HttpOnly cookie, verification of both, and cleanup on failure.
- **No `NEXT_PUBLIC_` prefixed secrets** found anywhere.

What was missing, and what this lesson adds: the boundary between "server and client" was not hardened (the password hash leak), no Content-Security-Policy, no security headers at all, no rate limiting, no CSRF checking on plain Route Handlers, no content-signature file validation, an IDOR in dashboard attachment/task queries, and no security unit tests.

## 3. Findings Implemented

### 3A. Password Hash Serialization Leak — IMPLEMENTED

`getCurrentUser()` returned the full Prisma `User` object — including `passwordHash` — which was passed as an RSC prop to `TopHeader` → `ClientTopHeader`. The Next.js React Server Component payload serialized the entire object into the HTML, making the bcrypt hash visible to any authenticated user who opened DevTools.

**Fix (two layers of defense):**

1. **Query-level omit** — `getCurrentUser()` now uses Prisma's `omit: { passwordHash: true }`, so the value never enters server memory in the first place.
2. **Explicit projection** — `TopHeader` now passes `toPublicUser(user)` across the server/client boundary, selecting only `{ id, name, email, avatarFile }`.
3. **Standalone module** — `toPublicUser()` lives in `src/lib/user.ts`, which imports nothing heavy (no Prisma, no `next/headers`) and is trivially unit-testable.

**Files:** `src/lib/auth.ts`, `src/lib/user.ts`, `src/app/(protected)/dashboard/_components/TopHeader.tsx`

### 3B. Content-Security-Policy (CSP) + Security Headers — IMPLEMENTED

No security headers existed anywhere in the repo — not in middleware, not in `next.config.ts`, not in route handlers.

**Design (per-request nonce via proxy):**

- `proxy.ts` generates a per-request cryptographic nonce (`crypto.randomUUID()` encoded as base64) and sets it on both the *request* headers (so React/Next can attach it to internally-injected `<script>` tags) and the *response* headers (for the browser).
- `src/lib/security-headers.ts` centralizes all header logic:
  - `buildCspHeader(nonce)`: `script-src 'self' 'nonce-<n>' 'strict-dynamic'`; `style-src 'self' 'unsafe-inline'` (required by Next.js `next/font`, `react-toastify`, and daisyUI); `img-src`, `font-src`, `connect-src`; `frame-ancestors 'none'`; `form-action 'self'`; `base-uri 'self'`; `object-src 'none'`; dev-only `ws:` + `wss:` for HMR and `'unsafe-eval'` for the dev overlay; prod-only `upgrade-insecure-requests`.
  - `buildSecurityHeaders()`: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `Cross-Origin-Opener-Policy: same-origin`, and production-only `Strict-Transport-Security`.
- `src/app/layout.tsx` is now `async`; it reads the `x-nonce` request header and passes it to `ThemeScript`, whose only `dangerouslySetInnerHTML` usage (the static theme bootstrap) now carries the correct `nonce` attribute.
- The proxy matcher was expanded from three protected-route patterns to a single negative-lookahead pattern that excludes `/api`, `/_next/static`, `/_next/image`, `favicon.ico`, `robots.txt`, and `sitemap.xml` — so security headers apply to every HTML response while leaving API handlers and static generators untouched. Prefetch requests (`purpose: prefetch`, `next-router-prefetch`) are skipped via `missing`.
- All marketing/auth/protected pages now render dynamically (they already did due to cookie/header reads), which is the required trade-off for per-request nonces. `robots.txt` and `sitemap.xml` remain static.

**Files:** `src/proxy.ts`, `src/lib/security-headers.ts`, `src/app/layout.tsx`, `src/components/Themes/ThemeScript.tsx`

### 3C. Session Lifecycle — IMPLEMENTED

- **Logout**: `prisma.session.delete()` threw when a session row had already been removed (e.g. double-click, stale tab). Replaced with `deleteMany()`, which silently succeeds.
- **Expired-session cleanup**: When `getCurrentUser()` finds an expired session, it now opportunistically calls `deleteMany({ where: { token: sessionToken } })` before returning `null`, so expired rows don't accumulate for users who actually return.
- **No structural changes**: Cookie properties remain `HttpOnly`, `Secure` (prod), `SameSite=Lax`, 7-day TTL — unchanged, and no session rotation is added (documented as not needed with the current threat model).
- **Login refactored**: The inline session-creation and cookie-setting code was replaced with a call to the shared `createUserSession()` from `session.ts`, eliminating duplicate cookie configuration between login and the OAuth callback.

**Files:** `src/lib/auth.ts`, `src/actions/auth.actions.ts`

### 3D. CSRF / Origin Checking — IMPLEMENTED

Next.js Server Actions already enforce Origin/Host header checks, but plain Route Handlers (`PATCH`, `POST`, `DELETE` from `fetch()`) had no such protection — a cross-origin form or script could issue state-changing requests that the browser would attach the session cookie to (SameSite=Lax allows top-level GET, not POST/PATCH/DELETE from foreign origins, but same-origin from malicious extensions or compromised subpaths remains a concern).

**Implementation (`src/lib/csrf.ts`):**

- Safe methods (`GET`, `HEAD`, `OPTIONS`) pass unconditionally.
- Unsafe methods require an `Origin` or `Referer` header whose origin matches the configured `APP_URL`.
- Falls back to the `Referer` header when `Origin` is absent.
- Fails closed: missing both headers → 403; malformed URL → 403.
- In development, any `localhost` / `127.0.0.1` origin is accepted to cover non-standard dev ports.
- `APP_URL` defaults to `http://localhost:3000` when unset, making production deployments fail closed until `APP_URL` is explicitly configured.

**Applied to all seven state-changing Route Handlers:**

| Route | Method |
| --- | --- |
| `/api/workspaces/current` | `PATCH` |
| `/api/projects` | `POST` |
| `/api/projects/[projectId]` | `PATCH`, `DELETE` |
| `/api/invitations` | `POST` |
| `/api/invitations/[id]` | `PATCH` |
| `/api/projects/[projectId]/invitations` | `POST` |
| `/api/notifications/[id]/read` | `PATCH` |

**Files:** `src/lib/csrf.ts`, seven route handler files

### 3E. Rate Limiting — IMPLEMENTED

No rate limiting existed anywhere in the repo.

**Architecture (`src/lib/rate-limit/`):**

- **`RateLimitStore` interface** — provider-neutral contract: `consume(key, limit, windowMs)` → `{ allowed, remaining, retryAfterSeconds }`.
- **`MemoryRateLimitStore`** — token-bucket implementation with periodic sweep of expired buckets; single-process only. Lacks cross-instance sharing and is documented as unsuitable for multi-node production.
- **`getRateLimitStore()`** — reads `RATE_LIMIT_STORE` env var; defaults to `"memory"`; throws on any other value (e.g. `"redis"`) so that a deployment moving behind multiple instances is forced to provide a distributed backend rather than silently losing protection.
- **`consumeRateLimit(key, policyName)`** — convenience wrapper over named policies.
- **Client IP extraction** — `x-forwarded-for` (leftmost), fallback to `x-real-ip`, then `"unknown"`.

**Named policies and where applied:**

| Policy | Limit | Window | Applied to |
| --- | --- | --- | --- |
| `login` | 10 / 5 | 15 min | `auth.actions.ts` (login): per-IP + per-email+IP |
| `register` | 5 | 1 hour | `auth.actions.ts` (register): per-IP |
| `verificationResend` | 3 | 1 hour | `auth.actions.ts` (resendVerification): per-IP+email |
| `inviteCreate` | 20 | 1 hour | `invitations/route.ts` (POST): per-user + per-IP; same in `projects/[projectId]/invitations` POST |
| `upload` | 30 | 1 hour | `user.actions.ts` (updateAvatar), `task.actions.ts` (uploadTaskAttachment): per-user |

- Route handlers return `429` + `Retry-After` header (via `apiTooManyRequests`).
- Server actions return `{ error: "Too many requests..." }`.

**Files:** `src/lib/rate-limit/types.ts`, `src/lib/rate-limit/memory-store.ts`, `src/lib/rate-limit/index.ts`, `src/lib/api-response.ts`, `src/actions/auth.actions.ts`, `src/actions/user.actions.ts`, `src/actions/task.actions.ts`, `src/app/api/invitations/route.ts`, `src/app/api/projects/[projectId]/invitations/route.ts`

### 3F. Magic-Byte (Content Signature) File Validation — IMPLEMENTED

`validateFile()` already enforced MIME type via the policy, but the type value comes from the browser and is trivially spoofed. A user could upload a `.exe` renamed to `.jpg` and the existing check would pass it.

**Implementation (`src/lib/files/content-validation.ts`):**

- `detectSignature(buffer)` inspects the leading bytes against known magic-byte signatures: JPEG (`FF D8 FF`), PNG (`89 50 4E 47 0D 0A 1A 0A`), WEBP (`RIFF....WEBP`), GIF87a/GIF89a, PDF (`%PDF`), ZIP/ZIP-based (`PK` variants).
- `validateFileContent(buffer, declaredMimeType)`:
  - If a binary signature is detected but doesn't match the declared type → `TYPE_MISMATCH`.
  - If a binary declared type has no recognized signature → `INVALID_CONTENT`.
  - Text declared types (`text/plain`, `application/json`, `text/csv`) are accepted only when no known binary signature is found.
- Runs after `validateFile()` (policy) and before bytes are written to storage — so both the policy gate and the content gate must pass.

**Files:** `src/lib/files/content-validation.ts`, `src/actions/user.actions.ts`, `src/actions/task.actions.ts`

### 3G. IDOR Fix: Dashboard Attachment Queries — IMPLEMENTED

`getAttachments()` filtered only by `workspaceId` on the project, meaning any workspace member could see attachments belonging to projects they had never been invited to — a textbook broken access-control bug.

**Fix:** Added a `members: { some: { userId } }` clause on the `task.project` filter, so attachments are only returned when the current user is a member of the project that owns the parent task.

(`getTasks()` already had this filter; only `getAttachments()` was missing it.)

**File:** `src/lib/data/attachments.ts`

### 3H. Invitation Privilege Escalation Guard — IMPLEMENTED

A workspace `ADMIN` (who has `INVITE_MEMBER` permission) could create a workspace invitation with `role: "OWNER"`, effectively promoting themselves or anyone else to the highest workspace role. The project invitation route had the same gap: any project member with `MANAGE_PROJECT_MEMBERS` could grant `OWNER`.

**Fix (both routes):**

- **Workspace invitations:** After `requireWorkspacePermission(..., "INVITE_MEMBER")`, if the requested role is `OWNER` and the inviter's membership role is not `OWNER`, the request is rejected with `403`.
- **Project invitations:** After `requireProjectPermission(..., "MANAGE_PROJECT_MEMBERS")`, if the requested project role is `OWNER` and the inviter's own `projectMember.role` is not `OWNER`, the request is rejected with `403`.

**Files:** `src/app/api/invitations/route.ts`, `src/app/api/projects/[projectId]/invitations/route.ts`

### 3I. Proxy Route Guard Hardening — IMPLEMENTED

The proxy previously accepted any non-empty cookie as valid, ran on only three protected-route patterns (missing `/invitations`), and had a stale `TODO: check authentication` comment. No attacker-controlled value reached the session lookup because all queries went through the DB, but the cookie-presence check was not enforcing the UUID format the rest of the codebase relies on.

**Fixes:**

- UUID format gate: `!UUID_RE.test(sessionToken)` rejects malformed session tokens before any DB round-trip.
- `/invitations` added to the protected routes array.
- Stale TODO removed.
- Route matching switched to exact-or-subpath (`pathname === route || pathname.startsWith(route + "/")`), eliminating a prefix-collision edge case where `/projectsx/...` would have matched the old `startsWith(route)`.

**File:** `src/proxy.ts`

### 3J. Auth Enumeration — PARTIALLY IMPLEMENTED

The login action uses the generic `"Invalid email or password"` for all three failure paths (user not found, Google-only account, wrong password), which is correct. Register uses `"Email already exists"` — a minor information leak that reveals whether a specific email is registered. Resend verification is already perfectly generic (`{ success: true }` always). These are now all rate-limited (see Section 3E), reducing the practical exploitation surface of enumeration.

Further hardening of the register response would require a two-step flow (email-code or magic link), which is outside the scope of this lesson. Documented as a residual consideration.

### 3K. Secrets Hygiene — DOCUMENTED

- `.env.example` is excluded from version control by the `.gitignore` rule `.env*` and has never been committed, so the credential-looking value found in the initial audit was never in the repository history. The local file was redacted and the malformed `EMAIL_FROM` value (`"Nexus <nexussupport03@gmail.com@gmail.com>"`) was corrected regardless.
- `SMTP_USER`, `SMTP_PASS`, `GOOGLE_CLIENT_SECRET`, and `DATABASE_URL` remain server-only (no `NEXT_PUBLIC_` prefix; `.env` is gitignored).

### 3L. OAuth Flow — PRESERVED (No Changes)

The Google OAuth flow was reviewed and found to be secure: PKCE + `state` + `nonce` generation, path-scoped HttpOnly cookie (`oauth_state`), server-side token exchange, nonce verification, and automatic cleanup on any failure path. The CSP does not affect it: the OAuth routes live under `/api` and are excluded from the proxy matcher; Google's redirect is a top-level navigation that is not subject to the page's CSP.

No changes were made to the OAuth implementation.

### 3M. Testing — IMPLEMENTED

57 unit tests across 9 test files, all passing:

| Test File | Coverage |
| --- | --- |
| `src/lib/auth.test.ts` | `toPublicUser` projection; no `passwordHash` leak |
| `src/lib/csrf.test.ts` | Safe methods, same-origin, cross-origin, missing origin, Referer fallback, malformed origin |
| `src/lib/rate-limit/rate-limit.test.ts` | Memory store window limits, independent keys, `consumeRateLimit` enforcement, `getRateLimitClientIp` header parsing (mocked) |
| `src/lib/files/content-validation.test.ts` | JPEG/PNG/WEBP/GIF/PDF/ZIP detection; type mismatch rejection; unrecognized binary rejection; text acceptance; text-with-binary-signature rejection |
| `src/lib/files/validate-file.test.ts` | No-file, empty, oversized, disallowed type, valid acceptance; error-kind message map; real upload policy assertions |
| `src/lib/files/storage.test.ts` | `extensionForMimeType` mapping + fallback; `buildStorageKey` format + collision independence; `sanitizeFilename` path traversal, control chars, leading dots, length cap |
| `src/lib/authorization.test.ts` | `hasWorkspacePermission` matrix (OWNER/ADMIN/MEMBER); `hasProjectPermission` matrix (OWNER/MEMBER) |
| `src/lib/api-response.test.ts` | `apiError` status, issues, no internal leakage; `apiTooManyRequests` status + `Retry-After` |
| `src/lib/security-headers.test.ts` | Nonce injection, `unsafe-eval` dev-only, `upgrade-insecure-requests` prod-only, HSTS conditional, standard security header presence |

**Acknowledged testing limitation:** Full integration / IDOR / CSRF tests against the live database and Route Handlers are not feasible with a pure unit-test harness. The authorization functions, rate-limit store, CSRF helper, and content-validation logic were all made independently testable to maximize coverage without requiring a test Postgres instance. A comprehensive integration test suite (Playwright or Next.js integration tests) should be added when a test database is available.

**Files:** `vitest.config.ts`, `src/**/*.test.ts` (9 files), `package.json` (added `vitest` devDependency and `"test": "vitest run"` script)

## 4. Files Changed

| File | Change Summary |
| --- | --- |
| `src/lib/user.ts` | **New.** `PublicUser` type + `toPublicUser()` — the safe server/client boundary projection. No heavy imports. |
| `src/lib/auth.ts` | Added Prisma `omit: { passwordHash: true }` to the session query; re-exports `toPublicUser` from `user.ts`; opportunistic expired-session cleanup. |
| `src/app/(protected)/dashboard/_components/TopHeader.tsx` | Now calls `toPublicUser(user)` before passing to client. |
| `src/lib/security-headers.ts` | **New.** `buildCspHeader`, `buildSecurityHeaders`, `applyHeaders` — centralized CSP + header generation. |
| `src/proxy.ts` | Expanded matcher to all HTML routes; added UUID gate, `/invitations` to protected list; nonce generation; CSP on request + response headers; security headers applied; stale TODO removed. |
| `src/app/layout.tsx` | Now `async`; reads `x-nonce` from request headers; passes `nonce` to `ThemeScript`. |
| `src/components/Themes/ThemeScript.tsx` | Accepts `nonce` prop; applies it to the inline `<script>` tag. |
| `src/lib/csrf.ts` | **New.** `assertSameOrigin()` — safe-method pass, Origin/Referer validation, dev-localhost allowance. |
| `src/lib/rate-limit/types.ts` | **New.** `RateLimitStore` interface + `RateLimitDecision` type. |
| `src/lib/rate-limit/memory-store.ts` | **New.** `MemoryRateLimitStore` — token-bucket with periodic sweep. |
| `src/lib/rate-limit/index.ts` | **New.** `RATE_LIMIT_POLICIES`, `getRateLimitStore()`, `consumeRateLimit()`, `getRateLimitClientIp()`. |
| `src/lib/files/content-validation.ts` | **New.** `detectSignature()`, `validateFileContent()`, `contentValidationErrors`. |
| `src/lib/api-response.ts` | Added `apiTooManyRequests(retryAfterSeconds)`. |
| `src/lib/data/attachments.ts` | Added `members: { some: { userId } }` to the project filter in `getAttachments()`. |
| `src/lib/authorization.ts` | Exported `hasWorkspacePermission`, `hasProjectPermission`, and the role-permission maps for testability. |
| `src/actions/auth.actions.ts` | Added rate limiting (login, register, resendVerification); refactored login to use `createUserSession()`; `logout` now uses `deleteMany()`. |
| `src/actions/user.actions.ts` | Added rate limiting + content-signature validation to `updateAvatar`. |
| `src/actions/task.actions.ts` | Added rate limiting + content-signature validation to `uploadTaskAttachment`. |
| `src/app/api/invitations/route.ts` | Added CSRF check, rate limiting, and workspace OWNER role-escalation guard. |
| `src/app/api/projects/[projectId]/invitations/route.ts` | Added CSRF check, rate limiting, and project OWNER role-escalation guard. |
| `src/app/api/workspaces/current/route.ts` | Added CSRF check. |
| `src/app/api/projects/route.ts` | Added CSRF check to `POST`. |
| `src/app/api/projects/[projectId]/route.ts` | Added CSRF check to `PATCH` and `DELETE`. |
| `src/app/api/invitations/[id]/route.ts` | Added CSRF check. |
| `src/app/api/notifications/[id]/read/route.ts` | Added CSRF check. |
| `.env.example` | Redacted `SMTP_PASS` placeholder; fixed malformed `EMAIL_FROM`. |
| `package.json` | Added `vitest` devDependency; added `"test": "vitest run"` script. |
| `vitest.config.ts` | **New.** Vitest configuration with `@/` alias. |
| `docs/lesson-28-security-report.md` | This report. |

## 5. Residual Considerations

| Item | Status | Required for Production |
| --- | --- | --- |
| Rate-limit backend for multi-instance | `MemoryRateLimitStore` is single-process only; must be replaced with Redis (or similar) behind the `RateLimitStore` interface via `RATE_LIMIT_STORE="redis"` when deployed behind multiple replicas. | Yes — critical. |
| `APP_URL` must be set in production | CSRF origin checking falls back to `http://localhost:3000` when `APP_URL` is unset; every production deployment must configure `APP_URL` to the public-facing origin. | Yes. |
| Session cleanup for permanently inactive users | Expired rows are cleaned only when a user with that cookie actually logs in; rows for users who never return accumulate. Acceptable for most SaaS scale; can be addressed with a scheduled job (`prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } })`). | Nice to have. |
| Register email enumeration | `"Email already exists"` reveals whether a specific email is registered. A two-step registration flow (email + one-time code) is the standard mitigation and is outside the scope of this lesson. | Low risk given rate limiting. |
| No integration / E2E security tests | The current suite is unit-level; full IDOR, CSRF bypass, and rate-limit integration tests require a test database and HTTP assertion harness. | Yes — high priority next step. |
| `Cross-Origin-Opener-Policy: same-origin` | Applied by the new CSP headers; confirms no cross-origin window can reference the Nexus window. If any future feature relies on `window.open()` from a third party, this policy would block it — document the constraint. | Verify against roadmap. |
| Next.js `style-src 'unsafe-inline'` | Required because Next.js `next/font`, `react-toastify`, and daisyUI inject inline `<style>` tags at runtime. CSP level 3 `style-src` nonce support for `<style>` (not just `<link>`) is not reliably supported across browsers yet; `'unsafe-inline'` is the documented Next.js recommendation. | Documented exception; monitor browser support. |
