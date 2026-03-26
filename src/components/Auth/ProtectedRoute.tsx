import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isLoggedIn, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-ink">
                <Loader2 className="animate-spin text-ink/20 dark:text-white/20" size={48} />
            </div>
        );
    }

    if (!isLoggedIn) {
        // Redirect to login but save the current location to return after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
