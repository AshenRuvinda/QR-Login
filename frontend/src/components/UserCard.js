import React from 'react';
import ProfilePicture from './ProfilePicture';

const UserCard = ({ user }) => {
  return (
    <div className="border p-4">
      <ProfilePicture src={user.profilePic} alt={`${user.firstName} ${user.lastName}`} />
      <h2>{user.firstName} {user.lastName}</h2>
      <p>User ID: {user.userId}</p>
      <p>Department: {user.department}</p>
      <p>Role: {user.role}</p>
      <p>Suspended: {user.isSuspended ? 'Yes' : 'No'}</p>
    </div>
  );
};

export default UserCard;