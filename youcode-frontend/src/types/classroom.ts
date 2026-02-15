export interface Classroom {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    profileImage?: string;
    bootcamp?: boolean;
    speciality?: string;
    studentIds?: number[];
    gradeId?: number;
    gradeName?: string;
    trainerId?: number;
    trainerName?: string;
    campusId?: number;
    campusName?: string;
    promotionId?: number;
    promotionName?: string;
    cmeId?: number;
    cmeName?: string;
    delegateId?: number;
    delegateName?: string;
    enrolledCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface Enroll {
    id: number;
    learnerId: number;
    learnerName: string;
    learnerEmail: string;
    classroomId: number;
    classroomName: string;
    enrolledAt: string;
    active: boolean;
}

export interface AbsenceType {
    id: number;
    name: string;
    description: string;
}

export interface Absence {
    id: number;
    learnerId: number;
    learnerName: string;
    classroomId: number;
    absenceTypeId: number;
    absenceTypeName: string;
    absenceTypeColor?: string;
    date: string;
    reason: string;
    justified: boolean;
    createdAt: string;
}

export interface ActivityType {
    id: number;
    name: string;
    description: string;
    color: string;
}

export interface Activity {
    id: number;
    title: string;
    description: string;
    type: string;
    typeId: number;
    dueDate: string;
    maxPoints: number;
    classroomId: number;
    classroomName: string;
    createdAt: string;
    updatedAt: string;
}
