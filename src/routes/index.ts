import { Router } from 'express';
import modulesRoutes from '../modules';

const router = Router();
router.use('/api', modulesRoutes);

export default router;
