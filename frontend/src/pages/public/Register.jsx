import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Eye, EyeOff, Mail, Lock, User, Phone, Activity, ArrowRight, 
  Stethoscope, UserCog, FlaskConical
} from 'lucide-react';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'Patient',
    gender: 'Male',
    // Doctor specific
    qualification: '',
    experienceYears: '',
    departmentId: '',
    // Pathologist specific
    specialization: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, text: '', color: '' };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { level: strength, text: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { level: strength, text: 'Medium', color: 'bg-yellow-500' };
    return { level: strength, text: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  useEffect(() => {
    if (formData.role === 'Doctor') {
      fetchDepartments();
    }
  }, [formData.role]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For phone, only allow digits and limit to 11
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 11);
      setFormData({ ...formData, phone: digitsOnly });
      return;
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Phone number validation - must be exactly 11 digits
    if (formData.phone && formData.phone.length !== 11) {
      toast.error('Phone number must be exactly 11 digits');
      return;
    }

    // Password minimum length validation
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        gender: formData.gender,
      };

      if (formData.role === 'Doctor') {
        userData.qualification = formData.qualification;
        userData.experienceYears = parseInt(formData.experienceYears);
        userData.departmentId = formData.departmentId;
      }

      if (formData.role === 'Pathologist') {
        userData.qualification = formData.qualification;
        userData.specialization = formData.specialization;
      }

      // Use API directly for registration
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        toast.success('Registration successful!');
        
        // Different messages based on role
        if (formData.role === 'Doctor') {
          navigate('/login', { 
            state: { 
              message: 'Your doctor account has been submitted for approval. You will be notified once an administrator approves your account.',
              type: 'pending',
              role: formData.role
            } 
          });
        } else {
          // Patients and Pathologists redirect to login
          navigate('/login', { 
            state: { 
              message: 'Account created successfully! Please sign in to continue.',
              type: 'success',
              role: formData.role
            } 
          });
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };


  const roles = [
    { value: 'Patient', label: 'Patient', icon: User, description: 'Book appointments & access lab reports' },
    { value: 'Doctor', label: 'Doctor', icon: Stethoscope, description: 'Manage appointments & patients' },
    { value: 'Pathologist', label: 'Pathologist', icon: FlaskConical, description: 'Upload & manage lab reports' },
  ];

  return (
    <div className="min-h-screen bg-mesh flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 to-secondary-600 items-center justify-center p-12 sticky top-0 h-screen">
        <div className="text-center text-white max-w-lg">
          <div className="w-32 h-32 mx-auto mb-8 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur">
            <Activity className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Join NEXCARE</h2>
          <p className="text-xl text-white/80 mb-8">
            Create your account and start your journey towards better healthcare management.
          </p>
          <div className="space-y-4 text-left bg-white/10 rounded-2xl p-6 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">✓</div>
              <span>Book appointments with expert doctors</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">✓</div>
              <span>Access your lab reports anytime</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">✓</div>
              <span>Manage your health records securely</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-lg">
          <Link to="/" className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold gradient-text">NEXCARE</span>
              <span className="block text-xs text-gray-500">Healthcare System</span>
            </div>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600 mb-8">Fill in your details to get started</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="label">I am a</label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: role.value })}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      formData.role === role.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <role.icon className={`w-6 h-6 mx-auto mb-2 ${
                      formData.role === role.value ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                    <span className={`block font-semibold ${
                      formData.role === role.value ? 'text-primary-600' : 'text-gray-700'
                    }`}>{role.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input pl-12"
                    placeholder="First name"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input"
                  placeholder="Last name"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input pl-12"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Phone & Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`input pl-12 ${formData.phone && formData.phone.length !== 11 ? 'border-red-300 focus:ring-red-500' : formData.phone.length === 11 ? 'border-green-300 focus:ring-green-500' : ''}`}
                    placeholder="01XXXXXXXXX"
                    maxLength={11}
                  />
                </div>
                {formData.phone && (
                  <p className={`text-xs mt-1 ${formData.phone.length === 11 ? 'text-green-600' : 'text-red-500'}`}>
                    {formData.phone.length}/11 digits {formData.phone.length === 11 ? '✓' : '(must be exactly 11)'}
                  </p>
                )}
              </div>
              <div>
                <label className="label">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Doctor Specific Fields */}
            {formData.role === 'Doctor' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Qualification</label>
                    <input
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      className="input"
                      placeholder="e.g., MBBS, MD"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Experience (Years)</label>
                    <input
                      type="number"
                      name="experienceYears"
                      value={formData.experienceYears}
                      onChange={handleChange}
                      className="input"
                      placeholder="Years of experience"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Department</label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Pathologist Specific Fields */}
            {formData.role === 'Pathologist' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Qualification</label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g., MBBS, MD"
                    required
                  />
                </div>
                <div>
                  <label className="label">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g., Clinical Pathology"
                    required
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input pl-12 pr-12"
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Password Strength Meter */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full ${
                            level <= passwordStrength.level ? passwordStrength.color : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.text === 'Weak' ? 'text-red-500' :
                      passwordStrength.text === 'Medium' ? 'text-yellow-600' : 'text-green-500'
                    }`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`input pl-12 pr-12 ${
                      formData.confirmPassword && (passwordsMatch ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500')
                    }`}
                    placeholder="Confirm password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Match Indicator */}
                {formData.confirmPassword && (
                  <div className="mt-2 flex items-center gap-1">
                    {passwordsMatch ? (
                      <>
                        <span className="text-green-500 text-sm">✓</span>
                        <span className="text-xs text-green-500">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <span className="text-red-500 text-sm">✗</span>
                        <span className="text-xs text-red-500">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 mt-0.5 rounded text-primary-600 focus:ring-primary-500" required />
              <span className="text-sm text-gray-600">
                I agree to the <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and{' '}
                <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating account...
                </div>
              ) : (
                <>
                  Create Account <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
