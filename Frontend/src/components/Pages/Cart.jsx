import { useSelector, useDispatch } from "react-redux";
import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { placeOrder } from "../Redux/Slices/orderSlice";
import {
  clearCart,
  updateQuantity,
  removeFromCart,
} from "../Redux/Slices/cartSlice";
import { ToastContainer, toast } from "react-toastify";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import EmptyCart from "../../assets/Empty-bro.svg";
import FloatingSidebar from "../Layout/FloatingSidebar";
import "react-toastify/dist/ReactToastify.css";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: cartItems } = useSelector((state) => state.cart);
  const { menu } = useSelector((state) => state.menu);
  const { user } = useSelector((state) => state.auth);

  const [orderDetails, setOrderDetails] = useState({
    table_no: "",
    customer_name: "",
    order_type: "dine-in",
  });
  const [errors, setErrors] = useState({ table_no: "", customer_name: "" });

  const cartWithDetails = cartItems.map((cartItem) => {
    const menuItem = menu.find((item) => item._id === cartItem.menu_item);
    return { ...cartItem, menuItem };
  });

  const totalPrice = cartWithDetails.reduce((total, item) => {
    return total + (item.menuItem?.price || 0) * item.quantity;
  }, 0);

  const validateInputs = () => {
    let isValid = true;
    const newErrors = { table_no: "", customer_name: "" };

    // Table number validation: must be a positive number
    if (!orderDetails.table_no) {
      newErrors.table_no = "Table number is required";
      isValid = false;
    } else if (!/^\d+$/.test(orderDetails.table_no)) {
      newErrors.table_no = "Table number must be a number";
      isValid = false;
    } else if (parseInt(orderDetails.table_no, 10) <= 0) {
      newErrors.table_no = "Table number must be greater than 0";
      isValid = false;
    }

    // Customer name validation: must be non-empty and contain only letters and spaces
    if (!orderDetails.customer_name.trim()) {
      newErrors.customer_name = "Customer name is required";
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(orderDetails.customer_name.trim())) {
      newErrors.customer_name =
        "Customer name must contain only letters and spaces";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleQuantityChange = (menuItemId, quantity) => {
    if (quantity >= 0) {
      dispatch(updateQuantity({ menu_item: menuItemId, quantity }));
    }
  };

  const handleRemoveItem = (menuItemId) => {
    dispatch(removeFromCart(menuItemId));
    toast.success("Item removed from cart!", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Please log in to place an order.", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty. Add items to place an order.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!validateInputs()) {
      toast.error("Please fix the missing fields in the form.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const orderData = {
      ...orderDetails,
      table_no: parseInt(orderDetails.table_no, 10), // Convert to number
      customer_name: orderDetails.customer_name.trim(),
      items: cartItems,
      total_price: totalPrice,
    };

    try {
      await dispatch(placeOrder(orderData)).unwrap();
      dispatch(clearCart());
      toast.success("Order placed successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/");
    } catch (error) {
      toast.error(error || "Failed to place order.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <Fragment>
      <div className="wrapperCart min-h-screen flex bg-gradient-to-b from-gray-50 to-gray-100">
        <FloatingSidebar />
        <div className="w-full mx-auto p-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Your Cart
          </h1>
          {cartWithDetails.length === 0 ? (
            <div className="empty-cart flex flex-col items-center justify-center w-full">
              <img src={EmptyCart} alt="Empty Cart Img" className="w-1/4" />
              <p className="text-gray-600 text-center text-3xl mt-4">
                Your cart is empty.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 mb-10">
                {cartWithDetails.map((item) => (
                  <div
                    key={item.menu_item}
                    className="flex items-center gap-6 p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <img
                      src={
                        item.menuItem?.imageUrl?.[0] ||
                        "https://placehold.co/100x100?text=No+Image"
                      }
                      alt={item.menuItem?.name}
                      className="w-28 h-28 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {item.menuItem?.name}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        ${item.menuItem?.price.toFixed(2)} x {item.quantity}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.menu_item,
                              item.quantity - 1
                            )
                          }
                          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200"
                        >
                          <FaMinus className="text-sm text-gray-700" />
                        </button>
                        <span className="text-lg font-medium text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.menu_item,
                              item.quantity + 1
                            )
                          }
                          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200"
                        >
                          <FaPlus className="text-sm text-gray-700" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xl font-semibold text-gray-800">
                        ${(item.menuItem?.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.menu_item)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                  Order Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-600 mb-2 font-medium">
                      Table Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={orderDetails.table_no}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          setOrderDetails({ ...orderDetails, table_no: value });
                          setErrors({ ...errors, table_no: "" });
                        }
                      }}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200 ${
                        errors.table_no ? "border-red-500" : ""
                      }`}
                      placeholder="Enter table number"
                      required
                    />
                    {errors.table_no && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.table_no}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-2 font-medium">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={orderDetails.customer_name}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^[a-zA-Z\s]*$/.test(value)) {
                          setOrderDetails({
                            ...orderDetails,
                            customer_name: value,
                          });
                          setErrors({ ...errors, customer_name: "" });
                        }
                      }}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200 ${
                        errors.customer_name ? "border-red-500" : ""
                      }`}
                      placeholder="Enter customer name"
                      required
                    />
                    {errors.customer_name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.customer_name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-2 font-medium">
                      Order Type
                    </label>
                    <select
                      value={orderDetails.order_type}
                      onChange={(e) =>
                        setOrderDetails({
                          ...orderDetails,
                          order_type: e.target.value,
                        })
                      }
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200"
                    >
                      <option value="dine-in">Dine-In</option>
                      <option value="takeaway">Takeaway</option>
                      <option value="online">Online</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-2xl font-semibold text-gray-800">
                    Total: ${totalPrice.toFixed(2)}
                  </p>
                  <button
                    onClick={handlePlaceOrder}
                    className="bg-green-500 text-white py-3 px-8 rounded-lg hover:bg-green-600 transition-all duration-200 shadow-md"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Fragment>
  );
};

export default Cart;
