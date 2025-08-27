import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Reports = () => {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ userId: '', name: '', department: '', date: '' });

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/attendance/logs', { params: filters });
        setLogs(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLogs();
  }, [filters]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <input name="userId" placeholder="User ID" onChange={handleChange} />
      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="department" placeholder="Department" onChange={handleChange} />
      <input name="date" type="date" onChange={handleChange} />
      <table>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Timestamp</th>
            <th>Marked By</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i}>
              <td>{log.userId}</td>
              <td>{log.name}</td>
              <td>{log.department}</td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.markedBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reports;