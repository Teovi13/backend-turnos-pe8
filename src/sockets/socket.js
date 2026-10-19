import { Server } from 'socket.io';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer);

  io.on('connection', (socket) => {
    console.log(`Cliente conectado por Socket.io: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
};

export const emitEvent = (event, payload) => {
  if (io) io.emit(event, payload);
};
