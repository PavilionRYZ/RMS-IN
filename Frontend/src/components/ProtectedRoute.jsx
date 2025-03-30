import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, roles, permissions }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Admins have full access
  if (user.role === 'admin') {
    return children;
  }

  // Check role-based access
  const hasRole = roles ? roles.includes(user.role) : true;

  // Check permission-based access
  const hasPermission = permissions
    ? Array.isArray(user.permissions) && permissions.some((perm) => user.permissions.includes(perm))
    : true;

  // Backend allows access if user has the required role OR any of the required permissions
  const isAuthorized = hasRole || hasPermission;

  if (!isAuthorized) {
    return <Navigate to="/not-authorized" replace />;
  }

  // If all checks pass, render the protected component
  return children;
};
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string),
  permissions: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;