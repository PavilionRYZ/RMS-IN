import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import LoginPage from './components/Auth/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './components/Pages/AdminDashboard';
import StaffDashboard from './components/Pages/StaffDashboard';
import CustomerDashboard from './components/Pages/CustomerDashboard';
import MenuManagement from './components/Pages/MenuManagement';
import HomePage from './components/Pages/HomePage';
import NotAuthorized from './components/Pages/NotAuthorized';
import NotFound from './components/Pages/NotFound';
import Footer from './components/Layout/Footer';
import { Fragment } from 'react';
import ManageOrders from './components/Pages/ManageOrders';
import ManageInventory from './components/Pages/ManageInventory';
import ManageStaff from './components/Pages/ManageStaff';
import ManageCustomers from './components/Pages/ManageCustomers';
import Reservations from './components/Pages/Reservations';
import ManagePayments from './components/Pages/ManagePayments';
import Reports from './components/Pages/Reports';
import Analytics from './components/Pages/Analytics';
import ViewOrderDetails from './components/Pages/ViewOrderDetails';
import Cart from "./components/Pages/Cart";
import ItemDetails from "./components/Pages/ItemDetails";
import OrderItemDetails from "./components/Pages/OrderItemsDetails";
import ForgotPassword from './components/Pages/ForgotPassword';
import VerifyOTP from './components/Pages/VerifyOTP';
import ResetPassword from './components/Pages/ResetPassword';
const App = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1">
        {user && isAuthenticated ? (
          <Fragment>
            <Routes>
              <Route path="/" element={<HomePage isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />} />
              {/* <Route path="/login" element={<Navigate to={redirectRoute} replace />} /> */}
              <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/staff" element={<ProtectedRoute roles={['staff', 'kitchen_staff']}><StaffDashboard isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/customer" element={<ProtectedRoute roles={['customer']}><CustomerDashboard isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/manage-menu" element={<ProtectedRoute permissions={['manage_menu']}><MenuManagement isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/manage-orders" element={<ProtectedRoute permissions={['manage_orders']}><ManageOrders isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/manage-inventory" element={<ProtectedRoute permissions={['inventory_management']}><ManageInventory isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/manage-staff" element={<ProtectedRoute roles={['admin']}><ManageStaff isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/manage-customers" element={<ProtectedRoute permissions={['manage_customers']}><ManageCustomers isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/reservations" element={<ProtectedRoute permissions={['manage_reservations']}><Reservations isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/payment-manage" element={<ProtectedRoute permissions={['manage_payments']}><ManagePayments isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute permissions={['view_reports']}><Reports isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute permissions={['analytics_management']}><Analytics isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/order-items-details/:id" element={<OrderItemDetails permissions={['manage_orders']} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path="/view-order/:id" element={<ProtectedRoute permissions={['manage_orders']}><ViewOrderDetails isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/item-details/:id" element={<ItemDetails isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />} />
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