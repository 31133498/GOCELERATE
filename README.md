# Gocelerate

Accountability platform that connects Nigerian social-impact projects with funders — milestone
tracking, real-time expense logging, and instant reports built in from day one.

Live:

- Frontend (Vercel): deployed from `main`
- Backend API (Render): https://gocelerate.onrender.com
- API docs (Swagger UI): https://gocelerate.onrender.com/swagger-ui.html

## Repository layout

| Path | Stack | Notes |
|------|-------|-------|
| `gocelerate/` | Spring Boot 3 (Java, Maven) | REST API, JWT auth, JPA/Hibernate, MySQL, Dockerised |
| `gocelerate-frontend/` | React + Vite + TypeScript + Tailwind | SPA, deployed to Vercel |
| `render.yaml` | Render blueprint | Backend service `gocelerate-backend` (Docker env, free plan) |
| `docker-compose.yml` | Local dev | MySQL 8 + backend for a one-command local stack |
| `.github/workflows/keep-alive.yml` | GitHub Actions | Pings the API so Render's free tier doesn't spin down |

## Local development

### Option A — Docker (backend + database together)

```bash
docker compose up --build
```

- API: http://localhost:8080
- MySQL: `localhost:3306` (db `gocelerate`, user `root`, password `gocelerate123`)

### Option B — run each part directly

Backend (needs a MySQL 8 instance on `localhost:3306`, or start just the db with `docker compose up db`):

```bash
cd gocelerate
./mvnw spring-boot:run
```

Frontend:

```bash
cd gocelerate-frontend
npm install
cp .env.example .env   # set VITE_API_BASE_URL (http://localhost:8080 for local)
npm run dev            # http://localhost:5173
```

## Configuration

### Backend (environment variables)

| Variable | Default (local) | Purpose |
|----------|-----------------|---------|
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/gocelerate` | JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | `root` | DB user |
| `SPRING_DATASOURCE_PASSWORD` | `gocelerate123` | DB password |
| `SPRING_JPA_DDL_AUTO` | `update` | Hibernate schema management |
| `JWT_SECRET` | dev value in `application.properties` | JWT signing key — set a real secret in prod |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | CORS allow-list |
| `PORT` | `8080` | HTTP port (Render sets this) |

### Frontend

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Base URL of the backend API |

## Deployment

- **Backend → Render**: Docker service defined in `render.yaml`, auto-deploys on push to `main`.
  Datasource and secret env vars are set directly in the Render dashboard (`sync: false`).
  Production database is a managed **MySQL** instance (Aiven, free tier) — SSL required.
- **Frontend → Vercel**: auto-deploys on push to `main`. Set `VITE_API_BASE_URL` to the Render URL.

### Keeping the free tiers warm

Render's free web service spins down after ~15 minutes of inactivity, and the managed database
powers off when idle. Two schedulers hit `GET /api/public/projects` to keep both awake:

- `.github/workflows/keep-alive.yml` — every 10 min (best-effort; GitHub delays scheduled runs)
- An external cron (cron-job.org) — every 5 min (primary)

## Health check

```
GET https://gocelerate.onrender.com/api/public/projects
```

Public, unauthenticated. Returns the list of projects as JSON — a 200 with a JSON body means the
API and database are both up.
