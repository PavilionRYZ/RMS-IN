import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from './components/Redux/Slices/authSlice'; // Adjust path if needed

const SetupInterceptors = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    axios.interceptors.response.use(
        (response) => response, // Pass through successful responses
        (error) => {
            if (error.response?.status === 401) {
                // Token expired or invalid, log out and redirect
                dispatch(logout());
                navigate('/login', { replace: true });
            }
            return Promise.reject(error);
        }
    );

    return null; // This component doesn’t render anything
};

export default SetupInterceptors;