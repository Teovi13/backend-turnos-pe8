import * as z from 'zod';
import { objectId, requiredBoolean, requiredNumber, requiredText } from './common.schema.js';

export const SORTABLE_FIELDS = ['name', 'price', 'duration', 'category'];

export const createServiceSchema = z.object({
  name: requiredText('name', 100),
  description: requiredText('description', 500),
  duration: requiredNumber('duration')
    .int('duration debe ser un número entero de minutos')
    .positive('duration debe ser mayor a 0'),
  price: requiredNumber('price').nonnegative('price no puede ser negativo'),
  category: requiredText('category', 50),
  available: requiredBoolean('available'),
});

export const updateServiceSchema = createServiceSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: `Debe enviarse al menos un campo para actualizar: ${Object.keys(createServiceSchema.shape).join(', ')}`,
  });

export const serviceParamsSchema = z.object({
  sid: objectId('sid'),
});

export const servicesQuerySchema = z.object({
  category: z
    .string({ error: 'category debe enviarse una sola vez como texto' })
    .trim()
    .min(1, 'category no puede estar vacío')
    .optional(),
  available: z
    .enum(['true', 'false'], { error: 'available solo acepta true o false' })
    .transform((value) => value === 'true')
    .optional(),
  page: z.coerce
    .number({ error: 'page debe ser un número' })
    .int('page debe ser un número entero')
    .min(1, 'page debe ser mayor o igual a 1')
    .default(1),
  limit: z.coerce
    .number({ error: 'limit debe ser un número' })
    .int('limit debe ser un número entero')
    .min(1, 'limit debe ser mayor o igual a 1')
    .max(50, 'limit admite como máximo 50')
    .default(10),
  sortBy: z
    .enum(SORTABLE_FIELDS, { error: `sortBy solo acepta: ${SORTABLE_FIELDS.join(', ')}` })
    .optional(),
  order: z.enum(['asc', 'desc'], { error: 'order solo acepta asc o desc' }).default('asc'),
});
