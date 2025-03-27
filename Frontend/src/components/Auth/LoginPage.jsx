import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../Redux/Slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  // Toast options
  const toastOptions = {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'colored',
  };

  // Form validation
  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };

    if (!email) {
      newErrors.email = 'Email is required';
      toast.error('Email is required', toastOptions);
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
      toast.error('Please enter a valid email', toastOptions);
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      toast.error('Password is required', toastOptions);
      isValid = false;
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
      toast.error('Password must be at least 4 characters', toastOptions);
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const result = await dispatch(login({ email, password })).unwrap();
      console.log("Login result:", result);
      toast.success('Logged in successfully!', toastOptions);
      // Redirection is now handled in App.jsx
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.message || err, toastOptions);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1555396273-36734b2d1fea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')`,
      }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="heading">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Login
          </h2>
          <p className="text-xl font-thin text-center text-gray-500 mb-6">RestroMaster</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg transition duration-300 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Link to Home Page */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Back to{' '}
          <a href="/" className="text-blue-500 hover:underline">
            Home
          </a>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default LoginPage;