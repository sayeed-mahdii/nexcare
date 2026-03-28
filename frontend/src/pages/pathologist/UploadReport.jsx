import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Upload, 
  FileText,
  User,
  Building2,
  Calendar,
  X,
  Check
} from 'lucide-react';

const UploadReport = () => {
  const [patients, setPatients] = useState([]);
  const [laboratories, setLaboratories] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    patientId: '',
    labId: '',
    doctorId: '',
    reportName: '',
    reportDate: new Date().toISOString().split('T')[0],
    filePath: '',
    notes: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patientsRes, labsRes, doctorsRes] = await Promise.all([
        api.get('/patients'),
        api.get('/laboratories'),
        api.get('/doctors'),
      ]);
      setPatients(patientsRes.data.data.patients || []);
      setLaboratories(labsRes.data.data || []);
      setDoctors(doctorsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await api.post('/lab-reports', formData);
      toast.success('Lab report created successfully');
      navigate('/pathologist');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create report');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Upload Lab Report">
        <div className="flex items-center justify-center py-20">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Upload Lab Report">
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">New Lab Report</h2>
              <p className="text-gray-500">Fill in the details to create a new lab report</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Selection */}
            <div>
              <label className="label">Patient</label>
              <select
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Select Patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.user.firstName} {patient.user.lastName} - {patient.user.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Laboratory Selection */}
            <div>
              <label className="label">Laboratory</label>
              <select
                name="labId"
                value={formData.labId}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Select Laboratory</option>
                {laboratories.map((lab) => (
                  <option key={lab.id} value={lab.id}>
                    {lab.name} ({lab.labType})
                  </option>
                ))}
              </select>
            </div>

            {/* Referring Doctor */}
            <div>
              <label className="label">Referring Doctor (Optional)</label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select Doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.user.firstName} {doctor.user.lastName} - {doctor.department?.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Report Name */}
            <div>
              <label className="label">Report Name</label>
              <input
                type="text"
                name="reportName"
                value={formData.reportName}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Complete Blood Count (CBC)"
                required
              />
            </div>

            {/* Report Date */}
            <div>
              <label className="label">Report Date</label>
              <input
                type="date"
                name="reportDate"
                value={formData.reportDate}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            {/* File Upload (Placeholder) */}
            <div>
              <label className="label">Report File</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-300 transition-colors cursor-pointer">
                <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 mb-1">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-400">PDF, JPG, PNG up to 10MB</p>
              </div>
              <input
                type="text"
                name="filePath"
                value={formData.filePath}
                onChange={handleChange}
                className="input mt-3"
                placeholder="Or enter file path/URL"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="label">Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="input min-h-[100px]"
                placeholder="Any additional notes or observations..."
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/pathologist')}
                className="btn btn-ghost flex-1"
              >
                <X className="w-5 h-5 mr-2" /> Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary flex-1"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating...
                  </div>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" /> Create Report
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UploadReport;
