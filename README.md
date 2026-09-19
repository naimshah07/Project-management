# Project Management Platform

A production-ready full-stack Project Management Platform built for teams to organize workspaces, track projects, assign tasks, and collaborate in real time. Built with React, Express.js, PostgreSQL (Neon), Prisma ORM, Clerk Authentication, and Inngest background processing, this platform delivers a secure, polished workspace experience with role-based access, progress analytics, calendar tracking, and automated notifications.

## Features

- **Workspace Management** — Create and switch between multiple isolated workspaces, invite team members, and keep project data organized by team or client.
- **Project Tracking** — Create, edit, and archive projects with status (Planning / Active / On Hold / Completed / Cancelled), priority flags, custom start and end dates, and an overall progress slider.
- **Task Management** — Break projects into actionable tasks with type (Task, Bug, Feature, Improvement, Other), priority levels, due dates, assignees, and status workflows (Todo, In Progress, Done).
- **Team Collaboration** — Invite members to projects, view team rosters, identify the team lead, and discuss tasks with threaded comments and real-time polling.
- **Analytics Dashboard** — Visualise completion rates, active and overdue tasks, team size, plus bar, pie, and priority breakdown charts powered by Recharts.
- **Calendar View** — Browse deadlines and upcoming milestones on a dedicated project calendar with colour-coded priority tags.
- **Secure Authentication** — Clerk-powered sign-in and sign-up with protected routes, workspace-scoped access, and JSON Web Tokens for every API call.
- **Background Sync & Notifications** — Inngest functions sync Clerk user events to the database, and Nodemailer handles automated email flows.
- **Modern Responsive UI** — Inter and Outfit typography, violet accent gradient theme, glass-morphism cards, light and dark mode support, and a mobile-first layout.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 4, Redux Toolkit, React Router 7, Clerk React, Lucide Icons, Recharts, React Hot Toast |
| Backend | Express.js 5, Prisma ORM, Clerk Express, Inngest, Nodemailer, CORS, dotenv |
| Database | PostgreSQL on Neon |
| Auth | Clerk |
| Background Jobs | Inngest |

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- A Neon PostgreSQL database
- A Clerk account
- An Inngest account

### Setup

**1. Clone and install**
```bash
git clone <your-repo-url
cd ProjectManagement-main
```

**2. Server setup**
```bash
cd server
npm install
```
Create `server/.env` with:
```
DATABASE_URL=your-neon-postgres-url
CLERK_WEBHOOK_SECRET=your-clerk-webhook-secret
CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
INNGEST_EVENT_KEY=your-inngest-event-key
INNGEST_SIGNING_KEY=your-inngest-signing-key
SMTP_HOST=your-smtp-host
SMTP_PORT=your-smtp-port
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
```

Run database migrations and generate Prisma client:
```bash
npx prisma generate
npx prisma db push
```

Start the server on port 5000:
```bash
npm run server
```

**3. Client setup**
```bash
cd ../client
npm install
```
Create `client/.env` with:
```
VITE_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
VITE_API_BASE_URL=http://localhost:5000
```

Start the client on port 5173:
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Project Structure

```
ProjectManagement-main/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── components/      # UI components (dialogs, cards, sidebar, etc.)
│       ├── pages/         # Dashboard, Projects, TaskDetails, Team, etc.
│       ├── features/      # Redux slices (theme, workspace)
│       └── configs/       # Axios API client
└── server/                  # Express + Prisma backend
    ├── controllers/   # Business logic for projects, tasks, workspaces, comments
    ├── routes/          # REST endpoints + Clerk webhook
    ├── inngest/        # Background sync functions
    ├── middlewares/   # Clerk auth middleware
    └── prisma/        # Prisma schema
```

## Scripts

| Command | Description |
|---|---|
| `cd server && npm run server` | Start Express with nodemon on port 5000 |
| `cd client && npm run dev` | Start Vite dev server on port 5173 |
| `cd client && npm run build` | Production build |
| `cd client && npm run lint` | Run ESLint |

## Authorized User

This project is developed and maintained by **Naimshah**.
