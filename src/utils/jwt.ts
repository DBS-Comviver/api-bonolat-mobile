import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JWTPayload {
	userId: number;
	email: string;
	nonce?: string;
}

export class JWTUtil {
	static generateToken(payload: JWTPayload): string {
		const payloadWithNonce = payload.nonce
			? payload
			: { ...payload, nonce: `${Date.now()}-${Math.random().toString(36).substring(7)}` };

		return jwt.sign(payloadWithNonce, env.JWT_SECRET, {
			expiresIn: env.JWT_EXPIRES_IN as any,
		});
	}

	static generateRefreshToken(payload: JWTPayload): string {
		const payloadWithNonce = payload.nonce
			? payload
			: { ...payload, nonce: `${Date.now()}-${Math.random().toString(36).substring(7)}` };

		return jwt.sign(payloadWithNonce, env.JWT_SECRET, {
			expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
		});
	}

	static verifyToken(token: string): JWTPayload {
		try {
			const decoded = jwt.verify(token, env.JWT_SECRET) as any;
			return {
				userId: typeof decoded.userId === 'string' ? parseInt(decoded.userId, 10) : decoded.userId,
				email: decoded.email,
			};
		} catch (error) {
			throw new Error('Invalid or expired token');
		}
	}

	static decodeToken(token: string): JWTPayload | null {
		try {
			return jwt.decode(token) as JWTPayload;
		} catch {
			return null;
		}
	}
}

