import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { loginSchema } from '../dtos/login.dto';
import { AuthRequest } from '../../../middlewares/auth.middleware';

const authService = new AuthService();

export class AuthController {
	/**
	 * @swagger
	 * /api/auth/login:
	 *   post:
	 *     summary: User login
	 *     tags: [Auth]
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             required:
	 *               - username
	 *               - password
	 *             properties:
	 *               username:
	 *                 type: string
	 *                 example: dbs
	 *               password:
	 *                 type: string
	 *                 example: dbs@1234
	 *     responses:
	 *       200:
	 *         description: Login successful
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 user:
	 *                   type: object
	 *                   properties:
	 *                     login:
	 *                       type: string
	 *                     nome:
	 *                       type: string
	 *                     permissions:
	 *                       type: object
	 *                 token:
	 *                   type: string
	 *                 refreshToken:
	 *                   type: string
	 *       401:
	 *         description: Invalid credentials
	 *       404:
	 *         description: User permissions not found
	 */
	async login(req: Request, res: Response) {
		const body = loginSchema.parse(req.body);
		const result = await authService.login(body);

		return res.json(result);
	}

	/**
	 * @swagger
	 * /api/auth/logout:
	 *   post:
	 *     summary: User logout
	 *     tags: [Auth]
	 *     security:
	 *       - bearerAuth: []
	 *     responses:
	 *       200:
	 *         description: Logout successful
	 *       401:
	 *         description: Unauthorized
	 */
	async logout(req: AuthRequest, res: Response) {
		const token = req.headers.authorization?.split(' ')[1];

		if (token) {
			await authService.logout(token);
		}

		return res.json({ message: 'Logged out successfully' });
	}

	/**
	 * @swagger
	 * /api/auth/logout-all:
	 *   post:
	 *     summary: Logout from all devices
	 *     tags: [Auth]
	 *     security:
	 *       - bearerAuth: []
	 *     responses:
	 *       200:
	 *         description: Logout from all devices successful
	 *       401:
	 *         description: Unauthorized
	 */
	async logoutAll(req: AuthRequest, res: Response) {
		if (!req.user) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		await authService.logoutAll(req.user.login);
		return res.json({ message: 'Logged out from all devices' });
	}

	/**
	 * @swagger
	 * /api/auth/refresh:
	 *   post:
	 *     summary: Refresh access token
	 *     tags: [Auth]
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             required:
	 *               - refreshToken
	 *             properties:
	 *               refreshToken:
	 *                 type: string
	 *     responses:
	 *       200:
	 *         description: Token refreshed successfully
	 *       400:
	 *         description: Refresh token is required
	 *       401:
	 *         description: Invalid or expired token
	 */
	async refreshToken(req: Request, res: Response) {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			return res.status(400).json({ error: 'Refresh token is required' });
		}

		const result = await authService.refreshToken(refreshToken);
		return res.json(result);
	}
}

