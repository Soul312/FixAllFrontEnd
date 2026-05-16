# FixAll Frontend (Spring Boot + React)

This repo serves a React SPA with Spring Boot and connects to the FixAll backend via HTTP APIs.

## Stack
- Spring Boot 3 (serves `/static`)
- React 18 + Vite
- React Router

## Setup
1. Java 17 installed (for Spring Boot)
2. Node.js 18+ installed (for the UI)

## Environment variables
Create a local file at `ui/.env` based on `ui/.env.temp`.

```
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_MAPS_KEY=
```

## Development (UI)
```
cd "C:\Users\soula\IdeaProjects\FixAll FrontEnd\ui"
npm install
npm run dev
```

## Build UI for Spring Boot
```
cd "C:\Users\soula\IdeaProjects\FixAll FrontEnd\ui"
npm run build
```

Then run Spring Boot (the Gradle task copies `ui/dist` into `src/main/resources/static`).

## Run Spring Boot
```
cd "C:\Users\soula\IdeaProjects\FixAll FrontEnd"
.\gradlew.bat bootRun
```

The Spring Boot server runs on `http://localhost:8081` by default to avoid clashing with the backend.

## Notes
- API base URL is controlled by `VITE_API_BASE_URL`.
- Non-API routes forward to `index.html` so React Router works on refresh.
