import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import api from '../../services/api';
import { 
  ClipboardList,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Eye,
  Download,
  Upload,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const GuestBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/diagnostics/guest-bookings${params}`);
      setBookings(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/diagnostics/guest-booking/${id}/approve`);
      toast.success('Booking approved successfully');
      fetchBookings();
      setShowModal(false);
    } catch (error) {
      console.error('Approve error:', error);
      toast.error('Failed to approve booking');
    }
  };

  const handleComplete = async (id, file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      if (file) {
        formData.append('report', file);
      }
      formData.append('notes', 'Report uploaded and ready for download');

      await api.put(`/diagnostics/guest-booking/${id}/complete`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast.success('Booking completed - Report uploaded');
      fetchBookings();
      setShowModal(false);
    } catch (error) {
      console.error('Complete error:', error);
      toast.error('Failed to complete booking');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await api.put(`/diagnostics/guest-booking/${id}/cancel`, {
        reason: 'Cancelled by admin'
      });
      toast.success('Booking cancelled');
      fetchBookings();
      setShowModal(false);
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-blue-100 text-blue-800',
      Completed: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800',
    };
    return `px-3 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredBookings = bookings.filter(booking => 
    booking.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.accessCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'Pending').length,
    approved: bookings.filter(b => b.status === 'Approved').length,
    completed: bookings.filter(b => b.status === 'Completed').length,
  };

  return (
    <DashboardLayout title="Guest Test Bookings">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-100 rounded-none p-4 border border-gray-300 shadow-sm relative">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-gray-200 rounded-none flex items-center justify-center shadow-sm">
              <ClipboardList className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-100 rounded-none p-4 border border-gray-300 shadow-sm relative">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-amber-100 rounded-none flex items-center justify-center shadow-sm">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-100 rounded-none p-4 border border-gray-300 shadow-sm relative">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-blue-100 rounded-none flex items-center justify-center shadow-sm">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
              <p className="text-sm text-gray-500">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-100 rounded-none p-4 border border-gray-300 shadow-sm relative">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-green-100 rounded-none flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-100 rounded-none border border-gray-300 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
              placeholder="Search by email, name, or access code..."
            />
          </div>
          <div className="w-full md:w-48 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input pl-10 w-full appearance-none"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-gray-100 rounded-none border border-gray-300 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-500">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-500">No guest test bookings match your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Guest</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Access Code</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Tests</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Total</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{booking.guestName || 'Guest'}</p>
                        <p className="text-sm text-gray-500">{booking.guestEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-primary-600">{booking.accessCode}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{booking.items?.length} test(s)</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">৳{booking.totalAmount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusBadge(booking.status)}>{booking.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">{formatDate(booking.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => { setSelectedBooking(booking); setShowModal(true); }}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
                <p className="text-sm text-gray-500">Access Code: {selectedBooking.accessCode}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={getStatusBadge(selectedBooking.status)}>{selectedBooking.status}</span>
                <span className="text-sm text-gray-500">{formatDate(selectedBooking.createdAt)}</span>
              </div>

              {/* Guest Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedBooking.guestEmail}</p>
                  </div>
                </div>
                {selectedBooking.guestPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedBooking.guestPhone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Branch</p>
                    <p className="font-medium">{selectedBooking.branch?.name}</p>
                  </div>
                </div>
              </div>

              {/* Tests */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Booked Tests</h3>
                <div className="bg-gray-50 rounded-xl divide-y">
                  {selectedBooking.items?.map((item) => (
                    <div key={item.id} className="p-4 flex justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{item.test?.name}</p>
                        <p className="text-sm text-gray-500">{item.test?.category} • Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-gray-900">৳{item.price * item.quantity}</p>
                    </div>
                  ))}
                  <div className="p-4 flex justify-between bg-primary-50">
                    <p className="font-semibold text-gray-900">Total</p>
                    <p className="text-xl font-bold text-primary-600">৳{selectedBooking.totalAmount}</p>
                  </div>
                </div>
              </div>

              {/* Report Download */}
              {selectedBooking.reportPath && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Report Available</p>
                        <p className="text-sm text-green-700">Report has been uploaded</p>
                      </div>
                    </div>
                    <a
                      href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${selectedBooking.reportPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer - Actions */}
            <div className="p-6 border-t bg-gray-50 flex flex-wrap gap-3">
              {selectedBooking.status === 'Pending' && (
                <>
                  <button
                    onClick={() => handleApprove(selectedBooking.id)}
                    className="btn btn-primary"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Booking
                  </button>
                  <button
                    onClick={() => handleCancel(selectedBooking.id)}
                    className="btn btn-outline text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </>
              )}
              
              {selectedBooking.status === 'Approved' && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleComplete(selectedBooking.id, e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="btn btn-primary"
                  >
                    {uploading ? (
                      <>
                        <div className="spinner w-4 h-4 mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Report & Complete
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleComplete(selectedBooking.id, null)}
                    disabled={uploading}
                    className="btn btn-outline"
                  >
                    Complete Without Report
                  </button>
                </>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="btn btn-ghost ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default GuestBookings;
