const request = require('supertest');
const app = require('../../app');
const prisma = require('../../prismaClient');

const testUser = {
    email : "authtest@example.com",
    password: "correctpassword"
};

describe('POST /auth/signup', () => {
    afterEach(async () => {
        await prisma.user.deleteMany({ where: { email: testUser.email}})
    });

    it(`returns 409 when signing up with an email that already exists`, async () => {
        await request(app).post('/auth/signup').send(testUser);

        const response = await request(app).post('/auth/signup').send(testUser);
        
        expect(response.status).toBe(409);
    })
})

describe('POST /auth/login', () => {
    afterEach(async () => {
        await prisma.user.deleteMany({ where: { email: testUser.email }})
    });

    it('returns 401 when logging in with the wrong password', async () => {
        await request(app).post('/auth/signup').send(testUser);

        const response = await request(app).post('/auth/login').send( { email: testUser.email, password: 'wrongpassword'})

        expect(response.status).toBe(401);
    })
})