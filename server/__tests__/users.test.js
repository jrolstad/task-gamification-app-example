const request = require('supertest');
const { createTestApp } = require('../test-helper');

describe('POST /api/users', () => {
  let app, db;

  beforeEach(() => {
    ({ app, db } = createTestApp());
  });

  afterEach(() => {
    db.close();
  });

  it('should create a new user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Alice' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Alice');
    expect(res.body.points).toBe(0);
    expect(res.body).toHaveProperty('created_at');
  });

  it('should return existing user on duplicate name', async () => {
    const res1 = await request(app)
      .post('/api/users')
      .send({ name: 'Bob' });

    const res2 = await request(app)
      .post('/api/users')
      .send({ name: 'Bob' });

    expect(res2.status).toBe(200);
    expect(res2.body.id).toBe(res1.body.id);
    expect(res2.body.name).toBe('Bob');
  });

  it('should be case-insensitive when looking up existing user', async () => {
    const res1 = await request(app)
      .post('/api/users')
      .send({ name: 'Charlie' });

    const res2 = await request(app)
      .post('/api/users')
      .send({ name: 'charlie' });

    expect(res2.status).toBe(200);
    expect(res2.body.id).toBe(res1.body.id);
  });

  it('should return 400 if name is missing', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Name is required');
  });

  it('should return 400 if name is empty string', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: '' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Name is required');
  });

  it('should return 400 if name is only whitespace', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Name is required');
  });

  it('should trim the user name', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: '  Dave  ' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Dave');
  });
});
