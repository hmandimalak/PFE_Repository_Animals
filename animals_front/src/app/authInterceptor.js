// utils/authInterceptor.js
const API_BASE_URL = 'http://localhost:8000/api';

const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: refreshToken
      })
    });

    if (!response.ok) throw new Error('Failed to refresh token');
    
    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    return data.access;
  } catch (error) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw error;
  }
};

export const authenticatedFetch = async (url, options = {}) => {
  let accessToken = localStorage.getItem('access_token');
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) return response;

    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token available');

      accessToken = await refreshAccessToken(refreshToken);

      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    }

    return response;
  } catch (error) {
    throw error;
  }
  
};
