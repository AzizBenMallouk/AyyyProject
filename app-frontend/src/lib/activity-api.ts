import { api } from './api-client';

export interface GlobalActivity {
    id: number;
    title: string;
    description: string;
    type: string;
    typeId: number;
    resources: string;
    durationMinutes: number;
    difficultyLevel: string;
    assignmentType: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ActivityType {
    id: number;
    name: string;
    color?: string;
}

export const getActivities = async (): Promise<GlobalActivity[]> => {
    return api.get<GlobalActivity[]>('/activities');
};

export const getActivityById = async (id: number): Promise<GlobalActivity> => {
    return api.get<GlobalActivity>(`/activities/${id}`);
};

export const createActivity = async (data: Partial<GlobalActivity>): Promise<GlobalActivity> => {
    return api.post<GlobalActivity>('/activities', data);
};

export const updateActivity = async (id: number, data: Partial<GlobalActivity>): Promise<GlobalActivity> => {
    return api.put<GlobalActivity>(`/activities/${id}`, data);
};

export const deleteActivity = async (id: number): Promise<void> => {
    return api.delete(`/activities/${id}`);
};
