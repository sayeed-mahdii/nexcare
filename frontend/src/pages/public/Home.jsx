import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

import { 
  ArrowRight, 
  Calendar, 
  Shield, 
  Clock, 
  Users, 
  Stethoscope,
  Heart,
  Brain,
  Bone,
  Baby,
  Eye,
  Activity,
  Star,
  CheckCircle,
  Phone,
  Pill,
  Scissors,
  Ear,
  Syringe,
  Droplets,
  Wind,
  Apple,
  Sparkles,
  HeartPulse,
  Dumbbell,
  ChevronDown
} from 'lucide-react';

// Custom hook for count-up animation
const useCountUp = (end, duration = 2000, startCounting = false) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!startCounting) return;
    
    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
      const currentCount = Math.floor(easeOutQuart * end);
      
      setCount(currentCount);
      countRef.current = currentCount;

      if (percentage < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, startCounting]);

  return count;
};

// Stat component with count-up animation
const CountUpStat = ({ number, suffix, label }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const count = useCountUp(number, 2000, isVisible);

  return (
    <div ref={ref} className="text-center sm:text-left">
      <div className="text-3xl font-bold gradient-text">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-gray-500 text-sm mt-1">{label}</div>
    </div>
  );
};

const Home = () => {
  const stats = [
    { number: 50, suffix: '+', label: 'Expert Doctors' },
    { number: 50, suffix: 'K+', label: 'Happy Patients' },
    { number: 15, suffix: '+', label: 'Departments' },
    { number: 24, suffix: '/7', label: 'Emergency Care' },
  ];

  const [showAllServices, setShowAllServices] = useState(false);

  const services = [
    { icon: Heart, title: 'Cardiology', description: 'Expert heart care with advanced diagnostic and treatment options', color: 'bg-red-500' },
    { icon: Brain, title: 'Neurology', description: 'Comprehensive brain and nervous system treatments', color: 'bg-purple-500' },
    { icon: Bone, title: 'Orthopedics', description: 'Bone, joint, and muscle care by expert specialists', color: 'bg-blue-500' },
    { icon: Baby, title: 'Pediatrics', description: 'Child healthcare services with compassionate care', color: 'bg-pink-500' },
    { icon: Eye, title: 'Ophthalmology', description: 'Complete eye care and vision correction services', color: 'bg-green-500' },
    { icon: Stethoscope, title: 'General Medicine', description: 'Primary care for common illnesses and long-term health management', color: 'bg-teal-500' },
    { icon: HeartPulse, title: 'Obstetrics & Gynecology', description: 'Women\'s health, pregnancy care, and reproductive health services', color: 'bg-rose-500' },
    { icon: Sparkles, title: 'Dermatology', description: 'Skin, hair, and nail treatments using modern dermatologic procedures', color: 'bg-amber-500' },
    { icon: Ear, title: 'ENT (Ear, Nose, Throat)', description: 'Specialized care for ear, nose, and throat conditions', color: 'bg-indigo-500' },
    { icon: Syringe, title: 'Oncology', description: 'Comprehensive cancer diagnosis, treatment, and follow-up care', color: 'bg-orange-500' },
    { icon: Droplets, title: 'Nephrology', description: 'Kidney disease diagnosis, dialysis support, and long-term management', color: 'bg-cyan-500' },
    { icon: Wind, title: 'Pulmonology', description: 'Lung and respiratory care including asthma and COPD management', color: 'bg-sky-500' },
    { icon: Apple, title: 'Gastroenterology', description: 'Digestive system care for stomach, liver, and intestinal disorders', color: 'bg-lime-500' },
    { icon: Pill, title: 'Endocrinology', description: 'Hormone and metabolism management, including diabetes and thyroid care', color: 'bg-violet-500' },
    { icon: Scissors, title: 'Psychiatry', description: 'Mental health evaluation, counseling, and medication management', color: 'bg-fuchsia-500' },
    { icon: Dumbbell, title: 'Physiotherapy & Rehabilitation', description: 'Recovery and mobility improvement after injury, surgery, or illness', color: 'bg-emerald-500' },
  ];

  const visibleServices = showAllServices ? services : services.slice(0, 6);

  const features = [
    { icon: Calendar, title: 'Easy Appointment', description: 'Book appointments online anytime, anywhere with our easy scheduling system', color: 'from-blue-500 to-cyan-500' },
    { icon: Shield, title: 'Secure Records', description: 'Your medical records are encrypted and stored securely with full privacy', color: 'from-green-500 to-emerald-500' },
    { icon: Clock, title: '24/7 Support', description: 'Round-the-clock emergency services and patient support available', color: 'from-orange-500 to-amber-500' },
    { icon: Users, title: 'Expert Doctors', description: 'Access to highly qualified and experienced medical professionals', color: 'from-purple-500 to-violet-500' },
    { icon: Activity, title: 'Modern Equipment', description: 'State-of-the-art medical equipment for accurate diagnosis and treatment', color: 'from-pink-500 to-rose-500' },
    { icon: Heart, title: 'Patient-Centered Care', description: 'Compassionate care focused on your comfort and well-being', color: 'from-red-500 to-pink-500' },
  ];

  const testimonials = [
    { name: 'Rahim Ahmed', role: 'Patient', image: null, content: 'Excellent service and caring staff. The online booking system made it so convenient to schedule my appointment.', rating: 5 },
    { name: 'Fatima Khan', role: 'Patient', image: null, content: 'The doctors here are truly professional. They took time to explain everything about my treatment.', rating: 5 },
    { name: 'Karim Hossain', role: 'Patient', image: null, content: 'Best healthcare experience I have ever had. The facilities are modern and the staff is friendly.', rating: 5 },
  ];


  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-mesh overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-200 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="animate-slide-up">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
                <Activity className="w-4 h-4" />
                Your Health, Our Priority
              </span>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Modern Healthcare
                <span className="block gradient-text">For All</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                Experience world-class healthcare services with NEXCARE. Book appointments, access lab reports, and connect with expert doctors all in one place.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="btn btn-primary px-8">
                  Get Started <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link to="/doctors" className="btn btn-outline px-8">
                  Find Doctors
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 pt-8 border-t border-gray-200">
                {stats.map((stat, index) => (
                  <CountUpStat 
                    key={index} 
                    number={stat.number} 
                    suffix={stat.suffix} 
                    label={stat.label} 
                  />
                ))}
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative hidden lg:block">
              <div className="relative w-full h-[600px]">
                {/* Main Image Container */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[450px] h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    src="/src/assets/images/hero-doctor.png" 
                    alt="NEXCARE Healthcare Professional" 
                    className="w-full h-full object-cover object-center"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 to-transparent"></div>
                  {/* Brand Badge */}
                  <div className="absolute bottom-6 left-6 right-6 bg-white rounded-2xl p-4 flex items-center gap-4 shadow-xl border border-gray-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center shrink-0">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 leading-tight">NEXCARE</h3>
                      <p className="text-sm text-gray-500 font-medium">Your Health, Our Priority</p>
                    </div>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute top-10 left-0 card-glass p-4 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Appointment</p>
                      <p className="text-sm text-green-600">Confirmed</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-20 right-0 card-glass p-4 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">50+ Doctors</p>
                      <p className="text-sm text-gray-500">Available Now</p>
                    </div>
                  </div>
                </div>

                <div className="absolute top-32 right-10 card-glass p-4 animate-float" style={{ animationDelay: '2s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-secondary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">24/7</p>
                      <p className="text-sm text-gray-500">Support</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Services Section */}
      <section id="departments" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-semibold uppercase tracking-wider">Our Departments</span>
            <h2 className="section-title mt-4">Comprehensive Healthcare Services</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              We offer a wide range of medical services to meet all your healthcare needs with expert care and modern facilities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleServices.map((service, index) => (
              <div 
                key={index}
                className="group card hover:shadow-elevated cursor-pointer"
              >
                <div className={`w-16 h-16 ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
                <Link to="/doctors" className="inline-flex items-center gap-2 mt-4 text-primary-600 font-semibold group-hover:gap-3 transition-all">
                  Learn More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {!showAllServices && (
            <div className="text-center mt-12">
              <button
                onClick={() => setShowAllServices(true)}
                className="btn btn-outline px-8 py-3 inline-flex items-center gap-2"
              >
                Load More Departments
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section - Why Choose Us */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-primary-50 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-100 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold mb-4">
              <CheckCircle className="w-4 h-4" />
              Why Choose NEXCARE
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              The Best Healthcare
              <span className="block gradient-text">Experience Awaits You</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              NEXCARE combines advanced technology with compassionate care to provide you with an unmatched healthcare experience.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-primary-200 hover:-translate-y-2"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Stats Banner */}
          <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 rounded-3xl p-8 lg:p-12 shadow-2xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">50+</div>
                <div className="text-primary-100 font-medium">Expert Doctors</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">10K+</div>
                <div className="text-primary-100 font-medium">Happy Patients</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">16+</div>
                <div className="text-primary-100 font-medium">Departments</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">24/7</div>
                <div className="text-primary-100 font-medium">Emergency Care</div>
              </div>
            </div>
          </div>

          {/* CTA Card */}
          <div className="mt-16 grid lg:grid-cols-2 gap-8 items-center">
            <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-xl border border-gray-100">
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Ready to Experience Premium Healthcare?</h3>
              <p className="text-gray-600 mb-6">
                Join thousands of satisfied patients who trust NEXCARE for their healthcare needs. Book your first appointment today!
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="btn btn-primary px-8">
                  Get Started <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link to="/doctors" className="btn btn-outline px-8">
                  Find Doctors
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-3xl p-1">
                <div className="bg-white rounded-3xl p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary-600" />
                    </div>
                    Book Appointment
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-primary-50 border border-primary-100">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Easy Scheduling</p>
                        <p className="text-sm text-gray-500">Book anytime, anywhere</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-green-50 border border-green-100">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Secure & Private</p>
                        <p className="text-sm text-gray-500">Your data is protected</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-purple-50 border border-purple-100">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Expert Doctors</p>
                        <p className="text-sm text-gray-500">Top medical professionals</p>
                      </div>
                    </div>
                  </div>
                  <Link to="/register" className="btn btn-primary w-full mt-6">
                    Register Now <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-semibold uppercase tracking-wider">Testimonials</span>
            <h2 className="section-title mt-4">What Our Patients Say</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Hear from our patients about their experience with NEXCARE Healthcare System.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join NEXCARE today and experience healthcare like never before. Book your first appointment now!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8">
              Create Account <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link to="/contact" className="btn border-2 border-white text-white hover:bg-white/10 px-8">
              <Phone className="w-5 h-5 mr-2" /> Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
