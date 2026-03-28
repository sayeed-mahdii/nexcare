import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import api from '../../services/api';
import { 
  FileText, 
  Download, 
  Eye,
  Calendar,
  User,
  CheckCircle,
  Clock,
  FlaskConical,
  X
} from 'lucide-react';

const LabReports = () => {
  const [reports, setReports] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('test-results');
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch lab reports
      const reportsResponse = await api.get('/patients/my/lab-reports');
      setReports(reportsResponse.data.data || []);

      // Fetch verified test results
      try {
        const testResponse = await api.get('/test-orders/my-results');
        setTestResults(testResponse.data.data || []);
      } catch (err) {
        console.log('No test results endpoint or no data');
        setTestResults([]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="badge badge-warning flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
      case 'Completed':
        return <span className="badge badge-success flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Completed</span>;
      case 'Reviewed':
        return <span className="badge badge-primary flex items-center gap-1"><Eye className="w-3 h-3" /> Reviewed</span>;
      default:
        return <span className="badge">{status}</span>;
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

  return (
    <DashboardLayout title="Lab Reports">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab('test-results')}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === 'test-results'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          Test Results ({testResults.length})
        </button>
        <button
          onClick={() => setActiveTab('lab-reports')}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === 'lab-reports'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Lab Reports ({reports.length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          {/* Test Results Tab */}
          {activeTab === 'test-results' && (
            <>
              {testResults.length === 0 ? (
                <div className="text-center py-20 card">
                  <FlaskConical className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Test Results</h3>
                  <p className="text-gray-600">You don't have any verified test results yet.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {testResults.map((order) => (
                    <div key={order.id} className="card hover:shadow-elevated transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-green-100">
                          <FlaskConical className="w-7 h-7 text-green-600" />
                        </div>
                        <span className="badge badge-success flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-2">{order.test?.name}</h3>
                      <div className="mb-2">{getCategoryBadge(order.test?.category)}</div>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          Dr. {order.appointment?.doctor?.user?.firstName} {order.appointment?.doctor?.user?.lastName}
                        </div>
                      </div>

                      <div className="p-3 bg-green-50 rounded-xl mb-4">
                        <p className="text-sm font-medium text-green-800 mb-1">Result:</p>
                        <p className="text-lg font-bold text-green-900">
                          {formatResultData(order.testResult?.resultData)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSelectedResult(order)}
                          className="btn btn-outline flex-1 py-2"
                        >
                          <Eye className="w-4 h-4 mr-2" /> View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Lab Reports Tab */}
          {activeTab === 'lab-reports' && (
            <>
              {reports.length === 0 ? (
                <div className="text-center py-20 card">
                  <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Lab Reports</h3>
                  <p className="text-gray-600">You don't have any lab reports yet.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reports.map((report) => (
                    <div key={report.id} className="card hover:shadow-elevated transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                          report.status === 'Completed' ? 'bg-green-100' : 
                          report.status === 'Pending' ? 'bg-yellow-100' : 'bg-primary-100'
                        }`}>
                          <FileText className={`w-7 h-7 ${
                            report.status === 'Completed' ? 'text-green-600' : 
                            report.status === 'Pending' ? 'text-yellow-600' : 'text-primary-600'
                          }`} />
                        </div>
                        {getStatusBadge(report.status)}
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-2">{report.reportName}</h3>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(report.reportDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {report.pathologist ? 
                            `${report.pathologist.user.firstName} ${report.pathologist.user.lastName}` : 
                            'Pending assignment'}
                        </div>
                      </div>

                      {report.notes && (
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{report.notes}</p>
                      )}

                      <div className="flex gap-2">
                        <button className="btn btn-outline flex-1 py-2">
                          <Eye className="w-4 h-4 mr-2" /> View
                        </button>
                        <button className="btn btn-primary flex-1 py-2">
                          <Download className="w-4 h-4 mr-2" /> Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Test Result Detail Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Test Result Details</h3>
                <p className="text-sm text-gray-500">{selectedResult.test?.name}</p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Test Info */}
              <div className="p-3 bg-purple-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-purple-900">{selectedResult.test?.name}</span>
                  {getCategoryBadge(selectedResult.test?.category)}
                </div>
                {selectedResult.test?.referenceRange && (
                  <p className="text-sm text-purple-700">Reference: {selectedResult.test.referenceRange}</p>
                )}
              </div>

              {/* Result */}
              <div className="p-4 bg-green-50 rounded-xl">
                <h4 className="font-semibold text-green-800 mb-2">Test Result</h4>
                <p className="text-2xl font-bold text-green-900">
                  {formatResultData(selectedResult.testResult?.resultData)}
                </p>
                {selectedResult.testResult?.impression && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-sm font-medium text-green-800">Pathologist Notes:</p>
                    <p className="text-sm text-green-700">{selectedResult.testResult.impression}</p>
                  </div>
                )}
              </div>

              {/* Doctor Info */}
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-800">Ordered by</p>
                  <p className="font-medium text-blue-900">
                    Dr. {selectedResult.appointment?.doctor?.user?.firstName} {selectedResult.appointment?.doctor?.user?.lastName}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">
                    Ordered: {new Date(selectedResult.createdAt).toLocaleDateString()}
                  </p>
                  {selectedResult.testResult?.verifiedAt && (
                    <p className="text-sm text-gray-600">
                      Verified: {new Date(selectedResult.testResult.verifiedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100">
              <button
                onClick={() => setSelectedResult(null)}
                className="btn btn-primary w-full"
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

export default LabReports;
