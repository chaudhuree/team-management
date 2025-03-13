import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import { format } from 'date-fns';

const UserDetailsModal = ({ isOpen, onClose, userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProjects, setUserProjects] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
      fetchUserProjects();
    }
  }, [isOpen, userId]);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.data);
      setSelectedRole(response.data.data.role);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch user details');
      setLoading(false);
    }
  };

  const fetchUserProjects = async () => {
    try {
      const response = await axios.get(`/projects/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserProjects(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch user projects');
    }
  };

  const handleRoleChange = async () => {
    try {
      await axios.patch(
        `/users/${userId}/role`,
        { role: selectedRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('User role updated successfully');
      fetchUserDetails(); // Refresh user data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      return format(new Date(dateString), 'PPp');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const navigateToProject = (projectId) => {
    onClose();
    navigate(`/projects/${projectId}`);
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="User Details">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details">
      {user && (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            {user.photo ? (
              <img src={user.photo} alt={user.name} className="h-16 w-16 rounded-full" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-xl">{user.name?.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div>
              <h3 className="text-xl font-medium">{user.name}</h3>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Department</p>
              <p>{user.department?.name || 'Not Assigned'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Joined</p>
              <p>{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Last Active</p>
              <p>{user.isOnline ? 'Online Now' : formatDate(user.lastSeen)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Role</p>
              <div className="flex items-center space-x-2 mt-1">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="MEMBER">Member</option>
                  <option value="LEADER">Leader</option>
                </select>
                {selectedRole !== user.role && (
                  <button
                    onClick={handleRoleChange}
                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    Update
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Assigned Projects</h4>
            {userProjects.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Project</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Phase</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userProjects.map((assignment) => (
                      <tr 
                        key={assignment.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigateToProject(assignment.project.id)}
                      >
                        <td className="px-4 py-2">{assignment.project.name}</td>
                        <td className="px-4 py-2">{assignment.phase}</td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {assignment.project.projectStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No projects assigned</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default UserDetailsModal; 