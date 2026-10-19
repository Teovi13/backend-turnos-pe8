import mongoose from 'mongoose';

export const connectDB = async (uri) => {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`Conectado a MongoDB (base de datos: ${mongoose.connection.name})`);
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
};
