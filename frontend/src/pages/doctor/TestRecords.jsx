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
  Loader2,
  Eye,
  X,
  Check,
  AlertCircle
} from 'lucide-react';

const TestRecords = () => {
  const [loading, setLoading] = useState(true);
  const [testOrders, setTestOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [filter, setFilter] = useState('PATHOLOGIST_VERIFIED');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTestRecords();
  }, [filter]);

  const fetchTestRecords = async () => {
    setLoading(true);
    try {
      let endpoint = '/test-orders/pending-verification';
      if (filter === 'DOCTOR_VERIFIED') {
        endpoint = '/test-orders/pending-verification?status=DOCTOR_VERIFIED';
      }
      const response = await api.get(endpoint);
      setTestOrders(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch test records:', error);
      toast.error('Failed to load test records');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (orderId) => {
    setVerifying(true);
    try {
      await api.put(`/test-orders/${orderId}/doctor-verify`);
      toast.success('Test result verified successfully!');
      fetchTestRecords();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to verify:', error);
      toast.error(error.response?.data?.message || 'Failed to verify test result');
    } finally {
      setVerifying(false);
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

  const formatResultData = (resultData) => {
    if (!resultData) return 'No data';
    if (resultData.value) return `${resultData.value} ${resultData.unit || ''}`;
    if (resultData.text) return resultData.text;
    if (resultData.fileUrl) return 'File uploaded';
    return JSON.stringify(resultData);
  };

  const filteredOrders = testOrders.filter(order => {
    if (!searchQuery) return true;
    const patientName = `${order.appointment?.patient?.user?.firstName} ${order.appointment?.patient?.user?.lastName}`.toLowerCase();
    const testName = order.test?.name?.toLowerCase();
    return patientName.includes(searchQuery.toLowerCase()) || testName?.includes(searchQuery.toLowerCase());
  });

  return (
    <DashboardLayout title="Test Records">
      {/* Filter Tabs */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('PATHOLOGIST_VERIFIED')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              filter === 'PATHOLOGIST_VERIFIED'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            Pending Verification
          </button>
          <button
            onClick={() => setFilter('DOCTOR_VERIFIED')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              filter === 'DOCTOR_VERIFIED'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Verified
          </button>
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

      {/* Alert for pending verifications */}
      {filter === 'PATHOLOGIST_VERIFIED' && filteredOrders.length > 0 && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-orange-500" />
          <div>
            <h4 className="font-semibold text-orange-800">Pending Verification</h4>
            <p className="text-sm text-orange-700">You have {filteredOrders.length} test result(s) waiting for your verification.</p>
          </div>
        </div>
      )}

      {/* Test Records Grid */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <FlaskConical className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Test Records</h3>
            <p className="text-gray-600">
              {filter === 'PATHOLOGIST_VERIFIED' 
                ? 'No tests pending your verification.' 
                : 'No verified test records yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Test</th>
                  <th>Result</th>
                  <th>Pathologist</th>
                  <th>Date</th>
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
                          <p className="text-sm text-gray-500">{order.appointment?.patient?.user?.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-gray-900">{order.test?.name}</p>
                        {getCategoryBadge(order.test?.category)}
                      </div>
                    </td>
                    <td>
                      <p className="text-sm text-gray-700 max-w-xs truncate">
                        {formatResultData(order.testResult?.resultData)}
                      </p>
                    </td>
                    <td>
                      <p className="text-sm text-gray-700">
                        {order.testResult?.verifiedBy?.user?.firstName} {order.testResult?.verifiedBy?.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.testResult?.verifiedAt && new Date(order.testResult.verifiedAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        {filter === 'PATHOLOGIST_VERIFIED' && (
                          <button
                            onClick={() => handleVerify(order.id)}
                            disabled={verifying}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
                          >
                            <Check className="w-4 h-4" />
                            Verify
                          </button>
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

      {/* View Result Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Test Result Details</h3>
                <p className="text-sm text-gray-500">{selectedOrder.test?.name}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
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
                    {selectedOrder.appointment?.patient?.user?.phone}
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

              {/* Result */}
              <div className="p-4 bg-green-50 rounded-xl">
                <h4 className="font-semibold text-green-800 mb-2">Test Result</h4>
                <p className="text-lg font-bold text-green-900">
                  {formatResultData(selectedOrder.testResult?.resultData)}
                </p>
                {selectedOrder.testResult?.impression && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-sm font-medium text-green-800">Pathologist Impression:</p>
                    <p className="text-sm text-green-700">{selectedOrder.testResult.impression}</p>
                  </div>
                )}
              </div>

              {/* Verified By */}
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-800">Verified by Pathologist</p>
                  <p className="font-medium text-blue-900">
                    {selectedOrder.testResult?.verifiedBy?.user?.firstName} {selectedOrder.testResult?.verifiedBy?.user?.lastName}
                  </p>
                  <p className="text-xs text-blue-700">
                    {selectedOrder.testResult?.verifiedAt && new Date(selectedOrder.testResult.verifiedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn btn-secondary flex-1"
              >
                Close
              </button>
              {selectedOrder.status === 'PATHOLOGIST_VERIFIED' && (
                <button
                  onClick={() => handleVerify(selectedOrder.id)}
                  disabled={verifying}
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Verify & Approve
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TestRecords;
