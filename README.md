# Task Quest 🎮✅

A gamified task management app where users create and complete tasks to earn points and compete on a global leaderboard.

## Features

- **Task Management** — Create, complete, and delete tasks
- **Points System** — Earn 10 points for each completed task
- **Leaderboard** — Compete with other users for the top spot
- **Search** — Full-text search across task titles and descriptions
- **Session Persistence** — Stay logged in between page reloads via localStorage

## Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | React 18, Axios                     |
| Backend  | Node.js, Express 4                  |
| Database | SQLite 3 (via better-sqlite3)       |
| Tooling  | concurrently, create-react-app      |

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later recommended)
- npm

## Getting Started

### 1. Install dependencies

```bash
npm run install:all
```

This installs dependencies for the root, server, and client packages.

### 2. Start the app

```bash
npm run dev
```

This starts both the Express API server (port **3001**) and the React dev server (port **3000**) concurrently.

You can also run them individually:

```bash
npm run server   # API server only
npm run client   # React client only
```

### 3. Open the app

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
.
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js          # Main app component & state management
│       ├── index.js        # Entry point
│       ├── index.css        # Global styles
│       └── components/
│           ├── Header.js           # App header, user info, logout
│           ├── TaskForm.js         # New task creation form
│           ├── TaskList.js         # Task display, search, actions
│           ├── Leaderboard.js      # Top 50 users ranked by points
│           └── PointsAnimation.js  # "+10 pts" feedback animation
├── server/
│   ├── index.js            # Express API server & route handlers
│   └── db.js               # SQLite database setup & initialization
└── package.json            # Root scripts (install, dev, etc.)
```

## API Endpoints

| Method | Endpoint                              | Description                        |
| ------ | ------------------------------------- | ---------------------------------- |
| POST   | `/api/users`                          | Create or retrieve a user by name  |
| GET    | `/api/tasks?user_id=<id>`             | List a user's tasks                |
| POST   | `/api/tasks`                          | Create a new task                  |
| PATCH  | `/api/tasks/:id/complete`             | Mark a task as complete (+10 pts)  |
| DELETE | `/api/tasks/:id`                      | Delete a task                      |
| GET    | `/api/tasks/search?user_id=<id>&q=<query>` | Search tasks by title/description |
| GET    | `/api/leaderboard`                    | Get top 50 users by points         |

## Testing

The project includes unit tests for both the server API (Jest + Supertest) and client components (React Testing Library + Jest).

### Run all tests

```bash
npm test
```

### Run server tests only

```bash
npm run test:server
```

### Run client tests only

```bash
npm run test:client
```

## Configuration

| Variable | Default | Description              |
| -------- | ------- | ------------------------ |
| `PORT`   | `3001`  | API server port          |

The SQLite database file (`taskquest.db`) is created automatically in the `server/` directory on first run.

## License

This project is licensed under the [MIT License](LICENSE).
