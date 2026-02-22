import { Role } from '@/types/role';
import { api } from "./api-client";

export const getAllRoles = async (): Promise<Role[]> => {
    return api.get<Role[]>('/roles');
};

export const createRole = async (roleData: Partial<Role>): Promise<Role> => {
    return api.post<Role>('/roles', roleData);
};

export const updateRole = async (id: number, roleData: Partial<Role>): Promise<Role> => {
    return api.put<Role>(`/roles/${id}`, roleData);
};

export const deleteRole = async (id: number): Promise<void> => {
    await api.delete<void>(`/roles/${id}`);
};

export const getAllPermissions = async (): Promise<string[]> => {
    return api.get<string[]>('/roles/permissions');
};
