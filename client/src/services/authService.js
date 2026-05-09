import axios from 'axios';

export const NODE_API = 'https://api.argumind.space';
export const FASTAPI_URL = 'https://pipeline.argumind.space';

const API_URL = `${NODE_API}/api/auth/`;

// Register user
const signup = async (userData) => {
  const response = await axios.post(API_URL + 'signup', userData);
  if (response.data) {
    if (response.data.token) {
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userInfo', JSON.stringify(response.data.user));
    }
  }
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(API_URL + 'login', userData);
  if (response.data) {
    if (response.data.token) {
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userInfo', JSON.stringify(response.data.user));
    }
  }
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userInfo');
};

const authService = { signup, login, logout };
export default authService;