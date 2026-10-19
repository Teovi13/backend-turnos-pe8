import * as z from 'zod';
import { objectId, requiredText } from './common.schema.js';

export const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled'];

const isRealDate = (value) => {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

export const createBookingSchema = z.object({
  clientName: requiredText('clientName', 100),
  clientEmail: z
    .string({ error: (issue) => (issue.input == null ? 'clientEmail es obligatorio' : 'clientEmail debe ser un texto') })
    .trim()
    .toLowerCase()
    .pipe(z.email('clientEmail debe ser un email válido')),
  date: z
    .string({ error: (issue) => (issue.input == null ? 'date es obligatorio' : 'date debe ser un texto') })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date debe tener el formato YYYY-MM-DD')
    .refine(isRealDate, 'date debe ser una fecha real'),
  time: z
    .string({ error: (issue) => (issue.input == null ? 'time es obligatorio' : 'time debe ser un texto') })
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'time debe tener el formato HH:MM (24 horas)'),
  status: z.enum(BOOKING_STATUSES, { error: `status solo acepta: ${BOOKING_STATUSES.join(', ')}` }).optional(),
});

export const bookingParamsSchema = z.object({
  bid: objectId('bid'),
});

export const bookingServiceParamsSchema = z.object({
  bid: objectId('bid'),
  sid: objectId('sid'),
});
