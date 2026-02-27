const request = require('supertest');
const { createTestApp } = require('../test-helper');

describe('GET /api/tasks/search', () => {
  let app, db, userId;

  beforeEach(async () => {
    ({ app, db } = createTestApp());
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Searcher' });
    userId = res.body.id;

    // Create some tasks to search through
    await request(app).post('/api/tasks').send({ user_id: userId, title: 'Buy groceries', description: 'Milk, eggs, bread' });
    await request(app).post('/api/tasks').send({ user_id: userId, title: 'Clean house', description: 'Vacuum and mop' });
    await request(app).post('/api/tasks').send({ user_id: userId, title: 'Read book', description: 'Finish chapter 5' });
  });

  afterEach(() => {
    db.close();
  });

  it('should search tasks by title', async () => {
    const res = await request(app)
      .get('/api/tasks/search')
      .query({ user_id: userId, q: 'groceries' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Buy groceries');
  });

  it('should search tasks by description', async () => {
    const res = await request(app)
      .get('/api/tasks/search')
      .query({ user_id: userId, q: 'Vacuum' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Clean house');
  });

  it('should return multiple matches', async () => {
    // Both "Buy groceries" and "Read book" contain the letter pattern, but let's search for something common
    await request(app).post('/api/tasks').send({ user_id: userId, title: 'Buy supplies', description: 'Office stuff' });

    const res = await request(app)
      .get('/api/tasks/search')
      .query({ user_id: userId, q: 'Buy' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('should return empty array when no matches', async () => {
    const res = await request(app)
      .get('/api/tasks/search')
      .query({ user_id: userId, q: 'nonexistent' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  it('should return all tasks when query is empty', async () => {
    const res = await request(app)
      .get('/api/tasks/search')
      .query({ user_id: userId, q: '' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });

  it('should return all tasks when query is only whitespace', async () => {
    const res = await request(app)
      .get('/api/tasks/search')
      .query({ user_id: userId, q: '   ' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });

  it('should return all tasks when query is not provided', async () => {
    const res = await request(app)
      .get('/api/tasks/search')
      .query({ user_id: userId });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });

  it('should return 400 if user_id is missing', async () => {
    const res = await request(app)
      .get('/api/tasks/search')
      .query({ q: 'test' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('user_id is required');
  });

  it('should only return tasks for the specified user', async () => {
    // Create another user with tasks
    const otherUser = await request(app).post('/api/users').send({ name: 'OtherUser' });
    await request(app).post('/api/tasks').send({ user_id: otherUser.body.id, title: 'Buy groceries for party' });

    const res = await request(app)
      .get('/api/tasks/search')
      .query({ user_id: userId, q: 'Buy' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Buy groceries');
  });

  it('should be case-insensitive (LIKE default behavior)', async () => {
    const res = await request(app)
      .get('/api/tasks/search')
      .query({ user_id: userId, q: 'buy' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Buy groceries');
  });
});
