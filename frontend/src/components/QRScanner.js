import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = ({ onScan }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode('reader');
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode.start(
      { facingMode: 'environment' },
      config,
      (decodedText) => {
        onScan(decodedText);
      },
      (errorMessage) => {
        // Ignore
      }
    );

    return () => {
      html5QrCode.stop();
    };
  }, [onScan]);

  return <div id="reader" ref={scannerRef} style={{ width: '100%' }}></div>;
};

export default QRScanner;