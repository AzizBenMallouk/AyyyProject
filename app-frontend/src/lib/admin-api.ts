import { Campus, Promotion, Grade } from '@/types/admin';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api';

const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// Campuses
export const getAllCampuses = async (): Promise<Campus[]> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/campuses`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch campuses');
    return response.json();
};

export const createCampus = async (data: Partial<Campus>): Promise<Campus> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/campuses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create campus');
    return response.json();
};

export const updateCampus = async (id: number, data: Partial<Campus>): Promise<Campus> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/campuses/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update campus');
    return response.json();
};

export const deleteCampus = async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/campuses/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete campus');
};

// Promotions
export const getAllPromotions = async (): Promise<Promotion[]> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/promotions`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch promotions');
    return response.json();
};

export const createPromotion = async (data: Partial<Promotion>): Promise<Promotion> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/promotions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create promotion');
    return response.json();
};

// Grades
export const getAllGrades = async (): Promise<Grade[]> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/grades`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch grades');
    return response.json();
};

export const createGrade = async (data: Partial<Grade>): Promise<Grade> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/grades`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create grade');
    return response.json();
};
