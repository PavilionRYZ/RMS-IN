// import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 bottom-0 text-white py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold">RMS-IN</h2>
            <p className="text-gray-400 mt-2">Your Comprehensive Restaurent Management Solution</p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col space-y-2 text-center">
            <a href="#" className="hover:text-gray-400">Home</a>
            <a href="#" className="hover:text-gray-400">About</a>
            <a href="#" className="hover:text-gray-400">Services</a>
            <a href="#" className="hover:text-gray-400">Contact</a>
          </div>

          {/* Social Media Icons */}
          {/* <div className="flex justify-center space-x-4">
            <a href="#" className="text-gray-400 hover:text-white text-2xl"><FaFacebook /></a>
            <a href="#" className="text-gray-400 hover:text-white text-2xl"><FaTwitter /></a>
            <a href="#" className="text-gray-400 hover:text-white text-2xl"><FaInstagram /></a>
            <a href="#" className="text-gray-400 hover:text-white text-2xl"><FaLinkedin /></a>
          </div> */}
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center text-gray-500">
          &copy; {new Date().getFullYear()} RMS-IN. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
