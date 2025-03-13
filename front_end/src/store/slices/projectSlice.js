import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { format } from 'date-fns';

export const createProject = createAsyncThunk(
  'project/create',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/projects/create`, projectData);
      return response.data;
    } catch (error) {
      console.error('API error:', error); // Log API errors
      return rejectWithValue(error.response?.data || { message: 'Failed to create project' });
    }
  }
);
// ... rest of the slice
export const getAllProjects = createAsyncThunk(
  'project/getAll',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/projects`, { params: filters });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch projects' });
    }
  }
);
export const getProjectsByPhase = createAsyncThunk(
  'project/getByPhase',
  async (phase, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/projects/phase/${phase}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch projects by phase' });
    }
  }
);
export const getProjectsByMonth = createAsyncThunk(
  'project/getByMonth',
  async (month, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/projects/month/${month}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch projects by month' });
    }
  }
);
export const updateProject = createAsyncThunk(
  'project/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/projects/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update project' });
    }
  }
);
export const assignUserToProject = createAsyncThunk(
  'project/assignUser',
  async (assignmentData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/projects/assign`, assignmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to assign user to project' });
    }
  }
);
export const getUserProjects = createAsyncThunk(
  'project/getUserProjects',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/projects/user/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch user projects' });
    }
  }
);
export const duplicateProject = createAsyncThunk(
  'project/duplicate',
  async ({ projectId, newMonth }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/projects/duplicate`, {
        projectId,
        newMonth,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to duplicate project' });
    }
  }
);
export const deleteProject = createAsyncThunk(
  'project/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/projects/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete project' });
    }
  }
);

const initialState = {
  projects: [],
  filteredProjects: [],
  userProjects: [],
  currentProject: null,
  isLoading: false,
  error: null,
  filters: {
    month: format(new Date(), 'yyyy-MM'),
    priority: null,
    search: '',
  },
};
const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        month: format(new Date(), 'yyyy-MM'),
        priority: null,
        search: '',
      };
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects.unshift(action.payload.data);
        state.currentProject = action.payload.data;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to create project';
      })
      // Get All Projects
      .addCase(getAllProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload.data;
        state.filteredProjects = action.payload.data;
      })
      .addCase(getAllProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch projects';
      })
      // Get Projects by Phase
      .addCase(getProjectsByPhase.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProjectsByPhase.fulfilled, (state, action) => {
        state.isLoading = false;
        state.filteredProjects = action.payload.data;
      })
      .addCase(getProjectsByPhase.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })
      // Get Projects by Month
      .addCase(getProjectsByMonth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProjectsByMonth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.filteredProjects = action.payload.data;
      })
      .addCase(getProjectsByMonth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })
      // Get User Projects
      .addCase(getUserProjects.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userProjects = action.payload.data;
      })
      .addCase(getUserProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })
      // Update Project
      .addCase(updateProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.projects.findIndex((p) => p.id === action.payload.data.id);
        if (index !== -1) {
          state.projects[index] = action.payload.data;
          if (state.currentProject?.id === action.payload.data.id) {
            state.currentProject = action.payload.data;
          }
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })
      // Assign User to Project
      .addCase(assignUserToProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(assignUserToProject.fulfilled, (state, action) => {
        state.isLoading = false;
        const project = state.projects.find(
          (p) => p.id === action.payload.data.projectId
        );
        if (project) {
          if (!project.assignments) {
            project.assignments = [];
          }
          project.assignments.push(action.payload.data);
          if (state.currentProject?.id === project.id) {
            state.currentProject = { ...project };
          }
        }
      })
      .addCase(assignUserToProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })
      // Duplicate Project
      .addCase(duplicateProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(duplicateProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects.unshift(action.payload.data);
      })
      .addCase(duplicateProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })
      // Delete Project
      .addCase(deleteProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = state.projects.filter(p => p.id !== action.payload.id);
        state.filteredProjects = state.filteredProjects.filter(p => p.id !== action.payload.id);
        if (state.currentProject?.id === action.payload.id) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      });
  },
});

export const { setFilters, clearFilters, setCurrentProject, clearError } =
  projectSlice.actions;
export default projectSlice.reducer;