import { TotvsService } from '../../../services/totvs.service';
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
import { ValidationError } from '../../../utils/errors';
import type { FractioningBoxResponse, FractioningFinalizeResponse } from '../types/fractioning.types';

export class FractioningService {
	private totvsService = new TotvsService();
	private sqlService = new FractioningSqlService();

	private hasErrorMessage(mensagem?: string): boolean {
		if (!mensagem) return false;
		return mensagem.toUpperCase().includes('ERRO');
	}

	private validateBoxResponse(response: FractioningBoxResponse): void {
		if (response.items && response.items.length > 0) {
			const errorItems = response.items.filter(item => this.hasErrorMessage(item.mensagem));
			if (errorItems.length > 0) {
				const errorMessages = errorItems.map(item => item.mensagem).join('; ');
				throw new ValidationError(errorMessages);
			}
		}
	}

	private validateFinalizeResponse(response: FractioningFinalizeResponse): void {
		if (response.items && response.items.length > 0) {
			const errorItems = response.items.filter(item => this.hasErrorMessage(item.mensagem));
			if (errorItems.length > 0) {
				const errorMessages = errorItems.map(item => item.mensagem).join('; ');
				throw new ValidationError(errorMessages);
			}
		}
	}

	async getItem(data: GetItemDTO, userLogin?: string) {
		return this.totvsService.getItem(data.it_codigo, userLogin);
	}

	async getDeposits(data: GetDepositsDTO, userLogin?: string) {
		return this.totvsService.getDeposits(data.cod_estabel, userLogin);
	}

	async getLocations(data: GetLocationsDTO, userLogin?: string) {
		return this.totvsService.getLocations(data.cod_estabel, data.cod_deposito, userLogin);
	}

	async getBatches(data: GetBatchesDTO, userLogin?: string) {
		return this.totvsService.getBatches(data.cod_estabel, data.it_codigo, data.cod_deposito, data.cod_local, userLogin);
	}

	async getBoxReturn(data: GetBoxReturnDTO, userLogin?: string) {
		const response = await this.totvsService.getBoxReturn(data.cod_estabel, data.it_codigo, data.cod_deposito, data.cod_local, data.cod_lote, data.quantidade, userLogin);
		this.validateBoxResponse(response);
		return response;
	}

	async finalizeFractioning(data: FinalizeFractioningDTO, userLogin?: string) {
		const response = await this.totvsService.finalizeFractioning(
			data.cod_estabel,
			data.it_codigo,
			data.cod_deposito,
			data.cod_local,
			data.cod_lote,
			data.quantidade,
			data.dados_baixa,
			data.ordem_producao,
			data.batelada,
			userLogin
		);

		this.validateFinalizeResponse(response);

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