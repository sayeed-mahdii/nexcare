import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  Clock, 
  MapPin,
  X,
  CheckCircle,
  AlertCircle,
  XCircle,
  Filter,
  Star,
  MessageSquare
} from 'lucide-react';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelingId, setCancelingId] = useState(null);
  
  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/patients/my/appointments');
      setAppointments(response.data.data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    setCancelingId(id);
    try {
      await api.delete(`/appointments/${id}`);
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to cancel appointment');
    } finally {
      setCancelingId(null);
    }
  };

  const openRatingModal = (apt) => {
    setSelectedAppointment(apt);
    setRating(0);
    setHoverRating(0);
    setFeedback('');
    setShowRatingModal(true);
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setSelectedAppointment(null);
    setRating(0);
    setFeedback('');
  };

  const submitRating = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmittingRating(true);
    try {
      await api.post('/ratings', {
        appointmentId: selectedAppointment.id,
        rating,
        feedback: feedback.trim() || null,
      });
      toast.success('Thank you for your feedback!');
      closeRatingModal();
      fetchAppointments(); // Refresh to show rated status
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Scheduled':
        return <span className="badge badge-primary flex items-center gap-1"><Clock className="w-3 h-3" /> Scheduled</span>;
      case 'Completed':
        return <span className="badge badge-success flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Completed</span>;
      case 'Cancelled':
        return <span className="badge badge-danger flex items-center gap-1"><XCircle className="w-3 h-3" /> Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const StarRating = ({ value, hover, onSelect, onHover, onLeave }) => {
    return (
      <div className="flex gap-1" onMouseLeave={onLeave}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onSelect(star)}
            onMouseEnter={() => onHover(star)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= (hover || value)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout title="My Appointments">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'Scheduled', 'Completed', 'Cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="spinner"></div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-20 card">
          <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Appointments Found</h3>
          <p className="text-gray-600">
            {filter === 'all' ? "You haven't booked any appointments yet." : `No ${filter.toLowerCase()} appointments.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => (
            <div key={apt.id} className="card hover:shadow-elevated transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Doctor Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {apt.doctor?.user?.firstName?.[0]}{apt.doctor?.user?.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Dr. {apt.doctor?.user?.firstName} {apt.doctor?.user?.lastName}
                    </h3>
                    <p className="text-sm text-primary-600">{apt.doctor?.department?.name}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <MapPin className="w-4 h-4" />
                      {apt.branch?.name}
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-6">
                  <div className="text-center px-4 py-3 bg-gray-50 rounded-xl">
                    <Calendar className="w-5 h-5 mx-auto text-primary-600 mb-1" />
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(apt.appointmentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-center px-4 py-3 bg-gray-50 rounded-xl">
                    <Clock className="w-5 h-5 mx-auto text-primary-600 mb-1" />
                    <p className="text-sm font-medium text-gray-900">{apt.appointmentTime}</p>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-3">
                  {getStatusBadge(apt.status)}
                  
                  {apt.status === 'Scheduled' && (
                    <button
                      onClick={() => handleCancel(apt.id)}
                      disabled={cancelingId === apt.id}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      title="Cancel Appointment"
                    >
                      {cancelingId === apt.id ? (
                        <div className="w-5 h-5 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                    </button>
                  )}
                  
                  {/* Rate Doctor Button - only for completed appointments without rating */}
                  {apt.status === 'Completed' && !apt.rating && (
                    <button
                      onClick={() => openRatingModal(apt)}
                      className="btn btn-sm bg-yellow-100 text-yellow-700 hover:bg-yellow-200 flex items-center gap-1"
                    >
                      <Star className="w-4 h-4" /> Rate
                    </button>
                  )}
                  
                  {/* Show existing rating */}
                  {apt.rating && (
                    <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-lg">
                      <Star className="w-4 h-4 fill-yellow-500" />
                      <span className="font-medium">{apt.rating.rating}</span>
                    </div>
                  )}
                </div>
              </div>

              {apt.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">Notes: {apt.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Rate Your Visit</h2>
              <button
                onClick={closeRatingModal}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-xl font-bold mb-3">
                {selectedAppointment.doctor?.user?.firstName?.[0]}{selectedAppointment.doctor?.user?.lastName?.[0]}
              </div>
              <h3 className="font-semibold text-gray-900">
                Dr. {selectedAppointment.doctor?.user?.firstName} {selectedAppointment.doctor?.user?.lastName}
              </h3>
              <p className="text-sm text-gray-500">{selectedAppointment.doctor?.department?.name}</p>
            </div>

            <div className="mb-6">
              <label className="block text-center text-gray-700 font-medium mb-3">How was your experience?</label>
              <div className="flex justify-center">
                <StarRating
                  value={rating}
                  hover={hoverRating}
                  onSelect={setRating}
                  onHover={setHoverRating}
                  onLeave={() => setHoverRating(0)}
                />
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Feedback (Optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your experience with others..."
                className="input min-h-[100px] w-full"
                maxLength={500}
              />
              <p className="text-xs text-gray-400 text-right mt-1">{feedback.length}/500</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeRatingModal}
                className="flex-1 btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={submitRating}
                disabled={submittingRating || rating === 0}
                className="flex-1 btn btn-primary"
              >
                {submittingRating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Rating'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyAppointments;
