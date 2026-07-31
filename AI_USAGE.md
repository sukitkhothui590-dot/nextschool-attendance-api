# AI Usage Disclosure

Cursor Composer was used to accelerate implementation, documentation drafting, and reviewer-stack scripting.

One real environment issue encountered during development: Windows host PostgreSQL was listening on port `5432`, which caused authentication failures when commands accidentally connected to the host service instead of the Docker database. The developer Compose configuration maps the container's PostgreSQL port `5432` to host port `5433` to make the target explicit.

Verification steps:

1. Start developer Postgres with `npm run db:up`.
2. Connect using `localhost:5433`, not `localhost:5432`.
3. Run migrations and seed against the configured `DATABASE_URL`.
4. For the reviewer stack, run `npm run demo`; its smoke suite checks health, readiness, docs, login, student lookup, summary, and the three check-in outcomes.

AI assistance does not replace developer responsibility. The developer must review generated code, protect secrets, validate behavior in the target environment, assess security implications, and confirm that business rules remain correct.
