import { Fragment, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getMenuItem, resetMenuItem } from "../Redux/Slices/menuSlice";
import { addToCart, updateQuantity } from "../Redux/Slices/cartSlice";
import { FaShoppingCart, FaPlus, FaMinus, FaArrowLeft } from "react-icons/fa";
import Sidebar from "../Layout/Sidebar";
import PropTypes from "prop-types";

const ItemDetails = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { menuItem, loading, error } = useSelector((state) => {
    const item = state.menu.menuItem;
    return {
      menuItem: item && item.menuItem ? item.menuItem : item, // Extract the nested menuItem
      loading: state.menu.loading,
      error: state.menu.error,
    };
  });
  const { items: cartItems } = useSelector((state) => state.cart);

  useEffect(() => {
    if (id) {
      dispatch(getMenuItem(id));
    } else {
      console.error("No item ID provided in URL");
      navigate("/");
    }

    // Cleanup on unmount
    return () => {
      dispatch(resetMenuItem());
    };
  }, [dispatch, id, navigate]);

  const handleAddToCart = () => {
    if (menuItem) {
      dispatch(addToCart({ menu_item: menuItem._id, quantity: 1 }));
    }
  };

  const handleQuantityChange = (quantity) => {
    if (menuItem) {
      dispatch(updateQuantity({ menu_item: menuItem._id, quantity }));
    }
  };

  const handleRetry = () => {
    if (id) {
      dispatch(getMenuItem(id));
    }
  };

  const cartItem = cartItems.find((ci) => ci.menu_item === menuItem?._id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = menuItem && !menuItem.isFreshlyMade && menuItem.stock <= 0;
  const isCartEmpty = cartItems.length === 0;

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
        <p className="ml-4 text-gray-600">Loading item details...</p>
      </div>
    );
  }

  if (error) {
    console.log("Error object:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">
            {error.message || "Error loading item details. Please try again."}
          </p>
          <button
            onClick={handleRetry}
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

  if (!menuItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Item not found.</p>
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

  // Debug the menuItem object and sidebar state
  console.log("Menu item in component:", menuItem);
  console.log("stock", menuItem.stock);
  console.log("Sidebar state:", isSidebarOpen);

  return (
    <Fragment>
      <div className="container mx-auto p-4 pt-6 md:p-6 lg:p-8">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <div
          className={`flex-1 w-full transition-all duration-300 ${
            isSidebarOpen ? "menu-homeopen" : "menu-home"
          }`}
        >
          <button
            onClick={() => navigate(-1)}
            className="fixed top-4 left-4 z-10 bg-gray-200 p-3 rounded-full hover:bg-gray-300 transition-all duration-200 shadow-md"
          >
            <FaArrowLeft className="text-gray-700" />
          </button>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative">
                <img
                  src={
                    menuItem.imageUrl?.[0] ||
                    "https://images.unsplash.com/photo-1513104890138-7cacd3a56ad8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  }
                  alt={menuItem.name}
                  className="w-full h-[400px] object-cover"
                  onError={(e) =>
                    (e.target.src =
                      "https://images.unsplash.com/photo-1513104890138-7cacd3a56ad8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80")
                  }
                />
                {isOutOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-white text-2xl font-semibold">Out of Stock</span>
                  </div>
                )}
                {menuItem.isFreshlyMade && (
                  <span className="absolute top-4 left-4 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    Freshly Made
                  </span>
                )}
              </div>

              <div className="p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                    {menuItem.name}
                  </h1>
                  <p className="text-gray-600 text-lg mb-4">{menuItem.description}</p>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-2xl font-semibold text-amber-600">
                      ${menuItem.price != null ? menuItem.price.toFixed(2) : "N/A"}
                    </span>
                    {menuItem.isFreshlyMade ? (
                      <span className="text-sm text-gray-500 italic">Made to Order</span>
                    ) : (
                      <span className="text-sm text-gray-500">
                        In Stock: {menuItem.stock !== null ? menuItem.stock : "N/A"}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 mb-6">
                    <p className="text-gray-700">
                      <span className="font-semibold">Category:</span>{" "}
                      {menuItem.category ? menuItem.category.toUpperCase() : "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Type:</span>{" "}
                      {menuItem.type || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {quantity > 0 ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-all duration-200"
                        disabled={quantity <= 1}
                      >
                        <FaMinus className="text-gray-700" />
                      </button>
                      <span className="text-xl font-medium text-gray-800">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-all duration-200"
                        disabled={isOutOfStock || (menuItem.stock !== null && quantity >= menuItem.stock)}
                      >
                        <FaPlus className="text-gray-700" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className={`flex items-center gap-2 ${
                        isOutOfStock
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-amber-500 hover:bg-amber-600"
                      } text-white py-3 px-6 rounded-lg transition-all duration-300 shadow-md`}
                      disabled={isOutOfStock}
                    >
                      <FaShoppingCart />
                      Add to Cart
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/cart")}
                    className={`${
                      isCartEmpty ? "bg-gray-400 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-800"
                    } text-white py-3 px-6 rounded-lg transition-all duration-300 shadow-md`}
                    disabled={isCartEmpty}
                  >
                    View Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

ItemDetails.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired,
};

export default ItemDetails;