import React, { memo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageLoading } from './UnifiedLoading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = memo(
  ({ children, requiredRole }) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
      return <PageLoading />;
    }

    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  }
);

ProtectedRoute.displayName = 'ProtectedRoute';

export default ProtectedRoute;
