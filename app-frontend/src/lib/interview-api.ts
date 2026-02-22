import { api } from "./api-client";

export interface InterviewPosition {
    id: number;
    title: string;
    description: string;
    createdAt: string;
}

export interface StudentInterview {
    id: number;
    studentId: number;
    studentName: string;
    positionId: number;
    positionTitle: string;
    interviewDate: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
    globalComment?: string;
    evaluations: SoftSkillEvaluation[];
}

export interface SoftSkillEvaluation {
    id: number;
    softSkillId: number;
    softSkillName: string;
    score: number;
    comment: string;
}

export const getAllPositions = async (): Promise<InterviewPosition[]> => {
    return api.get<InterviewPosition[]>('/interviews/positions');
};

export const getAllInterviews = async (): Promise<StudentInterview[]> => {
    return api.get<StudentInterview[]>('/interviews/all');
};

export const createPosition = async (data: { title: string; description: string }): Promise<InterviewPosition> => {
    return api.post<InterviewPosition>('/interviews/positions', data);
};

export const getStudentInterviews = async (studentId: number): Promise<StudentInterview[]> => {
    return api.get<StudentInterview[]>(`/interviews/student/${studentId}`);
};

export const scheduleInterview = async (studentId: number, positionId: number, date: string): Promise<StudentInterview> => {
    return api.post<StudentInterview>(`/interviews/schedule?studentId=${studentId}&positionId=${positionId}&date=${date}`, {});
};

export const addEvaluation = async (interviewId: number, data: { softSkillId: number; score: number; comment: string }): Promise<void> => {
    await api.post<void>(`/interviews/${interviewId}/evaluate`, data);
};
