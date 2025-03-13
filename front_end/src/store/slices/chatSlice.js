import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { io } from 'socket.io-client';

// Initialize Socket.IO connection
export const initializeSocket = (token) => (dispatch) => {
  const socket = io('http://localhost:4000', {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Socket connected');
    dispatch(setSocket(socket));
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  socket.on('newMessage', (message) => {
    dispatch(addMessage({ roomId: message.chatRoomId, message }));
  });

  socket.on('messageSeen', ({ messageId, userId, chatRoomId }) => {
    dispatch(updateMessageSeen({ roomId: chatRoomId, messageId, userId }));
  });

  socket.on('userStatusChange', ({ userId, isOnline }) => {
    dispatch(updateUserStatus({ userId, isOnline }));
  });

  socket.on('newChatRoom', (chatRoom) => {
    dispatch(addChatRoom(chatRoom));
  });

  socket.on('newMember', (member) => {
    dispatch(addMember(member));
  });

  socket.on('deadlineAlert', (alert) => {
    dispatch(addDeadlineAlert(alert));
  });

  return socket;
};

export const createChatRoom = createAsyncThunk(
  'chat/createRoom',
  async (roomData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/chat/rooms/create`, roomData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create chat room' });
    }
  }
);

export const getChatRooms = createAsyncThunk(
  'chat/getRooms',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/chat/rooms/${teamId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch chat rooms' });
    }
  }
);

export const addMemberToChatRoom = createAsyncThunk(
  'chat/addMember',
  async (memberData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/chat/rooms/members/add`, memberData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to add member' });
    }
  }
);

export const getChatRoomMessages = createAsyncThunk(
  'chat/getMessages',
  async (chatRoomId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/chat/messages/${chatRoomId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch messages' });
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatRoomId, content, imageFile }, { getState, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('content', content);
      
      if (imageFile) {
        formData.append('imageFile', imageFile);
      }
      
      const response = await axios.post(`/chat/messages/${chatRoomId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to send message' });
    }
  }
);

export const markMessageAsSeen = createAsyncThunk(
  'chat/markMessageSeen',
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/chat/messages/seen`, messageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to mark message as seen' });
    }
  }
);

export const getOnlineUsers = createAsyncThunk(
  'chat/getOnlineUsers',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/chat/online-users/${teamId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch online users' });
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
      .addCase(getChatRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getChatRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chatRooms = action.payload.data;
      })
      .addCase(getChatRooms.rejected, (state, action) => {
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
      .addCase(getChatRoomMessages.fulfilled, (state, action) => {
        const { chatRoomId } = action.meta.arg;
        state.messages[chatRoomId] = action.payload.data;
      })
      // Send Message
      .addCase(sendMessage.fulfilled, (state, action) => {
        const message = action.payload.data;
        if (!state.messages[message.chatRoomId]) {
          state.messages[message.chatRoomId] = [];
        }
        state.messages[message.chatRoomId].push(message);
      })
      // Get Online Users
      .addCase(getOnlineUsers.fulfilled, (state, action) => {
        state.onlineUsers = action.payload.data;
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
