import { api } from './api-client';

export interface Program {
    id: number;
    title: string;
    description: string;
    speciality: string;
    groupId: string;
    version: number;
    status: 'ACTIVE' | 'ARCHIVED';
    parentId?: number;
    history?: Partial<Program>[];
    sprints: Sprint[];
}

export interface Sprint {
    id: number;
    title: string;
    objective: string;
    description: string;
    startDate: string;
    endDate: string;
    technologies?: string;
    programId: number;
}

// Program API

export const getAllPrograms = async (): Promise<Program[]> => {
    return api.get<Program[]>('/programs');
};

export const getProgramById = async (id: number): Promise<Program> => {
    return api.get<Program>(`/programs/${id}`);
};

export const createProgram = async (program: Omit<Program, 'id' | 'version' | 'status' | 'sprints'> & { sprints?: Partial<Sprint>[] }): Promise<Program> => {
    return api.post<Program>('/programs', program);
};

export const createNewVersion = async (programId: number): Promise<Program> => {
    return api.post<Program>(`/programs/${programId}/version`, {});
};

export const archiveProgram = async (programId: number): Promise<void> => {
    return api.patch(`/programs/${programId}/archive`, {});
};

export const updateProgram = async (id: number, program: Partial<Program>): Promise<Program> => {
    return api.put<Program>(`/programs/${id}`, program);
};

export const deleteProgram = async (id: number): Promise<void> => {
    return api.delete(`/programs/${id}`);
};

// Sprint API

export const createSprint = async (sprint: Omit<Sprint, 'id'>): Promise<Sprint> => {
    return api.post<Sprint>('/sprints', sprint);
};

export const updateSprint = async (id: number, sprint: Partial<Sprint>): Promise<Sprint> => {
    return api.put<Sprint>(`/sprints/${id}`, sprint);
};

export const deleteSprint = async (id: number): Promise<void> => {
    return api.delete(`/sprints/${id}`);
};

export const getSprintsByProgram = async (programId: number): Promise<Sprint[]> => {
    return api.get<Sprint[]>(`/programs/${programId}/sprints`);
};
