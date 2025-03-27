import { Fragment, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getMenuItems } from "../Redux/Slices/menuSlice";
import { addToCart, updateQuantity } from "../Redux/Slices/cartSlice";
import Sidebar from "../Layout/Sidebar";
import { FaShoppingCart, FaPlus, FaMinus } from "react-icons/fa";
import PropTypes from "prop-types";

const HomePage = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { menu = [], loading, error } = useSelector((state) => state.menu);
  const { items: cartItems } = useSelector((state) => state.cart);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  useEffect(() => {
    dispatch(getMenuItems());
  }, [dispatch]);

  // Updated categories to match backend schema
  const categories = ["All", "veg", "non-veg", "beverages", "mocktails", "cocktails"];
  const types = ["All", "Indian", "Chinese", "Italian", "Continental"];

  // Filter menu items
  const filteredMenu = menu
    .filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory.toLowerCase();
      const matchesType = selectedType === "All" || item.type === selectedType;
      return matchesSearch && matchesCategory && matchesType;
    })
    .reduce((acc, item) => {
      const category = item.category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});

  const handleAddToCart = (menuItemId) => {
    dispatch(addToCart({ menu_item: menuItemId, quantity: 1 }));
  };

  const handleQuantityChange = (menuItemId, quantity) => {
    dispatch(updateQuantity({ menu_item: menuItemId, quantity }));
  };

  const handleItemClick = (itemId) => {
    navigate(`/menu/${itemId}`);
  };

  const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <Fragment>
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <div
          className={`flex-1 w-full transition-all duration-300 ${
            isSidebarOpen ? "menu-homeopen" : "menu-home"
          }`}
        >
          {/* Hero Section */}
          <section
            className="relative bg-cover bg-center h-[60vh] sm:h-[70vh] md:h-[80vh] flex items-center justify-center text-center text-white"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/30"></div>
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 tracking-tight leading-tight">
                Savor the Flavor at RestoMaster
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl mb-8 font-light">
                {user
                  ? `Hello, ${user?.name || "User"}! Dive into our delicious menu.`
                  : "Log in to explore our mouthwatering menu and place your order."}
              </p>
              {!user && (
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Log In
                </Link>
              )}
            </div>
          </section>

          {/* Menu Section */}
          <section className={`py-12 sm:py-16 px-4 sm:px-6 bg-gray-100 relative`}>
            <Link
              to="/cart"
              className="fixed top-4 right-4 sm:top-6 sm:right-6 z-20 bg-amber-500 text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-amber-600 transition-all duration-300"
            >
              <FaShoppingCart className="text-xl sm:text-2xl" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </Link>

            <div className="flex flex-col gap-6 max-w-7xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 sm:mb-12 text-gray-800">
                Explore Our Menu
              </h2>

              {/* Search and Filter Options */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8 sm:mb-10 justify-center items-center">
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200 shadow-sm"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200 shadow-sm"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200 shadow-sm"
                >
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Menu Items by Category */}
              {loading ? (
                <div className="text-center">
                  <svg
                    className="animate-spin h-8 w-8 mx-auto text-gray-600"
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
                  <p className="text-gray-600 mt-2">Loading menu items...</p>
                </div>
              ) : error ? (
                <p className="text-center text-red-500 text-lg">{error}</p>
              ) : Object.keys(filteredMenu).length === 0 ? (
                <p className="text-center text-gray-600 text-lg">No menu items available.</p>
              ) : (
                Object.keys(filteredMenu).map((category) => (
                  <div key={category} className="mb-12">
                    <h3 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6 sm:mb-8 pb-2">
                      {category.toUpperCase()}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                      {filteredMenu[category].map((item) => {
                        const cartItem = cartItems.find((ci) => ci.menu_item === item._id);
                        const quantity = cartItem ? cartItem.quantity : 0;
                        const isOutOfStock = !item.isFreshlyMade && item.stock <= 0; // Only stocked items can be out of stock

                        return (
                          <div
                            key={item._id}
                            className={`bg-white p-5 sm:p-6 rounded-xl shadow-lg transition-all duration-300 ${
                              isOutOfStock
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:shadow-xl hover:-translate-y-1"
                            }`}
                          >
                            <div className="relative">
                              <img
                                src={
                                  item.imageUrl?.[0] ||
                                  "https://images.unsplash.com/photo-1513104890138-7cacd3a56ad8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                                }
                                alt={item.name}
                                className="w-full h-48 sm:h-56 object-cover rounded-lg mb-4 cursor-pointer"
                                onError={(e) =>
                                  (e.target.src =
                                    "https://images.unsplash.com/photo-1513104890138-7cacd3a56ad8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80")
                                }
                                onClick={() => !isOutOfStock && handleItemClick(item._id)}
                              />
                              {isOutOfStock && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                                  <span className="text-white text-lg font-semibold">Out of Stock</span>
                                </div>
                              )}
                              {/* {item.isFreshlyMade && (
                                <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                                  Freshly Made
                                </span>
                              )} */}
                            </div>
                            <h3
                              className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 cursor-pointer hover:text-amber-600 transition-colors duration-200"
                              onClick={() => !isOutOfStock && handleItemClick(item._id)}
                            >
                              {item.name}
                            </h3>
                            <p className="text-gray-600 text-base sm:text-lg font-medium">
                              ${item.price?.toFixed(2) || "N/A"}
                            </p>
                            {item.isFreshlyMade ? (
                              <p className="text-sm text-gray-500 mt-1">Made to Order</p>
                            ) : (
                              <p className="text-sm text-gray-500 mt-1">
                                In Stock: {item.stock !== null ? item.stock : "N/A"}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-4">
                              {quantity > 0 ? (
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <button
                                    onClick={() => handleQuantityChange(item._id, quantity - 1)}
                                    className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200"
                                  >
                                    <FaMinus className="text-sm text-gray-700" />
                                  </button>
                                  <span className="text-lg font-medium text-gray-800">{quantity}</span>
                                  <button
                                    onClick={() => handleQuantityChange(item._id, quantity + 1)}
                                    className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200"
                                    disabled={isOutOfStock || (item.stock !== null && quantity >= item.stock)}
                                  >
                                    <FaPlus className="text-sm text-gray-700" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleAddToCart(item._id)}
                                  className={`${
                                    isOutOfStock
                                      ? "bg-gray-400 cursor-not-allowed"
                                      : "bg-amber-500 hover:bg-amber-600"
                                  } text-white py-2 px-4 sm:px-6 rounded-lg transition-all duration-200 shadow-sm`}
                                  disabled={isOutOfStock}
                                >
                                  Add to Cart
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </Fragment>
  );
};

HomePage.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired,
};

export default HomePage;