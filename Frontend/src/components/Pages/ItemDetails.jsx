import { Fragment, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getMenuItem, resetMenuItem } from "../Redux/Slices/menuSlice";
import { addToCart, updateQuantity } from "../Redux/Slices/cartSlice";
import { FaShoppingCart, FaPlus, FaMinus, FaArrowLeft } from "react-icons/fa";
import FloatingSidebar from "../Layout/FloatingSidebar";
import { selectMenuItemDetails, selectCartItems } from "../../selectors/menuSelectors";

const ItemDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { menuItem, loading, error } = useSelector(selectMenuItemDetails);
  const cartItems = useSelector(selectCartItems);

  useEffect(() => {
    if (id) {
      dispatch(getMenuItem(id));
    } else {
      console.error("No item ID provided in URL");
      navigate("/");
    }

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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-lg">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-lg font-semibold text-gray-700">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log("Error object:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <p className="text-red-500 text-xl font-semibold mb-6">
            {error.message || "Error loading item details. Please try again."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md"
            >
              Retry
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition-all duration-300 shadow-md"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!menuItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <p className="text-gray-600 text-xl font-semibold mb-6">Item not found.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition-all duration-300 shadow-md"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="w-[100vw] h-[100vh] bg-gray-50 font-sans">
        <FloatingSidebar />
        <div className="w-[100vw] h-[100vh] flex justify-center items-center mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Button */}

          <button
            onClick={() => navigate(-1)}
            className="fixed top-4 left-4 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-all duration-300"
          >
            <FaArrowLeft className="text-blue-600 text-lg" />
          </button>

          {/* Main Content */}
          <div className="max-w-5xl flex flex-col mx-auto mt-12 bg-white rounded-2xl overflow-hidden">
            <div className="flex flex-col lg:flex-row justify-between">
              {/* Image Section */}
              <div className="relative w-full lg:w-1/2">
                <img
                  src={
                    menuItem.imageUrl?.[0] ||
                    "https://images.unsplash.com/photo-1513104890138-7cacd3a56ad8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  }
                  alt={menuItem.name}
                  className="w-full h-64 sm:h-80 lg:h-[500px] object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) =>
                    (e.target.src =
                      "https://images.unsplash.com/photo-1513104890138-7cacd3a56ad8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80")
                  }
                />
                {isOutOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <span className="text-white text-xl sm:text-2xl font-bold bg-red-600 px-4 py-2 rounded-lg shadow-lg">
                      Out of Stock
                    </span>
                  </div>
                )}
                {menuItem.isFreshlyMade && (
                  <span className="absolute top-4 left-4 bg-green-500 text-white text-sm sm:text-base font-semibold px-3 py-1 rounded-full shadow-md animate-pulse">
                    Freshly Made
                  </span>
                )}
              </div>

              {/* Details Section */}
              <div className="w-full lg:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                    {menuItem.name}
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
                    {menuItem.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6">
                    <span className="text-xl sm:text-2xl font-bold text-blue-600">
                      ${menuItem.price != null ? menuItem.price.toFixed(2) : "N/A"}
                    </span>
                    {menuItem.isFreshlyMade ? (
                      <span className="text-sm sm:text-base text-green-600 font-medium italic">
                        Made to Order
                      </span>
                    ) : (
                      <span className="text-sm sm:text-base text-gray-700 font-medium">
                        In Stock: {menuItem.stock !== null ? menuItem.stock : "N/A"}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <p className="text-gray-700 text-sm sm:text-base">
                      <span className="font-semibold text-blue-600">Category:</span>{" "}
                      {menuItem.category ? menuItem.category.toUpperCase() : "N/A"}
                    </p>
                    <p className="text-gray-700 text-sm sm:text-base">
                      <span className="font-semibold text-blue-600">Type:</span>{" "}
                      {menuItem.type || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {quantity > 0 ? (
                    <div className="flex items-center gap-3 bg-gray-100 p-2 rounded-full shadow-md">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-300"
                        disabled={quantity <= 1}
                      >
                        <FaMinus className="text-sm" />
                      </button>
                      <span className="text-lg font-semibold text-gray-800">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-300"
                        disabled={
                          isOutOfStock || (menuItem.stock !== null && quantity >= menuItem.stock)
                        }
                      >
                        <FaPlus className="text-sm" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className={`flex items-center gap-2 ${
                        isOutOfStock
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      } text-white py-2 px-6 rounded-lg transition-all duration-300 shadow-md`}
                      disabled={isOutOfStock}
                    >
                      <FaShoppingCart className="text-lg" />
                      <span className="text-sm sm:text-base font-semibold">Add to Cart</span>
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/cart")}
                    className={`${
                      isCartEmpty
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gray-700 hover:bg-gray-800"
                    } text-white py-2 px-6 rounded-lg transition-all duration-300 shadow-md`}
                    disabled={isCartEmpty}
                  >
                    <span className="text-sm sm:text-base font-semibold">View Cart</span>
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

export default ItemDetails;