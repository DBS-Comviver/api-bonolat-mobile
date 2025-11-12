import { AuthService } from '../../../src/modules/auth/services/auth.service';
import { UserService } from '../../../src/modules/user/services/user.service';
import { NotFoundError } from '../../../src/utils/errors';
import { prisma } from '../../../src/config/database';

describe('AuthService', () => {
	let authService: AuthService;
	let userService: UserService;

	beforeEach(() => {
		authService = new AuthService();
		userService = new UserService();
	});

	afterEach(async () => {
		await prisma.session.deleteMany();
		await prisma.user.deleteMany();
	});

	describe('login', () => {
		it('should return user, token and refreshToken on successful login', async () => {
			const userData = {
				name: 'Test User',
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
			};

			await userService.createUser(userData);

			const result = await authService.login({
				username: userData.username,
				password: userData.password,
			});

			expect(result).toHaveProperty('user');
			expect(result).toHaveProperty('token');
			expect(result).toHaveProperty('refreshToken');
			expect(result.user.username).toBe(userData.username);
			expect(result.user.email).toBe(userData.email);
			expect(result.user.name).toBe(userData.name);
		});

		it('should create a session in database', async () => {
			const userData = {
				name: 'Test User',
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
			};

			const user = await userService.createUser(userData);
			const result = await authService.login({
				username: userData.username,
				password: userData.password,
			});

			const session = await prisma.session.findFirst({
				where: { token: result.token },
			});

			expect(session).toBeDefined();
			expect(session?.userId).toBe(user.id);
		});

		it('should throw NotFoundError if credentials are invalid', async () => {
			await expect(
				authService.login({
					username: 'nonexistent',
					password: 'password123',
				})
			).rejects.toThrow(NotFoundError);
		});
	});

	describe('logout', () => {
		it('should delete session from database', async () => {
			const userData = {
				name: 'Test User',
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
			};

			await userService.createUser(userData);
			const result = await authService.login({
				username: userData.username,
				password: userData.password,
			});

			await authService.logout(result.token);

			const session = await prisma.session.findFirst({
				where: { token: result.token },
			});

			expect(session).toBeNull();
		});
	});

	describe('logoutAll', () => {
		it('should delete all user sessions', async () => {
			const userData = {
				name: 'Test User',
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
			};

			const user = await userService.createUser(userData);
			const result1 = await authService.login({
				username: userData.username,
				password: userData.password,
			});
			const result2 = await authService.login({
				username: userData.username,
				password: userData.password,
			});

			await authService.logoutAll(user.id);

			const sessions = await prisma.session.findMany({
				where: { userId: user.id },
			});

			expect(sessions).toHaveLength(0);
		});
	});
});

