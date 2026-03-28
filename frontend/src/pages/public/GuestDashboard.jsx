import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../services/api';
import { 
  ClipboardList,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  MapPin,
  Calendar,
  Mail,
  ArrowRight,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const GuestDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [accessCode, setAccessCode] = useState(() => {
    try {
      return searchParams.get('code') || sessionStorage.getItem('guestAccessCode') || '';
    } catch (e) {
      return searchParams.get('code') || '';
    }
  });
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessCode) {
       toast.error('Please login first');
       navigate('/guest/login', { replace: true });
       return;
    }
    
    // If a code was present in the URL, clear it from the address bar
    if (searchParams.get('code')) {
      navigate('/guest-dashboard', { replace: true });
    }

    // If we got an access code, persist it to sessionStorage for navigation without query params
    if (accessCode) {
      try {
        sessionStorage.setItem('guestAccessCode', accessCode);
      } catch (e) {
        // ignore
      }
    }

    fetchBooking();
  }, [accessCode, navigate]);

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/diagnostics/guest-booking/${accessCode}`);
      if (res.data.success) {
        setBooking(res.data.data);
      }
    } catch (error) {
      console.error('Fetch booking error:', error);
      if (error.response?.status === 404) {
        toast.error('Booking not found');
        navigate('/guest/login');
      } else {
        toast.error('Failed to fetch booking details');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'Pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          label: 'Pending Approval',
          description: 'Your booking is awaiting admin approval. You will be notified once approved.'
        };
      case 'Approved':
        return {
          icon: CheckCircle,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          label: 'Approved - In Progress',
          description: 'Your booking has been approved. Your test is being processed.'
        };
      case 'Completed':
        return {
          icon: FileText,
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          label: 'Completed - Report Ready',
          description: 'Your test report is ready for download.'
        };
      case 'Cancelled':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          label: 'Cancelled',
          description: 'This booking has been cancelled.'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          label: 'Unknown',
          description: ''
        };
    }
  };

  const downloadReport = () => {
    if (booking?.reportPath) {
      window.open(`http://localhost:5000${booking.reportPath}`, '_blank');
    }
  };

  const downloadReceipt = () => {
    window.open(`http://localhost:5000/api/diagnostics/guest-booking/${accessCode}/receipt`, '_blank');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-80" />
          <h1 className="text-4xl font-bold mb-4">Guest Dashboard</h1>
          <p className="text-xl text-white/80">Track your diagnostic test booking status</p>
        </div>
      </section>

      {/* Booking Details */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-600">Loading booking details...</p>
            </div>
          ) : booking ? (
            <div className="space-y-6">
              {/* Status Card */}
              {(() => {
                const statusInfo = getStatusInfo(booking.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <div className={`${statusInfo.bg} ${statusInfo.border} border-2 rounded-2xl p-6`}>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                      <div className={`w-16 h-16 ${statusInfo.bg} rounded-full flex items-center justify-center`}>
                        <StatusIcon className={`w-8 h-8 ${statusInfo.color}`} />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h2 className={`text-2xl font-bold ${statusInfo.color}`}>
                          {statusInfo.label}
                        </h2>
                        <p className="text-gray-600 mt-1">{statusInfo.description}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {/* Only show download buttons after admin approval */}
                        {(booking.status === 'Approved' || booking.status === 'Completed') && (
                          <button
                              onClick={downloadReceipt}
                              className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                          >
                              <FileText className="w-5 h-5" />
                              Download Receipt
                          </button>
                        )}
                        {booking.status === 'Completed' && booking.reportPath && (
                            <button
                            onClick={downloadReport}
                            className="btn btn-primary flex items-center justify-center gap-2"
                            >
                            <Download className="w-5 h-5" />
                            Download Report
                            </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Booking Info */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                  <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
                </div>
                
                <div className="p-6 grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{booking.guestEmail}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Branch</p>
                      <p className="font-medium text-gray-900">
                        {booking.branch?.name} - {booking.branch?.location?.city}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Booking Date</p>
                      <p className="font-medium text-gray-900">{formatDate(booking.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <ClipboardList className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-bold text-xl text-primary-600">৳{booking.totalAmount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booked Tests */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                  <h3 className="text-xl font-bold text-gray-900">Booked Tests</h3>
                </div>
                
                <div className="divide-y">
                  {booking.items?.map((item) => (
                    <div key={item.id} className="p-6 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.test?.name}</h4>
                        <p className="text-sm text-gray-500">{item.test?.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        <p className="font-bold text-gray-900">৳{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {booking.notes && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Notes</h3>
                  <p className="text-gray-600">{booking.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">No Booking Found</h2>
            </div>
          )}
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-16 bg-gradient-to-r from-secondary-500 to-primary-600 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <UserPlus className="w-16 h-16 mx-auto text-white/80 mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Be a Part of Our Journey</h2>
          <p className="text-xl text-white/80 mb-8">
            Create an account to access complete health records, track appointments, and get personalized care.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
            Register Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GuestDashboard;
