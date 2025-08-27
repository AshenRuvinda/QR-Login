import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import CameraQRScanner from './QRScanner';
import { 
  Camera, 
  Keyboard, 
  QrCode, 
  User, 
  UserCheck, 
  UserX, 
  Building, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Play,
  Square,
  Search,
  RotateCcw,
  ArrowRight,
  Info
} from 'lucide-react';

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
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <QrCode className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">QR Attendance Scanner</h1>
            <p className="text-gray-600 mt-1">Scan employee QR codes or enter User IDs manually</p>
          </div>
        </div>
      </div>
      
      {/* Mode Selection */}
      <div className="mb-6 flex justify-center">
        <div className="bg-white rounded-xl p-2 shadow-sm border">
          <button
            onClick={() => switchScanMode('camera')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 ${
              scanMode === 'camera' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            <Camera className="w-5 h-5" />
            <span className="font-medium">Camera Scanner</span>
          </button>
          <button
            onClick={() => switchScanMode('manual')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 ${
              scanMode === 'manual' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            <Keyboard className="w-5 h-5" />
            <span className="font-medium">Manual Input</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-red-700">{error}</div>
        </div>
      )}

      {/* Success Message */}
      {attendanceResult && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-green-800">{attendanceResult.msg}</div>
              <div className="text-sm text-green-700 mt-1 flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Time: {new Date(attendanceResult.user.timestamp).toLocaleString()}</span>
              </div>
              <div className="text-xs text-green-600 mt-2 opacity-75">
                Auto-clearing in 3 seconds...
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <div className="space-y-6">
          {scanMode === 'camera' ? (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Camera className="w-6 h-6 text-gray-700" />
                <h2 className="text-xl font-semibold text-gray-900">Camera Scanner</h2>
              </div>
              
              <CameraQRScanner
                onScan={handleScan}
                isActive={scannerActive}
                onError={setError}
              />
              
              <div className="mt-6 text-center">
                <button
                  onClick={toggleScanner}
                  disabled={loading}
                  className={`inline-flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 shadow-sm ${
                    scannerActive
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {scannerActive ? (
                    <>
                      <Square className="w-5 h-5" />
                      <span>{loading ? 'Processing...' : 'Stop Scanner'}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>{loading ? 'Processing...' : 'Start Scanner'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Keyboard className="w-6 h-6 text-gray-700" />
                <h2 className="text-xl font-semibold text-gray-900">Manual User ID Entry</h2>
              </div>
              
              <form onSubmit={handleManualInput} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    User ID
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Enter User ID (e.g., 20001)"
                      value={manualUserId}
                      onChange={(e) => setManualUserId(e.target.value)}
                      className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      disabled={loading}
                    />
                    <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !manualUserId}
                  className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 font-medium shadow-sm"
                >
                  <Search className="w-5 h-5" />
                  <span>{loading ? 'Looking up...' : 'Look Up User'}</span>
                </button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    Enter the employee's User ID to look up their information.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Preview Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {scannedUser ? (
            <>
              <div className="flex items-center space-x-3 mb-6">
                <User className="w-6 h-6 text-gray-700" />
                <h2 className="text-xl font-semibold text-gray-900">Employee Information</h2>
              </div>
              
              <div className="flex items-start space-x-6">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  {scannedUser.profilePic ? (
                    <img
                      src={scannedUser.profilePic}
                      alt={scannedUser.name}
                      className="w-28 h-28 rounded-2xl object-cover border-4 border-gray-100 shadow-sm"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* User Details */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-500 mb-1">User ID</label>
                      <p className="text-xl font-bold text-gray-900">{scannedUser.userId}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                      <p className="text-xl font-bold text-gray-900">{scannedUser.name}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-3">
                      <Building className="w-5 h-5 text-gray-500" />
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
                        <p className="text-lg font-semibold text-gray-900">{scannedUser.department}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-500 mb-2">Current Status</label>
                      <div className="flex items-center space-x-2">
                        {scannedUser.currentStatus === 'IN' ? (
                          <UserCheck className="w-5 h-5 text-green-600" />
                        ) : (
                          <UserX className="w-5 h-5 text-red-600" />
                        )}
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                          scannedUser.currentStatus === 'IN' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {scannedUser.currentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-8 space-y-3">
                <button
                  onClick={handleMarkAttendance}
                  disabled={loading}
                  className={`w-full inline-flex items-center justify-center space-x-3 px-6 py-4 rounded-lg font-semibold text-white transition-all duration-200 shadow-sm ${
                    scannedUser.currentStatus === 'OUT'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-orange-600 hover:bg-orange-700'
                  } disabled:opacity-50`}
                >
                  {scannedUser.currentStatus === 'OUT' ? (
                    <>
                      <UserCheck className="w-6 h-6" />
                      <span>{loading ? 'Processing...' : 'Mark as IN'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <UserX className="w-6 h-6" />
                      <span>{loading ? 'Processing...' : 'Mark as OUT'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleClear}
                  className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Clear</span>
                </button>
              </div>
              
              {/* Status Change Preview */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    <strong>Next Action:</strong> This will mark the employee as{' '}
                    <span className="font-semibold">
                      {scannedUser.currentStatus === 'OUT' ? 'IN (Entry)' : 'OUT (Exit)'}
                    </span>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-3 mb-6">
                <User className="w-6 h-6 text-gray-700" />
                <h2 className="text-xl font-semibold text-gray-900">Employee Preview</h2>
              </div>
              <div className="text-center py-12 text-gray-500">
                <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-600 mb-2">Scan QR code or enter User ID</p>
                <p className="text-sm text-gray-500">Employee information will appear here</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Info className="w-6 h-6 text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">Instructions</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Camera className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Camera Scanner</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600 ml-8">
              <p>• Click "Start Scanner" to activate camera</p>
              <p>• Point camera at employee's QR code</p>
              <p>• Keep QR code within the square frame</p>
              <p>• Scanner will automatically detect codes</p>
              <p>• Ensure good lighting for best results</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Keyboard className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Manual Entry</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600 ml-8">
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