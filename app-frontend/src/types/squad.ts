export interface Squad {
    id: number;
    name: string;
    description: string;
    classroomId: number;
    sprintId?: number;
    memberIds?: number[]; // IDs of learners in squad for this sprint
    scrumMasterId?: number;
    scrumMasterName?: string;
}
