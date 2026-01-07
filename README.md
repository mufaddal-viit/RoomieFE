# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/0c34f199-3260-4484-8ca8-11f5424a138e

## How can I edit this code?

There are several ways of editing your application.


**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Database (Prisma + MongoDB)

- Ensure `.env` contains `DATABASE_URL` (see `.env.example` for the format).
- Frontend API calls proxy to `VITE_API_BASE_URL` (defaults to `/api` -> `http://localhost:4000/api` via Vite proxy). Set `VITE_DEFAULT_ROOM_ID` to the room you want to log into by default.
- Run the API server locally: `npm run dev:server` (listens on `4000`), then start the Vite dev server: `npm run dev`.
- After installing dependencies, generate the Prisma client: `npm run prisma:generate`.
- Push the schema to your MongoDB database: `npm run prisma:push`.
- Seed starter roommates and expenses (idempotent): `npm run prisma:seed`.
- After seeding, copy the printed room id into `VITE_DEFAULT_ROOM_ID` for quick sign-in buttons.
- Open Prisma Studio to inspect data: `npm run prisma:studio`.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/0c34f199-3260-4484-8ca8-11f5424a138e) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
