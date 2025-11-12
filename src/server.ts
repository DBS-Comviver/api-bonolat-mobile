import { app } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import './config/database';

app.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.debug('Server started successfully');
});
