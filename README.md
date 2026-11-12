# Student Assignment Tracker

COMP229 Web Application Development group project — MERN Stack (MongoDB, Express, React, Node.js).

## Features
- Home dashboard with total, pending, completed, and overdue assignment counts
- Assignments page with search and status filters
- Add Assignment page with title, course, due date, priority, and description
- Create, read, edit, and delete assignments stored in MongoDB
- Mark assignments completed or pending
- Validation, confirmation before deletion, and success/error messages
- Responsive design for desktop and mobile

## Requirements
- Node.js 20+ and npm
- MongoDB Community Server running locally (or a MongoDB Atlas connection string)

## Setup
1. Extract the ZIP and open the `student-assignment-tracker` folder in VS Code.
2. In the terminal run `npm run install:all`.
3. Copy `server/.env.example` to `server/.env`. Edit `MONGODB_URI` if necessary.
4. Start MongoDB, if using a local database.
5. Run `npm run dev` in the project root.
6. Open http://localhost:5173 in your browser.

The frontend runs on port 5173 and the backend on port 5000. The Vite dev server proxies `/api` requests to Express.

## API
- `GET /api/health` — server health
- `GET /api/assignments` — list assignments
- `GET /api/assignments/:id` — get assignment
- `POST /api/assignments` — create assignment
- `PUT /api/assignments/:id` — edit assignment
- `PATCH /api/assignments/:id/complete` — set completion status
- `DELETE /api/assignments/:id` — delete assignment

Example POST JSON:
```json
{"title":"Database project","course":"COMP214","description":"Finish SQL procedures","dueDate":"2026-11-20","priority":"High"}
```

## Testing checklist
1. Add an assignment and confirm it appears on the Assignments page.
2. Edit the title and confirm the changes persist after refresh.
3. Mark it complete and confirm the dashboard counter updates.
4. Filter by Completed, then mark it pending.
5. Delete it and confirm it disappears.
6. Confirm MongoDB has the `assignments` collection in the `student_assignment_tracker` database.

## Important notes
This is a complete starter implementation of the features described for the Student Assignment Tracker concept. It has not been run against your local MongoDB or tested in your browser. Your instructor's full project rubric, authentication requirements, deployment requirements, and group-specific rules should be checked before final submission. The application does not include user accounts or multi-user access control.
