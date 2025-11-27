import { FractioningSqlService } from '../../../src/modules/fractioning/services/sql.service';
import { prisma } from '../../../src/config/database';

describe('FractioningSqlService', () => {
	let sqlService: FractioningSqlService;

	beforeEach(() => {
		sqlService = new FractioningSqlService();
	});

	afterEach(async () => {
		await prisma.dbsFrLotesItensCaixa.deleteMany();
		await prisma.dbsFrItensCaixa.deleteMany();
		await prisma.dbsFrCaixas.deleteMany();
	});

	describe('saveBox', () => {
		it('should save box with items and lots correctly', async () => {
			const payload = {
				cod_estabel: '2202',
				cod_deposito: 'SIL',
				cod_local: 'LOC001',
				it_codigo: '3066865',
				desc_item: 'CAIXA CONCENTRADO DE UVA',
				cod_lote: '67248',
				quantidade: 100.5,
				dados_baixa: 'CONC-UVA-001,25.0,67248,20/10/2025,17/12/2025;CONC-UVA-002,30.0,66747,31/12/2999,31/12/2999',
				ordem_producao: '1547',
				batelada: 'BAT-001',
				usuario: 'testuser',
			};

			const result = await sqlService.saveBox(payload);

			expect(result).toBeDefined();
			expect(result.cod_estabel).toBe('2202');
			expect(result.ordem_prod).toBe(1547);
			expect(result.batalada).toBe('BAT-001');

			const savedBox = await prisma.dbsFrCaixas.findUnique({
				where: { cod_caixa: result.cod_caixa },
				include: {
					itens: {
						include: { lotes: true },
					},
				},
			});

			expect(savedBox).toBeDefined();
			expect(savedBox?.itens).toHaveLength(2);
			expect(savedBox?.itens[0].lotes).toHaveLength(1);
		});

		it('should handle ordem_producao as string number', async () => {
			const payload = {
				cod_estabel: '2202',
				cod_deposito: 'SIL',
				cod_local: 'LOC001',
				it_codigo: '3066865',
				desc_item: 'CAIXA TESTE',
				cod_lote: '67248',
				quantidade: 100.5,
				dados_baixa: 'CONC-UVA-001,25.0,67248,20/10/2025,17/12/2025',
				ordem_producao: 'OP-1547',
				batelada: 'BAT-001',
				usuario: 'testuser',
			};

			const result = await sqlService.saveBox(payload);
			expect(result.ordem_prod).toBe(1547);
		});

		it('should handle missing ordem_producao and batelada', async () => {
			const payload = {
				cod_estabel: '2202',
				cod_deposito: 'SIL',
				cod_local: 'LOC001',
				it_codigo: '3066865',
				desc_item: 'CAIXA TESTE',
				cod_lote: '67248',
				quantidade: 100.5,
				dados_baixa: 'CONC-UVA-001,25.0,67248,20/10/2025,17/12/2025',
				usuario: 'testuser',
			};

			const result = await sqlService.saveBox(payload);
			expect(result.ordem_prod).toBeNull();
			expect(result.batalada).toBeNull();
		});
	});

	describe('listOrders', () => {
		it('should return orders for a user', async () => {
			await prisma.dbsFrCaixas.create({
				data: {
					cod_estabel: '2202',
					ordem_prod: 1547,
					batalada: 'BAT-001',
					usuario: 'testuser',
					it_codigo: '3066865',
					cod_deposito: 'SIL',
					cod_local: 'LOC001',
				},
			});

			await prisma.dbsFrCaixas.create({
				data: {
					cod_estabel: '2202',
					ordem_prod: 2202,
					batalada: 'BAT-002',
					usuario: 'testuser',
					it_codigo: '3066865',
					cod_deposito: 'SIL',
					cod_local: 'LOC001',
				},
			});

			const result = await sqlService.listOrders('testuser');

			expect(result).toBeDefined();
			expect(result.length).toBeGreaterThan(0);
			expect(result[0]).toHaveProperty('label');
			expect(result[0]).toHaveProperty('value');
			expect(result[0].label).toContain('OP-');
		});

		it('should return empty array for user with no orders', async () => {
			const result = await sqlService.listOrders('nonexistent');
			expect(result).toEqual([]);
		});
	});

	describe('listBateladas', () => {
		it('should return bateladas for a user', async () => {
			await prisma.dbsFrCaixas.create({
				data: {
					cod_estabel: '2202',
					ordem_prod: 1547,
					batalada: 'BAT-001',
					usuario: 'testuser',
					it_codigo: '3066865',
					cod_deposito: 'SIL',
					cod_local: 'LOC001',
				},
			});

			const result = await sqlService.listBateladas('testuser');

			expect(result).toBeDefined();
			expect(result.length).toBeGreaterThan(0);
			expect(result[0]).toHaveProperty('label');
			expect(result[0]).toHaveProperty('value');
		});

		it('should filter bateladas by ordem_producao', async () => {
			await prisma.dbsFrCaixas.create({
				data: {
					cod_estabel: '2202',
					ordem_prod: 1547,
					batalada: 'BAT-001',
					usuario: 'testuser',
					it_codigo: '3066865',
					cod_deposito: 'SIL',
					cod_local: 'LOC001',
				},
			});

			await prisma.dbsFrCaixas.create({
				data: {
					cod_estabel: '2202',
					ordem_prod: 2202,
					batalada: 'BAT-002',
					usuario: 'testuser',
					it_codigo: '3066865',
					cod_deposito: 'SIL',
					cod_local: 'LOC001',
				},
			});

			const result = await sqlService.listBateladas('testuser', '1547');

			expect(result).toBeDefined();
			expect(result.every((b) => b.value === 'BAT-001')).toBe(true);
		});
	});

	describe('searchBoxes', () => {
		it('should search boxes by ordem_producao', async () => {
			await prisma.dbsFrCaixas.create({
				data: {
					cod_estabel: '2202',
					ordem_prod: 1547,
					batalada: 'BAT-001',
					usuario: 'testuser',
					it_codigo: '3066865',
					cod_deposito: 'SIL',
					cod_local: 'LOC001',
					quantidade: 100.5,
				},
			});

			const result = await sqlService.searchBoxes({ ordem_producao: '1547' });

			expect(result).toBeDefined();
			expect(result.length).toBeGreaterThan(0);
			expect(result[0].ordem_producao).toBe('1547');
		});

		it('should search boxes by batelada', async () => {
			await prisma.dbsFrCaixas.create({
				data: {
					cod_estabel: '2202',
					ordem_prod: 1547,
					batalada: 'BAT-001',
					usuario: 'testuser',
					it_codigo: '3066865',
					cod_deposito: 'SIL',
					cod_local: 'LOC001',
					quantidade: 100.5,
				},
			});

			const result = await sqlService.searchBoxes({ batelada: 'BAT-001' });

			expect(result).toBeDefined();
			expect(result.length).toBeGreaterThan(0);
			expect(result[0].batelada).toBe('BAT-001');
		});

		it('should return empty array when no boxes match', async () => {
			const result = await sqlService.searchBoxes({ ordem_producao: '9999' });
			expect(result).toEqual([]);
		});
	});

	describe('getBoxMaterials', () => {
		it('should return materials for a box', async () => {
			const box = await prisma.dbsFrCaixas.create({
				data: {
					cod_estabel: '2202',
					ordem_prod: 1547,
					batalada: 'BAT-001',
					usuario: 'testuser',
					it_codigo: '3066865',
					cod_deposito: 'SIL',
					cod_local: 'LOC001',
					quantidade: 100.5,
				},
			});

			const item = await prisma.dbsFrItensCaixa.create({
				data: {
					cod_caixa: box.cod_caixa,
					it_codigo: 'CONC-UVA-001',
					desc_item: 'CONCENTRADO DE UVA TINTO 1L',
					quantidade: 25.0,
				},
			});

			await prisma.dbsFrLotesItensCaixa.create({
				data: {
					cod_item_caixa: item.cod_item_caixa,
					cod_lote: '67248',
					data_fabricacao: new Date('2025-10-20'),
					quantidade: 25.0,
				},
			});

			const result = await sqlService.getBoxMaterials(box.cod_caixa.toString());

			expect(result).toBeDefined();
			expect(result.box_code).toBe(box.cod_caixa.toString());
			expect(result.materials).toBeDefined();
			expect(result.materials.length).toBeGreaterThan(0);
			expect(result.materials[0].it_codigo).toBe('CONC-UVA-001');
		});

		it('should return empty materials for invalid box code', async () => {
			const result = await sqlService.getBoxMaterials('invalid');
			expect(result.box_code).toBe('invalid');
			expect(result.materials).toEqual([]);
		});
	});
});


