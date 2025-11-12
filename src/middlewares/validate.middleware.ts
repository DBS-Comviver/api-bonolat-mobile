import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		try {
			schema.parse(req.body);
			next();
			return;
		} catch (error) {
			if (error instanceof ZodError) {
				res.status(422).json({
					error: {
						message: 'Validation error',
						statusCode: 422,
						details: error.issues,
					},
				});
				return;
			}
			next(error);
			return;
		}
	};
};

export const validateQuery = (schema: ZodSchema) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		try {
			schema.parse(req.query);
			next();
			return;
		} catch (error) {
			if (error instanceof ZodError) {
				res.status(422).json({
					error: {
						message: 'Validation error',
						statusCode: 422,
						details: error.issues,
					},
				});
				return;
			}
			next(error);
			return;
		}
	};
};

export const validateParams = (schema: ZodSchema) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		try {
			schema.parse(req.params);
			next();
			return;
		} catch (error) {
			if (error instanceof ZodError) {
				res.status(422).json({
					error: {
						message: 'Validation error',
						statusCode: 422,
						details: error.issues,
					},
				});
				return;
			}
			next(error);
			return;
		}
	};
};

