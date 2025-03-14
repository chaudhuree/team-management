import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getAllProjects } from '../../store/slices/projectSlice';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FaPlus as PlusIcon,
  FaFilter as FunnelIcon,
  FaCalendarAlt as CalendarIcon,
} from 'react-icons/fa';
import CreateProjectModal from './CreateProjectModal';

const API_URL = 'http://localhost:4000/api/v1';

const Projects = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { projects, isLoading, error } = useSelector(
    (state) => state.project
  );
  // const { user } = useSelector((state) => state.auth);
  const { token, user, team } = useSelector((state) => state.auth);
  const [members, setMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isTeamLoading, setIsTeamLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
console.log({user,team})
  useEffect(() => {
    try {
      dispatch(getAllProjects({ month: selectedMonth }))
        .unwrap()
        .then(result => {
          console.log('Projects fetched successfully:', result);
        })
        .catch(error => {
          console.error('Error fetching projects:', error);
          toast.error('Failed to fetch projects. Please try again.');
        });
    } catch (error) {
      console.error('Error dispatching getAllProjects:', error);
    }
  }, [dispatch, selectedMonth]);

  const fetchTeamMembers = async () => {
    if (!token || !team?.id) {
      return;
    }

    setIsTeamLoading(true);
    try {
      const [membersRes, departmentsRes] = await Promise.all([
        axios.get(`${API_URL}/users/team-members`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/departments`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);
      
      const membersData = membersRes.data?.data || [];
      const departmentsData = departmentsRes.data?.data || [];
      
      console.log('Members data:', membersData);
      console.log('Departments data:', departmentsData);
      
      setMembers(Array.isArray(membersData) ? membersData : []);
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast.error(error.response?.data?.message || 'Error fetching team members');
    } finally {
      setIsTeamLoading(false);
    }
  };

  //Added these to console log all of it
  console.log("Projects Component Rendered");
  console.log("User:", user);
  console.log("Members:", members);
  console.log("Departments:", departments);
  console.log("isCreateModalOpen:", isCreateModalOpen);

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const getDeadlineStatus = (deadline) => {
    try {
      const date = new Date(deadline);
      if (isNaN(date.getTime())) return 'bg-gray-100 text-gray-800';
      
      const daysLeft = Math.ceil(
        (date - new Date()) / (1000 * 60 * 60 * 24)
      );
      if (daysLeft <= 1) return 'bg-red-100 text-red-800';
      if (daysLeft <= 4) return 'bg-orange-100 text-orange-800';
      return 'bg-green-100 text-green-800';
    } catch (error) {
      console.error('Error calculating deadline status:', error);
      return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProjects = projects
    ? projects
        .filter(project => project) // Filter out null/undefined projects
        .filter((project) => {
          const typeMatch =
            selectedType === 'all' || project.type === selectedType.toUpperCase();
          const priorityMatch =
            selectedPriority === 'all' ||
            project.priority === selectedPriority;
          return typeMatch && priorityMatch;
        })
    : [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">Error: {error}</div>
    );
  }

  const handleCreateProjectClick = async () => {
    console.log("Create Project button clicked!");
    await fetchTeamMembers();
    setIsCreateModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        {user?.role === 'LEADER' && (
          <button
            onClick={handleCreateProjectClick}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Project
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
          <div className="flex items-center">
            <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Types</option>
              <option value="frontend_only">Frontend Only</option>
              <option value="full_stack">Full Stack</option>
              <option value="ui_only">UI Only</option>
            </select>
          </div>
          <div className="flex items-center">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No projects found</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects?.map((project) => project && (
                <tr
                  key={project.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {project.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {project.type}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {project?.status?.map((status, index) => (
                        <span
                          key={index}
                          className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"
                        >
                          {status}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDeadlineStatus(
                        project.deadline
                      )}`}
                    >
                      {formatDate(project.deadline)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        ${project.price}
                      </span>
                      <span className="text-xs text-gray-500">
                        Earning: ${project.price * 0.8}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
        {isCreateModalOpen && (
          <CreateProjectModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            teamMembers={members}
            departments={departments}
            isLoading={isTeamLoading}
          />
        )}
    </div>
  );
};

export default Projects;