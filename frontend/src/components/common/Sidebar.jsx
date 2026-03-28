import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  Building2, 
  UserCog,
  LogOut,
  Activity,
  Upload,
  Stethoscope,
  ClipboardList,
  X,
  FlaskConical,
  Microscope,
  ChevronRight,
  Settings,
  HelpCircle
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getMenuItems = () => {
    switch (user?.role) {
      case 'Administrator':
        return [
          { 
            group: 'Main',
            items: [
              { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
              { name: 'Profile', path: '/admin/profile', icon: UserCog },
            ]
          },
        ];
      case 'Doctor':
        return [
          { 
            group: 'Main',
            items: [
              { name: 'Dashboard', path: '/doctor', icon: LayoutDashboard },
              { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
              { name: 'Test Records', path: '/doctor/test-records', icon: FlaskConical },
              { name: 'Patients', path: '/doctor/patients', icon: Users },
              { name: 'Reviews', path: '/doctor/reviews', icon: ClipboardList },
            ]
          },
          {
            group: 'Settings',
            items: [
              { name: 'Profile', path: '/doctor/profile', icon: UserCog },
            ]
          },
        ];
      case 'Patient':
        return [
          { 
            group: 'Main',
            items: [
              { name: 'Dashboard', path: '/patient', icon: LayoutDashboard },
              { name: 'Book Appointment', path: '/patient/book-appointment', icon: Calendar },
              { name: 'My Appointments', path: '/patient/appointments', icon: ClipboardList },
              { name: 'Lab Reports', path: '/patient/lab-reports', icon: FileText },
            ]
          },
          {
            group: 'Settings',
            items: [
              { name: 'Profile', path: '/patient/profile', icon: UserCog },
            ]
          },
        ];
      case 'Pathologist':
        return [
          { 
            group: 'Main',
            items: [
              { name: 'Dashboard', path: '/pathologist', icon: LayoutDashboard },
              { name: 'Pending Tests', path: '/pathologist/pending-tests', icon: FlaskConical },
            ]
          },
          {
            group: 'Settings',
            items: [
              { name: 'Profile', path: '/pathologist/profile', icon: UserCog },
            ]
          },
        ];
      default:
        return [];
    }
  };

  const menuGroups = getMenuItems();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 flex flex-col
        lg:translate-x-0 lg:static lg:h-auto lg:min-h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b flex-shrink-0">
          <Link to="/" className="flex items-center gap-3 group hover:scale-105 transition-all duration-200 cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold gradient-text">NEXCARE</span>
              <span className="block text-xs text-gray-500 group-hover:text-primary-500 transition-colors">{user?.role}</span>
            </div>
          </Link>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            {user?.profileImage ? (
              <img 
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profileImage}`}
                alt={`${user?.firstName} ${user?.lastName}`}
                className="w-12 h-12 rounded-xl object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`;
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-lg font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{user?.firstName} {user?.lastName}</h3>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1 overflow-y-auto">
          {menuGroups.map((group, groupIndex) => (
            <div key={group.group} className={groupIndex > 0 ? 'mt-6' : ''}>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
                {group.group}
              </h4>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.path === '/admin' || item.path === '/doctor' || item.path === '/patient' || item.path === '/pathologist'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                          isActive 
                            ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Admin Logout - in menu with spacing */}
          {user?.role === 'Administrator' && (
            <ul className="space-y-1 mt-4">
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 w-full group"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1 text-left">Logout</span>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                </button>
              </li>
            </ul>
          )}
        </nav>

        {/* Footer - Logout for non-admin users */}
        {user?.role !== 'Administrator' && (
          <div className="p-4 border-t flex-shrink-0 space-y-2">
            <button
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors w-full"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="font-medium">Help & Support</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
