const request = require('supertest');
const { createTestApp } = require('../test-helper');

describe('GET /api/leaderboard', () => {
  let app, db;

  beforeEach(() => {
    ({ app, db } = createTestApp());
  });

  afterEach(() => {
    db.close();
  });

  it('should return empty array when no users exist', async () => {
    const res = await request(app).get('/api/leaderboard');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should return users sorted by points descending', async () => {
    // Create users
    const alice = await request(app).post('/api/users').send({ name: 'Alice' });
    const bob = await request(app).post('/api/users').send({ name: 'Bob' });

    // Give Bob more points by completing tasks
    const task1 = await request(app).post('/api/tasks').send({ user_id: bob.body.id, title: 'Task 1' });
    const task2 = await request(app).post('/api/tasks').send({ user_id: bob.body.id, title: 'Task 2' });
    await request(app).patch(`/api/tasks/${task1.body.id}/complete`);
    await request(app).patch(`/api/tasks/${task2.body.id}/complete`);

    // Give Alice fewer points
    const task3 = await request(app).post('/api/tasks').send({ user_id: alice.body.id, title: 'Task 3' });
    await request(app).patch(`/api/tasks/${task3.body.id}/complete`);

    const res = await request(app).get('/api/leaderboard');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].name).toBe('Bob');
    expect(res.body[0].points).toBe(20);
    expect(res.body[1].name).toBe('Alice');
    expect(res.body[1].points).toBe(10);
  });

  it('should break ties by name ascending', async () => {
    // Create users with same points (0)
    await request(app).post('/api/users').send({ name: 'Charlie' });
    await request(app).post('/api/users').send({ name: 'Alice' });
    await request(app).post('/api/users').send({ name: 'Bob' });

    const res = await request(app).get('/api/leaderboard');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0].name).toBe('Alice');
    expect(res.body[1].name).toBe('Bob');
    expect(res.body[2].name).toBe('Charlie');
  });

  it('should return id, name, and points for each user', async () => {
    await request(app).post('/api/users').send({ name: 'TestUser' });

    const res = await request(app).get('/api/leaderboard');

    expect(res.status).toBe(200);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('points');
    // Should not include created_at (only id, name, points selected)
    expect(res.body[0]).not.toHaveProperty('created_at');
  });

  it('should limit results to 50 users', async () => {
    // Create 55 users
    for (let i = 0; i < 55; i++) {
      await request(app).post('/api/users').send({ name: `User${String(i).padStart(3, '0')}` });
    }

    const res = await request(app).get('/api/leaderboard');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(50);
  });
});
