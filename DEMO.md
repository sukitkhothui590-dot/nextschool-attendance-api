# Five-Minute Reviewer Walkthrough

## 0:00 — Start

Run:

```bash
npm run demo
```

The command checks Docker and required ports, builds the stack, migrates and seeds the isolated database, runs smoke tests, and opens the dashboard.

## 1:00 — Sign in

Open http://localhost:3000 and sign in with:

```text
admin@nextschool.local
Password123!
```

Point out that the dashboard uses a server-side API URL and an HttpOnly session cookie.

## 2:00 — View operations data

Show the student list and attendance summary. Search for `NS0020`, `NS0001`, and `NS0021` to introduce the three demo cases.

## 3:00 — Explain check-in rules

- `NS0020`: active and initially absent, so check-in succeeds.
- `NS0001`: seeded as present today, so a second check-in returns duplicate conflict.
- `NS0021`: inactive, so check-in is rejected.

Show Swagger at http://localhost:3001/docs for the REST contract and authentication requirements.

## 4:00 — Show reliability controls

Mention the Bangkok business date, unique database constraint, JWT guard, request validation, rate-limited login, liveness/readiness endpoints, and Compose startup dependency chain.

## Optional reviewer commands

```bash
npm run demo:status
npm run demo:logs
npm run demo:smoke
npm run demo:reset
```

`demo:reset` asks for confirmation before deleting the dedicated demo Postgres volume.
