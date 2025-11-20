import { LoginDTO } from '../dtos/login.dto';
import { SessionRepository } from '../repositories/session.repository';
import { PermissionRepository } from '../repositories/permission.repository';
import { TotvsService } from '../../../services/totvs.service';
import { JWTUtil } from '../../../utils/jwt';
import { logger } from '../../../config/logger';

export interface AuthResponse {
	user: {
		login: string;
		nome: string | null;
		permissions: {
			administrador: number | null;
			financeiro: number;
			fiscal: number;
			controles: number;
			estoque: number | null;
			faturamento: number | null;
		};
	};
	token: string;
	refreshToken: string;
}

export class AuthService {
	private sessionRepository = new SessionRepository();
	private permissionRepository = new PermissionRepository();
	private totvsService = new TotvsService();

	async login(data: LoginDTO): Promise<AuthResponse> {
		logger.debug('Login attempt', { username: data.username });

		const totvsResponse = await this.totvsService.validateLogin(data.username, data.password);

		const permissions = await this.permissionRepository.findByLogin(data.username);

		const payload = {
			login: data.username,
		};

		const token = JWTUtil.generateToken(payload);
		const refreshToken = JWTUtil.generateRefreshToken(payload);

		logger.info('User logged in successfully', { login: data.username, nome: permissions.nome });

		return {
			user: {
				login: data.username,
				nome: permissions.nome,
				permissions: {
					administrador: permissions.administrador,
					financeiro: permissions.financeiro,
					fiscal: permissions.fiscal,
					controles: permissions.controles,
					estoque: permissions.estoque,
					faturamento: permissions.faturamento,
				},
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

	async logoutAll(login: string): Promise<void> {
		logger.info('Logout all sessions request', { login });
		await this.sessionRepository.deleteAllUserSessions(login);
		logger.info('All sessions logged out successfully', { login });
	}

	async refreshToken(refreshToken: string): Promise<AuthResponse> {
		logger.debug('Token refresh request');

		const payload = JWTUtil.verifyToken(refreshToken);
		const permissions = await this.permissionRepository.findByLogin(payload.login);

		const newPayload = {
			login: payload.login,
		};

		const newToken = JWTUtil.generateToken(newPayload);
		const newRefreshToken = JWTUtil.generateRefreshToken(newPayload);

		logger.info('Token refreshed successfully', { login: payload.login });

		return {
			user: {
				login: payload.login,
				nome: permissions.nome,
				permissions: {
					administrador: permissions.administrador,
					financeiro: permissions.financeiro,
					fiscal: permissions.fiscal,
					controles: permissions.controles,
					estoque: permissions.estoque,
					faturamento: permissions.faturamento,
				},
			},
			token: newToken,
			refreshToken: newRefreshToken,
		};
	}
}

