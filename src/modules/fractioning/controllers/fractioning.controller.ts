import { Request, Response } from 'express';
import { FractioningService } from '../services/fractioning.service';
import { AuthRequest } from '../../../middlewares/auth.middleware';
import { getItemSchema, getDepositsSchema, getLocationsSchema, getBatchesSchema, getBoxReturnSchema, finalizeFractioningSchema } from '../dtos/fractioning.dto';
import { UnauthorizedError, ForbiddenError } from '../../../utils/errors';
import { PermissionRepository } from '../../auth/repositories/permission.repository';

const fractioningService = new FractioningService();
const permissionRepository = new PermissionRepository();

export class FractioningController {
	private async validateFractioningAccess(login: string): Promise<void> {
		const hasAccess = await permissionRepository.hasFractioningAccess(login);
		if (!hasAccess) {
			throw new ForbiddenError('Access denied to fractioning module');
		}
	}

	/**
	 * @swagger
	 * /api/fractioning/item:
	 *   get:
	 *     summary: Get item information
	 *     tags: [Fractioning]
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: query
	 *         name: it_codigo
	 *         required: true
	 *         schema:
	 *           type: string
	 *         example: "00554-8"
	 *     responses:
	 *       200:
	 *         description: Item information
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 it_codigo:
	 *                   type: string
	 *                 desc_item:
	 *                   type: string
	 *       401:
	 *         description: Unauthorized
	 *       403:
	 *         description: Access denied to fractioning module
	 */
	async getItem(req: AuthRequest, res: Response) {
		if (!req.user) {
			throw new UnauthorizedError('Unauthorized');
		}

		await this.validateFractioningAccess(req.user.login);

		const body = getItemSchema.parse(req.query);
		const result = await fractioningService.getItem(body);
		return res.json(result);
	}

	/**
	 * @swagger
	 * /api/fractioning/deposits:
	 *   get:
	 *     summary: Get deposits list
	 *     tags: [Fractioning]
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: query
	 *         name: cod_estabel
	 *         required: true
	 *         schema:
	 *           type: string
	 *         example: "2201"
	 *       - in: query
	 *         name: it_codigo
	 *         required: true
	 *         schema:
	 *           type: string
	 *         example: "00554-8"
	 *     responses:
	 *       200:
	 *         description: Deposits list
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: array
	 *               items:
	 *                 type: object
	 *                 properties:
	 *                   cod_depos:
	 *                     type: string
	 *                   nome:
	 *                     type: string
	 *       401:
	 *         description: Unauthorized
	 *       403:
	 *         description: Access denied to fractioning module
	 */
	async getDeposits(req: AuthRequest, res: Response) {
		if (!req.user) {
			throw new UnauthorizedError('Unauthorized');
		}

		await this.validateFractioningAccess(req.user.login);

		const body = getDepositsSchema.parse(req.query);
		const result = await fractioningService.getDeposits(body);
		return res.json(result);
	}

	/**
	 * @swagger
	 * /api/fractioning/locations:
	 *   get:
	 *     summary: Get locations list
	 *     tags: [Fractioning]
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: query
	 *         name: cod_estabel
	 *         required: true
	 *         schema:
	 *           type: string
	 *         example: "2201"
	 *       - in: query
	 *         name: it_codigo
	 *         required: true
	 *         schema:
	 *           type: string
	 *         example: "00554-8"
	 *       - in: query
	 *         name: cod_deposito
	 *         required: true
	 *         schema:
	 *           type: string
	 *         example: "SIL"
	 *     responses:
	 *       200:
	 *         description: Locations list
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: array
	 *               items:
	 *                 type: object
	 *                 properties:
	 *                   cod_local:
	 *                     type: string
	 *                   nome:
	 *                     type: string
	 *       401:
	 *         description: Unauthorized
	 *       403:
	 *         description: Access denied to fractioning module
	 */
	async getLocations(req: AuthRequest, res: Response) {
		if (!req.user) {
			throw new UnauthorizedError('Unauthorized');
		}

		await this.validateFractioningAccess(req.user.login);

		const body = getLocationsSchema.parse(req.query);
		const result = await fractioningService.getLocations(body);
		return res.json(result);
	}

	/**
	 * @swagger
	 * /api/fractioning/batches:
	 *   get:
	 *     summary: Get batches list
	 *     tags: [Fractioning]
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: query
	 *         name: cod_estabel
	 *         required: true
	 *         schema:
	 *           type: string
	 *         example: "2201"
	 *       - in: query
	 *         name: it_codigo
	 *         required: true
	 *         schema:
	 *           type: string
	 *         example: "00554-8"
	 *       - in: query
	 *         name: cod_deposito
	 *         required: true
	 *         schema:
	 *           type: string
	 *         example: "SIL"
	 *     responses:
	 *       200:
	 *         description: Batches list
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: array
	 *               items:
	 *                 type: object
	 *                 properties:
	 *                   lote:
	 *                     type: string
	 *                   dt_lote:
	 *                     type: string
	 *       401:
	 *         description: Unauthorized
	 *       403:
	 *         description: Access denied to fractioning module
	 */
	async getBatches(req: AuthRequest, res: Response) {
		if (!req.user) {
			throw new UnauthorizedError('Unauthorized');
		}

		await this.validateFractioningAccess(req.user.login);

		const body = getBatchesSchema.parse(req.query);
		const result = await fractioningService.getBatches(body);
		return res.json(result);
	}

	/**
	 * @swagger
	 * /api/fractioning/box-return:
	 *   get:
	 *     summary: Get box return information
	 *     tags: [Fractioning]
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: query
	 *         name: cod_estabel
	 *         required: true
	 *         schema:
	 *           type: string
	 *         example: "2201"
	 *       - in: query
	 *         name: it_codigo
	 *         required: true
	 *         schema:
	 *           type: string
	 *         example: "00554-8"
	 *       - in: query
	 *         name: cod_deposito
	 *         required: true
	 *         schema:
	 *           type: string
	 *         example: "SIL"
	 *       - in: query
	 *         name: cod_local
	 *         required: true
	 *         schema:
	 *           type: string
	 *         example: "SIL"
	 *       - in: query
	 *         name: cod_lote
	 *         required: true
	 *         schema:
	 *           type: string
	 *         example: "67248"
	 *       - in: query
	 *         name: quantidade
	 *         required: true
	 *         schema:
	 *           type: number
	 *         example: 1
	 *     responses:
	 *       200:
	 *         description: Box return information
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 it_codigo:
	 *                   type: string
	 *                 desc_item:
	 *                   type: string
	 *                 quant_usada:
	 *                   type: string
	 *                 mensagem:
	 *                   type: string
	 *       401:
	 *         description: Unauthorized
	 *       403:
	 *         description: Access denied to fractioning module
	 */
	async getBoxReturn(req: AuthRequest, res: Response) {
		if (!req.user) {
			throw new UnauthorizedError('Unauthorized');
		}

		await this.validateFractioningAccess(req.user.login);

		const body = getBoxReturnSchema.parse(req.query);
		const result = await fractioningService.getBoxReturn(body);
		return res.json(result);
	}

	/**
	 * @swagger
	 * /api/fractioning/finalize:
	 *   post:
	 *     summary: Finalize fractioning process
	 *     tags: [Fractioning]
	 *     security:
	 *       - bearerAuth: []
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             required:
	 *               - cod_estabel
	 *               - it_codigo
	 *               - cod_deposito
	 *               - cod_local
	 *               - cod_lote
	 *               - quantidade
	 *               - validade
	 *               - data_lote
	 *             properties:
	 *               cod_estabel:
	 *                 type: string
	 *                 example: "2201"
	 *               it_codigo:
	 *                 type: string
	 *                 example: "00554-8"
	 *               cod_deposito:
	 *                 type: string
	 *                 example: "SIL"
	 *               cod_local:
	 *                 type: string
	 *                 example: "SIL"
	 *               cod_lote:
	 *                 type: string
	 *                 example: "67248"
	 *               quantidade:
	 *                 type: number
	 *                 example: 1
	 *               validade:
	 *                 type: string
	 *                 example: "20/10/2027"
	 *               data_lote:
	 *                 type: string
	 *                 example: "20/10/2025"
	 *     responses:
	 *       200:
	 *         description: Fractioning finalized successfully
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 desc_erro:
	 *                   type: string
	 *                   example: "OK - O ITEM FOI ADICIONADO AO ESTOQUE!"
	 *       401:
	 *         description: Unauthorized
	 *       403:
	 *         description: Access denied to fractioning module
	 */
	async finalizeFractioning(req: AuthRequest, res: Response) {
		if (!req.user) {
			throw new UnauthorizedError('Unauthorized');
		}

		await this.validateFractioningAccess(req.user.login);

		const body = finalizeFractioningSchema.parse(req.body);
		const result = await fractioningService.finalizeFractioning(body);
		return res.json(result);
	}
}

