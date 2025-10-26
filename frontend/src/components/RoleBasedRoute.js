import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserData } from '../utils/auth';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const userData = getUserData();

  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  // Check if the user's role is in the allowed list
  return allowedRoles.includes(userData.role) 
    ? children 
    : <Navigate to="/unauthorized" replace />;
};

export default RoleBasedRoute;