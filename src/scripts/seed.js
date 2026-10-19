import config from '../config/env.config.js';
import { connectDB, disconnectDB } from '../config/db.config.js';
import ServiceModel from '../models/service.model.js';

const SERVICES = [
  {
    name: 'Consulta médica general',
    description: 'Consulta de control con médico clínico',
    duration: 30,
    price: 12000,
    category: 'salud',
    available: true,
  },
  {
    name: 'Sesión de fisioterapia',
    description: 'Sesión individual de rehabilitación',
    duration: 60,
    price: 15000,
    category: 'salud',
    available: true,
  },
  {
    name: 'Corte de pelo',
    description: 'Corte de pelo con lavado y peinado',
    duration: 45,
    price: 8000,
    category: 'estetica',
    available: true,
  },
  {
    name: 'Limpieza facial',
    description: 'Limpieza facial profunda',
    duration: 50,
    price: 11000,
    category: 'estetica',
    available: false,
  },
];

const seed = async () => {
  await connectDB(config.mongoUri);

  const count = await ServiceModel.countDocuments();

  if (count > 0) {
    console.log(`La colección services ya tiene ${count} documentos. No se insertó nada.`);
  } else {
    const inserted = await ServiceModel.insertMany(SERVICES);
    console.log(`Se insertaron ${inserted.length} servicios de ejemplo.`);
  }

  await disconnectDB();
};

seed().catch(async (error) => {
  console.error(`Error al cargar los datos de ejemplo: ${error.message}`);
  await disconnectDB();
  process.exit(1);
});
