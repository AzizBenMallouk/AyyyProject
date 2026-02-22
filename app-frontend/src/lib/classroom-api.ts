import { api } from './api-client';
import { Classroom, Enroll } from '@/types/classroom';

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
    programId?: number;
    trainerId?: number;
    active?: boolean;
    search?: string;
    page?: number;
    size?: number;
}): Promise<PageResponse<Classroom>> => {
    const params: any = {
        ...filters,
        // Map programId to speciality as expected by current backend implementation
        speciality: filters?.programId,
        page: filters?.page || 0,
        size: filters?.size || 10
    };

    // Remove programId from params to avoid sending both
    delete params.programId;

    return api.get<PageResponse<Classroom>>('/classrooms', { params });
};

export const getClassroomById = async (id: number): Promise<Classroom> => {
    return api.get<Classroom>(`/classrooms/${id}`);
};

export const createClassroom = async (data: Partial<Classroom>): Promise<Classroom> => {
    return api.post<Classroom>('/classrooms', data);
};

export const updateClassroom = async (id: number, data: Partial<Classroom>): Promise<Classroom> => {
    return api.put<Classroom>(`/classrooms/${id}`, data);
};

export const deleteClassroom = async (id: number): Promise<void> => {
    return api.delete(`/classrooms/${id}`);
};

export const getClassroomsByTrainer = async (trainerId: number): Promise<Classroom[]> => {
    return api.get<Classroom[]>(`/classrooms/trainer/${trainerId}`);
};

export const enrollLearner = async (classroomId: number, learnerId: number): Promise<Enroll> => {
    return api.post<Enroll>(`/classrooms/${classroomId}/enroll`, { learnerId });
};

export const removeLearner = async (classroomId: number, learnerId: number): Promise<void> => {
    return api.delete(`/classrooms/${classroomId}/enroll/${learnerId}`);
};

export const getEnrolledLearners = async (classroomId: number): Promise<Enroll[]> => {
    return api.get<Enroll[]>(`/classrooms/${classroomId}/learners`);
};
