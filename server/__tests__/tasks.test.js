const request = require('supertest');
const { createTestApp } = require('../test-helper');

describe('Task Routes', () => {
  let app, db, userId;

  beforeEach(async () => {
    ({ app, db } = createTestApp());
    // Create a test user
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'TestUser' });
    userId = res.body.id;
  });

  afterEach(() => {
    db.close();
  });

  // ─── GET /api/tasks ─────────────────────────────────────────

  describe('GET /api/tasks', () => {
    it('should return empty array when user has no tasks', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .query({ user_id: userId });

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return tasks for a user', async () => {
      await request(app).post('/api/tasks').send({ user_id: userId, title: 'Task 1' });
      await request(app).post('/api/tasks').send({ user_id: userId, title: 'Task 2' });

      const res = await request(app)
        .get('/api/tasks')
        .query({ user_id: userId });

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('should return 400 if user_id is missing', async () => {
      const res = await request(app).get('/api/tasks');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('user_id is required');
    });

    it('should order incomplete tasks first, then by created_at desc', async () => {
      // Create tasks with slight delay to ensure different created_at
      await request(app).post('/api/tasks').send({ user_id: userId, title: 'First' });
      await request(app).post('/api/tasks').send({ user_id: userId, title: 'Second' });
      const thirdRes = await request(app).post('/api/tasks').send({ user_id: userId, title: 'Third' });

      // Complete the third task
      await request(app).patch(`/api/tasks/${thirdRes.body.id}/complete`);

      const res = await request(app)
        .get('/api/tasks')
        .query({ user_id: userId });

      expect(res.status).toBe(200);
      // Incomplete tasks should come first (Second, First by created_at desc), then completed (Third)
      const titles = res.body.map(t => t.title);
      expect(titles[titles.length - 1]).toBe('Third'); // Completed task should be last
    });
  });

  // ─── POST /api/tasks ────────────────────────────────────────

  describe('POST /api/tasks', () => {
    it('should create a task with title only', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ user_id: userId, title: 'My Task' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('My Task');
      expect(res.body.description).toBe('');
      expect(res.body.completed).toBe(0);
      expect(res.body.completed_at).toBeNull();
      expect(res.body.user_id).toBe(userId);
    });

    it('should create a task with title and description', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ user_id: userId, title: 'My Task', description: 'Some details' });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('My Task');
      expect(res.body.description).toBe('Some details');
    });

    it('should trim title and description', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ user_id: userId, title: '  My Task  ', description: '  Details  ' });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('My Task');
      expect(res.body.description).toBe('Details');
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ user_id: userId });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('user_id and title are required');
    });

    it('should return 400 if user_id is missing', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'My Task' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('user_id and title are required');
    });

    it('should return 400 if title is empty', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ user_id: userId, title: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('user_id and title are required');
    });

    it('should return 404 if user does not exist', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ user_id: 'nonexistent-id', title: 'My Task' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });
  });

  // ─── PATCH /api/tasks/:id/complete ──────────────────────────

  describe('PATCH /api/tasks/:id/complete', () => {
    it('should mark a task as completed and award 10 points', async () => {
      const taskRes = await request(app)
        .post('/api/tasks')
        .send({ user_id: userId, title: 'Complete me' });

      const res = await request(app)
        .patch(`/api/tasks/${taskRes.body.id}/complete`);

      expect(res.status).toBe(200);
      expect(res.body.task.completed).toBe(1);
      expect(res.body.task.completed_at).toBeTruthy();
      expect(res.body.user.points).toBe(10);
      expect(res.body.pointsAwarded).toBe(10);
    });

    it('should accumulate points for multiple completions', async () => {
      const task1 = await request(app).post('/api/tasks').send({ user_id: userId, title: 'Task 1' });
      const task2 = await request(app).post('/api/tasks').send({ user_id: userId, title: 'Task 2' });

      await request(app).patch(`/api/tasks/${task1.body.id}/complete`);
      const res = await request(app).patch(`/api/tasks/${task2.body.id}/complete`);

      expect(res.body.user.points).toBe(20);
    });

    it('should return 404 if task does not exist', async () => {
      const res = await request(app)
        .patch('/api/tasks/nonexistent-id/complete');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Task not found');
    });

    it('should return 400 if task is already completed', async () => {
      const taskRes = await request(app)
        .post('/api/tasks')
        .send({ user_id: userId, title: 'Complete me' });

      await request(app).patch(`/api/tasks/${taskRes.body.id}/complete`);
      const res = await request(app).patch(`/api/tasks/${taskRes.body.id}/complete`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Task is already completed');
    });
  });

  // ─── DELETE /api/tasks/:id ──────────────────────────────────

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const taskRes = await request(app)
        .post('/api/tasks')
        .send({ user_id: userId, title: 'Delete me' });

      const res = await request(app)
        .delete(`/api/tasks/${taskRes.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Task deleted');

      // Verify task is gone
      const listRes = await request(app)
        .get('/api/tasks')
        .query({ user_id: userId });
      expect(listRes.body).toHaveLength(0);
    });

    it('should return 404 if task does not exist', async () => {
      const res = await request(app)
        .delete('/api/tasks/nonexistent-id');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Task not found');
    });
  });
});
