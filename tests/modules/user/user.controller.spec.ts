import request from 'supertest';
import { app } from '../../../src/app';
import { prisma } from '../../../src/config/database';
import bcrypt from 'bcryptjs';

describe('UserController', () => {
	beforeEach(async () => {
		// Stateless authentication - no session table needed
		await prisma.user.deleteMany();
	});

	afterEach(async () => {
		// Stateless authentication - no session table needed
		await prisma.user.deleteMany();
	});

	describe('POST /api/users', () => {
		it('should create a new user', async () => {
			const userData = {
				name: 'Test User',
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
			};

			const response = await request(app)
				.post('/api/users')
				.send(userData);

			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty('id');
			expect(response.body.name).toBe(userData.name);
			expect(response.body.username).toBe(userData.username);
			expect(response.body.email).toBe(userData.email);
			expect(response.body).not.toHaveProperty('password');
		});

		it('should return 422 for invalid email', async () => {
			const userData = {
				name: 'Test User',
				username: 'testuser',
				email: 'invalid-email',
				password: 'password123',
			};

			const response = await request(app)
				.post('/api/users')
				.send(userData);

			expect(response.status).toBe(422);
			expect(response.body.error).toBeDefined();
		});

		it('should return 422 for invalid username', async () => {
			const userData = {
				name: 'Test User',
				username: 'ab',
				email: 'test@example.com',
				password: 'password123',
			};

			const response = await request(app)
				.post('/api/users')
				.send(userData);

			expect(response.status).toBe(422);
		});

		it('should return 422 for short password', async () => {
			const userData = {
				name: 'Test User',
				username: 'testuser',
				email: 'test@example.com',
				password: '12345',
			};

			const response = await request(app)
				.post('/api/users')
				.send(userData);

			expect(response.status).toBe(422);
		});

		it('should return 409 for duplicate email', async () => {
			const userData = {
				name: 'Test User',
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
			};

			await request(app).post('/api/users').send(userData);

			const duplicateUserData = {
				name: 'Test User 2',
				username: 'testuser2',
				email: 'test@example.com',
				password: 'password123',
			};

			const response = await request(app)
				.post('/api/users')
				.send(duplicateUserData);

			expect(response.status).toBe(409);
			expect(response.body.error.message).toContain('already exists');
		});

		it('should return 409 for duplicate username', async () => {
			const userData = {
				name: 'Test User',
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
			};

			await request(app).post('/api/users').send(userData);

			const duplicateUserData = {
				name: 'Test User 2',
				username: 'testuser',
				email: 'test2@example.com',
				password: 'password123',
			};

			const response = await request(app)
				.post('/api/users')
				.send(duplicateUserData);

			expect(response.status).toBe(409);
			expect(response.body.error.message).toContain('already exists');
		});
	});

	describe('GET /api/users', () => {
		it('should return 401 without token', async () => {
			const response = await request(app).get('/api/users');

			expect(response.status).toBe(401);
		});

		it('should return list of users with valid token', async () => {
			const hashedPassword = await bcrypt.hash('password123', 10);
			const user = await prisma.user.create({
				data: {
					name: 'Test User',
					username: 'testuser',
					email: 'test@example.com',
					password: hashedPassword,
				},
			});

			const loginResponse = await request(app)
				.post('/api/auth/login')
				.send({
					username: 'testuser',
					password: 'password123',
				});

			const token = loginResponse.body.token;

			const response = await request(app)
				.get('/api/users')
				.set('Authorization', `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(Array.isArray(response.body)).toBe(true);
			expect(response.body.length).toBeGreaterThan(0);
		});
	});

	describe('GET /api/users/:id', () => {
		it('should return 401 without token', async () => {
			const response = await request(app).get('/api/users/123');

			expect(response.status).toBe(401);
		});

		it('should return user by id with valid token', async () => {
			const hashedPassword = await bcrypt.hash('password123', 10);
			const user = await prisma.user.create({
				data: {
					name: 'Test User',
					username: 'testuser',
					email: 'test@example.com',
					password: hashedPassword,
				},
			});

			const loginResponse = await request(app)
				.post('/api/auth/login')
				.send({
					username: 'testuser',
					password: 'password123',
				});

			const token = loginResponse.body.token;

			const response = await request(app)
				.get(`/api/users/${user.id}`)
				.set('Authorization', `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(response.body.id).toBe(user.id);
			expect(response.body.username).toBe(user.username);
			expect(response.body.email).toBe(user.email);
		});

		it('should return 404 for non-existent user', async () => {
			const hashedPassword = await bcrypt.hash('password123', 10);
			await prisma.user.create({
				data: {
					name: 'Test User',
					username: 'testuser',
					email: 'test@example.com',
					password: hashedPassword,
				},
			});

			const loginResponse = await request(app)
				.post('/api/auth/login')
				.send({
					username: 'testuser',
					password: 'password123',
				});

			const token = loginResponse.body.token;

			const response = await request(app)
				.get('/api/users/99999')
				.set('Authorization', `Bearer ${token}`);

			expect(response.status).toBe(404);
		});
	});

	describe('PUT /api/users/:id', () => {
		it('should return 401 without token', async () => {
			const response = await request(app).put('/api/users/123');

			expect(response.status).toBe(401);
		});

		it('should update user with valid token', async () => {
			const hashedPassword = await bcrypt.hash('password123', 10);
			const user = await prisma.user.create({
				data: {
					name: 'Test User',
					username: 'testuser',
					email: 'test@example.com',
					password: hashedPassword,
				},
			});

			const loginResponse = await request(app)
				.post('/api/auth/login')
				.send({
					username: 'testuser',
					password: 'password123',
				});

			const token = loginResponse.body.token;

			const response = await request(app)
				.put(`/api/users/${user.id}`)
				.set('Authorization', `Bearer ${token}`)
				.send({
					name: 'Updated Name',
				});

			expect(response.status).toBe(200);
			expect(response.body.name).toBe('Updated Name');
			expect(response.body.email).toBe(user.email);
		});

		it('should return 403 when trying to update another user', async () => {
			const hashedPassword = await bcrypt.hash('password123', 10);
			const user1 = await prisma.user.create({
				data: {
					name: 'User 1',
					username: 'user1',
					email: 'user1@example.com',
					password: hashedPassword,
				},
			});

			const user2 = await prisma.user.create({
				data: {
					name: 'User 2',
					username: 'user2',
					email: 'user2@example.com',
					password: hashedPassword,
				},
			});

			const loginResponse = await request(app)
				.post('/api/auth/login')
				.send({
					username: 'user1',
					password: 'password123',
				});

			const token = loginResponse.body.token;

			const response = await request(app)
				.put(`/api/users/${user2.id}`)
				.set('Authorization', `Bearer ${token}`)
				.send({
					name: 'Updated Name',
				});

			expect(response.status).toBe(403);
		});
	});

	describe('DELETE /api/users/:id', () => {
		it('should return 401 without token', async () => {
			const response = await request(app).delete('/api/users/123');

			expect(response.status).toBe(401);
		});

		it('should delete user with valid token', async () => {
			const hashedPassword = await bcrypt.hash('password123', 10);
			const user = await prisma.user.create({
				data: {
					name: 'Test User',
					username: 'testuser',
					email: 'test@example.com',
					password: hashedPassword,
				},
			});

			const loginResponse = await request(app)
				.post('/api/auth/login')
				.send({
					username: 'testuser',
					password: 'password123',
				});

			const token = loginResponse.body.token;

			const response = await request(app)
				.delete(`/api/users/${user.id}`)
				.set('Authorization', `Bearer ${token}`);

			expect(response.status).toBe(204);

			const deletedUser = await prisma.user.findUnique({
				where: { id: user.id },
			});

			expect(deletedUser).toBeNull();
		});

		it('should return 403 when trying to delete another user', async () => {
			const hashedPassword = await bcrypt.hash('password123', 10);
			const user1 = await prisma.user.create({
				data: {
					name: 'User 1',
					username: 'user1',
					email: 'user1@example.com',
					password: hashedPassword,
				},
			});

			const user2 = await prisma.user.create({
				data: {
					name: 'User 2',
					username: 'user2',
					email: 'user2@example.com',
					password: hashedPassword,
				},
			});

			const loginResponse = await request(app)
				.post('/api/auth/login')
				.send({
					username: 'user1',
					password: 'password123',
				});

			const token = loginResponse.body.token;

			const response = await request(app)
				.delete(`/api/users/${user2.id}`)
				.set('Authorization', `Bearer ${token}`);

			expect(response.status).toBe(403);
		});
	});
});

