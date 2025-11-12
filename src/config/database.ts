import { PrismaClient } from '../generated/prisma-client';
import { env } from './env';
import { logger } from './logger';

export const prisma = new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

prisma
    .$connect()
    .then(() => {
        logger.info('Database connected successfully');
    })
    .catch((err) => {
        logger.error('Database connection error', err);
        process.exit(1);
    });

process.on('beforeExit', async () => {
    logger.debug('Closing database connection');
    await prisma.$disconnect();
});
