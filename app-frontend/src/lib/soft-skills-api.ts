import { api } from "./api-client";

export interface SoftSkill {
    id: number;
    name: string;
    description: string;
}

export const getAllSoftSkills = async (): Promise<SoftSkill[]> => {
    return api.get<SoftSkill[]>('/soft-skills');
};

export const createSoftSkill = async (data: { name: string; description: string }): Promise<SoftSkill> => {
    return api.post<SoftSkill>('/soft-skills', data);
};

export const deleteSoftSkill = async (id: number): Promise<void> => {
    await api.delete<void>(`/soft-skills/${id}`);
};
