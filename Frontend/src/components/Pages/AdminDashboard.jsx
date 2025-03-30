/* eslint-disable no-unused-vars */
import { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Sidebar from '../Layout/Sidebar';
import PropTypes from 'prop-types';
const AdminDashboard = ({isSidebarOpen, setIsSidebarOpen}) => {
  const { user } = useSelector((state) => state.auth);
  const [imagePreview, setImagePreview] = useState(user?.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png");

  return (
 <Fragment>
      {/* Main Layout */}
      <div className="min-h-screen flex justify-evenly gap-50 bg-gray-50">
        {/* Sidebar */}
        <div className="left-side-navigation">
          <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        </div>

        {/* Main Content */}
        <div
          className={`flex flex-col gap-5  transition-all duration-300 p-6 ${
            isSidebarOpen ? "ml-64" : "ml-16"
          }`}
        >
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-2">
              Welcome, {user?.name || "Staff"}! Manage your details and settings.
            </p>
          </header>

          {/* Staff Details Section */}
          <section className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Your Details
            </h2>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-center mb-6">
                <img
                  src={imagePreview}
                  alt={user?.name || "Staff"}
                  className="w-24 h-24 rounded-full border-2 border-gray-300 shadow-md"
                  onError={(e) => (e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png")}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500 font-medium">Name</p>
                  <p className="text-gray-800 text-lg">{user?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Email</p>
                  <p className="text-gray-800 text-lg">{user?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Role</p>
                  <p className="text-gray-800 text-lg capitalize">{user?.role || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Salary</p>
                  <p className="text-gray-800 text-lg">${user?.salary?.toLocaleString() || "N/A"}/month</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Duty Time</p>
                  <p className="text-gray-800 text-lg">{user?.duty_time || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Address</p>
                  <p className="text-gray-800 text-lg">{user?.address || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Phone</p>
                  <p className="text-gray-800 text-lg">{user?.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Permissions</p>
                  <p className="text-gray-800 text-lg">
                    {user?.permissions?.length > 0
                      ? user.permissions.map((perm) => perm.replace(/_/g, " ")).join(", ")
                      : "None"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Fragment>
  );
};
AdminDashboard.propTypes = (state) => ({
  isSidebarOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired
});

export default AdminDashboard;