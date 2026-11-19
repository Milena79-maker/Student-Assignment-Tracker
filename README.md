# Student Assignment Tracker

COMP229 Web Application Development group project — MERN Stack (MongoDB, Express, React, Node.js).

## Features
- Home page with the site name, team logo, assignment list, and Sign Up / Sign In
- Navigation highlights the current page
- Signed out: Home, Assignments, Users, Sign Up, Sign In
- Signed in: Home, Assignments, Add Assignment, Users, My Profile, Sign Out
- Assignments page with search and status filters
- Create, read, edit, and delete assignments stored in MongoDB
- Create, read, update, and delete user accounts
- Mark assignments completed or pending
- Validation, confirmation before deletion, and success/error messages
- Responsive design for desktop and mobile
- Interface copy is in English

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
- `GET /api/users` — list users
- `POST /api/users` — sign up
- `POST /api/users/login` — sign in and receive a token
- `GET /api/users/me` — current profile
- `PUT /api/users/me` — update the current profile
- `DELETE /api/users/me` — delete the current account

Creating, editing, completing, or deleting an assignment requires `Authorization: Bearer <token>`. Reading assignments and the user list does not.

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
- Vitest is installed and `client/src/App.test.jsx` covers the home page, the assignments page, and the sign-in prompt. The results still need a screenshot for the report.

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
