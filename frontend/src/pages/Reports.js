import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import api from '../utils/api';

const Reports = () => {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filters, setFilters] = useState({ 
    userId: '', 
    name: '', 
    department: '', 
    date: '', 
    status: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalLogs, setTotalLogs] = useState(0);

  // Fetch attendance logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Set authorization header
      if (user && user.password) {
        const authString = user.role === 'admin' ? 
          `${user.username}:${user.password}` : 
          `${user.username}:${user.password}`;
        api.defaults.headers.common['Authorization'] = `Basic ${btoa(authString)}`;
      }

      // Build query parameters
      const params = {};
      if (filters.userId) params.userId = filters.userId;
      if (filters.name) params.name = filters.name;
      if (filters.department) params.department = filters.department;
      if (filters.date) params.date = filters.date;
      if (filters.status) params.status = filters.status;

      console.log('Fetching logs with params:', params);
      
      const response = await api.get('/attendance/logs', { params });
      console.log('Logs response:', response.data);
      
      if (response.data.success) {
        const logsData = Array.isArray(response.data.logs) ? response.data.logs : [];
        setLogs(logsData);
        setFilteredLogs(logsData);
        setTotalLogs(response.data.total || logsData.length);
      } else {
        setError(response.data.msg || 'Failed to fetch logs');
        setLogs([]);
        setFilteredLogs([]);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err.response?.data?.msg || 'Failed to fetch attendance logs');
      setLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user]);

  useEffect(() => {
    // Re-fetch when filters change
    if (user) {
      fetchLogs();
    }
  }, [filters]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ 
      userId: '', 
      name: '', 
      department: '', 
      date: '', 
      status: '' 
    });
  };

  const exportToCSV = () => {
    if (!Array.isArray(filteredLogs) || filteredLogs.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['User ID', 'Name', 'Department', 'Status', 'Timestamp', 'Marked By'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        log.userId,
        `"${log.name}"`,
        `"${log.department}"`,
        log.status,
        `"${new Date(log.timestamp).toLocaleString()}"`,
        `"${log.markedBy}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getUniqueValues = (key) => {
    if (!Array.isArray(logs)) return [];
    return [...new Set(logs.map(log => log[key]).filter(Boolean))].sort();
  };

  const departments = getUniqueValues('department');

  if (loading && logs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="text-lg mt-4">Loading attendance reports...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Attendance Reports</h1>
        <p className="text-gray-600 mt-2">View and filter attendance logs</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <div className="font-bold">Error Loading Reports</div>
          <div className="mt-2">{error}</div>
          <button 
            onClick={fetchLogs} 
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-blue-600">{totalLogs}</div>
          <div className="text-sm text-gray-600">Total Records</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="text-2xl font-bold text-green-600">
            {Array.isArray(filteredLogs) ? filteredLogs.filter(log => log.status === 'IN').length : 0}
          </div>
          <div className="text-sm text-gray-600">Check-ins</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="text-2xl font-bold text-red-600">
            {Array.isArray(filteredLogs) ? filteredLogs.filter(log => log.status === 'OUT').length : 0}
          </div>
          <div className="text-sm text-gray-600">Check-outs</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="text-2xl font-bold text-purple-600">
            {Array.isArray(filteredLogs) ? filteredLogs.length : 0}
          </div>
          <div className="text-sm text-gray-600">Showing</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
            <input
              type="text"
              name="userId"
              placeholder="Enter User ID"
              value={filters.userId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter name"
              value={filters.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              name="department"
              value={filters.department}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="IN">Check In</option>
              <option value="OUT">Check Out</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Loading...' : 'Apply Filters'}
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
          >
            Clear Filters
          </button>
          <button
            onClick={exportToCSV}
            disabled={!Array.isArray(filteredLogs) || filteredLogs.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Attendance Logs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold">Attendance Logs</h2>
        </div>

        {Array.isArray(filteredLogs) && filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No attendance records found</div>
            <p className="text-gray-400">
              {Object.values(filters).some(v => v) 
                ? 'Try adjusting your filters' 
                : 'No attendance data available'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marked By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(filteredLogs) && filteredLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        log.status === 'IN' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.markedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 text-sm text-gray-500 text-center">
        {Array.isArray(filteredLogs) && filteredLogs.length > 0 && (
          <p>Showing {filteredLogs.length} of {totalLogs} records</p>
        )}
      </div>
    </div>
  );
};

export default Reports;