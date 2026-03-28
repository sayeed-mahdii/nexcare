import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FlaskConical, 
  Search, 
  Plus, 
  X, 
  Check,
  ArrowLeft,
  AlertCircle,
  Loader2,
  User,
  Calendar,
  FileText,
  Sparkles,
  Star,
  UserCheck,
  ChevronDown
} from 'lucide-react';

const OrderTests = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [tests, setTests] = useState({
    mandatoryTests: [],
    departmentTests: [],
    generalTests: [],
    searchResults: [],
  });
  const [selectedTests, setSelectedTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [existingOrders, setExistingOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('department');
  const [pathologists, setPathologists] = useState([]);
  const [selectedPathologist, setSelectedPathologist] = useState('');

  useEffect(() => {
    fetchData();
  }, [appointmentId]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => searchTests(), 300);
      return () => clearTimeout(timer);
    } else {
      setTests(prev => ({ ...prev, searchResults: [] }));
    }
  }, [searchQuery]);

  const fetchData = async () => {
    try {
      // Fetch appointment details
      const aptResponse = await api.get(`/appointments/${appointmentId}`);
      const aptData = aptResponse.data.data;
      setAppointment(aptData);

      // Fetch tests for ordering based on doctor's department
      const testsResponse = await api.get(`/tests/ordering/${aptData.doctor.departmentId}`);
      setTests(testsResponse.data.data);

      // Fetch existing test orders for this appointment
      const ordersResponse = await api.get(`/test-orders/appointment/${appointmentId}`);
      setExistingOrders(ordersResponse.data.data || []);

      // Fetch pathologists for dropdown
      const pathResponse = await api.get('/users/list/pathologists');
      setPathologists(pathResponse.data.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load appointment data');
    } finally {
      setLoading(false);
    }
  };

  const searchTests = async () => {
    if (searchQuery.length < 2) return;
    setSearching(true);
    try {
      const response = await api.get(`/tests/ordering/${appointment.doctor.departmentId}?search=${searchQuery}`);
      setTests(prev => ({ ...prev, searchResults: response.data.data.searchResults || [] }));
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const toggleTest = (test) => {
    // Check if already ordered
    if (existingOrders.some(order => order.testId === test.id)) {
      toast.error('This test is already ordered');
      return;
    }

    setSelectedTests(prev => {
      const exists = prev.find(t => t.id === test.id);
      if (exists) {
        return prev.filter(t => t.id !== test.id);
      } else {
        return [...prev, { ...test, clinicalNote: '' }];
      }
    });
  };

  const updateClinicalNote = (testId, note) => {
    setSelectedTests(prev => 
      prev.map(t => t.id === testId ? { ...t, clinicalNote: note } : t)
    );
  };

  const handleSubmit = async () => {
    if (selectedTests.length === 0) {
      toast.error('Please select at least one test');
      return;
    }

    if (!selectedPathologist) {
      toast.error('Please select a pathologist');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/test-orders/bulk', {
        appointmentId,
        pathologistId: selectedPathologist,
        tests: selectedTests.map(t => ({
          testId: t.id,
          clinicalNote: t.clinicalNote || null,
          priority: 'Normal',
        })),
      });

      toast.success(`${selectedTests.length} test(s) ordered successfully!`);
      navigate('/doctor/appointments');
    } catch (error) {
      console.error('Failed to order tests:', error);
      toast.error(error.response?.data?.message || 'Failed to order tests');
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

  const TestCard = ({ test, isSelected }) => {
    const isOrdered = existingOrders.some(order => order.testId === test.id);
    
    return (
      <div
        onClick={() => !isOrdered && toggleTest(test)}
        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
          isOrdered
            ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
            : isSelected
              ? 'border-primary-500 bg-primary-50 shadow-md'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {test.isMandatory && (
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              )}
              <h4 className="font-semibold text-gray-900">{test.name}</h4>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {getCategoryBadge(test.category)}
              {test.isGeneral && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">General</span>
              )}
              {test.price > 0 && (
                <span className="text-sm text-gray-500">৳{test.price}</span>
              )}
            </div>
          </div>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            isOrdered
              ? 'bg-gray-300'
              : isSelected
                ? 'bg-primary-500 text-white'
                : 'border-2 border-gray-300'
          }`}>
            {isOrdered ? (
              <Check className="w-4 h-4 text-white" />
            ) : isSelected ? (
              <Check className="w-4 h-4" />
            ) : null}
          </div>
        </div>
        {test.referenceRange && (
          <p className="text-xs text-gray-500 mt-1">Ref: {test.referenceRange}</p>
        )}
        {isOrdered && (
          <p className="text-xs text-gray-500 mt-1 italic">Already ordered</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout title="Order Tests">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="spinner" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Order Tests">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Order Lab Tests</h2>
          <p className="text-sm text-gray-500">Select tests to order for this appointment</p>
        </div>
      </div>

      {/* Patient Info Card */}
      {appointment && (
        <div className="card mb-6 bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {appointment.patient?.user?.firstName?.[0]}{appointment.patient?.user?.lastName?.[0]}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">
                {appointment.patient?.user?.firstName} {appointment.patient?.user?.lastName}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(appointment.appointmentDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {appointment.patient?.user?.phone || 'No phone'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Test Selection Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search Bar */}
          <div className="card">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all tests..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {searching && (
                <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
              )}
            </div>

            {/* Search Results */}
            {tests.searchResults?.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Search Results</h4>
                <div className="grid gap-2">
                  {tests.searchResults.map(test => (
                    <TestCard
                      key={test.id}
                      test={test}
                      isSelected={selectedTests.some(t => t.id === test.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tabs for Test Categories */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-3">
              <button
                onClick={() => setActiveTab('department')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'department'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                Department Tests
              </button>
              <button
                onClick={() => setActiveTab('general')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'general'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FlaskConical className="w-4 h-4 inline mr-2" />
                General Tests
              </button>
            </div>

            {/* Department Tests */}
            {activeTab === 'department' && (
              <div className="space-y-4">
                {/* Mandatory Tests */}
                {tests.mandatoryTests?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Essential Tests
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {tests.mandatoryTests.map(test => (
                        <TestCard
                          key={test.id}
                          test={test}
                          isSelected={selectedTests.some(t => t.id === test.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Department Suggested Tests */}
                {tests.departmentTests?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Department Suggested</h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {tests.departmentTests.map(test => (
                        <TestCard
                          key={test.id}
                          test={test}
                          isSelected={selectedTests.some(t => t.id === test.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {!tests.mandatoryTests?.length && !tests.departmentTests?.length && (
                  <div className="text-center py-8 text-gray-500">
                    <FlaskConical className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No department-specific tests available</p>
                  </div>
                )}
              </div>
            )}

            {/* General Tests */}
            {activeTab === 'general' && (
              <div className="grid sm:grid-cols-2 gap-3">
                {tests.generalTests?.map(test => (
                  <TestCard
                    key={test.id}
                    test={test}
                    isSelected={selectedTests.some(t => t.id === test.id)}
                  />
                ))}
                {!tests.generalTests?.length && (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    <FlaskConical className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No general tests available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected Tests Panel */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              Selected Tests ({selectedTests.length})
            </h3>

            {selectedTests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Plus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Select tests from the left panel</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                {selectedTests.map(test => (
                  <div key={test.id} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{test.name}</h4>
                        {getCategoryBadge(test.category)}
                      </div>
                      <button
                        onClick={() => toggleTest(test)}
                        className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                    <textarea
                      placeholder="Clinical note (optional)"
                      value={test.clinicalNote}
                      onChange={(e) => updateClinicalNote(test.id, e.target.value)}
                      className="w-full mt-2 p-2 text-sm border border-gray-200 rounded-lg resize-none"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Pathologist Selection */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserCheck className="w-4 h-4 inline mr-1" />
                Assign to Pathologist *
              </label>
              <div className="relative">
                <select
                  value={selectedPathologist}
                  onChange={(e) => setSelectedPathologist(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
                >
                  <option value="">Select a pathologist...</option>
                  {pathologists.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.user?.firstName} {p.user?.lastName} - {p.specialization}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3 text-sm">
                <span className="text-gray-600">Total Tests:</span>
                <span className="font-bold text-gray-900">{selectedTests.length}</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={selectedTests.length === 0 || submitting}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Ordering...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Order Tests
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrderTests;
