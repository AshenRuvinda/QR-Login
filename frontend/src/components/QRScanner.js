import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

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
    <div className="qr-scanner-container">
      {cameras.length > 1 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Camera:
          </label>
          <select
            value={selectedCamera}
            onChange={handleCameraChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label || `Camera ${camera.id}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          <div className="font-medium mb-1">Camera Error:</div>
          <div>{error}</div>
          <div className="mt-2 text-xs">
            <p>• Check if camera permissions are granted</p>
            <p>• Ensure no other app is using the camera</p>
            <p>• Try refreshing the page</p>
          </div>
        </div>
      )}

      <div 
        id={elementId}
        className="mx-auto border-2 border-gray-200 rounded-lg overflow-hidden"
        style={{ 
          width: `${width}px`, 
          height: isActive ? 'auto' : `${height}px`,
          minHeight: isActive ? `${height}px` : 'auto',
          background: isActive ? 'transparent' : '#f5f5f5'
        }}
      >
        {!isActive && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📷</div>
              <p>Camera Ready</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 text-center">
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
          isScanning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        }`}>
          <span className={`w-2 h-2 rounded-full mr-2 ${
            isScanning ? 'bg-green-500' : 'bg-gray-400'
          }`}></span>
          {isScanning ? 'Scanning Active' : 'Scanner Stopped'}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;