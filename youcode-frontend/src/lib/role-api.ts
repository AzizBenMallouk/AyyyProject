import { Role } from '@/types/role';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const getAllRoles = async (): Promise<Role[]> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/roles`, {
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch roles');
    }

    return response.json();
};

export const createRole = async (roleData: Partial<Role>): Promise<Role> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/roles`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(roleData),
    });

    if (!response.ok) {
        throw new Error('Failed to create role');
    }

    return response.json();
};

export const updateRole = async (id: number, roleData: Partial<Role>): Promise<Role> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/roles/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(roleData),
    });

    if (!response.ok) {
        throw new Error('Failed to update role');
    }

    return response.json();
};

export const deleteRole = async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/roles/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to delete role');
    }
};

export const getAllPermissions = async (): Promise<string[]> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/roles/permissions`, {
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch permissions');
    }

    return response.json();
};
