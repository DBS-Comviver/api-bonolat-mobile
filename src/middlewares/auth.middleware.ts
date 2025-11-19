import { Request, Response, NextFunction } from 'express';
import { JWTUtil } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

export interface AuthRequest extends Request {
	user?: {
		login: string;
	};
}

export const authMiddleware = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			logger.warn('Authentication failed: missing authorization header', {
				path: req.path,
				method: req.method,
				ip: req.ip,
			});
			throw new UnauthorizedError('Authorization header is required');
		}

		const [bearer, token] = authHeader.split(' ');

		if (bearer !== 'Bearer' || !token) {
			logger.warn('Authentication failed: invalid authorization header format', {
				path: req.path,
				method: req.method,
				ip: req.ip,
			});
			throw new UnauthorizedError('Invalid authorization header format');
		}

		const payload = JWTUtil.verifyToken(token);

		const session = await prisma.session.findFirst({
			where: {
				token,
				login: payload.login,
				expiresAt: {
					gt: new Date(),
				},
			},
		});

		if (!session) {
			logger.warn('Authentication failed: session expired or invalid', {
				login: payload.login,
				path: req.path,
				method: req.method,
				ip: req.ip,
			});
			throw new UnauthorizedError('Session expired or invalid');
		}

		logger.debug('Authentication successful', {
			login: payload.login,
			path: req.path,
		});

		req.user = payload;
		next();
		return;
	} catch (error) {
		if (error instanceof UnauthorizedError) {
			res.status(401).json({
				error: {
					message: error.message,
					statusCode: 401,
				},
			});
			return;
		}

		logger.error('Authentication error', {
			message: error instanceof Error ? error.message : 'Unknown error',
			path: req.path,
			method: req.method,
			ip: req.ip,
		});

		res.status(401).json({
			error: {
				message: 'Invalid or expired token',
				statusCode: 401,
			},
		});
		return;
	}
};

