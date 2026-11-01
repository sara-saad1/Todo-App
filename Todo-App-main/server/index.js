require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const connectDB    = require('./config/db');
const taskRoutes   = require('./routes/tasks');
const errorHandler = require('./middleware/errorHandler');
const logger       = require('./middleware/logger');

const app  = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB first — if this fails the server shuts down early
// so we never end up with a running API that can't talk to the database.
connectDB();

// ── Middleware ───────────────────────────────────────────────
// Logger goes first so every request gets logged, including ones
// that might fail at the CORS or body-parsing stage.
app.use(logger);

app.use(cors({
  // In production this should be locked to the real frontend URL.
  // During development I'm allowing both Vite's default port and CRA's.
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Routes ───────────────────────────────────────────────────
app.use('/api/tasks', taskRoutes);

// Basic health check — useful for quickly verifying the server is up
// without hitting the database at all.
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Todo API is running 🚀', timestamp: new Date() });
});

// Catch-all for any route that doesn't match above
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ─────────────────────────────────────
// Must be registered last — Express identifies error-handling middleware
// by the 4-argument signature (err, req, res, next).
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app; // exported so Jest/Supertest can import it in tests
