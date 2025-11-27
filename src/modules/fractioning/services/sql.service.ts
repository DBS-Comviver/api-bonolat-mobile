import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SaveBoxPayload {
	cod_estabel: string;
	cod_deposito: string;
	cod_local: string;
	it_codigo: string;
	desc_item?: string;
	cod_lote: string;
	quantidade: number;
	dados_baixa: string;
	ordem_producao?: string;
	batelada?: string;
	usuario?: string;
}

const parseDate = (value?: string): Date | null => {
	if (!value || !value.includes("/")) {
		return null;
	}

	const parts = value.split("/");
	if (parts.length !== 3) {
		return null;
	}

	const [day, month, year] = parts;
	return new Date(`${year}-${month}-${day}`);
};

const formatSimpleDate = (date: Date) => {
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = date.getFullYear();
	return `${day}/${month}/${year}`;
};

const parseDetails = (dados: string) => {
	return dados
		.split(";")
		.map((segment) => {
			const [it_codigo, quantidade, cod_lote, data_fabricacao, validade] = segment
				.split(",")
				.map((value) => value?.trim());
			if (!it_codigo) return null;
			const parsedQty = quantidade ? parseFloat(quantidade.replace(",", ".")) : 0;
			return {
				it_codigo,
				quantidade: Number.isNaN(parsedQty) ? 0 : parsedQty,
				cod_lote: cod_lote || undefined,
				data_fabricacao: parseDate(data_fabricacao) || undefined,
				validade: parseDate(validade) || undefined,
			};
		})
		.filter((detail): detail is NonNullable<typeof detail> => !!detail && detail.quantidade > 0);
};

const toNumericOrder = (value?: string) => {
	if (!value) return null;
	const digits = value.replace(/[^\d]/g, "");
	const number = parseInt(digits || "", 10);
	return Number.isNaN(number) ? null : number;
};

export class FractioningSqlService {
	async saveBox(payload: SaveBoxPayload) {
		const detalhes = parseDetails(payload.dados_baixa);
		const ordem_prod = toNumericOrder(payload.ordem_producao);

		const box = await prisma.dbsFrCaixas.create({
			data: {
				cod_estabel: payload.cod_estabel,
				cod_deposito: payload.cod_deposito,
				cod_local: payload.cod_local,
				it_codigo: payload.it_codigo,
				desc_item: payload.desc_item ?? payload.it_codigo,
				cod_lote: payload.cod_lote,
				data_lote: detalhes[0]?.data_fabricacao ?? null,
				quantidade: payload.quantidade,
				ordem_prod,
				batelada: payload.batelada,
				usuario: payload.usuario,
				data_hora_fracionamento: new Date(),
			},
		});

		for (const detail of detalhes) {
			const item = await prisma.dbsFrItensCaixa.create({
				data: {
					cod_caixa: box.cod_caixa,
					it_codigo: detail.it_codigo,
					desc_item: detail.it_codigo,
					quantidade: detail.quantidade,
				},
			});

			await prisma.dbsFrLotesItensCaixa.create({
				data: {
					cod_item_caixa: item.cod_item_caixa,
					cod_lote: detail.cod_lote ?? "",
					data_fabricacao: detail.data_fabricacao ?? undefined,
					data_validade: detail.validade ?? undefined,
					quantidade: detail.quantidade,
				},
			});
		}

		return box;
	}

	async searchBoxes(filters: { ordem_producao?: string; batelada?: string }) {
		const orderNumber = toNumericOrder(filters.ordem_producao);
		const where: any = {};

		if (orderNumber !== null) {
			where.ordem_prod = orderNumber;
		}

		if (filters.batelada) {
			where.batelada = { contains: filters.batelada, mode: "insensitive" };
		}

		const boxes = await prisma.dbsFrCaixas.findMany({
			where,
			orderBy: { data_hora_fracionamento: "desc" },
		});

		return boxes.map((box) => ({
			box_code: box.cod_caixa.toString(),
			box_description: box.desc_item ?? box.it_codigo,
			lote: box.cod_lote,
			data_lote: box.data_lote ? formatSimpleDate(box.data_lote) : undefined,
			quantidade: Number(box.quantidade),
			cod_estabel: box.cod_estabel,
			cod_deposito: box.cod_deposito,
			cod_local: box.cod_local,
			ordem_producao: box.ordem_prod?.toString(),
			batelada: box.batelada ?? undefined,
		}));
	}

	async getBoxMaterials(boxCode: string) {
		const codCaixa = parseInt(boxCode, 10);
		if (Number.isNaN(codCaixa)) {
			return { box_code: boxCode, materials: [] };
		}

		const items = await prisma.dbsFrItensCaixa.findMany({
			where: { cod_caixa: codCaixa },
			include: { lotes: true },
		});

		const materials = items.flatMap((item) =>
			item.lotes.map((lote) => ({
				it_codigo: item.it_codigo ?? "",
				desc_item: item.desc_item ?? item.it_codigo ?? "",
				quantidade: Number(lote.quantidade),
				lote: lote.cod_lote ?? "",
				data_fabricacao: lote.data_fabricacao ? formatSimpleDate(lote.data_fabricacao) : undefined,
				validade: lote.data_validade ? formatSimpleDate(lote.data_validade) : undefined,
				rastreabilidade: undefined,
			}))
		);

		return {
			box_code: boxCode,
			materials,
		};
	}

	async listOrders(usuario: string) {
		const records = await prisma.dbsFrCaixas.findMany({
			where: { usuario, ordem_prod: { not: null } },
			select: { ordem_prod: true },
			distinct: ["ordem_prod"],
			orderBy: { data_hora_fracionamento: "desc" },
		});

		return records.map((record) => {
			const value = record.ordem_prod?.toString() ?? "";
			return {
				label: value ? `OP-${value}` : "OP",
				value,
			};
		});
	}

	async listBateladas(usuario: string, ordem_producao?: string) {
		const where: any = { usuario };
		if (ordem_producao) {
			const orderNum = toNumericOrder(ordem_producao);
			if (orderNum !== null) {
				where.ordem_prod = orderNum;
			}
		}

		const records = await prisma.dbsFrCaixas.findMany({
			where,
			select: { batelada: true },
			distinct: ["batelada"],
			orderBy: { data_hora_fracionamento: "desc" },
		});

		return records
			.filter((record) => !!record.batelada)
			.map((record) => ({
				label: record.batelada ?? "",
				value: record.batelada ?? "",
			}));
	}
}