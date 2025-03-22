import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);

  // Define navigation items based on roles and permissions
  const navItems = [
    { path: '/admin', label: 'Admin Dashboard', roles: ['admin'] },
    { path: '/staff', label: 'Staff Dashboard', roles: ['staff', 'kitchen_staff'] },
    { path: '/customer', label: 'Customer Dashboard', roles: ['customer'] },
    { path: '/menu', label: 'Menu Management', permissions: ['manage_menu'] },
    // Add more routes (e.g., inventory, orders) as needed
  ];

  // Filter navigation items based on user role and permissions
  const filteredNavItems = navItems.filter((item) => {
    const hasRole = item.roles ? item.roles.includes(user?.role) : true;
    const hasPermission = item.permissions
      ? user?.permissions.some((p) => item.permissions.includes(p))
      : true;
    return user && (hasRole || hasPermission);
  });

  return (
    <aside className="bg-gray-100 w-64 h-full p-4 shadow-md">
      <h2 className="text-lg font-semibold mb-4">Navigation</h2>
      {user ? (
        <ul className="space-y-2">
          {filteredNavItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `block p-2 rounded ${
                    isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Please log in to see navigation options.</p>
      )}
    </aside>
  );
};

export default Sidebar;