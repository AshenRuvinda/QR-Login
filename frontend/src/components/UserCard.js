import React from 'react';
import { User, Building, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import ProfilePicture from './ProfilePicture';

const UserCard = ({ user }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Profile Section */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative">
          <ProfilePicture 
            src={user.profilePic} 
            alt={`${user.firstName} ${user.lastName}`} 
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {user.firstName} {user.lastName}
          </h2>
          <div className="flex items-center text-sm text-gray-500">
            <User className="w-4 h-4 mr-1" />
            <span>ID: {user.userId}</span>
          </div>
        </div>
        <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          user.isSuspended 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {user.isSuspended ? (
            <>
              <AlertCircle className="w-3 h-3 mr-1" />
              Suspended
            </>
          ) : (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </>
          )}
        </div>
      </div>

      {/* Details Section */}
      <div className="space-y-3">
        <div className="flex items-center text-gray-700">
          <Building className="w-4 h-4 mr-3 text-blue-500" />
          <span className="text-sm font-medium text-gray-500 w-20">Department:</span>
          <span className="text-sm font-medium">{user.department}</span>
        </div>
        
        <div className="flex items-center text-gray-700">
          <Shield className="w-4 h-4 mr-3 text-purple-500" />
          <span className="text-sm font-medium text-gray-500 w-20">Role:</span>
          <span className="text-sm font-medium">{user.role}</span>
        </div>
      </div>
    </div>
  );
};

export default UserCard;