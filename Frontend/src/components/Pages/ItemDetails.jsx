import { Fragment, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getMenuItem, resetMenuItem } from "../Redux/Slices/menuSlice";
import { addToCart, updateQuantity } from "../Redux/Slices/cartSlice";
import { FaShoppingCart, FaPlus, FaMinus, FaArrowLeft } from "react-icons/fa";
import FloatingSidebar from "../Layout/FloatingSidebar";
import { selectMenuItemDetails, selectCartItems } from "../../selectors/menuSelectors"; // Import selectors

const ItemDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { menuItem, loading, error } = useSelector(selectMenuItemDetails); // Use memoized selector
  const cartItems = useSelector(selectCartItems); // Use memoized selector for cart

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-gray-100">
        <div className="flex items-center space-x-4 bg-white/80 p-6 rounded-xl shadow-lg backdrop-blur-sm">
          <svg
            className="animate-spin h-10 w-10 text-amber-600"
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
          <p className="text-xl font-medium text-gray-700">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log("Error object:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-gray-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-2xl border border-amber-100">
          <p className="text-red-500 text-2xl font-semibold mb-6">
            {error.message || "Error loading item details. Please try again."}
          </p>
          <div className="space-x-4">
            <button
              onClick={handleRetry}
              className="bg-amber-500 text-white py-3 px-6 rounded-full hover:bg-amber-600 transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              Retry
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-gray-500 text-white py-3 px-6 rounded-full hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 shadow-md"
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-gray-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-2xl border border-amber-100">
          <p className="text-gray-600 text-2xl font-semibold mb-6">Item not found.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-gray-500 text-white py-3 px-6 rounded-full hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 shadow-md"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="container mx-auto p-4 pt-6 md:p-6 lg:p-8 ">
        <FloatingSidebar />
        <div className="flex-1 w-full transition-all duration-300">
          <button
            onClick={() => navigate(-1)}
            className="fixed top-6 left-6 z-10 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1"
          >
            <FaArrowLeft className="text-amber-600 text-xl" />
          </button>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl overflow-hidden transform transition-all duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="relative group">
                  <img
                    src={
                      menuItem.imageUrl?.[0] ||
                      "https://images.unsplash.com/photo-1513104890138-7cacd3a56ad8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                    }
                    alt={menuItem.name}
                    className="w-full h-[450px] object-cover transition-all duration-300 group-hover:scale-105"
                    onError={(e) =>
                      (e.target.src =
                        "https://images.unsplash.com/photo-1513104890138-7cacd3a56ad8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80")
                    }
                  />
                  {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <span className="text-white text-3xl font-bold bg-red-600 px-4 py-2 rounded-full shadow-lg">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  {menuItem.isFreshlyMade && (
                    <span className="absolute top-6 left-6 bg-green-500 text-white text-lg font-semibold px-4 py-2 rounded-full shadow-md animate-pulse">
                      Freshly Made
                    </span>
                  )}
                </div>

                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                      {menuItem.name}
                    </h1>
                    <p className="text-gray-600 text-xl leading-relaxed mb-6">{menuItem.description}</p>
                    <div className="flex items-center gap-6 mb-6">
                      <span className="text-3xl font-extrabold text-amber-600 drop-shadow-md">
                        ${menuItem.price != null ? menuItem.price.toFixed(2) : "N/A"}
                      </span>
                      {menuItem.isFreshlyMade ? (
                        <span className="text-lg text-green-600 font-medium italic">Made to Order</span>
                      ) : (
                        <span className="text-lg text-gray-700 font-medium">
                          In Stock: {menuItem.stock !== null ? menuItem.stock : "N/A"}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <p className="text-gray-800 text-lg">
                        <span className="font-semibold text-amber-600">Category:</span>{" "}
                        {menuItem.category ? menuItem.category.toUpperCase() : "N/A"}
                      </p>
                      <p className="text-gray-800 text-lg">
                        <span className="font-semibold text-amber-600">Type:</span>{" "}
                        {menuItem.type || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {quantity > 0 ? (
                      <div className="flex items-center gap-4 bg-gray-100 p-3 rounded-full shadow-md">
                        <button
                          onClick={() => handleQuantityChange(quantity - 1)}
                          className="p-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-all duration-300 transform hover:scale-110"
                          disabled={quantity <= 1}
                        >
                          <FaMinus />
                        </button>
                        <span className="text-2xl font-bold text-gray-900">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(quantity + 1)}
                          className="p-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-all duration-300 transform hover:scale-110"
                          disabled={
                            isOutOfStock || (menuItem.stock !== null && quantity >= menuItem.stock)
                          }
                        >
                          <FaPlus />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleAddToCart}
                        className={`flex items-center gap-3 ${
                          isOutOfStock
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        } text-white py-4 px-8 rounded-full transition-all duration-300 shadow-lg transform hover:scale-105`}
                        disabled={isOutOfStock}
                      >
                        <FaShoppingCart className="text-xl" />
                        <span className="text-lg font-semibold">Add to Cart</span>
                      </button>
                    )}
                    <button
                      onClick={() => navigate("/cart")}
                      className={`${
                        isCartEmpty
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900"
                      } text-white py-4 px-8 rounded-full transition-all duration-300 shadow-lg transform hover:scale-105`}
                      disabled={isCartEmpty}
                    >
                      <span className="text-lg font-semibold">View Cart</span>
                    </button>
                  </div>
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