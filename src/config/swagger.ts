import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Bonolat Mobile API',
			version: '1.0.0',
			description: 'API for Bonolat Mobile - Fractioning and Inventory Management',
			contact: {
				name: 'DBS Comviver',
			},
		},
		servers: [
			{
				url: env.APP_URL || `http://localhost:${env.PORT}`,
				description: env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
			},
		},
		security: [
			{
				bearerAuth: [],
			},
		],
	},
	apis: ['./src/routes/**/*.ts', './src/modules/**/routes/*.ts', './src/modules/**/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);


