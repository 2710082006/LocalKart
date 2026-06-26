import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Bell, Menu, X, Search, User, LogOut, Leaf } from 'lucide-react';
import { logout } from '../../features/authSlice';
import { toggleMobileMenu, setMobileMenuOpen } from '../../features/uiSlice';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const { count: cartCount } = useSelector((s) => s.cart);
  const { mobileMenuOpen } = useSelector((s) => s.ui);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    dispatch(setMobileMenuOpen(false));
    //setProfileOpen(false);
  }, [location, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const getDashboardLink = () => {
    const map = { customer: '/dashboard', farmer: '/farmer/dashboard', delivery: '/delivery/dashboard', admin: '/admin/dashboard' };
    return map[user?.role] || '/dashboard';
  };

  const navLinks = [
    { label: 'Products', path: '/products' },
  ];

  if (!isAuthenticated || user?.role === 'customer') {
    navLinks.push({ label: 'Farmers', path: '/farmers' });
  }

  const navBg = scrolled || !isHome
    ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-neutral-100'
    : 'bg-transparent';

  const textColor = scrolled || !isHome ? 'text-neutral-800' : 'text-white';

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group" id="nav-logo">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:shadow-sky-500/30 transition-shadow">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xl font-bold font-[family-name:var(--font-display)] ${textColor} transition-colors`}>
                Farm<span className="text-sky-500">2</span>Door
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  id={`nav-${link.label.toLowerCase()}`}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    location.pathname === link.path
                      ? 'text-sky-600 bg-sky-50'
                      : `${textColor} hover:bg-white/10 ${scrolled || !isHome ? 'hover:bg-neutral-50 text-neutral-800' : ''}`
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <button className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${textColor} hover:bg-white/10 ${scrolled || !isHome ? 'hover:bg-neutral-100 text-neutral-800' : ''}`} id="nav-search">
                <Search className="w-5 h-5" />
              </button>

              {isAuthenticated ? (
                <>
                  <Link to="/wishlist" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 relative cursor-pointer ${textColor} hover:bg-white/10 ${scrolled || !isHome ? 'hover:bg-neutral-100 text-neutral-800' : ''}`} id="nav-wishlist">
                    <Heart className="w-5 h-5" />
                  </Link>
                  <Link to="/cart" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 relative cursor-pointer ${textColor} hover:bg-white/10 ${scrolled || !isHome ? 'hover:bg-neutral-100 text-neutral-800' : ''}`} id="nav-cart">
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-sky-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <Link to={getDashboardLink()} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${textColor} hover:bg-white/10 ${scrolled || !isHome ? 'hover:bg-neutral-100 text-neutral-800' : ''}`} id="nav-notifications">
                    <Bell className="w-5 h-5" />
                  </Link>

                  {/* Profile dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${textColor} hover:bg-white/10 ${scrolled || !isHome ? 'hover:bg-neutral-100 text-neutral-800' : ''}`}
                      id="nav-profile-toggle"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-xs font-bold border-2 border-transparent hover:border-white transition-all shadow-sm">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                    </button>

                    <AnimatePresence>
                      {profileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-elevated border border-neutral-100 py-2 overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-neutral-100">
                            <p className="font-semibold text-sm text-neutral-900">{user?.name}</p>
                            <p className="text-xs text-neutral-500">{user?.email}</p>
                            <span className="badge badge-sky mt-1">{user?.role}</span>
                          </div>
                          <Link to={getDashboardLink()} className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors" id="nav-dashboard">
                            <User className="w-4 h-4" /> Dashboard
                          </Link>
                          <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors" id="nav-orders">
                            <ShoppingCart className="w-4 h-4" /> My Orders
                          </Link>
                          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors" id="nav-logout">
                            <LogOut className="w-4 h-4" /> Log Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 ml-2">
                  <Link to="/login" className={`text-sm font-medium px-4 py-2 rounded-lg transition-all ${textColor} hover:bg-white/10 ${scrolled || !isHome ? 'hover:bg-neutral-100' : ''}`} id="nav-login">
                    Log In
                  </Link>
                  <Link to="/signup" className="btn-primary !py-2 !px-5 !text-sm" id="nav-signup">
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button onClick={() => dispatch(toggleMobileMenu())} className={`lg:hidden p-2 rounded-lg ${textColor}`} id="nav-mobile-toggle">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-neutral-100 shadow-lg overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link key={link.path} to={link.path} className="block px-4 py-3 rounded-lg text-neutral-700 font-medium hover:bg-neutral-50 transition-colors">
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated ? (
                  <>
                    <Link to={getDashboardLink()} className="block px-4 py-3 rounded-lg text-neutral-700 font-medium hover:bg-neutral-50">Dashboard</Link>
                    <Link to="/cart" className="block px-4 py-3 rounded-lg text-neutral-700 font-medium hover:bg-neutral-50">Cart {cartCount > 0 && `(${cartCount})`}</Link>
                    <Link to="/orders" className="block px-4 py-3 rounded-lg text-neutral-700 font-medium hover:bg-neutral-50">Orders</Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-lg text-red-600 font-medium hover:bg-red-50">Log Out</button>
                  </>
                ) : (
                  <div className="pt-3 border-t border-neutral-100 space-y-2">
                    <Link to="/login" className="block text-center px-4 py-2.5 rounded-lg border border-neutral-200 text-neutral-700 font-medium">Log In</Link>
                    <Link to="/signup" className="block text-center btn-primary">Get Started</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
