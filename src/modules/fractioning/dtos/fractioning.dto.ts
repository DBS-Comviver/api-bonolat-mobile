import { z } from 'zod';

export const getItemSchema = z.object({
	it_codigo: z.string().min(1, 'Item code is required'),
});

export const getDepositsSchema = z.object({
	cod_estabel: z.string().min(1, 'Establishment code is required'),
});

export const getLocationsSchema = z.object({
	cod_estabel: z.string().min(1, 'Establishment code is required'),
	cod_deposito: z.string().min(1, 'Deposit code is required'),
});

export const getBatchesSchema = z.object({
	cod_estabel: z.string().min(1, 'Establishment code is required'),
	it_codigo: z.string().min(1, 'Item code is required'),
	cod_deposito: z.string().min(1, 'Deposit code is required'),
	cod_local: z.string().min(1, 'Location code is required'),
});

export const getBoxReturnSchema = z.object({
	cod_estabel: z.string().min(1, 'Establishment code is required'),
	it_codigo: z.string().min(1, 'Item code is required'),
	cod_deposito: z.string().min(1, 'Deposit code is required'),
	cod_local: z.string().min(1, 'Location code is required'),
	cod_lote: z.string().min(1, 'Batch code is required'),
	quantidade: z.union([z.string(), z.number()]).transform((val) => typeof val === 'string' ? parseFloat(val) : val).pipe(z.number().positive('Quantity must be positive')),
});

export const finalizeFractioningSchema = z.object({
	cod_estabel: z.string().min(1, 'Establishment code is required'),
	it_codigo: z.string().min(1, 'Box item code is required'),
	cod_deposito: z.string().min(1, 'Deposit code is required'),
	cod_local: z.string().min(1, 'Location code is required'),
	cod_lote: z.string().min(1, 'Batch code is required'),
	quantidade: z.union([z.string(), z.number()]).transform((val) => typeof val === 'string' ? parseFloat(val) : val).pipe(z.number().positive('Quantity must be positive')),
	dados_baixa: z.string().min(1, 'Items data is required'),
	ordem_producao: z.string().optional(),
	batelada: z.string().optional(),
});

export const searchBoxesSchema = z.object({
	ordem_producao: z.string().optional(),
	batelada: z.string().optional(),
}).refine((data) => !!(data.ordem_producao || data.batelada), {
	message: 'Informe ao menos uma Ordem de Produção ou Batelada',
});

export const getBoxMaterialsSchema = z.object({
	box_code: z.string().min(1, 'Box code is required'),
});

export const printLabelSchema = z.object({
	cod_estabel: z.string().min(1, 'Establishment code is required'),
	cod_deposito: z.string().min(1, 'Deposit code is required'),
	cod_local: z.string().min(1, 'Location code is required'),
	box_code: z.string().min(1, 'Box code is required'),
	ordem_producao: z.string().optional(),
	batelada: z.string().optional(),
	quantidade: z.number().min(1, 'Quantity must be positive'),
});

export const listOrdersSchema = z.object({});

export const listBateladasSchema = z.object({
	ordem_producao: z.string().optional(),
});

export type GetItemDTO = z.infer<typeof getItemSchema>;
export type GetDepositsDTO = z.infer<typeof getDepositsSchema>;
export type GetLocationsDTO = z.infer<typeof getLocationsSchema>;
export type GetBatchesDTO = z.infer<typeof getBatchesSchema>;
export type GetBoxReturnDTO = z.infer<typeof getBoxReturnSchema>;
export type FinalizeFractioningDTO = z.infer<typeof finalizeFractioningSchema>;
export type SearchBoxesDTO = z.infer<typeof searchBoxesSchema>;
export type GetBoxMaterialsDTO = z.infer<typeof getBoxMaterialsSchema>;
export type PrintLabelDTO = z.infer<typeof printLabelSchema>;
export type ListOrdersDTO = z.infer<typeof listOrdersSchema>;
export type ListBateladasDTO = z.infer<typeof listBateladasSchema>;