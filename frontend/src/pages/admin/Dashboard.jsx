import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import useDashboardStore from '../../stores/dashboardStore';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  FileText,
  Building2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Edit,
  Clock,
  Microscope,
  UserCheck,
  ClipboardList,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

// Skeleton Card Component
const SkeletonCard = () => (
  <div className="relative bg-white rounded-2xl p-6 border-2 border-gray-100 animate-pulse">
    <div className="flex items-center justify-between">
      <div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
        <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
    </div>
  </div>
);

// Stat Card Component
// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, link, showValue = false }) => {
  const hasValue = showValue && value !== undefined;
  
  return (
    <Link 
      to={link} 
      className="group relative bg-gray-100 rounded-none p-6 border border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-400"
    >
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className={`text-3xl font-bold ${hasValue ? 'text-gray-900' : 'text-gray-400'}`}>
              {hasValue ? value.toLocaleString() : '—'}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            {hasValue ? 'Active Records' : 'Active'}
          </p>
        </div>
        <div className={`w-14 h-14 ${color} rounded-none flex items-center justify-center shadow-sm`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
      
      {/* Click indicator */}
      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight className="w-4 h-4 text-gray-600" />
      </div>
    </Link>
  );
};

const AdminDashboard = () => {
  const { stats, user, lastUpdated, loading, error, fetchStats, refreshStats } = useDashboardStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Initial fetch
    fetchStats();
    
    // Set up polling every 30 seconds
    const interval = setInterval(() => {
      refreshStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchStats, refreshStats]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshStats();
    setIsRefreshing(false);
  };

  const statCards = [
    { 
      title: 'Pending Appointments', 
      value: stats?.pendingAppointments || 0,
      showValue: true,
      icon: Clock, 
      color: 'bg-gradient-to-br from-amber-500 to-orange-600', 
      link: '/admin/guest-bookings?status=Pending'
    },
    { 
      title: 'Guest Bookings', 
      value: stats?.totalGuestBookings || 0,
      showValue: true,
      icon: Calendar, 
      color: 'bg-gradient-to-br from-blue-500 to-blue-600', 
      link: '/admin/guest-bookings'
    },
    { 
      title: 'Lab Reports', 
      value: stats?.totalLabReports || 0,
      showValue: true,
      icon: FileText, 
      color: 'bg-gradient-to-br from-teal-500 to-emerald-500', 
      link: '/admin/lab-reports'
    },
    { 
      title: 'Total Doctors', 
      value: stats?.totalDoctors || 0,
      showValue: true,
      icon: Stethoscope, 
      color: 'bg-gradient-to-br from-green-500 to-emerald-600', 
      link: '/admin/doctors'
    },
    { 
      title: 'Total Patients', 
      value: stats?.totalPatients || 0,
      showValue: true,
      icon: Users, 
      color: 'bg-gradient-to-br from-purple-500 to-violet-600', 
      link: '/admin/users'
    },
    { 
      title: 'Pathologists', 
      value: stats?.totalPathologists || 0,
      showValue: true,
      icon: Microscope, 
      color: 'bg-gradient-to-br from-pink-500 to-rose-500', 
      link: '/admin/pathologists'
    },
  ];

  const quickActions = [
    { title: 'Manage Doctors', icon: Stethoscope, link: '/admin/doctors', color: 'text-green-600', bg: 'bg-green-50 hover:bg-green-100' },
    { title: 'Manage Pathologists', icon: Microscope, link: '/admin/pathologists', color: 'text-pink-600', bg: 'bg-pink-50 hover:bg-pink-100' },
    { title: 'Manage Departments', icon: Building2, link: '/admin/departments', color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100' },
    { title: 'View Appointments', icon: ClipboardList, link: '/admin/guest-bookings', color: 'text-amber-600', bg: 'bg-amber-50 hover:bg-amber-100' },
    { title: 'Patient Records', icon: UserCheck, link: '/admin/users', color: 'text-purple-600', bg: 'bg-purple-50 hover:bg-purple-100' },
    { title: 'Manage Branches', icon: Building2, link: '/admin/branches', color: 'text-teal-600', bg: 'bg-teal-50 hover:bg-teal-100' },
  ];

  return (
    <DashboardLayout title="Admin Dashboard">
      {/* Profile Section */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-100 p-6 rounded-none shadow-sm border border-gray-300">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-none flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
             <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
               Welcome back, {user?.firstName || 'Admin'}!
             </h2>
             <p className="text-gray-500 text-sm sm:text-base">
               System Overview and Management Console
             </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <Link to="/admin/profile" className="btn btn-outline flex items-center gap-2 flex-1 sm:flex-auto justify-center">
            <Edit className="w-4 h-4" /> Edit Profile
          </Link>
        </div>
      </div>

      {/*
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {loading && !stats ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          statCards.map((stat, index) => (
            <StatCard 
              key={index} 
              {...stat} 
              lastUpdated={lastUpdated}
            />
          ))
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Quick Actions */}
        <div className="bg-gray-100 p-6 rounded-none border border-gray-300 shadow-sm relative">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 relative z-10">
            <span className="text-2xl">⚡</span> Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
            {quickActions.map((action, index) => (
              <Link 
                key={index}
                to={action.link} 
                className={`flex items-center gap-3 p-4 rounded-none border border-transparent hover:border-gray-400 ${action.bg.replace('rounded-xl', 'rounded-none')} transition-all duration-200 group`}
              >
                <action.icon className={`w-5 h-5 ${action.color}`} />
                <span className="font-medium text-gray-900 text-sm">{action.title}</span>
                <ArrowRight className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-gray-100 p-6 rounded-none border border-gray-300 shadow-sm relative">
          <h2 className="text-xl font-bold text-gray-900 mb-6 relative z-10">Recent Bookings</h2>
          {loading && !stats ? (
            <div className="space-y-3 relative z-10">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-none bg-white border border-gray-200 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-none"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : useDashboardStore.getState().recentBookings?.length === 0 ? (
            <div className="text-center py-8 relative z-10">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No recent bookings</p>
            </div>
          ) : (
            <div className="space-y-3 relative z-10">
              {useDashboardStore.getState().recentBookings?.map((booking) => (
                <div key={booking.id} className="flex items-center gap-4 p-3 rounded-none bg-white border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="w-10 h-10 bg-primary-100 rounded-none flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {booking.patientName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {booking.test?.name || 'Test'} - {booking.branch?.name || 'Branch'}
                    </p>
                  </div>
                  <span className={`badge rounded-none flex-shrink-0 ${
                    booking.status === 'Completed' ? 'badge-success' :
                    booking.status === 'Confirmed' ? 'badge-primary' : 
                    booking.status === 'Pending' ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
