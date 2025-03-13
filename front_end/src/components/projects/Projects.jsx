import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getAllProjects } from '../../store/slices/projectSlice';
import { 
  FaPlus as PlusIcon,
  FaFilter as FunnelIcon,
  FaCalendarAlt as CalendarIcon 
} from 'react-icons/fa';
import CreateProjectModal from './CreateProjectModal';

const Projects = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { projects, isLoading, error } = useSelector((state) => state.project);
  const { user } = useSelector((state) => state.auth);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  useEffect(() => {
    dispatch(getAllProjects({ month: selectedMonth }));
  }, [dispatch, selectedMonth]);

  const getDeadlineStatus = (deadline) => {
    const daysLeft = Math.ceil(
      (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)
    );
    if (daysLeft <= 1) return 'bg-red-100 text-red-800';
    if (daysLeft <= 4) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const filteredProjects = projects ? projects.filter((project) => {
    const typeMatch =
      selectedType === 'all' || project.type.toLowerCase() === selectedType;
    const priorityMatch =
      selectedPriority === 'all' ||
      project.priority.toLowerCase() === selectedPriority;
    return typeMatch && priorityMatch;
  }) : [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        {user?.role === 'LEADER' && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
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
              <option value="frontend">Frontend Only</option>
              <option value="fullstack">Full Stack</option>
              <option value="ui">UI Only</option>
            </select>
          </div>
          <div className="flex items-center">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No projects found
          </div>
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
              {filteredProjects.map((project) => (
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
                      {project.status.map((status, index) => (
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
                      {new Date(project.deadline).toLocaleDateString()}
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
        />
      )}
    </div>
  );
};

export default Projects;
