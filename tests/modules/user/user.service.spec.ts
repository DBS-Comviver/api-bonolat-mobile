import { UserService } from '../../../src/modules/user/services/user.service';
import { ConflictError, NotFoundError } from '../../../src/utils/errors';
import { prisma } from '../../../src/config/database';

describe('UserService', () => {
	let userService: UserService;

	beforeEach(() => {
		userService = new UserService();
	});

	afterEach(async () => {
		await prisma.user.deleteMany();
	});

	describe('createUser', () => {
		it('should create a new user', async () => {
			const userData = {
				name: 'Test User',
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
			};

			const user = await userService.createUser(userData);

			expect(user).toHaveProperty('id');
			expect(user.name).toBe(userData.name);
			expect(user.username).toBe(userData.username);
			expect(user.email).toBe(userData.email);
			expect(user).not.toHaveProperty('password');
		});

		it('should throw ConflictError if email already exists', async () => {
			const userData = {
				name: 'Test User',
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
			};

			await userService.createUser(userData);

			const duplicateUserData = {
				name: 'Test User 2',
				username: 'testuser2',
				email: 'test@example.com',
				password: 'password123',
			};

			await expect(userService.createUser(duplicateUserData)).rejects.toThrow(
				ConflictError
			);
		});

		it('should throw ConflictError if username already exists', async () => {
			const userData = {
				name: 'Test User',
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
			};

			await userService.createUser(userData);

			const duplicateUserData = {
				name: 'Test User 2',
				username: 'testuser',
				email: 'test2@example.com',
				password: 'password123',
			};

			await expect(userService.createUser(duplicateUserData)).rejects.toThrow(
				ConflictError
			);
		});

		it('should hash password before saving', async () => {
			const userData = {
				name: 'Test User',
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
			};

			await userService.createUser(userData);

			const userInDb = await prisma.user.findUnique({
				where: { username: userData.username },
			});

			expect(userInDb?.password).not.toBe(userData.password);
			expect(userInDb?.password).toHaveLength(60);
		});
	});

	describe('getUserById', () => {
		it('should return user by id', async () => {
			const userData = {
				name: 'Test User',
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
			};

			const createdUser = await userService.createUser(userData);
			const user = await userService.getUserById(createdUser.id);

			expect(user.id).toBe(createdUser.id);
			expect(user.username).toBe(userData.username);
			expect(user.email).toBe(userData.email);
		});

		it('should throw NotFoundError if user does not exist', async () => {
			await expect(userService.getUserById(99999)).rejects.toThrow(
				NotFoundError
			);
		});
	});

	describe('validatePassword', () => {
		it('should return user if password is correct', async () => {
			const userData = {
				name: 'Test User',
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
			};

			await userService.createUser(userData);
			const user = await userService.validatePassword(
				userData.username,
				userData.password
			);

			expect(user.username).toBe(userData.username);
			expect(user.email).toBe(userData.email);
		});

		it('should throw NotFoundError if username does not exist', async () => {
			await expect(
				userService.validatePassword('nonexistent', 'password123')
			).rejects.toThrow(NotFoundError);
		});

		it('should throw NotFoundError if password is incorrect', async () => {
			const userData = {
				name: 'Test User',
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
			};

			await userService.createUser(userData);

			await expect(
				userService.validatePassword(userData.username, 'wrongpassword')
			).rejects.toThrow(NotFoundError);
		});
	});
});

