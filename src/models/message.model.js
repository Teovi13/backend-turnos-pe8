import { Schema, model } from 'mongoose';

const messageSchema = new Schema(
  {
    user: { type: String, required: [true, 'user es obligatorio'], trim: true },
    message: { type: String, required: [true, 'message es obligatorio'], trim: true },
  },
  { versionKey: false, timestamps: true }
);

export default model('Message', messageSchema);
