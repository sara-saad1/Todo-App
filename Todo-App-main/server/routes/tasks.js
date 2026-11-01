const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const { TASK_CATEGORIES, MAX_TITLE_LENGTH, MAX_DESC_LENGTH } = require('../config/constants');

const router = express.Router();

// Pulled validation error formatting into its own helper so I'm not
// repeating the same 6 lines inside every single route that has body validation.
const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array().map((e) => e.msg).join(', '),
    });
  }
  return null;
};


// ─────────────────────────────────────────────────────────────
// GET /api/tasks/stats
// Returns a summary: total, completed, active, overdue counts.
// I put this BEFORE /:id so Express doesn't try to treat "stats"
// as a MongoDB ObjectId and throw a CastError.
// ─────────────────────────────────────────────────────────────
router.get('/stats', async (req, res, next) => {
  try {
    // Running these as separate countDocuments queries instead of fetching
    // all tasks and counting in JS — much more efficient at scale since
    // MongoDB handles the counting without loading documents into memory.
    const total     = await Task.countDocuments();
    const completed = await Task.countDocuments({ completed: true });
    const overdue   = await Task.countDocuments({
      completed: false,
      dueDate: { $lt: new Date() }, // tasks with a past due date that aren't done yet
    });

    res.json({
      success: true,
      data: {
        total,
        completed,
        active: total - completed,
        overdue,
      },
    });
  } catch (err) {
    next(err);
  }
});


// ─────────────────────────────────────────────────────────────
// GET /api/tasks
// Supports optional query filters: ?category=Work&completed=false
// ─────────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const filter = {};

    // Only add to the filter object if the query param was actually provided.
    // This way a request with no params just returns everything.
    if (req.query.category) filter.category = req.query.category;
    if (req.query.completed !== undefined) {
      // query params come in as strings, so "true" needs to be converted to boolean
      filter.completed = req.query.completed === 'true';
    }

    // Sorting by createdAt descending so newest tasks show up at the top
    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    next(err);
  }
});


// ─────────────────────────────────────────────────────────────
// GET /api/tasks/:id
// ─────────────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
});


// ─────────────────────────────────────────────────────────────
// POST /api/tasks — Create a new task
// ─────────────────────────────────────────────────────────────
router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty().withMessage('Task title is required')
      .isLength({ max: MAX_TITLE_LENGTH }).withMessage(`Title cannot exceed ${MAX_TITLE_LENGTH} characters`),
    body('description')
      .optional()
      .trim()
      .isLength({ max: MAX_DESC_LENGTH }).withMessage(`Description cannot exceed ${MAX_DESC_LENGTH} characters`),
    // checkFalsy: true means an empty string for dueDate won't trigger the isISO8601 check.
    // Without this, submitting the form with an empty date field would return a validation error.
    body('dueDate')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601().withMessage('Due date must be a valid date'),
    body('category')
      .optional()
      .isIn(TASK_CATEGORIES).withMessage('Invalid category'),
  ],
  async (req, res, next) => {
    try {
      const validationError = handleValidation(req, res);
      if (validationError) return;

      const { title, description, dueDate, category } = req.body;
      const task = await Task.create({ title, description, dueDate, category });

      res.status(201).json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  }
);


// ─────────────────────────────────────────────────────────────
// PUT /api/tasks/:id — Update task details
// ─────────────────────────────────────────────────────────────
router.put(
  '/:id',
  [
    body('title')
      .optional()
      .trim()
      .notEmpty().withMessage('Task title cannot be empty')
      .isLength({ max: MAX_TITLE_LENGTH }).withMessage(`Title cannot exceed ${MAX_TITLE_LENGTH} characters`),
    body('description')
      .optional()
      .trim()
      .isLength({ max: MAX_DESC_LENGTH }).withMessage(`Description cannot exceed ${MAX_DESC_LENGTH} characters`),
    body('dueDate')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601().withMessage('Due date must be a valid date'),
    body('category')
      .optional()
      .isIn(TASK_CATEGORIES).withMessage('Invalid category'),
  ],
  async (req, res, next) => {
    try {
      const validationError = handleValidation(req, res);
      if (validationError) return;

      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      // Updating fields individually instead of using findByIdAndUpdate so that
      // Mongoose validators on the schema still run. findByIdAndUpdate bypasses
      // them by default and I want that safety net to stay active.
      const { title, description, dueDate, category } = req.body;
      if (title       !== undefined) task.title       = title;
      if (description !== undefined) task.description = description;
      if (dueDate     !== undefined) task.dueDate     = dueDate || null;
      if (category    !== undefined) task.category    = category;

      await task.save();
      res.json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  }
);


// ─────────────────────────────────────────────────────────────
// PATCH /api/tasks/:id/complete — Mark a task as completed
//
// I made this a separate endpoint instead of just a PUT with completed: true
// because it lets the server enforce the business rule explicitly:
// you should not be able to complete something that's already complete.
// A generic update endpoint can't cleanly express that constraint.
// ─────────────────────────────────────────────────────────────
router.patch('/:id/complete', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.completed) {
      return res.status(400).json({
        success: false,
        message: 'Task is already marked as completed',
      });
    }

    task.completed = true;
    await task.save();
    res.json({ success: true, data: task, message: 'Task marked as completed' });
  } catch (err) {
    next(err);
  }
});


// ─────────────────────────────────────────────────────────────
// PATCH /api/tasks/:id/uncomplete — Revert a task to incomplete
// ─────────────────────────────────────────────────────────────
router.patch('/:id/uncomplete', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (!task.completed) {
      return res.status(400).json({
        success: false,
        message: 'Task is already marked as incomplete',
      });
    }

    task.completed = false;
    await task.save();
    res.json({ success: true, data: task, message: 'Task marked as incomplete' });
  } catch (err) {
    next(err);
  }
});


// ─────────────────────────────────────────────────────────────
// DELETE /api/tasks/:id
// ─────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Using instance method deleteOne() instead of findByIdAndDelete()
    // so that any Mongoose middleware hooks (pre/post delete) I might
    // add later will still fire correctly.
    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
});


module.exports = router;
