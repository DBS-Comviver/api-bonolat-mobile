import request from 'supertest';
import { app } from '../../../src/app';
import { prisma } from '../../../src/config/database';
import bcrypt from 'bcryptjs';

describe('AuthController', () => {
    beforeEach(async () => {
        await prisma.user.deleteMany();
    });

    afterEach(async () => {
        await prisma.user.deleteMany();
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await prisma.user.create({
                data: {
                    name: 'Test User',
                    username: 'testuser',
                    email: 'test@example.com',
                    password: hashedPassword,
                },
            });

            const response = await request(app).post('/api/auth/login').send({
                username: 'testuser',
                password: 'password123',
            });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('user');
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('refreshToken');
            expect(response.body.user.username).toBe('testuser');
            expect(response.body.user.email).toBe('test@example.com');
        });

        it('should return 422 for missing username', async () => {
            const response = await request(app).post('/api/auth/login').send({
                password: 'password123',
            });

            expect(response.status).toBe(422);
        });

        it('should return error for invalid credentials', async () => {
            const response = await request(app).post('/api/auth/login').send({
                username: 'nonexistent',
                password: 'wrongpassword',
            });

            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should logout with valid token', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            const user = await prisma.user.create({
                data: {
                    name: 'Test User',
                    username: 'testuser',
                    email: 'test@example.com',
                    password: hashedPassword,
                },
            });

            const loginResponse = await request(app).post('/api/auth/login').send({
                username: 'testuser',
                password: 'password123',
            });

            const token = loginResponse.body.token;

            const response = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Logged out successfully');
        });

        it('should return 401 without token', async () => {
            const response = await request(app).post('/api/auth/logout');

            expect(response.status).toBe(401);
        });
    });
});

