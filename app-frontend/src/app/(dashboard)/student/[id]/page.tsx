"use client";

import { use, useEffect, useState } from "react";
import { StudentProfile } from "@/components/profile/StudentProfile";
import { getUser } from "@/lib/user-api"; // Assuming we have this or need to create it
import { User } from "@/types/user";

export default function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [student, setStudent] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudent = async () => {
            // In a real app we'd fetch specific student data here.
            // For now we'll pass the ID to the component which handles fetching
            // or we fetch basic user info here to pass down.
            // Let's defer fetching to the component for now or pass ID.
            setLoading(false);
        };
        fetchStudent();
    }, [resolvedParams.id]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Student Profile</h1>
            <StudentProfile studentId={parseInt(resolvedParams.id)} />
        </div>
    );
}
