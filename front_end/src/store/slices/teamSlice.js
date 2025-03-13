import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:4000/api/v1';

// Set up axios interceptor for authentication
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getTeamMembers = createAsyncThunk(
  'team/getMembers',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/teams/${teamId}/members`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch team members' });
    }
  }
);

export const getPendingMembers = createAsyncThunk(
  'team/getPendingMembers',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/teams/${teamId}/pending-members`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch pending members' });
    }
  }
);

export const approveMember = createAsyncThunk(
  'team/approveMember',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/users/${userId}/approve`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to approve member' });
    }
  }
);

export const createDepartment = createAsyncThunk(
  'team/createDepartment',
  async ({ teamId, name }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/departments/create`, { teamId, name });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create department' });
    }
  }
);

export const getDepartments = createAsyncThunk(
  'team/getDepartments',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/departments/team/${teamId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch departments' });
    }
  }
);

export const createUser = createAsyncThunk(
  'team/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/users/create-by-leader`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create user' });
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'team/updateUserRole',
  async ({ userId, roleData }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/users/${userId}/role`, roleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update user role' });
    }
  }
);

const initialState = {
  members: [],
  pendingMembers: [],
  departments: [],
  isLoading: false,
  error: null,
};

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Team Members
      .addCase(getTeamMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTeamMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members = action.payload.data;
      })
      .addCase(getTeamMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch team members';
      })
      // Get Pending Members
      .addCase(getPendingMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPendingMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingMembers = action.payload.data;
      })
      .addCase(getPendingMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch pending members';
      })
      // Approve Member
      .addCase(approveMember.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(approveMember.fulfilled, (state, action) => {
        state.isLoading = false;
        const approvedUser = action.payload.data;
        state.pendingMembers = state.pendingMembers.filter(
          (member) => member.id !== approvedUser.id
        );
        state.members.push(approvedUser);
      })
      .addCase(approveMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })
      // Create Department
      .addCase(createDepartment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.departments.push(action.payload.data);
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })
      // Get Departments
      .addCase(getDepartments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDepartments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.departments = action.payload.data;
      })
      .addCase(getDepartments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch departments';
      })
      // Create User
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members.push(action.payload.data);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })
      // Update User Role
      .addCase(updateUserRole.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedUser = action.payload.data;
        const index = state.members.findIndex(member => member.id === updatedUser.id);
        if (index !== -1) {
          state.members[index] = {
            ...state.members[index],
            ...updatedUser
          };
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      });
  },
});

export const { clearError } = teamSlice.actions;
export default teamSlice.reducer;
