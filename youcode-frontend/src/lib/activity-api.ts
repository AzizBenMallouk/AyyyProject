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
    const response = await fetch(`${API_URL.replace('/api', '')}/api/activities/types`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch activity types');
    return response.json();
};

export const getActivitiesByClassroom = async (classroomId: number): Promise<Activity[]> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/activities/classroom/${classroomId}`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch activities');
    return response.json();
};

export const createActivity = async (data: Partial<Activity>): Promise<Activity> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/activities`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create activity');
    return response.json();
};
