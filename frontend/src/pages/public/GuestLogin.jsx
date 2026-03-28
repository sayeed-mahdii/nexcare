import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../services/api';
import { 
  KeyRound,
  Mail,
  ArrowRight,
  ShieldCheck,
  Timer
} from 'lucide-react';
import toast from 'react-hot-toast';

const GuestLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('EMAIL'); // EMAIL, OTP
  const [loading, setLoading] = useState(false);
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

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await api.post('/diagnostics/guest/login', { email });
      setStep('OTP');
      setTimer(30);
      toast.success('OTP sent to your email!');
    } catch (error) {
      console.error('Login request error:', error);
      toast.error(error.response?.data?.message || 'Failed to send OTP');
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
      const res = await api.post('/diagnostics/guest/login/verify', { email, otp });
      if (res.data.success) {
        toast.success('Login successful');
        try {
          sessionStorage.setItem('guestAccessCode', res.data.data.accessCode);
        } catch (e) {
          console.warn('Failed to save guest access code to sessionStorage', e);
        }
        navigate('/guest-dashboard');
      }
    } catch (error) {
      console.error('Login verify error:', error);
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      await api.post('/diagnostics/guest/login', { email });
      setTimer(30);
      toast.success('OTP Resent!');
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Guest Access</h2>
            <p className="mt-2 text-gray-600">
              Access your diagnostic test bookings and reports
            </p>
          </div>

          {step === 'EMAIL' ? (
            <form onSubmit={handleRequestOTP} className="mt-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-10 w-full"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-3"
              >
                {loading ? (
                  <div className="spinner w-5 h-5 mx-auto"></div>
                ) : (
                  <>
                    Send OTP <ArrowRight className="w-5 h-5 ml-2 inline" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="mt-8 space-y-6">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600">
                  Enter the OTP sent to <span className="font-semibold">{email}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  One-Time Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input pl-10 w-full tracking-[0.5em] font-mono text-center text-lg"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Timer className="w-4 h-4" />
                  <span>{timer > 0 ? `Expires in ${timer}s` : 'Expired'}</span>
                </div>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={timer > 0 || loading}
                  className={`font-medium ${
                    timer > 0 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-primary-600 hover:text-primary-500'
                  }`}
                >
                  Resend OTP
                </button>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || timer === 0}
                  className="w-full btn btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="spinner w-5 h-5 mx-auto"></div>
                  ) : (
                    'Verify & Search'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('EMAIL'); setOtp(''); setTimer(0); }}
                  className="w-full btn btn-ghost"
                >
                  Change Email
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GuestLogin;
