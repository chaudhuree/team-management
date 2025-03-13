import './App.css';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { initializeSocket } from './store/slices/chatSlice';
import { checkAuthState } from './store/slices/authSlice';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';
import Login from './components/auth/Login';
import RegisterTeam from './components/auth/RegisterTeam';
import RegisterIndividual from './components/auth/RegisterIndividual';
import Dashboard from './components/dashboard/Dashboard';
import Projects from './components/projects/Projects';
import ProjectDetails from './components/projects/ProjectDetails';
import TeamMembers from './components/team/TeamMembers';
import PendingApprovals from './components/team/PendingApprovals';
import Chat from './components/chat/Chat';

// Set up axios defaults
axios.defaults.baseURL = 'http://localhost:4000/api/v1';

// Set up axios interceptor for authentication
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const dispatch = useDispatch();
  const { token, isAuthenticated, isLoading, user } = useSelector((state) => state.auth);
  const [authChecked, setAuthChecked] = useState(false);

  // Check authentication state on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await dispatch(checkAuthState()).unwrap();
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, [dispatch]);

  // Initialize socket when authenticated
  useEffect(() => {
    let socket;
    if (token && isAuthenticated) {
      socket = dispatch(initializeSocket(token));
      
      // Join team room when authenticated
      if (socket && user?.teamId) {
        socket.emit('joinTeam', user.teamId);
      }
    }
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [dispatch, token, isAuthenticated, user?.teamId]);

  // Show loading spinner while checking auth state
  if (isLoading || !authChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route path="/register/team" element={<RegisterTeam />} />
        <Route path="/register/individual" element={<RegisterIndividual />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="team-members" element={<TeamMembers />} />
            <Route path="pending-approvals" element={<PendingApprovals />} />
            <Route path="chat" element={<Chat />} />
          </Route>
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
