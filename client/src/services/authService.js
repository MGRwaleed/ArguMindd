import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/';

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

const authService = {
  signup,
  login,
  logout,
};

export default authService;
