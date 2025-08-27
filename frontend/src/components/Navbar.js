import React, { useContext, useState } from 'react';
import { AuthContext } from '../App';
import { 
  QrCode, 
  Bell, 
  LogOut, 
  User, 
  Settings,
  ChevronDown,
  Shield,
  Users
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
    setDropdownOpen(false);
  };

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

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'admin':
        return 'bg-red-500 bg-opacity-20 text-red-300 border-red-400';
      case 'hr':
        return 'bg-blue-500 bg-opacity-20 text-blue-300 border-blue-400';
      case 'operator':
        return 'bg-green-500 bg-opacity-20 text-green-300 border-green-400';
      default:
        return 'bg-gray-500 bg-opacity-20 text-gray-300 border-gray-400';
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const RoleIcon = getRoleIcon();

  return (
    <nav className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white shadow-lg border-b border-slate-700">
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between w-full">
          {/* Left Section - Logo and Title */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="p-2 bg-blue-600 rounded-lg shadow-md">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white whitespace-nowrap">QR Attendance System</h1>
              <p className="text-sm text-slate-300 hidden sm:block">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Center Section - Time */}
          <div className="hidden lg:flex items-center justify-center flex-1 px-8">
            <div className="bg-slate-700 bg-opacity-50 px-4 py-2 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-mono font-bold text-white">{getCurrentTime()}</p>
                <p className="text-xs text-slate-300">Current Time</p>
              </div>
            </div>
          </div>
          
          {/* Right Section - User Info and Actions */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Notifications */}
            <div className="relative">
              <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors duration-200">
                <Bell className="w-5 h-5 text-slate-300" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>

            {user && (
              <>
                {/* User Info Section */}
                <div className="hidden xl:flex items-center space-x-3 bg-slate-700 bg-opacity-50 px-3 py-2 rounded-lg max-w-xs">
                  <div className="p-1.5 bg-slate-600 rounded-lg flex-shrink-0">
                    <RoleIcon className="w-4 h-4 text-slate-300" />
                  </div>
                  <div className="text-right min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.role === 'admin' ? user.username : `${user.firstName} ${user.lastName}`}
                    </p>
                    <div className="flex items-center justify-end space-x-1">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor()}`}>
                        {user.role === 'admin' ? 'Admin' : user.role.toUpperCase()}
                      </span>
                      {user.staffId || user.userId ? (
                        <span className="text-xs text-slate-400 truncate">
                          {user.staffId || user.userId}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 p-2 hover:bg-slate-700 rounded-lg transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-300" />
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      {/* User Info in Dropdown */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-slate-100 rounded-lg">
                            <RoleIcon className="w-5 h-5 text-slate-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {user.role === 'admin' ? user.username : `${user.firstName} ${user.lastName}`}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                user.role === 'hr' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {user.role === 'admin' ? 'Administrator' : user.role.toUpperCase()}
                              </span>
                            </div>
                            {user.staffId || user.userId ? (
                              <p className="text-xs text-gray-500 mt-1">
                                ID: {user.staffId || user.userId}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <button
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <Settings className="w-4 h-4 text-gray-500" />
                        <span>Settings</span>
                      </button>

                      <div className="border-t border-gray-200 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile User Info */}
      {user && (
        <div className="xl:hidden bg-slate-700 bg-opacity-50 px-6 py-3 border-t border-slate-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="p-1.5 bg-slate-600 rounded-lg flex-shrink-0">
                <RoleIcon className="w-4 h-4 text-slate-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {user.role === 'admin' ? user.username : `${user.firstName} ${user.lastName}`}
                </p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor()} border`}>
                  {user.role === 'admin' ? 'Admin' : user.role.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <p className="text-sm font-mono text-white">{getCurrentTime()}</p>
              {user.staffId || user.userId ? (
                <p className="text-xs text-slate-400">ID: {user.staffId || user.userId}</p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;