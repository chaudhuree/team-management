import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { io } from 'socket.io-client';

// Initialize Socket.IO connection
export const initializeSocket = (token) => (dispatch) => {
  const socket = io('http://localhost:4000', {
    auth: {
      token
    }
  });

  socket.on('connect', () => {
    console.log('Socket connected');
    dispatch(setSocket(socket));
  });

  socket.on('newMessage', (message) => {
    dispatch(addMessage(message));
  });

  socket.on('messageSeen', (seenData) => {
    dispatch(updateMessageSeen(seenData));
  });

  socket.on('newChatRoom', (room) => {
    dispatch(addChatRoom(room));
  });

  socket.on('newMember', (member) => {
    dispatch(updateChatRoomMembers(member));
  });

  socket.on('userStatusChange', (statusData) => {
    dispatch(updateUserStatus(statusData));
  });

  return socket;
};

export const fetchChatRooms = createAsyncThunk(
  'chat/fetchChatRooms',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/chats/rooms/${teamId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chat rooms');
    }
  }
);

export const createChatRoom = createAsyncThunk(
  'chat/createChatRoom',
  async (roomData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/chats/rooms/create', roomData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create chat room');
    }
  }
);

export const fetchChatMessages = createAsyncThunk(
  'chat/fetchChatMessages',
  async (chatRoomId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/chats/messages/${chatRoomId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const markMessageAsSeen = createAsyncThunk(
  'chat/markMessageAsSeen',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post('/chats/messages/seen', data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark message as seen');
    }
  }
);

export const addMemberToChatRoom = createAsyncThunk(
  'chat/addMemberToChatRoom',
  async (memberData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/chats/rooms/members/add', memberData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add member to chat room');
    }
  }
);

export const fetchOnlineUsers = createAsyncThunk(
  'chat/fetchOnlineUsers',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/chats/online-users/${teamId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch online users');
    }
  }
);

// Add this async thunk for sending messages
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      // For socket-based message sending, we don't need an API call
      // The actual message sending happens through socket.io
      // But we'll keep this thunk for consistency and potential future API integration
      return messageData;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

const initialState = {
  socket: null,
  chatRooms: [],
  currentRoom: null,
  messages: {},
  onlineUsers: [],
  deadlineAlerts: [],
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
    },
    addMessage: (state, action) => {
      const { roomId, message } = action.payload;
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }
      // Check if message already exists to avoid duplicates
      const exists = state.messages[roomId].some(m => m.id === message.id);
      if (!exists) {
        state.messages[roomId].push(message);
      }
    },
    updateMessageSeen: (state, action) => {
      const { roomId, messageId, userId } = action.payload;
      const message = state.messages[roomId]?.find((m) => m.id === messageId);
      if (message) {
        // Check if already seen by this user
        const alreadySeen = message.seenBy.some(seen => seen.userId === userId);
        if (!alreadySeen) {
          message.seenBy.push({ userId, seenAt: new Date().toISOString() });
        }
      }
    },
    updateUserStatus: (state, action) => {
      const { userId, isOnline } = action.payload;
      const userIndex = state.onlineUsers.findIndex((u) => u.id === userId);
      if (isOnline && userIndex === -1) {
        state.onlineUsers.push({ id: userId });
      } else if (!isOnline && userIndex !== -1) {
        state.onlineUsers.splice(userIndex, 1);
      }
    },
    addChatRoom: (state, action) => {
      const exists = state.chatRooms.some(room => room.id === action.payload.id);
      if (!exists) {
        state.chatRooms.push(action.payload);
      }
    },
    addMember: (state, action) => {
      const { chatRoomId } = action.payload;
      const room = state.chatRooms.find(r => r.id === chatRoomId);
      if (room) {
        const exists = room.members.some(m => m.id === action.payload.id);
        if (!exists) {
          room.members.push(action.payload);
        }
      }
    },
    addDeadlineAlert: (state, action) => {
      state.deadlineAlerts.push(action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Chat Room
      .addCase(createChatRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createChatRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chatRooms.push(action.payload.data);
        state.currentRoom = action.payload.data;
      })
      .addCase(createChatRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to create chat room';
      })
      // Get Chat Rooms
      .addCase(fetchChatRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chatRooms = action.payload.data;
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch chat rooms';
      })
      // Add Member to Chat Room
      .addCase(addMemberToChatRoom.fulfilled, (state, action) => {
        const room = state.chatRooms.find((r) => r.id === action.payload.data.chatRoomId);
        if (room) {
          room.members.push(action.payload.data);
        }
      })
      // Get Chat Room Messages
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        const { chatRoomId } = action.meta.arg;
        state.messages[chatRoomId] = action.payload.data;
      })
      // Send Message
      .addCase(markMessageAsSeen.fulfilled, (state, action) => {
        const message = action.payload.data;
        if (!state.messages[message.chatRoomId]) {
          state.messages[message.chatRoomId] = [];
        }
        state.messages[message.chatRoomId].push(message);
      })
      // Get Online Users
      .addCase(fetchOnlineUsers.fulfilled, (state, action) => {
        state.onlineUsers = action.payload.data;
      })
      // Add these cases for the sendMessage thunk
      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;
        // The actual message will be added via the socket event handler
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setSocket, 
  setCurrentRoom, 
  addMessage, 
  updateMessageSeen, 
  updateUserStatus,
  addChatRoom,
  addMember,
  addDeadlineAlert,
  clearError 
} = chatSlice.actions;

export default chatSlice.reducer;
