import { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import toast from 'react-hot-toast';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Send,
  MessageCircle,
  Activity
} from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Message sent successfully! We will get back to you soon.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setLoading(false);
  };

  const contactInfo = [
    { 
      icon: MapPin, 
      title: 'Visit Us', 
      lines: ['University of Chittagong', 'Chittagong, Bangladesh 4331'] 
    },
    { 
      icon: Phone, 
      title: 'Call Us', 
      lines: ['+880 31-123-4567', '+880 1700-000000'] 
    },
    { 
      icon: Mail, 
      title: 'Email Us', 
      lines: ['info@nexcare.com', 'support@nexcare.com'] 
    },
    { 
      icon: Clock, 
      title: 'Working Hours', 
      lines: ['Mon - Sat: 8:00 AM - 10:00 PM', 'Sunday: Emergency Only'] 
    },
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
              <MessageCircle className="w-4 h-4" />
              Get in Touch
            </span>
            <h1 className="text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Have questions or need assistance? We're here to help. Reach out to us through any of the methods below.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-32 relative z-20">
            {contactInfo.map((info, index) => (
              <div key={index} className="card text-center hover:shadow-elevated">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-4">
                  <info.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3">{info.title}</h3>
                {info.lines.map((line, i) => (
                  <p key={i} className="text-gray-600 text-sm">{line}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <span className="text-primary-600 font-semibold uppercase tracking-wider">Send Message</span>
              <h2 className="section-title mt-4 mb-8">We'd Love to Hear From You</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input"
                      placeholder="Enter your phone"
                    />
                  </div>
                  <div>
                    <label className="label">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="input"
                      placeholder="What's this about?"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="input min-h-[150px] resize-y"
                    placeholder="Write your message here..."
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : (
                    <>
                      Send Message <Send className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Map / Location Info */}
            <div>
              <div className="card h-full min-h-[500px] bg-gradient-to-br from-primary-600 to-secondary-600 text-white flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mb-8">
                  <Activity className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-bold mb-4">NEXCARE Healthcare</h3>
                <p className="text-white/80 text-center max-w-sm mb-8">
                  Located at the heart of Chittagong, we are committed to providing the best healthcare services to our community.
                </p>
                <div className="space-y-4 text-center">
                  <div className="flex items-center gap-3 justify-center">
                    <MapPin className="w-5 h-5 text-white/60" />
                    <span>University of Chittagong, Bangladesh</span>
                  </div>
                  <div className="flex items-center gap-3 justify-center">
                    <Phone className="w-5 h-5 text-white/60" />
                    <span>+880 31-123-4567</span>
                  </div>
                  <div className="flex items-center gap-3 justify-center">
                    <Mail className="w-5 h-5 text-white/60" />
                    <span>info@nexcare.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-semibold uppercase tracking-wider">FAQ</span>
            <h2 className="section-title mt-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: 'How do I book an appointment?', a: 'You can book an appointment by registering on our platform, selecting your preferred doctor, and choosing an available time slot.' },
              { q: 'What are your working hours?', a: 'We are open Monday to Saturday from 8:00 AM to 10:00 PM. On Sundays, we provide emergency services only.' },
              { q: 'How can I access my lab reports?', a: 'Once your lab reports are ready, you can access them from your patient dashboard under the "Lab Reports" section.' },
              { q: 'Do you offer emergency services?', a: 'Yes, we provide 24/7 emergency services. Please call our emergency hotline for immediate assistance.' },
            ].map((faq, index) => (
              <div key={index} className="card">
                <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
