import { z } from 'zod';

export const getItemSchema = z.object({
	it_codigo: z.string().min(1, 'Item code is required'),
});

export const getDepositsSchema = z.object({
	cod_estabel: z.string().min(1, 'Establishment code is required'),
	it_codigo: z.string().min(1, 'Item code is required'),
});

export const getLocationsSchema = z.object({
	cod_estabel: z.string().min(1, 'Establishment code is required'),
	it_codigo: z.string().min(1, 'Item code is required'),
	cod_deposito: z.string().min(1, 'Deposit code is required'),
});

export const getBatchesSchema = z.object({
	cod_estabel: z.string().min(1, 'Establishment code is required'),
	it_codigo: z.string().min(1, 'Item code is required'),
	cod_deposito: z.string().min(1, 'Deposit code is required'),
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
	it_codigo: z.string().min(1, 'Item code is required'),
	cod_deposito: z.string().min(1, 'Deposit code is required'),
	cod_local: z.string().min(1, 'Location code is required'),
	cod_lote: z.string().min(1, 'Batch code is required'),
	quantidade: z.union([z.string(), z.number()]).transform((val) => typeof val === 'string' ? parseFloat(val) : val).pipe(z.number().positive('Quantity must be positive')),
	validade: z.string().min(1, 'Validity date is required'),
	data_lote: z.string().min(1, 'Batch date is required'),
});

export type GetItemDTO = z.infer<typeof getItemSchema>;
export type GetDepositsDTO = z.infer<typeof getDepositsSchema>;
export type GetLocationsDTO = z.infer<typeof getLocationsSchema>;
export type GetBatchesDTO = z.infer<typeof getBatchesSchema>;
export type GetBoxReturnDTO = z.infer<typeof getBoxReturnSchema>;
export type FinalizeFractioningDTO = z.infer<typeof finalizeFractioningSchema>;

