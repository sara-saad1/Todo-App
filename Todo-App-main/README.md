# TaskFlow — Full-Stack Todo List Application

A full-stack Todo List app built with **Node.js + Express**, **React (Vite)**, and **MongoDB (Mongoose)**. Supports creating, viewing, editing, completing, and deleting tasks — with categories, due dates, and validation.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Key Design Decisions](#key-design-decisions)
- [Running Tests](#running-tests)

---

## Features

**Core**
- ✅ Create tasks with title and description
- ✅ View all tasks in a clean list
- ✅ Mark tasks as complete (with guard: can't re-complete an already-completed task)
- ✅ Edit task title, description, category, and due date inline
- ✅ Delete tasks with a confirmation prompt
- ✅ Filter by status (All / Active / Completed) and category
- ✅ Persistent storage via MongoDB Atlas

**Bonus**
- 📅 Due dates with overdue highlighting
- 🏷️ Task categories: General, Work, Personal, Shopping, Health, Finance, Other
- 🧪 Unit tests with Jest + Supertest

---

## Tech Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Backend   | Node.js, Express              |
| Database  | MongoDB Atlas via Mongoose    |
| Frontend  | React 18, Vite                |
| HTTP      | Axios                         |
| Validation| express-validator             |
| Testing   | Jest, Supertest               |

---

## Project Structure

```
todo-app/
├── server/                   # Express backend
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── middleware/
│   │   └── errorHandler.js   # Global error middleware
│   ├── models/
│   │   └── Task.js           # Mongoose Task schema
│   ├── routes/
│   │   └── tasks.js          # All CRUD + complete routes
│   ├── tests/
│   │   └── tasks.test.js     # Unit tests (Jest + Supertest)
│   ├── .env                  # Environment variables (DO NOT COMMIT)
│   ├── index.js              # Server entry point
│   └── package.json
│
├── client/                   # React frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── tasks.js      # Axios API calls
│   │   ├── components/
│   │   │   ├── FilterBar.jsx # Status + category filter
│   │   │   ├── TaskForm.jsx  # Create task form
│   │   │   ├── TaskItem.jsx  # Individual task row + inline edit
│   │   │   └── TaskList.jsx  # Renders list of TaskItem
│   │   ├── App.jsx           # Root component + state management
│   │   ├── App.css           # Global styles
│   │   └── main.jsx          # React entry point
│   ├── index.html
│   ├── vite.config.js        # Proxy /api → localhost:5000
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm v9+
- A MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/todo-app.git
cd todo-app
```

### 2. Set up the Backend

```bash
cd server
npm install
```

Create a `.env` file in `/server`:

```env
MONGODB_URI=your_mongodb_connection_string_here
PORT=5000
NODE_ENV=development
```

Start the server:

```bash
npm run dev      # with nodemon (auto-restart on change)
# or
npm start        # plain node
```

The API will be running at `http://localhost:5000`.

### 3. Set up the Frontend

```bash
cd ../client
npm install
npm run dev
```

The React app will be available at `http://localhost:5173`.

> Vite's dev server proxies `/api/*` requests to `http://localhost:5000`, so no CORS issues during development.

### 4. Open the app

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint                   | Description                          |
|--------|----------------------------|--------------------------------------|
| GET    | `/tasks`                   | Get all tasks (supports `?category=` and `?completed=` filters) |
| GET    | `/tasks/:id`               | Get a single task by ID              |
| POST   | `/tasks`                   | Create a new task                    |
| PUT    | `/tasks/:id`               | Update task details                  |
| PATCH  | `/tasks/:id/complete`      | Mark task as completed               |
| PATCH  | `/tasks/:id/uncomplete`    | Revert task to incomplete            |
| DELETE | `/tasks/:id`               | Delete a task                        |
| GET    | `/health`                  | Health check                         |

### Request body for POST/PUT

```json
{
  "title": "Buy groceries",       // required, max 200 chars
  "description": "Milk, eggs...", // optional, max 1000 chars
  "category": "Shopping",         // optional, one of the 7 values
  "dueDate": "2025-12-31"         // optional, ISO date string
}
```

### Response format

All responses follow this shape:

```json
{
  "success": true,
  "data": { ... },
  "message": "..."
}
```

Errors return `"success": false` with a descriptive `"message"`.

---

## Key Design Decisions

### 1. Separation of concerns
The backend follows a layered architecture: routes handle HTTP logic, the model enforces the data schema, and the global `errorHandler` middleware centralises error formatting. This keeps route handlers clean and consistent.

### 2. Validation at two layers
- **Route layer** (`express-validator`): catches bad input before hitting the database, returning descriptive 400 errors immediately.
- **Model layer** (Mongoose schema): acts as a second safety net if the API is called directly.

### 3. Separate `complete` and `uncomplete` endpoints
Rather than a single toggle, two explicit `PATCH` endpoints (`/complete` and `/uncomplete`) make intent clear and allow the server to enforce the rule: *you cannot complete an already-completed task*, returning a 400 with a meaningful message.

### 4. Vite proxy for dev
The `vite.config.js` proxies `/api` to the backend during development, eliminating CORS configuration and matching the production URL structure.

### 5. Toast notifications
Client-side errors and successes are surfaced via non-blocking toast messages rather than alert boxes, for a better user experience.

---

## Running Tests

```bash
cd server
npm test
```

Tests use Jest + Supertest and mock the Mongoose model so no real database connection is required. Coverage report is generated automatically.

---

## Environment Variables

| Variable      | Description                        | Default     |
|---------------|------------------------------------|-------------|
| `MONGODB_URI` | MongoDB connection string          | (required)  |
| `PORT`        | Port for the Express server        | `5000`      |
| `NODE_ENV`    | `development` or `production`      | `development` |

> ⚠️ Never commit your `.env` file. It's listed in `.gitignore`.
