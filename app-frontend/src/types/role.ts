export interface Role {
    id: number;
    name: string;
    description: string;
    roleType: 'ADMINISTRATIVE' | 'STAFF' | 'LEARNER';
    permissions: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface Permission {
    name: string; // Since permissions are just strings from backend for now
}
