import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { 
  Award, 
  Heart, 
  Users, 
  Clock, 
  Shield, 
  Target,
  CheckCircle,
  Activity
} from 'lucide-react';

const About = () => {
  const values = [
    { icon: Heart, title: 'Compassionate Care', description: 'We treat every patient with empathy, respect, and understanding.' },
    { icon: Award, title: 'Excellence', description: 'We strive for the highest standards in healthcare delivery.' },
    { icon: Shield, title: 'Integrity', description: 'We maintain transparency and ethical practices in all we do.' },
    { icon: Target, title: 'Innovation', description: 'We embrace technology to improve patient outcomes.' },
  ];

  const timeline = [
    { year: '2020', title: 'Foundation', description: 'NEXCARE was founded with a vision to revolutionize healthcare' },
    { year: '2021', title: 'Expansion', description: 'Opened multiple departments and added specialist doctors' },
    { year: '2022', title: 'Digital Transformation', description: 'Launched online appointment booking and digital records' },
    { year: '2023', title: 'Growth', description: 'Serving 10,000+ patients with state-of-the-art facilities' },
  ];

  const team = [
    { name: 'Dr. Rahman Ahmed', role: 'Chief Medical Officer', specialty: 'Cardiology' },
    { name: 'Dr. Fatima Khan', role: 'Head of Neurology', specialty: 'Neurology' },
    { name: 'Dr. Karim Hossain', role: 'Chief of Orthopedics', specialty: 'Orthopedics' },
    { name: 'Dr. Amina Begum', role: 'Head of Pediatrics', specialty: 'Pediatrics' },
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
              <Activity className="w-4 h-4" />
              About NEXCARE
            </span>
            <h1 className="text-5xl font-bold mb-6">Your Health, Our Mission</h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              NEXCARE Healthcare System is dedicated to providing exceptional medical care with compassion, 
              innovation, and the latest technology. We are your trusted partner in health.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="card bg-gradient-to-br from-primary-50 to-white border border-primary-100">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To deliver world-class healthcare services accessible to all, combining cutting-edge medical 
                technology with compassionate care. We strive to improve the quality of life for our patients 
                through prevention, diagnosis, and treatment excellence.
              </p>
            </div>
            
            <div className="card bg-gradient-to-br from-secondary-50 to-white border border-secondary-100">
              <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mb-6">
                <Activity className="w-8 h-8 text-secondary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed">
                To be the leading healthcare provider in Bangladesh, recognized for our commitment to 
                patient-centered care, medical innovation, and community health advancement. We envision 
                a healthier future for all.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-semibold uppercase tracking-wider">Our Values</span>
            <h2 className="section-title mt-4">What We Stand For</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Our core values guide every decision we make and every patient interaction we have.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <value.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-semibold uppercase tracking-wider">Our Journey</span>
            <h2 className="section-title mt-4">Milestones</h2>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary-500 to-secondary-500 rounded-full"></div>
            
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div key={index} className={`flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="card inline-block">
                      <span className="text-primary-600 font-bold text-lg">{item.year}</span>
                      <h3 className="text-xl font-bold text-gray-900 mt-2">{item.title}</h3>
                      <p className="text-gray-600 mt-2">{item.description}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex w-16 h-16 bg-white border-4 border-primary-500 rounded-full items-center justify-center z-10">
                    <CheckCircle className="w-8 h-8 text-primary-500" />
                  </div>
                  <div className="flex-1 hidden md:block"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-semibold uppercase tracking-wider">Our Team</span>
            <h2 className="section-title mt-4">Meet Our Leadership</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Our team of experienced medical professionals is dedicated to your health and well-being.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="card text-center group">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl font-bold text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                <p className="text-primary-600 font-medium mt-1">{member.role}</p>
                <p className="text-gray-500 text-sm mt-2">{member.specialty}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="text-white/80">Expert Doctors</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">10K+</div>
              <div className="text-white/80">Happy Patients</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">15+</div>
              <div className="text-white/80">Departments</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">24/7</div>
              <div className="text-white/80">Emergency Care</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
