# Go Backend Starter (Hexagonal/Clean)

Production-minded Go backend using Hexagonal architecture.

- HTTP: chi, CORS, request logging, healthcheck, error envelope, pagination helper
- Persistence: GORM + Postgres, auto-migrate (dev), UnitOfWork scaffold
- Config: env-based with validation
- Logging: zerolog
- Makefile, Dockerfile, docker-compose

## Quickstart
1) `cp .env.example .env` (edit `DB_DSN` if needed)
2) `docker compose up -d db`
3) `make migrate-up`
4) `go run ./cmd/api`
5) `curl :8080/healthz` → `ok`

## Endpoints (example entity: Muda)
- `POST   /v1/mudas`
- `GET    /v1/mudas/{id}`
- `GET    /v1/mudas?page&size`
- `PUT    /v1/mudas/{id}`
- `DELETE /v1/mudas/{id}`
- `POST   /v1/mudas/{id}/images`
