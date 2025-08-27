import React, { useState } from 'react';
import api from '../utils/api';
import QRCode from 'qrcode';

const RegisterUser = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', department: '', role: 'employee', password: '', profilePic: null });
  const [qrCode, setQrCode] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    setFormData({ ...formData, profilePic: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    try {
      const res = await api.post('/users', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      QRCode.toDataURL(`${res.data.userId}:${res.data.firstName} ${res.data.lastName}`, (err, url) => {
        if (err) console.error(err);
        setQrCode(url);
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="firstName" placeholder="First Name" onChange={handleChange} />
      <input name="lastName" placeholder="Last Name" onChange={handleChange} />
      <input name="department" placeholder="Department" onChange={handleChange} />
      <input name="role" placeholder="Role" onChange={handleChange} />
      <input name="password" type="password" placeholder="Password (if operator/hr)" onChange={handleChange} />
      <input type="file" name="profilePic" onChange={handleFile} />
      <button type="submit">Register</button>
      {qrCode && <img src={qrCode} alt="QR Code" />}
    </form>
  );
};

export default RegisterUser;