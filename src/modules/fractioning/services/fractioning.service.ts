import { TotvsService } from '../../../services/totvs.service';
import { logger } from '../../../config/logger';
import { GetItemDTO, GetDepositsDTO, GetLocationsDTO, GetBatchesDTO, GetBoxReturnDTO, FinalizeFractioningDTO } from '../dtos/fractioning.dto';
import { UnauthorizedError } from '../../../utils/errors';

export class FractioningService {
	private totvsService = new TotvsService();

	async getItem(data: GetItemDTO) {
		logger.debug('Get item request', { it_codigo: data.it_codigo });
		return this.totvsService.getItem(data.it_codigo);
	}

	async getDeposits(data: GetDepositsDTO) {
		logger.debug('Get deposits request', { cod_estabel: data.cod_estabel, it_codigo: data.it_codigo });
		return this.totvsService.getDeposits(data.cod_estabel, data.it_codigo);
	}

	async getLocations(data: GetLocationsDTO) {
		logger.debug('Get locations request', { cod_estabel: data.cod_estabel, it_codigo: data.it_codigo, cod_deposito: data.cod_deposito });
		return this.totvsService.getLocations(data.cod_estabel, data.it_codigo, data.cod_deposito);
	}

	async getBatches(data: GetBatchesDTO) {
		logger.debug('Get batches request', { cod_estabel: data.cod_estabel, it_codigo: data.it_codigo, cod_deposito: data.cod_deposito });
		return this.totvsService.getBatches(data.cod_estabel, data.it_codigo, data.cod_deposito);
	}

	async getBoxReturn(data: GetBoxReturnDTO) {
		logger.debug('Get box return request', { cod_estabel: data.cod_estabel, it_codigo: data.it_codigo, cod_deposito: data.cod_deposito, cod_local: data.cod_local, cod_lote: data.cod_lote, quantidade: data.quantidade });
		return this.totvsService.getBoxReturn(data.cod_estabel, data.it_codigo, data.cod_deposito, data.cod_local, data.cod_lote, data.quantidade);
	}

	async finalizeFractioning(data: FinalizeFractioningDTO) {
		logger.debug('Finalize fractioning request', { cod_estabel: data.cod_estabel, it_codigo: data.it_codigo });
		return this.totvsService.finalizeFractioning(data.cod_estabel, data.it_codigo, data.cod_deposito, data.cod_local, data.cod_lote, data.quantidade, data.validade, data.data_lote);
	}
}


