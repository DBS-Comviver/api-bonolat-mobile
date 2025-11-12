import { Response } from 'express';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        statusCode: number;
        details?: any;
    };
    message?: string;
}

export class ResponseUtil {
    static success<T>(
        res: Response,
        data: T,
        statusCode: number = 200,
        message?: string
    ): Response {
        const response: ApiResponse<T> = {
            success: true,
            data,
        };

        if (message) {
            response.message = message;
        }

        return res.status(statusCode).json(response);
    }

    static error(
        res: Response,
        message: string,
        statusCode: number = 400,
        details?: any
    ): Response {
        const response: ApiResponse = {
            success: false,
            error: {
                message,
                statusCode,
                ...(details && { details }),
            },
        };

        return res.status(statusCode).json(response);
    }

    static created<T>(
        res: Response,
        data: T,
        message?: string
    ): Response {
        return this.success(res, data, 201, message);
    }

    static noContent(res: Response): Response {
        return res.status(204).send();
    }

    static paginated<T>(
        res: Response,
        data: T[],
        page: number,
        limit: number,
        total: number
    ): Response {
        return res.status(200).json({
            success: true,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
}

