import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <div>
    <h2>403 - Unauthorized</h2>
    <p>You do not have permission to view this page.</p>
    <Link to="/dashboard">Back to Dashboard</Link>
  </div>
);

export default Unauthorized;