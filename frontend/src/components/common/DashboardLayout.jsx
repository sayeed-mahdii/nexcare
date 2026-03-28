import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { NavLink, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Bell, Search, LayoutDashboard, UserCog, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DashboardLayout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState([]);
  const notificationRef = useRef(null);

  // Load dismissed notifications from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem('dismissedNotifications');
    if (dismissed) {
      setDismissedNotifications(JSON.parse(dismissed));
    }
  }, []);

  // Fetch notifications for Admin & Doctor
  useEffect(() => {
    if (user?.role === 'Administrator' || user?.role === 'Doctor') {
      fetchNotifications();
      // Poll every minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/users/notifications');
      const allNotifications = res.data.data || [];
      
      // Clean up dismissed notifications that are no longer in the list
      const dismissed = localStorage.getItem('dismissedNotifications');
      if (dismissed) {
        const dismissedList = JSON.parse(dismissed);
        const currentKeys = allNotifications.map(n => `${n.type}-${n.count}`);
        const validDismissed = dismissedList.filter(key => currentKeys.includes(key));
        if (validDismissed.length !== dismissedList.length) {
          localStorage.setItem('dismissedNotifications', JSON.stringify(validDismissed));
          setDismissedNotifications(validDismissed);
        }
      }
      
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  // Dismiss a notification when clicked
  const dismissNotification = (notif) => {
    const notifKey = `${notif.type}-${notif.count}`;
    const updatedDismissed = [...dismissedNotifications, notifKey];
    setDismissedNotifications(updatedDismissed);
    localStorage.setItem('dismissedNotifications', JSON.stringify(updatedDismissed));
  };

  // Filter out dismissed notifications for display
  const activeNotifications = notifications.filter(
    notif => !dismissedNotifications.includes(`${notif.type}-${notif.count}`)
  );

  const totalNotifications = activeNotifications.reduce((acc, curr) => acc + curr.count, 0);

  // Get base path based on user role
  const getBasePath = () => {
    switch (user?.role) {
      case 'Administrator': return '/admin';
      case 'Doctor': return '/doctor';
      case 'Patient': return '/patient';
      case 'Pathologist': return '/pathologist';
      default: return '/';
    }
  };

  const basePath = getBasePath();

  return (
    <div className="min-h-screen bg-gray-50 flex pb-16 sm:pb-0">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-20 bg-white shadow-sm flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500">
                Welcome back, {user?.firstName || 'Admin'}!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-4 py-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none ml-3 w-48"
              />
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-3 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-6 h-6 text-gray-600" />
                {totalNotifications > 0 && (
                  <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fade-in-down">
                  <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <span className="bg-primary-50 text-primary-600 text-xs px-2 py-1 rounded-full font-medium">
                      {totalNotifications} New
                    </span>
                  </div>
                  
                  <div className="max-h-[300px] overflow-y-auto">
                    {activeNotifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 text-sm">
                        <Bell className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                        No new notifications
                      </div>
                    ) : (
                      activeNotifications.map((notif, index) => (
                        <div 
                          key={index}
                          onClick={() => {
                            dismissNotification(notif);
                            setShowNotifications(false);
                            navigate(notif.link);
                          }}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                        >
                          <div className="flex gap-3">
                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notif.priority === 'urgent' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{notif.message}</p>
                              <p className="text-xs text-gray-500 mt-1">Click to view details</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar */}
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation - Only visible on small screens */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 sm:hidden z-40">
        <div className="flex items-center justify-around h-16">
          <NavLink
            to={basePath}
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Dashboard</span>
          </NavLink>
          
          <NavLink
            to={`${basePath}/profile`}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            <UserCog className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Profile</span>
          </NavLink>
          
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center flex-1 h-full text-red-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default DashboardLayout;

