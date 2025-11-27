import { Request, Response } from 'express';
import { FractioningController } from '../../../src/modules/fractioning/controllers/fractioning.controller';
import { FractioningService } from '../../../src/modules/fractioning/services/fractioning.service';
import { AuthRequest } from '../../../src/middlewares/auth.middleware';
import { ForbiddenError } from '../../../src/utils/errors';
import { PermissionRepository } from '../../../src/modules/auth/repositories/permission.repository';

// Mock dependencies
jest.mock('../../../src/modules/fractioning/services/fractioning.service');
jest.mock('../../../src/modules/auth/repositories/permission.repository');
jest.mock('../../../src/config/logger', () => ({
	logger: {
		debug: jest.fn(),
		info: jest.fn(),
		error: jest.fn(),
	},
}));

describe('FractioningController', () => {
	let controller: FractioningController;
	let mockFractioningService: jest.Mocked<FractioningService>;
	let mockPermissionRepository: jest.Mocked<PermissionRepository>;
	let mockRequest: Partial<AuthRequest>;
	let mockResponse: Partial<Response>;

	beforeEach(() => {
		controller = new FractioningController();
		mockFractioningService = FractioningService as jest.MockedClass<typeof FractioningService>;
		mockPermissionRepository = PermissionRepository as jest.MockedClass<typeof PermissionRepository>;

		mockRequest = {
			user: {
				id: 1,
				login: 'testuser',
				username: 'testuser',
				email: 'test@example.com',
				name: 'Test User',
			},
			query: {},
			body: {},
		};

		mockResponse = {
			json: jest.fn().mockReturnThis(),
			status: jest.fn().mockReturnThis(),
		};

		// Mock permission check
		(mockPermissionRepository.prototype.hasFractioningAccess as jest.Mock) = jest
			.fn()
			.mockResolvedValue(true);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('listOrders', () => {
		it('should return orders for authenticated user', async () => {
			const mockOrders = [
				{ label: 'OP-1547', value: '1547' },
				{ label: 'OP-2202', value: '2202' },
			];

			(mockFractioningService.prototype.listOrders as jest.Mock) = jest
				.fn()
				.mockResolvedValue(mockOrders);

			mockRequest.query = {};

			await controller.listOrders(mockRequest as AuthRequest, mockResponse as Response);

			expect(mockFractioningService.prototype.listOrders).toHaveBeenCalledWith('testuser');
			expect(mockResponse.json).toHaveBeenCalledWith({ ordens: mockOrders });
		});

		it('should throw ForbiddenError if user lacks access', async () => {
			(mockPermissionRepository.prototype.hasFractioningAccess as jest.Mock) = jest
				.fn()
				.mockResolvedValue(false);

			await expect(
				controller.listOrders(mockRequest as AuthRequest, mockResponse as Response)
			).rejects.toThrow(ForbiddenError);
		});
	});

	describe('listBateladas', () => {
		it('should return bateladas for authenticated user', async () => {
			const mockBateladas = [
				{ label: 'BAT-001', value: 'BAT-001' },
				{ label: 'BAT-002', value: 'BAT-002' },
			];

			(mockFractioningService.prototype.listBateladas as jest.Mock) = jest
				.fn()
				.mockResolvedValue(mockBateladas);

			mockRequest.query = { ordem_producao: '1547' };

			await controller.listBateladas(mockRequest as AuthRequest, mockResponse as Response);

			expect(mockFractioningService.prototype.listBateladas).toHaveBeenCalledWith(
				'testuser',
				'1547'
			);
			expect(mockResponse.json).toHaveBeenCalledWith({ bateladas: mockBateladas });
		});

		it('should return bateladas without ordem_producao filter', async () => {
			const mockBateladas = [{ label: 'BAT-001', value: 'BAT-001' }];

			(mockFractioningService.prototype.listBateladas as jest.Mock) = jest
				.fn()
				.mockResolvedValue(mockBateladas);

			mockRequest.query = {};

			await controller.listBateladas(mockRequest as AuthRequest, mockResponse as Response);

			expect(mockFractioningService.prototype.listBateladas).toHaveBeenCalledWith(
				'testuser',
				undefined
			);
		});
	});

	describe('searchBoxes', () => {
		it('should search boxes by ordem_producao and batelada', async () => {
			const mockBoxes = [
				{
					box_code: '15478788',
					box_description: 'CAIXA TESTE',
					lote: '67248',
					ordem_producao: '1547',
					batelada: 'BAT-001',
				},
			];

			(mockFractioningService.prototype.searchBoxes as jest.Mock) = jest
				.fn()
				.mockResolvedValue(mockBoxes);

			mockRequest.query = { ordem_producao: '1547', batelada: 'BAT-001' };

			await controller.searchBoxes(mockRequest as AuthRequest, mockResponse as Response);

			expect(mockFractioningService.prototype.searchBoxes).toHaveBeenCalledWith({
				ordem_producao: '1547',
				batelada: 'BAT-001',
			});
			expect(mockResponse.json).toHaveBeenCalledWith(mockBoxes);
		});
	});

	describe('getBoxMaterials', () => {
		it('should return box materials', async () => {
			const mockMaterials = {
				box_code: '15478788',
				materials: [
					{
						it_codigo: 'CONC-UVA-001',
						desc_item: 'CONCENTRADO DE UVA TINTO 1L',
						quantidade: 25.0,
						lote: '67248',
						data_fabricacao: '20/10/2025',
					},
				],
			};

			(mockFractioningService.prototype.getBoxMaterials as jest.Mock) = jest
				.fn()
				.mockResolvedValue(mockMaterials);

			mockRequest.query = { box_code: '15478788' };

			await controller.getBoxMaterials(mockRequest as AuthRequest, mockResponse as Response);

			expect(mockFractioningService.prototype.getBoxMaterials).toHaveBeenCalledWith({
				box_code: '15478788',
			});
			expect(mockResponse.json).toHaveBeenCalledWith(mockMaterials);
		});
	});

	describe('printLabels', () => {
		it('should generate print label', async () => {
			const mockLabel = {
				success: true,
				label: '^XA\n^FO30,40^FD Batelada: BAT-001 OP: 1547 ^FS\n^XZ',
			};

			(mockFractioningService.prototype.buildPrintLabel as jest.Mock) = jest
				.fn()
				.mockResolvedValue(mockLabel);

			mockRequest.body = {
				cod_estabel: '2202',
				cod_deposito: 'SIL',
				cod_local: 'LOC001',
				box_code: '15478788',
				ordem_producao: '1547',
				batelada: 'BAT-001',
				quantidade: 1,
			};

			await controller.printLabels(mockRequest as AuthRequest, mockResponse as Response);

			expect(mockFractioningService.prototype.buildPrintLabel).toHaveBeenCalledWith(
				mockRequest.body
			);
			expect(mockResponse.json).toHaveBeenCalledWith(mockLabel);
		});
	});

	describe('finalizeFractioning', () => {
		it('should finalize fractioning with ordem_producao and batelada', async () => {
			const mockResponse = {
				desc_erro: 'OK - O ITEM FOI ADICIONADO AO ESTOQUE!',
			};

			(mockFractioningService.prototype.finalizeFractioning as jest.Mock) = jest
				.fn()
				.mockResolvedValue(mockResponse);

			mockRequest.body = {
				cod_estabel: '2202',
				it_codigo: '3066865',
				cod_deposito: 'SIL',
				cod_local: 'LOC001',
				cod_lote: '67248',
				quantidade: 100.5,
				dados_baixa: 'CONC-UVA-001,25.0,67248,20/10/2025,17/12/2025',
				ordem_producao: '1547',
				batelada: 'BAT-001',
			};

			await controller.finalizeFractioning(mockRequest as AuthRequest, mockResponse as Response);

			expect(mockFractioningService.prototype.finalizeFractioning).toHaveBeenCalledWith(
				mockRequest.body,
				'testuser'
			);
			expect(mockResponse.json).toHaveBeenCalledWith(mockResponse);
		});
	});
});


