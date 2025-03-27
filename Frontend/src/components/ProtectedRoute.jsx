import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roles, permissions }) => {
  const { user } = useSelector((state) => state.auth);

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  const hasRole = roles ? roles.includes(user.role) : true;

  // Check permission-based access
  const hasPermission = permissions
    ? Array.isArray(user.permissions) && permissions.every((perm) => user.permissions.includes(perm))
    : true;

  // If user lacks required role AND permissions, redirect to a "Not Authorized" page
  // Backend allows access if user is admin OR has the required permission, so we mirror that logic
  const isAuthorized = hasRole || hasPermission;

  if (!isAuthorized) {
    return <Navigate to="/not-authorized" replace />;
  }

  // If all checks pass, render the protected component
  return children;
};

export default ProtectedRoute;