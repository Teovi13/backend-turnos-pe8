import { createServer } from 'node:http';
import config from './config/env.config.js';
import { connectDB } from './config/db.config.js';
import { initSocket } from './sockets/socket.js';
import app from './app.js';

const start = async () => {
  try {
    await connectDB(config.mongoUri);
  } catch (error) {
    console.error(`No se pudo conectar a MongoDB: ${error.message}`);
    console.error('Revisá MONGO_URI en el archivo .env y que tu IP esté habilitada en Atlas (Network Access).');
    process.exit(1);
  }

  const httpServer = createServer(app);
  initSocket(httpServer);

  httpServer.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`El puerto ${config.port} ya está en uso. Cambiá PORT en el archivo .env.`);
    } else {
      console.error(`No se pudo iniciar el servidor: ${error.message}`);
    }
    process.exit(1);
  });

  httpServer.listen(config.port, () => {
    console.log(`Servidor escuchando en http://localhost:${config.port} (${config.nodeEnv})`);
    console.log(`Vistas: http://localhost:${config.port}/views/services y /views/availability`);
  });
};

start();
