import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import api from '../utils/api';
import { 
  Users, 
  UserCheck, 
  CheckCircle, 
  Calendar,
  UserPlus,
  Settings,
  BarChart3,
  UserCog,
  ClipboardList,
  Activity,
  Server,
  Clock
} from 'lucide-react';

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
            `${user.username}:${user.password}`; // Both admin and staff use username now
          api.defaults.headers.common['Authorization'] = `Basic ${btoa(authString)}`;
        }

        if (['hr', 'admin'].includes(user?.role)) {
          // Fixed: Use the correct endpoint /users/users
          const usersRes = await api.get('/users/users');
          console.log('Users response:', usersRes.data);
          
          if (usersRes.data.success) {
            const users = usersRes.data.users;
            
            setStats({
              totalUsers: users.length,
              totalEmployees: users.length, // All users are employees
              activeUsers: users.filter(u => !u.isSuspended).length,
              todayAttendance: users.filter(u => u.currentStatus === 'IN').length
            });
          }
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        // Don't show error to user, just log it
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    } else {
      setLoading(false);
    }
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
        { to: '/add-staff', label: 'Add New Staff', icon: UserPlus, color: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700' },
        { to: '/users', label: 'Manage Users', icon: UserCog, color: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' },
        { to: '/reports', label: 'View Reports', icon: BarChart3, color: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700' }
      );
    } else if (user?.role === 'hr') {
      actions.push(
        { to: '/users', label: 'Manage Users', icon: UserCog, color: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' },
        { to: '/reports', label: 'View Reports', icon: BarChart3, color: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700' }
      );
    } else if (user?.role === 'operator') {
      actions.push(
        { to: '/register', label: 'Register Employee', icon: UserPlus, color: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' },
        { to: '/attendance', label: 'Mark Attendance', icon: ClipboardList, color: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700' }
      );
    }
    
    return actions;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {getWelcomeMessage()}
              </h1>
              <p className="text-gray-600 text-lg">{getRoleDescription()}</p>
            </div>
            <div className="hidden md:flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg">
              <Activity className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium text-gray-700">System Online</span>
            </div>
          </div>
        </div>

        {/* Stats Cards - Only for HR and Admin */}
        {['hr', 'admin'].includes(user?.role) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                    ) : (
                      stats.totalUsers
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-emerald-100 rounded-lg">
                  <UserCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                    ) : (
                      stats.activeUsers
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-amber-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Currently IN</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                    ) : (
                      stats.todayAttendance
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-purple-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Date</p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getQuickActions().map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Link
                  key={index}
                  to={action.to}
                  className={`bg-gradient-to-r ${action.color} text-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 block`}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-3 bg-white bg-opacity-20 rounded-lg">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="ml-4 text-lg font-semibold">{action.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center mb-6">
            <Settings className="w-6 h-6 text-gray-700 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <UserCog className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Role</p>
                <p className="font-semibold text-gray-900 capitalize">{user?.role}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">System Version</p>
                <p className="font-semibold text-gray-900">QR Attendance v1.0</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Clock className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Login</p>
                <p className="font-semibold text-gray-900">
                  {new Date().toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Server className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Server Status</p>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <p className="font-semibold text-emerald-600">Online</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;