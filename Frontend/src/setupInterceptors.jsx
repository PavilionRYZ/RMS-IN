import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { logout } from './components/Redux/Slices/authSlice';
import { PUBLIC_AUTH_ROUTE_PATHS } from './routes';

const SetupInterceptors = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                // Only redirect to login if NOT on a public auth route
                if (!PUBLIC_AUTH_ROUTE_PATHS.includes(location.pathname)) {
                    dispatch(logout());
                    navigate('/login', { replace: true });
                }
            }
            return Promise.reject(error);
        }
    );

    return null;
};

export default SetupInterceptors;
