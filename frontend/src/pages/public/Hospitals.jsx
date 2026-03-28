import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Building2,
  Users,
  Stethoscope,
  ArrowRight,
  Star,
  Activity
} from 'lucide-react';

const Hospitals = () => {
  const hospitals = [
    {
      id: 1,
      name: 'NEXCARE Chattogram',
      type: 'Main Branch',
      address: 'Medical College Road, Chattogram 4203',
      city: 'Chattogram',
      phone: '+880 31 123 4567',
      email: 'chattogram@nexcare.com',
      hours: '24/7 Emergency Services',
      image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&h=500&fit=crop',
      stats: {
        beds: 500,
        doctors: 120,
        departments: 25
      },
      features: [
        'Level 1 Trauma Center',
        'Advanced Cardiac Care',
        'Neurosurgery Center',
        '24/7 Emergency'
      ],
      isPrimary: true
    },
    {
      id: 2,
      name: 'NEXCARE Dhaka',
      type: 'Branch Hospital',
      address: 'Gulshan Avenue, Dhaka 1212',
      city: 'Dhaka',
      phone: '+880 2 987 6543',
      email: 'dhaka@nexcare.com',
      hours: '24/7 Emergency Services',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=500&fit=crop',
      stats: {
        beds: 350,
        doctors: 85,
        departments: 20
      },
      features: [
        'Multi-specialty Hospital',
        'Modern Diagnostic Center',
        'Oncology Center',
        '24/7 Emergency'
      ],
      isPrimary: false
    }
  ];

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
              <Building2 className="w-4 h-4" />
              Our Locations
            </span>
            <h1 className="text-5xl font-bold mb-6">Our Hospitals</h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              NEXCARE operates state-of-the-art medical facilities across Bangladesh, 
              providing world-class healthcare services to millions of patients.
            </p>
          </div>
        </div>
      </section>

      {/* Hospitals Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10">
            {hospitals.map((hospital) => (
              <div 
                key={hospital.id} 
                className={`bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 ${
                  hospital.isPrimary ? 'ring-2 ring-primary-500 ring-offset-4' : ''
                }`}
              >
                {/* Hospital Image */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={hospital.image} 
                    alt={hospital.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Badge */}
                  {hospital.isPrimary && (
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary-500 text-white text-sm font-semibold">
                        <Star className="w-4 h-4 fill-current" />
                        Main Branch
                      </span>
                    </div>
                  )}
                  
                  {/* City */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white">{hospital.name}</h3>
                    <p className="text-white/80 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {hospital.city}
                    </p>
                  </div>
                </div>

                {/* Hospital Info */}
                <div className="p-6">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-primary-50 rounded-xl">
                      <div className="text-2xl font-bold text-primary-600">{hospital.stats.beds}</div>
                      <div className="text-xs text-gray-500">Beds</div>
                    </div>
                    <div className="text-center p-3 bg-secondary-50 rounded-xl">
                      <div className="text-2xl font-bold text-secondary-600">{hospital.stats.doctors}</div>
                      <div className="text-xs text-gray-500">Doctors</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">{hospital.stats.departments}</div>
                      <div className="text-xs text-gray-500">Depts</div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3 text-gray-600">
                      <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                      <span>{hospital.address}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Phone className="w-5 h-5 text-primary-500" />
                      <span>{hospital.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Clock className="w-5 h-5 text-primary-500" />
                      <span>{hospital.hours}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {hospital.features.map((feature, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link 
                      to="/doctors" 
                      className="flex-1 btn btn-primary text-center"
                    >
                      View Doctors
                    </Link>
                    <Link 
                      to="/contact" 
                      className="btn btn-outline"
                    >
                      Contact
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Why Choose NEXCARE?</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              We are committed to providing exceptional healthcare services with compassion and excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Users, title: '200+ Doctors', desc: 'Expert medical professionals' },
              { icon: Stethoscope, title: '45+ Departments', desc: 'Comprehensive care units' },
              { icon: Building2, title: '850+ Beds', desc: 'Modern patient facilities' },
              { icon: Activity, title: '24/7 Care', desc: 'Round-the-clock service' }
            ].map((item, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-4">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Experience World-Class Healthcare?</h2>
          <p className="text-xl text-white/80 mb-8">
            Book an appointment today and let our expert team take care of your health.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Hospitals;
