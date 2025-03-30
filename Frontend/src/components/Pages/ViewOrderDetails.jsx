/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect } from "react";
import Sidebar from "../Layout/Sidebar";
import { getOrderById, clearOrderState } from "../Redux/Slices/orderSlice";
import { getPaymentsByOrder, clearPaymentState } from "../Redux/Slices/paymentSlice";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaArrowLeft, FaPrint } from "react-icons/fa";
import orderDetails from "../../assets/OrderDetails.svg";
import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";

const ViewOrderDetails = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { order, loading, error } = useSelector((state) => state.order);
  const { payments, loading: paymentLoading, error: paymentError } = useSelector((state) => state.payment);
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
      dispatch(getPaymentsByOrder(id));
    } else {
      toast.error("No order ID provided in URL", toastOptions);
      navigate("/");
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearOrderState());
      dispatch(clearPaymentState());
    };
  }, [dispatch, id, navigate]);

  const handlePrintBill = () => {
    if (!order || order.status !== "completed" || order.payment == null) {
      toast.error(
        "Bill can only be printed for completed orders with successful payment",
        toastOptions
      );
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("RestoMaster", 105, 15, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Shevok Road, Siliguri, 734001", 105, 22, { align: "center" });
    doc.text("Mobile No: (+91) 3533564276", 105, 28, { align: "center" });

    // Invoice Number and Date
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Invoice No: ${order._id.slice(-6)}`, 20, 40);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 160, 40);

    // Table Header
    let yPosition = 50;
    doc.setFont("helvetica", "bold");
    doc.text("Item Name", 20, yPosition);
    doc.text("Qty.", 100, yPosition);
    doc.text("Rate", 130, yPosition);
    doc.text("Amount", 160, yPosition);
    doc.line(20, yPosition + 2, 190, yPosition + 2);

    // Order Items
    yPosition += 10;
    doc.setFont("helvetica", "normal");
    order.items.forEach((item) => {
      doc.text(item.menu_item.name, 20, yPosition);
      doc.text(item.quantity.toString(), 100, yPosition);
      doc.text(`$${item.menu_item.price.toFixed(2)}`, 130, yPosition);
      doc.text(`$${(item.menu_item.price * item.quantity).toFixed(2)}`, 160, yPosition);
      yPosition += 8;
    });

    // Totals
    doc.line(20, yPosition + 2, 190, yPosition + 2);
    yPosition += 10;
    const subtotal0 = order.total_price || 0;
    const taxRate = 0.13; // 13% tax
    const tax = subtotal0 * taxRate;
    const subtotal = subtotal0 - tax || 0;
    const discount = 0.00; // Additional discount (set to 0 as per the sample bill)
    const total = subtotal + tax - discount;

    doc.setFont("helvetica", "bold");
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 130, yPosition);
    doc.text(`Tax (13%): $${tax.toFixed(2)}`, 130, yPosition + 8);
    doc.text(`Additional Discount: $${discount.toFixed(2)}`, 130, yPosition + 16);
    doc.text(`Total Payable Value: $${total.toFixed(2)}`, 130, yPosition + 24);

    // Generate Barcode
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, order._id, { format: "CODE128", width: 2, height: 40 });
    const barcodeDataUrl = canvas.toDataURL("image/png");
    doc.addImage(barcodeDataUrl, "PNG", 20, yPosition + 30, 80, 20);

    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Thank You, Visit again!!!!", 105, yPosition + 60, { align: "center" });

    // Open the print dialog instead of saving the PDF
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl);
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      // Optionally, revoke the object URL after printing to free up memory
      printWindow.onfocus = () => {
        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
          printWindow.close();
        }, 0);
      };
    };
  };

  if (loading || paymentLoading) {
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

  if (error || paymentError) {
    toast.error(error || paymentError || "Error loading order details", toastOptions);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">
            {error || paymentError || "Error loading order details. Please try again."}
          </p>
          <button
            onClick={() => {
              dispatch(getOrderById(id));
              dispatch(getPaymentsByOrder(id));
            }}
            className="bg-amber-500 text-white py-2 px-4 rounded-lg hover:bg-amber-600 transition-all duration-200"
          >
            Retry
          </button>
          <button
            onClick={() => navigate("/")}
            className="ml-4 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-all duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Order not found.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-all duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const payment = payments.find((p) => p.order === order._id);
  const canPrintBill = order.status === "completed" && order.payment !== null;

  return (
    <Fragment>
      <div className="main">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <div
          className={`flex items-center transition-all duration-300 ${
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
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Order Details</h1>
                <button
                  onClick={handlePrintBill}
                  className={`flex items-center gap-2 ${
                    canPrintBill
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gray-400 cursor-not-allowed"
                  } text-white py-2 px-4 rounded-lg transition-all duration-300 shadow-md`}
                  disabled={!canPrintBill}
                >
                  <FaPrint />
                  Print Bill
                </button>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Order Information</h2>
                <p className="text-gray-600">
                  <span className="font-semibold">Order ID:</span> {order._id}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Order Date:</span>{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Order Status:</span> {order.status}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Order Type:</span> {order.order_type.toUpperCase()}
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Customer Information</h2>
                <p className="text-gray-600">
                  <span className="font-semibold">Name:</span> {order.customer_name || "Guest"}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Table No:</span> {order.table_no || "N/A"}
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Order Items</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b text-left text-gray-600">Item</th>
                        <th className="py-2 px-4 border-b text-left text-gray-600">Quantity</th>
                        <th className="py-2 px-4 border-b text-left text-gray-600">Price</th>
                        <th className="py-2 px-4 border-b text-left text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, index) => (
                          <tr key={index}>
                            <td className="py-2 px-4 border-b text-gray-700">{item.menu_item.name}</td>
                            <td className="py-2 px-4 border-b text-gray-700">{item.quantity}</td>
                            <td className="py-2 px-4 border-b text-gray-700">
                              ${item.menu_item.price?.toFixed(2) || "0.00"}
                            </td>
                            <td className="py-2 px-4 border-b text-gray-700">
                              ${(item.menu_item.price * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="py-2 px-4 text-center text-gray-500">
                            No items found in this order.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Payment Information</h2>
                <p className="text-gray-600">
                  <span className="font-semibold">Payment ID:</span> {payment?._id || "N/A"}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Payment Method:</span>{" "}
                  {payment?.payment_method || "N/A"}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Payment Status:</span>{" "}
                  {payment?.payment_status || "N/A"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-lg font-semibold text-gray-700">
                  Subtotal: ${order.total_price?.toFixed(2) || "0.00"}
                </p>
                <p className="text-lg font-semibold text-gray-700">
                  Tax (13%): ${(order.total_price * 0.13).toFixed(2) || "0.00"}
                </p>
                <p className="text-xl font-bold text-gray-800">
                  Total: ${(order.total_price + order.total_price * 0.13).toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </div>
          <img className="w-1/2" src={orderDetails} alt="orderDetails" />
        </div>
      </div>
      <ToastContainer />
    </Fragment>
  );
};

ViewOrderDetails.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired,
};

export default ViewOrderDetails;