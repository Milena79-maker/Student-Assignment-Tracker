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

## Still to complete

### Application
- Sign-up, sign-in, Users, and My Profile are in the React app. `npm run dev` starts `server/index.js`, which serves the assignment API only. Those account routes still need to be mounted on that server before the screens work end to end.
- Vitest is installed and `client/src/App.test.jsx` is a first test. The suite still needs to match the current pages, and the results need a screenshot for the report.

### Submission
- Push commits from every group member to the GitHub repository.
- Keep the agile board (Jira or Trello) up to date, then export a PDF of the backlog.
- Record a 5 to 10 minute video. Slide 1: team name and logo, each member's full name and student number, course code and name, and project type. Slide 2: a recent photo of each member (not an avatar), with name and role. Then show each page and the code of the main functions.
- Add a Cypress end-to-end test, with the recording, the test code, and a screenshot of the results.
- Measure performance and note what was improved.
- Deploy the app (MongoDB Atlas or Firebase) and record the public URL.
- Show CI/CD: a GitHub branch, a small visible change, a merge into `main`, and before-and-after screenshots of the deployed site.
- Write EDD v.3 as a PDF: logo, mockups, screenshots, navigation, and authentication.
- Submit one ZIP archive (not RAR) with the EDD PDF, the GitHub link, the deployed link, the backlog PDF, the video link, and the test and CI/CD evidence.

## Important notes
- Start MongoDB before `npm run dev`. Assignments are stored in the `student_assignment_tracker` database on the local machine.
- Keep `server/.env` out of Git. Each machine copies `server/.env.example` to `server/.env`.
- The interface is http://localhost:5173. The API is http://localhost:5000.
- Work that is not in this repository yet is listed under Still to complete.
