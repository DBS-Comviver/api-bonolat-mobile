import { Router } from 'express';
import authRoutes from './auth/routes/auth.routes';
import fractioningRoutes from './fractioning/routes/fractioning.routes';

const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/fractioning', fractioningRoutes);

export default routes;