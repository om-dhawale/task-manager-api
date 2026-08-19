const request = require('supertest');
const app = require('../../app');
const prisma = require('../../prismaClient');

const testUser = {
  email: 'testuser@example.com',
  password: 'password123',
};

describe('GET /tasks', () => {
  it('returns 401 when no auth token is provided', async () => {
    const response = await request(app).get('/tasks');
    expect(response.status).toBe(401);
  });

  describe('with a looged-in user', () => {
    afterEach(async () => {
      await prisma.user.deleteMany({ where: { email: testUser.email } });
    });

    it("returns 200 and the users's tasks", async () => {
      await request(app).post('/auth/signup').send(testUser);

      const loginRes = await request(app).post('/auth/login').send(testUser);
      const token = loginRes.body.token;

      const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('with two users, testing ownership', () => {
    const userA = { email: 'usera@example.com', password: 'password123' };
    const userB = { email: 'userb@example.com', password: 'password123' };

    afterEach(async () => {
      await prisma.task.deleteMany({
        where: {
          project: { user: { email: { in: [userA.email, userB.email] } } },
        },
      });
      await prisma.project.deleteMany({
        where: { user: { email: { in: [userA.email, userB.email] } } },
      });
      await prisma.user.deleteMany({
        where: { email: { in: [userA.email, userB.email] } },
      });
    });

    it(`returns 403 when a user tries to access another user's task`, async () => {
      // 1. create both users
      await request(app).post('/auth/signup').send(userA);
      await request(app).post('/auth/signup').send(userB);

      // 2. login as userA
      const loginA = await request(app).post('/auth/login').send(userA);
      const tokenA = loginA.body.token;

      const projectRes = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'A private project' }); 

      const projectId = projectRes.body.id;

      // 3.create a task as userA

      const createRes = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'A private task', projectId });

      const taskId = createRes.body.id;

      // 4. login as userB

      const loginB = await request(app).post('/auth/login').send(userB);
      const tokenB = loginB.body.token;

      const response = await request(app)
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(response.status).toBe(403);
    });
  });
});
