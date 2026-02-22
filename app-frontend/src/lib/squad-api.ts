import { Squad } from "@/types/squad";
import { api } from "./api-client";

export const createSquad = async (squad: Omit<Squad, 'id'>): Promise<Squad> => {
    return api.post<Squad>('/squads', squad);
};

export const getSquadsByClassroom = async (classroomId: number, sprintId?: number): Promise<Squad[]> => {
    const url = sprintId
        ? `/squads/classroom/${classroomId}?sprintId=${sprintId}`
        : `/squads/classroom/${classroomId}`;
    return api.get<Squad[]>(url);
};

export const assignLearnerToSquad = async (squadId: number, learnerId: number): Promise<void> => {
    await api.post<void>(`/squads/${squadId}/assign/${learnerId}`, {});
};

export const removeLearnerFromSquad = async (classroomId: number, learnerId: number): Promise<void> => {
    await api.delete<void>(`/squads/classroom/${classroomId}/learner/${learnerId}`);
};

export const generateSquads = async (
    classroomId: number,
    sprintId: number,
    options: {
        count: number,
        maximizeNewConnections: boolean,
        distributeGender: boolean,
        rotateScrumMaster: boolean
    }
): Promise<Squad[]> => {
    const params = new URLSearchParams({
        classroomId: classroomId.toString(),
        sprintId: sprintId.toString(),
        count: options.count.toString(),
        maximizeNewConnections: options.maximizeNewConnections.toString(),
        distributeGender: options.distributeGender.toString(),
        rotateScrumMaster: options.rotateScrumMaster.toString()
    });

    return api.post<Squad[]>(`/squads/generate?${params.toString()}`, {});
};
