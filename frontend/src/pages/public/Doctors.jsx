import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  MapPin,
  Stethoscope,
  Award,
  ArrowRight,
  Activity
} from 'lucide-react';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  
  const { user, isAuthenticated, isPatient } = useAuth();
  const navigate = useNavigate();

  const handleBookAppointment = (doctor) => {
    if (isAuthenticated && isPatient) {
      // Patient is logged in — navigate to booking page with doctor info pre-selected
      navigate('/patient/book-appointment', {
        state: {
          doctorId: doctor.id,
          departmentId: doctor.departmentId,
          branchId: doctor.department?.branch?.id || doctor.department?.branchId,
          doctorName: `${doctor.user.firstName} ${doctor.user.lastName}`,
        }
      });
    } else {
      // Not logged in or not a patient — redirect to login
      navigate('/login');
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching doctors and departments...');
      const [doctorsRes, deptsRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/departments'),
      ]);
      console.log('Doctors API response:', doctorsRes.data);
      console.log('Departments API response:', deptsRes.data);
      setDoctors(doctorsRes.data.data || []);
      setDepartments(deptsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const name = `${doctor.user.firstName} ${doctor.user.lastName}`.toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    const matchesDepartment = !selectedDepartment || doctor.departmentId === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-primary-600 to-secondary-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 border border-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 border border-white rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center text-white">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
              <Stethoscope className="w-4 h-4" />
              Our Medical Team
            </span>
            <h1 className="text-5xl font-bold mb-6">Find Your Doctor</h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Our team of experienced doctors is here to provide you with the best medical care. 
              Search and book appointments with specialists across all departments.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-12"
                placeholder="Search doctors by name..."
              />
            </div>
            <div className="w-full md:w-64 relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="input pl-12 appearance-none"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="spinner"></div>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-20">
              <Stethoscope className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Doctors Found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="card group hover:shadow-elevated">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
                      {doctor.user.firstName[0]}{doctor.user.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {doctor.user.firstName} {doctor.user.lastName}
                      </h3>
                      <p className="text-primary-600 font-medium">{doctor.department?.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                        <span className="text-sm text-gray-500 ml-1">(4.8)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Award className="w-4 h-4 text-primary-500" />
                      <span>{doctor.qualification}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-primary-500" />
                      <span>{doctor.experienceYears} Years Experience</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-primary-500" />
                      <span>{doctor.department?.branch?.name || 'Main Branch'}</span>
                    </div>
                  </div>

                  {doctor.specialties?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {doctor.specialties.slice(0, 3).map((spec) => (
                        <span key={spec.specialtyId} className="badge badge-primary">
                          {spec.specialty.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => handleBookAppointment(doctor)}
                    className="btn btn-outline w-full group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600"
                  >
                    Book Appointment <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center mb-8">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Can't Find Your Doctor?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Contact us and we'll help you find the right specialist for your needs.
          </p>
          <Link to="/contact" className="btn btn-primary">
            Contact Us <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Doctors;
