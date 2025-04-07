import { Fragment, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getMenuItems } from "../Redux/Slices/menuSlice";
import { addToCart, updateQuantity } from "../Redux/Slices/cartSlice";
import FloatingSidebar from "../Layout/FloatingSidebar"; // Updated to FloatingSidebar
import { FaShoppingCart, FaPlus, FaMinus, FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import Loading from "../Loading/Loading";
import Slider from "react-slick"; // Import react-slick for carousel
import "slick-carousel/slick/slick.css"; // Slick carousel styles
import "slick-carousel/slick/slick-theme.css"; // Slick carousel theme

const HomePage = () => {
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

  const categories = ["All", "veg", "non-veg", "beverages", "mocktails", "cocktails", "snacks", "desserts"];
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
    if (itemId) navigate(`/item-details/${itemId}`);
    else console.error("Item ID is undefined, cannot navigate to ItemDetails");
  };

  const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Carousel settings
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    responsive: [
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  // Unsplash food images for carousel
  const carouselImages = [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1567337710282-00832b415979?q=80&w=1930&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1971&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
  ];

  return (
    <Fragment>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-gray-100">
        <FloatingSidebar />

        <div className="flex flex-col items-center w-full">
          {/* Hero Section with Carousel */}
          <section className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] w-full overflow-hidden">
            <Slider {...carouselSettings}>
              {carouselImages.map((image, index) => (
                <div key={index} className="relative h-[60vh] sm:h-[70vh] md:h-[80vh]">
                  <img
                    src={image}
                    alt={`Food ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                  <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 sm:px-6"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  >
                    <img className="w-32 sm:w-48 mb-4 drop-shadow-lg" src="../../assets/ResFvi.png" alt="Logo" />
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-4 sm:mb-6 tracking-tight leading-tight drop-shadow-xl">
                      Savor the Flavor at <span className="text-amber-400">RestoMaster</span>
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 font-light drop-shadow-md max-w-2xl">
                      {user
                        ? `Hello, ${user?.name || "User"}! Dive into our delicious menu.`
                        : "Log in to explore our mouthwatering menu and place your order."}
                    </p>
                    {!user && (
                      <Link
                        to="/login"
                        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 px-8 sm:py-4 sm:px-10 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                      >
                        Log In
                      </Link>
                    )}
                  </motion.div>
                </div>
              ))}
            </Slider>
          </section>

          {/* Menu Section */}
          <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              className="fixed top-4 right-4 sm:top-6 sm:right-16 z-20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/cart"
                className="bg-amber-500 text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-amber-600 transition-all duration-300 flex items-center justify-center relative"
              >
                <FaShoppingCart className="text-xl sm:text-2xl" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center shadow-md">
                    {totalCartItems}
                  </span>
                )}
              </Link>
            </motion.div>

            <div className="flex flex-col w-full mx-auto">
              <motion.h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-10 md:mb-12 sm:mb-12 text-gray-800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }} 
                style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",marginBottom: "2rem" }}
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
                <div className="relative w-full max-w-xs">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 py-3 w-full border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-300 shadow-sm bg-white text-gray-700"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="py-3 px-4 w-full max-w-xs sm:max-w-[10rem] border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-300 shadow-sm bg-white text-gray-700"
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
                  className="py-3 px-4 w-full max-w-xs sm:max-w-[10rem] border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-300 shadow-sm bg-white text-gray-700"
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
                    className="mb-12 sm:mb-16"
                    style={{display: 'flex', flexDirection: 'column', gap:"1rem",marginTop:"1rem" }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                  >
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 mb-6 sm:mb-8 text-center pb-2 border-b-2 border-amber-300 inline-block">
                      {category.toUpperCase()}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {filteredMenu[category].map((item, itemIndex) => {
                        const cartItem = cartItems.find((ci) => ci.menu_item === item._id);
                        const quantity = cartItem ? cartItem.quantity : 0;
                        const isOutOfStock = !item.isFreshlyMade && item.stock <= 0;

                        return (
                          <motion.div
                            key={item._id}
                            className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${
                              isOutOfStock
                                ? "opacity-70 cursor-not-allowed"
                                : "hover:shadow-xl hover:-translate-y-1"
                            }`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: itemIndex * 0.1 }}
                            whileHover={{ scale: isOutOfStock ? 1 : 1.02 }}
                          >
                            <div className="relative">
                              <img
                                src={
                                  item.imageUrl?.[0] ||
                                  "https://images.unsplash.com/photo-1513104890138-7cacd3a56ad8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                                }
                                alt={item.name}
                                className="w-full h-40 sm:h-48 md:h-56 object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                                onError={(e) =>
                                  (e.target.src =
                                    "https://images.unsplash.com/photo-1513104890138-7cacd3a56ad8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80")
                                }
                                onClick={() => !isOutOfStock && handleItemClick(item._id)}
                              />
                              {isOutOfStock && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                  <span className="text-white text-lg font-semibold drop-shadow-md">
                                    Out of Stock
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="p-4 sm:p-5">
                              <h3
                                className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 cursor-pointer hover:text-amber-600 transition-colors duration-300 truncate"
                                onClick={() => !isOutOfStock && handleItemClick(item._id)}
                              >
                                {item.name}
                              </h3>
                              <p className="text-gray-600 text-base sm:text-lg font-medium mb-2">
                                ${item.price?.toFixed(2) || "N/A"}
                              </p>
                              {item.isFreshlyMade ? (
                                <p className="text-xs sm:text-sm text-green-600 font-medium mb-3">Made to Order</p>
                              ) : (
                                <p
                                  className={`text-xs sm:text-sm font-medium mb-3 ${
                                    item.stock > 0 ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  In Stock: {item.stock !== null ? item.stock : "N/A"}
                                </p>
                              )}
                              <div className="flex items-center justify-between">
                                {quantity > 0 ? (
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <motion.button
                                      onClick={() => handleQuantityChange(item._id, quantity - 1)}
                                      className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-300 shadow-sm"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <FaMinus className="text-xs sm:text-sm text-gray-700" />
                                    </motion.button>
                                    <span className="text-base sm:text-lg font-medium text-gray-800">
                                      {quantity}
                                    </span>
                                    <motion.button
                                      onClick={() => handleQuantityChange(item._id, quantity + 1)}
                                      className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-300 shadow-sm"
                                      disabled={isOutOfStock || (item.stock !== null && quantity >= item.stock)}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <FaPlus className="text-xs sm:text-sm text-gray-700" />
                                    </motion.button>
                                  </div>
                                ) : (
                                  <motion.button
                                    onClick={() => handleAddToCart(item._id)}
                                    className={`${
                                      isOutOfStock
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-amber-500 hover:bg-amber-600"
                                    } text-white py-2 px-4 sm:py-2.5 sm:px-6 rounded-full transition-all duration-300 shadow-md font-medium text-sm sm:text-base`}
                                    disabled={isOutOfStock}
                                    whileHover={{ scale: isOutOfStock ? 1 : 1.05 }}
                                    whileTap={{ scale: isOutOfStock ? 1 : 0.95 }}
                                  >
                                    Add to Cart
                                  </motion.button>
                                )}
                              </div>
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

export default HomePage;