import { Router } from 'express';
import userRoutes from './user/routes/user.routes';
import authRoutes from './auth/routes/auth.routes';

const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/users', userRoutes);

export default routes;