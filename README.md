# TaskFlow - Project Ops Suite

TaskFlow is a project management web app built with Next.js App Router, MongoDB, and NextAuth. It provides a clean team workspace for tracking projects, members, and tasks with role-based access control (RBAC).

## Features

- Credential-based authentication with NextAuth (login + signup flows).
- Projects workspace with admin/member roles.
- Project members management (add members, change roles, remove members).
- Tasks with status, priority, due dates, and assignees.
- RBAC enforcement for creating tasks, editing roles, and deleting projects.
- Dashboard experience with task stats, project list, and activity placeholders.
- Responsive UI with a unified AppShell layout.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4 (PostCSS)
- NextAuth v4 (Credentials provider)
- MongoDB + Mongoose
- Zod for request validation
- bcryptjs for password hashing

## Project Structure

- `src/app` - App Router pages and API routes
- `src/components` - UI components (layout, dashboard, projects)
- `src/models` - Mongoose models (User, Project, ProjectMember, Task)
- `src/services` - Database access helpers
- `src/middleware` - Auth helpers for API routes
- `src/lib` - MongoDB connection and NextAuth options

## API Endpoints

Auth

- `POST /api/auth/signup` - Create a user account
- `GET /api/auth/me` - Get the current user
- `GET|POST /api/auth/[...nextauth]` - NextAuth session handling

Projects

- `GET /api/projects` - List projects for the current user
- `POST /api/projects` - Create a project (auto-creates ADMIN membership)
- `GET /api/projects/:id` - Get a project with members and role info
- `PATCH /api/projects/:id` - Update project (ADMIN only)
- `DELETE /api/projects/:id` - Delete project (ADMIN only)

Members

- `POST /api/projects/:id/members` - Add member (ADMIN only)
- `PATCH /api/projects/:id/members/:memberId` - Change role (ADMIN only)
- `DELETE /api/projects/:id/members/:memberId` - Remove member (ADMIN only)

Tasks

- `GET /api/tasks` - List tasks across user projects
- `GET /api/tasks/:id` - Get task details
- `PATCH /api/tasks/:id` - Update task (ADMIN or assigned MEMBER status-only)
- `DELETE /api/tasks/:id` - Delete task (ADMIN only)
- `GET /api/projects/:id/tasks` - List tasks for a project
- `POST /api/projects/:id/tasks` - Create task (ADMIN only)

## Environment Variables

Create a `.env` file in the project root with:

```
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_value
# or JWT_SECRET=your_secret_value
```

`NEXTAUTH_SECRET` or `JWT_SECRET` is required for NextAuth session signing.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open `http://localhost:3000`.

## Usage

1. Sign up at `/signup`.
2. Login at `/login`.
3. Create a project from the Projects page or Dashboard.
4. Add members and assign roles.
5. Create tasks and update statuses.

## Notes

- Project admins can manage members and create or delete tasks.
- Project members can only update the status of tasks assigned to them.
- The UI is optimized for a clean, calm dashboard experience.
