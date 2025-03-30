/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { forgotPassword } from '../Redux/Slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const { loading, error, message } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(forgotPassword(email)).unwrap();
      toast.success('Password reset email sent successfully.');
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      toast.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <button
          onClick={() => navigate('/login')}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-800"
        >
          <FaArrowLeft className="mr-2" /> Back to Login
        </button>
        
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Forgot Password</h2>
        
        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 transition-colors ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          We&apos;ll send a one-time password to your email to verify your identity.
        </p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ForgotPassword;