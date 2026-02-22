import { api } from './api-client';
import { User, UserResponse, CreateUserRequest } from '@/types/user';

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

export const getAllUsers = async (page = 0, size = 10): Promise<UserResponse> => {
    return api.get<UserResponse>('/users', { params: { page, size } });
};

export const getUser = async (id: number): Promise<User> => {
    return api.get<User>(`/users/${id}`);
};

export const updateUser = async (id: number, userData: Partial<User>): Promise<User> => {
    return api.put<User>(`/users/${id}`, userData);
};

export const updateUserStatus = async (id: number, status: string, date?: string, description?: string): Promise<User> => {
    return api.patch<User>(`/users/${id}/status`, { status, date, description });
};

export const deleteUser = async (id: number): Promise<void> => {
    return api.delete(`/users/${id}`);
};

export const searchUsers = async (query: string): Promise<User[]> => {
    return api.get<User[]>('/users/search', { params: { query } });
};

export const createUser = async (userData: CreateUserRequest): Promise<User> => {
    return api.post<User>('/users', userData);
};

export const getUsersByRole = async (roleName: string): Promise<User[]> => {
    return api.get<User[]>(`/users/role/${roleName}`);
};

export const getFilteredLearners = async (params: {
    gradeId?: number;
    promotionId?: number;
    campusId?: number;
    classroomId?: number;
    status?: string;
    query?: string;
    page?: number;
    size?: number;
}): Promise<PageResponse<User>> => {
    return api.get<PageResponse<User>>('/users/learners/filter', { params });
};

export const getFilteredUsers = async (params: {
    role?: string;
    gradeId?: number;
    promotionId?: number;
    campusId?: number;
    status?: string;
    query?: string;
    page?: number;
    size?: number;
}): Promise<PageResponse<User>> => {
    return api.get<PageResponse<User>>('/users/filter', { params });
};
