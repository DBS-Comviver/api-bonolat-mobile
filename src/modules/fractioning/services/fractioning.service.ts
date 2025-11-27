import { TotvsService } from '../../../services/totvs.service';
import { logger } from '../../../config/logger';
import {
	GetItemDTO,
	GetDepositsDTO,
	GetLocationsDTO,
	GetBatchesDTO,
	GetBoxReturnDTO,
	FinalizeFractioningDTO,
	PrintLabelDTO,
	SearchBoxesDTO,
	GetBoxMaterialsDTO,
} from '../dtos/fractioning.dto';
import { FractioningSqlService } from './sql.service';

export class FractioningService {
	private totvsService = new TotvsService();
	private sqlService = new FractioningSqlService();

	async getItem(data: GetItemDTO) {
		logger.debug('Get item request', { it_codigo: data.it_codigo });
		return this.totvsService.getItem(data.it_codigo);
	}

	async getDeposits(data: GetDepositsDTO) {
		logger.debug('Get deposits request', { cod_estabel: data.cod_estabel });
		return this.totvsService.getDeposits(data.cod_estabel);
	}

	async getLocations(data: GetLocationsDTO) {
		logger.debug('Get locations request', { cod_estabel: data.cod_estabel, cod_deposito: data.cod_deposito });
		return this.totvsService.getLocations(data.cod_estabel, data.cod_deposito);
	}

	async getBatches(data: GetBatchesDTO) {
		logger.debug('Get batches request', { cod_estabel: data.cod_estabel, it_codigo: data.it_codigo, cod_deposito: data.cod_deposito, cod_local: data.cod_local });
		return this.totvsService.getBatches(data.cod_estabel, data.it_codigo, data.cod_deposito, data.cod_local);
	}

	async getBoxReturn(data: GetBoxReturnDTO) {
		logger.debug('Get box return request', { cod_estabel: data.cod_estabel, it_codigo: data.it_codigo, cod_deposito: data.cod_deposito, cod_local: data.cod_local, cod_lote: data.cod_lote, quantidade: data.quantidade });
		return this.totvsService.getBoxReturn(data.cod_estabel, data.it_codigo, data.cod_deposito, data.cod_local, data.cod_lote, data.quantidade);
	}

	async finalizeFractioning(data: FinalizeFractioningDTO, userLogin?: string) {
		logger.debug('Finalize fractioning request', {
			cod_estabel: data.cod_estabel,
			it_codigo: data.it_codigo,
			ordem_producao: data.ordem_producao,
			batelada: data.batelada,
		});

		const response = await this.totvsService.finalizeFractioning(
			data.cod_estabel,
			data.it_codigo,
			data.cod_deposito,
			data.cod_local,
			data.cod_lote,
			data.quantidade,
			data.dados_baixa,
			data.ordem_producao,
			data.batelada
		);

		await this.sqlService.saveBox({
			cod_estabel: data.cod_estabel,
			cod_deposito: data.cod_deposito,
			cod_local: data.cod_local,
			it_codigo: data.it_codigo,
			desc_item: data.it_codigo,
			cod_lote: data.cod_lote,
			quantidade: data.quantidade,
			dados_baixa: data.dados_baixa,
			ordem_producao: data.ordem_producao,
			batelada: data.batelada,
			usuario: userLogin,
		});

		return response;
	}

	async searchBoxes(filters: SearchBoxesDTO) {
		return this.sqlService.searchBoxes(filters);
	}

	async getBoxMaterials(params: GetBoxMaterialsDTO) {
		return this.sqlService.getBoxMaterials(params.box_code);
	}

	async listOrders(usuario: string) {
		return this.sqlService.listOrders(usuario);
	}

	async listBateladas(usuario: string, ordem_producao?: string) {
		return this.sqlService.listBateladas(usuario, ordem_producao);
	}

	async buildPrintLabel(payload: PrintLabelDTO) {
		const now = new Date();
		const day = String(now.getDate()).padStart(2, "0");
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const year = String(now.getFullYear()).slice(-2);
		const batelada = payload.batelada || "00000";
		const ordem = payload.ordem_producao || "00000";

		const label = [
			"VALIDAÇÃO E RATEIO DE NF",
			"BONOLAT",
			"^XA",
			"^CF0,40",
			`^FO30,40^FD Batelada: ${batelada} OP: ${ordem} ^FS`,
			"^FO150,120",
			"^BQN,2,10",
			`^FDLA,Batelada:${batelada}|OP:${ordem}|Data:${day}-${month}-${year}^FS`,
			"^XZ",
		].join("\n");

		return { success: true, label };
	}
}