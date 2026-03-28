import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  Clock, 
  MapPin,
  Stethoscope,
  ArrowRight,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';

const BookAppointment = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  const [formData, setFormData] = useState({
    branchId: '',
    departmentId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: '',
  });

  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedDoctor = location.state;
  const hasAutoPopulated = useRef(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  // Auto-populate form when navigating from the Doctors page with a pre-selected doctor
  useEffect(() => {
    if (preSelectedDoctor && !hasAutoPopulated.current && branches.length > 0) {
      hasAutoPopulated.current = true;
      const { doctorId, departmentId, branchId } = preSelectedDoctor;
      
      if (branchId && departmentId && doctorId) {
        // Set all three: branch, department, doctor
        setFormData(prev => ({
          ...prev,
          branchId,
          departmentId,
          doctorId,
        }));
        // Skip to step 2 (date/time selection) since doctor is already selected
        setStep(2);
      }
    }
  }, [preSelectedDoctor, branches]);

  useEffect(() => {
    if (formData.branchId) {
      fetchDepartments();
    }
  }, [formData.branchId]);

  useEffect(() => {
    if (formData.departmentId) {
      fetchDoctors();
    }
  }, [formData.departmentId]);

  useEffect(() => {
    if (formData.doctorId && formData.appointmentDate) {
      fetchAvailableSlots();
    }
  }, [formData.doctorId, formData.appointmentDate]);

  const fetchBranches = async () => {
    try {
      const response = await api.get('/branches');
      setBranches(response.data.data);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get(`/departments?branchId=${formData.branchId}`);
      setDepartments(response.data.data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get(`/doctors?departmentId=${formData.departmentId}`);
      setDoctors(response.data.data);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await api.get(`/appointments/slots?doctorId=${formData.doctorId}&date=${formData.appointmentDate}`);
      setAvailableSlots(response.data.data.availableSlots);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    // Reset dependent fields
    if (field === 'branchId') {
      setFormData(prev => ({ ...prev, branchId: value, departmentId: '', doctorId: '', appointmentTime: '' }));
      setDepartments([]);
      setDoctors([]);
    }
    if (field === 'departmentId') {
      setFormData(prev => ({ ...prev, departmentId: value, doctorId: '', appointmentTime: '' }));
      setDoctors([]);
    }
    if (field === 'doctorId' || field === 'appointmentDate') {
      setFormData(prev => ({ ...prev, [field]: value, appointmentTime: '' }));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/appointments', formData);
      toast.success('Appointment booked successfully!');
      navigate('/patient/appointments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    // Return today's date as the minimum (cannot book past dates)
    return today.toISOString().split('T')[0];
  };

  const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
  const selectedBranch = branches.find(b => b.id === formData.branchId);

  return (
    <DashboardLayout title="Book Appointment">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-24 h-1 mx-2 ${step > s ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between max-w-2xl mx-auto mt-2">
          <span className={`text-sm ${step >= 1 ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>Select Doctor</span>
          <span className={`text-sm ${step >= 2 ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>Choose Time</span>
          <span className={`text-sm ${step >= 3 ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>Confirm</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Step 1: Select Branch, Department, Doctor */}
        {step === 1 && (
          <div className="card animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Select Your Doctor</h2>
            
            <div className="space-y-6">
              {/* Branch Selection */}
              <div>
                <label className="label">Select Branch</label>
                <div className="grid sm:grid-cols-2 gap-4">
                  {branches.map((branch) => (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => handleChange('branchId', branch.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.branchId === branch.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className={`w-5 h-5 ${
                          formData.branchId === branch.id ? 'text-primary-600' : 'text-gray-400'
                        }`} />
                        <div>
                          <p className="font-semibold text-gray-900">{branch.name}</p>
                          <p className="text-sm text-gray-500">{branch.location?.city}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Department Selection */}
              {formData.branchId && (
                <div className="animate-slide-up">
                  <label className="label">Select Department</label>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {departments.map((dept) => (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => handleChange('departmentId', dept.id)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          formData.departmentId === dept.id
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {dept.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Doctor Selection */}
              {formData.departmentId && (
                <div className="animate-slide-up">
                  <label className="label">Select Doctor</label>
                  <div className="space-y-3">
                    {doctors.map((doctor) => (
                      <button
                        key={doctor.id}
                        type="button"
                        onClick={() => handleChange('doctorId', doctor.id)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          formData.doctorId === doctor.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold">
                            {doctor.user.firstName[0]}{doctor.user.lastName[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              Dr. {doctor.user.firstName} {doctor.user.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{doctor.qualification}</p>
                            <p className="text-sm text-primary-600">{doctor.experienceYears} years experience</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setStep(2)}
                disabled={!formData.doctorId}
                className="btn btn-primary"
              >
                Continue <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Date and Time */}
        {step === 2 && (
          <div className="card animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Choose Date & Time</h2>
            
            <div className="space-y-6">
              {/* Date Selection - Custom Calendar */}
              <div>
                <label className="label">Select Date</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {/* Generate next 14 days */}
                  {Array.from({ length: 14 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() + i);
                    const dateStr = date.toISOString().split('T')[0];
                    const isSelected = formData.appointmentDate === dateStr;
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNum = date.getDate();
                    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                    const isToday = i === 0;
                    
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => handleChange('appointmentDate', dateStr)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <p className={`text-xs ${isSelected ? 'text-primary-600' : 'text-gray-500'}`}>
                          {isToday ? 'Today' : dayName}
                        </p>
                        <p className={`text-lg font-bold ${isSelected ? 'text-primary-700' : 'text-gray-900'}`}>
                          {dayNum}
                        </p>
                        <p className={`text-xs ${isSelected ? 'text-primary-500' : 'text-gray-400'}`}>
                          {monthName}
                        </p>
                      </button>
                    );
                  })}
                </div>
                {formData.appointmentDate && (
                  <p className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary-600" />
                    Selected: <span className="font-semibold text-primary-600">
                      {new Date(formData.appointmentDate).toLocaleDateString('en-GB', {
                        weekday: 'long',
                        day: '2-digit',
                        month: '2-digit', 
                        year: 'numeric'
                      })}
                    </span>
                  </p>
                )}
              </div>

              {/* Time Slots */}
              {formData.appointmentDate && (
                <div className="animate-slide-up">
                  <label className="label">Available Time Slots</label>
                  {availableSlots.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No available slots for this date</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleChange('appointmentTime', slot)}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${
                            formData.appointmentTime === slot
                              ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Clock className="w-4 h-4 mx-auto mb-1" />
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="label">Additional Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="input min-h-[100px]"
                  placeholder="Any specific concerns or information for the doctor..."
                ></textarea>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(1)} className="btn btn-ghost">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.appointmentTime}
                className="btn btn-primary"
              >
                Continue <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="card animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Confirm Your Appointment</h2>
            
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                  {selectedDoctor?.user?.firstName?.[0]}{selectedDoctor?.user?.lastName?.[0]}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Dr. {selectedDoctor?.user?.firstName} {selectedDoctor?.user?.lastName}
                  </h3>
                  <p className="text-gray-500">{selectedDoctor?.qualification}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(formData.appointmentDate).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium text-gray-900">{formData.appointmentTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{selectedBranch?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Stethoscope className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium text-gray-900">{selectedDoctor?.department?.name}</p>
                  </div>
                </div>
              </div>

              {formData.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-gray-700">{formData.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(2)} className="btn btn-ghost">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Booking...
                  </div>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" /> Confirm Booking
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BookAppointment;
