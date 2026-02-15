import { Classroom, Enroll } from '@/types/classroom';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
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

export const getAllClassrooms = async (filters?: {
    campusId?: number;
    promotionId?: number;
    gradeId?: number;
    speciality?: string;
    trainerId?: number;
    active?: boolean;
    page?: number;
    size?: number;
}): Promise<PageResponse<Classroom>> => {
    const queryParams = new URLSearchParams();
    if (filters) {
        if (filters.campusId) queryParams.append('campusId', filters.campusId.toString());
        if (filters.promotionId) queryParams.append('promotionId', filters.promotionId.toString());
        if (filters.gradeId) queryParams.append('gradeId', filters.gradeId.toString());
        if (filters.speciality) queryParams.append('speciality', filters.speciality);
        if (filters.trainerId) queryParams.append('trainerId', filters.trainerId.toString());
        if (filters.active !== undefined) queryParams.append('active', filters.active.toString());
        queryParams.append('page', (filters.page || 0).toString());
        queryParams.append('size', (filters.size || 10).toString());
    } else {
        queryParams.append('page', "0");
        queryParams.append('size', "10");
    }

    const response = await fetch(`${API_URL.replace('/api', '')}/api/classrooms?${queryParams.toString()}`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch classrooms');
    return response.json();
};

export const getClassroomById = async (id: number): Promise<Classroom> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/classrooms/${id}`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch classroom');
    return response.json();
};

export const createClassroom = async (data: Partial<Classroom>): Promise<Classroom> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/classrooms`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create classroom');
    return response.json();
};

export const updateClassroom = async (id: number, data: Partial<Classroom>): Promise<Classroom> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/classrooms/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update classroom');
    return response.json();
};

export const deleteClassroom = async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/classrooms/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete classroom');
};

export const getClassroomsByTrainer = async (trainerId: number): Promise<Classroom[]> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/classrooms/trainer/${trainerId}`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch trainer classrooms');
    return response.json();
};

export const enrollLearner = async (classroomId: number, learnerId: number): Promise<Enroll> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/classrooms/${classroomId}/enroll`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ learnerId }),
    });
    if (!response.ok) throw new Error('Failed to enroll learner');
    return response.json();
};

export const removeLearner = async (classroomId: number, learnerId: number): Promise<void> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/classrooms/${classroomId}/enroll/${learnerId}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to remove learner');
};

export const getEnrolledLearners = async (classroomId: number): Promise<Enroll[]> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/classrooms/${classroomId}/learners`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch enrolled learners');
    return response.json();
};
