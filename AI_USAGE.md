# AI Usage Disclosure

Cursor Composer was used as implementation assistance for scaffolding, drafting modules, documentation, and cross-platform demo scripts.

## Tools used

- Cursor Composer (implementation partner in this repository)

## Tasks AI helped with

- NestJS modular monolith structure
- Prisma schema and seed drafting
- Bangkok timezone domain helpers
- Next.js BFF session routes and dashboard UI
- Docker Compose demo stack and reviewer scripts
- README / DESIGN / DEMO drafting

## Most useful prompt idea

Treat the dashboard as a scoped reference client while keeping the NestJS REST API independently testable and directly reachable through curl and Swagger.

## Real AI / environment issue corrected

### Suggestion

Use Docker Compose Postgres on host port `5432` with credentials `nextschool/nextschool`.

### Why it seemed reasonable

That is the common local-development default and matched the committed `.env.example`.

### Verification performed

`docker exec` into the container authenticated successfully, but Prisma from the Windows host failed with authentication errors against `localhost:5432`.

### Issue discovered

A native Windows PostgreSQL process was already listening on IPv4 port `5432`, so host-side clients were not consistently reaching the Docker database.

### Final correction

Map developer Compose Postgres to host port `5433`, update `DATABASE_URL` / `TEST_DATABASE_URL` accordingly, and keep the reviewer demo database internal to the Docker network.

A second Windows-specific correction: demo scripts must spawn `npm`/`npx` with a shell on Windows, while Docker `exec` SQL must be streamed on stdin so PowerShell does not split the statement.

## What remained developer responsibility

- Confirming business rules (`08:30` inclusive PRESENT, ACTIVE-only check-in, unique daily attendance)
- Keeping JWT out of browser JavaScript via HttpOnly BFF cookies
- Ensuring tests use `TEST_DATABASE_URL` without falling back to development data
- Verifying `npm run demo` and smoke checks on the actual Windows environment
- Reviewing generated code for secrets, unsafe logs, and contract mismatches
