"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Globe, MapPin, Mail, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SocialLink {
    icon: React.ElementType;
    href: string;
    label: string;
}

interface ProfileHeaderProps {
    user: {
        name: string;
        role: "student" | "staff" | "admin";
        specialty: string;
        avatar: string; // Initials or URL
        location?: string;
        email: string;
        currentClassroom?: string;
        socials?: SocialLink[];
        xp?: number;
        level?: number;
        achievements?: number;
    };
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
    const roleColors = {
        student: "from-blue-500 to-cyan-500 ring-blue-500/50",
        staff: "from-violet-500 to-purple-500 ring-violet-500/50",
        admin: "from-pink-500 to-rose-500 ring-pink-500/50",
    };

    return (
        <div className="relative mb-16">
            {/* Banner Background */}
            <div className="h-48 w-full rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 overflow-hidden relative">
                <div className={cn("absolute inset-0 opacity-20 bg-gradient-to-br animate-pulse", roleColors[user.role])} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            </div>

            {/* Profile Info Card */}
            <div className="absolute top-10 left-0 right-0 px-6">
                <Card className="border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">

                            {/* Avatar */}
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative -mt-16"
                            >
                                <div className={cn(
                                    "h-32 w-32 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-2xl ring-4 bg-gradient-to-br",
                                    roleColors[user.role]
                                )}>
                                    {user.avatar}
                                </div>
                                <div className="absolute bottom-2 right-2 h-4 w-4 bg-green-500 rounded-full border-2 border-black ring-2 ring-green-500/30 animate-pulse" />
                            </motion.div>

                            {/* User Details */}
                            <div className="flex-1 space-y-2 mb-2">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-3xl font-bold text-white tracking-tight">{user.name}</h1>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border bg-white/5",
                                        user.role === 'staff' ? "border-violet-500/30 text-violet-300" : "border-blue-500/30 text-blue-300"
                                    )}>
                                        {user.role}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs font-medium border border-white/10 bg-white/5 text-muted-foreground">
                                        {user.specialty}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <School className="h-4 w-4" />
                                        {user.currentClassroom || "No active classroom"}
                                    </div>
                                    {user.location && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4" />
                                            {user.location}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                        <Mail className="h-4 w-4" />
                                        {user.email}
                                    </div>
                                </div>
                            </div>

                            {/* Stats for Student */}
                            {user.role === 'student' && (
                                <div className="flex gap-4 md:ml-auto md:mr-6 my-4 md:my-0">
                                    <div className="text-center px-4 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                                        <div className="text-2xl font-bold text-yellow-400">{user.xp?.toLocaleString() || 0}</div>
                                        <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">XP Earned</div>
                                    </div>
                                    <div className="text-center px-4 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                                        <div className="text-2xl font-bold text-blue-400">{user.achievements || 0}</div>
                                        <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Achievements</div>
                                    </div>
                                </div>
                            )}

                            {/* Actions & Socials */}
                            <div className="flex items-center gap-3 mb-2">
                                {user.socials?.map((social, idx) => (
                                    <Button
                                        key={idx}
                                        size="icon"
                                        variant="ghost"
                                        className="rounded-full hover:bg-white/10 text-muted-foreground hover:text-white"
                                        asChild
                                    >
                                        <a href={social.href} target="_blank" rel="noreferrer">
                                            <social.icon className="h-5 w-5" />
                                        </a>
                                    </Button>
                                ))}
                                <Button className={cn("ml-2 font-semibold shadow-lg",
                                    user.role === 'staff' ? "bg-violet-600 hover:bg-violet-700 shadow-violet-500/20" : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                                )}>
                                    Edit Profile
                                </Button>
                            </div>

                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
