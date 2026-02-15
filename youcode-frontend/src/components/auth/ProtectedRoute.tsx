"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }

        if (!isLoading && isAuthenticated && allowedRoles && user) {
            const hasPermission = user.roles.some(role => allowedRoles.includes(role));
            if (!hasPermission) {
                // Redirect to unauthorized or dashboard if no permission
                router.push('/unauthorized');
            }
        }
    }, [isAuthenticated, isLoading, router, user, allowedRoles]);

    if (isLoading) {
        return <div>Loading...</div>; // Or a spinner component
    }

    if (!isAuthenticated) {
        return null;
    }

    if (allowedRoles && user && !user.roles.some(role => allowedRoles.includes(role))) {
        return null;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
