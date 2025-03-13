import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FaHome as HomeIcon,
  FaTasks as ProjectIcon,
  FaUsers as TeamIcon,
  FaUserClock as ApprovalIcon,
  FaComments as ChatIcon,
  FaChartBar as ChartIcon 
} from 'react-icons/fa';

const Sidebar = ({ isOpen }) => {
  const { user } = useSelector((state) => state.auth);
  const isTeamLeader = user?.role === 'TEAM_LEADER';

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: HomeIcon,
    },
    {
      name: 'Projects',
      path: '/projects',
      icon: ProjectIcon,
    },
    {
      name: 'Team Members',
      path: '/team-members',
      icon: TeamIcon,
    },
    {
      name: 'Pending Approvals',
      path: '/pending-approvals',
      icon: ApprovalIcon,
      show: isTeamLeader,
    },
    {
      name: 'Chat',
      path: '/chat',
      icon: ChatIcon,
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-6">
        <h1 className="text-xl font-bold">Team Management</h1>
      </div>

      <nav className="mt-6">
        {navItems.map(
          (item) =>
            (!item.show || item.show === true) && (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 ${
                    isActive ? 'bg-gray-700 text-white' : ''
                  }`
                }
                end
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.name}</span>
              </NavLink>
            )
        )}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {user?.photo ? (
              <img
                src={user.photo}
                alt={user.name}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-lg font-medium">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
          </div>
          <div>
            <div className="text-sm font-medium">{user?.name || 'User'}</div>
            <div className="text-xs text-gray-400">
              {user?.role?.toLowerCase().replace('_', ' ') || 'Role'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
