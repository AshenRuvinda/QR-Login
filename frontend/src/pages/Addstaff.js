import React, { useState, useContext, useEffect } from 'react';
import { UserPlus, Users, Shield, User, Building2, Mail, Lock, Eye, EyeOff, Upload, Wand2, CheckCircle, AlertCircle, Trash2, Edit, UserX } from 'lucide-react';
import api from '../utils/api';
import { AuthContext } from '../App';

const AddStaff = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    department: '',
    role: 'operator',
    username: '',
    password: '',
    confirmPassword: '',
    profilePic: null
  });
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deletingStaff, setDeletingStaff] = useState(null);

  // Fetch staff members on component mount
  useEffect(() => {
    fetchStaffMembers();
  }, []);

  const fetchStaffMembers = async () => {
    try {
      setLoadingStaff(true);
      if (user && user.password) {
        const authString = user.role === 'admin' ? 
          `${user.username}:${user.password}` : 
          `${user.userId}:${user.password}`;
        api.defaults.headers.common['Authorization'] = `Basic ${btoa(authString)}`;
      }

      const response = await api.get('/users/staff');
      setStaffMembers(response.data.staff || []);
    } catch (err) {
      console.error('Error fetching staff members:', err);
    } finally {
      setLoadingStaff(false);
    }
  };

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
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const generateUsername = () => {
    if (formData.firstName && formData.lastName) {
      const username = (formData.firstName.toLowerCase() + formData.lastName.toLowerCase()).replace(/\s+/g, '');
      setFormData({ ...formData, username });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (user && user.password) {
        const authString = user.role === 'admin' ? 
          `${user.username}:${user.password}` : 
          `${user.userId}:${user.password}`;
        api.defaults.headers.common['Authorization'] = `Basic ${btoa(authString)}`;
      }

      const data = new FormData();
      data.append('firstName', formData.firstName);
      data.append('lastName', formData.lastName);
      data.append('department', formData.department);
      data.append('role', formData.role);
      data.append('username', formData.username);
      data.append('password', formData.password);
      if (formData.profilePic) {
        data.append('profilePic', formData.profilePic);
      }

      const res = await api.post('/users/staff/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Staff created:', res.data);
      setSuccess(`${formData.role.toUpperCase()} user created successfully! Staff ID: ${res.data.staff.staffId}, Username: ${res.data.staff.username}`);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        department: '',
        role: 'operator',
        username: '',
        password: '',
        confirmPassword: '',
        profilePic: null
      });

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = '';
      }

      // Refresh staff list
      fetchStaffMembers();

    } catch (err) {
      console.error('Error creating staff:', err.response?.data || err.message);
      setError(err.response?.data?.msg || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-red-600" />;
      case 'hr':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'operator':
        return <User className="w-4 h-4 text-green-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'hr':
        return 'bg-blue-100 text-blue-800';
      case 'operator':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRemoveStaff = async (staffId) => {
    try {
      setDeletingStaff(staffId);
      
      if (user && user.password) {
        const authString = user.role === 'admin' ? 
          `${user.username}:${user.password}` : 
          `${user.userId}:${user.password}`;
        api.defaults.headers.common['Authorization'] = `Basic ${btoa(authString)}`;
      }

      await api.delete(`/users/staff/${staffId}`);
      
      // Remove from local state
      setStaffMembers(prevStaff => prevStaff.filter(staff => staff.staffId !== staffId));
      setSuccess('Staff member removed successfully!');
      setConfirmDelete(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('Error removing staff:', err);
      setError(err.response?.data?.msg || 'Failed to remove staff member');
      setTimeout(() => setError(''), 5000);
    } finally {
      setDeletingStaff(null);
    }
  };

  const canRemoveStaff = (staff) => {
    // Only allow removal if current user is admin or if removing non-admin staff
    if (user?.role === 'admin') return true;
    if (staff.role === 'admin') return false;
    return user?.role === 'hr';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Staff Form - Left Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Header */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserPlus className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add New Staff Member</h1>
                    <p className="text-gray-600 mt-1">Create new Operator, HR, or Admin user accounts</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-green-800">{success}</div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-red-800">{error}</div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Enter first name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Building2 className="w-4 h-4 inline mr-2" />
                      Department *
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter department (e.g., IT, HR, Operations)"
                    />
                  </div>

                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Shield className="w-4 h-4 inline mr-2" />
                      Role *
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="operator">Operator</option>
                      <option value="hr">HR</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 space-y-1">
                        <p><span className="font-medium text-green-700">Operator:</span> Register employees, mark attendance</p>
                        <p><span className="font-medium text-blue-700">HR:</span> Manage users, view reports, suspend/remove users</p>
                        <p><span className="font-medium text-red-700">Admin:</span> Full system access and configuration</p>
                      </div>
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Username *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        minLength={3}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Enter username (min 3 characters)"
                      />
                      <button
                        type="button"
                        onClick={generateUsername}
                        className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <Wand2 className="w-4 h-4" />
                        <span>Auto</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Click "Auto" to generate username from first and last name
                    </p>
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Lock className="w-4 h-4 inline mr-2" />
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          minLength={6}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Enter password (min 6 characters)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Lock className="w-4 h-4 inline mr-2" />
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Confirm password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Profile Picture */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Upload className="w-4 h-4 inline mr-2" />
                      Profile Picture (Optional)
                    </label>
                    <input
                      type="file"
                      name="profilePic"
                      accept="image/*"
                      onChange={handleFile}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Upload a profile picture (JPG, PNG, etc.)
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Creating User...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        <span>Create {formData.role.toUpperCase()} User</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Staff List Panel - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Header */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-gray-600" />
                    <h2 className="font-semibold text-gray-900">Staff Members</h2>
                  </div>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {staffMembers.length}
                  </span>
                </div>
              </div>

              {/* Staff List */}
              <div className="p-4">
                {loadingStaff ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : staffMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No staff members found</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {staffMembers.map((staff) => (
                      <div key={staff.staffId} className="group p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                        <div className="flex items-center space-x-3">
                          {/* Profile Picture or Avatar */}
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {staff.firstName.charAt(0)}{staff.lastName.charAt(0)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium text-gray-900 text-sm truncate">
                                {staff.firstName} {staff.lastName}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(staff.role)} flex items-center space-x-1`}>
                                {getRoleIcon(staff.role)}
                                <span className="capitalize">{staff.role}</span>
                              </span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 space-x-3">
                              <span className="flex items-center">
                                <Building2 className="w-3 h-3 mr-1" />
                                {staff.department}
                              </span>
                              <span>#{staff.staffId}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">@{staff.username}</span>
                              <div className="flex items-center space-x-2">
                                <div className={`flex items-center space-x-1 ${staff.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                  {staff.isActive ? (
                                    <CheckCircle className="w-3 h-3" />
                                  ) : (
                                    <AlertCircle className="w-3 h-3" />
                                  )}
                                  <span className="text-xs">
                                    {staff.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                                
                                {/* Remove Button */}
                                {canRemoveStaff(staff) && (
                                  <button
                                    onClick={() => setConfirmDelete(staff)}
                                    disabled={deletingStaff === staff.staffId}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded text-red-600 hover:text-red-700 disabled:opacity-50"
                                    title="Remove staff member"
                                  >
                                    {deletingStaff === staff.staffId ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                                    ) : (
                                      <Trash2 className="w-3 h-3" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Confirmation Modal */}
            {confirmDelete && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <UserX className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Remove Staff Member</h3>
                        <p className="text-sm text-gray-600">This action cannot be undone</p>
                      </div>
                    </div>
                    
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                          {confirmDelete.firstName.charAt(0)}{confirmDelete.lastName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {confirmDelete.firstName} {confirmDelete.lastName}
                          </h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(confirmDelete.role)} flex items-center space-x-1`}>
                              {getRoleIcon(confirmDelete.role)}
                              <span className="capitalize">{confirmDelete.role}</span>
                            </span>
                            <span>•</span>
                            <span>{confirmDelete.department}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleRemoveStaff(confirmDelete.staffId)}
                        disabled={deletingStaff === confirmDelete.staffId}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        {deletingStaff === confirmDelete.staffId ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Removing...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            <span>Remove</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStaff;