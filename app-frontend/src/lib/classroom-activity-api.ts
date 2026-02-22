import { Activity, ActivityType } from "@/types/classroom";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const getActivityTypes = async (): Promise<ActivityType[]> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/classroom-activities/types`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch activity types');
    return response.json();
};

export const getActivitiesByClassroom = async (classroomId: number): Promise<Activity[]> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/classroom-activities/classroom/${classroomId}`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch activities');
    return response.json();
};

export const getActivitiesByProgram = async (programId: number, page: number = 0, size: number = 10): Promise<{ content: Activity[], totalPages: number, totalElements: number }> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/classroom-activities/program/${programId}?page=${page}&size=${size}`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch program activities');
    return response.json();
};

export const createActivity = async (data: Partial<Activity>): Promise<Activity> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/classroom-activities`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create activity');
    return response.json();
};

// Filter Interface for Action Plans
export interface ActivityFilterDTO {
    type?: string;
    classroomId?: number;
    sprintId?: number;
    campusId?: number;
    promotionId?: number;
    gradeId?: number;
    programId?: number;
    dateFrom?: string;
    dateTo?: string;
}

export const getActionPlans = async (
    page: number = 0,
    size: number = 10,
    filters: ActivityFilterDTO = {}
): Promise<{ content: Activity[], totalPages: number, totalElements: number }> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());

    if (filters.type) params.append('type', filters.type);
    if (filters.classroomId) params.append('classroomId', filters.classroomId.toString());
    if (filters.sprintId) params.append('sprintId', filters.sprintId.toString());
    if (filters.campusId) params.append('campusId', filters.campusId.toString());
    if (filters.promotionId) params.append('promotionId', filters.promotionId.toString());
    if (filters.gradeId) params.append('gradeId', filters.gradeId.toString());
    if (filters.programId) params.append('programId', filters.programId.toString());
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    const response = await fetch(`${API_URL.replace('/api', '')}/api/classroom-activities/action-plans?${params.toString()}`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch action plans');
    return response.json();
};
