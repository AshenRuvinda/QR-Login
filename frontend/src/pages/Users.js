import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import UserCard from '../components/UserCard';
import { AuthContext } from '../App';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        console.log('Fetching users...');
        
        // Set authorization header if not already set
        if (user && user.password) {
          const authString = user.role === 'admin' ? 
            `${user.username}:${user.password}` : 
            `${user.userId}:${user.password}`;
          api.defaults.headers.common['Authorization'] = `Basic ${btoa(authString)}`;
        }
        
        const res = await api.get('/users');
        console.log('Users fetched:', res.data);
        setUsers(res.data);
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

  const handleSuspend = async (userId) => {
    if (!window.confirm('Are you sure you want to suspend this user?')) {
      return;
    }
    
    try {
      console.log('Suspending user:', userId);
      await api.put(`/users/${userId}/suspend`);
      setUsers(users.map(u => u.userId === userId ? { ...u, isSuspended: true } : u));
      alert('User suspended successfully');
    } catch (err) {
      console.error('Error suspending user:', err.response?.data || err.message);
      alert(err.response?.data?.msg || 'Failed to suspend user');
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      console.log('Removing user:', userId);
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u.userId !== userId));
      alert('User removed successfully');
    } catch (err) {
      console.error('Error removing user:', err.response?.data || err.message);
      alert(err.response?.data?.msg || 'Failed to remove user');
    }
  };

  const handleUnsuspend = async (userId) => {
    try {
      console.log('Unsuspending user:', userId);
      // You'll need to add this endpoint to your backend
      await api.put(`/users/${userId}/unsuspend`);
      setUsers(users.map(u => u.userId === userId ? { ...u, isSuspended: false } : u));
      alert('User unsuspended successfully');
    } catch (err) {
      console.error('Error unsuspending user:', err.response?.data || err.message);
      alert(err.response?.data?.msg || 'Failed to unsuspend user');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage all registered users in the system</p>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg">No users found</div>
          <p className="text-gray-400 mt-2">Register some users to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(user => (
            <div key={user.userId} className="bg-white rounded-lg shadow-md p-6 border">
              <UserCard user={user} />
              
              <div className="mt-4 space-y-2">
                {!user.isSuspended ? (
                  <button
                    onClick={() => handleSuspend(user.userId)}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition duration-200"
                  >
                    Suspend User
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnsuspend(user.userId)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-200"
                  >
                    Unsuspend User
                  </button>
                )}
                
                <button
                  onClick={() => handleRemove(user.userId)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-200"
                >
                  Remove User
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-sm text-gray-500">
        Total Users: {users.length}
      </div>
    </div>
  );
};

export default Users;