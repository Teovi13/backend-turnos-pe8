import * as z from 'zod';

export const objectId = (field) =>
  z
    .string({ error: `${field} es obligatorio` })
    .regex(/^[0-9a-fA-F]{24}$/, `${field} debe ser un id válido de MongoDB (24 caracteres hexadecimales)`);

export const requiredText = (field, max) =>
  z
    .string({ error: (issue) => (issue.input == null ? `${field} es obligatorio` : `${field} debe ser un texto`) })
    .trim()
    .min(1, `${field} no puede estar vacío`)
    .max(max, `${field} admite como máximo ${max} caracteres`);

export const requiredNumber = (field) =>
  z.number({
    error: (issue) => (issue.input == null ? `${field} es obligatorio` : `${field} debe ser un número`),
  });

export const requiredBoolean = (field) =>
  z.boolean({
    error: (issue) =>
      issue.input == null ? `${field} es obligatorio` : `${field} debe ser true o false (booleano)`,
  });
