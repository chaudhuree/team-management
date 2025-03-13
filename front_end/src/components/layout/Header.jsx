import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { FaBell as BellIcon, FaBars as Bars3Icon, FaUserCircle as UserCircleIcon } from 'react-icons/fa';

const Header = ({ onMenuClick, onNotificationClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notification);

  const handleLogout = () => {
    dispatch(logout()).then(() => {
      navigate('/login');
    });
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
        >
          <Bars3Icon className="h-6 w-6 text-gray-600" />
        </button>

        <div className="flex items-center space-x-4">
          <button
            onClick={onNotificationClick}
            className="relative p-2 rounded-md hover:bg-gray-100 focus:outline-none"
          >
            <BellIcon className="h-6 w-6 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="relative group">
            <button className="flex items-center space-x-2 focus:outline-none">
              <UserCircleIcon className="h-8 w-8 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {user?.name || 'User'}
              </span>
            </button>

            <div className="absolute right-0 w-48 mt-2 py-1 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="px-4 py-2 text-sm text-gray-700">
                <div className="font-medium">{user?.name}</div>
                <div className="text-gray-500">{user?.email}</div>
              </div>
              <hr className="my-1" />
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
