import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
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
import PurchaseManage from './components/Pages/PurchaseManage';
import Production from './components/Pages/Production';
import Reports from './components/Pages/Reports';
import Analytics from './components/Pages/Analytics';
import Messages from './components/Pages/Messages';
import Cart from "./components/Pages/Cart";
import ItemDetails from "./components/Pages/ItemDetails";

const App = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    console.log(`Route changed to: ${location.pathname}`);
  }, [location.pathname]);

  const getRedirectRoute = () => {
    if (!user || !isAuthenticated) return null;
    const role = user.role;
    if (role === 'admin') return '/admin';
    if (['staff', 'kitchen_staff'].includes(role)) return '/staff';
    return '/customer';
  };

  const redirectRoute = getRedirectRoute();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1">
        {user && isAuthenticated ? (
          <Fragment>
            <Routes>
              <Route path="/" element={<HomePage isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path="/login" element={<Navigate to={redirectRoute} replace />} />
              <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/staff" element={<ProtectedRoute roles={['staff', 'kitchen_staff']}><StaffDashboard isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/customer" element={<ProtectedRoute roles={['customer']}><CustomerDashboard isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/manage-menu" element={<ProtectedRoute permissions={['manage_menu']}><MenuManagement isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/manage-orders" element={<ProtectedRoute permissions={['manage_orders']}><ManageOrders isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/manage-inventory" element={<ProtectedRoute permissions={['inventory_management']}><ManageInventory isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/manage-staff" element={<ProtectedRoute permissions={['manage_staff']}><ManageStaff isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/manage-customers" element={<ProtectedRoute permissions={['manage_customers']}><ManageCustomers isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/reservations" element={<ProtectedRoute permissions={['manage_reservations']}><Reservations isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/purchase-manage" element={<ProtectedRoute permissions={['purchase_management']}><PurchaseManage isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/production" element={<ProtectedRoute permissions={['production_management']}><Production isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute permissions={['view_reports']}><Reports isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute permissions={['analytics_management']}><Analytics isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute permissions={['manage_messages']}><Messages isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/item-details/:id" element={<ItemDetails isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path="/not-authorized" element={<NotAuthorized />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Fragment>
        ) : (
          <Routes>
            <Route path="/" element={<HomePage isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />} />
            <Route path="/login" element={<LoginPage />} />
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