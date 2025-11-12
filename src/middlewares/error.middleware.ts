import { Request, Response, NextFunction } from 'express';
import { AppError, ConflictError } from '../utils/errors';
import { ZodError } from 'zod';
import { logger } from '../config/logger';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export const errorMiddleware = (
	err: Error | AppError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (err instanceof AppError) {
		logger.warn(`AppError: ${err.message}`, {
			statusCode: err.statusCode,
			path: req.path,
			method: req.method,
		});
		
		return res.status(err.statusCode).json({
			error: {
				message: err.message,
				statusCode: err.statusCode,
			},
		});
	}

	if (err instanceof ZodError) {
		logger.warn('Validation error', {
			path: req.path,
			method: req.method,
			errors: err.issues,
		});
		
		return res.status(422).json({
			error: {
				message: 'Validation error',
				statusCode: 422,
				details: err.issues,
			},
		});
	}

	if (err instanceof PrismaClientKnownRequestError) {
		if (err.code === 'P2002') {
			const target = err.meta?.target as string[] | undefined;
			const field = target ? target[0] : 'field';
			logger.warn('Prisma unique constraint error', {
				code: err.code,
				target: field,
				path: req.path,
				method: req.method,
			});
			
			return res.status(409).json({
				error: {
					message: `${field} already exists`,
					statusCode: 409,
				},
			});
		}

		if (err.code === 'P2003') {
			logger.warn('Prisma foreign key constraint error', {
				code: err.code,
				path: req.path,
				method: req.method,
			});
			
			return res.status(400).json({
				error: {
					message: 'Invalid reference to related resource',
					statusCode: 400,
				},
			});
		}

		logger.error('Prisma error', {
			code: err.code,
			message: err.message,
			path: req.path,
			method: req.method,
		});
		
		return res.status(400).json({
			error: {
				message: 'Database error',
				statusCode: 400,
			},
		});
	}

	logger.error('Unhandled error', {
		message: err.message,
		stack: err.stack,
		path: req.path,
		method: req.method,
	});

	return res.status(500).json({
		error: {
			message: 'Internal server error',
			statusCode: 500,
		},
	});
};

