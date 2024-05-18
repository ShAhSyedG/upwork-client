import axios from 'axios';

const request = axios.create({
  baseURL: process.env.REACT_APP_API_ENDPOINT,
});

request.interceptors.request.use((config) => {
  /// Set Token
  const token = window.localStorage.getItem('e-voting.auth.token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Add a response interceptor
request.interceptors.response.use(
  function (response) {
    if (response.data.status !== 'success')
      throw { message: response.data.message };
    return response.data;
  },
  function (error) {
    return Promise.reject(error);
  },
);

export default request;
