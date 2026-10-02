# Quiz Builder

A full-stack web application for building quizzes. Users can:

- create quizzes with **Boolean**, **Input** and **Checkbox** questions
- view all quizzes with their question counts
- view a single quiz with its questions and correct answers (read-only)
- delete quizzes, with a 5-second **Undo** window before the deletion becomes permanent

## Contents

- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Installation](#installation)
- [Environment configuration](#environment-configuration)
- [PostgreSQL setup](#postgresql-setup)
- [Prisma setup](#prisma-setup)
- [Sample quiz](#sample-quiz)
- [Running the application](#running-the-application)
- [API endpoints](#api-endpoints)
- [Pages](#pages)
- [Delete and Undo behavior](#delete-and-undo-behavior)
- [Code quality and build](#code-quality-and-build)
- [Notes](#notes)

## Tech stack

**Frontend**

- Next.js (App Router) and React
- TypeScript
- Tailwind CSS
- Redux Toolkit
- Axios
- React Hook Form and Zod
- react-toastify

**Backend**

- Node.js
- Express.js
- TypeScript
- Prisma (ORM and migrations)
- PostgreSQL
- Zod (request validation)

## Project structure

```text
quiz-builder/
├── backend/                  # Express REST API
│   ├── prisma/
│   │   ├── migrations/       # Committed database migrations
│   │   ├── schema.prisma     # Quiz, Question, QuestionOption models
│   │   └── seed.ts           # Sample quiz seed script
│   ├── prisma.config.ts      # Prisma configuration (schema, migrations, seed, DATABASE_URL)
│   ├── src/
│   │   ├── routes/           # Route definitions
│   │   ├── controllers/      # Request handling and validation
│   │   ├── services/         # Database access via Prisma
│   │   ├── schemas/          # Zod request schemas
│   │   ├── middleware/       # Centralized error handling
│   │   ├── lib/              # Prisma client, HTTP error helper
│   │   ├── app.ts            # Express app setup
│   │   └── server.ts         # Server entry point
│   └── .env.example
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/              # Pages: /quizzes, /create, /quizzes/[id]
│   │   ├── components/       # UI components (quiz list, form, details, toasts)
│   │   ├── store/            # Redux store, quizzes slice, undo-delete logic
│   │   ├── services/         # API calls
│   │   ├── schemas/          # Zod form schema
│   │   ├── lib/              # Axios client, error and formatting helpers
│   │   └── types/            # Shared TypeScript types
│   └── .env.example
├── .nvmrc
└── README.md
```

## Prerequisites

- **Node.js >= 22.13.0** (the repository includes an `.nvmrc` pointing to Node 24)
- **npm**
- **PostgreSQL**, running locally or reachable over the network

If you use nvm, run this from the repository root:

```bash
nvm use
```

## Quick start

For reviewers who already have PostgreSQL running. Each step is explained in the sections below.

```bash
# Backend (terminal 1)
cd backend
npm install
cp .env.example .env          # adjust DATABASE_URL for your PostgreSQL user
npm run prisma:migrate        # applies the committed migration
npm run prisma:seed           # creates the sample quiz
npm run dev                   # http://localhost:4000

# Frontend (terminal 2)
cd frontend
npm install
cp .env.example .env.local
npm run dev                   # http://localhost:3000
```

## Installation

The frontend and backend are separate npm projects. Install dependencies in each:

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

Installing the backend also generates the Prisma client automatically (`postinstall` runs `prisma generate`).

## Environment configuration

### Backend

```bash
cd backend
cp .env.example .env
```

| Variable       | Example                                                      | Description                                 |
| -------------- | ------------------------------------------------------------ | ------------------------------------------- |
| `PORT`         | `4000`                                                       | Port the API listens on                     |
| `FRONTEND_URL` | `http://localhost:3000`                                      | Origin allowed by CORS                      |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/quiz_builder` | PostgreSQL connection string used by Prisma |

The username and password in `.env.example` are placeholders. Change them to match a PostgreSQL user on your machine (see [PostgreSQL setup](#postgresql-setup)).

### Frontend

```bash
cd frontend
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

> **Required:** the frontend reads the API base URL from `NEXT_PUBLIC_API_URL`. Without it, pages fail to load and `npm run build` fails. Create `.env.local` before running `npm run dev` or `npm run build`.

## PostgreSQL setup

You need a running PostgreSQL instance. The suggested database name is `quiz_builder`.

Set `DATABASE_URL` in `backend/.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/quiz_builder
```

For a user without a password, omit it: `postgresql://USER@localhost:5432/quiz_builder`.

You can create the database yourself (`createdb quiz_builder`), or let `npm run prisma:migrate` create it if it does not exist yet.

<details>
<summary>Optional: installing PostgreSQL on macOS with Homebrew</summary>

```bash
brew install postgresql@18
brew services start postgresql@18
createdb quiz_builder
```

Homebrew's PostgreSQL creates a superuser named after your macOS account, with no password and no `postgres` role. In that case use:

```env
DATABASE_URL=postgresql://<your-macos-username>@localhost:5432/quiz_builder
```

If `createdb` is not found, add `/opt/homebrew/opt/postgresql@18/bin` to your `PATH`.

</details>

## Prisma setup

After `DATABASE_URL` is configured, run from `backend/`:

```bash
npm run prisma:generate   # generate the Prisma client (also runs on npm install)
npm run prisma:migrate    # apply the committed migration to your database
npm run prisma:seed       # create the sample quiz
```

- The initial migration (`prisma/migrations/..._init`) is committed. `prisma:migrate` runs `prisma migrate dev`, which applies it and creates the `QuestionType` enum and the `Quiz`, `Question` and `QuestionOption` tables.
- Deleting a quiz cascades to its questions and options at the database level.
- `prisma:seed` is safe to run multiple times. It skips creation if the sample quiz already exists.

To browse the data in a GUI (optional):

```bash
npm run prisma:studio
```

## Sample quiz

The seed script (`backend/prisma/seed.ts`) creates a quiz titled **"JavaScript Basics"** with:

- one **Boolean** question: "JavaScript is dynamically typed" (answer: True)
- one **Input** question: "What does DOM stand for?" (answer: Document Object Model)
- one **Checkbox** question: "Select JavaScript frameworks" (React and Vue correct, Django incorrect)

Create it with:

```bash
cd backend
npm run prisma:seed
```

You can also create quizzes through the UI at `/create`.

## Running the application

Run the backend and frontend in **separate terminals**.

### Backend

```bash
cd backend
npm run dev
```

- API: `http://localhost:4000`
- Health check: `GET http://localhost:4000/health` returns `{"status":"ok"}`

### Frontend

```bash
cd frontend
npm run dev
```

- App: `http://localhost:3000` (redirects to `/quizzes`)

## API endpoints

| Method   | Path           | Description                                                     | Responses                      |
| -------- | -------------- | --------------------------------------------------------------- | ------------------------------ |
| `POST`   | `/quizzes`     | Create a quiz with its questions; returns the full created quiz | `201`, `400` validation error  |
| `GET`    | `/quizzes`     | List quizzes as `{ id, title, questionCount }`                  | `200`                          |
| `GET`    | `/quizzes/:id` | Full quiz details including questions and options               | `200`, `400` invalid id, `404` |
| `DELETE` | `/quizzes/:id` | Delete a quiz and its questions/options                         | `204`, `400` invalid id, `404` |

Example `POST /quizzes` body:

```json
{
  "title": "JavaScript Basics",
  "questions": [
    {
      "text": "JavaScript is dynamically typed",
      "type": "BOOLEAN",
      "booleanAnswer": true
    },
    {
      "text": "What does DOM stand for?",
      "type": "INPUT",
      "textAnswer": "Document Object Model"
    },
    {
      "text": "Select JavaScript frameworks",
      "type": "CHECKBOX",
      "options": [
        { "text": "React", "isCorrect": true },
        { "text": "Vue", "isCorrect": true },
        { "text": "Django", "isCorrect": false }
      ]
    }
  ]
}
```

Validation rules: a non-empty title and at least one question; every question needs non-empty text; Boolean questions need `booleanAnswer`; Input questions need a non-empty `textAnswer`; Checkbox questions need at least 2 options with non-empty text, and at least one correct option. Errors are returned as `{ "error": string, "details"?: [{ "path", "message" }] }`.

## Pages

| Page           | Description                                                                                                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/quizzes`     | All quizzes with title and question count. Each card links to the quiz details and has a Delete button.                                                                          |
| `/create`      | Quiz form: title, dynamically added/removed questions, question type (Boolean, Input, Checkbox), and checkbox options with multiple correct answers. Submits to `POST /quizzes`. |
| `/quizzes/:id` | Read-only view of a quiz: title, question count, and every question with its correct answer.                                                                                     |

## Delete and Undo behavior

- Clicking **Delete** on `/quizzes` removes the quiz from the list immediately. There is no confirmation dialog.
- A notification with an **Undo** button appears for **5 seconds**.
- `DELETE /quizzes/:id` is sent only after those 5 seconds, if Undo was not clicked.
- If the request fails, the quiz is restored to the list and an error message is shown.
- Pending deletions are kept in memory only. Reloading the page within the 5-second window cancels them.

## Code quality and build

Both projects use ESLint and Prettier. Run these from `backend/` or `frontend/`:

| Command                | Backend                                      | Frontend                                      |
| ---------------------- | -------------------------------------------- | --------------------------------------------- |
| `npm run typecheck`    | TypeScript check (`tsc`)                     | Generates route types, then `tsc`             |
| `npm run lint`         | ESLint                                       | ESLint (Next.js config)                       |
| `npm run format`       | Prettier, write changes                      | Prettier, write changes                       |
| `npm run format:check` | Prettier, check only                         | Prettier, check only                          |
| `npm run build`        | Generates Prisma client, compiles to `dist/` | Production Next.js build (needs `.env.local`) |

To run the production builds:

```bash
# Backend
cd backend
npm run build
npm start          # runs dist/server.js

# Frontend
cd frontend
npm run build
npm start          # serves the production build on port 3000
```

## Notes

- `backend/.env` and `frontend/.env.local` are ignored by Git. Only the `.env.example` files are committed.
- The generated Prisma client (`backend/src/generated/`) and build output (`dist/`, `.next/`) are not committed.
- The UI is responsive and works on mobile and desktop screen sizes.
