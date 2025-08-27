import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../App';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const { user } = useContext(AuthContext);

  // Get unique departments for filter
  const departments = [...new Set(users.map(u => u.department).filter(Boolean))].sort();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        console.log('Fetching users...');
        
        // Set authorization header if not already set
        if (user && user.password) {
          const authString = user.role === 'admin' ? 
            `${user.username}:${user.password}` : 
            `${user.username}:${user.password}`; // Both admin and staff use username now
          api.defaults.headers.common['Authorization'] = `Basic ${btoa(authString)}`;
        }
        
        const res = await api.get('/users/users'); // Fixed endpoint: /users/users instead of /users
        console.log('Users fetched:', res.data);
        
        if (res.data.success) {
          setUsers(res.data.users);
          setFilteredUsers(res.data.users);
        } else {
          setError(res.data.msg || 'Failed to fetch users');
        }
        
        setError('');
      } catch (err) {
        console.error('Error fetching users:', err.response?.data || err.message);
        setError(err.response?.data?.msg || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchUsers();
    }
  }, [user]);

  // Filter users based on search term, department, and status
  useEffect(() => {
    let filtered = users;

    // Filter by search term (name or user ID)
    if (searchTerm) {
      filtered = filtered.filter(u => 
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.userId.toString().includes(searchTerm)
      );
    }

    // Filter by department
    if (selectedDepartment) {
      filtered = filtered.filter(u => u.department === selectedDepartment);
    }

    // Filter by status
    if (selectedStatus === 'active') {
      filtered = filtered.filter(u => !u.isSuspended);
    } else if (selectedStatus === 'suspended') {
      filtered = filtered.filter(u => u.isSuspended);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedDepartment, selectedStatus]);

  const handleSuspend = async (userId) => {
    if (!window.confirm('Are you sure you want to suspend this user?')) {
      return;
    }
    
    try {
      console.log('Suspending user:', userId);
      const res = await api.put(`/users/user/${userId}/suspend`); // Fixed endpoint
      if (res.data.success) {
        setUsers(users.map(u => u.userId === userId ? { ...u, isSuspended: true } : u));
        alert('User suspended successfully');
      } else {
        alert(res.data.msg || 'Failed to suspend user');
      }
    } catch (err) {
      console.error('Error suspending user:', err.response?.data || err.message);
      alert(err.response?.data?.msg || 'Failed to suspend user');
    }
  };

  const handleUnsuspend = async (userId) => {
    try {
      console.log('Unsuspending user:', userId);
      const res = await api.put(`/users/user/${userId}/unsuspend`); // Fixed endpoint
      if (res.data.success) {
        setUsers(users.map(u => u.userId === userId ? { ...u, isSuspended: false } : u));
        alert('User unsuspended successfully');
      } else {
        alert(res.data.msg || 'Failed to unsuspend user');
      }
    } catch (err) {
      console.error('Error unsuspending user:', err.response?.data || err.message);
      alert(err.response?.data?.msg || 'Failed to unsuspend user');
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      console.log('Removing user:', userId);
      const res = await api.delete(`/users/user/${userId}`); // Fixed endpoint
      if (res.data.success) {
        setUsers(users.filter(u => u.userId !== userId));
        alert('User removed successfully');
      } else {
        alert(res.data.msg || 'Failed to remove user');
      }
    } catch (err) {
      console.error('Error removing user:', err.response?.data || err.message);
      alert(err.response?.data?.msg || 'Failed to remove user');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedStatus('');
  };

  const getUserStats = () => {
    return {
      total: users.length,
      active: users.filter(u => !u.isSuspended).length,
      suspended: users.filter(u => u.isSuspended).length,
      filtered: filteredUsers.length
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="text-lg mt-4">Loading users...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <div className="font-bold">Error Loading Users</div>
          <div className="mt-2">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = getUserStats();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage all registered users in the system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Active Users</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
          <div className="text-sm text-gray-600">Suspended Users</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="text-2xl font-bold text-purple-600">{stats.filtered}</div>
          <div className="text-sm text-gray-600">Showing</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <input
              type="text"
              placeholder="Search by name or User ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Department Filter */}
          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="min-w-40">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">
            {users.length === 0 ? 'No users found' : 'No users match your filters'}
          </div>
          <p className="text-gray-400">
            {users.length === 0 
              ? 'Register some users to see them here' 
              : 'Try adjusting your search criteria'
            }
          </p>
          {(searchTerm || selectedDepartment || selectedStatus) && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(currentUser => (
            <div key={currentUser.userId} className="bg-white rounded-lg shadow-md p-6 border hover:shadow-lg transition-shadow">
              {/* Profile Picture */}
              <div className="flex items-center mb-4">
                {currentUser.profilePic ? (
                  <img
                    src={currentUser.profilePic}
                    alt={`${currentUser.firstName} ${currentUser.lastName}`}
                    className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                    <span className="text-xl text-gray-500">👤</span>
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">
                    {currentUser.firstName} {currentUser.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">ID: {currentUser.userId}</p>
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-2 mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Department:</span>
                  <span className="ml-2 text-sm text-gray-900">{currentUser.department}</span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <span className={`ml-2 inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    currentUser.isSuspended 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {currentUser.isSuspended ? 'Suspended' : 'Active'}
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-600">Current Status:</span>
                  <span className={`ml-2 inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    currentUser.currentStatus === 'IN'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {currentUser.currentStatus || 'OUT'}
                  </span>
                </div>

                {currentUser.createdAt && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Registered:</span>
                    <span className="ml-2 text-sm text-gray-900">
                      {new Date(currentUser.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {!currentUser.isSuspended ? (
                  <button
                    onClick={() => handleSuspend(currentUser.userId)}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition duration-200"
                  >
                    Suspend User
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnsuspend(currentUser.userId)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-200"
                  >
                    Unsuspend User
                  </button>
                )}
                
                <button
                  onClick={() => handleRemove(currentUser.userId)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-200"
                >
                  Remove User
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Summary */}
      <div className="mt-8 text-sm text-gray-500 border-t pt-4">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            Showing {filteredUsers.length} of {users.length} total users
          </div>
          {(searchTerm || selectedDepartment || selectedStatus) && (
            <div className="text-blue-600">
              Filters active: {[
                searchTerm && `Search: "${searchTerm}"`,
                selectedDepartment && `Department: ${selectedDepartment}`,
                selectedStatus && `Status: ${selectedStatus}`
              ].filter(Boolean).join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;