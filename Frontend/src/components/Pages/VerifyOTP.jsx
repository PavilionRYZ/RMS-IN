/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaLock, FaArrowLeft } from 'react-icons/fa';
import { verifyOTP, forgotPassword } from '../Redux/Slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const { loading, error, message } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    // Redirect if email is not provided
    if (!email) {
      navigate('/forgot-password');
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          toast.error('OTP has expired. Please request a new one.');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(verifyOTP({ email, otp })).unwrap();
      toast.success('OTP verified successfully');
      navigate('/reset-password', { state: { email, resetToken: result.resetToken } });
    } catch (err) {
      toast.error(error);
    }
  };

  const handleResendOTP = async () => {
    try {
      await dispatch(forgotPassword(email)).unwrap();
      toast.success('OTP resent successfully');
      setTimeLeft(600); // Reset the timer
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <button
          onClick={() => navigate('/forgot-password')}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-800"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>
        
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Verify OTP</h2>
        
        <div className="text-center mb-6">
          <p className="text-gray-700">We&apos;ve sent a verification code to</p>
          <p className="font-medium text-gray-900">{email}</p>
          <p className="text-sm text-amber-600 mt-2">
            Time remaining: {formatTime(timeLeft)}
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="otp">
              Enter 6-digit OTP
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-center text-xl tracking-widest"
                placeholder="------"
                maxLength="6"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || otp.length !== 6 || timeLeft === 0}
            className={`w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 transition-colors ${
              (loading || otp.length !== 6 || timeLeft === 0) ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">Didn&apos;t receive the code?</p>
          <button 
            onClick={handleResendOTP}
            disabled={loading || timeLeft > 540} // Allow resend after 1 minute
            className={`mt-1 text-amber-600 hover:text-amber-700 ${
              (loading || timeLeft > 540) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Resend OTP
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default VerifyOTP;