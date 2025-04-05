/* eslint-disable no-unused-vars */
import { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import FloatingSidebar from '../Layout/FloatingSidebar';
import PropTypes from 'prop-types';
import { FaBox, FaChartBar, FaClipboardList, FaFileInvoice, FaMoneyBill, FaUsers, FaUtensils } from 'react-icons/fa';

const StaffDashboard = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { user } = useSelector((state) => state.auth);
  const [imagePreview, setImagePreview] = useState(
    user?.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
  );

  const quickActions =  user?.permissions || [];
  const actionMap = {
    manage_orders: { name: "Manage Orders", link: "/manage_orders", icon: <FaClipboardList />, bg: "bg-gradient-to-r from-blue-500 to-indigo-500" },
    manage_menu: { name: "Manage Menu", link: "/manage-menu", icon: <FaUtensils />, bg: "bg-gradient-to-r from-green-500 to-teal-500" },
    inventory_management: { name: "Inventory Management", link: "/manage-inventory", icon: <FaBox />, bg: "bg-gradient-to-r from-purple-500 to-pink-500" },
    analytics_management: { name: "Analytics Management", link: "/analytics", icon: <FaChartBar />, bg: "bg-gradient-to-r from-red-500 to-orange-500" },
    view_reports: { name: "View Reports", link: "/reports", icon: <FaFileInvoice />, bg: "bg-gradient-to-r from-gray-500 to-gray-700" },
    manage_payments: { name: "Manage Payments", link: "/payment-manage", icon: <FaMoneyBill />, bg: "bg-gradient-to-r from-yellow-500 to-amber-500" },
    manage_staff: { name: "Manage Users", link: "/manage-staff", icon: <FaUsers />, bg: "bg-gradient-to-r from-pink-500 to-fuchsia-500" },
  };

  // Filter out only the valid permissions
const availableActions = quickActions
.filter((action) => actionMap[action]) // Only keep valid actions
.map((action) => actionMap[action]); // Map to action data

  return (
    <Fragment>
      {/* Main Layout */}
      <div className="min-h-screen flex bg-gradient-to-br from-gray-100 to-gray-200">
        {/* Sidebar */}
        <div className="left-side-navigation">
          <FloatingSidebar />
        </div>

        {/* Main Content */}
        <div
          className={`flex-1 transition-all duration-300 p-6 md:p-10 ${
            isSidebarOpen ? "menu-homeopen" : "menu-home"
          }`}
        >
          {/* Header */}
          <header className="mb-8 flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 bg-clip-text  bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse">
                {user?.role.charAt(0).toUpperCase()+user?.role.slice(1) || "Staff"} Dashboard
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Welcome, <span className="font-semibold text-indigo-600">{user?.name || "Staff"}</span>! Manage your system with ease.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                to="/manage-staff"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
                Manage Staff
              </Link>
            </div>
          </header>

          {/* Admin Details Section */}
          <section className="flex flex-col gap-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">
              Your Profile
            </h2>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt={user?.name || "Admin"}
                    className="w-32 h-32 rounded-full border-4 border-indigo-500 shadow-lg transform hover:scale-105 transition-transform duration-300"
                    onError={(e) =>
                      (e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
                    }
                  />
                  <span className="absolute bottom-2 right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Name */}
                <div className="p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-indigo-50 transition-colors duration-200">
                  <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">Name</p>
                  <p className="text-gray-800 text-xl font-semibold mt-1">{user?.name || "N/A"}</p>
                </div>
                {/* Email */}
                <div className="p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-indigo-50 transition-colors duration-200">
                  <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">Email</p>
                  <p className="text-gray-800 text-xl font-semibold mt-1">{user?.email || "N/A"}</p>
                </div>
                {/* Role */}
                <div className="p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-indigo-50 transition-colors duration-200">
                  <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">Role</p>
                  <p className="text-gray-800 text-xl font-semibold mt-1 capitalize">{user?.role || "N/A"}</p>
                </div>
                {/* Salary */}
                <div className="p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-indigo-50 transition-colors duration-200">
                  <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">Salary</p>
                  <p className="text-gray-800 text-xl font-semibold mt-1">
                    ${user?.salary?.toLocaleString() || "N/A"}/month
                  </p>
                </div>
                {/* Duty Time */}
                <div className="p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-indigo-50 transition-colors duration-200">
                  <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">Duty Time</p>
                  <p className="text-gray-800 text-xl font-semibold mt-1">{user?.duty_time || "N/A"}</p>
                </div>
                {/* Address */}
                <div className="p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-indigo-50 transition-colors duration-200">
                  <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">Address</p>
                  <p className="text-gray-800 text-xl font-semibold mt-1">{user?.address || "N/A"}</p>
                </div>
                {/* Phone */}
                <div className="p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-indigo-50 transition-colors duration-200">
                  <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">Phone</p>
                  <p className="text-gray-800 text-xl font-semibold mt-1">{user?.phone || "N/A"}</p>
                </div>
                {/* Permissions */}
                <div className="p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-indigo-50 transition-colors duration-200 col-span-1 sm:col-span-2 lg:col-span-3">
                  <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">Permissions</p>
                  <p className="text-gray-800 text-xl font-semibold mt-1">
                    {user?.permissions?.length > 0 ? (
                      <span className="flex flex-wrap gap-2">
                        {user.permissions.map((perm, index) => (
                          <span
                            key={index}
                            className="inline-block bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full"
                          >
                            {perm.replace(/_/g, " ")}
                          </span>
                        ))}
                      </span>
                    ) : (
                      "None"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions Section map according to permissions that loged in user has*/}
          <section className="mt-10">
    <h2 className="text-3xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
    {availableActions.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableActions.map(({ name, link, icon, bg }, index) => (
          <Link
            key={index}
            to={link}
            className={`p-6 ${bg} text-white rounded-lg shadow-lg hover:shadow-xl transition-transform transform hover:scale-105`}
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">{icon}</div>
              <h3 className="text-xl font-semibold ml-4">{name}</h3>
            </div>
          </Link>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 text-lg">No quick actions available for your role.</p>
    )}
  </section>
        </div>
      </div>
    </Fragment>
  );
};

StaffDashboard.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired,
};

export default StaffDashboard