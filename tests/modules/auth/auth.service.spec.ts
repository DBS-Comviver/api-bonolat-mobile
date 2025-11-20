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

		it('should return valid JWT token on login', async () => {
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

			expect(result.token).toBeDefined();
			expect(result.refreshToken).toBeDefined();
			expect(typeof result.token).toBe('string');
			expect(result.token.length).toBeGreaterThan(0);
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
		it('should complete logout without error', async () => {
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

			await expect(authService.logout(result.token)).resolves.not.toThrow();
		});
	});

	describe('logoutAll', () => {
		it('should complete logoutAll without error', async () => {
			const userData = {
				name: 'Test User',
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
			};

			const user = await userService.createUser(userData);
			await authService.login({
				username: userData.username,
				password: userData.password,
			});
			await authService.login({
				username: userData.username,
				password: userData.password,
			});

			await expect(authService.logoutAll(user.id)).resolves.not.toThrow();
		});
	});
});

