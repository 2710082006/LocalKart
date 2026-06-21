import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Mail, Leaf, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authAPI.forgotPassword(data);
      setSent(true);
      toast.success('Reset link sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-white p-6" id="forgot-password-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card p-8">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center"><Leaf className="w-5 h-5 text-white" /></div>
            <span className="text-xl font-bold">Farm<span className="text-sky-500">2</span>Door</span>
          </Link>

          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">Check Your Email</h1>
              <p className="text-neutral-500 text-sm mb-6">We've sent a password reset link. Check your inbox and follow the instructions.</p>
              <Link to="/login" className="btn-primary inline-flex">Back to Login</Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">Forgot Password?</h1>
              <p className="text-neutral-500 text-sm mb-6">No worries — we'll send you a reset link.</p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} type="email" className={`input pl-11 ${errors.email ? 'input-error' : ''}`} placeholder="you@example.com" id="forgot-email" />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5" id="forgot-submit">
                  {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Send Reset Link <ArrowRight className="w-5 h-5" /></>}
                </button>
              </form>

              <Link to="/login" className="flex items-center gap-2 justify-center text-sm text-neutral-500 hover:text-neutral-700 mt-6">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
