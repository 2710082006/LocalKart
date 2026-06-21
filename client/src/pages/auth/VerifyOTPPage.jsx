import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, ArrowRight, RotateCw } from 'lucide-react';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) { toast.error('Please enter complete OTP'); return; }
    setLoading(true);
    try {
      await authAPI.verifyOTP({ email, otp: otpString });
      toast.success('Email verified successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authAPI.resendOTP({ email });
      toast.success('OTP sent again!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend');
    } finally { setResending(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-white p-6" id="verify-otp-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card p-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center"><Leaf className="w-5 h-5 text-white" /></div>
            <span className="text-xl font-bold">Farm<span className="text-sky-500">2</span>Door</span>
          </Link>

          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sky-100 flex items-center justify-center">
            <span className="text-3xl">📧</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Verify Your Email</h1>
          <p className="text-neutral-500 text-sm mb-8">We sent a 6-digit code to <span className="font-semibold text-neutral-700">{email || 'your email'}</span></p>

          <form onSubmit={handleVerify}>
            <div className="flex justify-center gap-3 mb-8">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold border-2 border-neutral-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                />
              ))}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5 mb-4" id="verify-submit">
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Verify Email <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <button onClick={handleResend} disabled={resending} className="btn-ghost text-sky-600 mx-auto" id="resend-otp">
            <RotateCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
