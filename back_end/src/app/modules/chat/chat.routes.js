const express = require('express');
const auth = require('../../middlewares/auth');
const {
  createChatRoom,
  getChatRooms,
  addMemberToChatRoom,
  getChatRoomMessages,
  markMessageAsSeen,
  getOnlineUsers,
} = require('./chat.controller');

const router = express.Router();

router.post(
  '/rooms/create',
  auth(),
  createChatRoom
);

router.get(
  '/rooms/:teamId',
  auth(),
  getChatRooms
);

router.post(
  '/rooms/members/add',
  auth(),
  addMemberToChatRoom
);

router.get(
  '/messages/:chatRoomId',
  auth(),
  getChatRoomMessages
);

router.post(
  '/messages/seen',
  auth(),
  markMessageAsSeen
);

router.get(
  '/online-users/:teamId',
  auth(),
  getOnlineUsers
);

module.exports = router;
