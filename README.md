# Student Assignment Tracker

COMP229 — Web Application Development  
Project Part 2: Frontend and Backend Integration, CRUD, and Final Release

A MERN app for tracking a student's assignments. The team repository is [Student-Assignment-Tracker](https://github.com/Milena79-maker/Student-Assignment-Tracker). The code layout follows the course skeleton [COMP229](https://github.com/CENT-COL/comp229-f26-mern): `client` for React and `server` for Express.

The project runs **on your machine**, without Docker. Each member installs Node.js and MongoDB, then starts the API and the interface in two terminals.

## Team (6 members)

Fill in this table before submission. The instructor requires each member's full name and student number.

| Member | Full name | Student number | Work package |
| --- | --- | --- | --- |
| 1 |  |  | Assignments API: model, routes, controller, sample data |
| 2 |  |  | React pages: Home, Assignments, and Add Assignment |
| 3 |  |  | `client` / `server` layout matching the course skeleton |
| 4 |  |  | Sign up, sign in, and JWT |
| 5 |  |  | Users and My Profile pages, navigation based on the session |
| 6 |  |  | Logo, local setup without Docker, README, and verification |

## 1. Install the tools

1. Install [Node.js 20](https://nodejs.org/) or a newer version. Check it:

```bash
node -v
npm -v
```

2. Install [MongoDB Community Server](https://www.mongodb.com/try/download/community) and leave the service running.
   - On Windows the service is often named `MongoDB`.
   - The API connects to `mongodb://127.0.0.1:27017/assignments` by default.

3. Clone the repository, then open the project folder.

## 2. Start the API

In a first terminal:

```bash
cd server
copy .env.example .env
npm install
npm run dev
```

On macOS or Linux, use `cp .env.example .env` instead of `copy`.

The `.env` file contains:

- `MONGO_URI`: the MongoDB address
- `PORT`: `3001`
- `JWT_SECRET`: the session secret. Change it before a public submission.

When the connection succeeds, the terminal prints:

```text
MongoDB database connection established successfully
Server is running on http://localhost:3001
```

On the first start, five sample assignments are added. User accounts are not created ahead of time: each person signs up in the interface.

## 3. Start the interface

In a second terminal, from the project root:

```bash
cd client
npm install
npm run dev
```

Open the address Vite prints, usually http://localhost:5173.

Vite forwards `/api/...` calls to http://localhost:3001 and removes the `/api` prefix. Express routes are therefore `/assignments`, `/users`, and `/health`.

## 4. Walk through the app

1. **Home** shows the team logo, the site name, the totals, and the upcoming assignments.
2. Without an account, the navigation is: **Home**, **Assignments**, **Users**, **Sign Up**, **Sign In**. The current page is highlighted.
3. **Sign Up** creates an account (name, email, and a password of at least 6 characters).
4. **Sign In** opens the session. The token is stored in the browser.
5. Once signed in, the navigation becomes: **Home**, **Assignments**, **Users**, **My Profile**, **Sign Out**.
6. **Assignments** can mark an assignment complete, edit it, and delete it. **Add assignment** creates one.
7. **Users** lists the accounts. On your own account: **Edit** and **Delete**.
8. **My Profile** updates the name, the email, and, if you fill it in, the password. You can also delete the account.
9. **Sign Out** closes the session. Without a session, the assignment list stays visible, but the edit buttons do not.

## Structure

```text
logo.webp                         team logo
client/
  public/logo.webp                same logo, served by Vite
  src/MainRouter.jsx              navigation and pages
  src/auth.jsx                    session (token + user)
  src/core/Home.jsx               home page
  src/components/                 assignments, sign up, sign in, users, profile
server/
  server.js
  routes/                         HTTP paths
  controllers/                    CRUD rules
  models/                         Mongoose schemas
  middlewares/auth.js             checks the token
  utils/jwt.js
  utils/seed.js
```

## API

Assignment and user reads are public, so the home page stays visible without an account. Creating, editing, or deleting an assignment requires a session. A user can edit or delete only their own account.

| Method | Route | Access | Role |
| --- | --- | --- | --- |
| GET | `/health` | public | The API is up |
| GET | `/assignments` | public | Assignment list |
| GET | `/assignments/:id` | public | One assignment |
| POST | `/assignments` | signed in | Create |
| PUT | `/assignments/:id` | signed in | Update |
| PATCH | `/assignments/:id` | signed in | `{ "completed": true }` or `false` |
| DELETE | `/assignments/:id` | signed in | Delete |
| GET | `/users` | public | Account list |
| POST | `/users` | public | Sign up |
| POST | `/users/login` | public | Sign in, returns a token |
| GET | `/users/me` | signed in | Current profile |
| PUT | `/users/me` | signed in | Update the profile |
| DELETE | `/users/me` | signed in | Delete the account |

## Stop

Close both terminals with `Ctrl + C`. The data stays in MongoDB on the machine.

## Project requirements

### Part A — already covered in this repository

- Home page with the site name, the logo, the assignment list, and links to Sign Up and Sign In.
- Navigation between views, with the current page indicated.
- Signed out: Home, Users, Sign Up, Sign In, plus Assignments (the project records).
- Signed in: Home, Users, My Profile, Sign Out, plus Assignments.
- CRUD for users and assignments, in React and in Express.
- Code split into `client` and `server`, with routes, controllers, and models.

### Part A — still to produce together before submission

- Push commits from **each** member to the GitHub repository.
- An agile board (Jira or Trello): an up-to-date backlog and tasks, then a PDF of the backlog.
- A 5 to 10 minute video. Slide 1: team name and logo, each member's full name and student number, course code and name, and project type. Slide 2: a recent photo of each member (no avatar), plus name and role. Show each page and the code of the important functions.

### Part B — not done in this repository yet

- Unit tests with a screenshot of the results.
- A Cypress end-to-end test: the recording, the test code, and a screenshot of the results.
- A performance measurement and improvement.
- Deployment (MongoDB Atlas or Firebase) and a public URL.
- CI/CD proof: a GitHub branch, a small visible change, a merge into `main`, and before-and-after screenshots of the deployed site.
- EDD v.3 as a PDF: logo, mockups, screenshots, navigation, and authentication.

The final submission is a **ZIP** archive (not RAR), with the EDD PDF, the GitHub link, the deployed link, the backlog PDF, the video link, and the test and CI/CD evidence.
