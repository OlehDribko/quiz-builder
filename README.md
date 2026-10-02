# Quiz Builder

A full-stack application for creating and managing quizzes.

> Work in progress — database setup and run instructions will be added once Prisma and PostgreSQL are configured.

## Tech stack

### Frontend
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Redux Toolkit
- Axios
- React Hook Form + Zod

### Backend
- Node.js + Express + TypeScript
- Zod
- Prisma + PostgreSQL _(planned)_

## Project structure

```
quiz-builder/
├── backend/    # Express REST API
│   └── src/
│       ├── app.ts      # Express app configuration
│       └── server.ts   # Server entry point
├── frontend/   # Next.js application
│   └── src/
│       └── app/        # App Router pages and layouts
├── README.md
└── .gitignore
```
