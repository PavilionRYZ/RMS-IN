/* eslint-disable no-unused-vars */
import { useState } from "react";
import PropTypes from "prop-types";
import { FaBars, FaHome, FaTimes, FaTachometerAlt, FaShoppingCart, FaCalendarAlt, FaBox, FaCogs, FaChartBar, FaEnvelope, FaSignOutAlt, FaUsers } from "react-icons/fa";
import { MdOutlineMenuBook,MdPayments ,MdOutlinePayments  } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logout, clearCookies } from "../Redux/Slices/authSlice";
import { resetUserState } from "../Redux/Slices/userSlice";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { clearOrderState } from "../Redux/Slices/orderSlice";
import { motion } from "framer-motion"; // Import framer-motion

const navLinks = [
  { to: "/", label: "Home", icon: FaHome, permission: null },
  { to: "/staff", label: "Dashboard", icon: FaTachometerAlt, roles: ["kitchen_staff", "staff"] },
  { to: "/manage_orders", label: "Manage Order", icon: FaShoppingCart, permission: "manage_orders" },
  { to: "/manage-inventory", label: "Manage Inventory", icon: FaBox, permission: "inventory_management" },
  { to: "/manage-menu", label: "Manage Menu", icon: MdOutlineMenuBook, permission: "manage_menu" },
  { to: "/manage-staff", label: "Manage Staff", icon: FaUsers, permission: "manage_staff", role: "admin" },
  { to: "/manage-staff-payments", label: "Manage Salary", icon: MdOutlinePayments , role: "admin" },
  { to: "/payment-manage", label: "Payment Manage", icon: MdPayments , permission: "manage_payments" },
  // { to: "/reports", label: "Report", icon: FaChartBar, permission: "view_reports" },
  { to: "/analytics", label: "Analytics", icon: FaChartBar, permission: "analytics_management" },

];

const roleAccess = {
  admin: ["dashboard_access", "manage_orders", "manage_reservations", "manage_payments", "production_management", "view_reports", "analytics_management", "manage_messages"],
  kitchen_staff: [],
  staff: [],
  customer: ["manage_reservations", "manage_messages"],
};

const FloatingSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
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

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success("Logged out successfully!", toastOptions);
      dispatch(resetUserState());
      dispatch(clearOrderState());
      dispatch(clearCookies());
      setIsOpen(false);
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
      if (roles) return roles.includes(userRole);
      return userPermissions.includes(permission) || rolePermissions.includes(permission);
    });
  };

  const filteredNavLinks = getFilteredNavLinks();

  const handleNavigation = (to) => {
    navigate(to);
    setIsOpen(false);
  };

  // Animation variants for the sidebar menu
  const menuVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      x: 50, // Start slightly off to the right
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  // Animation variants for the button
  const buttonVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Floating Button with Toggle Icon */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 p-4 rounded-full text-white shadow-lg hover:bg-indigo-700 transition-colors duration-300"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        aria-label={isOpen ? "Close Menu" : "Open Menu"}
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </motion.button>

      {/* Floating Menu */}
      <motion.div
        initial="hidden"
        animate={isOpen ? "visible" : "hidden"}
        variants={menuVariants}
        className="absolute bottom-16 right-0 bg-indigo-900 rounded-lg shadow-2xl w-72 max-h-[80vh] overflow-y-auto"
      >
        {isOpen && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-indigo-500 bg-indigo-800">
              <div className="flex items-center gap-3">
                <img
                  src={user?.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full border-2 border-indigo-400"
                  onError={(e) => (e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png")}
                />
                <div>
                  <h2 className="text-sm font-bold text-indigo-100">{user?.name || "User Name"}</h2>
                  <p className="text-xs text-indigo-300 capitalize">{user?.role || "Role"}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-indigo-200 hover:bg-indigo-700 rounded-full"
                aria-label="Close Menu"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-2">
              {filteredNavLinks.map(({ to, label, icon: Icon }) => (
                <motion.div
                  key={label}
                  onClick={() => handleNavigation(to)}
                  className={`flex items-center gap-3 p-3 hover:bg-indigo-600 rounded-lg cursor-pointer transition-all duration-300 ${
                    location.pathname === to ? "bg-indigo-600" : ""
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="text-xl text-indigo-300" />
                  <span className="text-sm text-indigo-100">{label}</span>
                </motion.div>
              ))}
            </nav>

            {/* Logout */}
            <div className="p-2 border-t border-indigo-500">
              <motion.button
                onClick={handleLogout}
                disabled={loading}
                className={`flex items-center gap-3 w-full p-3 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-300 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <FaSignOutAlt className="text-xl" />
                )}
                <span className="text-sm">{loading ? "Logging out..." : "Logout"}</span>
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

FloatingSidebar.propTypes = {};

export default FloatingSidebar;