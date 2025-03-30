/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect } from "react";
import Sidebar from "../Layout/Sidebar";
import { getOrderById, clearOrderState } from "../Redux/Slices/orderSlice";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaArrowLeft } from "react-icons/fa";

const OrderItemsDetails = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { order, loading, error } = useSelector((state) => state.order);
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Toast options
  const toastOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
  };

  useEffect(() => {
    if (id) {
      dispatch(getOrderById(id));
    } else {
      toast.error("No order ID provided in URL", toastOptions);
      navigate("/");
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearOrderState());
    };
  }, [dispatch, id, navigate]);

  // Assuming orders is a single order object for this page
  const orderItem = order;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <svg
          className="animate-spin h-8 w-8 text-gray-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="ml-4 text-gray-600">Loading order details...</p>
    </div>
    );
  }

  if (error) {
    toast.error(error.message || "Error loading order details", toastOptions);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
          <p className="text-red-500 text-lg font-medium mb-6">
            {error.message || "Error loading order details. Please try again."}
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => dispatch(getOrderById(id))}
              className="bg-amber-500 text-white py-2 px-6 rounded-lg hover:bg-amber-600 transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              Retry
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
          <p className="text-gray-600 text-lg font-medium mb-6">Order not found.</p>
          <div className="flex justify-center">
            <button
              onClick={() => navigate("/")}
              className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <Fragment>
      <div className="main">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <div
          className={`flex-1 w-full transition-all duration-300 ${
            isSidebarOpen ? "menu-homeopen" : "menu-home"
          }`}
        >
          <div className="container mx-auto p-4 pt-6 md:p-6 lg:p-8">
            <button
              onClick={() => navigate(-1)}
              className="fixed top-4 left-4 z-10 bg-gray-200 p-3 rounded-full hover:bg-gray-300 transition-all duration-200 shadow-md"
            >
              <FaArrowLeft className="text-gray-700" />
            </button>

            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Order Items for Kitchen</h1>

              {/* Order Information */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Order Information</h2>
                <p className="text-gray-600">
                  <span className="font-semibold">Order ID:</span> {orderItem._id}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Order Date:</span>{" "}
                  {new Date(orderItem.createdAt).toLocaleString()}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Order Status:</span>{" "}
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      orderItem.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : orderItem.status === "Processing"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {orderItem.status}
                  </span>
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Order Type:</span> {orderItem.order_type.toUpperCase()}
                </p>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Items to Prepare</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr>
                        <th className="py-3 px-4 border-b text-left text-gray-600">Item Name</th>
                        <th className="py-3 px-4 border-b text-left text-gray-600">Quantity</th>
                        <th className="py-3 px-4 border-b text-left text-gray-600">Special Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItem.items && orderItem.items.length > 0 ? (
                        orderItem.items.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="py-3 px-4 border-b text-gray-700">{item.menu_item.name}</td>
                            <td className="py-3 px-4 border-b text-gray-700">{item.quantity}</td>
                            <td className="py-3 px-4 border-b text-gray-700">
                              {item.specialInstructions || "None"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="py-3 px-4 text-center text-gray-500">
                            No items found in this order.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </Fragment>
  );
};

OrderItemsDetails.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired,
};

export default OrderItemsDetails;