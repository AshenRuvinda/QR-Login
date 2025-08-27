import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    {
      path: '/',
      label: 'Dashboard',
      roles: ['admin', 'operator', 'hr'],
      icon: '🏠'
    },
    {
      path: '/add-staff',
      label: 'Add Staff',
      roles: ['admin'],
      icon: '👥'
    },
    {
      path: '/register',
      label: 'Register Employee',
      roles: ['operator'],
      icon: '➕'
    },
    {
      path: '/attendance',
      label: 'Mark Attendance',
      roles: ['operator'],
      icon: '✅'
    },
    {
      path: '/users',
      label: 'Manage Users',
      roles: ['hr', 'admin'],
      icon: '👤'
    },
    {
      path: '/reports',
      label: 'Reports',
      roles: ['hr', 'admin'],
      icon: '📊'
    }
  ];

  const visibleMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-center">Menu</h2>
        <div className="text-center text-sm text-gray-400 mt-2">
          {user?.role?.toUpperCase()} Panel
        </div>
      </div>
      
      <nav>
        <ul className="space-y-2">
          {visibleMenuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 pt-8 border-t border-gray-700">
        <div className="text-sm text-gray-400">
          <p>Logged in as:</p>
          <p className="font-medium text-white">
            {user?.role === 'admin' ? user?.username : `${user?.firstName} ${user?.lastName}`}
          </p>
          <p className="text-xs">
            {user?.role === 'admin' ? 'Administrator' : `ID: ${user?.userId}`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;