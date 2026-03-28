import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FlaskConical, 
  Search, 
  User,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Send,
  Loader2,
  AlertTriangle,
  X
} from 'lucide-react';

const PendingTests = () => {
  const [loading, setLoading] = useState(true);
  const [testOrders, setTestOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [resultData, setResultData] = useState({});
  const [impression, setImpression] = useState('');
  const [filter, setFilter] = useState('ORDERED');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPendingTests();
  }, [filter]);

  const fetchPendingTests = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/test-orders/pending?status=${filter}`);
      setTestOrders(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch test orders:', error);
      toast.error('Failed to load pending tests');
    } finally {
      setLoading(false);
    }
  };

  const openResultModal = (order) => {
    setSelectedOrder(order);
    setResultData({});
    setImpression('');
    
    // Pre-populate based on input type
    if (order.test.inputType === 'NUMERIC') {
      setResultData({ value: '', unit: order.test.unit || '' });
    } else if (order.test.inputType === 'TEXT') {
      setResultData({ text: '' });
    } else {
      setResultData({ fileUrl: '' });
    }
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setResultData({});
    setImpression('');
  };

  const handleSubmitResult = async () => {
    if (!selectedOrder) return;

    // Validate result data
    if (selectedOrder.test.inputType === 'NUMERIC' && !resultData.value) {
      toast.error('Please enter the test value');
      return;
    }
    if (selectedOrder.test.inputType === 'TEXT' && !resultData.text) {
      toast.error('Please enter the test result');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/test-orders/${selectedOrder.id}/result`, {
        resultData,
        impression,
      });
      
      toast.success('Test result submitted successfully!');
      closeModal();
      fetchPendingTests();
    } catch (error) {
      console.error('Failed to submit result:', error);
      toast.error(error.response?.data?.message || 'Failed to submit result');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryBadge = (category) => {
    const badges = {
      LAB: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Lab' },
      IMAGING: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Imaging' },
      PROCEDURE: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Procedure' },
    };
    const badge = badges[category] || badges.LAB;
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>{badge.label}</span>;
  };

  const getStatusBadge = (status) => {
    const badges = {
      ORDERED: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Pending' },
      IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Loader2, label: 'In Progress' },
      PATHOLOGIST_VERIFIED: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Verified' },
    };
    const badge = badges[status] || badges.ORDERED;
    const Icon = badge.icon;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const filteredOrders = testOrders.filter(order => {
    if (!searchQuery) return true;
    const patientName = `${order.appointment?.patient?.user?.firstName} ${order.appointment?.patient?.user?.lastName}`.toLowerCase();
    const testName = order.test?.name?.toLowerCase();
    return patientName.includes(searchQuery.toLowerCase()) || testName?.includes(searchQuery.toLowerCase());
  });

  return (
    <DashboardLayout title="Pending Tests">
      {/* Filter Tabs */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          {['ORDERED', 'IN_PROGRESS', 'PATHOLOGIST_VERIFIED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'ORDERED' ? 'Pending' : status === 'IN_PROGRESS' ? 'In Progress' : 'Verified'}
            </button>
          ))}
        </div>
        
        {/* Search */}
        <div className="flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient or test..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Test Orders Grid */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <FlaskConical className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Tests Found</h3>
            <p className="text-gray-600">
              {filter === 'ORDERED' 
                ? 'No pending tests to process.' 
                : `No ${filter.toLowerCase().replace('_', ' ')} tests.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Test</th>
                  <th>Category</th>
                  <th>Doctor</th>
                  <th>Priority</th>
                  <th>Ordered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {order.appointment?.patient?.user?.firstName?.[0]}
                          {order.appointment?.patient?.user?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.appointment?.patient?.user?.firstName} {order.appointment?.patient?.user?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{order.appointment?.patient?.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-gray-900">{order.test?.name}</p>
                        {order.test?.referenceRange && (
                          <p className="text-xs text-gray-500">Ref: {order.test.referenceRange}</p>
                        )}
                      </div>
                    </td>
                    <td>{getCategoryBadge(order.test?.category)}</td>
                    <td>
                      <p className="text-sm text-gray-700">
                        Dr. {order.appointment?.doctor?.user?.firstName} {order.appointment?.doctor?.user?.lastName}
                      </p>
                    </td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.priority === 'Urgent' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      {filter === 'ORDERED' && (
                        <button
                          onClick={() => openResultModal(order)}
                          className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-1"
                        >
                          <FileText className="w-4 h-4" />
                          Enter Result
                        </button>
                      )}
                      {filter === 'PATHOLOGIST_VERIFIED' && (
                        <span className="text-green-600 flex items-center gap-1 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Result Entry Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Enter Test Result</h3>
                <p className="text-sm text-gray-500">{selectedOrder.test?.name}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Patient Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <User className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedOrder.appointment?.patient?.user?.firstName} {selectedOrder.appointment?.patient?.user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    Ordered by Dr. {selectedOrder.appointment?.doctor?.user?.firstName}
                  </p>
                </div>
              </div>

              {/* Test Info */}
              <div className="p-3 bg-purple-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-purple-900">{selectedOrder.test?.name}</span>
                  {getCategoryBadge(selectedOrder.test?.category)}
                </div>
                {selectedOrder.test?.referenceRange && (
                  <p className="text-sm text-purple-700">Reference: {selectedOrder.test.referenceRange}</p>
                )}
              </div>

              {/* Clinical Note */}
              {selectedOrder.clinicalNote && (
                <div className="p-3 bg-yellow-50 rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Clinical Note:</p>
                      <p className="text-sm text-yellow-700">{selectedOrder.clinicalNote}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Result Input based on type */}
              <div>
                <label className="label">Test Result</label>
                {selectedOrder.test?.inputType === 'NUMERIC' && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={resultData.value}
                      onChange={(e) => setResultData({ ...resultData, value: e.target.value })}
                      placeholder="Enter value"
                      className="input flex-1"
                      step="any"
                    />
                    <input
                      type="text"
                      value={resultData.unit}
                      onChange={(e) => setResultData({ ...resultData, unit: e.target.value })}
                      placeholder="Unit"
                      className="input w-24"
                    />
                  </div>
                )}
                {selectedOrder.test?.inputType === 'TEXT' && (
                  <textarea
                    value={resultData.text}
                    onChange={(e) => setResultData({ ...resultData, text: e.target.value })}
                    placeholder="Enter test result details..."
                    className="input resize-none"
                    rows={4}
                  />
                )}
                {selectedOrder.test?.inputType === 'FILE' && (
                  <input
                    type="text"
                    value={resultData.fileUrl}
                    onChange={(e) => setResultData({ ...resultData, fileUrl: e.target.value })}
                    placeholder="Enter file URL or path..."
                    className="input"
                  />
                )}
              </div>

              {/* Impression */}
              <div>
                <label className="label">Impression / Comments (Optional)</label>
                <textarea
                  value={impression}
                  onChange={(e) => setImpression(e.target.value)}
                  placeholder="Add any additional notes or impressions..."
                  className="input resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={closeModal}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitResult}
                disabled={submitting}
                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit & Verify
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PendingTests;
