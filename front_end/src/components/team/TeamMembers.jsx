import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:4000/api/v1';

const TeamMembers = () => {
  const { token, user, team } = useSelector((state) => state.auth);
  const [members, setMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!token || !team?.id) {
        setLoading(false);
        return;
      }

      try {
        const [membersRes, departmentsRes] = await Promise.all([
          axios.get(`${API_URL}/users/team-members`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/departments`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);
        
        // Ensure we're getting an array from the response
        const membersData = membersRes.data?.data || [];
        const departmentsData = departmentsRes.data?.data || [];
        
        console.log('Members data:', membersData);
        console.log('Departments data:', departmentsData);
        
        setMembers(Array.isArray(membersData) ? membersData : []);
        setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching team data:', error);
        toast.error(error.response?.data?.message || 'Error fetching team members');
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [token, team]);

  const getDepartmentName = (departmentId) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : 'Not Assigned';
  };

  const getStatusIndicator = (isOnline, lastSeen) => {
    if (isOnline) {
      return <span className="w-3 h-3 bg-green-500 rounded-full inline-block mr-2"></span>;
    }
    return <span className="w-3 h-3 bg-gray-500 rounded-full inline-block mr-2"></span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Team Members</h1>
          
          {members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No team members found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    {user?.isTeamLeader && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusIndicator(member.isOnline, member.lastSeen)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {member.photo ? (
                            <img
                              className="h-8 w-8 rounded-full mr-3"
                              src={member.photo}
                              alt={member.name}
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                              <span className="text-gray-500 text-sm">
                                {member.name?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">
                            {member.name}
                            {member.isTeamLeader && (
                              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                Leader
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                          {member.role || 'Member'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.department ? member.department.name : 'Not Assigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.email}
                      </td>
                      {user?.isTeamLeader && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                            Edit
                          </button>
                          {!member.isTeamLeader && (
                            <button className="text-red-600 hover:text-red-900">
                              Remove
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamMembers;
