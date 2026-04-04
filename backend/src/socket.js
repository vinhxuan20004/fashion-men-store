let io;

module.exports = {
  init: (server) => {
    io = require('socket.io')(server, {
      cors: {
        origin: '*', // In production, replace with specific frontend URL
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      },
    });

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      socket.on('join', (room) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room: ${room}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
};
