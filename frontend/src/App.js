import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import RegisterUser from './pages/RegisterUser';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import PrivateRoute from './router/PrivateRoute';

// Auth context simulation
export const AuthContext = React.createContext();

const App = () => {
  const [user, setUser] = useState(null); // {role, userId/username, password, ...}

  const login = (userData, password) => setUser({ ...userData, password });
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        {user && <Navbar />}
        {user && <Sidebar />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/" element={<PrivateRoute roles={['admin', 'operator', 'hr']}><Dashboard /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute roles={['hr', 'admin']}><Users /></PrivateRoute>} />
          <Route path="/register" element={<PrivateRoute roles={['operator']}><RegisterUser /></PrivateRoute>} />
          <Route path="/attendance" element={<PrivateRoute roles={['operator']}><Attendance /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute roles={['hr', 'admin']}><Reports /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;