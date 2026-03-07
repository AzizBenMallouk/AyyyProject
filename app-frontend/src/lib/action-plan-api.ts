import { Activity, ActivityComment } from "@/types/classroom";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const getActionPlansByClassroom = async (classroomId: number): Promise<Activity[]> => {
    const res = await fetch(`${API_URL}/activities/classroom/${classroomId}`, {
        headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch action plans');
    const activities = await res.json();
    return activities.filter((a: Activity) => a.type === 'ACTION_PLAN');
};

export const getCommentsByAssignment = async (assignmentId: number): Promise<ActivityComment[]> => {
    const res = await fetch(`${API_URL}/comments/assignment/${assignmentId}`, {
        headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch comments');
    return res.json();
};

export const addComment = async (comment: { assignmentId: number; userId: number; content: string }): Promise<ActivityComment> => {
    const res = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(comment)
    });
    if (!res.ok) throw new Error('Failed to add comment');
    return res.json();
};
