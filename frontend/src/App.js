import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import RegisterUser from './pages/RegisterUser';
import AddStaff from './pages/Addstaff';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import PrivateRoute from './router/PrivateRoute';

// Auth context
export const AuthContext = React.createContext();

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem('qr_attendance_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          console.log('Loaded user from localStorage:', userData);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        localStorage.removeItem('qr_attendance_user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = (userData, password) => {
    const userWithPassword = { ...userData, password };
    setUser(userWithPassword);
    
    // Save to localStorage (excluding sensitive data in production)
    try {
      localStorage.setItem('qr_attendance_user', JSON.stringify(userWithPassword));
      console.log('User saved to localStorage:', userWithPassword);
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('qr_attendance_user');
    console.log('User logged out and removed from localStorage');
  };

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <div className="min-h-screen bg-gray-50 flex">
          {user && <Sidebar />}
          <div className={`transition-all duration-300 ${user ? 'ml-80' : 'ml-0'} min-h-screen flex-1 w-full overflow-x-hidden`}>
            <Routes>
              {/* Landing page redirects to staff login */}
              <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
              
              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={<PrivateRoute roles={['admin', 'operator', 'hr']}><Dashboard /></PrivateRoute>} />
              <Route path="/users" element={<PrivateRoute roles={['hr', 'admin']}><Users /></PrivateRoute>} />
              <Route path="/add-staff" element={<PrivateRoute roles={['admin']}><AddStaff /></PrivateRoute>} />
              <Route path="/register" element={<PrivateRoute roles={['operator', 'hr', 'admin']}><RegisterUser /></PrivateRoute>} />
              <Route path="/attendance" element={<PrivateRoute roles={['operator', 'admin']}><Attendance /></PrivateRoute>} />
              <Route path="/reports" element={<PrivateRoute roles={['hr', 'admin']}><Reports /></PrivateRoute>} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;