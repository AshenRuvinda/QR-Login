import React, { useState } from 'react';
import QRScanner from '../components/QRScanner';
import api from '../utils/api';

const Attendance = () => {
  const [result, setResult] = useState('');

  const handleScan = async (data) => {
    if (data) {
      const [userId] = data.split(':');
      try {
        await api.post('/attendance/mark', { userId: parseInt(userId) });
        setResult('Attendance marked');
      } catch (err) {
        setResult('Error marking attendance');
      }
    }
  };

  return (
    <div>
      <QRScanner onScan={handleScan} />
      <p>{result}</p>
    </div>
  );
};

export default Attendance;