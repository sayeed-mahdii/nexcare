import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../services/api';
import { 
  ShoppingCart,
  Trash2,
  Mail,
  User,
  Phone,
  ArrowLeft,
  CheckCircle,
  Copy,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const DiagnosticCheckout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  
  
  const [formData, setFormData] = useState({
    guestEmail: '',
    guestName: '',
    guestPhone: '',
  });

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('diagnosticCart');
    const savedBranch = localStorage.getItem('selectedBranch');
    
    if (!savedCart || JSON.parse(savedCart).length === 0) {
      toast.error('Your cart is empty');
      navigate('/diagnostics');
      return;
    }
    
    if (!savedBranch) {
      toast.error('Please select a branch first');
      navigate('/diagnostics');
      return;
    }
    
    setCart(JSON.parse(savedCart));
    fetchBranch(savedBranch);
  }, [navigate]);

  const fetchBranch = async (branchId) => {
    try {
      const res = await api.get(`/branches/${branchId}`);
      setBranch(res.data.data);
    } catch (error) {
      console.error('Failed to fetch branch:', error);
    }
  };

  const removeFromCart = (testId) => {
    const newCart = cart.filter(item => item.testId !== testId);
    setCart(newCart);
    localStorage.setItem('diagnosticCart', JSON.stringify(newCart));
    
    if (newCart.length === 0) {
      navigate('/diagnostics');
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // OTP state
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.guestEmail) {
      toast.error('Please enter your email');
      return;
    }
    if (!formData.guestName) {
      toast.error('Please enter your full name');
      return;
    }
    if (!formData.guestPhone) {
      toast.error('Please enter your phone number');
      return;
    }
    setLoading(true);
    try {
      const branchId = localStorage.getItem('selectedBranch');
      // Create pending booking and send OTP
      const res = await api.post('/diagnostics/guest-booking', {
        guestEmail: formData.guestEmail,
        guestName: formData.guestName,
        guestPhone: formData.guestPhone,
        branchId,
        items: cart.map(item => ({ testId: item.testId, quantity: item.quantity })),
      });

      if (res.data.success) {
        setShowOTP(true);
        setTimer(30);
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error('Booking init error:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate booking');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/diagnostics/guest-booking/verify', {
        email: formData.guestEmail,
        otp
      });

      if (res.data.success) {
        try {
          sessionStorage.setItem('guestAccessCode', res.data.data.accessCode);
        } catch (e) {
          console.warn('Failed to save guest access code to sessionStorage', e);
        }
        setBookingComplete(true);
        localStorage.removeItem('diagnosticCart');
        localStorage.removeItem('selectedBranch');
        toast.success('Booking confirmed!');
      }
    } catch (error) {
      console.error('Verify error:', error);
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      await api.post('/diagnostics/guest-booking/resend-otp', { email: formData.guestEmail });
      setTimer(30);
      toast.success('OTP Resent!');
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // ... (rest of the file remains same, but render OTP section if showOTP is true)

  if (showOTP && !bookingComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-6">Verify Your Email</h2>
            <p className="text-gray-600 mb-6">Enter the OTP sent to {formData.guestEmail}</p>
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input text-center text-2xl tracking-[0.5em] font-mono"
                placeholder="000000"
                maxLength={6}
              />
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{timer > 0 ? `Expires in ${timer}s` : 'Expired'}</span>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={timer > 0 || loading}
                  className={`font-medium ${timer > 0 ? 'text-gray-400' : 'text-primary-600 hover:underline'}`}
                >
                  Resend OTP
                </button>
              </div>
              <button
                type="submit"
                 disabled={loading || timer === 0}
                className="w-full btn btn-primary py-3"
              >
                {loading ? 'Verifying...' : 'Verify & Book'}
              </button>
              <button
                type="button"
                onClick={() => { setShowOTP(false); setOtp(''); setTimer(0); }}
                className="w-full btn btn-ghost"
              >
                Back
              </button>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const copyAccessCode = () => {
    navigator.clipboard.writeText(accessCode);
    toast.success('Access code copied!');
  };

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-2xl mx-auto px-4 py-20">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
            <p className="text-gray-600 mb-8">
              Your diagnostic test booking has been received. Use the access code below to track your booking status.
            </p>

            <div className="bg-primary-50 border-2 border-primary-200 rounded-2xl p-6 mb-8">
              <p className="text-sm text-primary-600 font-medium mb-2">Access Code Sent</p>
              <div className="text-center">
                <p className="text-gray-700">We've sent your access code to <span className="font-medium">{formData.guestEmail}</span>.</p>
                <p className="text-sm text-primary-600 mt-2">Use that emailed code to access your booking. You can also open the dashboard directly — the code is stored securely in your session.</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Your booking is pending admin approval</li>
                <li>• Once approved, you'll be notified via email</li>
                <li>• After your test, the report will be available for download</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/guest-dashboard"
                className="flex-1 btn btn-primary"
              >
                Go to Guest Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                to="/"
                className="flex-1 btn btn-outline"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate('/diagnostics')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Tests
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-primary-600" />
                  Your Tests ({cart.length})
                </h2>
                {branch && (
                  <p className="text-gray-600 mt-1">
                    Branch: <span className="font-medium">{branch.name}</span>
                  </p>
                )}
              </div>
              
              <div className="divide-y">
                {cart.map((item) => (
                  <div key={item.testId} className="p-6 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.category}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-gray-900">
                        ৳{item.price * item.quantity}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.testId)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="p-6 bg-gray-50 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-600">Total Amount</span>
                  <span className="text-3xl font-bold text-primary-600">৳{getTotalAmount()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Guest Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.guestEmail}
                      onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                      className="input pl-10 w-full"
                      placeholder="Enter your email"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    We'll send your access code to this email
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.guestName}
                      onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                      className="input pl-10 w-full"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={formData.guestPhone}
                      onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                      className="input pl-10 w-full"
                      placeholder="Enter your phone"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary py-4 mt-6"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="spinner w-5 h-5"></div>
                      Processing...
                    </span>
                  ) : (
                    <>
                      Complete Booking <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By completing this booking, you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
            </div>

            {/* Help Box */}
            <div className="bg-primary-50 rounded-2xl p-6 mt-6">
              <h3 className="font-semibold text-primary-900 mb-2">Need Help?</h3>
              <p className="text-sm text-primary-700 mb-4">
                Our support team is available 24/7 to assist you with your booking.
              </p>
              <Link to="/contact" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                Contact Support →
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default DiagnosticCheckout;
