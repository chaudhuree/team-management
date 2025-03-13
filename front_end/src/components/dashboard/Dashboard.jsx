import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchDashboardStats } from '../../store/slices/dashboardSlice';
import { 
  FaUsers as UserGroupIcon,
  FaTasks as ProjectIcon,
  FaCheckCircle as CheckCircleIcon,
  FaClock as ClockIcon,
  FaExclamationTriangle as ExclamationIcon
} from 'react-icons/fa';

const StatCard = ({ title, value, icon: Icon, className }) => (
  <div className={`p-6 rounded-lg shadow-md ${className}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <h3 className="text-2xl font-bold mt-2">{value}</h3>
      </div>
      <Icon className="h-8 w-8 text-gray-400" />
    </div>
  </div>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const dashboardState = useSelector((state) => state.dashboard);
  const { user } = useSelector((state) => state.auth);

  // Safely extract values from dashboard state with fallbacks
  const loading = dashboardState?.loading || false;
  const error = dashboardState?.error || null;
  const stats = dashboardState?.stats || {};

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  // Ensure stats object exists to prevent null reference errors
  const safeStats = stats || {};
  const recentProjects = safeStats.recentProjects || [];
  const totalMembers = safeStats.totalMembers || 0;
  const activeProjects = safeStats.activeProjects || 0;
  const pendingNotifications = safeStats.pendingNotifications || 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Welcome back, {user?.name || 'User'}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Team Members"
          value={totalMembers}
          icon={UserGroupIcon}
          className="bg-blue-50"
        />
        <StatCard
          title="Active Projects"
          value={activeProjects}
          icon={ProjectIcon}
          className="bg-green-50"
        />
        <StatCard
          title="Pending Notifications"
          value={pendingNotifications}
          icon={ExclamationIcon}
          className="bg-yellow-50"
        />
      </div>

      {/* Recent Projects */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
        {recentProjects.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentProjects.map((project) => (
                  <tr key={project.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {project.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{project.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {project.status || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No recent projects found
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
