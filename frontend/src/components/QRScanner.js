import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, AlertTriangle, CheckCircle, StopCircle, Settings } from 'lucide-react';

const QRScanner = ({ onScan, isActive = true, width = 300, height = 300 }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const html5QrCodeRef = useRef(null);
  const elementId = `qr-reader-${Date.now()}`;

  useEffect(() => {
    // Get available cameras when component mounts
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length) {
        setCameras(devices);
        // Prefer back camera (environment facing)
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('environment')
        );
        setSelectedCamera(backCamera ? backCamera.id : devices[0].id);
      } else {
        setError('No cameras found on this device');
      }
    }).catch(err => {
      console.error('Error getting cameras:', err);
      setError('Unable to access camera. Please check permissions.');
    });

    return () => {
      stopScanning();
    };
  }, []);

  useEffect(() => {
    if (isActive && selectedCamera && !isScanning) {
      startScanning();
    } else if (!isActive && isScanning) {
      stopScanning();
    }
  }, [isActive, selectedCamera]);

  const startScanning = async () => {
    if (!selectedCamera) return;
    
    try {
      setError('');
      html5QrCodeRef.current = new Html5Qrcode(elementId);
      
      const config = {
        fps: 10,
        qrbox: { width: Math.min(250, width - 20), height: Math.min(250, height - 20) },
        aspectRatio: 1.0
      };

      await html5QrCodeRef.current.start(
        selectedCamera,
        config,
        (decodedText, decodedResult) => {
          console.log('QR Code detected:', decodedText);
          if (onScan) {
            onScan(decodedText);
          }
        },
        (errorMessage) => {
          // Only log non-routine scanning errors
          if (!errorMessage.includes('NotFoundException') && 
              !errorMessage.includes('No MultiFormat Readers')) {
            console.log('QR Scan error:', errorMessage);
          }
        }
      );
      
      setIsScanning(true);
      console.log('QR Scanner started successfully');
    } catch (err) {
      console.error('Failed to start QR scanner:', err);
      setError(`Failed to start scanner: ${err.message}`);
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    try {
      if (html5QrCodeRef.current && isScanning) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
        setIsScanning(false);
        console.log('QR Scanner stopped');
      }
    } catch (err) {
      console.error('Error stopping QR scanner:', err);
    }
  };

  const handleCameraChange = async (e) => {
    const newCameraId = e.target.value;
    if (isScanning) {
      await stopScanning();
    }
    setSelectedCamera(newCameraId);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Camera className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">QR Scanner</h3>
        </div>
        {cameras.length > 1 && (
          <Settings className="w-4 h-4 text-gray-400" />
        )}
      </div>

      {/* Camera Selection */}
      {cameras.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Camera
          </label>
          <div className="relative">
            <select
              value={selectedCamera}
              onChange={handleCameraChange}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
            >
              {cameras.map((camera) => (
                <option key={camera.id} value={camera.id}>
                  {camera.label || `Camera ${camera.id}`}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-red-800 mb-1">Camera Access Error</div>
              <div className="text-sm text-red-700 mb-3">{error}</div>
              <div className="text-xs text-red-600 space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                  <span>Check if camera permissions are granted</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                  <span>Ensure no other app is using the camera</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                  <span>Try refreshing the page</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scanner Area */}
      <div className="relative">
        <div 
          id={elementId}
          className="mx-auto border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50 relative"
          style={{ 
            width: `${width}px`, 
            height: isActive ? 'auto' : `${height}px`,
            minHeight: isActive ? `${height}px` : 'auto',
            background: isActive ? 'transparent' : '#f9fafb'
          }}
        >
          {!isActive && (
            <div className="flex items-center justify-center h-full text-gray-400 absolute inset-0">
              <div className="text-center">
                <Camera className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium">Camera Ready</p>
                <p className="text-xs text-gray-500 mt-1">Activate to start scanning</p>
              </div>
            </div>
          )}
        </div>

        {/* Scanner Overlay */}
        {isActive && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner indicators */}
            <div className="absolute top-4 left-4 w-6 h-6 border-l-3 border-t-3 border-blue-500 rounded-tl-lg"></div>
            <div className="absolute top-4 right-4 w-6 h-6 border-r-3 border-t-3 border-blue-500 rounded-tr-lg"></div>
            <div className="absolute bottom-4 left-4 w-6 h-6 border-l-3 border-b-3 border-blue-500 rounded-bl-lg"></div>
            <div className="absolute bottom-4 right-4 w-6 h-6 border-r-3 border-b-3 border-blue-500 rounded-br-lg"></div>
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className="mt-4 text-center">
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
          isScanning 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {isScanning ? (
            <>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <CheckCircle className="w-4 h-4" />
                  <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
                </div>
                <span>Scanning Active</span>
              </div>
            </>
          ) : (
            <>
              <StopCircle className="w-4 h-4 mr-2" />
              <span>Scanner Stopped</span>
            </>
          )}
        </div>
        
        {isActive && (
          <p className="text-xs text-gray-500 mt-2">
            Position QR code within the frame to scan
          </p>
        )}
      </div>
    </div>
  );
};

export default QRScanner;