import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { loginSchema } from '../dtos/login.dto';
import { AuthRequest } from '../../../middlewares/auth.middleware';

const authService = new AuthService();

export class AuthController {
	async login(req: Request, res: Response) {
		const body = loginSchema.parse(req.body);
		const result = await authService.login(body);

		return res.json(result);
	}

	async logout(req: AuthRequest, res: Response) {
		const token = req.headers.authorization?.split(' ')[1];

		if (token) {
			await authService.logout(token);
		}

		return res.json({ message: 'Logged out successfully' });
	}

	async logoutAll(req: AuthRequest, res: Response) {
		if (!req.user) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		await authService.logoutAll(req.user.userId);
		return res.json({ message: 'Logged out from all devices' });
	}

	async refreshToken(req: Request, res: Response) {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			return res.status(400).json({ error: 'Refresh token is required' });
		}

		const result = await authService.refreshToken(refreshToken);
		return res.json(result);
	}
}

