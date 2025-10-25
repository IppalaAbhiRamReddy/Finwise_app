import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api/axios'; // <-- 1. Import your custom 'api' instance

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null); // Use null to mean 'loading'

  useEffect(() => {
    const checkAuth = async () => {
      const refresh = localStorage.getItem('refresh');

      if (!refresh) {
        setIsAuth(false);
        return;
      }

      try {
        // --- 2. Use 'api' and the correct URL ---
        await api.post('login/refresh/', { refresh });
        // If refresh is successful, user is authenticated
        setIsAuth(true);
      } catch (err) {
        // If refresh fails, token is invalid
        setIsAuth(false);
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
      }
    };

    checkAuth();
  }, []); // Empty array means this runs only once on mount

  if (isAuth === null) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return isAuth ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;