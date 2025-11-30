export interface FractioningItemResponse {
	it_codigo: string;
	desc_item: string;
}

export interface FractioningDepositResponse {
	cod_depos: string;
	nome: string;
}

export interface FractioningLocationResponse {
	cod_local: string;
	nome: string;
}

export interface FractioningBatchResponse {
	lote: string;
	dt_lote: string;
}

export interface FractioningBoxResponseItem {
	mensagem: string;
	it_codigo: string;
	desc_item: string;
	quant_usada: number;
}

export interface FractioningBoxResponse {
	total: number;
	hasNext: boolean;
	items: FractioningBoxResponseItem[];
}

export interface FractioningFinalizeResponseItem {
	mensagem: string;
	it_codigo: string;
	desc_item: string;
	quant_usada: number;
}

export interface FractioningFinalizeResponse {
	total: number;
	hasNext: boolean;
	items: FractioningFinalizeResponseItem[];
}

