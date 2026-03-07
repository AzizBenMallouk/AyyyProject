export interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    cin?: string;
    campusName?: string;
    campusId?: number;
    promotionName?: string;
    promotionId?: number;
    gradeName?: string;
    gradeId?: number;
    currentClassroomName?: string;
    currentClassroomId?: number;
    statusName?: string;
    statusId?: number;
    roleNames: string[];
    profileImage?: string;
    address?: string;
    birthDate?: string;
    gender?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    roleNames: string[];
    campusId?: number;
    promotionId?: number;
    gradeId?: number;
    phone?: string;
    address?: string;
    birthDate?: string;
    cin?: string;
    gender?: string;
}

export interface UserResponse {
    content: User[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}
