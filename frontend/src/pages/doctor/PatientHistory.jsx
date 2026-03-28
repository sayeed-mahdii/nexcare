import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import api from '../../services/api';
import { 
  Search, 
  User,
  FileText,
  Calendar
} from 'lucide-react';

const PatientHistory = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data.data.patients);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientDetails = async (id) => {
    try {
      const response = await api.get(`/patients/${id}`);
      setSelectedPatient(response.data.data);
    } catch (error) {
      console.error('Failed to fetch patient:', error);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const name = `${patient.user.firstName} ${patient.user.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <DashboardLayout title="Patient Records">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patients..."
                className="input pl-12"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="spinner"></div>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => fetchPatientDetails(patient.id)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      selectedPatient?.id === patient.id
                        ? 'bg-primary-50 border-2 border-primary-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                        {patient.user.firstName[0]}{patient.user.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {patient.user.firstName} {patient.user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{patient.user.phone || 'No phone'}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Patient Details */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="card">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                    {selectedPatient.user.firstName[0]}{selectedPatient.user.lastName[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedPatient.user.firstName} {selectedPatient.user.lastName}
                    </h2>
                    <p className="text-gray-500">{selectedPatient.user.email}</p>
                    <p className="text-sm text-gray-500">{selectedPatient.user.phone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Medical History</h3>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">
                    {selectedPatient.medicalHistory || 'No medical history recorded.'}
                  </p>
                </div>
              </div>

              {/* Recent Appointments */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> Recent Appointments
                </h3>
                {selectedPatient.appointments?.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No appointments yet</p>
                ) : (
                  <div className="space-y-3">
                    {selectedPatient.appointments?.map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900">
                            {new Date(apt.appointmentDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">{apt.appointmentTime}</p>
                        </div>
                        <span className={`badge ${
                          apt.status === 'Completed' ? 'badge-success' :
                          apt.status === 'Scheduled' ? 'badge-primary' : 'badge-danger'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lab Reports */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Lab Reports
                </h3>
                {selectedPatient.labReports?.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No lab reports yet</p>
                ) : (
                  <div className="space-y-3">
                    {selectedPatient.labReports?.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900">{report.reportName}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(report.reportDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`badge ${
                          report.status === 'Completed' ? 'badge-success' : 'badge-warning'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card text-center py-20">
              <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Patient</h3>
              <p className="text-gray-600">Choose a patient from the list to view their records</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientHistory;
