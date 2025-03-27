import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { placeOrder } from "../Redux/Slices/orderSlice";
import { clearCart, updateQuantity, removeFromCart } from "../Redux/Slices/cartSlice";
import { toast } from "react-toastify";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: cartItems } = useSelector((state) => state.cart);
  const { menu } = useSelector((state) => state.menu);
  const { user } = useSelector((state) => state.auth);

  const [orderDetails, setOrderDetails] = useState({
    table_no: "",
    customer_name: user?.name || "Guest",
    order_type: "dine-in",
  });

  const cartWithDetails = cartItems.map((cartItem) => {
    const menuItem = menu.find((item) => item._id === cartItem.menu_item);
    return { ...cartItem, menuItem };
  });

  const totalPrice = cartWithDetails.reduce((total, item) => {
    return total + (item.menuItem?.price || 0) * item.quantity;
  }, 0);

  const handleQuantityChange = (menuItemId, quantity) => {
    dispatch(updateQuantity({ menu_item: menuItemId, quantity }));
  };

  const handleRemoveItem = (menuItemId) => {
    dispatch(removeFromCart(menuItemId));
    toast.success("Item removed from cart!");
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Please log in to place an order.");
      navigate("/login");
      return;
    }

    const orderData = {
      ...orderDetails,
      items: cartItems,
      total_price: totalPrice,
    };

    try {
      await dispatch(placeOrder(orderData)).unwrap();
      dispatch(clearCart());
      toast.success("Order placed successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error || "Failed to place order.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Your Cart</h1>
      {cartWithDetails.length === 0 ? (
        <p className="text-gray-600 text-center text-lg">Your cart is empty.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 mb-10">
            {cartWithDetails.map((item) => (
              <div
                key={item.menu_item}
                className="flex items-center gap-6 p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={item.menuItem?.imageUrl?.[0] || "https://placehold.co/100x100?text=No+Image"}
                  alt={item.menuItem?.name}
                  className="w-28 h-28 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800">{item.menuItem?.name}</h3>
                  <p className="text-gray-600 mt-1">
                    ${item.menuItem?.price.toFixed(2)} x {item.quantity}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => handleQuantityChange(item.menu_item, item.quantity - 1)}
                      className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200"
                    >
                      <FaMinus className="text-sm text-gray-700" />
                    </button>
                    <span className="text-lg font-medium text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.menu_item, item.quantity + 1)}
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
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Order Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-600 mb-2 font-medium">Table Number</label>
                <input
                  type="text"
                  value={orderDetails.table_no}
                  onChange={(e) =>
                    setOrderDetails({ ...orderDetails, table_no: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200"
                  placeholder="Enter table number"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-2 font-medium">Customer Name</label>
                <input
                  type="text"
                  value={orderDetails.customer_name}
                  onChange={(e) =>
                    setOrderDetails({ ...orderDetails, customer_name: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-2 font-medium">Order Type</label>
                <select
                  value={orderDetails.order_type}
                  onChange={(e) =>
                    setOrderDetails({ ...orderDetails, order_type: e.target.value })
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
  );
};

export default Cart;