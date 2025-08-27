import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmployees: 0,
    todayAttendance: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user && user.password) {
          const authString = user.role === 'admin' ? 
            `${user.username}:${user.password}` : 
            `${user.userId}:${user.password}`;
          api.defaults.headers.common['Authorization'] = `Basic ${btoa(authString)}`;
        }

        if (['hr', 'admin'].includes(user?.role)) {
          const usersRes = await api.get('/users');
          const users = usersRes.data;
          
          setStats({
            totalUsers: users.length,
            totalEmployees: users.filter(u => u.role === 'employee').length,
            activeUsers: users.filter(u => !u.isSuspended).length,
            todayAttendance: 0 // You can implement this based on your attendance logic
          });
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const name = user?.role === 'admin' ? user?.username : `${user?.firstName} ${user?.lastName}`;
    return `${greeting}, ${name}!`;
  };

  const getRoleDescription = () => {
    switch (user?.role) {
      case 'admin':
        return 'You have full system access including user management and system configuration.';
      case 'hr':
        return 'You can manage users, view reports, and handle HR-related tasks.';
      case 'operator':
        return 'You can register new employees and mark their attendance.';
      default:
        return 'Welcome to the QR Attendance System.';
    }
  };

  const getQuickActions = () => {
    const actions = [];
    
    if (user?.role === 'admin') {
      actions.push(
        { to: '/add-staff', label: 'Add New Staff', icon: '👥', color: 'bg-purple-500 hover:bg-purple-600' },
        { to: '/users', label: 'Manage Users', icon: '👤', color: 'bg-blue-500 hover:bg-blue-600' },
        { to: '/reports', label: 'View Reports', icon: '📊', color: 'bg-green-500 hover:bg-green-600' }
      );
    } else if (user?.role === 'hr') {
      actions.push(
        { to: '/users', label: 'Manage Users', icon: '👤', color: 'bg-blue-500 hover:bg-blue-600' },
        { to: '/reports', label: 'View Reports', icon: '📊', color: 'bg-green-500 hover:bg-green-600' }
      );
    } else if (user?.role === 'operator') {
      actions.push(
        { to: '/register', label: 'Register Employee', icon: '➕', color: 'bg-blue-500 hover:bg-blue-600' },
        { to: '/attendance', label: 'Mark Attendance', icon: '✅', color: 'bg-green-500 hover:bg-green-600' }
      );
    }
    
    return actions;
  };

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {getWelcomeMessage()}
        </h1>
        <p className="text-gray-600 text-lg">{getRoleDescription()}</p>
      </div>

      {/* Stats Cards - Only for HR and Admin */}
      {['hr', 'admin'].includes(user?.role) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.totalUsers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">👤</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Employees</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.totalEmployees}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.activeUsers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Date</p>
                <p className="text-sm font-bold text-gray-900">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getQuickActions().map((action, index) => (
            <Link
              key={index}
              to={action.to}
              className={`${action.color} text-white p-6 rounded-lg shadow-md transition-colors duration-200 block`}
            >
              <div className="flex items-center">
                <span className="text-3xl mr-4">{action.icon}</span>
                <span className="text-lg font-medium">{action.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Current Role:</p>
            <p className="font-medium text-gray-900">{user?.role?.toUpperCase()}</p>
          </div>
          <div>
            <p className="text-gray-600">System Version:</p>
            <p className="font-medium text-gray-900">QR Attendance v1.0</p>
          </div>
          <div>
            <p className="text-gray-600">Last Login:</p>
            <p className="font-medium text-gray-900">{new Date().toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Server Status:</p>
            <p className="font-medium text-green-600">Online</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;