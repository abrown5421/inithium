import React from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback = <div>Please login to access this page</div>,
}) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};