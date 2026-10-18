# QA Assessment & Automation Report: Virtual Data Room (VDR)

**Candidate:** Tabriz Mammadov

**Target Product:** [Virtual Data Room Web App](https://virtual-data-room-ten.vercel.app)

**Backend API:** [Railway](https://virtual-data-room-production.up.railway.app) (`GET /health`) · [OpenAPI](https://virtual-data-room-production.up.railway.app/docs)

| Account | Email | Password |
| --- | --- | --- |
| Owner | `john@example.com` | `johnpass` |
| Viewer | `viewer@example.com` | `viewerpass` |

---

## How to run the automation

Requires Node.js 18+. From this repository:

```bash
npm install
npx playwright install chromium
npm test
```

Useful splits:

```bash
npm run test:api    # health, auth, folder CRUD
npm run test:e2e    # login + folder + PDF upload
npm run test:headed
```

Optional overrides (see `.env.example`): `WEB_URL`, `API_URL`, `OWNER_EMAIL`, `OWNER_PASSWORD`.

---

## 1. Test Plan

### Scope & objectives

Evaluate functional integrity, edge-case behavior, security boundaries, and scalability risks of the VDR MVP.

**In-scope**

- Authentication and session persistence
- Nested folder lifecycle (create, open, rename, cascade delete)
- PDF upload / view, name conflicts, move, delete
- Read-only sharing: public link and per-email, plus revocation
- API liveness and REST contract checks

### Strategy

1. Exploratory / edge-case testing against the live UI
2. API verification against documented OpenAPI contracts
3. Automated Playwright + TypeScript suite (API layer + critical UI path, Page Object Model)

---

## 2. Prioritized findings

### Medium — scalability & product risk

**ISSUE-01 — Weak client-side upload constraints for an enterprise data room**  
The UI advertises PDF-only drag-and-drop (`accept="application/pdf"`). Server-side size caps should still be explicit so storage cannot be abused.

**ISSUE-02 — Owner room already contains a dense unpaginated listing in the DOM**  
John’s default room lists many folders and PDFs in one table. Cursor pagination exists on the API (`cursor` / `limit` / `nextCursor`), but a large subtree still risks a heavy UI if the client fetches a high `limit` and renders every row.

### Low — UX polish

**ISSUE-03 — Shared demo data**  
The seeded owner account is polluted with previous testers’ folders (special-character names, one-letter folders). Fresh assessments should isolate fixtures with unique names and delete them afterwards (this suite does that).

**ISSUE-04 — Dropzone emphasis**  
Drag-and-drop is advertised in copy; a stronger hover target would make the control easier to discover.

---

## 3. Testing approach & AI usage

Testing is ordered by **user impact and data-room risk**: privacy, document availability, and folder cascade safety over cosmetic issues.

AI was used to:

- brainstorm concurrent-delete / share edge cases
- scaffold Playwright POM + TypeScript boilerplate
- structure this report

Selectors, credentials, and assertions were verified against the live app and OpenAPI (`/docs-json`), then executed.

---

## 4. Automation architecture

```text
vdr-qa-automation/
├── pages/
│   ├── LoginPage.ts
│   └── DataRoomPage.ts
├── fixtures/env.ts
├── tests/
│   ├── api/
│   │   ├── health.spec.ts
│   │   ├── auth.spec.ts
│   │   ├── folders.spec.ts
│   │   └── shares.spec.ts
│   └── e2e/
│       ├── auth.spec.ts
│       └── vdr-flow.spec.ts
├── assets/sample.pdf
├── playwright.config.ts
└── package.json
```

**Pyramid**

| Layer | Coverage |
| --- | --- |
| API | `GET /health`, login success/failure, `GET /auth/me`, folder create/list/delete, public-link share + revoke (`410 Gone`) |
| E2E | Sign-in, invalid credentials, create folder → open → upload `sample.pdf` → cleanup |

---

## 5. Final QA report

### What was tested

- Login with the provided owner account; rejection of a wrong password
- Folder CRUD via API and UI
- PDF upload into a newly created folder
- Public-link share, guest resolve, and revoke (`410 Gone`)
- Backend liveness and JWT-protected `GET /auth/me`

### Release readiness

**Ready for MVP release, with follow-ups.** Core owner flows work: sign-in, folders, PDF upload, and API health. Next sprint should add automated share/revoke coverage (public token + `viewer@example.com`) and confirm client pagination against large rooms.

### Next steps

1. Automate public-link and per-email sharing, including read-only checks in a second browser context
2. Add a small load check on upload-intent / complete
3. Keep Playwright on PRs via `.github/workflows/playwright.yml`
