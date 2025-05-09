import { Fragment, useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getMenuItems } from "../Redux/Slices/menuSlice";
import { addToCart, updateQuantity } from "../Redux/Slices/cartSlice";
import FloatingSidebar from "../Layout/FloatingSidebar";
import { MdRestaurantMenu } from "react-icons/md";
import { FaShoppingCart, FaPlus, FaMinus, FaSearch, FaFilter } from "react-icons/fa";
import { motion } from "framer-motion";
import Loading from "../Loading/Loading";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ResFvi from "../../assets/ResFvi.png";

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { menu = [], loading, error } = useSelector((state) => state.menu);
  const { items: cartItems } = useSelector((state) => state.cart);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [unfilteredMenu, setUnfilteredMenu] = useState([]);
  const [carouselLoading, setCarouselLoading] = useState(true); // Add loading state for carousel
  const [carouselError, setCarouselError] = useState(null); // Add error state for carousel fetch

  const categories = [
    "All",
    "veg",
    "non-veg",
    "beverages",
    "mocktails",
    "cocktails",
    "snacks",
    "desserts",
  ];
  const types = ["All", "Indian", "Chinese", "Italian", "Continental"];

  // Fetch unfiltered menu items for the carousel on mount
  useEffect(() => {
    const fetchUnfilteredMenu = async () => {
      try {
        setCarouselLoading(true);
        const queryParams = { page: 1, limit: 1000 };
        const result = await dispatch(getMenuItems(queryParams));
        // console.log("Result:",result)
        if (result.payload?.menuItems) {
          setUnfilteredMenu(result.payload.menuItems);
        } else {
          setCarouselError("No data returned for carousel items.");
        }
      } catch (err) {
        console.error("Error fetching unfiltered menu:", err);
        setCarouselError("Failed to load carousel items. Please try again.");
      } finally {
        setCarouselLoading(false);
      }
    };
    fetchUnfilteredMenu();
  }, [dispatch]);

  // Fetch menu items with filters for the main menu section
  const fetchMenuItems = useCallback(() => {
    const queryParams = {
      page: 1,
      limit: 1000,
      search: searchTerm || undefined,
      category: selectedCategory === "All" ? undefined : selectedCategory.toLowerCase(),
      type: selectedType === "All" ? undefined : selectedType,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    };
    dispatch(getMenuItems(queryParams));
  }, [dispatch, searchTerm, selectedCategory, selectedType, minPrice, maxPrice]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  // Group menu items by category
  const filteredMenu = menu.reduce((acc, item) => {
    const category = item.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  // Get recently added items for the carousel using unfiltered menu
  const recentlyAddedItems = [...unfilteredMenu]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

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
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    responsive: [
      {
        breakpoint: 640,
        settings: { slidesToShow: 1, arrows: true },
      },
    ],
  };

  return (
    <Fragment>
      <div className="min-h-screen bg-[#FFF9F5] font-poppins">
        <FloatingSidebar />
        <div className="flex flex-col items-center w-full">
          {/* Hero Section with Carousel */}
          <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="topHeading flex items-center justify-center gap-4 p-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 1,
                  ease: "easeOut",
                  delay: 0.2,
                  type: "spring",
                  stiffness: 100,
                }}
              >
                <motion.img
                  src={ResFvi}
                  className="w-24 h-24  "
                  alt="RestoMaster Logo"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                />
                <motion.h1
                  className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 drop-shadow-lg select-none"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                   Savor the Flavor at <span className="text-amber-600 drop-shadow-lg">RestoMaster</span>
                </motion.h1>

              </motion.div>
              {!user && (
                <Link
                  to="/login"
                  className="mt-4 inline-block bg-orange-500 text-white py-2 px-6 rounded-lg hover:bg-orange-600 transition-all duration-300"
                >
                  Sign In
                </Link>
              )}
            </motion.div>
            {carouselLoading ? (
              <div className="w-full h-48 sm:h-64 md:h-80 flex items-center justify-center bg-gray-200 rounded-lg">
                <Loading />
              </div>
            ) : carouselError ? (
              <div className="w-full h-48 sm:h-64 md:h-80 flex items-center justify-center bg-gray-200 rounded-lg">
                <p className="text-red-500">{carouselError}</p>
              </div>
            ) : (
              <Slider {...carouselSettings}>
                {recentlyAddedItems.length > 0 ? (
                  recentlyAddedItems.map((item, index) => (
                    <div key={index} className="px-2">
                      <div
                        className="relative cursor-pointer"
                        onClick={() => handleItemClick(item._id)}
                      >
                        <img
                          src={
                            item.imageUrl?.[0] ||
                            "https://images.unsplash.com/photo-1513104890138-7cacd3a56ad8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                          }
                          alt={item.name || "Menu Item"}
                          className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-lg"
                          onError={(e) =>
                            (e.target.src =
                              "https://images.unsplash.com/photo-1513104890138-7cacd3a56ad8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80")
                          }
                          loading="lazy"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4 rounded-b-lg">
                          <h3 className="text-lg font-semibold">{item.name || "Unnamed Item"}</h3>
                          {/* <p className="text-sm">${item.price?.toFixed(2) || "N/A"}</p> */}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-2">
                    <div className="w-full h-48 sm:h-64 md:h-80 flex items-center justify-center bg-gray-200 rounded-lg">
                      <p className="text-gray-600">No recently added items available.</p>
                    </div>
                  </div>
                )}
              </Slider>
            )}
          </section>

          {/* Menu Section */}
          <section className="py-12 px-4 sm:px-6 lg:px-8 relative w-full max-w-7xl">
            <motion.div
              className="fixed top-4 right-4 sm:top-6 sm:right-16 z-20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/cart"
                className="bg-orange-500 text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-orange-600 transition-all duration-300 flex items-center justify-center relative"
              >
                <FaShoppingCart className="text-xl sm:text-2xl" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center shadow-md">
                    {totalCartItems}
                  </span>
                )}
              </Link>
            </motion.div>

            <div className="flex flex-col w-full">
              <motion.h2
                className="flex items-center justify-center select-none text-2xl sm:text-4xl font-semibold mb-6 drop-shadow-lg"
                style={{marginBottom:"2rem"}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
               Explore <span className="text-amber-600 drop-shadow-lg">Our Menu</span>
               
               <MdRestaurantMenu className="text-amber-600 drop-shadow-lg"/>
              </motion.h2>

              {/* Search and Filter Options */}
              <motion.div
                className="flex flex-col gap-4 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div className="relative w-full max-w-md">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search dishes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 py-3 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all duration-300 bg-white text-gray-700 placeholder-gray-400"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="sm:hidden py-2 px-4 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-orange-100 transition-all duration-300 flex items-center gap-2"
                  >
                    <FaFilter />
                    Filters
                  </button>
                </div>
                <div
                  className={`${
                    showFilters ? "block" : "hidden"
                  } sm:flex sm:flex-wrap gap-3 mt-4 sm:mt-0`}
                >
                  <div className="flex flex-wrap gap-3 mb-3 sm:mb-0">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`py-2 px-4 rounded-lg border ${
                          selectedCategory === category
                            ? "bg-orange-500 text-white border-orange-500"
                            : "bg-white text-gray-700 border-gray-200"
                        } hover:bg-orange-100 transition-all duration-300 text-sm sm:text-base`}
                      >
                        {category.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3 mb-3 sm:mb-0">
                    {types.map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`py-2 px-4 rounded-lg border ${
                          selectedType === type
                            ? "bg-orange-500 text-white border-orange-500"
                            : "bg-white text-gray-700 border-gray-200"
                        } hover:bg-orange-100 transition-all duration-300 text-sm sm:text-base`}
                      >
                        {type.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <input
                      type="number"
                      placeholder="Min Price"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="py-2 px-4 w-28 sm:w-32 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all duration-300 bg-white text-gray-700 placeholder-gray-400 text-sm sm:text-base"
                    />
                    <input
                      type="number"
                      placeholder="Max Price"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="py-2 px-4 w-28 sm:w-32 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all duration-300 bg-white text-gray-700 placeholder-gray-400 text-sm sm:text-base"
                    />
                    <button
                      onClick={fetchMenuItems}
                      className="py-2 px-4 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-all duration-300 text-sm sm:text-base"
                    >
                      Apply Price Filter
                    </button>
                  </div>
                </div>
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
                  <p className="text-gray-600 mt-4 text-lg">Loading dishes...</p>
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
                  <button
                    onClick={fetchMenuItems}
                    className="mt-4 bg-orange-500 text-white py-2 px-6 rounded-lg hover:bg-orange-600 transition-all duration-300"
                  >
                    Retry
                  </button>
                </motion.div>
              ) : Object.keys(filteredMenu).length === 0 ? (
                <motion.p
                  className="text-center text-gray-600 text-xl font-medium"
                  style={{ marginTop: "4rem" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  No menu items found. Try adjusting your filters.
                </motion.p>
              ) : (
                Object.keys(filteredMenu).map((category, index) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                  >
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
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
                            className={`bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 ${
                              isOutOfStock
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:shadow-md"
                            }`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: itemIndex * 0.1 }}
                          >
                            <div className="relative">
                              <img
                                src={
                                  item.imageUrl?.[0] ||
                                  "https://images.unsplash.com/photo-1513104890138-7cacd3a56ad8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                                }
                                alt={item.name}
                                className="w-full h-40 sm:h-48 object-cover cursor-pointer"
                                onError={(e) =>
                                  (e.target.src =
                                    "https://images.unsplash.com/photo-1513104890138-7cacd3a56ad8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80")
                                }
                                onClick={() => !isOutOfStock && handleItemClick(item._id)}
                                loading="lazy"
                              />
                              {isOutOfStock && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50">
                                  <span className="text-gray-600 text-sm font-semibold">
                                    Unavailable
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h3
                                className="text-lg font-semibold text-gray-800 mb-1 cursor-pointer hover:text-orange-500 transition-colors duration-300 truncate"
                                onClick={() => !isOutOfStock && handleItemClick(item._id)}
                              >
                                {item.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                                {item.description || "A delicious dish to enjoy."}
                              </p>
                              <p className="text-base font-medium text-gray-800 mb-3">
                                ${item.price?.toFixed(2) || "N/A"}
                              </p>
                              {item.isFreshlyMade ? (
                                <p className="text-xs text-green-600 font-medium mb-3">
                                  Made to Order
                                </p>
                              ) : (
                                <p
                                  className={`text-xs font-medium mb-3 ${
                                    item.stock > 0 ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  In Stock: {item.stock !== null ? item.stock : "N/A"}
                                </p>
                              )}
                              <div className="flex items-center justify-between">
                                {quantity > 0 ? (
                                  <div className="flex items-center gap-2">
                                    <motion.button
                                      onClick={() => handleQuantityChange(item._id, quantity - 1)}
                                      className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-300"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <FaMinus className="text-xs text-gray-700" />
                                    </motion.button>
                                    <span className="text-base font-medium text-gray-800">
                                      {quantity}
                                    </span>
                                    <motion.button
                                      onClick={() => handleQuantityChange(item._id, quantity + 1)}
                                      className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-300"
                                      disabled={isOutOfStock || (item.stock !== null && quantity >= item.stock)}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <FaPlus className="text-xs text-gray-700" />
                                    </motion.button>
                                  </div>
                                ) : (
                                  <motion.button
                                    onClick={() => handleAddToCart(item._id)}
                                    className={`${
                                      isOutOfStock
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "bg-orange-500 hover:bg-orange-600"
                                    } text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2 text-sm font-medium`}
                                    disabled={isOutOfStock}
                                    whileHover={{ scale: isOutOfStock ? 1 : 1.05 }}
                                    whileTap={{ scale: isOutOfStock ? 1 : 0.95 }}
                                  >
                                    Add to Cart
                                    <FaPlus className="text-xs" />
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