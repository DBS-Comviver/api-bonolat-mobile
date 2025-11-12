import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { asyncHandler } from '../../../utils/async-handler';

const router = Router();
const controller = new UserController();

router.post('/', asyncHandler((req, res) => controller.create(req, res)));

router.get('/', authMiddleware, asyncHandler((req, res) => controller.list(req, res)));
router.get('/:id', authMiddleware, asyncHandler((req, res) => controller.getById(req, res)));
router.put('/:id', authMiddleware, asyncHandler((req, res) => controller.update(req, res)));
router.delete('/:id', authMiddleware, asyncHandler((req, res) => controller.delete(req, res)));

export default router;