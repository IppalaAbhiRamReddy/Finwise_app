import React from 'react';
import { getUserData } from '../utils/auth';

const Profile = () => {
  const userData = getUserData();

  if (!userData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="profile">
      <h2>User Profile</h2>
      <p><strong>Username:</strong> {userData.username}</p>
      <p><strong>Email:</strong> {userData.email}</p>
      <p><strong>Role:</strong> {userData.role}</p>
    </div>
  );
};

export default Profile;