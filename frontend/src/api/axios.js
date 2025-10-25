import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

// 🔹 Request Interceptor — attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Response Interceptor — auto-refresh token if expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401, not a retry, and not the refresh token route itself
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== 'login/refresh/') {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem('refresh');
        if (!refresh) throw new Error("No refresh token");

        // --- FIXED URL ---
        // Use the 'api' instance to post to the correct refresh URL
        const res = await api.post('login/refresh/', { refresh });
        
        localStorage.setItem('access', res.data.access);
        
        // Update the authorization header for the original request
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        
        // Retry the original request
        return api(originalRequest);
        
      } catch (refreshError) {
        // Refresh token invalid — logout user
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        // Use window.location to force a redirect and full app reload
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;