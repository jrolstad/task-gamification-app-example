const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── User Routes ────────────────────────────────────────────

// POST /api/users — Create or lookup user by name
app.post('/api/users', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const trimmedName = name.trim();

  // Check if user already exists (case-insensitive)
  let user = db.prepare('SELECT * FROM users WHERE LOWER(name) = LOWER(?)').get(trimmedName);

  if (!user) {
    const id = uuidv4();
    db.prepare('INSERT INTO users (id, name) VALUES (?, ?)').run(id, trimmedName);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  }

  res.json(user);
});

// ─── Task Routes ────────────────────────────────────────────

// GET /api/tasks?user_id= — List tasks for a user
app.get('/api/tasks', (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  const tasks = db.prepare(
    'SELECT * FROM tasks WHERE user_id = ? ORDER BY completed ASC, created_at DESC'
  ).all(user_id);

  res.json(tasks);
});

// POST /api/tasks — Create a new task
app.post('/api/tasks', (req, res) => {
  const { user_id, title, description } = req.body;

  if (!user_id || !title || !title.trim()) {
    return res.status(400).json({ error: 'user_id and title are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(user_id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const id = uuidv4();
  db.prepare(
    'INSERT INTO tasks (id, user_id, title, description) VALUES (?, ?, ?, ?)'
  ).run(id, user_id, title.trim(), (description || '').trim());

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.status(201).json(task);
});

// PATCH /api/tasks/:id/complete — Mark task as done and award 10 points
app.patch('/api/tasks/:id/complete', (req, res) => {
  const { id } = req.params;

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (task.completed) {
    return res.status(400).json({ error: 'Task is already completed' });
  }

  const POINTS_PER_TASK = 10;

  const completeTask = db.transaction(() => {
    db.prepare(
      "UPDATE tasks SET completed = 1, completed_at = datetime('now') WHERE id = ?"
    ).run(id);

    db.prepare(
      'UPDATE users SET points = points + ? WHERE id = ?'
    ).run(POINTS_PER_TASK, task.user_id);
  });

  completeTask();

  const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(task.user_id);

  res.json({
    task: updatedTask,
    user: updatedUser,
    pointsAwarded: POINTS_PER_TASK
  });
});

// DELETE /api/tasks/:id — Delete a task
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  res.json({ message: 'Task deleted' });
});

// GET /api/tasks/search?q=&user_id= — Search tasks
app.get('/api/tasks/search', (req, res) => {
  const { q, user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  if (!q || !q.trim()) {
    // Return all tasks if no search query
    const tasks = db.prepare(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY completed ASC, created_at DESC'
    ).all(user_id);
    return res.json(tasks);
  }

  const searchTerm = `%${q.trim()}%`;
  const tasks = db.prepare(
    `SELECT * FROM tasks
     WHERE user_id = ? AND (title LIKE ? OR description LIKE ?)
     ORDER BY completed ASC, created_at DESC`
  ).all(user_id, searchTerm, searchTerm);

  res.json(tasks);
});

// ─── Leaderboard Route ──────────────────────────────────────

// GET /api/leaderboard — Top users by points
app.get('/api/leaderboard', (req, res) => {
  const users = db.prepare(
    'SELECT id, name, points FROM users ORDER BY points DESC, name ASC LIMIT 50'
  ).all();

  res.json(users);
});

// ─── Start Server ───────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🚀 Task Quest API running on http://localhost:${PORT}`);
});
