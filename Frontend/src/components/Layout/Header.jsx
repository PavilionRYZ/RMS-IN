import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">Restaurant Management</div>
      {user ? (
        <div className="flex items-center space-x-4">
          <span className="text-sm">
            Welcome, {user.name} ({user.role})
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="text-sm">Please log in</div>
      )}
    </nav>
  );
};

export default Header;