import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import api from '../../services/api';
import { 
  Calendar, 
  FileText, 
  Clock, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  Edit
} from 'lucide-react';

const PatientDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/patients/my/dashboard');
      setData(response.data.data);
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

  const stats = [
    { 
      title: 'Upcoming Appointments', 
      value: data?.stats?.upcomingAppointmentsCount || 0, 
      icon: Calendar, 
      color: 'bg-gradient-to-br from-primary-500 to-primary-600',
      link: '/patient/appointments'
    },
    { 
      title: 'Total Appointments', 
      value: data?.stats?.totalAppointments || 0, 
      icon: CheckCircle, 
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      link: '/patient/appointments'
    },
    { 
      title: 'Lab Reports', 
      value: data?.stats?.totalReports || 0, 
      icon: FileText, 
      color: 'bg-gradient-to-br from-purple-500 to-violet-600',
      link: '/patient/lab-reports'
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
               Welcome back, {data?.user?.firstName} {data?.user?.lastName}!
             </h2>
             <p className="text-gray-500 text-sm sm:text-base">
               Manage your appointments and health records.
             </p>
          </div>
        </div>
        <Link to="/patient/profile" className="btn btn-outline flex items-center gap-2 whitespace-nowrap">
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

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Appointments</h2>
            <Link to="/patient/appointments" className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {data?.upcomingAppointments?.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No upcoming appointments</p>
              <Link to="/patient/book-appointment" className="btn btn-primary mt-4">
                Book Appointment
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.upcomingAppointments?.map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold">
                    {apt.doctor?.user?.firstName?.[0]}{apt.doctor?.user?.lastName?.[0]}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      Dr. {apt.doctor?.user?.firstName} {apt.doctor?.user?.lastName}
                    </h4>
                    <p className="text-sm text-gray-500">{apt.doctor?.department?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(apt.appointmentDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-primary-600">{apt.appointmentTime}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Lab Reports */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Lab Reports</h2>
            <Link to="/patient/lab-reports" className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {data?.recentReports?.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No lab reports yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.recentReports?.map((report) => (
                <div key={report.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    report.status === 'Completed' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    <FileText className={`w-7 h-7 ${
                      report.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{report.reportName}</h4>
                    <p className="text-sm text-gray-500">{report.lab?.name}</p>
                  </div>
                  <span className={`badge ${
                    report.status === 'Completed' ? 'badge-success' : 'badge-warning'
                  }`}>
                    {report.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 card bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <h3 className="text-2xl font-bold mb-2">Need to see a doctor?</h3>
            <p className="text-white/80">Book an appointment with our experienced specialists today.</p>
          </div>
          <Link to="/patient/book-appointment" className="btn bg-white text-primary-600 hover:bg-gray-100 flex-shrink-0">
            <Calendar className="w-5 h-5 mr-2" />
            Book Appointment
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
