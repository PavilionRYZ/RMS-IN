/* eslint-disable react/prop-types */
import {
  FaUtensils,
  FaChartBar,
  FaUsers,
  FaShoppingCart,
} from "react-icons/fa";

const Home = () => {
  return (
    <div className="bg-gray-100">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center h-[80vh] flex items-center justify-center text-white text-center"
        style={{
          backgroundImage:
            "url('https://source.unsplash.com/1600x900/?restaurant,food')",
        }}
      >
        <div className="bg-black bg-opacity-50 p-10 rounded-lg">
          <h1 className="text-5xl font-bold">Welcome to RestoMaster</h1>
          <p className="text-lg mt-3">
            All-in-One Restaurant Management Solution
          </p>
          <button className="mt-5 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-full font-semibold">
            Get Started
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-6xl mx-auto py-12 px-6 text-center">
        <h2 className="text-3xl font-bold">Why Choose RestoMaster?</h2>
        <p className="text-gray-600 mt-3">
          Streamline restaurant operations, enhance customer experiences, and
          boost profitability with our all-in-one platform.
        </p>
      </section>

      {/* Features Section */}
      <section className="bg-white py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-6">
          <FeatureCard
            icon={<FaShoppingCart />}
            title="Online Orders"
            desc="Manage dine-in, takeaway, and online orders efficiently."
          />
          <FeatureCard
            icon={<FaUsers />}
            title="Staff Management"
            desc="Assign roles and track employee performance seamlessly."
          />
          <FeatureCard
            icon={<FaChartBar />}
            title="Sales Analytics"
            desc="Gain insights into sales, trends, and performance metrics."
          />
          <FeatureCard
            icon={<FaUtensils />}
            title="Menu Customization"
            desc="Easily update menus with add-ons and pricing changes."
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto py-12 px-6 text-center">
        <h2 className="text-3xl font-bold">What People Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          <Testimonial
            name="Emily R."
            review="RestoMaster transformed our restaurant! Super easy to use and efficient."
          />
          <Testimonial
            name="Michael B."
            review="A must-have for restaurant owners. Staff and sales tracking are spot on!"
          />
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-gray-100 p-6 text-center rounded-lg shadow-md">
    <div className="text-yellow-500 text-4xl">{icon}</div>
    <h3 className="text-xl font-semibold mt-3">{title}</h3>
    <p className="text-gray-600 mt-2">{desc}</p>
  </div>
);

const Testimonial = ({ name, review }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <p className="text-gray-700">&quot;{review}&quot;</p>
    <h4 className="mt-3 font-semibold">- {name}</h4>
  </div>
);

export default Home;
