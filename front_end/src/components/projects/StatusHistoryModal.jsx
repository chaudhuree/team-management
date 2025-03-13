import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import { format } from 'date-fns';

const StatusHistoryModal = ({ isOpen, onClose, projectId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`/projects/${projectId}/status-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistory(response.data.data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch status history');
        setLoading(false);
      }
    };

    fetchHistory();
  }, [projectId, token]);

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'PPp');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Status History">
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : history.length > 0 ? (
          history.map((entry) => (
            <div key={entry.id} className="border-b pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    {entry.oldStatus} → {entry.newStatus}
                  </p>
                  <p className="text-sm text-gray-500">
                    By {entry.updatedBy.name}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {formatDate(entry.createdAt)}
                </p>
              </div>
              {entry.comment && (
                <p className="mt-2 text-sm text-gray-600">{entry.comment}</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No status history available</p>
        )}
      </div>
    </Modal>
  );
};

export default StatusHistoryModal; 