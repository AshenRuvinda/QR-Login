import React, { useState, useRef } from 'react';
import QRCode from 'qrcode';

const QRGenerator = ({ user }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const canvasRef = useRef();

  const generateQR = async () => {
    if (!user || !user.userId) return;
    
    try {
      // QR Code contains only the User ID
      const qrData = user.userId.toString();
      
      const url = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeUrl(url);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const downloadQR = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `QR_${user.firstName}_${user.lastName}_${user.userId}.png`;
    link.click();
  };

  const printQR = () => {
    if (!qrCodeUrl) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${user.firstName} ${user.lastName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 20px;
            }
            .qr-container {
              border: 2px solid #000;
              padding: 20px;
              margin: 20px auto;
              width: 300px;
            }
            .user-info {
              margin-bottom: 15px;
            }
            .qr-code {
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="user-info">
              <h2>${user.firstName} ${user.lastName}</h2>
              <p><strong>ID:</strong> ${user.userId}</p>
              <p><strong>Department:</strong> ${user.department}</p>
            </div>
            <div class="qr-code">
              <img src="${qrCodeUrl}" alt="QR Code" />
            </div>
            <p style="font-size: 12px; color: #666;">
              Scan this QR code for attendance
            </p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Generate QR Code</h3>
      
      <div className="text-center">
        {!qrCodeUrl ? (
          <button
            onClick={generateQR}
            className="mb-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
          >
            Generate QR Code
          </button>
        ) : (
          <div>
            <div className="mb-4">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="mx-auto border-2 border-gray-200 rounded-lg"
              />
            </div>
            
            <div className="space-x-3">
              <button
                onClick={downloadQR}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
              >
                Download
              </button>
              
              <button
                onClick={printQR}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200"
              >
                Print
              </button>
              
              <button
                onClick={() => setQrCodeUrl('')}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-200"
              >
                Clear
              </button>
            </div>
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>User ID:</strong> {user.userId}</p>
          <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Department:</strong> {user.department}</p>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;