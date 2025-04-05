import { Fragment, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getMenuItems } from "../Redux/Slices/menuSlice";
import { addToCart, updateQuantity } from "../Redux/Slices/cartSlice";
import Sidebar from "../Layout/FloatingSidebar";
import { FaShoppingCart, FaPlus, FaMinus, FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import Loading from "../Loading/Loading";

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

  const categories = ["All", "veg", "non-veg", "beverages", "mocktails", "cocktails","snacks","desserts"];
  const types = ["All", "Indian", "Chinese", "Italian", "Continental"];

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
    if (itemId) {
      navigate(`/item-details/${itemId}`);
    } else {
      console.error("Item ID is undefined, cannot navigate to ItemDetails");
    }
  };

  const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <Fragment>
      <div className="min-h-screen flex bg-gradient-to-b from-gray-50 to-gray-100">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <div
          className={`flex-1 w-full transition-all duration-300`}
        >
          {/* Hero Section */}
          <section
            className="relative bg-cover bg-center h-[70vh] sm:h-[80vh] md:h-[60vh] flex items-center justify-center text-center text-white"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/20"></div>
            <motion.div
              className="relative flex flex-col items-center z-10 max-w-5xl mx-auto px-4 sm:px-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <img className="shadow-logo  w-48" src="../../../public/ResFvi.png" alt=""/> 
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight drop-shadow-lg">
                Savor the Flavor at <span className="text-amber-400">RestoMaster</span>
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl mb-10 font-light drop-shadow-md">
                {user
                  ? `Hello, ${user?.name || "User"}! Dive into our delicious menu.`
                  : "Log in to explore our mouthwatering menu and place your order."}
              </p>
              {!user && (
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-4 px-10 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                >
                  Log In
                </Link>
              )}
            </motion.div>
          </section>

          {/* Menu Section */}
          <section className="flex flex-col items-center py-16 sm:py-20 px-4 sm:px-6 bg-gray-50 relative">
            <motion.div
              className="fixed top-4 right-4 sm:top-6 sm:right-6 z-20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/cart"
                className="bg-amber-500 text-white p-4 sm:p-5 rounded-full shadow-lg hover:bg-amber-600 transition-all duration-300 flex items-center justify-center relative"
              >
                <FaShoppingCart className="text-2xl sm:text-3xl" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm font-bold rounded-full h-7 w-7 flex items-center justify-center shadow-md">
                    {totalCartItems}
                  </span>
                )}
              </Link>
            </motion.div>

            <div className="flex flex-col items-center gap-8 max-w-7xl mx-auto">
              <motion.h2
                className="text-4xl sm:text-5xl font-bold text-center mb-12 sm:mb-16 text-gray-800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Explore Our <span className="text-amber-600">Menu</span>
              </motion.h2>

              {/* Search and Filter Options */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 mb-10 sm:mb-12 justify-center items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="relative w-full sm:w-72">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 p-4 border border-gray-200 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-300 shadow-md bg-white"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="p-4 border border-gray-200 rounded-full w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-300 shadow-md bg-white"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.toUpperCase()}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="p-4 border border-gray-200 rounded-full w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-300 shadow-md bg-white"
                >
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type.toUpperCase()}
                    </option>
                  ))}
                </select>
              </motion.div>

              {/* Menu Items by Category */}
              {loading ? (
                <motion.div
                  className="flex flex-col gap-5 text-center items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                 <Loading />
                  <p className="text-gray-600 mt-4 text-lg">Loading menu items...</p>
                </motion.div>
              ) : error ? (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-red-500 text-xl font-medium">
                    {error.message || "Failed to load menu items. Please try again."}
                  </p>
                </motion.div>
              ) : Object.keys(filteredMenu).length === 0 ? (
                <motion.p
                  className="text-center text-gray-600 text-xl font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  No menu items available.
                </motion.p>
              ) : (
                Object.keys(filteredMenu).map((category, index) => (
                  <motion.div
                    key={category}
                    className="flex flex-col items-center gap-3 justify-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                  >
                    <h3 className="margin text-3xl sm:text-4xl font-semibold text-gray-800 mb-8 sm:mb-10 pb-3 border-b-2 border-amber-200">
                      {category.toUpperCase()}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
                      {filteredMenu[category].map((item, itemIndex) => {
                        const cartItem = cartItems.find((ci) => ci.menu_item === item._id);
                        const quantity = cartItem ? cartItem.quantity : 0;
                        const isOutOfStock = !item.isFreshlyMade && item.stock <= 0;

                        return (
                          <motion.div
                            key={item._id}
                            className={`bg-white p-6 sm:p-5 rounded-2xl shadow-lg transition-all duration-500 ${
                              isOutOfStock
                                ? "opacity-60 cursor-not-allowed"
                                : "hover:shadow-2xl hover:-translate-y-2"
                            } relative overflow-hidden`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: itemIndex * 0.1 }}
                            whileHover={{ scale: isOutOfStock ? 1 : 1.03 }}
                          >
                            <div className="relative">
                              <img
                                src={
                                  item.imageUrl?.[0] ||
                                  "https://images.unsplash.com/photo-1513104890138-7cacd3a56ad8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                                }
                                alt={item.name}
                                className="w-full h-46 sm:h-54 object-cover rounded-xl mb-5 cursor-pointer transition-transform duration-300 hover:scale-105"
                                onError={(e) =>
                                  (e.target.src =
                                    "https://images.unsplash.com/photo-1513104890138-7cacd3a56ad8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80")
                                }
                                onClick={() => !isOutOfStock && handleItemClick(item._id)}
                              />
                              {isOutOfStock && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
                                  <span className="text-white text-xl font-semibold drop-shadow-md">
                                    Out of Stock
                                  </span>
                                </div>
                              )}
                            </div>
                            <h3
                              className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 cursor-pointer hover:text-amber-600 transition-colors duration-300"
                              onClick={() => !isOutOfStock && handleItemClick(item._id)}
                            >
                              {item.name}
                            </h3>
                            <p className="text-gray-600 text-lg sm:text-xl font-medium mb-2">
                              ${item.price?.toFixed(2) || "N/A"}
                            </p>
                            {item.isFreshlyMade ? (
                              <p className="text-sm text-green-600 font-medium mb-4">Made to Order</p>
                            ) : (
                              <p
                                className={`text-sm font-medium mb-4 ${
                                  item.stock > 0 ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                In Stock: {item.stock !== null ? item.stock : "N/A"}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              {quantity > 0 ? (
                                <div className="flex items-center gap-3 sm:gap-4">
                                  <motion.button
                                    onClick={() => handleQuantityChange(item._id, quantity - 1)}
                                    className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-300 shadow-sm"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <FaMinus className="text-sm text-gray-700" />
                                  </motion.button>
                                  <span className="text-xl font-medium text-gray-800">{quantity}</span>
                                  <motion.button
                                    onClick={() => handleQuantityChange(item._id, quantity + 1)}
                                    className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-300 shadow-sm"
                                    disabled={isOutOfStock || (item.stock !== null && quantity >= item.stock)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <FaPlus className="text-sm text-gray-700" />
                                  </motion.button>
                                </div>
                              ) : (
                                <motion.button
                                  onClick={() => handleAddToCart(item._id)}
                                  className={`${
                                    isOutOfStock
                                      ? "bg-gray-400 cursor-not-allowed"
                                      : "bg-amber-500 hover:bg-amber-600"
                                  } text-white py-3 px-6 sm:px-8 rounded-full transition-all duration-300 shadow-md font-semibold`}
                                  disabled={isOutOfStock}
                                  whileHover={{ scale: isOutOfStock ? 1 : 1.05 }}
                                  whileTap={{ scale: isOutOfStock ? 1 : 0.95 }}
                                >
                                  Add to Cart
                                </motion.button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
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