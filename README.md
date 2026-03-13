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
   - `VITE_API_BASE_URL` to `/api` for local development
   - `API_PROXY_TARGET` to your backend URL, default `http://localhost:4003`
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
- `src/pages/auth`: sign-in and sign-up flows
- `src/pages/dashboard`: dashboard and analytics pages
- `src/pages/expenses`: expense creation, approvals, and history
- `src/pages/finances`: accounts, savings, and personal finance views
- `src/pages/room`: room setup and member management
- `src/pages/social`: one-to-one and namaz pages
- `src/pages/tasks`: todo page
- `src/pages`: shared route entry pages like `Index` and `NotFound`
- `src/components`: shared UI and feature components
- `src/lib`: API utilities and types
- `src/config`: app configuration
