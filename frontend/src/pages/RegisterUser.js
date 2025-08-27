import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import QRGenerator from '../components/QRGenerator';

const RegisterUser = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    department: '',
    profilePic: null
  });
  const [registeredUser, setRegisteredUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleFile = (e) => {
    setFormData({ ...formData, profilePic: e.target.files[0] });
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.department.trim()) {
      setError('Department is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = new FormData();
      data.append('firstName', formData.firstName);
      data.append('lastName', formData.lastName);
      data.append('department', formData.department);
      
      if (formData.profilePic) {
        data.append('profilePic', formData.profilePic);
      }

      const response = await fetch('/users/register', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${user.username}:${user.password}`)}`
        },
        body: data
      });

      const result = await response.json();

      if (result.success) {
        setRegisteredUser(result.user);
        setSuccess(`User registered successfully! User ID: ${result.user.userId}`);
        
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          department: '',
          profilePic: null
        });
        
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      } else {
        setError(result.msg || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register user');
    } finally {
      setLoading(false);
    }
  };

  const handleNewRegistration = () => {
    setRegisteredUser(null);
    setSuccess('');
    setError('');
  };

  if (registeredUser) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">User Registered Successfully!</h1>
          <p className="text-gray-600 mt-2">Generate QR code for the new user</p>
        </div>

        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            
            <div className="flex items-start space-x-4">
              {registeredUser.profilePic ? (
                <img
                  src={registeredUser.profilePic}
                  alt={registeredUser.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl text-gray-500">👤</span>
                </div>
              )}
              
              <div className="flex-1">
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">User ID</label>
                    <p className="text-lg font-semibold text-gray-900">{registeredUser.userId}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {registeredUser.firstName} {registeredUser.lastName}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Department</label>
                    <p className="text-lg font-semibold text-gray-900">{registeredUser.department}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Status</label>
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                      {registeredUser.currentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Generator */}
          <QRGenerator user={registeredUser} />
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleNewRegistration}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
          >
            Register Another User
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Register New Employee</h1>
        <p className="text-gray-600 mt-2">Add a new employee to the system</p>
      </div>

      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter first name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter last name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department *
          </label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter department (e.g., IT, HR, Operations)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture (Optional)
          </label>
          <input
            type="file"
            name="profilePic"
            accept="image/*"
            onChange={handleFile}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Upload a profile picture (JPG, PNG, etc.)
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering User...' : 'Register Employee'}
          </button>
        </div>
      </div>

      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Next Steps:</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>1. Fill in the employee details</p>
          <p>2. Upload a profile picture (optional)</p>
          <p>3. Click "Register Employee" to create the user</p>
          <p>4. Generate and print the QR code for the employee</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;