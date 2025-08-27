import React, { useContext } from 'react';
import { AuthContext } from '../App';

const Navbar = () => {
  const { logout } = useContext(AuthContext);
  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between">
      <h1>QR Attendance</h1>
      <button onClick={logout}>Logout</button>
    </nav>
  );
};

export default Navbar;