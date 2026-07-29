import React from 'react';
import { Navigate, useLocation } from 'react-router';
import useAuth from '../useAuth/useAuth';


const PrivateRoute = ({ children }) => {
  return children;
};

export default PrivateRoute;
