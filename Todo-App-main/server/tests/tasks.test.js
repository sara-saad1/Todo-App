/**
 * Unit Tests for Task API
 * Run: npm test (from /server directory)
 *
 * NOTE: These tests mock mongoose to avoid needing a real DB connection.
 */

const request = require('supertest');
const app = require('../index');

// Mock mongoose to prevent real DB connections during tests
jest.mock('../config/db', () => jest.fn());
jest.mock('../models/Task');

const Task = require('../models/Task');

// ─── Sample task data ───────────────────────
const sampleTask = {
  _id: '64a7c3f2b4e1a2c3d4e5f6a7',
  title: 'Test Task',
  description: 'A test description',
  completed: false,
  category: 'Work',
  dueDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const completedTask = { ...sampleTask, completed: true };

// ─── Tests ──────────────────────────────────

describe('GET /api/tasks', () => {
  it('should return all tasks', async () => {
    Task.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([sampleTask]) });
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('POST /api/tasks', () => {
  it('should create a task with valid data', async () => {
    Task.create.mockResolvedValue(sampleTask);
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test Task', description: 'A test description', category: 'Work' });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Test Task');
  });

  it('should reject a task with empty title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: '', description: 'No title' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('required');
  });

  it('should reject a task with no title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ description: 'No title at all' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('PATCH /api/tasks/:id/complete', () => {
  it('should mark an incomplete task as complete', async () => {
    const mockSave = jest.fn().mockResolvedValue({ ...sampleTask, completed: true });
    Task.findById.mockResolvedValue({ ...sampleTask, save: mockSave });

    const res = await request(app).patch(`/api/tasks/${sampleTask._id}/complete`);
    expect(res.statusCode).toBe(200);
  });

  it('should reject completing an already-completed task', async () => {
    Task.findById.mockResolvedValue({ ...completedTask, save: jest.fn() });

    const res = await request(app).patch(`/api/tasks/${sampleTask._id}/complete`);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('already marked as completed');
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('should delete an existing task', async () => {
    Task.findById.mockResolvedValue({ ...sampleTask, deleteOne: jest.fn().mockResolvedValue({}) });

    const res = await request(app).delete(`/api/tasks/${sampleTask._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent task', async () => {
    Task.findById.mockResolvedValue(null);

    const res = await request(app).delete(`/api/tasks/${sampleTask._id}`);
    expect(res.statusCode).toBe(404);
  });
});
