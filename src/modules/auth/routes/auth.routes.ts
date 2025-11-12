import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { asyncHandler } from '../../../utils/async-handler';

const router = Router();
const controller = new AuthController();

router.post('/login', asyncHandler((req, res) => controller.login(req, res)));
router.post('/logout', authMiddleware, asyncHandler((req, res) => controller.logout(req, res)));
router.post('/logout-all', authMiddleware, asyncHandler((req, res) => controller.logoutAll(req, res)));
router.post('/refresh', asyncHandler((req, res) => controller.refreshToken(req, res)));

export default router;

