import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Assuming proxy or same origin
});

export default api;