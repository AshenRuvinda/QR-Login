import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';

const QRAttendance = () => {
  const { user } = useContext(AuthContext);
  const [scannedUser, setScannedUser] = useState(null);
  const [attendanceResult, setAttendanceResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [manualUserId, setManualUserId] = useState('');

  // Simulate QR scan or manual input
  const handleScan = async (userId) => {
    if (!userId) return;
    
    setLoading(true);
    setError('');
    setAttendanceResult(null);
    
    try {
      // First, get user info for preview
      const userResponse = await fetch(`/attendance/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${user.username}:${user.password}`)}`
        }
      });
      
      const userData = await userResponse.json();
      
      if (!userData.success) {
        setError(userData.msg);
        return;
      }
      
      setScannedUser(userData.user);
    } catch (err) {
      console.error('Error scanning QR:', err);
      setError('Failed to scan QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    if (!scannedUser) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${user.username}:${user.password}`)}`
        },
        body: JSON.stringify({ userId: scannedUser.userId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setAttendanceResult(result);
        setScannedUser(result.user); // Update with new status
      } else {
        setError(result.msg);
      }
    } catch (err) {
      console.error('Error marking attendance:', err);
      setError('Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setScannedUser(null);
    setAttendanceResult(null);
    setError('');
    setManualUserId('');
  };

  const handleManualInput = (e) => {
    e.preventDefault();
    if (manualUserId) {
      handleScan(manualUserId);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">QR Attendance Scanner</h1>
      
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {attendanceResult && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <div className="font-bold">{attendanceResult.msg}</div>
          <div className="text-sm">
            Time: {new Date(attendanceResult.user.timestamp).toLocaleString()}
          </div>
        </div>
      )}

      {/* QR Scanner Placeholder and Manual Input */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Scan QR Code</h2>
        
        {/* QR Scanner would go here */}
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
          <div className="text-gray-500 mb-2">📷</div>
          <p className="text-gray-500">QR Scanner would be integrated here</p>
          <p className="text-sm text-gray-400">Use manual input for now</p>
        </div>

        {/* Manual Input */}
        <form onSubmit={handleManualInput} className="flex gap-2">
          <input
            type="number"
            placeholder="Enter User ID"
            value={manualUserId}
            onChange={(e) => setManualUserId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !manualUserId}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Scan
          </button>
        </form>
      </div>

      {/* User Preview */}
      {scannedUser && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          
          <div className="flex items-start space-x-4">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              {scannedUser.profilePic ? (
                <img
                  src={scannedUser.profilePic}
                  alt={scannedUser.name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl text-gray-500">👤</span>
                </div>
              )}
            </div>
            
            {/* User Details */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">User ID</label>
                  <p className="text-lg font-semibold text-gray-900">{scannedUser.userId}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Name</label>
                  <p className="text-lg font-semibold text-gray-900">{scannedUser.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Department</label>
                  <p className="text-lg font-semibold text-gray-900">{scannedUser.department}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Current Status</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    scannedUser.currentStatus === 'IN' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {scannedUser.currentStatus}
                  </span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={handleMarkAttendance}
                  disabled={loading}
                  className={`px-6 py-2 rounded-md font-medium text-white transition duration-200 ${
                    scannedUser.currentStatus === 'OUT'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-orange-600 hover:bg-orange-700'
                  } disabled:opacity-50`}
                >
                  {loading ? 'Processing...' : `Mark as ${scannedUser.currentStatus === 'OUT' ? 'IN' : 'OUT'}`}
                </button>
                
                <button
                  onClick={handleClear}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-200"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
          
          {/* Status Change Preview */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Next Action:</strong> This will mark the user as{' '}
              <span className="font-semibold">
                {scannedUser.currentStatus === 'OUT' ? 'IN (Entry)' : 'OUT (Exit)'}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Scan employee QR code or enter User ID manually</p>
          <p>• Review employee information before marking attendance</p>
          <p>• Click "Mark as IN" for entry or "Mark as OUT" for exit</p>
          <p>• The system automatically toggles between IN and OUT status</p>
        </div>
      </div>
    </div>
  );
};

export default QRAttendance;