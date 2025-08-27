import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import QRGenerator from '../components/QRGenerator';
import { User, Building, Camera, CheckCircle, AlertCircle, UserPlus, ArrowLeft, Upload } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Registration Successful!</h1>
            <p className="text-gray-600 text-lg">Employee has been registered and is ready for QR code generation</p>
          </div>

          {success && (
            <div className="mb-8 mx-auto max-w-2xl">
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg shadow-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <p className="text-green-700 font-medium">{success}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            {/* User Information Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Employee Information
                </h2>
              </div>
              
              <div className="p-6">
                <div className="flex items-start space-x-6">
                  {registeredUser.profilePic ? (
                    <div className="relative">
                      <img
                        src={registeredUser.profilePic}
                        alt={registeredUser.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-lg">
                        <User className="w-10 h-10 text-gray-500" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Employee ID</label>
                        <p className="text-lg font-bold text-indigo-600">{registeredUser.userId}</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                        <p className="text-lg font-semibold text-gray-900">
                          {registeredUser.firstName} {registeredUser.lastName}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                          <Building className="w-4 h-4 mr-1" />
                          Department
                        </label>
                        <p className="text-lg font-semibold text-gray-900">{registeredUser.department}</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Current Status</label>
                        <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                          {registeredUser.currentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Generator */}
            <QRGenerator user={registeredUser} />
          </div>

          <div className="text-center">
            <button
              onClick={handleNewRegistration}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Register Another Employee
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Register New Employee</h1>
          <p className="text-gray-600 text-lg">Add a new employee to the system and generate their access credentials</p>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg shadow-sm">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <User className="w-5 h-5 mr-2" />
              Employee Details
            </h2>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="Enter first name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center">
                <Building className="w-4 h-4 mr-1" />
                Department *
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="Enter department (e.g., IT, HR, Operations)"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center">
                <Camera className="w-4 h-4 mr-1" />
                Profile Picture (Optional)
              </label>
              <div className="relative">
                <input
                  type="file"
                  name="profilePic"
                  accept="image/*"
                  onChange={handleFile}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              <p className="text-sm text-gray-500 flex items-center">
                <Camera className="w-4 h-4 mr-1" />
                Upload a profile picture (JPG, PNG, etc.)
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Registering Employee...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Register Employee
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
            <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
            Registration Process:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">1</div>
              <p className="text-gray-700">Fill in the employee details above</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">2</div>
              <p className="text-gray-700">Upload a profile picture (optional)</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">3</div>
              <p className="text-gray-700">Click "Register Employee" to create the user</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">4</div>
              <p className="text-gray-700">Generate and print the QR code for the employee</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;