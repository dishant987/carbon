import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf } from 'lucide-react';

interface UnprotectedRouteProps {
  children: React.ReactNode;
}

export function UnprotectedRoute({ children }: UnprotectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
        <Leaf className="h-10 w-10 text-green-500 animate-pulse" />
        <span className="mt-3 text-sm text-muted-foreground font-medium">Verifying session...</span>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
