# Roomie Bill Buddy

Roomie Bill Buddy is a web app for splitting household expenses, tracking approvals, and visualizing spending trends.

## Features
- Room-based expense tracking with invite codes
- Approval workflow for shared expenses
- Analytics dashboards for trends, categories, and contributors
- Personal and one-to-one expense views
- Responsive UI built for desktop and mobile

## Tech Stack
- React + Vite + TypeScript
- Tailwind CSS + shadcn-ui
- Recharts for charting
- Prisma + MongoDB schema (used by the API)

## Getting Started
1. Install dependencies:
   `npm install`
2. Create `.env` from `.env.example` and set:
   - `VITE_API_BASE_URL` (defaults to `/api`; Vite proxies `/api` to `http://localhost:4003`)
   - `VITE_DEFAULT_ROOM_ID` (optional quick sign-in)
   - `DATABASE_URL` (only needed when running Prisma tasks or the API)
3. Start the dev server:
   `npm run dev`

## Data and API
The frontend expects a REST API that supports rooms, roommates, auth, and expenses.
Database models live in `prisma/schema.prisma` and seed data in `prisma/seed.js`.

Prisma helpers:
- `npm run prisma:generate`
- `npm run prisma:push`
- `npm run prisma:seed`
- `npm run prisma:studio`

## Scripts
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

## Project Structure
- `src/pages`: screens and flows
- `src/components`: shared UI and feature components
- `src/lib`: API/storage utilities and types
- `src/config`: app configuration
