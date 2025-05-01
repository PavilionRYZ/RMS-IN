/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect } from "react";
import FloatingSidebar from "../Layout/FloatingSidebar";
import { getOrderById, clearOrderState } from "../Redux/Slices/orderSlice";
import { getPaymentsByOrder, clearPaymentState } from "../Redux/Slices/paymentSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaArrowLeft, FaPrint } from "react-icons/fa";
import orderDetails from "../../assets/OrderDetails.svg";
import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";

const ViewOrderDetails = () => {
  const { order, loading, error } = useSelector((state) => state.order);
  const { payments, loading: paymentLoading, error: paymentError } = useSelector((state) => state.payment);
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
      dispatch(getPaymentsByOrder({ orderId: id, page: 1, limit: 10 }));
    } else {
      toast.error("No order ID provided in URL", toastOptions);
      navigate("/");
    }

    return () => {
      dispatch(clearOrderState());
      dispatch(clearPaymentState());
    };
  }, [dispatch, id, navigate]);

  useEffect(() => {
    if (error) {
      console.error("Order Error:", error);
      toast.error(error.message || "Error loading order details", toastOptions);
    }
    if (paymentError) {
      console.error("Payment Error:", paymentError);
      toast.error(paymentError.message || "Error loading payment details", toastOptions);
    }
  }, [error, paymentError]);

  const handlePrintBill = () => {
    if (!order || order.status !== "completed" || !order.payment) {
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

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("RestoMaster", 105, 15, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Shevok Road, Siliguri, 734001", 105, 22, { align: "center" });
    doc.text("Mobile No: (+91) 3533564276", 105, 28, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Invoice No: ${order._id.slice(-6)}`, 20, 40);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 160, 40);


    //add customer details
    doc.setFont("helvetica", "normal");
    doc.text(`Customer Name: ${order.customer_name || "Guest"}`, 20, 50);
    doc.text(`Table No: ${order.table_no || "N/A"}`, 20, 60);
    doc.text(`Order Type: ${order.order_type?.toUpperCase() || "N/A"}`, 20, 70);
    doc.text(`Order Status: ${order.status || "N/A"}`, 20, 80);
    doc.text(`Payment Status: ${order.payment?.payment_status || "N/A"}`, 20, 90);  

    let yPosition = 95;
    doc.setFont("helvetica", "bold");
    doc.text("Item Name", 20, yPosition);
    doc.text("Qty.", 100, yPosition);
    doc.text("Rate", 130, yPosition);
    doc.text("Amount", 160, yPosition);
    doc.line(20, yPosition + 2, 190, yPosition + 2);

    yPosition += 10;
    doc.setFont("helvetica", "normal");
    (order.items || []).forEach((item) => {
      const itemName = item.menu_item?.name || "Unknown Item";
      const itemPrice = item.menu_item?.price || 0;
      doc.text(itemName, 20, yPosition);
      doc.text(item.quantity.toString(), 100, yPosition);
      doc.text(`$${itemPrice.toFixed(2)}`, 130, yPosition);
      doc.text(`$${(itemPrice * item.quantity).toFixed(2)}`, 160, yPosition);
      yPosition += 8;
    });

    doc.line(20, yPosition + 2, 190, yPosition + 2);
    yPosition += 10;
    const subtotal0 = order.total_price || 0;
    const taxRate = 0.13;
    const tax = subtotal0 * taxRate;
    const subtotal = subtotal0 - tax;
    const discount = 0.00;
    const total = subtotal + tax - discount;

    doc.setFont("helvetica", "bold");
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 130, yPosition);
    doc.text(`Tax (13%): $${tax.toFixed(2)}`, 130, yPosition + 8);
    doc.text(`Additional Discount: $${discount.toFixed(2)}`, 130, yPosition + 16);
    doc.text(`Total Payable Value: $${total.toFixed(2)}`, 130, yPosition + 24);

    const canvas = document.createElement("canvas");
    JsBarcode(canvas, order._id, { format: "CODE128", width: 2, height: 40 });
    const barcodeDataUrl = canvas.toDataURL("image/png");
    doc.addImage(barcodeDataUrl, "PNG", 20, yPosition + 30, 80, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Thank You, Visit again!!!!", 105, yPosition + 60, { align: "center" });

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.onfocus = () => {
          setTimeout(() => {
            URL.revokeObjectURL(pdfUrl);
            printWindow.close();
          }, 0);
        };
      };
    } else {
      toast.error("Failed to open print window. Please allow pop-ups.", toastOptions);
    }
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">
            {error?.message || paymentError?.message || "Error loading order details. Please try again."}
          </p>
          <button
            onClick={() => {
              dispatch(getOrderById(id));
              dispatch(getPaymentsByOrder({ orderId: id, page: 1, limit: 10 }));
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
  const canPrintBill = order.status === "completed" && payment?.payment_status === "completed";

  return (
    <Fragment>
      <div className="main">
        <FloatingSidebar />
        <div className="flex items-center transition-all duration-300">
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
                  <span className="font-semibold">Order ID:</span> {order._id || "N/A"}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Order Date:</span>{" "}
                  {order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Order Status:</span> {order.status || "N/A"}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Order Type:</span>{" "}
                  {order.order_type?.toUpperCase() || "N/A"}
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
                      {(order.items || []).length > 0 ? (
                        order.items.map((item, index) => (
                          <tr key={index}>
                            <td className="py-2 px-4 border-b text-gray-700">
                              {item.menu_item?.name || "Unknown Item"}
                            </td>
                            <td className="py-2 px-4 border-b text-gray-700">{item.quantity || 0}</td>
                            <td className="py-2 px-4 border-b text-gray-700">
                              ${(item.menu_item?.price || 0).toFixed(2)}
                            </td>
                            <td className="py-2 px-4 border-b text-gray-700">
                              ${((item.menu_item?.price || 0) * (item.quantity || 0)).toFixed(2)}
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
                  Subtotal: ${(order.total_price || 0).toFixed(2)}
                </p>
                <p className="text-lg font-semibold text-gray-700">
                  Tax (13%): ${((order.total_price || 0) * 0.13).toFixed(2)}
                </p>
                <p className="text-xl font-bold text-gray-800">
                  Total: ${((order.total_price || 0) + (order.total_price || 0) * 0.13).toFixed(2)}
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

export default ViewOrderDetails;