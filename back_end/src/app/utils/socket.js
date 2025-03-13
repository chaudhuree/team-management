const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../../config');

let io = null;

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: config.clientUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      socket.userId = decoded.userId;
      socket.teamId = decoded.teamId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join team room
    socket.join(`team_${socket.teamId}`);

    // Update user's online status
    const { ChatService } = require('../modules/chat/chat.service');
    await ChatService.updateUserOnlineStatus(socket.userId, true);

    // Handle joining chat rooms
    socket.on('joinChatRoom', (chatRoomId) => {
      socket.join(`chatroom_${chatRoomId}`);
    });

    // Handle leaving chat rooms
    socket.on('leaveChatRoom', (chatRoomId) => {
      socket.leave(`chatroom_${chatRoomId}`);
    });

    // Handle new messages
    socket.on('sendMessage', async (data) => {
      try {
        const { content, chatRoomId, imageFile } = data;
        await ChatService.sendMessage({
          content,
          chatRoomId,
          senderId: socket.userId,
          imageFile,
        });
      } catch (error) {
        socket.emit('error', error.message);
      }
    });

    // Handle message seen status
    socket.on('markMessageSeen', async (messageId) => {
      try {
        await ChatService.markMessageAsSeen({
          messageId,
          userId: socket.userId,
        });
      } catch (error) {
        socket.emit('error', error.message);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      try {
        const user = await ChatService.updateUserOnlineStatus(socket.userId, false);
        if (user?.team?.id) {
          io.to(user.team.id).emit('userOffline', user.id);
        }
      } catch (error) {
        console.error('Error updating user online status:', error);
      }
    });
  });

  return io;
};

module.exports = {
  initializeSocket,
  getIO
};
