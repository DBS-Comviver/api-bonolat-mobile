import { Response } from 'express';
import { FractioningService } from '../services/fractioning.service';
import { AuthRequest } from '../../../middlewares/auth.middleware';
import {
	getItemSchema,
	getDepositsSchema,
	getLocationsSchema,
	getBatchesSchema,
	getBoxReturnSchema,
	finalizeFractioningSchema,
	searchBoxesSchema,
	getBoxMaterialsSchema,
	printLabelSchema,
	listOrdersSchema,
	listBateladasSchema,
} from '../dtos/fractioning.dto';
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

	private validateUser(req: AuthRequest): string {
		if (!req.user) {
			throw new UnauthorizedError('Unauthorized');
		}
		return req.user.login;
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
		const login = this.validateUser(req);
		await this.validateFractioningAccess(login);

		const body = getItemSchema.parse(req.query);
		const result = await fractioningService.getItem(body, login);
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
	 *         example: "2202"
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
		const login = this.validateUser(req);
		await this.validateFractioningAccess(login);

		const body = getDepositsSchema.parse(req.query);
		const result = await fractioningService.getDeposits(body, login);
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
	 *         example: "2202"
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
		const login = this.validateUser(req);
		await this.validateFractioningAccess(login);

		const body = getLocationsSchema.parse(req.query);
		const result = await fractioningService.getLocations(body, login);
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
	 *         example: "2202"
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
	 *         example: "LOC001"
	 *     responses:
	 *       200:
	 *         description: Batch information
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 lote:
	 *                   type: string
	 *                   example: "67248"
	 *                 dt_lote:
	 *                   type: string
	 *                   example: "24/10/2025"
	 *       401:
	 *         description: Unauthorized
	 *       403:
	 *         description: Access denied to fractioning module
	 */
	async getBatches(req: AuthRequest, res: Response) {
		const login = this.validateUser(req);
		await this.validateFractioningAccess(login);

		const body = getBatchesSchema.parse(req.query);
		const result = await fractioningService.getBatches(body, login);
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
	 *         example: "2202"
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
		const login = this.validateUser(req);
		await this.validateFractioningAccess(login);

		const body = getBoxReturnSchema.parse(req.query);
		const result = await fractioningService.getBoxReturn(body, login);
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
	 *               - dados_baixa
	 *             properties:
	 *               cod_estabel:
	 *                 type: string
	 *                 example: "2202"
	 *               it_codigo:
	 *                 type: string
	 *                 description: "Box item code"
	 *                 example: "3066865"
	 *               cod_deposito:
	 *                 type: string
	 *                 example: "SIL"
	 *               cod_local:
	 *                 type: string
	 *                 example: "LOC001"
	 *               cod_lote:
	 *                 type: string
	 *                 example: "67248"
	 *               quantidade:
	 *                 type: number
	 *                 example: 1
	 *               dados_baixa:
	 *                 type: string
	 *                 description: "Items data in format: Item,Quantity,Lot,ManufacturingDate,ValidityDate;Item2,Quantity2,Lot2,ManufacturingDate2,ValidityDate2"
	 *                 example: "CONC-UVA-001,25.0,67248,20/10/2025,17/12/2025;CONC-UVA-002,30.0,66747,31/12/2999,31/12/2999"
	 *               ordem_producao:
	 *                 type: string
	 *                 description: "Production order associated with the finalization"
	 *                 example: "12345"
	 *               batelada:
	 *                 type: string
	 *                 description: "Batch identifier linked to the finalization"
	 *                 example: "BAT001"
	 *     responses:
	 *       200:
	 *         description: Fractioning finalized successfully
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 total:
	 *                   type: number
	 *                   example: 1
	 *                 hasNext:
	 *                   type: boolean
	 *                   example: false
	 *                 items:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       mensagem:
	 *                         type: string
	 *                         example: "OK - O ITEM FOI ADICIONADO AO ESTOQUE!"
	 *                       it_codigo:
	 *                         type: string
	 *                         example: "3037854"
	 *                       desc_item:
	 *                         type: string
	 *                         example: "ITEM DESCRIÇÃO"
	 *                       quant_usada:
	 *                         type: number
	 *                         example: 0
	 *       401:
	 *         description: Unauthorized
	 *       403:
	 *         description: Access denied to fractioning module
	 */
	async finalizeFractioning(req: AuthRequest, res: Response) {
		this.validateUser(req);
		await this.validateFractioningAccess(req.user!.login);

		const body = finalizeFractioningSchema.parse(req.body);
		const login = this.validateUser(req);
		const result = await fractioningService.finalizeFractioning(body, login);
		return res.json(result);
	}

	/**
	 * @swagger
	 * /api/fractioning/op-search:
	 *   get:
	 *     summary: Search boxes by production order and/or batch
	 *     tags: [Fractioning]
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: query
	 *         name: ordem_producao
	 *         required: false
	 *         schema:
	 *           type: string
	 *         example: "12345"
	 *         description: "Production order code (optional)"
	 *       - in: query
	 *         name: batelada
	 *         required: false
	 *         schema:
	 *           type: string
	 *         example: "BAT001"
	 *         description: "Batch identifier (optional)"
	 *     responses:
	 *       200:
	 *         description: List of boxes matching the filters
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: array
	 *               items:
	 *                 type: object
	 *                 properties:
	 *                   box_code:
	 *                     type: string
	 *                     example: "CAIXA001"
	 *                   box_description:
	 *                     type: string
	 *                     example: "Caixa de Fracionamento"
	 *                   lote:
	 *                     type: string
	 *                     example: "67248"
	 *                   data_lote:
	 *                     type: string
	 *                     example: "24/10/2025"
	 *                   quantidade:
	 *                     type: number
	 *                     example: 100.5
	 *                   ordem_producao:
	 *                     type: string
	 *                     example: "12345"
	 *                   batelada:
	 *                     type: string
	 *                     example: "BAT001"
	 *                   cod_estabel:
	 *                     type: string
	 *                     example: "2202"
	 *                   cod_deposito:
	 *                     type: string
	 *                     example: "SIL"
	 *                   cod_local:
	 *                     type: string
	 *                     example: "LOC001"
	 *       400:
	 *         description: At least one filter (ordem_producao or batelada) must be provided
	 *       401:
	 *         description: Unauthorized
	 *       403:
	 *         description: Access denied to fractioning module
	 */
	async searchBoxes(req: AuthRequest, res: Response) {
		this.validateUser(req);
		await this.validateFractioningAccess(req.user!.login);

		const body = searchBoxesSchema.parse(req.query);
		const result = await fractioningService.searchBoxes(body);
		return res.json(result);
	}

	/**
	 * @swagger
	 * /api/fractioning/box-items:
	 *   get:
	 *     summary: Get all materials (raw materials) from a specific box
	 *     tags: [Fractioning]
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: query
	 *         name: box_code
	 *         required: true
	 *         schema:
	 *           type: string
	 *         example: "CAIXA001"
	 *         description: "Box code"
	 *     responses:
	 *       200:
	 *         description: Box materials information
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 box_code:
	 *                   type: string
	 *                   example: "CAIXA001"
	 *                 materials:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       it_codigo:
	 *                         type: string
	 *                         example: "00554-8"
	 *                       desc_item:
	 *                         type: string
	 *                         example: "LEITE UHT INTEGRAL 1L"
	 *                       quantidade:
	 *                         type: number
	 *                         example: 25.5
	 *                       lote:
	 *                         type: string
	 *                         example: "67248"
	 *                       data_fabricacao:
	 *                         type: string
	 *                         example: "20/10/2025"
	 *                       validade:
	 *                         type: string
	 *                         example: "17/12/2025"
	 *                       rastreabilidade:
	 *                         type: string
	 *                         example: "Rastreabilidade info"
	 *       401:
	 *         description: Unauthorized
	 *       403:
	 *         description: Access denied to fractioning module
	 *       404:
	 *         description: Box not found
	 */
	async getBoxMaterials(req: AuthRequest, res: Response) {
		this.validateUser(req);
		await this.validateFractioningAccess(req.user!.login);

		const body = getBoxMaterialsSchema.parse(req.query);
		const result = await fractioningService.getBoxMaterials(body);
		return res.json(result);
	}

	/**
	 * @swagger
	 * /api/fractioning/print-labels:
	 *   post:
	 *     summary: Generate ZPL code for printing box labels
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
	 *               - cod_deposito
	 *               - cod_local
	 *               - box_code
	 *               - quantidade
	 *             properties:
	 *               cod_estabel:
	 *                 type: string
	 *                 example: "2202"
	 *               cod_deposito:
	 *                 type: string
	 *                 example: "SIL"
	 *               cod_local:
	 *                 type: string
	 *                 example: "LOC001"
	 *               box_code:
	 *                 type: string
	 *                 example: "CAIXA001"
	 *               ordem_producao:
	 *                 type: string
	 *                 example: "12345"
	 *                 description: "Production order (optional)"
	 *               batelada:
	 *                 type: string
	 *                 example: "BAT001"
	 *                 description: "Batch identifier (optional)"
	 *               quantidade:
	 *                 type: number
	 *                 example: 1
	 *                 description: "Number of labels to print"
	 *     responses:
	 *       200:
	 *         description: ZPL file for label printing
	 *         content:
	 *           application/zpl:
	 *             schema:
	 *               type: string
	 *               example: "^XA^CF0,40^FO30,40^FD...^XZ"
	 *         headers:
	 *           Content-Disposition:
	 *             schema:
	 *               type: string
	 *               example: "attachment; filename=\"etiqueta_CAIXA001_1234567890.zpl\""
	 *       401:
	 *         description: Unauthorized
	 *       403:
	 *         description: Access denied to fractioning module
	 *       404:
	 *         description: Box not found
	 */
	async printLabels(req: AuthRequest, res: Response) {
		this.validateUser(req);
		await this.validateFractioningAccess(req.user!.login);

		const body = printLabelSchema.parse(req.body);
		const zplCode = await fractioningService.buildPrintLabel(body);

		const filename = `etiqueta_${body.box_code}_${Date.now()}.zpl`;

		res.setHeader('Content-Type', 'application/zpl');
		res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
		return res.send(zplCode);
	}

	/**
	 * @swagger
	 * /api/fractioning/op-orders:
	 *   get:
	 *     summary: List all production orders for the logged-in user
	 *     tags: [Fractioning]
	 *     security:
	 *       - bearerAuth: []
	 *     responses:
	 *       200:
	 *         description: List of production orders
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 ordens:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       label:
	 *                         type: string
	 *                         example: "OP 12345"
	 *                       value:
	 *                         type: string
	 *                         example: "12345"
	 *       401:
	 *         description: Unauthorized
	 *       403:
	 *         description: Access denied to fractioning module
	 */
	async listOrders(req: AuthRequest, res: Response) {
		this.validateUser(req);
		await this.validateFractioningAccess(req.user!.login);

		listOrdersSchema.parse(req.query);
		const login = this.validateUser(req);
		const result = await fractioningService.listOrders(login);
		return res.json({ ordens: result });
	}

	/**
	 * @swagger
	 * /api/fractioning/op-bateladas:
	 *   get:
	 *     summary: List batches for the logged-in user, optionally filtered by production order
	 *     tags: [Fractioning]
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: query
	 *         name: ordem_producao
	 *         required: false
	 *         schema:
	 *           type: string
	 *         example: "12345"
	 *         description: "Production order code to filter batches (optional)"
	 *     responses:
	 *       200:
	 *         description: List of batches
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 bateladas:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       label:
	 *                         type: string
	 *                         example: "BAT001"
	 *                       value:
	 *                         type: string
	 *                         example: "BAT001"
	 *       401:
	 *         description: Unauthorized
	 *       403:
	 *         description: Access denied to fractioning module
	 */
	async listBateladas(req: AuthRequest, res: Response) {
		this.validateUser(req);
		await this.validateFractioningAccess(req.user!.login);

		const body = listBateladasSchema.parse(req.query);
		const login = this.validateUser(req);
		const result = await fractioningService.listBateladas(login, body.ordem_producao);
		return res.json({ bateladas: result });
	}
}