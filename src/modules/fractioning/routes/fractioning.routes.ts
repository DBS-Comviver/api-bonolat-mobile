import { Router } from 'express';
import { FractioningController } from '../controllers/fractioning.controller';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { asyncHandler } from '../../../utils/async-handler';

const router = Router();
const controller = new FractioningController();

router.get('/item', authMiddleware, asyncHandler((req, res) => controller.getItem(req, res)));
router.get('/deposits', authMiddleware, asyncHandler((req, res) => controller.getDeposits(req, res)));
router.get('/locations', authMiddleware, asyncHandler((req, res) => controller.getLocations(req, res)));
router.get('/batches', authMiddleware, asyncHandler((req, res) => controller.getBatches(req, res)));
router.get('/box-return', authMiddleware, asyncHandler((req, res) => controller.getBoxReturn(req, res)));
router.post('/finalize', authMiddleware, asyncHandler((req, res) => controller.finalizeFractioning(req, res)));

export default router;


