import { User, UserResponse, CreateUserRequest } from '@/types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    console.log('Token used for request:', token); // Debugging
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const getAllUsers = async (page = 0, size = 10): Promise<UserResponse> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/users?page=${page}&size=${size}`, {
        headers: getHeaders(),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch users:', response.status, response.statusText, errorText);
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
    }

    return response.json();
};

export const updateUser = async (id: number, userData: Partial<User>): Promise<User> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        throw new Error('Failed to update user');
    }

    return response.json();
    return response.json();
};

export const updateUserStatus = async (id: number, status: string, date?: string, description?: string): Promise<User> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/users/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status, date, description }),
    });

    if (!response.ok) {
        throw new Error('Failed to update user status');
    }

    return response.json();
};

export const deleteUser = async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to delete user');
    }
};

export const searchUsers = async (query: string): Promise<User[]> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/users/search?query=${query}`, {
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to search users');
    }

    return response.json();
};

export const createUser = async (userData: CreateUserRequest): Promise<User> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create user: ${errorText}`);
    }

    return response.json();
};

export const getUsersByRole = async (roleName: string): Promise<User[]> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/users/role/${roleName}`, {
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch users by role: ${roleName}`);
    }

    return response.json();
};

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
    const queryParams = new URLSearchParams();
    if (params.gradeId) queryParams.append('gradeId', params.gradeId.toString());
    if (params.promotionId) queryParams.append('promotionId', params.promotionId.toString());
    if (params.campusId) queryParams.append('campusId', params.campusId.toString());
    if (params.classroomId) queryParams.append('classroomId', params.classroomId.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.query) queryParams.append('query', params.query);
    queryParams.append('page', (params.page || 0).toString());
    queryParams.append('size', (params.size || 10).toString());

    const response = await fetch(`${API_URL.replace('/api', '')}/api/users/learners/filter?${queryParams.toString()}`, {
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to filter learners');
    }

    return response.json();
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
    const queryParams = new URLSearchParams();
    if (params.role) queryParams.append('role', params.role);
    if (params.gradeId) queryParams.append('gradeId', params.gradeId.toString());
    if (params.promotionId) queryParams.append('promotionId', params.promotionId.toString());
    if (params.campusId) queryParams.append('campusId', params.campusId.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.query) queryParams.append('query', params.query);
    queryParams.append('page', (params.page || 0).toString());
    queryParams.append('size', (params.size || 10).toString());

    const response = await fetch(`${API_URL.replace('/api', '')}/api/users/filter?${queryParams.toString()}`, {
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to filter users');
    }

    return response.json();
};
