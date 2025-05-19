import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import LoginPage from './components/Auth/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import StaffDashboard from './components/Pages/StaffDashboard';
import MenuManagement from './components/Pages/MenuManagement';
import HomePage from './components/Pages/HomePage';
import NotAuthorized from './components/Pages/NotAuthorized';
import NotFound from './components/Pages/NotFound';
import Footer from './components/Layout/Footer';
import { Fragment, useEffect, useState } from 'react';
import ManageOrders from './components/Pages/ManageOrders';
import ManageInventory from './components/Pages/ManageInventory';
import ManageStaff from './components/Pages/ManageStaff';
import ManageReservations from './components/Pages/ManageReservations';
import ManagePayments from './components/Pages/ManagePayments';
import Analytics from './components/Pages/Analytics';
import ViewOrderDetails from './components/Pages/ViewOrderDetails';
import Cart from './components/Pages/Cart';
import ItemDetails from './components/Pages/ItemDetails';
import OrderItemDetails from './components/Pages/OrderItemsDetails';
import ManageStaffPayments from './components/Pages/ManageStaffPayments';
import ForgotPassword from './components/Pages/ForgotPassword';
import VerifyOTP from './components/Pages/VerifyOTP';
import ResetPassword from './components/Pages/ResetPassword';
import { verifyToken } from './components/Redux/Slices/authSlice';
import Loading from './components/Loading/Loading';
import SetupInterceptors from './setupInterceptors.jsx';
import ErrorBoundary from './ErrorBoundary';
import MaintenancePage from './components/Pages/MaintenancePage';

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

  const checkMaintenanceStatus = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/v1/maintenance-status`);
      const data = await response.json();
      setIsMaintenance(data.maintenanceMode);
    } catch (error) {
      console.error('Error fetching maintenance status:', error);
      // Fallback to maintenance mode if backend is unreachable
      setIsMaintenance(true);
    }
  };

  useEffect(() => {
    // Check maintenance status on mount
    checkMaintenanceStatus();

    // Poll every 30 seconds to handle updates during user session
    const interval = setInterval(checkMaintenanceStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    dispatch(verifyToken());
  }, [dispatch]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  if (isMaintenance) {
    return <MaintenancePage />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Add SetupInterceptors here to initialize interceptors */}
      <SetupInterceptors />
      
      {loading ? (
        <Loading />
      ) : (
        <ErrorBoundary>
          <div className="flex-1">
            {user && isAuthenticated ? (
              <Fragment>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route
                    path="/staff"
                    element={
                      <ProtectedRoute roles={['staff', 'kitchen_staff']}>
                        <StaffDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/manage-menu"
                    element={
                      <ProtectedRoute permissions={['manage_menu']}>
                        <MenuManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/manage_orders"
                    element={
                      <ProtectedRoute permissions={['manage_orders']}>
                        <ManageOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/manage-inventory"
                    element={
                      <ProtectedRoute permissions={['inventory_management']}>
                        <ManageInventory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/manage-staff"
                    element={
                      <ProtectedRoute roles={['admin']}>
                        <ManageStaff />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/manage-staff-payments"
                    element={
                      <ProtectedRoute roles={['admin']}>
                        <ManageStaffPayments />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reservations"
                    element={
                      <ProtectedRoute permissions={['manage_reservations']}>
                        <ManageReservations />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payment-manage"
                    element={
                      <ProtectedRoute permissions={['manage_payments']}>
                        <ManagePayments />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <ProtectedRoute permissions={['analytics_management']}>
                        <Analytics />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/order-items-details/:id"
                    element={<OrderItemDetails permissions={['manage_orders']} />}
                  />
                  <Route
                    path="/view-order/:id"
                    element={
                      <ProtectedRoute permissions={['manage_orders']}>
                        <ViewOrderDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/item-details/:id" element={<ItemDetails />} />
                  <Route path="/not-authorized" element={<NotAuthorized />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Fragment>
            ) : (
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="*" element={<NotAuthorized />} />
              </Routes>
            )}
          </div>
        </ErrorBoundary>
      )}
      <Footer />
    </div>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;