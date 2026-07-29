import React from 'react';
import { Navigate, useLocation } from 'react-router';
import useAuth from '../useAuth/useAuth';


const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
        <div className='flex items-center justify-center min-h-screen'>
            <span className="loading loading-bars loading-lg"></span>
        </div>
    );
    }

  if (!user) {
    return <Navigate to="/SignIn" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
