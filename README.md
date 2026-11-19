# Student Assignment Tracker

A MERN app for tracking student assignments. Students can add an assignment, set a due date, mark it complete, edit it, and delete it.

The layout follows the [COMP229](https://github.com/CENT-COL/comp229-f26-mern) course skeleton: a `client` folder for React and a `server` folder for Express. Routes stay thin, request logic lives in controllers, and Mongoose schemas live in `models`.

MongoDB, the API, and the interface all run together in Docker.

## Structure

```
client/                         React (Vite)
  src/MainRouter.jsx            navigation and pages
  src/core/Home.jsx             home page
  src/components/               list, form, and edit dialog
server/
  server.js                     Express entry point
  routes/assignments-routes.js
  controllers/assignments-controllers.js
  models/assignment-model.js
  utils/seed.js                 sample data on first start
docker-compose.yml
```

The browser calls `/api/...`. In development, Vite strips the `/api` prefix before the request reaches Express, as in the course repository. In Docker, Nginx does the same. Express routes are therefore `/assignments` and `/health`.

## Run with Docker

```bash
docker compose up --build
```

Open http://localhost:8080

The API is also available at http://localhost:3001/assignments

The first start downloads images and installs dependencies.

## Pages

- **Home** — totals, overdue work, and upcoming deadlines
- **Assignments** — filter, mark complete, edit, and delete
- **Add Assignment** — create an assignment (title, course, due date, priority, description)

## API

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/assignments` | List assignments |
| GET | `/assignments/:id` | Get one assignment |
| POST | `/assignments` | Create an assignment |
| PUT | `/assignments/:id` | Update an assignment |
| PATCH | `/assignments/:id` | Set `{ "completed": true }` or `false` |
| DELETE | `/assignments/:id` | Delete an assignment |

## Stop

```bash
docker compose down
```

Assignments stay in a Docker volume. `docker compose down -v` removes that volume. The next start loads the five sample assignments again.

## Run without Docker

Terminal 1, with MongoDB already running:

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

On Windows, use `copy .env.example .env` instead of `cp`.

Terminal 2:

```bash
cd client
npm install
npm run dev
```

The Vite app is then at http://localhost:5173 and proxies `/api` to http://localhost:3001.
