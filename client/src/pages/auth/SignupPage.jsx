import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, Phone, Leaf, ArrowRight, Tractor, ShoppingBag, Truck } from 'lucide-react';
import { register as registerUser, clearError } from '../../features/authSlice';
import toast from 'react-hot-toast';

const roles = [
  { value: 'customer', label: 'Customer', desc: 'Buy fresh produce', icon: ShoppingBag, color: 'from-sky-500 to-sky-600' },
  { value: 'farmer', label: 'Farmer', desc: 'Sell your harvest', icon: Tractor, color: 'from-emerald-500 to-emerald-600' },
  { value: 'delivery', label: 'Delivery', desc: 'Deliver orders', icon: Truck, color: 'from-amber-500 to-amber-600' },
];

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'customer';
  const [selectedRole, setSelectedRole] = useState(defaultRole);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { loading, error } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    dispatch(clearError());
    const result = await dispatch(registerUser({ ...data, role: selectedRole }));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Please verify your email.');
      navigate('/verify-otp', { state: { email: data.email } });
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex" id="signup-page">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-700 to-sky-700 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 left-20 w-72 h-72 rounded-full bg-sky-400 blur-3xl" />
        </div>
        <div className="relative text-white max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Leaf className="w-5 h-5" /></div>
            <span className="text-2xl font-bold">Farm<span className="text-sky-300">2</span>Door</span>
          </Link>
          <h2 className="text-4xl font-bold mb-4 leading-tight">Join the Fresh Food Revolution</h2>
          <p className="text-emerald-100 text-lg leading-relaxed mb-8">Whether you're a farmer, customer, or delivery partner — there's a place for you here.</p>
          <div className="space-y-4">
            {['Direct farmer-to-customer marketplace', 'Zero commission for first 3 months', 'Delivery within 2 hours'].map((t, i) => (
              <div key={i} className="flex items-center gap-3 text-emerald-100">
                <div className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center"><span className="text-xs">✓</span></div>
                <span className="text-sm">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white overflow-y-auto">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center"><Leaf className="w-5 h-5 text-white" /></div>
            <span className="text-xl font-bold">Farm<span className="text-sky-500">2</span>Door</span>
          </Link>

          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Create Account</h1>
          <p className="text-neutral-500 mb-6">Choose your role and get started</p>

          {/* Role Selection */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {roles.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setSelectedRole(r.value)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    selectedRole === r.value ? 'border-sky-500 bg-sky-50 shadow-sm' : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  id={`role-${r.value}`}
                >
                  <div className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br ${r.color} flex items-center justify-center mb-2`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-800">{r.label}</p>
                  <p className="text-[10px] text-neutral-500">{r.desc}</p>
                </button>
              );
            })}
          </div>

          {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Too short' } })} className={`input pl-11 ${errors.name ? 'input-error' : ''}`} placeholder="Your full name" id="signup-name" />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} type="email" className={`input pl-11 ${errors.email ? 'input-error' : ''}`} placeholder="you@example.com" id="signup-email" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input {...register('phone', { pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit phone' } })} className={`input pl-11 ${errors.phone ? 'input-error' : ''}`} placeholder="9876543210" id="signup-phone" />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} type={showPassword ? 'text' : 'password'} className={`input pl-11 pr-11 ${errors.password ? 'input-error' : ''}`} placeholder="••••••••" id="signup-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5 !text-base" id="signup-submit">
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-6">
            Already have an account? <Link to="/login" className="text-sky-600 font-semibold hover:text-sky-700">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
