/* eslint-disable no-unused-vars */
import { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Sidebar from '../Layout/Sidebar';
import PropTypes from 'prop-types';

const AdminDashboard = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { user } = useSelector((state) => state.auth);
  const [imagePreview, setImagePreview] = useState(
    user?.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
  );

  return (
    <Fragment>
      {/* Main Layout */}
      <div className="min-h-screen flex bg-gradient-to-br from-gray-100 to-gray-200">
        {/* Sidebar */}
        <div className="left-side-navigation">
          <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
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
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Welcome, <span className="font-semibold text-indigo-600">{user?.name || "Admin"}</span>! Manage your system with ease.
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

          {/* Quick Actions Section */}
          <section className="mt-10">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link
                to="/manage-orders"
                className="flex items-center p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <svg
                  className="w-8 h-8 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3h18M3 3v18M3 3l18 18M21 3v18"
                  ></path>
                </svg>
                <span className="text-lg font-semibold">Manage Orders</span>
              </Link>
              <Link
                to="/manage-menu"
                className="flex items-center p-6 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <svg
                  className="w-8 h-8 mr-3"
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
                <span className="text-lg font-semibold">Manage Menu</span>
              </Link>
              <Link
                to="/manage-customers"
                className="flex items-center p-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <svg
                  className="w-8 h-8 mr-3"
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
                <span className="text-lg font-semibold">Manage Customers</span>
              </Link>
              <Link
                to="/analytics"
                className="flex items-center p-6 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <svg
                  className="w-8 h-8 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  ></path>
                </svg>
                <span className="text-lg font-semibold">View Analytics</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </Fragment>
  );
};

AdminDashboard.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired,
};

export default AdminDashboard;