import PropTypes from "prop-types";
import { FaBars, FaHome, FaTimes, FaTachometerAlt, FaShoppingCart, FaCalendarAlt, FaBox, FaCogs, FaChartBar, FaEnvelope, FaSignOutAlt, FaUsers } from "react-icons/fa";
import { MdOutlineMenuBook } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logout,clearCookies } from "../Redux/Slices/authSlice";
import { resetUserState } from "../Redux/Slices/userSlice";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { clearOrderState } from "../Redux/Slices/orderSlice";

// Navigation links data
const navLinks = [
  { to: "/", label: "Home", icon: FaHome, permission: null },
  { to: "/staff", label: "Dashboard", icon: FaTachometerAlt, roles: ["kitchen_staff", "staff"] },
  // { to: "/admin", label: "ADashboard", icon: FaTachometerAlt, roles: "admin" },
  { to: "/manage_orders", label: "Manage Order", icon: FaShoppingCart, permission: "manage_orders" },
  { to: "/manage-inventory", label: "Manage Inventory", icon: FaBox, permission: "inventory_management" },
  { to: "/manage-menu", label: "Manage Menu", icon: MdOutlineMenuBook, permission: "manage_menu" },
  { to: "/manage-staff", label: "Manage Staff", icon: FaUsers, permission: "manage_staff", role: "admin" },
  { to: "/manage-customers", label: "Manage Customers", icon: FaUsers, permission: "manage_customers" },
  { to: "/reservations", label: "Reservation", icon: FaCalendarAlt, permission: "manage_reservations" },
  { to: "/payment-manage", label: "Payment Manage", icon: FaBox, permission: "manage_payments" },
  { to: "/production", label: "Production", icon: FaCogs, permission: "production_management" },
  { to: "/reports", label: "Report", icon: FaChartBar, permission: "view_reports" },
  { to: "/analytics", label: "Analytics", icon: FaChartBar, permission: "analytics_management" },
  { to: "/messages", label: "Message", icon: FaEnvelope, permission: "manage_messages" },
];

// Role-based access permissions
const roleAccess = {
  admin: ["dashboard_access", "manage_orders", "manage_reservations", "manage_payments", "production_management", "view_reports", "analytics_management", "manage_messages"],
  kitchen_staff: [],
  staff: [],
  customer: ["manage_reservations", "manage_messages"],
};

// CSS Classes for styling
const navItemClass = "flex items-center gap-4 p-4 hover:bg-indigo-600 transition-all duration-300 rounded-lg mx-2 my-1 relative overflow-hidden group";
const iconClass = "text-xl transform group-hover:scale-110 transition-transform duration-300";
const labelClass = "ml-4 text-sm font-medium";

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
      dispatch(clearCookies());
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
    setTimeout(() => {
      navigate(to);
    }, 0);
  };

  return (
    <div
      className={`bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900 z-50 min-h-screen text-white h-screen fixed top-0 left-0 transition-all duration-500 shadow-2xl ${
        isSidebarOpen ? "w-72" : "w-20"
      }`}
      style={{
        backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 100%)",
        boxShadow: "inset 0 0 15px rgba(0,0,0,0.3)",
      }}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between p-4 border-b border-indigo-500 bg-gradient-to-r from-indigo-900 to-indigo-700 shadow-lg">
        {isSidebarOpen && (
          <div className="flex gap-3 items-center space-x-3">
            <div className="relative group">
              <img
                src={user?.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                alt="User Avatar"
                className="w-14 h-14 rounded-full border-4 border-indigo-400 shadow-lg transform group-hover:scale-105 transition-transform duration-300"
                onError={(e) => (e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png")}
              />
              <span className="absolute bottom-0 right-0 w-6 h-6 bg-green-400 rounded-full border-3 border-indigo-900 animate-pulse"></span>
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-indigo-100 tracking-wide">{user?.name || "User Name"}</h2>
              <p className="text-xs text-indigo-300 capitalize font-semibold">{user?.role || "Role"}</p>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full text-indigo-200 hover:bg-indigo-600 hover:text-white focus:outline-none transform hover:scale-110 transition-all duration-300 shadow-md"
          aria-label={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Navigation Section */}
      <nav className="mt-6 flex flex-col h-[calc(100%-90px)]">
        <ul className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-indigo-900">
          {filteredNavLinks.map(({ to, label, icon: Icon }) => (
            <li key={label}>
              <div
                onClick={() => handleNavigation(to)}
                className={`${navItemClass} ${
                  location.pathname === to ? "bg-indigo-600 shadow-md" : ""
                }`}
                style={{ cursor: "pointer" }}
              >
                <Icon className={`${iconClass} text-indigo-500 group-hover:text-white`} />
                {isSidebarOpen && (
                  <span className={`${labelClass} text-indigo-300 group-hover:text-white`}>{label}</span>
                )}
                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg"></div>
              </div>
            </li>
          ))}
        </ul>

        {/* Logout Button */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            disabled={loading}
            className={`flex items-center w-full p-4 text-white hover:bg-red-600 transition-all duration-300 rounded-lg mx-2 mb-2 shadow-lg ${
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
              <FaSignOutAlt className={`${iconClass} text-red-400`} />
            )}
            {isSidebarOpen && (
              <span className={`${labelClass} ${loading ? "text-gray-300" : "text-red-400"}`}>
                {loading ? "Logging out..." : "Logout"}
              </span>
            )}
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