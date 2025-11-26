import LoginPage from './components/Auth/LoginPage';
import StaffDashboard from './components/Pages/StaffDashboard';
import MenuManagement from './components/Pages/MenuManagement';
import HomePage from './components/Pages/HomePage';
import NotAuthorized from './components/Pages/NotAuthorized';
import NotFound from './components/Pages/NotFound';
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
import ProtectedRoute from './components/ProtectedRoute';

// Protected routes - Only accessible when authenticated
export const protectedRoutes = [
    {
        path: '/',
        element: <HomePage />,
    },
    {
        path: '/staff',
        element: (
            <ProtectedRoute roles={['staff', 'kitchen_staff']}>
                <StaffDashboard />
            </ProtectedRoute>
        ),
    },
    {
        path: '/manage-menu',
        element: (
            <ProtectedRoute permissions={['manage_menu']}>
                <MenuManagement />
            </ProtectedRoute>
        ),
    },
    {
        path: '/manage_orders',
        element: (
            <ProtectedRoute permissions={['manage_orders']}>
                <ManageOrders />
            </ProtectedRoute>
        ),
    },
    {
        path: '/manage-inventory',
        element: (
            <ProtectedRoute permissions={['inventory_management']}>
                <ManageInventory />
            </ProtectedRoute>
        ),
    },
    {
        path: '/manage-staff',
        element: (
            <ProtectedRoute roles={['admin']}>
                <ManageStaff />
            </ProtectedRoute>
        ),
    },
    {
        path: '/manage-staff-payments',
        element: (
            <ProtectedRoute roles={['admin']}>
                <ManageStaffPayments />
            </ProtectedRoute>
        ),
    },
    {
        path: '/reservations',
        element: (
            <ProtectedRoute permissions={['manage_reservations']}>
                <ManageReservations />
            </ProtectedRoute>
        ),
    },
    {
        path: '/payment-manage',
        element: (
            <ProtectedRoute permissions={['manage_payments']}>
                <ManagePayments />
            </ProtectedRoute>
        ),
    },
    {
        path: '/analytics',
        element: (
            <ProtectedRoute permissions={['analytics_management']}>
                <Analytics />
            </ProtectedRoute>
        ),
    },
    {
        path: '/order-items-details/:id',
        element: <OrderItemDetails permissions={['manage_orders']} />,
    },
    {
        path: '/view-order/:id',
        element: (
            <ProtectedRoute permissions={['manage_orders']}>
                <ViewOrderDetails />
            </ProtectedRoute>
        ),
    },
    {
        path: '/cart',
        element: <Cart />,
    },
    {
        path: '/item-details/:id',
        element: <ItemDetails />,
    },
    {
        path: '/not-authorized',
        element: <NotAuthorized />,
    },
    {
        path: '*',
        element: <NotFound />,
    },
];

// Public auth routes - Accessible without authentication
export const publicAuthRoutes = [
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/forgot-password',
        element: <ForgotPassword />,
    },
    {
        path: '/verify-otp',
        element: <VerifyOTP />,
    },
    {
        path: '/reset-password',
        element: <ResetPassword />,
    },
    {
        path: '*',
        element: <NotAuthorized />,
    },
];

// Route paths for setupInterceptors
export const PUBLIC_AUTH_ROUTE_PATHS = ['/login', '/forgot-password', '/verify-otp', '/reset-password'];
