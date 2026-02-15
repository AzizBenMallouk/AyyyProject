import { Absence, AbsenceType } from "@/types/classroom";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const getAbsenceTypes = async (): Promise<AbsenceType[]> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/absences/types`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch absence types');
    return response.json();
};

export const getAbsencesByClassroom = async (classroomId: number): Promise<Absence[]> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/absences/classroom/${classroomId}`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch absences');
    return response.json();
};

export const createAbsence = async (data: Partial<Absence>): Promise<Absence> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/absences`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create absence');
    return response.json();
};
