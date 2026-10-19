import { Schema, model } from 'mongoose';

const serviceSchema = new Schema(
  {
    name: { type: String, required: [true, 'name es obligatorio'], trim: true },
    description: { type: String, required: [true, 'description es obligatorio'], trim: true },
    duration: {
      type: Number,
      required: [true, 'duration es obligatorio'],
      min: [1, 'duration debe ser al menos 1 minuto'],
    },
    price: {
      type: Number,
      required: [true, 'price es obligatorio'],
      min: [0, 'price no puede ser negativo'],
    },
    category: { type: String, required: [true, 'category es obligatorio'], trim: true, lowercase: true },
    available: { type: Boolean, required: [true, 'available es obligatorio'] },
  },
  { versionKey: false }
);

export default model('Service', serviceSchema);
