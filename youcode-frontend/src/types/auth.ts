export interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    campusId?: number;
}

export interface LoginResponse {
    token: string;
    id: number;
    username: string;
    email: string;
    roles: string[];
    campusId?: number;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
