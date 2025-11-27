import { FractioningService } from '../../../src/modules/fractioning/services/fractioning.service';
import { FractioningSqlService } from '../../../src/modules/fractioning/services/sql.service';
import { TotvsService } from '../../../src/services/totvs.service';
import { prisma } from '../../../src/config/database';

jest.mock('../../../src/services/totvs.service');
jest.mock('../../../src/config/logger', () => ({
	logger: {
		debug: jest.fn(),
		info: jest.fn(),
		error: jest.fn(),
	},
}));

describe('FractioningService', () => {
	let fractioningService: FractioningService;
	let mockTotvsService: jest.Mocked<TotvsService>;
	let sqlService: FractioningSqlService;

	beforeEach(() => {
		fractioningService = new FractioningService();
		mockTotvsService = TotvsService as jest.MockedClass<typeof TotvsService>;
		sqlService = new FractioningSqlService();
	});

	afterEach(async () => {
		await prisma.dbsFrLotesItensCaixa.deleteMany();
		await prisma.dbsFrItensCaixa.deleteMany();
		await prisma.dbsFrCaixas.deleteMany();
		jest.clearAllMocks();
	});

	describe('finalizeFractioning', () => {
		it('should call TotvsService and save to SQL', async () => {
			const mockTotvsResponse = {
				desc_erro: 'OK - O ITEM FOI ADICIONADO AO ESTOQUE!',
			};

			const instance = new TotvsService();
			(instance.finalizeFractioning as jest.Mock) = jest.fn().mockResolvedValue(mockTotvsResponse);

			// Mock the constructor to return our instance
			(TotvsService as jest.MockedClass<typeof TotvsService>).mockImplementation(() => instance);

			const data = {
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

			const result = await fractioningService.finalizeFractioning(data, 'testuser');

			expect(result).toEqual(mockTotvsResponse);

			// Verify box was saved to SQL
			const savedBox = await prisma.dbsFrCaixas.findFirst({
				where: {
					cod_estabel: '2202',
					usuario: 'testuser',
				},
			});

			expect(savedBox).toBeDefined();
			expect(savedBox?.ordem_prod).toBe(1547);
			expect(savedBox?.batelada).toBe('BAT-001');
		});

		it('should handle missing ordem_producao and batelada', async () => {
			const mockTotvsResponse = {
				desc_erro: 'OK - O ITEM FOI ADICIONADO AO ESTOQUE!',
			};

			const instance = new TotvsService();
			(instance.finalizeFractioning as jest.Mock) = jest.fn().mockResolvedValue(mockTotvsResponse);
			(TotvsService as jest.MockedClass<typeof TotvsService>).mockImplementation(() => instance);

			const data = {
				cod_estabel: '2202',
				it_codigo: '3066865',
				cod_deposito: 'SIL',
				cod_local: 'LOC001',
				cod_lote: '67248',
				quantidade: 100.5,
				dados_baixa: 'CONC-UVA-001,25.0,67248,20/10/2025,17/12/2025',
			};

			const result = await fractioningService.finalizeFractioning(data, 'testuser');

			expect(result).toEqual(mockTotvsResponse);

			const savedBox = await prisma.dbsFrCaixas.findFirst({
				where: {
					cod_estabel: '2202',
					usuario: 'testuser',
				},
			});

			expect(savedBox).toBeDefined();
			expect(savedBox?.ordem_prod).toBeNull();
			expect(savedBox?.batelada).toBeNull();
		});
	});

	describe('searchBoxes', () => {
		it('should delegate to sqlService', async () => {
			await prisma.dbsFrCaixas.create({
				data: {
					cod_estabel: '2202',
					ordem_prod: 1547,
					batelada: 'BAT-001',
					usuario: 'testuser',
					it_codigo: '3066865',
					cod_deposito: 'SIL',
					cod_local: 'LOC001',
					quantidade: 100.5,
				},
			});

			const result = await fractioningService.searchBoxes({ ordem_producao: '1547' });

			expect(result).toBeDefined();
			expect(result.length).toBeGreaterThan(0);
		});
	});

	describe('getBoxMaterials', () => {
		it('should delegate to sqlService', async () => {
			const box = await prisma.dbsFrCaixas.create({
				data: {
					cod_estabel: '2202',
					ordem_prod: 1547,
					batelada: 'BAT-001',
					usuario: 'testuser',
					it_codigo: '3066865',
					cod_deposito: 'SIL',
					cod_local: 'LOC001',
					quantidade: 100.5,
				},
			});

			const result = await fractioningService.getBoxMaterials({ box_code: box.cod_caixa.toString() });

			expect(result).toBeDefined();
			expect(result.box_code).toBe(box.cod_caixa.toString());
		});
	});

	describe('listOrders', () => {
		it('should delegate to sqlService', async () => {
			await prisma.dbsFrCaixas.create({
				data: {
					cod_estabel: '2202',
					ordem_prod: 1547,
					batelada: 'BAT-001',
					usuario: 'testuser',
					it_codigo: '3066865',
					cod_deposito: 'SIL',
					cod_local: 'LOC001',
				},
			});

			const result = await fractioningService.listOrders('testuser');

			expect(result).toBeDefined();
			expect(result.length).toBeGreaterThan(0);
		});
	});

	describe('listBateladas', () => {
		it('should delegate to sqlService', async () => {
			await prisma.dbsFrCaixas.create({
				data: {
					cod_estabel: '2202',
					ordem_prod: 1547,
					batelada: 'BAT-001',
					usuario: 'testuser',
					it_codigo: '3066865',
					cod_deposito: 'SIL',
					cod_local: 'LOC001',
				},
			});

			const result = await fractioningService.listBateladas('testuser', '1547');

			expect(result).toBeDefined();
		});
	});

	describe('buildPrintLabel', () => {
		it('should generate ZPL label with batelada and OP', () => {
			const payload = {
				cod_estabel: '2202',
				cod_deposito: 'SIL',
				cod_local: 'LOC001',
				box_code: '3066865',
				ordem_producao: '1547',
				batelada: 'BAT-001',
				quantidade: 1,
			};

			const result = fractioningService.buildPrintLabel(payload);

			expect(result.success).toBe(true);
			expect(result.label).toBeDefined();
			expect(result.label).toContain('Batelada: BAT-001');
			expect(result.label).toContain('OP: 1547');
			expect(result.label).toContain('^XA');
			expect(result.label).toContain('^XZ');
		});

		it('should use default values when ordem_producao and batelada are missing', () => {
			const payload = {
				cod_estabel: '2202',
				cod_deposito: 'SIL',
				cod_local: 'LOC001',
				box_code: '3066865',
				quantidade: 1,
			};

			const result = fractioningService.buildPrintLabel(payload);

			expect(result.success).toBe(true);
			expect(result.label).toContain('Batelada: 00000');
			expect(result.label).toContain('OP: 00000');
		});
	});
});


