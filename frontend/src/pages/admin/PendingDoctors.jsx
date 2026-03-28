import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  UserCheck, 
  UserX,
  Clock,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  Calendar,
  X,
  AlertTriangle
} from 'lucide-react';

const PendingDoctors = () => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    try {
      const response = await api.get('/doctors/pending/list');
      setPendingDoctors(response.data.data);
    } catch (error) {
      console.error('Failed to fetch pending doctors:', error);
      toast.error('Failed to load pending doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctor) => {
    setActionLoading(doctor.id);
    try {
      await api.put(`/doctors/${doctor.id}/approve`);
      toast.success(`Dr. ${doctor.user.firstName} ${doctor.user.lastName} has been approved!`);
      setPendingDoctors(prev => prev.filter(d => d.id !== doctor.id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve doctor');
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (doctor) => {
    setSelectedDoctor(doctor);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setActionLoading(selectedDoctor.id);
    try {
      await api.put(`/doctors/${selectedDoctor.id}/reject`, { reason: rejectReason });
      toast.success(`Dr. ${selectedDoctor.user.firstName} ${selectedDoctor.user.lastName}'s application has been rejected.`);
      setPendingDoctors(prev => prev.filter(d => d.id !== selectedDoctor.id));
      setShowRejectModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject doctor');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout title="Pending Doctor Approvals">
      {/* Header Stats */}
      <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-800">{pendingDoctors.length}</p>
            <p className="text-yellow-600">Pending Applications</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="spinner"></div>
        </div>
      ) : pendingDoctors.length === 0 ? (
        <div className="card text-center py-16">
          <UserCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-500">There are no pending doctor applications to review.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingDoctors.map((doctor) => (
            <div key={doctor.id} className="card hover:shadow-elevated transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Doctor Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                      {doctor.user.firstName[0]}{doctor.user.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Dr. {doctor.user.firstName} {doctor.user.lastName}
                      </h3>
                      <p className="text-gray-500 flex items-center gap-2 mt-1">
                        <GraduationCap className="w-4 h-4" />
                        {doctor.qualification}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {doctor.user.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {doctor.user.phone || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {doctor.department?.name} - {doctor.department?.branch?.name}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          Applied: {new Date(doctor.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <span className="badge badge-primary">{doctor.experienceYears} Years Exp.</span>
                        <span className="badge badge-warning">Pending Review</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 lg:flex-col">
                  <button
                    onClick={() => handleApprove(doctor)}
                    disabled={actionLoading === doctor.id}
                    className="btn btn-primary flex-1"
                  >
                    {actionLoading === doctor.id ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <UserCheck className="w-5 h-5 mr-2" /> Approve
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => openRejectModal(doctor)}
                    disabled={actionLoading === doctor.id}
                    className="btn btn-outline border-red-500 text-red-500 hover:bg-red-500 hover:text-white flex-1"
                  >
                    <UserX className="w-5 h-5 mr-2" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedDoctor && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Reject Application</h3>
              <button onClick={() => setShowRejectModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 bg-red-50 rounded-xl mb-4 flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">
                  Rejecting Dr. {selectedDoctor.user.firstName} {selectedDoctor.user.lastName}
                </p>
                <p className="text-sm text-red-600 mt-1">
                  This will prevent the doctor from accessing the system. Please provide a reason.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="label">Rejection Reason *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="input min-h-[100px]"
                placeholder="Please provide a reason for rejection..."
                required
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowRejectModal(false)} className="btn btn-ghost">
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading === selectedDoctor.id}
                className="btn bg-red-500 text-white hover:bg-red-600"
              >
                {actionLoading === selectedDoctor.id ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PendingDoctors;
