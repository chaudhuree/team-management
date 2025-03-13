import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import teamReducer from './slices/teamSlice';
import projectReducer from './slices/projectSlice';
import chatReducer from './slices/chatSlice';
import notificationReducer from './slices/notificationSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    team: teamReducer,
    project: projectReducer,
    chat: chatReducer,
    notification: notificationReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['chat/setSocket'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.socket'],
        // Ignore these paths in the state
        ignoredPaths: ['chat.socket'],
      },
    }),
});
