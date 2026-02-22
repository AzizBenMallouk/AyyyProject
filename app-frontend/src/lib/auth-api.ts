import { api } from './api-client';
import { LoginResponse, User } from '@/types/auth';

export const login = async (credentials: any): Promise<LoginResponse> => {
    // Note: auth login is outside /api context in current backend setup
    // But api client uses /api as base. I'll adjust the path to go one level up.
    return api.post<LoginResponse>('/../auth/login', credentials);
};

export const getCurrentUser = async (token: string): Promise<User> => {
    // api client adds token automatically from localStorage if available
    // For initAuth in context, we might pass it explicitly or just rely on localStorage
    return api.get<User>('/../auth/me');
};
