import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import api from '../../services/api';
import { 
  Calendar, 
  Users, 
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Edit,
  FlaskConical
} from 'lucide-react';

const DoctorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingVerifications, setPendingVerifications] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/doctors/my/dashboard');
      setData(response.data.data);

      // Fetch pending test verifications
      try {
        const verifyResponse = await api.get('/test-orders/pending-verification');
        setPendingVerifications(verifyResponse.data.data || []);
      } catch (err) {
        console.log('No pending verifications');
        setPendingVerifications([]);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center py-20">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Get today's date for filtering
  const today = new Date().toISOString().split('T')[0];

  const stats = [
    { 
      title: 'Today\'s Appointments', 
      value: data?.stats?.todayAppointments || 0, 
      icon: Calendar, 
      color: 'bg-gradient-to-br from-primary-500 to-primary-600',
      link: `/doctor/appointments?date=${today}`,
    },
    { 
      title: 'Completed Today', 
      value: data?.stats?.completedToday || 0, 
      icon: CheckCircle, 
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      link: `/doctor/appointments?date=${today}&status=Completed`,
    },
    { 
      title: 'Total Patients', 
      value: data?.stats?.totalPatients || 0, 
      icon: Users, 
      color: 'bg-gradient-to-br from-purple-500 to-violet-600',
      link: '/doctor/patients',
    },
  ];

  return (
    <DashboardLayout title="Dashboard">
      {/* Profile Section */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-100 p-6 rounded-none shadow-sm border border-gray-300">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-none flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-sm">
            {data?.user?.firstName?.[0]}{data?.user?.lastName?.[0]}
          </div>
          <div>
             <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
               Welcome back, Dr. {data?.user?.firstName} {data?.user?.lastName}!
             </h2>
             <p className="text-gray-500 text-sm sm:text-base">
               Manage your appointments and patients.
             </p>
          </div>
        </div>
        <Link to="/doctor/profile" className="btn btn-outline flex items-center gap-2 whitespace-nowrap">
          <Edit className="w-4 h-4" /> Edit Profile
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {stats.map((stat, index) => (
          <Link 
            key={index}
            to={stat.link}
            className="group relative bg-gray-100 rounded-none p-6 border border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-400"
          >
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">{stat.title}</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1 font-medium">
                  Active Records
                </p>
              </div>
              <div className={`w-14 h-14 ${stat.color} rounded-none flex items-center justify-center shadow-sm`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
            </div>
            
            {/* Click indicator */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-4 h-4 text-gray-600" />
            </div>
          </Link>
        ))}
      </div>

      {/* Pending Verification Alert */}
      {pendingVerifications.length > 0 && (
        <div className="mb-8 p-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{pendingVerifications.length} Test Results Awaiting Verification</h3>
                <p className="text-white/80 text-sm">Pathologists have submitted test results for your review</p>
              </div>
            </div>
            <Link to="/doctor/test-records" className="btn bg-white text-orange-600 hover:bg-gray-100 flex-shrink-0">
              <FlaskConical className="w-5 h-5 mr-2" /> Review Tests
            </Link>
          </div>
        </div>
      )}

      {/* Appointments Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-gray-100 p-6 rounded-none border border-gray-300 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              Upcoming Appointments
            </h2>
            <Link to="/doctor/appointments?status=Scheduled" className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {data?.upcomingAppointments?.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.upcomingAppointments?.map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 p-3 bg-white border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-none flex items-center justify-center text-white font-bold text-sm">
                    {apt.patient?.user?.firstName?.[0]}{apt.patient?.user?.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {apt.patient?.user?.firstName} {apt.patient?.user?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(apt.appointmentDate).toLocaleDateString()} • {apt.appointmentTime}
                    </p>
                  </div>
                  <span className="badge badge-primary flex-shrink-0">
                    <Clock className="w-3 h-3 mr-1" /> Scheduled
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Appointment History */}
        <div className="bg-gray-100 p-6 rounded-none border border-gray-300 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              Appointment History
            </h2>
            <Link to="/doctor/appointments" className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {data?.recentAppointments?.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No appointment history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.recentAppointments?.map((apt) => {
                const isToday = new Date(apt.appointmentDate).toDateString() === new Date().toDateString();
                return (
                  <div key={apt.id} className="flex items-center gap-4 p-3 bg-white border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className={`w-10 h-10 rounded-none flex items-center justify-center text-white font-bold text-sm ${
                      apt.status === 'Completed' 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                        : apt.status === 'Cancelled'
                        ? 'bg-gradient-to-br from-red-500 to-red-600'
                        : 'bg-gradient-to-br from-primary-500 to-secondary-500'
                    }`}>
                      {apt.patient?.user?.firstName?.[0]}{apt.patient?.user?.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {apt.patient?.user?.firstName} {apt.patient?.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {isToday ? 'Today' : new Date(apt.appointmentDate).toLocaleDateString()} • {apt.appointmentTime}
                      </p>
                    </div>
                    <span className={`badge flex-shrink-0 ${
                      apt.status === 'Completed' ? 'badge-success' :
                      apt.status === 'Cancelled' ? 'badge-danger' :
                      'badge-primary'
                    }`}>
                      {apt.status === 'Completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {apt.status === 'Cancelled' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {apt.status === 'Scheduled' && <Clock className="w-3 h-3 mr-1" />}
                      {apt.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
