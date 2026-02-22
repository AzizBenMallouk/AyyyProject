import { Absence, AbsenceType } from "@/types/classroom";
import { api } from "./api-client";

export const getAbsenceTypes = async (): Promise<AbsenceType[]> => {
    return api.get<AbsenceType[]>('/absences/types');
};

export const getAbsencesByClassroom = async (classroomId: number): Promise<Absence[]> => {
    return api.get<Absence[]>(`/absences/classroom/${classroomId}`);
};

export const createAbsence = async (data: Partial<Absence>): Promise<Absence> => {
    return api.post<Absence>('/absences', data);
};
