# API Documentation

Base URL: `http://localhost:5000/api`

All responses follow this structure:
```json
{ "success": true/false, "data": {}, "message": "..." }
```
Errors always return `"success": false` with a human-readable `"message"`.

---

## Health Check

### `GET /health`
Check if the server is running.

**Response `200`**
```json
{
  "success": true,
  "message": "Todo API is running 🚀",
  "timestamp": "2025-09-01T10:00:00.000Z"
}
```

---

## Tasks

### `GET /tasks`
Retrieve all tasks. Supports optional query parameters for filtering.

**Query Parameters**

| Param | Type | Example | Description |
|---|---|---|---|
| `completed` | boolean | `?completed=false` | Filter by completion status |
| `category` | string | `?category=Work` | Filter by category |

**Response `200`**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "64a7c3f2b4e1a2c3d4e5f6a7",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "category": "Shopping",
      "dueDate": "2025-09-10T00:00:00.000Z",
      "createdAt": "2025-09-01T10:00:00.000Z",
      "updatedAt": "2025-09-01T10:00:00.000Z"
    }
  ]
}
```

---

### `GET /tasks/stats`
Returns a summary of all task counts. Useful for dashboard-level data without fetching the full list.

**Response `200`**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "completed": 4,
    "active": 6,
    "overdue": 2
  }
}
```

---

### `GET /tasks/:id`
Retrieve a single task by its MongoDB ID.

**Response `200`**
```json
{
  "success": true,
  "data": {
    "_id": "64a7c3f2b4e1a2c3d4e5f6a7",
    "title": "Buy groceries",
    ...
  }
}
```

**Error `404`** — task not found
```json
{ "success": false, "message": "Task not found" }
```

**Error `400`** — invalid ID format
```json
{ "success": false, "message": "Invalid task ID format" }
```

---

### `POST /tasks`
Create a new task.

**Request Body**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "category": "Shopping",
  "dueDate": "2025-09-10"
}
```

| Field | Required | Type | Constraints |
|---|---|---|---|
| `title` | Yes | string | Max 200 chars, cannot be empty |
| `description` | No | string | Max 1000 chars |
| `category` | No | string | One of: `General`, `Work`, `Personal`, `Shopping`, `Health`, `Finance`, `Other` |
| `dueDate` | No | ISO date string | e.g. `2025-12-31` |

**Response `201`**
```json
{
  "success": true,
  "data": { "_id": "...", "title": "Buy groceries", "completed": false, ... }
}
```

**Error `400`** — validation failed
```json
{ "success": false, "message": "Task title is required" }
```

---

### `PUT /tasks/:id`
Update an existing task's details. Only fields that are sent will be updated.

**Request Body** *(all fields optional)*
```json
{
  "title": "Buy groceries and cook dinner",
  "description": "Updated list",
  "category": "Personal",
  "dueDate": "2025-09-15"
}
```

**Response `200`**
```json
{
  "success": true,
  "data": { "_id": "...", "title": "Buy groceries and cook dinner", ... }
}
```

---

### `PATCH /tasks/:id/complete`
Mark a task as completed.

> **Rule:** Returns `400` if the task is already completed.

**Response `200`**
```json
{
  "success": true,
  "message": "Task marked as completed",
  "data": { "_id": "...", "completed": true, ... }
}
```

**Error `400`** — already completed
```json
{ "success": false, "message": "Task is already marked as completed" }
```

---

### `PATCH /tasks/:id/uncomplete`
Revert a completed task back to incomplete.

> **Rule:** Returns `400` if the task is already incomplete.

**Response `200`**
```json
{
  "success": true,
  "message": "Task marked as incomplete",
  "data": { "_id": "...", "completed": false, ... }
}
```

---

### `DELETE /tasks/:id`
Permanently delete a task.

**Response `200`**
```json
{ "success": true, "message": "Task deleted successfully" }
```

**Error `404`** — task not found
```json
{ "success": false, "message": "Task not found" }
```

---

## Valid Categories

`General` · `Work` · `Personal` · `Shopping` · `Health` · `Finance` · `Other`

---

## Error Response Format

All errors follow the same shape:

```json
{
  "success": false,
  "message": "Descriptive error message here"
}
```

| Status | Meaning |
|---|---|
| `400` | Bad request — validation failed or business rule violated |
| `404` | Resource not found |
| `500` | Internal server error |
