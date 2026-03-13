// import axios from 'axios';

// const axiosInstance = axios.create({
//   baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000',
//   headers: { 'Content-Type': 'application/json' },
//   withCredentials: true, // Crucial for HttpOnly cookies (Refresh Token)
// });

// // We use a variable in memory to hold the token for the interceptor
// let accessToken = null;

// export const setAuthToken = (token) => {
//   accessToken = token;
// };

// axiosInstance.interceptors.request.use((config) => {
//   if (accessToken) {
//     config.headers.Authorization = `Bearer ${accessToken}`;
//   }
//   return config;
// });

// export default axiosInstance;

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000', // Match your environment.apiUrl
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // THIS IS WHAT ANGULAR DOES
});

let accessToken = null;

export const setAuthToken = (token) => {
  accessToken = token;
};

axiosInstance.interceptors.request.use((config) => {
  // Only attach if we have a real token in memory
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default axiosInstance;