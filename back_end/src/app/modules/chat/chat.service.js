const httpStatus = require('http-status');
const prisma = require('../../utils/prisma');
const ApiError = require('../../errors/ApiError');
const { getIO } = require('../../utils/socket');
const spaces = require('../../utils/spaces');

const createChatRoom = async (payload) => {
  const { name, teamId, creatorId } = payload;

  const chatRoom = await prisma.chatRoom.create({
    data: {
      name,
      team: {
        connect: { id: teamId },
      },
      members: {
        create: {
          user: {
            connect: { id: creatorId },
          },
          canAddMembers: true,
        },
      },
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  // Notify team members about new chat room
  getIO().to(`team_${teamId}`).emit('newChatRoom', chatRoom);

  return chatRoom;
};

const getChatRooms = async (teamId) => {
  const chatRooms = await prisma.chatRoom.findMany({
    where: {
      teamId,
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              photo: true,
              isOnline: true,
              lastSeen: true,
            },
          },
        },
      },
      messages: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
        include: {
          sender: true,
          seenBy: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  return chatRooms;
};

const addMemberToChatRoom = async (payload) => {
  const { chatRoomId, userId, addedByUserId } = payload;

  // Check if the user adding the member has permission
  const addingUser = await prisma.chatRoomMember.findFirst({
    where: {
      chatRoomId,
      userId: addedByUserId,
      canAddMembers: true,
    },
  });

  if (!addingUser) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to add members');
  }

  const member = await prisma.chatRoomMember.create({
    data: {
      chatRoom: {
        connect: { id: chatRoomId },
      },
      user: {
        connect: { id: userId },
      },
      canAddMembers: true, // New members can also add others
    },
    include: {
      user: true,
      chatRoom: true,
    },
  });

  // Notify chat room members about new member
  getIO().to(`chatroom_${chatRoomId}`).emit('newMember', member);

  return member;
};

const getChatRoomMessages = async (chatRoomId) => {
  const messages = await prisma.message.findMany({
    where: {
      chatRoomId,
    },
    include: {
      sender: true,
      seenBy: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return messages;
};

const sendMessage = async (payload) => {
  const { content, chatRoomId, senderId, imageFile } = payload;
  let imageUrl = null;
  let imageKey = null;

  // If there's an image, upload to Digital Ocean Spaces
  if (imageFile) {
    // Convert base64 to buffer
    const base64Data = imageFile.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate a unique filename
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpg`;
    
    const result = await spaces.uploadImage(buffer, fileName, 'chat-images');
    imageUrl = result.url;
    imageKey = result.key;
  }

  const message = await prisma.message.create({
    data: {
      content,
      imageUrl,
      imageKey, // Store the key for future deletion if needed
      chatRoom: {
        connect: { id: chatRoomId },
      },
      sender: {
        connect: { id: senderId },
      },
    },
    include: {
      sender: true,
    },
  });

  // Emit message to all users in the chat room
  getIO().to(`chatroom_${chatRoomId}`).emit('newMessage', message);

  return message;
};

const markMessageAsSeen = async (payload) => {
  const { messageId, userId } = payload;

  const messageSeen = await prisma.messageSeen.create({
    data: {
      message: {
        connect: { id: messageId },
      },
      user: {
        connect: { id: userId },
      },
    },
    include: {
      message: true,
      user: true,
    },
  });

  // Emit message seen status to chat room
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { chatRoom: true },
  });

  getIO().to(`chatroom_${message.chatRoomId}`).emit('messageSeen', messageSeen);

  return messageSeen;
};

const getOnlineUsers = async (teamId) => {
  const users = await prisma.user.findMany({
    where: {
      teamId,
      isOnline: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      photo: true,
      lastSeen: true,
    },
  });

  return users;
};

const updateUserOnlineStatus = async (userId, isOnline) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      isOnline,
      lastSeen: new Date(),
    },
    include: {
      team: true,
    },
  });

  // Emit online status change to team members
  getIO().to(`team_${user.teamId}`).emit('userStatusChange', {
    userId,
    isOnline,
    lastSeen: user.lastSeen,
  });

  return user;
};

module.exports.ChatService = {
  createChatRoom,
  getChatRooms,
  addMemberToChatRoom,
  getChatRoomMessages,
  sendMessage,
  markMessageAsSeen,
  getOnlineUsers,
  updateUserOnlineStatus,
};
