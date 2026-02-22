"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getAllPrograms, Program } from "@/lib/program-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, BookOpen, Calendar, Users, Briefcase } from "lucide-react";
import Link from "next/link";

export default function ProgramManagementPage() {
    const router = useRouter();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPrograms = async () => {
        setIsLoading(true);
        try {
            const data = await getAllPrograms();
            setPrograms(data);
        } catch (error) {
            console.error("Failed to fetch programs", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPrograms();
    }, []);

    return (
        <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
            <div className="flex flex-col bg-[#0a0a0f] min-h-screen text-slate-200">
                {/* Header */}
                <div className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-white/5 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                            <BookOpen className="w-6 h-6 text-primary" />
                            Programs
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">Manage educational programs and sprints</p>
                    </div>

                    <Button
                        onClick={() => router.push('/staff/programs/create')}
                        className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Program
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 p-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-[50vh]">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : programs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                <BookOpen className="w-8 h-8 text-slate-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-white">No Programs Found</h3>
                            <p className="text-slate-400 max-w-sm">
                                Get started by creating your first educational program.
                            </p>
                            <Button
                                onClick={() => router.push('/staff/programs/create')}
                                variant="outline"
                                className="mt-4 border-primary/50 text-primary hover:bg-primary/10"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Program
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {programs.map((program) => (
                                <Link key={program.id} href={`/staff/programs/${program.id}`} className="group block h-full">
                                    <Card className="bg-white/5 border-white/10 h-full hover:bg-white/10 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 flex flex-col">
                                        <CardHeader>
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                                                    {program.speciality || 'General'}
                                                </Badge>
                                                <div className="flex gap-2">
                                                    <Badge variant="secondary" className="bg-white/10 text-slate-300">
                                                        v{program.version}
                                                    </Badge>
                                                    {program.status === 'ARCHIVED' && (
                                                        <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20">
                                                            Archived
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <CardTitle className="text-xl text-white group-hover:text-primary transition-colors line-clamp-1">
                                                {program.title}
                                            </CardTitle>
                                            <CardDescription className="line-clamp-2 text-slate-400">
                                                {program.description || 'No description provided.'}
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent className="flex-1">
                                            <div className="grid grid-cols-2 gap-4 mt-2">
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <Calendar className="w-4 h-4 text-slate-500" />
                                                    <span>{program.sprints?.length || 0} Sprints</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <Users className="w-4 h-4 text-slate-500" />
                                                    <span>24 Students</span> {/* Placeholder */}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <Briefcase className="w-4 h-4 text-slate-500" />
                                                    <span>Active</span>
                                                </div>
                                            </div>
                                        </CardContent>

                                        <CardFooter className="pt-4 border-t border-white/5 text-xs text-slate-500 flex justify-between">
                                            <span>Updated recently</span>
                                            <span className="text-primary group-hover:translate-x-1 transition-transform inline-flex items-center">
                                                View Details
                                            </span>
                                        </CardFooter>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
