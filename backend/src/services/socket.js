const { Server } = require('socket.io');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket Client connected: ${socket.id}`);

    // Join a room specific to user ID so we can send notifications to that user only
    socket.on('join_user_room', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`Socket client joined room: user_${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => {
  return io;
};

// Emit live notification helper
const sendLiveNotification = (userId, notification) => {
  if (io) {
    io.to(`user_${userId}`).emit('new_notification', notification);
    console.log(`Emitting live socket alert in room: user_${userId}`);
  }
};

module.exports = {
  initSocket,
  getIo,
  sendLiveNotification,
};
