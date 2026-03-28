import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import api from '../../services/api';
import { 
  FileText,
  Search,
  Filter,
  Clock,
  CheckCircle,
  Eye,
  Download,
  User,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const LabReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const response = await api.get('/lab-reports', { params });
      setReports(response.data.data?.reports || []);
    } catch (error) {
      console.error('Error fetching lab reports:', error);
      toast.error('Failed to fetch lab reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Completed: 'bg-green-100 text-green-800',
      Reviewed: 'bg-blue-100 text-blue-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredReports = reports.filter(report => {
    const searchLower = searchTerm.toLowerCase();
    return (
      report.reportName?.toLowerCase().includes(searchLower) ||
      report.patient?.user?.firstName?.toLowerCase().includes(searchLower) ||
      report.patient?.user?.lastName?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <DashboardLayout title="Lab Reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lab Reports</h1>
            <p className="text-gray-500 mt-1">Manage and view all lab reports</p>
          </div>
        </div>

        {/* Filters */}
        <div className="relative bg-gray-100 rounded-none border border-gray-300 p-4 shadow-sm">
          <div className="relative flex flex-col sm:flex-row gap-4 z-10">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by report name or patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Reviewed">Reviewed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Table/List */}
        <div className="relative bg-gray-100 rounded-none border border-gray-300 overflow-hidden shadow-sm">
          {loading ? (
            <div className="relative p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="relative p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Lab Reports Yet</h3>
              <p className="text-gray-500">Lab reports will appear here once they are created.</p>
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-100 rounded-none flex items-center justify-center">
                            <FileText className="w-5 h-5 text-teal-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{report.reportName}</p>
                            <p className="text-sm text-gray-500">ID: {report.id?.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">
                            {report.patient?.user?.firstName} {report.patient?.user?.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{formatDate(report.reportDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-xs font-medium ${getStatusBadge(report.status)}`}>
                          {report.status === 'Pending' && <Clock className="w-3 h-3" />}
                          {report.status === 'Completed' && <CheckCircle className="w-3 h-3" />}
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button 
                            className="p-2 hover:bg-gray-100 rounded-none transition-colors"
                            title="View Report"
                          >
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          {report.filePath && (
                            <a 
                              href={report.filePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-gray-100 rounded-none transition-colors"
                              title="Download Report"
                            >
                              <Download className="w-4 h-4 text-gray-500" />
                            </a>
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
      </div>
    </DashboardLayout>
  );
};

export default LabReports;
