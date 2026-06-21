import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingBag, BarChart3, User, Truck,
  Clock, Users, Shield, AlertTriangle, Star, LogOut, Menu, X,
  ChevronLeft, Bell, Leaf, Settings, MapPin, Navigation, DollarSign,
  MessageSquare
} from 'lucide-react';
import { logout } from '../../features/authSlice';

const sidebarConfig = {
  customer: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Orders', path: '/orders', icon: ShoppingBag },
    { label: 'Wishlist', path: '/wishlist', icon: Star },
    { label: 'Addresses', path: '/addresses', icon: MapPin },
    { label: 'Reviews', path: '/reviews', icon: MessageSquare },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Profile', path: '/profile', icon: User },
  ],
  farmer: [
    { label: 'Dashboard', path: '/farmer/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/farmer/products', icon: Package },
    { label: 'Inventory', path: '/farmer/inventory', icon: Package },
    { label: 'Orders', path: '/farmer/orders', icon: ShoppingBag },
    { label: 'Analytics', path: '/farmer/analytics', icon: BarChart3 },
    { label: 'Profile', path: '/farmer/profile', icon: User },
  ],
  delivery: [
    { label: 'Dashboard', path: '/delivery/dashboard', icon: LayoutDashboard },
    { label: 'Assigned Orders', path: '/delivery/assigned', icon: Truck },
    { label: 'Earnings', path: '/delivery/earnings', icon: DollarSign },
    { label: 'History', path: '/delivery/history', icon: Clock },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Farmers', path: '/admin/farmers', icon: Shield },
    { label: 'Featured Farmers', path: '/admin/featured', icon: Star },
    { label: 'Complaints', path: '/admin/complaints', icon: AlertTriangle },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  ],
};

export default function DashboardLayout({ role }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useSelector((s) => s.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const links = sidebarConfig[role] || [];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const roleLabels = { customer: 'Customer Panel', farmer: 'Farmer Panel', delivery: 'Delivery Panel', admin: 'Admin Panel' };

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex flex-col bg-white border-r border-neutral-200 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-neutral-100 ${collapsed ? 'justify-center px-2' : 'px-6'}`}>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold font-[family-name:var(--font-display)]">
                Farm<span className="text-sky-500">2</span>Door
              </span>
            )}
          </Link>
        </div>

        {/* Panel label */}
        {!collapsed && (
          <div className="px-6 py-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{roleLabels[role]}</span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 shadow-sm'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? link.label : ''}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-sky-600' : ''}`} />
                {!collapsed && link.label}
              </Link>
            );
          })}
        </nav>

        {/* User info + collapse */}
        <div className="border-t border-neutral-100 p-3 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-800 truncate">{user?.name}</p>
                <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors ${collapsed ? 'justify-center' : ''}`}>
            <LogOut className="w-5 h-5" />
            {!collapsed && 'Log Out'}
          </button>
          <button onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-neutral-400 hover:bg-neutral-50 justify-center">
            <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)}>
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="w-72 h-full bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-100">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold">Farm<span className="text-sky-500">2</span>Door</span>
              </Link>
              <button onClick={() => setMobileOpen(false)}><X className="w-5 h-5 text-neutral-500" /></button>
            </div>
            <nav className="p-3 space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive ? 'bg-sky-50 text-sky-700' : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 lg:px-8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-neutral-100">
              <Menu className="w-5 h-5 text-neutral-600" />
            </button>
            <h1 className="text-lg font-semibold text-neutral-800">
              {links.find((l) => l.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl hover:bg-neutral-100 relative">
              <Bell className="w-5 h-5 text-neutral-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full"></span>
            </button>
            <Link to="/" className="p-2.5 rounded-xl hover:bg-neutral-100">
              <Settings className="w-5 h-5 text-neutral-600" />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
