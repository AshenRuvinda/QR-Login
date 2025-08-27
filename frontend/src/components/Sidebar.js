import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { 
  Home, 
  UserPlus, 
  Users, 
  ClipboardList, 
  UserCog, 
  BarChart3,
  User,
  Shield,
  Building2,
  Bell,
  Settings,
  LogOut,
  Clock,
  ChevronDown
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
    setDropdownOpen(false);
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const menuItems = [
    {
      path: '/',
      label: 'Dashboard',
      roles: ['admin', 'operator', 'hr'],
      icon: Home
    },
    {
      path: '/add-staff',
      label: 'Add Staff',
      roles: ['admin'],
      icon: UserPlus
    },
    {
      path: '/register',
      label: 'Register Employee',
      roles: ['operator'],
      icon: UserPlus
    },
    {
      path: '/attendance',
      label: 'Mark Attendance',
      roles: ['operator'],
      icon: ClipboardList
    },
    {
      path: '/users',
      label: 'Manage Users',
      roles: ['hr', 'admin'],
      icon: UserCog
    },
    {
      path: '/reports',
      label: 'Reports',
      roles: ['hr', 'admin'],
      icon: BarChart3
    }
  ];

  const visibleMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin':
        return Shield;
      case 'hr':
        return Users;
      case 'operator':
        return User;
      default:
        return User;
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'admin':
        return 'text-red-400';
      case 'hr':
        return 'text-blue-400';
      case 'operator':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const RoleIcon = getRoleIcon();

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-xl z-50 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">QR Attendance</h2>
            <p className="text-xs text-gray-400">Management System</p>
          </div>
        </div>

        {/* Time and Date Display */}
        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-3 mb-4">
          <div className="text-center">
            <p className="text-lg font-mono font-bold text-white">{getCurrentTime()}</p>
            <p className="text-xs text-gray-400">{getCurrentDate()}</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-1">
          {visibleMenuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`group flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-md'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${
                    isActive(item.path) 
                      ? 'text-white' 
                      : 'text-gray-400 group-hover:text-white'
                  }`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive(item.path) && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-6 border-t border-gray-700 bg-gray-800 bg-opacity-50 flex-shrink-0">
        {/* User Profile */}
        <div className="flex items-start space-x-3 mb-4">
          <div className={`p-2 rounded-lg ${
            user?.role === 'admin' ? 'bg-red-500 bg-opacity-20' :
            user?.role === 'hr' ? 'bg-blue-500 bg-opacity-20' :
            'bg-green-500 bg-opacity-20'
          }`}>
            <RoleIcon className={`w-5 h-5 ${getRoleColor()}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-1">Logged in as:</p>
            <p className="font-semibold text-white text-sm leading-tight truncate">
              {user?.role === 'admin' ? user?.username : `${user?.firstName} ${user?.lastName}`}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                user?.role === 'admin' ? 'bg-red-500 bg-opacity-20 text-red-400' :
                user?.role === 'hr' ? 'bg-blue-500 bg-opacity-20 text-blue-400' :
                'bg-green-500 bg-opacity-20 text-green-400'
              }`}>
                {user?.role === 'admin' ? 'Administrator' : user?.role?.toUpperCase()}
              </span>
            </div>
            {user?.role !== 'admin' && user?.userId && (
              <p className="text-xs text-gray-500 mt-1">ID: {user?.userId}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 w-full p-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors duration-200 text-white"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center justify-center space-x-2 mt-4 pt-3 border-t border-gray-700">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">System Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;