import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import UserCard from '../components/UserCard';

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  const handleSuspend = async (userId) => {
    try {
      await api.put(`/users/${userId}/suspend`);
      setUsers(users.map(u => u.userId === userId ? { ...u, isSuspended: true } : u));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u.userId !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {users.map(user => (
        <div key={user.userId}>
          <UserCard user={user} />
          <button onClick={() => handleSuspend(user.userId)}>Suspend</button>
          <button onClick={() => handleRemove(user.userId)}>Remove</button>
        </div>
      ))}
    </div>
  );
};

export default Users;