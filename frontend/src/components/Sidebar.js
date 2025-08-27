import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  return (
    <div className="bg-gray-800 text-white w-64 p-4">
      <ul>
        <li><Link to="/">Dashboard</Link></li>
        {['operator'].includes(user.role) && <li><Link to="/register">Register User</Link></li>}
        {['operator'].includes(user.role) && <li><Link to="/attendance">Mark Attendance</Link></li>}
        {['hr', 'admin'].includes(user.role) && <li><Link to="/users">Users</Link></li>}
        {['hr', 'admin'].includes(user.role) && <li><Link to="/reports">Reports</Link></li>}
      </ul>
    </div>
  );
};

export default Sidebar;