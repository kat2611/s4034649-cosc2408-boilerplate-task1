# Firestore Schema

## Overview

All collections use the typed collection pattern — see `frontend/src/lib/firebase/firestore.ts`.
Security rules are in `firebase/firestore.rules`.

## Schema versioning

Every document in every collection **must** include a `_schemaVersion` field:

\`\`\`typescript
_schemaVersion: 1  // increment when doing a breaking schema change
\`\`\`

This enables **lazy migration** — when a document is read, check `_schemaVersion` and migrate on the fly if it's behind current.

**Rules:**
- `_schemaVersion` is always `1` on creation
- Non-breaking changes (adding optional fields with defaults) keep the same version
- Breaking changes (rename, remove, type change) increment the version and require a migration function
- Never remove `_schemaVersion` from a schema

---

## `users` collection

**Path:** `/users/{userId}`
**Access:** Owner-only (user can read/write their own document; admins can read all)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uid` | `string` | Yes | Firebase Auth UID (same as document ID) |
| `email` | `string` | Yes | User's email address |
| `displayName` | `string \| null` | Yes | Display name from Auth or profile |
| `photoURL` | `string \| null` | Yes | Profile photo URL |
| `role` | `'user' \| 'admin'` | Yes | User role — immutable by user after creation |
| `createdAt` | `Timestamp` | Yes | When the document was created |
| `updatedAt` | `Timestamp` | Yes | When the document was last updated |
| `_schemaVersion` | `1` | Yes | Schema version for lazy migration |

**Creation:** Auto-created by `AuthProvider` on first sign-in via `syncUserProfile()`.
**Deletion:** Hard-delete is disabled in security rules. Use `deletedAt` field for soft-delete.

---

## `notes` collection

**Path:** `/notes/{noteId}`
**Access:** Owner-only

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uid` | `string` | Yes | Owner's Firebase Auth UID |
| `title` | `string` | Yes | Note title (1–200 chars) |
| `body` | `string` | Yes | Note body (≤10 000 chars) |
| `createdAt` | `Timestamp` | Yes | Creation time |
| `updatedAt` | `Timestamp` | Yes | Last update time |
| `_schemaVersion` | `1` | Yes | Schema version for lazy migration |

---

<!-- Add new collection schemas below -->
```

---

## Try it

```bash
pnpm run dev
```

1. Open [http://localhost:3000](http://localhost:3000) and sign in (or sign up if you don't have
   an account yet)
2. Click **Notes** in the sidebar
3. Type a title, optionally a body, click **Add note**
4. It should appear in the list immediately — no page refresh

If you see "Missing or insufficient permissions," you forgot to deploy the rules from File 3
(`npx firebase-tools deploy --only firestore:rules`).

---

## Verify (plain commands, no tooling beyond pnpm)

Run these from the repo root:

```bash
pnpm run typecheck   # both packages must report no errors
pnpm run lint        # both packages must report no errors
pnpm run test:all    # backend + frontend unit tests must all pass
pnpm run build       # confirms the production build compiles
```

All four must pass before you move on.

---

## Commit, push, and open a pull request

```bash
git add .
git commit -m "feat: add notes feature"
```

The commit message must start with `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, or `chore:` —
a git hook rejects anything else. If you made several unrelated changes, commit them separately
instead of bundling everything into one message.

```bash
git push -u origin feature/notes
```

Then open a pull request back into `main`. Either through GitHub's website (it'll show a
"Compare & pull request" banner right after the push), or from the terminal if you have the
[GitHub CLI](https://cli.github.com) installed:

```bash
gh pr create --base main --title "feat: add notes feature" \
  --body "Adds a notes feature — users can create and see their own notes."
```

Once CI passes (lint, typecheck, tests all run automatically on the PR) and it's reviewed,
merge it. `main` is protected — you can't push to it directly, which is why Step 0 had you
branch off it in the first place.

---

## Optional — add a backend API endpoint (Files 10–12)

Skip this section unless you specifically want an HTTP API for notes in addition to the app
itself (most features never need this — see `GUIDE.md § 1`).