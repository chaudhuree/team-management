import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import NotificationPanel from './NotificationPanel';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleNotificationPanel = () => setNotificationPanelOpen(!notificationPanelOpen);

  return (
    <div className="h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} />
      
      <div className={`flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300`}>
        <Header 
          onMenuClick={toggleSidebar} 
          onNotificationClick={toggleNotificationPanel} 
        />
        
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      <NotificationPanel 
        isOpen={notificationPanelOpen} 
        onClose={() => setNotificationPanelOpen(false)} 
      />
    </div>
  );
};

export default Layout;
