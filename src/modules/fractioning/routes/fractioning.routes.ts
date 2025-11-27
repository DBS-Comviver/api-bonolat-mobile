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
router.get('/op-search', authMiddleware, asyncHandler((req, res) => controller.searchBoxes(req, res)));
router.get('/box-items', authMiddleware, asyncHandler((req, res) => controller.getBoxMaterials(req, res)));
router.post('/print-labels', authMiddleware, asyncHandler((req, res) => controller.printLabels(req, res)));
router.get('/op-orders', authMiddleware, asyncHandler((req, res) => controller.listOrders(req, res)));
router.get('/op-bateladas', authMiddleware, asyncHandler((req, res) => controller.listBateladas(req, res)));

export default router;