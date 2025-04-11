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

    if (!response.ok) {
      // Check for specific 401 error
      if (response.status === 401) {
        throw new Error('Refresh token expired or invalid');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Store both tokens
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh); // Add this line
    
    return data.access;
  } catch (error) {
    // Clear tokens and redirect
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
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Token is valid - return immediately
    if (response.ok) return response;

    // Handle token expiration
    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Refresh token and retry
      const newAccessToken = await refreshAccessToken(refreshToken);
      
      // Retry with new token
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newAccessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response;
    }

    // Handle other errors
    return response;
    
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};