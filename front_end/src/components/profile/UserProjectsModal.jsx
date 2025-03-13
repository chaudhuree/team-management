import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import { format } from 'date-fns';

const UserProjectsModal = ({ isOpen, onClose }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user, team, isTeam } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProjects = async () => {
      try {
        if (isTeam) {
          const response = await axios.get( `/projects/user/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProjects(response.data.data || []);
        } else {
          const response = await axios.get(`/projects/user/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProjects(response.data.data || []);
        }
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch your projects');
        setLoading(false);
      }
    };

    if (isOpen && ((user?.id && !isTeam) || (team?.id && isTeam))) {
      fetchUserProjects();
    }
  }, [isOpen, user?.id, team?.id, token, isTeam]);

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
    onClose();
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'NOT_STARTED':
        return 'bg-gray-100 text-gray-800';
      case 'WIP':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'DISPUTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'REVISION_DELIVERY':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="My Projects">
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : projects.length > 0 ? (
          <div className="overflow-hidden border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phase
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deadline
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.length > 0 ? projects.map((assignment) => (
                  <tr 
                    key={assignment.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleProjectClick(assignment?.project?.id)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">
                        {assignment?.project?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {assignment?.project?.type?.replace(/_/g, ' ')}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                        {assignment?.phase}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(assignment?.project?.projectStatus)}`}>
                        {assignment?.project?.projectStatus?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(assignment?.project?.deadline)}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No projects found
                    </td>
                  </tr>
                ) }
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            You are not assigned to any projects yet.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UserProjectsModal; 