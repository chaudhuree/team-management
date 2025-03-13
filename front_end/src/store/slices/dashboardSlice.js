import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/dashboard/stats`);
      return response.data.data || {
        totalMembers: 0,
        activeProjects: 0,
        pendingNotifications: 0,
        recentProjects: []
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchProjectsByPhase = createAsyncThunk(
  'dashboard/fetchProjectsByPhase',
  async (phase, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/projects/phase/${phase}`);
      return {
        phase,
        projects: response.data.data || []
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch projects by phase');
    }
  }
);

const initialState = {
  stats: {
    totalMembers: 0,
    activeProjects: 0,
    pendingNotifications: 0,
    recentProjects: []
  },
  projectsByPhase: {
    FRONTEND: [],
    BACKEND: [],
    UI: []
  },
  loading: false,
  error: null
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchProjectsByPhase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectsByPhase.fulfilled, (state, action) => {
        state.loading = false;
        state.projectsByPhase[action.payload.phase] = action.payload.projects;
      })
      .addCase(fetchProjectsByPhase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  }
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
