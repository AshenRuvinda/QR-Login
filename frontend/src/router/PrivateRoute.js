import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';

const PrivateRoute = ({ children, roles }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // If no user is logged in, redirect to appropriate login page
  if (!user) {
    // Save the attempted URL to redirect back after login
    const redirectPath = location.pathname !== '/' ? location.pathname : '/';
    
    // Default to admin login, but you could make this smarter
    return <Navigate to="/admin/login" state={{ from: redirectPath }} replace />;
  }

  // If user doesn't have required role, show access denied
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-8 py-6 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="mb-4">You don't have permission to access this page.</p>
            <p className="text-sm">
              Required roles: {roles.join(', ')} | Your role: {user.role}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;