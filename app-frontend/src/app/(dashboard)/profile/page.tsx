"use client";

import { useState } from "react";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { StudentProfile } from "@/components/profile/StudentProfile";
import { StaffProfile } from "@/components/profile/StaffProfile";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Github, Linkedin, Globe } from "lucide-react";

// Mock User Data
const studentUser = {
    name: "Alex Johnson",
    role: "student" as const, // Explicit type assertion
    specialty: "Frontend Developer",
    avatar: "AJ",
    location: "Casablanca, Morocco",
    email: "alex.j@youcode.ma",
    currentClassroom: "Fullstack JS Bootcamp",
    socials: [
        { icon: Github, href: "#", label: "Github" },
        { icon: Linkedin, href: "#", label: "LinkedIn" },
        { icon: Globe, href: "#", label: "Portfolio" },
    ],
    xp: 12450,
    level: 12,
    achievements: 15
};

const staffUser = {
    name: "Sarah Connor",
    role: "staff" as const, // Explicit type assertion 
    specialty: "Lead Instructor",
    avatar: "SC",
    location: "Rabat, Morocco",
    email: "sarah.c@youcode.ma",
    currentClassroom: "Fullstack JS Bootcamp",
    socials: [
        { icon: Linkedin, href: "#", label: "LinkedIn" },
        { icon: Github, href: "#", label: "Github" },
    ]
};

export default function ProfilePage() {
    const [isAdminView, setIsAdminView] = useState(false);

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Dev Toggle for demo purposes */}
            <div className="fixed bottom-4 right-4 z-50 p-4 rounded-xl bg-black/80 border border-white/10 backdrop-blur-md flex items-center gap-3 shadow-2xl">
                <Label htmlFor="role-mode" className="text-xs text-muted-foreground font-mono">
                    VIEW AS: {isAdminView ? "STAFF" : "STUDENT"}
                </Label>
                <Switch
                    id="role-mode"
                    checked={isAdminView}
                    onCheckedChange={setIsAdminView}
                />
            </div>

            <ProfileHeader user={isAdminView ? staffUser : studentUser} />

            {isAdminView ? <StaffProfile /> : <StudentProfile />}
        </div>
    );
}
