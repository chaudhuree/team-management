import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:4000/api/v1';

// Helper function to load state from localStorage
const loadAuthState = () => {
  try {
    const serializedState = localStorage.getItem('authState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading auth state from localStorage:', err);
    return undefined;
  }
};

// Helper function to save state to localStorage
const saveAuthState = (state) => {
  try {
    const serializedState = JSON.stringify({
      user: state.user,
      team: state.team,
      token: state.token,
      isAuthenticated: state.isAuthenticated,
      isTeamLeader: state.isTeamLeader,
      isTeam: state.isTeam
    });
    localStorage.setItem('authState', serializedState);
  } catch (err) {
    console.error('Error saving auth state to localStorage:', err);
  }
};

// Set up axios defaults with token from localStorage
const setupAxiosDefaults = () => {
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Call this function immediately to set up axios defaults
setupAxiosDefaults();

export const registerTeam = createAsyncThunk(
  'auth/registerTeam',
  async (teamData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/teams/register`, teamData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const registerIndividual = createAsyncThunk(
  'auth/registerIndividual',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/users/register', userData, {
        headers: {
          'Content-Type': userData instanceof FormData ? 'multipart/form-data' : 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to register'
      );
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Determine the correct endpoint based on whether it's a team login or individual login
      const endpoint = credentials.isTeam ? `${API_URL}/teams/login` : `${API_URL}/users/login`;
      
      // For team login, rename the email field to name
      const loginData = credentials.isTeam 
        ? { name: credentials.email, password: credentials.password } 
        : credentials;
      
      const response = await axios.post(endpoint, loginData);
      
      // Extract data from response
      const data = response.data.data || response.data;
      const token = data.token || data.accessToken;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Determine if user is a team leader
      const isTeamLeader = credentials.isTeam ? true : (data.user?.role === 'LEADER' || data.user?.isTeamLeader);
      
      // Create auth state
      const authState = {
        user: data.user,
        team: data.team,
        token: token,
        isAuthenticated: true,
        isTeamLeader: isTeamLeader,
        isTeam: credentials.isTeam
      };
      
      // Save auth state to localStorage
      saveAuthState(authState);
      
      return {
        ...data,
        isTeamLeader,
        isTeam: credentials.isTeam
      };
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('authState');
      delete axios.defaults.headers.common['Authorization'];
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkAuthState = createAsyncThunk(
  'auth/checkAuthState',
  async (_, { rejectWithValue }) => {
    try {
      // First try to load from localStorage
      const persistedState = loadAuthState();
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No token found');
      }
      
      // If we have a persisted state and token, use that directly
      if (persistedState && (persistedState.user || persistedState.team) && persistedState.isAuthenticated) {
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return persistedState;
      }
      
      // If no persisted state but we have a token, try to verify with backend
      try {
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Try to get user info from backend
        const response = await axios.get(`${API_URL}/users/me`);
        const userData = response.data.data || response.data;
        
        // Determine if user is a team leader
        const isTeamLeader = userData.user?.role === 'LEADER' || userData.user?.isTeamLeader;
        
        // Create auth state
        const authState = {
          user: userData.user,
          team: userData.team,
          token: token,
          isAuthenticated: true,
          isTeamLeader: isTeamLeader,
          isTeam: false // Individual user
        };
        
        // Save auth state to localStorage
        saveAuthState(authState);
        
        return authState;
      } catch (error) {
        console.error('Error verifying token:', error);
        // If backend verification fails, clear token and state
        localStorage.removeItem('token');
        localStorage.removeItem('authState');
        delete axios.defaults.headers.common['Authorization'];
        throw error;
      }
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('authState');
      delete axios.defaults.headers.common['Authorization'];
      return rejectWithValue('Session expired');
    }
  }
);

// Load persisted state from localStorage
const persistedState = loadAuthState();

const initialState = persistedState || {
  user: null,
  team: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
  isTeamLeader: false,
  isTeam: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register team
      .addCase(registerTeam.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerTeam.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(registerTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Registration failed';
      })
      
      // Register individual
      .addCase(registerIndividual.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerIndividual.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(registerIndividual.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Registration failed';
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.team = action.payload.team;
        state.token = localStorage.getItem('token');
        state.isTeamLeader = action.payload.isTeamLeader;
        state.isTeam = action.payload.isTeam;
        
        // Save updated state to localStorage
        saveAuthState(state);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.team = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isTeamLeader = false;
        state.isTeam = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Check auth state
      .addCase(checkAuthState.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuthState.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.team = action.payload.team;
        state.token = action.payload.token;
        state.isTeamLeader = action.payload.isTeamLeader;
        state.isTeam = action.payload.isTeam;
      })
      .addCase(checkAuthState.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.team = null;
        state.token = null;
        state.isTeamLeader = false;
        state.isTeam = false;
      });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;
