import { api } from "./api-client";

export interface Campus {
    id: number;
    name: string;
    address: string;
    city: {
        id: number;
        name: string;
    };
}

export const getCampuses = async (): Promise<Campus[]> => {
    return api.get<Campus[]>('/campuses');
};

export const getCampusById = async (id: number): Promise<Campus> => {
    return api.get<Campus>(`/campuses/${id}`);
};
