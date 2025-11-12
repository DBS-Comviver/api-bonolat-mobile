import { LoginDTO } from '../dtos/login.dto';
import { UserService } from '../../user/services/user.service';
import { SessionRepository } from '../repositories/session.repository';
import { JWTUtil } from '../../../utils/jwt';
import { env } from '../../../config/env';
import { DateUtil } from '../../../utils/date';
import { logger } from '../../../config/logger';

export interface AuthResponse {
	user: {
		id: number;
		name: string;
		username: string;
		email: string;
	};
	token: string;
	refreshToken: string;
}

export class AuthService {
	private userService = new UserService();
	private sessionRepository = new SessionRepository();

	async login(data: LoginDTO): Promise<AuthResponse> {
		logger.debug('Login attempt', { username: data.username });

		const user = await this.userService.validatePassword(data.username, data.password);

		const payload = {
			userId: user.id,
			email: user.email,
		};

		const token = JWTUtil.generateToken(payload);
		const refreshToken = JWTUtil.generateRefreshToken(payload);

		const expiresAt = DateUtil.parseExpiration(env.JWT_EXPIRES_IN);

		try {
			await this.sessionRepository.create({
				userId: user.id,
				token,
				expiresAt,
			});
		} catch (error: any) {
			if (error?.code === 'P2002' && error?.meta?.target?.includes('token')) {
				logger.warn('Token collision detected, generating new token', { userId: user.id });
				const newToken = JWTUtil.generateToken(payload);
				const newRefreshToken = JWTUtil.generateRefreshToken(payload);

				await this.sessionRepository.create({
					userId: user.id,
					token: newToken,
					expiresAt,
				});

				logger.info('User logged in successfully', { userId: user.id, username: user.username, email: user.email });

				return {
					user: {
						id: user.id,
						name: user.name,
						username: user.username,
						email: user.email,
					},
					token: newToken,
					refreshToken: newRefreshToken,
				};
			}
			throw error;
		}

		logger.info('User logged in successfully', { userId: user.id, username: user.username, email: user.email });

		return {
			user: {
				id: user.id,
				name: user.name,
				username: user.username,
				email: user.email,
			},
			token,
			refreshToken,
		};
	}

	async logout(token: string): Promise<void> {
		logger.debug('Logout request', { token: token.substring(0, 10) + '...' });
		await this.sessionRepository.delete(token);
		logger.info('User logged out successfully');
	}

	async logoutAll(userId: number): Promise<void> {
		logger.info('Logout all sessions request', { userId });
		await this.sessionRepository.deleteAllUserSessions(userId);
		logger.info('All sessions logged out successfully', { userId });
	}

	async refreshToken(refreshToken: string): Promise<AuthResponse> {
		logger.debug('Token refresh request');

		const payload = JWTUtil.verifyToken(refreshToken);
		const user = await this.userService.getUserById(payload.userId);

		const newPayload = {
			userId: user.id,
			email: user.email,
		};

		const newToken = JWTUtil.generateToken(newPayload);
		const newRefreshToken = JWTUtil.generateRefreshToken(newPayload);

		const expiresAt = DateUtil.parseExpiration(env.JWT_EXPIRES_IN);

		await this.sessionRepository.create({
			userId: user.id,
			token: newToken,
			expiresAt,
		});

		logger.info('Token refreshed successfully', { userId: user.id });

		return {
			user: {
				id: user.id,
				name: user.name,
				username: user.username,
				email: user.email,
			},
			token: newToken,
			refreshToken: newRefreshToken,
		};
	}
}

