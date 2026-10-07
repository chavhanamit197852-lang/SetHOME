# SetHome React Frontend

This is the React + Vite + TypeScript migration of the original SetHome frontend. It uses the existing Spring Boot routes and HTTP session cookies without backend changes.

## Run

1. Start the existing Spring Boot backend on port `8080`.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:5500`.

Vite proxies `/api` to the Spring Boot backend so the existing session cookie flow works during development.
