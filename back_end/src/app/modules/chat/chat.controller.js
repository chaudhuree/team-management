const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const sendResponse = require('../../utils/sendResponse');
const { ChatService } = require('./chat.service');

const createChatRoom = catchAsync(async (req, res) => {
  const result = await ChatService.createChatRoom(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Chat room created successfully',
    data: result,
  });
});

const getChatRooms = catchAsync(async (req, res) => {
  const result = await ChatService.getChatRooms(req.params.teamId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Chat rooms retrieved successfully',
    data: result,
  });
});

const addMemberToChatRoom = catchAsync(async (req, res) => {
  const result = await ChatService.addMemberToChatRoom(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Member added to chat room successfully',
    data: result,
  });
});

const getChatRoomMessages = catchAsync(async (req, res) => {
  const result = await ChatService.getChatRoomMessages(req.params.chatRoomId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Messages retrieved successfully',
    data: result,
  });
});

const markMessageAsSeen = catchAsync(async (req, res) => {
  const result = await ChatService.markMessageAsSeen(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Message marked as seen',
    data: result,
  });
});

const getOnlineUsers = catchAsync(async (req, res) => {
  const result = await ChatService.getOnlineUsers(req.params.teamId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Online users retrieved successfully',
    data: result,
  });
});

module.exports = {
  createChatRoom,
  getChatRooms,
  addMemberToChatRoom,
  getChatRoomMessages,
  markMessageAsSeen,
  getOnlineUsers,
};
