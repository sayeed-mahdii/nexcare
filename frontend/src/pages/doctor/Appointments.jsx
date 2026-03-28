import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  Clock, 
  CheckCircle,
  XCircle,
  User,
  X,
  FlaskConical
} from 'lucide-react';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  // Get filter values from URL or default
  const statusFilter = searchParams.get('status') || 'all';
  const dateFilter = searchParams.get('date') || '';

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      setAppointments(response.data.data.appointments);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.put(`/appointments/${id}`, { status });
      toast.success(`Appointment marked as ${status}`);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update appointment');
    } finally {
      setUpdatingId(null);
    }
  };

  const setFilter = (status) => {
    const params = new URLSearchParams(searchParams);
    if (status === 'all') {
      params.delete('status');
    } else {
      params.set('status', status);
    }
    setSearchParams(params);
  };

  const clearDateFilter = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('date');
    setSearchParams(params);
  };

  // Filter appointments based on URL parameters
  const filteredAppointments = appointments.filter((apt) => {
    // Status filter
    if (statusFilter !== 'all' && apt.status !== statusFilter) {
      return false;
    }
    
    // Date filter (if provided)
    if (dateFilter) {
      const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
      if (aptDate !== dateFilter) {
        return false;
      }
    }
    
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Scheduled':
        return <span className="badge badge-primary"><Clock className="w-3 h-3 mr-1" /> Scheduled</span>;
      case 'Completed':
        return <span className="badge badge-success"><CheckCircle className="w-3 h-3 mr-1" /> Completed</span>;
      case 'Cancelled':
        return <span className="badge badge-danger"><XCircle className="w-3 h-3 mr-1" /> Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <DashboardLayout title="Appointments">
      {/* Date Filter Indicator */}
      {dateFilter && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-primary-50 rounded-xl border border-primary-200">
          <Calendar className="w-5 h-5 text-primary-600" />
          <span className="text-primary-700 font-medium">
            Showing appointments for: {new Date(dateFilter).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
          <button 
            onClick={clearDateFilter}
            className="ml-auto p-1 hover:bg-primary-100 rounded-lg transition-colors"
            title="Clear date filter"
          >
            <X className="w-4 h-4 text-primary-600" />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'Scheduled', 'Completed', 'Cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              statusFilter === f
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Appointments Found</h3>
            <p className="text-gray-600">
              {dateFilter 
                ? `No ${statusFilter !== 'all' ? statusFilter.toLowerCase() : ''} appointments for ${new Date(dateFilter).toLocaleDateString()}.`
                : statusFilter === 'all' 
                  ? "You don't have any appointments." 
                  : `No ${statusFilter.toLowerCase()} appointments.`
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                          {apt.patient?.user?.firstName?.[0]}{apt.patient?.user?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {apt.patient?.user?.firstName} {apt.patient?.user?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{apt.patient?.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>{new Date(apt.appointmentDate).toLocaleDateString()}</td>
                    <td className="text-primary-600 font-medium">{apt.appointmentTime}</td>
                    <td>{apt.patient?.user?.phone || 'N/A'}</td>
                    <td>{getStatusBadge(apt.status)}</td>
                    <td>
                      <div className="flex gap-2">
                        {/* Order Tests button - available for Scheduled and Completed appointments */}
                        {(apt.status === 'Scheduled' || apt.status === 'Completed') && (
                          <button
                            onClick={() => navigate(`/doctor/order-tests/${apt.id}`)}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors flex items-center gap-1"
                          >
                            <FlaskConical className="w-3.5 h-3.5" />
                            Order Tests
                          </button>
                        )}
                        {apt.status === 'Scheduled' && (
                          <>
                            <button
                              onClick={() => updateStatus(apt.id, 'Completed')}
                              disabled={updatingId === apt.id}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => updateStatus(apt.id, 'Cancelled')}
                              disabled={updatingId === apt.id}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorAppointments;
