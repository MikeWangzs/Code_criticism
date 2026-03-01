import axios from 'axios';

const client = axios.create({
  baseURL: '/api/v1',
  timeout: 20_000,
});

client.interceptors.response.use((res) => res.data, (error) => Promise.reject(error));

export default client;
