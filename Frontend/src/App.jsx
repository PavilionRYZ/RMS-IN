import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import Footer from './components/Layout/Footer';
import { verifyToken } from './components/Redux/Slices/authSlice';
import Loading from './components/Loading/Loading';
import SetupInterceptors from './setupInterceptors.jsx';
import ErrorBoundary from './ErrorBoundary';
import MaintenancePage from './components/Pages/MaintenancePage';
import { protectedRoutes, publicAuthRoutes, PUBLIC_AUTH_ROUTE_PATHS } from './routes';

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

  const checkMaintenanceStatus = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/v1/maintenance-status`);
      const data = await response.json();
      setIsMaintenance(data.maintenanceMode);
    } catch (error) {
      console.error('Error fetching maintenance status:', error);
      setIsMaintenance(true);
    }
  };

  useEffect(() => {
    checkMaintenanceStatus();
    const interval = setInterval(checkMaintenanceStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    dispatch(verifyToken());
  }, [dispatch]);

  // useEffect(() => {
  //   if (!loading && !isAuthenticated) {
  //     navigate('/login', { replace: true });
  //   }
  // }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!loading && !isAuthenticated && !PUBLIC_AUTH_ROUTE_PATHS.includes(location.pathname)) {
      navigate('/login', { replace: true });
    }
  }, [loading, isAuthenticated, navigate, location.pathname]);

  if (isMaintenance) {
    return <MaintenancePage />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SetupInterceptors />

      {loading ? (
        <Loading />
      ) : (
        <ErrorBoundary>
          <div className="flex-1">
            {user && isAuthenticated ? (
              <Fragment>
                <Routes>
                  {protectedRoutes.map((route, index) => (
                    <Route key={index} path={route.path} element={route.element} />
                  ))}
                </Routes>
              </Fragment>
            ) : (
              <Routes>
                {publicAuthRoutes.map((route, index) => (
                  <Route key={index} path={route.path} element={route.element} />
                ))}
              </Routes>
            )}
          </div>
        </ErrorBoundary>
      )}
      <Footer />
    </div>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
