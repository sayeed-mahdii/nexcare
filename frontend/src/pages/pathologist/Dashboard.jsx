import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import api from '../../services/api';
import { 
  FileText, 
  Upload, 
  Clock,
  CheckCircle,
  ArrowRight,
  Edit,
  FlaskConical,
  AlertCircle,
  User,
  Calendar
} from 'lucide-react';

const PathologistDashboard = () => {
  const [data, setData] = useState(null);
  const [pendingTests, setPendingTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      // Fetch lab reports dashboard
      const response = await api.get('/lab-reports/my/dashboard');
      setData(response.data.data);

      // Fetch pending test orders assigned to this pathologist
      try {
        const testsResponse = await api.get('/test-orders/pending?status=ORDERED');
        setPendingTests(testsResponse.data.data || []);
      } catch (err) {
        console.log('No pending tests or endpoint not ready');
        setPendingTests([]);
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

  const stats = [
    { 
      title: 'Pending Tests', 
      value: pendingTests.length, 
      icon: FlaskConical, 
      color: 'bg-orange-500',
      link: '/pathologist/pending-tests'
    },
    { 
      title: 'Pending Reports', 
      value: data?.stats?.pendingReports || 0, 
      icon: Clock, 
      color: 'bg-yellow-500',
    },
    { 
      title: 'Completed Today', 
      value: data?.stats?.completedToday || 0, 
      icon: CheckCircle, 
      color: 'bg-green-500',
    },
    { 
      title: 'Total Reports', 
      value: data?.stats?.totalReports || 0, 
      icon: FileText, 
      color: 'bg-primary-500',
    },
  ];

  return (
    <DashboardLayout title="Dashboard">
      {/* Profile Section */}
      <div className="mb-8 flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
            {data?.user?.firstName?.[0]}{data?.user?.lastName?.[0]}
          </div>
          <div>
             <h2 className="text-2xl font-bold text-gray-900">
               Welcome back, {data?.user?.firstName} {data?.user?.lastName}!
             </h2>
             <p className="text-gray-500">
               Manage lab reports and diagnostics.
             </p>
          </div>
        </div>
        <Link to="/pathologist/profile" className="btn btn-outline flex items-center gap-2">
          <Edit className="w-4 h-4" /> Edit Profile
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Link 
            key={index} 
            to={stat.link || '#'} 
            className={`stat-card ${stat.link ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pending Test Orders Alert */}
      {pendingTests.length > 0 && (
        <div className="card bg-gradient-to-r from-orange-500 to-red-500 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">{pendingTests.length} Pending Test Orders</h3>
                <p className="text-white/80">You have test orders from doctors waiting for results</p>
              </div>
            </div>
            <Link to="/pathologist/pending-tests" className="btn bg-white text-orange-600 hover:bg-gray-100 flex-shrink-0">
              <FlaskConical className="w-5 h-5 mr-2" /> View Pending Tests
            </Link>
          </div>
        </div>
      )}

      {/* Pending Tests Preview */}
      {pendingTests.length > 0 && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Test Orders</h2>
            <Link to="/pathologist/pending-tests" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {pendingTests.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center gap-4 p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <FlaskConical className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{order.test?.name}</h4>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <User className="w-3 h-3" />
                    {order.appointment?.patient?.user?.firstName} {order.appointment?.patient?.user?.lastName}
                    <span className="mx-1">•</span>
                    <Calendar className="w-3 h-3" />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`badge ${order.priority === 'Urgent' ? 'badge-warning' : 'badge-info'}`}>
                    {order.priority}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Dr. {order.appointment?.doctor?.user?.firstName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Reports */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Lab Reports</h2>
        </div>

        {data?.recentReports?.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No reports yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.recentReports?.map((report) => (
              <div key={report.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  report.status === 'Completed' ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  <FileText className={`w-6 h-6 ${
                    report.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{report.reportName}</h4>
                  <p className="text-sm text-gray-500">
                    {report.patient?.user?.firstName} {report.patient?.user?.lastName} • {report.lab?.name}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`badge ${
                    report.status === 'Completed' ? 'badge-success' : 'badge-warning'
                  }`}>
                    {report.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PathologistDashboard;
