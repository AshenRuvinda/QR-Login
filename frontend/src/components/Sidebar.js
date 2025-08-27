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
  ChevronDown,
  Circle
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
      path: '/dashboard',
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
        return 'text-emerald-400';
      default:
        return 'text-gray-400';
    }
  };

  const RoleIcon = getRoleIcon();

  return (
    <div className="fixed left-0 top-0 h-screen w-80 bg-white text-gray-900 flex flex-col shadow-lg z-50 overflow-hidden border-r border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gray-50 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-600 rounded-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">QR Attendance</h2>
            <p className="text-sm text-gray-500">Management System</p>
          </div>
        </div>

        {/* Time and Date Display */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Clock className="w-4 h-4 text-gray-500" />
            <p className="text-lg font-mono font-semibold text-gray-900">
              {getCurrentTime()}
            </p>
          </div>
          <p className="text-center text-sm text-gray-500">{getCurrentDate()}</p>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto bg-white">
        <ul className="space-y-1">
          {visibleMenuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`group flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {/* Active indicator */}
                  <div className={`w-1 h-6 rounded-full mr-1 ${
                    isActive(item.path) ? 'bg-white' : 'bg-transparent'
                  }`}></div>
                  
                  <IconComponent className={`w-5 h-5 ${
                    isActive(item.path) 
                      ? 'text-white' 
                      : 'text-gray-500 group-hover:text-gray-700'
                  }`} />
                  
                  <span className="font-medium flex-1">{item.label}</span>
                  
                  {isActive(item.path) && (
                    <Circle className="w-2 h-2 text-white fill-current" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info Section */}
      <div className="p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
        {/* User Profile */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${
              user?.role === 'admin' ? 'bg-red-50 border border-red-100' :
              user?.role === 'hr' ? 'bg-blue-50 border border-blue-100' :
              'bg-emerald-50 border border-emerald-100'
            }`}>
              <RoleIcon className={`w-5 h-5 ${getRoleColor()}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">
                Logged in as
              </p>
              <p className="font-semibold text-gray-900 text-sm leading-tight mb-2">
                {user?.role === 'admin' ? user?.username : `${user?.firstName} ${user?.lastName}`}
              </p>
              
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                user?.role === 'admin' ? 'bg-red-50 text-red-700 border border-red-200' :
                user?.role === 'hr' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {user?.role === 'admin' ? 'Administrator' : user?.role?.toUpperCase()}
              </span>
              
              {user?.role !== 'admin' && user?.userId && (
                <p className="text-xs text-gray-500 mt-2 font-mono">ID: {user?.userId}</p>
              )}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center space-x-2 w-full p-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors duration-200 text-white border border-red-600 hover:border-red-700"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
        
        {/* Status Indicator */}
        <div className="flex items-center justify-center space-x-2 mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-xs text-gray-500 font-medium">System Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;