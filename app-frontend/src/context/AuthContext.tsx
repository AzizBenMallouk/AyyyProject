"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthState, LoginResponse, User, LoginCredentials } from '@/types/auth';
import * as authApi from '@/lib/auth-api';
import * as authUtils from '@/lib/utils'; // Using utils for token management

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
    });
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            const token = authUtils.getToken();
            if (token) {
                try {
                    const user = await authApi.getCurrentUser(token);
                    setState({
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    console.error("Failed to fetch user", error);
                    //authUtils.removeToken();
                    setState({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            } else {
                setState({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        };

        initAuth();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            const response: LoginResponse = await authApi.login(credentials);
            authUtils.setToken(response.token);

            // Construct user object from response
            const user: User = {
                id: response.id,
                username: response.username,
                email: response.email,
                roles: response.roles,
                campusId: response.campusId,
                firstName: '', // Backend might not return these yet
                lastName: ''
            };

            setState({
                user,
                isAuthenticated: true,
                isLoading: false,
            });

            // Redirect based on role
            // Redirect based on role
            if (user.roles.includes('ADMIN') || user.roles.includes('TRAINER')) {
                router.push('/staff');
            } else {
                router.push('/student');
            }
        } catch (error) {
            console.error("Login error", error);
            throw error;
        }
    };

    const logout = () => {
        authUtils.removeToken();
        setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        });
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
