import React, { useContext } from 'react';
import { AuthContext } from '../App';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between items-center shadow-md">
      <div>
        <h1 className="text-xl font-bold">QR Attendance System</h1>
        {user && (
          <p className="text-sm opacity-90">
            Welcome, {user.role === 'admin' ? user.username : `${user.firstName} ${user.lastName}`}
          </p>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        {user && (
          <div className="text-right">
            <p className="text-sm font-medium">
              {user.role === 'admin' ? 'Administrator' : `${user.role.toUpperCase()}`}
            </p>
            <p className="text-xs opacity-75">
              ID: {user.staffId || user.userId}
            </p>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition duration-200"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;