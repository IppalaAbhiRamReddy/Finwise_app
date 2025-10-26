import { jwtDecode } from 'jwt-decode';

export const getAuthTokens = () => {
  const access = localStorage.getItem('access');
  const refresh = localStorage.getItem('refresh');
  return { access, refresh };
};

export const getUserData = () => {
  const { access } = getAuthTokens();
  if (!access) return null;
  try {
    const decoded = jwtDecode(access);
    return decoded; // This will have username, email, role, etc.
  } catch (error) {
    return null;
  }
};