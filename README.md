## Foundry Stack

Design-forward Next.js starter with DaisyUI, Better Auth, TanStack Query, MongoDB, and Mongoose already organized for future projects.

## Stack

- Next.js 16 App Router
- Tailwind CSS 4 + DaisyUI 5
- Lucide React
- Better Auth
- TanStack Query
- MongoDB + Mongoose

## Getting Started

Bootstrap the template, start MongoDB, then run the app:

```bash
npm install
npm run setup
npm run db:up
npm run dev
```

Open http://localhost:3000.

If you already run MongoDB yourself, skip `npm run db:up` and point `MONGODB_URI` at that instance.

On Windows, `npm run db:up` requires Docker Desktop and its Linux engine to be running. If Docker is installed but not started yet, the script now prints a clear message instead of the raw pipe error.

## Environment

Set these values in `.env`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=foundry_stack
BETTER_AUTH_SECRET=replace-with-a-32-character-secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
GOOGLE_SITE_VERIFICATION=
```

`npm run setup` copies `.env.example` to `.env` and generates a strong local Better Auth secret automatically.

## Project Structure

- `app/` routes and route handlers
- `components/layout/` shared site shell
- `components/auth/` login and register UI
- `components/analytics/` Google Analytics web-vitals reporting
- `lib/backend/` server-side auth, MongoDB, and Mongoose helpers
- `lib/backend/mongoose/schemas/` starter schemas
- `lib/seo/` metadata helpers and canonical URL utilities
- `lib/tanstack/queries/` reusable query logic

## Notes

- Better Auth is mounted at `/api/auth/[...all]`.
- Local auth works against the bundled Docker MongoDB setup, so a fresh clone can sign up and sign in without extra backend work.
- A protected `/dashboard` route is included as a starter authenticated destination.
- Google Analytics loads only when `NEXT_PUBLIC_GA_ID` is set to a valid GA4 measurement ID.
- The homepage is indexable and ships with sitemap, robots, Open Graph, Twitter metadata, and JSON-LD.
- Login, register, and dashboard routes are intentionally `noindex`, which is the normal production choice for auth pages.
- Add your domain models under `lib/backend/mongoose/schemas/` as the project grows.

## Validation

Run:

```bash
npm run lint
npm run build
npm run auth:info
```
