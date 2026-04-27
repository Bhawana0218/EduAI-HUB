# MERN Full-Stack Technical Assessment Submission

This repository implements the requested MERN assignment using the provided frontend project and an Express/MongoDB/Redis backend.

## Tech Stack

- Frontend: Next.js (React, TypeScript)
- Backend: Node.js, Express
- Database: MongoDB (Mongoose)
- Cache: Redis
- Auth: JWT + HTTP-only cookie support
- AI: Gemini API (with graceful mock fallback)
- Containerization: Docker + Docker Compose

## Requirement Checklist

### Part 1: Backend

1. Admin signup/login with hashed password and JWT: completed.
2. Protected admin route with JWT middleware: completed (`/api/admin/dashboard` and protected upload endpoint).
3. Gemini recommendation endpoint: completed (`POST /api/recommendations`, `POST /api/recommend`).
4. Course CSV upload and MongoDB persistence: completed (`POST /api/admin/courses/upload`).
5. Course search/list and Redis caching: completed (`GET /api/courses`, `GET /api/courses/search`, `GET /api/courses/:id`).
6. Cache invalidation after upload: completed.

### Part 2: DevOps

1. CI/CD pipeline sketch: completed (see section below).
2. Dockerization: completed (`backend/Dockerfile`, `newfrontend/Dockerfile`, `docker-compose.yml`).
3. Linux hosting considerations: completed (see section below).
4. Kafka usage concepts: completed (see section below).

### Part 3: Frontend

1. Auth API integration for admin login: completed.
2. Course management integration post-login: completed in Admin Dashboard (real upload + list/search from backend).
3. AI recommendations page integration: completed (`/course-match` now calls backend recommendations endpoint).
4. State management: completed using React Context API (`src/lib/app-state.tsx`).
5. Client-side caching for course listing: completed via `localStorage` cache with TTL in app state provider.

## Backend API Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/admin/dashboard` (protected)
- `POST /api/admin/courses/upload` (protected, multipart form-data: `file`)
- `GET /api/courses?query=&category=&level=&university=&page=&limit=`
- `GET /api/courses/search?query=...`
- `GET /api/courses/:id`
- `POST /api/recommendations`
- `POST /api/recommend`

## Local Run Instructions (Without Docker)

### 1) Backend

```bash
cd backend
npm install
npm run dev
```

Required environment variables in `backend/.env`:

- `MONGODB_URI` (or `MONGO_URI`)
- `JWT_SECRET`
- `GEMINI_API_KEY` (optional for real Gemini calls, otherwise mock fallback is used)
- `REDIS_URL` (optional, caching gracefully degrades if missing)

### 2) Frontend

```bash
cd newfrontend
npm install
npm run dev
```

Set in `newfrontend/.env.local`:

- `NEXT_PUBLIC_API_URL=http://localhost:5000/api`

## Docker Instructions

### Build and run full stack

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:9002`
- Backend API: `http://localhost:5000`
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`

## CI/CD Pipeline Sketch

### Stage 1: Code Commit + PR

- Tool: GitHub + GitHub Flow
- Branch protection + PR review required.

### Stage 2: Build + Static Checks

- Tool: GitHub Actions
- Run:
  - Backend dependency install + lint/test (if tests exist)
  - Frontend `npm run typecheck` and build

### Stage 3: Integration Checks

- Tool: GitHub Actions service containers
- Spin up Mongo + Redis, run API smoke tests for auth/upload/recommend endpoints.

### Stage 4: Container Build + Push

- Tool: GitHub Actions + Docker Buildx + GitHub Container Registry
- Build `backend` and `frontend` images and push tagged versions.

### Stage 5: Deploy

- Tool options: SSH + Docker Compose, AWS ECS, or Kubernetes
- Strategy: rolling update and health-check validation.

## Linux Hosting Considerations

- Use `pm2` for backend process management when not containerized.
- Put Nginx as reverse proxy for TLS termination, gzip, and route forwarding.
- Keep secrets in environment files or secret managers (never hardcode keys).
- Enable firewall rules (allow only 22/80/443 externally).
- Set log rotation and monitoring (PM2 logs, Nginx logs, uptime checks).

### Multiple Projects on One Server

- Use separate Linux users per project or strict directory permissions.
- Use unique ports per service and route by domain/subdomain in Nginx.
- Containerize each project and isolate networks with Docker Compose projects.
- Store env files per project and keep deployment scripts separate.

## Kafka Usage (Conceptual)

1. Async activity logging:
   - Publish events such as login, uploads, and recommendation requests to Kafka.
   - A separate consumer persists analytics/audit logs without slowing API responses.

2. Event-driven recommendation pipeline:
   - Course upload events can trigger downstream consumers to precompute embeddings, tags, or recommendation indexes asynchronously.

## Notes

- Recommendation service gracefully falls back to mock recommendations if Gemini key is unavailable/restricted.
- Redis is optional in local setup; APIs still work without it.
