import React, { useContext } from 'react';
import { AuthContext } from '../App';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  return <div>Welcome, {user.role}!</div>;
};

export default Dashboard;