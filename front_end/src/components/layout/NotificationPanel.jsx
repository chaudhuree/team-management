import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaTimes as CloseIcon } from 'react-icons/fa';
import {
  getNotifications,
  markNotificationAsRead,
} from '../../store/slices/notificationSlice';

const NotificationPanel = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { notifications, isLoading } = useSelector((state) => state.notification);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isOpen && user) {
      dispatch(getNotifications(user.id));
    }
  }, [dispatch, isOpen, user]);

  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
        >
          <CloseIcon className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <div className="overflow-y-auto h-full pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <p>No notifications</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatNotificationTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
