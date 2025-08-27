import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import CameraQRScanner from './QRScanner';

const QRAttendance = () => {
  const { user } = useContext(AuthContext);
  const [scannedUser, setScannedUser] = useState(null);
  const [attendanceResult, setAttendanceResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [manualUserId, setManualUserId] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'manual'

  // Handle QR scan from camera or manual input
  const handleScan = async (userId) => {
    if (!userId || userId.trim() === '') return;
    
    // Stop scanner temporarily while processing
    setScannerActive(false);
    setLoading(true);
    setError('');
    setAttendanceResult(null);
    
    try {
      // Clean up the userId (remove any extra characters)
      const cleanUserId = userId.toString().replace(/[^\d]/g, '');
      
      if (!cleanUserId) {
        setError('Invalid QR code format. Expected user ID number.');
        return;
      }

      console.log('Looking up user:', cleanUserId);
      
      // First, get user info for preview
      const userResponse = await fetch(`/attendance/user/${cleanUserId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${user.username}:${user.password}`)}`
        }
      });
      
      const userData = await userResponse.json();
      console.log('User lookup response:', userData);
      
      if (!userData.success) {
        setError(userData.msg || 'User not found');
        return;
      }
      
      setScannedUser(userData.user);
      
      // Show success message for scan
      if (scanMode === 'camera') {
        setError(''); // Clear any previous errors
        // Auto-restart scanner after a delay
        setTimeout(() => {
          if (!scannedUser) { // Only restart if user hasn't been processed
            setScannerActive(true);
          }
        }, 2000);
      }
      
    } catch (err) {
      console.error('Error scanning QR:', err);
      setError('Failed to scan QR code. Please try again.');
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
      console.log('Attendance result:', result);
      
      if (result.success) {
        setAttendanceResult(result);
        setScannedUser(result.user); // Update with new status
        
        // Auto-clear after 3 seconds and restart scanner
        setTimeout(() => {
          handleClear();
          if (scanMode === 'camera') {
            setScannerActive(true);
          }
        }, 3000);
      } else {
        setError(result.msg || 'Failed to mark attendance');
      }
    } catch (err) {
      console.error('Error marking attendance:', err);
      setError('Failed to mark attendance. Please try again.');
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

  const toggleScanner = () => {
    setScannerActive(!scannerActive);
    if (!scannerActive) {
      handleClear(); // Clear any previous results
    }
  };

  const switchScanMode = (mode) => {
    setScanMode(mode);
    setScannerActive(false);
    handleClear();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">QR Attendance Scanner</h1>
      
      {/* Mode Selection */}
      <div className="mb-6 flex justify-center">
        <div className="bg-white rounded-lg p-1 shadow-md">
          <button
            onClick={() => switchScanMode('camera')}
            className={`px-4 py-2 rounded-md transition-colors ${
              scanMode === 'camera' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📷 Camera Scanner
          </button>
          <button
            onClick={() => switchScanMode('manual')}
            className={`px-4 py-2 rounded-md transition-colors ${
              scanMode === 'manual' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ⌨️ Manual Input
          </button>
        </div>
      </div>

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
          <div className="text-xs mt-1 opacity-75">
            Auto-clearing in 3 seconds...
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <div>
          {scanMode === 'camera' ? (
            <div>
              <CameraQRScanner
                onScan={handleScan}
                isActive={scannerActive}
                onError={setError}
              />
              
              <div className="mt-4 text-center">
                <button
                  onClick={toggleScanner}
                  disabled={loading}
                  className={`px-6 py-2 rounded-md font-medium transition duration-200 disabled:opacity-50 ${
                    scannerActive
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {loading ? 'Processing...' : (scannerActive ? 'Stop Scanner' : 'Start Scanner')}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Manual User ID Entry</h2>
              
              <form onSubmit={handleManualInput} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User ID
                  </label>
                  <input
                    type="number"
                    placeholder="Enter User ID (e.g., 20001)"
                    value={manualUserId}
                    onChange={(e) => setManualUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !manualUserId}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition duration-200"
                >
                  {loading ? 'Looking up...' : 'Look Up User'}
                </button>
              </form>

              <div className="mt-4 text-sm text-gray-600">
                <p>Enter the employee's User ID to look up their information.</p>
              </div>
            </div>
          )}
        </div>

        {/* User Preview Section */}
        <div>
          {scannedUser ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Employee Information</h2>
              
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
                  <div className="grid grid-cols-1 gap-3">
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
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={handleMarkAttendance}
                      disabled={loading}
                      className={`w-full px-6 py-3 rounded-md font-medium text-white transition duration-200 ${
                        scannedUser.currentStatus === 'OUT'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-orange-600 hover:bg-orange-700'
                      } disabled:opacity-50`}
                    >
                      {loading ? 'Processing...' : `Mark as ${scannedUser.currentStatus === 'OUT' ? 'IN' : 'OUT'}`}
                    </button>
                    
                    <button
                      onClick={handleClear}
                      className="w-full px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-200"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Status Change Preview */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Next Action:</strong> This will mark the employee as{' '}
                  <span className="font-semibold">
                    {scannedUser.currentStatus === 'OUT' ? 'IN (Entry)' : 'OUT (Exit)'}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Employee Preview</h2>
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">👤</div>
                <p>Scan QR code or enter User ID</p>
                <p className="text-sm">Employee information will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Camera Scanner:</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>• Click "Start Scanner" to activate camera</p>
              <p>• Point camera at employee's QR code</p>
              <p>• Keep QR code within the square frame</p>
              <p>• Scanner will automatically detect codes</p>
              <p>• Ensure good lighting for best results</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Manual Entry:</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>• Enter the employee's User ID</p>
              <p>• Click "Look Up User" to find employee</p>
              <p>• Review information before marking attendance</p>
              <p>• System toggles between IN/OUT automatically</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRAttendance;