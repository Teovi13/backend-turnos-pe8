import { Schema, model } from 'mongoose';

export const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled'];

const bookingServiceSchema = new Schema(
  {
    service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const bookingSchema = new Schema(
  {
    clientName: { type: String, required: [true, 'clientName es obligatorio'], trim: true },
    clientEmail: {
      type: String,
      required: [true, 'clientEmail es obligatorio'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'clientEmail debe ser un email válido'],
    },
    date: {
      type: String,
      required: [true, 'date es obligatorio'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'date debe tener el formato YYYY-MM-DD'],
    },
    time: {
      type: String,
      required: [true, 'time es obligatorio'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'time debe tener el formato HH:MM'],
    },
    status: { type: String, enum: BOOKING_STATUSES, default: 'pending' },
    services: { type: [bookingServiceSchema], default: [] },
  },
  { versionKey: false }
);

export default model('Booking', bookingSchema);
