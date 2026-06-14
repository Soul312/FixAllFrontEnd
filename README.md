# FixAll — Web App (React + Spring Boot)

The web client for **FixAll**, an on-demand home-services marketplace. A React 18 + Vite
SPA is built and served as static resources by a thin Spring Boot app, which talks to the
[FixAll backend](../FixAll%20Backend) over HTTP. The web app serves **all three roles** —
clients, professionals, and administrators.

## Tech stack
- **React 18 + Vite** (SPA in `ui/`), React Router
- **Spring Boot 3.3.5** (Java 17) — serves the built SPA from `/static` and forwards
  non-API routes to `index.html`
- **Stripe.js** (`@stripe/react-stripe-js`) for in-app payments
- **Google Maps** for the location picker

## Project layout
```
FixAll Frontend/
├─ ui/                 # React + Vite source (the actual app)
│  ├─ src/pages/       # auth, client, pro, admin, profile, home
│  └─ .env.example     # VITE_* config template
├─ src/                # Spring Boot wrapper that serves ui/dist
├─ Dockerfile          # multi-stage: build SPA -> build jar -> run
└─ docker-compose.yml
```

## Configuration
`VITE_*` variables are **baked into the bundle at build time**, so only public,
browser-safe values belong here.
```bash
cp ui/.env.example ui/.env
```
| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend base URL (default `http://localhost:8080`) |
| `VITE_GOOGLE_MAPS_KEY` | Google Maps **browser** key (restrict by HTTP referrer) |

> The Stripe **publishable** key is fetched at runtime from the backend
> (`GET /api/payments/config`) — it does **not** go in `ui/.env`.

## Run with Docker (recommended)
Docker Compose reads `FixAll Frontend/.env` and passes `VITE_*` into the image build:
```bash
docker compose up -d --build frontend
```
Served at **`http://localhost:8081`** (port chosen to avoid clashing with the backend).
Because `VITE_*` is compiled in, **rebuild** after changing env values.

## Local development
```bash
cd ui
npm install
npm run dev          # Vite dev server with hot reload
```
Build the SPA into Spring Boot static resources and run the server:
```bash
cd ui && npm run build      # outputs ui/dist (Gradle copies it into static/)
cd .. && ./gradlew bootRun  # http://localhost:8081
```

## Notes
- The backend must be running and reachable at `VITE_API_BASE_URL`.
- API calls live in `ui/src/api.js` (`apiJson`, `apiUpload`, `fileUrl`).
