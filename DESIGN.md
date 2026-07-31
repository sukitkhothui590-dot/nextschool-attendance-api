# Design Decisions

## Deployment shape

The reviewer stack uses four Compose services: Postgres, one-shot database initialization, API, and web. The initializer applies committed Prisma migrations and the deterministic seed before the API starts. This avoids application startup races and makes the stack inspectable.

The existing `docker-compose.yml` is intentionally untouched for developer-mode Postgres on host port `5433`. `docker-compose.demo.yml` is a separate production-shaped reviewer stack with an internal-only Docker network; only web and API publish host ports.

## Monorepo Docker builds

Both Dockerfiles use Node 22 Alpine and workspace-aware `npm ci`. Package manifests are copied before source to preserve dependency-layer caching. The API build generates Prisma Client and compiles Nest; its runner stage contains production dependencies, compiled output, schema, and migrations under a non-root user.

The web build uses Next's `standalone` output. The runner copies only standalone server files, static assets, and public assets, then runs as a non-root user.

Trade-off: the Dockerfiles retain both workspace manifests because npm lockfile workspace resolution needs the monorepo layout. This is slightly more setup than isolated package locks but keeps one authoritative lockfile.

## Security boundaries

`INTERNAL_API_URL` is used only by the Next server and resolves to Docker service `api`. It is not a `NEXT_PUBLIC_*` value. Browser authentication uses the web BFF's HttpOnly cookie rather than exposing the API JWT to browser JavaScript.

The API validates environment configuration, rejects short JWT secrets, uses Helmet, restrictive CORS, validation whitelisting, rate-limited login, JWT guards, and database constraints. The demo secret is explicitly local-only and must never be promoted to an environment with real users.

## Attendance correctness

The business date is Bangkok time. A unique database index on `(studentId, attendanceDate)` is the final safeguard against concurrent duplicate check-ins. The service checks first to produce a useful `409`, then also maps an insert-time unique conflict to that same result.

The seed makes `NS0001` duplicate-ready, `NS0020` success-ready, and `NS0021` inactive. The smoke test removes only today's `NS0020` row inside the demo database before asserting `201`; no reset endpoint is added to the public API.

## Operational trade-offs

- Demo data is persistent by default so a reviewer can inspect it. `demo:reset` requires confirmation before removing the named volume.
- Health is a fast liveness probe; readiness verifies database connectivity.
- The demo scripts use Node ESM and `child_process.spawn` argument arrays for Windows PowerShell, macOS, and Linux compatibility. Browser launch is best effort only.
