# Nexus

Nexus is a workspace-based project management SaaS application built with **Next.js**, **TypeScript**, **Prisma**, and **PostgreSQL**. The current implementation provides authenticated workspaces, project and task management, project-level membership, workspace and project invitations, and invitation notifications. The application is structured around the Next.js App Router, server actions for form-driven mutations, route handlers for REST-style access, and a Prisma data layer. [1] [2] [3]

> **Documentation scope:** This README describes the architecture and data model currently implemented in the repository. It intentionally distinguishes persisted Prisma models from client-side or legacy TypeScript shapes.

## Contents

- [Product scope](#product-scope)
- [System design](#system-design)
- [Backend architecture](#backend-architecture)
- [Authentication and authorization](#authentication-and-authorization)
- [Domain model](#domain-model)
- [Database schema](#database-schema)
- [Relationships](#relationships)
- [API surface](#api-surface)
- [Data integrity and transactions](#data-integrity-and-transactions)
- [Project structure](#project-structure)
- [Local development](#local-development)
- [Validation and quality checks](#validation-and-quality-checks)
- [Current implementation notes](#current-implementation-notes)
- [References](#references)

## Product scope

Nexus organizes work inside a hierarchy of **users**, **workspaces**, **projects**, and **tasks**. A user may belong to multiple workspaces, each workspace may contain multiple projects, and project access is controlled through an independent project-membership relation. Collaboration is completed through invitations and user-scoped notifications. [7] [8]

| Capability | Current behavior | Primary implementation |
|---|---|---|
| Authentication | Registration, login, logout, bcrypt password hashing, seven-day database sessions, and an HTTP-only `session_token` cookie. | [`src/actions/auth.actions.ts`][9] |
| Workspace context | Users can switch between workspaces through an HTTP-only `current_workspace_id` cookie. Invalid selections fall back to the first workspace membership. | [`src/components/WorkspaceSwitcher.tsx`][10], [`src/lib/current-workspace.ts`][8] |
| Projects | Projects are scoped to workspaces and can be created, read, updated, and deleted with permission checks. | [`src/actions/project.actions.ts`][11], [`src/app/api/projects`][15] |
| Tasks | Tasks belong to projects and support creation, editing, deletion, and status changes. | [`src/actions/task.actions.ts`][12] |
| Collaboration | Workspace and project invitations are stored, validated, accepted or declined, and converted into membership records. | [`src/app/api/invitations`][13], [`src/app/api/invitations/%5Bid%5D/route.ts`][14] |
| Notifications | Existing users receive invitation notifications and can mark notifications as read. | [`src/app/api/notifications`][16] |
| Protected application shell | Dashboard, project, and settings routes are guarded at request level when the session cookie is absent. | [`src/proxy.ts`][4] |

## System design

The system follows a **modular monolithic** architecture. The browser, Next.js application server, authorization layer, Prisma client, and PostgreSQL database are deployed as one application boundary, while the code is separated into presentation, request, domain, validation, and persistence responsibilities. This keeps transactions and authorization close to the data they protect without introducing a separate backend service. [1] [2] [5] [6] [7]

```mermaid
flowchart TD
    U[User browser]

    subgraph NEXT[Next.js application]
        P[Request proxy\nprotected route redirect]
        UI[App Router pages and React components]
        Q[TanStack Query provider\nclient cache and API state]
        SA[Server actions\nauth, projects, tasks]
        RH[Route handlers\nworkspaces, projects, invitations, notifications]
        V[Zod schemas\nrequest validation]
        A[Session lookup\ngetCurrentUser]
        W[Workspace resolver\ngetCurrentWorkspace]
        Z[Authorization service\nworkspace and project RBAC]
        PR[Prisma client\nPostgreSQL adapter]
    end

    DB[(PostgreSQL)]

    U --> P
    P --> UI
    UI --> Q
    UI --> SA
    Q --> RH
    SA --> V
    RH --> V
    SA --> A
    RH --> A
    SA --> W
    RH --> W
    SA --> Z
    RH --> Z
    A --> PR
    W --> PR
    Z --> PR
    SA --> PR
    RH --> PR
    PR --> DB
```

### Request lifecycle

A protected page request first passes through [`src/proxy.ts`][4]. The proxy redirects requests to `/dashboard`, `/projects`, and `/settings` to `/login` when the `session_token` cookie is missing. The server action or route handler then performs the authoritative session lookup, verifies the session expiry, resolves workspace context when needed, and applies the relevant workspace or project permission check before mutating data. [4] [5] [6] [8]

| Stage | Responsibility | Implementation |
|---|---|---|
| 1. Browser request | Navigates to a protected page or invokes a form action/API request. | App Router UI and client components |
| 2. Route protection | Performs a fast cookie-presence check and redirects unauthenticated browser requests. | [`src/proxy.ts`][4] |
| 3. Authentication | Reads `session_token`, loads the `Session` and related `User`, and rejects missing or expired sessions. | [`src/lib/auth.ts`][5] |
| 4. Context resolution | Reads `current_workspace_id`, confirms membership, and returns the active workspace. | [`src/lib/current-workspace.ts`][8] |
| 5. Authorization | Evaluates workspace or project role permissions. | [`src/lib/authorization.ts`][6] |
| 6. Validation and persistence | Validates input with Zod and executes Prisma queries or transactions. | [`src/schemas`][17], [`prisma/schema.prisma`][7] |
| 7. Response and refresh | Returns an action state or JSON response and revalidates affected Next.js paths where applicable. | [`src/actions`][11] [12] |

## Backend architecture

The backend is implemented inside the Next.js application rather than as a separate service. Server actions are used for form-oriented workflows such as registration and project/task mutations. Route handlers provide explicit HTTP endpoints for workspace selection, project access, membership reads, invitations, and notifications. Both entry points share the same Prisma client, Zod schemas, session lookup, and authorization service. [6] [11] [12] [15]

| Layer | Responsibility | Repository location |
|---|---|---|
| Presentation | Server-rendered pages, client components, navigation, workspace switching, and notification controls. | `src/app`, `src/components` |
| Client data state | Provides a shared TanStack Query client for browser-side API state and cache management. | [`src/providers/query-provider.tsx`][3] |
| Server actions | Executes authenticated mutations and revalidates affected paths. | `src/actions` |
| HTTP API | Exposes JSON route handlers for workspaces, projects, members, invitations, and notifications. | `src/app/api` |
| Validation | Enforces request shapes and user-facing domain values before persistence. | `src/schemas` |
| Security | Resolves sessions and applies workspace/project role-based permissions. | [`src/lib/auth.ts`][5], [`src/lib/authorization.ts`][6] |
| Persistence | Creates the Prisma client with the PostgreSQL adapter and manages generated types. | [`src/lib/prisma.ts`][18], [`prisma.config.ts`][19] |
| Database | Stores relational application state in PostgreSQL. | [`prisma/schema.prisma`][7] |

## Authentication and authorization

Nexus uses database-backed sessions rather than a third-party identity provider. During registration, the password is validated and hashed with bcrypt, then the new `User`, personal `Workspace`, and owner `Membership` are created in one transaction. A seven-day `Session` is then created and its token is written to the HTTP-only `session_token` cookie. Login follows the same session-creation path after comparing the submitted password with `passwordHash`; logout deletes the session row and clears the cookie. [9]

The authorization layer is intentionally split into **workspace permissions** and **project permissions**. A workspace membership does not automatically grant project access: project-scoped operations require a matching `ProjectMember` row. Creating a project through the server action creates the project and the creator’s `ProjectMember` owner row in the same transaction. [6] [11]

### Workspace roles

| Workspace role | Create project | Update project | Delete project | Create task | Update task | Delete task | Invite member |
|---|---:|---:|---:|---:|---:|---:|---:|
| `OWNER` | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `ADMIN` | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `MEMBER` | No | No | No | Yes | Yes | No | No |

### Project roles

| Project role | View project | Update project | Delete project | Create task | Update task | Delete task | Manage members |
|---|---:|---:|---:|---:|---:|---:|---:|
| `OWNER` | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `MEMBER` | Yes | No | No | Yes | Yes | No | No |

> **Security boundary:** The request proxy is an early redirect mechanism, not the complete authorization boundary. Route handlers and server actions must continue to call session and permission checks because a cookie may be present while the corresponding session is expired or invalid. [4] [5] [6]

## Domain model

The persisted domain is centered on a many-to-many collaboration model. `Membership` connects users to workspaces, while `ProjectMember` connects users to projects and stores the project-specific role. `Invitation` acts as the bridge from an invitation request to a future membership, and `Notification` provides an in-app delivery record for existing invitees. [7] [13] [14]

```mermaid
erDiagram
    USER ||--o{ SESSION : owns
    USER ||--o{ MEMBERSHIP : has
    WORKSPACE ||--o{ MEMBERSHIP : contains
    WORKSPACE ||--o{ PROJECT : contains
    USER ||--o{ PROJECT_MEMBER : joins
    PROJECT ||--o{ PROJECT_MEMBER : contains
    PROJECT ||--o{ TASK : contains
    WORKSPACE ||--o{ INVITATION : receives
    PROJECT o|--o{ INVITATION : targets
    USER ||--o{ INVITATION : sends
    USER o|--o{ INVITATION : receives
    USER ||--o{ NOTIFICATION : owns
    INVITATION o|--o{ NOTIFICATION : triggers

    USER {
        string id PK
        string name
        string email UK
        datetime createdAt
        string passwordHash
    }
    SESSION {
        string id PK
        string userId FK
        string token UK
        datetime expiresAt
    }
    WORKSPACE {
        string id PK
        string name
        datetime createdAt
    }
    MEMBERSHIP {
        string id PK
        string userId FK
        string workspaceId FK
        Role role
    }
    PROJECT {
        string id PK
        string title
        string description
        string status
        string workspaceId FK
        string priority
    }
    PROJECT_MEMBER {
        string id PK
        string userId FK
        string projectId FK
        ProjectRole role
    }
    TASK {
        string id PK
        string title
        string description
        string status
        string projectId FK
    }
    INVITATION {
        string id PK
        string email
        string workspaceId FK
        string projectId FK
        string invitedById FK
        string inviteeId FK
        Role role
        ProjectRole projectRole
        string tokenHash UK
        InvitationStatus status
        datetime expiresAt
    }
    NOTIFICATION {
        string id PK
        string userId FK
        NotificationType type
        string title
        string message
        string invitationId FK
        datetime readAt
        datetime createdAt
    }
```

## Database schema

The following table summarizes the Prisma schema as it exists today. All primary keys are generated CUID strings unless otherwise noted. Optional fields are marked with `?`, and unique or compound constraints are listed explicitly. [7]

| Model | Important fields | Relations and constraints |
|---|---|---|
| `User` | `id`, `name`, unique `email`, `createdAt`, `passwordHash` | Has many `Session`, `Membership`, `ProjectMember`, sent/received `Invitation`, and `Notification` records. |
| `Session` | `id`, `userId`, unique `token`, `expiresAt` | Belongs to one `User`; session validity is checked against `expiresAt`. |
| `Workspace` | `id`, `name`, `createdAt` | Has many `Membership`, `Project`, and `Invitation` records. |
| `Membership` | `id`, `userId`, `workspaceId`, `Role role` | Joins `User` and `Workspace`; unique on `(userId, workspaceId)`. |
| `Project` | `id`, `title`, optional `description`, `status`, `workspaceId`, `priority` | Belongs to one `Workspace`; has many `Task`, `ProjectMember`, and `Invitation` records; indexed by `workspaceId`. |
| `ProjectMember` | `id`, `userId`, `projectId`, `ProjectRole role` | Joins `User` and `Project`; unique on `(userId, projectId)` and indexed by both foreign keys. |
| `Task` | `id`, `title`, optional `description`, `status`, `projectId` | Belongs to one `Project`; indexed by `projectId`. |
| `Invitation` | `id`, `email`, `workspaceId`, optional `projectId`, `invitedById`, optional `inviteeId`, optional `role`, optional `projectRole`, unique `tokenHash`, `status`, `expiresAt`, timestamps | Belongs to one `Workspace`, optionally one `Project`, one inviter, and optionally one registered invitee; indexed by workspace, project, email, invitee, and status. |
| `Notification` | `id`, `userId`, `type`, `title`, `message`, optional `invitationId`, optional `readAt`, `createdAt` | Belongs to one `User` and optionally one `Invitation`; indexed by user, `(userId, readAt)`, and invitation. |

### Enums and validated status values

| Type | Values | Usage |
|---|---|---|
| `Role` | `OWNER`, `ADMIN`, `MEMBER` | Workspace membership and workspace invitation roles. |
| `ProjectRole` | `OWNER`, `MEMBER` | Project membership and project invitation roles. |
| `InvitationStatus` | `PENDING`, `ACCEPTED`, `DECLINED`, `EXPIRED`, `CANCELLED` | Invitation lifecycle. |
| `NotificationType` | `INVITATION` | Current notification category. |
| Project status | `Active`, `Completed` | Validated by the project Zod schema; persisted as `String`. |
| Task status | `TODO`, `active`, `completed` | Validated by task actions/schema; persisted as `String`. |

## Relationships

The relationship model can be read as a sequence of access decisions. A `User` first obtains workspace access through `Membership`; a `Project` belongs to a `Workspace`; and project access is granted separately through `ProjectMember`. This separation allows workspace-level roles to govern workspace administration while project-level roles govern project visibility, task operations, and member management. [6] [7]

| Relationship | Cardinality | Meaning in the application |
|---|---|---|
| `User` → `Session` | One-to-many | A user can have multiple active login sessions. |
| `User` ↔ `Workspace` through `Membership` | Many-to-many | A user may belong to many workspaces, and a workspace may have many users. |
| `Workspace` → `Project` | One-to-many | Every project is owned by exactly one workspace. |
| `User` ↔ `Project` through `ProjectMember` | Many-to-many | Project access and project role are managed independently from workspace membership. |
| `Project` → `Task` | One-to-many | Every task belongs to one project. |
| `Workspace` → `Invitation` | One-to-many | Every invitation is anchored to a workspace, including project invitations. |
| `Project` → `Invitation` | Optional one-to-many | A null `projectId` represents a workspace invitation; a populated `projectId` represents a project invitation. |
| `User` → `Invitation` | Two named one-to-many relations | `invitedById` records the sender; optional `inviteeId` identifies a registered recipient. |
| `User` → `Notification` | One-to-many | Notifications are owned by the recipient user. |
| `Invitation` → `Notification` | Optional one-to-many | An invitation notification may reference the invitation that caused it. |

### Invitation lifecycle

Invitation creation hashes a generated token before persistence, prevents duplicate pending invitations, and optionally creates a notification when the email belongs to an existing user. Acceptance is restricted to the addressed `inviteeId`, rejects non-pending or expired invitations, and then executes the membership creation plus invitation status update inside a transaction. Project invitations create `ProjectMember`; workspace invitations create `Membership`. [13] [14] [20]

```mermaid
stateDiagram-v2
    [*] --> PENDING: invitation created
    PENDING --> ACCEPTED: recipient accepts
    PENDING --> DECLINED: recipient declines
    PENDING --> EXPIRED: acceptance after expiresAt
    PENDING --> CANCELLED: administrative cancellation
    ACCEPTED --> [*]
    DECLINED --> [*]
    EXPIRED --> [*]
    CANCELLED --> [*]
```

## API surface

The route handlers expose JSON endpoints for the browser and other same-application clients. Most protected handlers return a consistent error payload through the shared `apiError` helper, while successful responses wrap resources in named properties such as `workspaces`, `projects`, `members`, `invitation`, or `notifications`. [15] [21]

| Method | Endpoint | Authentication and authorization | Purpose |
|---|---|---|---|
| `GET` | `/api/workspaces` | Authenticated user | Lists the user’s workspaces and returns the currently resolved workspace id. |
| `PATCH` | `/api/workspaces/current` | Authenticated user plus matching `Membership` | Sets the `current_workspace_id` HTTP-only cookie. |
| `GET` | `/api/workspaces/current/members` | Authenticated user with resolved workspace | Lists members of the current workspace. |
| `GET` | `/api/projects?workspaceId={id}` | Authenticated workspace member | Lists projects in the workspace that the user can access through `ProjectMember`. |
| `POST` | `/api/projects?workspaceId={id}` | Workspace `CREATE_PROJECT` permission | Creates a project in the requested workspace. |
| `GET` | `/api/projects/{projectId}` | Project `VIEW_PROJECT` permission | Returns one project and its selected member data. |
| `PATCH` | `/api/projects/{projectId}` | Project `UPDATE_PROJECT` permission | Updates project title, description, and status. |
| `DELETE` | `/api/projects/{projectId}` | Project `DELETE_PROJECT` permission | Deletes a project. |
| `GET` | `/api/projects/{projectId}/members` | Authenticated project member | Lists project members and their roles. |
| `POST` | `/api/invitations` | Workspace `INVITE_MEMBER` permission | Creates a workspace invitation and an optional notification. |
| `POST` | `/api/projects/{projectId}/invitations` | Project `MANAGE_PROJECT_MEMBERS` permission | Creates a project invitation and an optional notification. |
| `PATCH` | `/api/invitations/{id}` | Authenticated addressed invitee | Accepts or declines an invitation with `{ "action": "ACCEPT" }` or `{ "action": "DECLINE" }`. |
| `GET` | `/api/notifications` | Authenticated user | Lists notifications and returns the unread count. |
| `PATCH` | `/api/notifications/{id}/read` | Authenticated notification owner | Marks one notification as read. |

## Data integrity and transactions

The application uses relational constraints and transactions to keep collaboration state consistent. Registration creates the initial user, personal workspace, and owner membership atomically. Project creation through the server action creates the project and its owner project-membership row atomically. Invitation acceptance creates the resulting membership and marks the invitation as accepted atomically, while unique compound keys prevent duplicate workspace or project memberships. [7] [9] [11] [14]

| Integrity mechanism | Applied to | Effect |
|---|---|---|
| Unique email | `User.email` | Prevents duplicate user accounts. |
| Unique session token | `Session.token` | Provides a single lookup key for a session cookie. |
| Compound membership uniqueness | `Membership(userId, workspaceId)` | Prevents a user from holding duplicate memberships in one workspace. |
| Compound project-membership uniqueness | `ProjectMember(userId, projectId)` | Prevents duplicate project membership rows. |
| Unique invitation token hash | `Invitation.tokenHash` | Prevents duplicate stored invitation token hashes. |
| Foreign-key relations | All related Prisma models | Keeps child records tied to existing parent records. |
| Query indexes | Workspace, project, user, invitation, and notification foreign keys | Supports common authorization, listing, and unread-notification queries. |
| Zod validation | Auth, project, task, and invitation inputs | Rejects invalid request shapes and selected domain values before writes. |

## Project structure

The repository keeps application behavior grouped by responsibility. The most important paths for extending the backend are shown below.

```text
Nexus/
├── prisma/
│   ├── schema.prisma            # PostgreSQL data model, relations, indexes, enums
│   └── migrations/              # Prisma migration output path
├── src/
│   ├── actions/                 # Server actions for auth, projects, and tasks
│   ├── app/
│   │   ├── (protected)/         # Authenticated dashboard, projects, and settings UI
│   │   ├── api/                 # Route handlers for JSON APIs
│   │   └── layout.tsx           # Root layout and global providers
│   ├── components/              # Shared navigation, forms, buttons, and UI pieces
│   ├── generated/prisma/        # Generated Prisma client output
│   ├── lib/
│   │   ├── auth.ts              # Current-user/session lookup
│   │   ├── authorization.ts     # Workspace and project permission checks
│   │   ├── current-workspace.ts # Workspace cookie resolution
│   │   ├── data/                # Server-side read helpers
│   │   └── prisma.ts            # Prisma client bootstrap
│   ├── providers/               # Client-side providers
│   ├── schemas/                 # Zod request schemas
│   └── proxy.ts                 # Request-level protected-route redirect
├── package.json
├── prisma.config.ts
└── README.md
```

## Local development

### Prerequisites

Install Node.js, pnpm, and a PostgreSQL database that the application can reach from the development environment. Prisma reads the database connection string from [`prisma.config.ts`][19]. The repository does not currently include a committed `.env.example`, so create a local `.env` file manually and keep it out of version control.

### Installation and database setup

```bash
pnpm install

# .env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/nexus?schema=public"

pnpm exec prisma generate
pnpm exec prisma migrate dev --name init
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) after the development server starts. The standard package scripts are available through pnpm: `pnpm dev`, `pnpm build`, `pnpm start`, and `pnpm lint`. [1]

### Useful Prisma commands

```bash
# Format the Prisma schema
pnpm exec prisma format

# Inspect the current database through Prisma Studio
pnpm exec prisma studio

# Create a migration after changing prisma/schema.prisma
pnpm exec prisma migrate dev --name describe-your-change
```

## Validation and quality checks

Run the following commands before opening a pull request. Lint currently completes without errors; the repository may report non-blocking ESLint warnings, so warnings should still be reviewed before merging.

```bash
pnpm lint
pnpm build
```

A useful implementation test sequence is to register a user, verify that the personal workspace and owner membership exist, create a project, verify its `ProjectMember` owner row, invite another registered user, accept the invitation, and confirm that the resulting workspace or project membership and notification state are updated together.

## Current implementation notes

The following details are important when extending the current system because they describe boundaries between the database schema and the active application code.

| Area | Current state | Engineering implication |
|---|---|---|
| Request protection | [`src/proxy.ts`][4] checks whether `session_token` exists and contains a TODO for deeper authentication at the proxy layer. | Keep authoritative session and permission checks in every server action and route handler. |
| Project creation paths | The server action creates `Project` and creator `ProjectMember(OWNER)` in one transaction; the REST `POST /api/projects` handler currently creates the `Project` row directly. | Keep the two paths aligned if REST clients must immediately access newly created projects. |
| Project status | Prisma stores `Project.status` as `String`; the active Zod schema accepts only `Active` and `Completed`. | Treat these values as application-level validation, not a database enum. |
| Task status | Prisma stores `Task.status` as `String`; task actions accept `TODO`, `active`, and `completed`. | Standardize casing or promote status to a Prisma enum if stronger integrity is required. |
| Project priority | `Project.priority` exists with a default of `medium`, but the current project validation and mutation paths do not expose it. | Add schema, UI, and API support before treating priority as a user-editable feature. |
| Task ownership | Persisted `Task` has no `userId`, assignee, or completion boolean; it is related only to `Project`. | Do not infer task ownership from the legacy client type definitions. |
| Attachments | `src/lib/data/attachments.ts` contains an in-memory sample collection and there is no Prisma `Attachment` model. | Attachments are not persisted in the current backend. |
| Invitation tokens | Invitations store a unique `tokenHash`; acceptance currently authorizes by the authenticated `inviteeId` and invitation id. | Any email-link flow should preserve the token-hash security design and define its delivery path explicitly. |

## References

[1]: ./package.json "Project manifest and scripts"
[2]: ./src/app/layout.tsx "Root application layout"
[3]: ./src/providers/query-provider.tsx "TanStack Query provider"
[4]: ./src/proxy.ts "Protected route proxy"
[5]: ./src/lib/auth.ts "Current-user and session lookup"
[6]: ./src/lib/authorization.ts "Workspace and project authorization"
[7]: ./prisma/schema.prisma "Prisma schema, models, relations, indexes, and enums"
[8]: ./src/lib/current-workspace.ts "Current workspace resolver"
[9]: ./src/actions/auth.actions.ts "Authentication server actions"
[10]: ./src/components/WorkspaceSwitcher.tsx "Workspace switching client component"
[11]: ./src/actions/project.actions.ts "Project server actions"
[12]: ./src/actions/task.actions.ts "Task server actions"
[13]: ./src/app/api/invitations/route.ts "Workspace invitation endpoint"
[14]: ./src/app/api/invitations/%5Bid%5D/route.ts "Invitation acceptance and decline endpoint"
[15]: ./src/app/api/projects/route.ts "Project collection endpoint"
[16]: ./src/app/api/notifications/route.ts "Notification collection endpoint"
[17]: ./src/schemas "Zod request schemas"
[18]: ./src/lib/prisma.ts "Prisma client bootstrap"
[19]: ./prisma.config.ts "Prisma configuration"
[20]: ./src/app/api/projects/%5BprojectId%5D/invitations/route.ts "Project invitation endpoint"
[21]: ./src/lib/api-response.ts "Shared API error response helper"
