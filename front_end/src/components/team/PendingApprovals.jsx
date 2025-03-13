import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:4000/api/v1';

const PendingApprovals = () => {
  const { token } = useSelector((state) => state.auth);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingUsers();
  }, [token]);

  const fetchPendingUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingUsers(response.data.data || []);
      setLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching pending approvals');
      setLoading(false);
    }
  };

  const handleApproval = async (userId, isApproved) => {
    try {
      if (isApproved) {
        await axios.patch(
          `${API_URL}/users/${userId}/approve`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('User approved successfully');
      } else {
        await axios.delete(
          `${API_URL}/users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('User rejected successfully');
      }
      fetchPendingUsers(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error processing approval');
    }
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
          <h1 className="text-2xl font-bold mb-6">Pending Approvals</h1>
          {pendingUsers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No pending approvals at the moment
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested On
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.photo ? (
                            <img
                              className="h-8 w-8 rounded-full mr-3"
                              src={user.photo}
                              alt={user.name}
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                              <span className="text-gray-500 text-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.department?.name || 'Not Assigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mr-2"
                          onClick={() => handleApproval(user.id, true)}
                        >
                          Approve
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                          onClick={() => handleApproval(user.id, false)}
                        >
                          Reject
                        </button>
                      </td>
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

export default PendingApprovals;
