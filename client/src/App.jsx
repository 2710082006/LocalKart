import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import LoadingScreen from './components/common/LoadingScreen';

// Lazy-loaded pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const VerifyOTPPage = lazy(() => import('./pages/auth/VerifyOTPPage'));

// Customer pages
const ProductsPage = lazy(() => import('./pages/customer/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/customer/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/customer/CartPage'));
const CheckoutPage = lazy(() => import('./pages/customer/CheckoutPage'));
const CustomerDashboard = lazy(() => import('./pages/customer/Dashboard'));
const OrdersPage = lazy(() => import('./pages/customer/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/customer/OrderDetailPage'));
const WishlistPage = lazy(() => import('./pages/customer/WishlistPage'));
const FarmersPage = lazy(() => import('./pages/customer/FarmersPage'));
const FarmerDetailPage = lazy(() => import('./pages/customer/FarmerDetailPage'));
const ProfilePage = lazy(() => import('./pages/customer/ProfilePage'));
const AddressPage = lazy(() => import('./pages/customer/AddressPage'));
const NotificationsPage = lazy(() => import('./pages/customer/NotificationsPage'));
const ReviewsPage = lazy(() => import('./pages/customer/ReviewsPage'));

// Farmer pages
const FarmerDashboard = lazy(() => import('./pages/farmer/Dashboard'));
const FarmerProducts = lazy(() => import('./pages/farmer/ProductsPage'));
const FarmerInventory = lazy(() => import('./pages/farmer/InventoryPage'));
const FarmerAddProduct = lazy(() => import('./pages/farmer/AddProductPage'));
const FarmerEditProduct = lazy(() => import('./pages/farmer/EditProductPage'));
const FarmerOrders = lazy(() => import('./pages/farmer/OrdersPage'));
const FarmerAnalytics = lazy(() => import('./pages/farmer/AnalyticsPage'));
const FarmerProfile = lazy(() => import('./pages/farmer/ProfilePage'));

// Delivery pages
const DeliveryDashboard = lazy(() => import('./pages/delivery/Dashboard'));
const AssignedOrdersPage = lazy(() => import('./pages/delivery/AssignedOrdersPage'));
const DeliveryRoutePage = lazy(() => import('./pages/delivery/DeliveryRoutePage'));
const DeliveryStatusPage = lazy(() => import('./pages/delivery/DeliveryStatusPage'));
const DeliveryHistory = lazy(() => import('./pages/delivery/HistoryPage'));
const DeliveryEarnings = lazy(() => import('./pages/delivery/EarningsPage'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('./pages/admin/UsersPage'));
const AdminFarmers = lazy(() => import('./pages/admin/FarmersPage'));
const AdminFeaturedFarmers = lazy(() => import('./pages/admin/FeaturedFarmersPage'));
const AdminComplaints = lazy(() => import('./pages/admin/ComplaintsPage'));
const AdminAnalytics = lazy(() => import('./pages/admin/AnalyticsPage'));

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public routes with main layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/farmers" element={<FarmersPage />} />
            <Route path="/farmers/:id" element={<FarmerDetailPage />} />
          </Route>

          {/* Auth routes (no layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />

          {/* Customer routes that use MainLayout (like cart/checkout) */}
          <Route element={<ProtectedRoute roles={['customer']} />}>
            <Route element={<MainLayout />}>
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
            </Route>
            {/* Customer Dashboard routes */}
            <Route element={<DashboardLayout role="customer" />}>
              <Route path="/dashboard" element={<CustomerDashboard />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/addresses" element={<AddressPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
            </Route>
          </Route>

          {/* Farmer routes */}
          <Route element={<ProtectedRoute roles={['farmer']} />}>
            <Route element={<DashboardLayout role="farmer" />}>
              <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
              <Route path="/farmer/products" element={<FarmerProducts />} />
              <Route path="/farmer/products/add" element={<FarmerAddProduct />} />
              <Route path="/farmer/products/edit/:id" element={<FarmerEditProduct />} />
              <Route path="/farmer/inventory" element={<FarmerInventory />} />
              <Route path="/farmer/orders" element={<FarmerOrders />} />
              <Route path="/farmer/analytics" element={<FarmerAnalytics />} />
              <Route path="/farmer/profile" element={<FarmerProfile />} />
            </Route>
          </Route>

          {/* Delivery routes */}
          <Route element={<ProtectedRoute roles={['delivery']} />}>
            <Route element={<DashboardLayout role="delivery" />}>
              <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
              <Route path="/delivery/assigned" element={<AssignedOrdersPage />} />
              <Route path="/delivery/route/:id" element={<DeliveryRoutePage />} />
              <Route path="/delivery/status/:id" element={<DeliveryStatusPage />} />
              <Route path="/delivery/earnings" element={<DeliveryEarnings />} />
              <Route path="/delivery/history" element={<DeliveryHistory />} />
            </Route>
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route element={<DashboardLayout role="admin" />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/farmers" element={<AdminFarmers />} />
              <Route path="/admin/featured" element={<AdminFeaturedFarmers />} />
              <Route path="/admin/complaints" element={<AdminComplaints />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
            </Route>
          </Route>

          {/* Fallback 404 Route */}
          <Route path="*" element={<div className="h-screen flex items-center justify-center font-bold text-2xl text-neutral-500">404 - Page Not Found</div>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}
