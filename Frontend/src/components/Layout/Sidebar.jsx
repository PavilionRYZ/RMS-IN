import PropTypes from "prop-types";
import { FaBars, FaHome, FaTimes, FaTachometerAlt, FaShoppingCart, FaCalendarAlt, FaBox, FaCogs, FaChartBar, FaEnvelope, FaSignOutAlt, FaUsers } from "react-icons/fa";
import { MdOutlineMenuBook } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../Redux/Slices/authSlice";
import {resetUserState} from "../Redux/Slices/userSlice";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { clearOrderState } from "../Redux/Slices/orderSlice";

const navLinks = [
  { to: "/", label: "Home", icon: FaHome, permission: null },
  { to: "/staff", label: "Dashboard", icon: FaTachometerAlt, roles: ["kitchen_staff", "staff"] },
  { to: "/manage-orders", label: "Manage Order", icon: FaShoppingCart, permission: "manage_orders" },
  { to: "/manage-inventory", label: "Manage Inventory", icon: FaBox, permission: "inventory_management" },
  { to: "/manage-menu", label: "Manage Menu", icon: MdOutlineMenuBook, permission: "manage_menu" },
  { to: "/manage-staff", label: "Manage Staff", icon: FaUsers, permission: "manage_staff",role:"admin" },
  { to: "/manage-customers", label: "Manage Customers", icon: FaUsers, permission: "manage_customers" },
  { to: "/reservations", label: "Reservation", icon: FaCalendarAlt, permission: "manage_reservations" },
  { to: "/payment-manage", label: "Payment Manage", icon: FaBox, permission: "manage_payments" },
  { to: "/production", label: "Production", icon: FaCogs, permission: "production_management" },
  { to: "/reports", label: "Report", icon: FaChartBar, permission: "view_reports" },
  { to: "/analytics", label: "Analytics", icon: FaChartBar, permission: "analytics_management" },
  { to: "/messages", label: "Message", icon: FaEnvelope, permission: "manage_messages" },
];

const roleAccess = {
  admin: ["dashboard_access", "manage_orders", "manage_reservations", "manage_payments", "production_management", "view_reports", "analytics_management", "manage_messages"],
  kitchen_staff: [],
  staff: [],
  customer: ["manage_reservations", "manage_messages"],
};

const navItemClass = "flex items-center gap-4 p-4 hover:bg-gray-700 transition-colors duration-200";
const iconClass = "text-xl";
const labelClass = "ml-4";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const toastOptions = {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'colored',
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success("Logged out successfully!", toastOptions);
      dispatch(resetUserState());
      dispatch(clearOrderState());
    } catch (error) {
      toast.error(error || "Logout failed. Please try again.", toastOptions);
      console.error("Logout failed:", error);
    }
  };

  const getFilteredNavLinks = () => {
    if (!user) return [];

    const userRole = user.role || "customer";
    const userPermissions = user.permissions || [];

    const rolePermissions = roleAccess[userRole] || [];

    return navLinks.filter(({ permission, roles }) => {
      if (!permission && !roles) return true;
      if (userRole === "admin") return true;
      if (roles) {
        return roles.includes(userRole);
      }
      return userPermissions.includes(permission) || rolePermissions.includes(permission);
    });
  };

  const filteredNavLinks = getFilteredNavLinks();

  const handleNavigation = (to) => {
    console.log(`Navigating to ${to}`);
    // Use setTimeout to debounce navigation and avoid race conditions
    setTimeout(() => {
      navigate(to);
    }, 0);
  };

  return (
    <div
      className={`bg-gray-800 z-50 min-h-screen text-white h-screen fixed top-0 left-0 transition-all duration-300 shadow-lg ${
        isSidebarOpen ? "w-64" : "w-16"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800">
        {isSidebarOpen && (
          <div className="flex gap-3 items-center space-x-3">
            <div className="relative">
              <img
                src={user?.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                alt="User Avatar"
                className="w-12 h-12 rounded-full border-2 border-green-400 shadow-md"
                onError={(e) => (e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png")}
              />
              <span className="absolute bottom-0 right-0 w-5 h-5 bg-green-400 rounded-full border-2 border-gray-800"></span>
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-semibold text-white">{user?.name || "User Name"}</h2>
              <p className="text-xs text-green-400 capitalize">{user?.role || "Role"}</p>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full text-white hover:bg-gray-700 focus:outline-none hover:text-green-400 transition-all duration-200"
          aria-label={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      <nav className="mt-6 flex flex-col h-[calc(100%-80px)]">
        <ul className="flex-1">
          {filteredNavLinks.map(({ to, label, icon: Icon }) => (
            <li key={label}>
              <div
                onClick={() => handleNavigation(to)} // Use custom handler
                className={`${navItemClass} ${location.pathname === to ? "bg-gray-700" : ""}`}
                style={{ cursor: 'pointer' }}
              >
                <Icon className={iconClass} />
                {isSidebarOpen && <span className={labelClass}>{label}</span>}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            disabled={loading}
            className={`flex items-center w-full p-4 text-white hover:bg-red-600 transition-colors duration-200 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            aria-label="Logout"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 mr-3 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <FaSignOutAlt className={iconClass} />
            )}
            {isSidebarOpen && <span className={labelClass}>{loading ? "Logging out..." : "Logout"}</span>}
          </button>
        </div>
      </nav>
    </div>
  );
};

Sidebar.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired,
};

export default Sidebar;