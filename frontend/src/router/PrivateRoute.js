import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../App';

const PrivateRoute = ({ children, roles }) => {
  const { user } = useContext(AuthContext);
  if (!user || !roles.includes(user.role)) {
    return <Navigate to={user?.role === 'admin' ? '/admin/login' : '/login'} />;
  }
  return children;
};

export default PrivateRoute;