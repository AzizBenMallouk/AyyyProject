"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProgramById, Program, Sprint, createNewVersion, archiveProgram } from "@/lib/program-api";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Loader2, Plus, Users, Calendar as CalendarIcon, BookOpen, Copy, Archive } from "lucide-react";
import SprintCalendar from "@/components/programs/SprintCalendar";
import CreateSprintDialog from "@/components/programs/CreateSprintDialog";
import ProgramActivitiesTab from "@/components/programs/ProgramActivitiesTab";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export default function ProgramDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);

    const [program, setProgram] = useState<Program | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false);
    const [editingSprint, setEditingSprint] = useState<Sprint | undefined>(undefined);

    const fetchProgram = async () => {
        setIsLoading(true);
        try {
            // We need to implement getProgramById in program-api.ts first
            // For now, consistent with existing code pattern:
            const data = await getProgramById(id);
            setProgram(data);
        } catch (error) {
            console.error("Failed to fetch program", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchProgram();
        }
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex bg-[#0a0a0f] min-h-screen text-slate-200 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!program) {
        return (
            <div className="flex bg-[#0a0a0f] min-h-screen text-slate-200 items-center justify-center flex-col gap-4">
                <h2 className="text-xl font-bold">Program not found</h2>
                <Button onClick={() => router.push('/staff/programs')}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Programs
                </Button>
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
            <div className="flex flex-col bg-[#0a0a0f] min-h-screen text-slate-200">
                {/* Header */}
                <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-white/5 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push('/staff/programs')}
                            className="hover:bg-white/10"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                                {program.title}
                                <div className="flex gap-2">
                                    <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-slate-300 font-normal">
                                        {program.speciality}
                                    </Badge>

                                    {/* Version Selector */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-6 gap-1 bg-white/5 border-white/10 text-slate-300 hover:text-white px-2">
                                                v{program.version}
                                                <ChevronDown className="h-3 w-3 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="bg-[#0a0a0f] border-white/10 text-white z-50">
                                            {program.history?.map((h) => (
                                                <DropdownMenuItem
                                                    key={h.id}
                                                    onClick={() => router.push(`/staff/programs/${h.id}`)}
                                                    className={`cursor-pointer hover:bg-white/10 flex justify-between gap-4 ${h.id === program.id ? 'bg-primary/20 text-primary' : ''}`}
                                                >
                                                    <span>v{h.version}</span>
                                                    {h.status === 'ARCHIVED' && (
                                                        <span className="text-[10px] bg-red-500/10 text-red-400 px-1 rounded">Archived</span>
                                                    )}
                                                </DropdownMenuItem>
                                            ))}
                                            {(!program.history || program.history.length === 0) && (
                                                <div className="px-2 py-1.5 text-xs text-slate-500">No other versions</div>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {program.status !== 'ARCHIVED' && (
                            <>
                                <Button
                                    onClick={async () => {
                                        if (!confirm("Create a new version of this program?")) return;
                                        setIsLoading(true);
                                        try {
                                            const newVersion = await createNewVersion(program.id);
                                            router.push(`/staff/programs/${newVersion.id}`);
                                        } catch (error) {
                                            console.error("Failed to create version", error);
                                            setIsLoading(false);
                                        }
                                    }}
                                    variant="outline"
                                    className="border-primary/50 text-primary hover:bg-primary/10"
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    New Version
                                </Button>
                                <Button
                                    onClick={async () => {
                                        if (!confirm("Are you sure you want to archive this program?")) return;
                                        setIsLoading(true);
                                        try {
                                            await archiveProgram(program.id);
                                            fetchProgram();
                                        } catch (error) {
                                            console.error("Failed to archive", error);
                                            setIsLoading(false);
                                        }
                                    }}
                                    variant="ghost"
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                    <Archive className="w-4 h-4 mr-2" />
                                    Archive
                                </Button>
                            </>
                        )}
                        <Button
                            onClick={() => {
                                setEditingSprint(undefined);
                                setIsCreateSprintOpen(true);
                            }}
                            className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Sprint
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Program Info Card */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-2">About this Program</h2>
                            <p className="text-slate-400 max-w-4xl">
                                {program.description || "No description provided."}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                        <CalendarIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-semibold">Duration</p>
                                        <p className="text-sm font-medium text-slate-200">
                                            {program.sprints?.length || 0} Sprints
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-semibold">Total Students</p>
                                        <p className="text-sm font-medium text-slate-200">
                                            {/* Placeholder */}
                                            125 Active
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-semibold">Curriculum</p>
                                        <p className="text-sm font-medium text-slate-200">
                                            {/* Placeholder */}
                                            Standard Track
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <Tabs defaultValue="sprints" className="w-full">
                            <TabsList className="bg-white/5 border border-white/10 p-1">
                                <TabsTrigger value="sprints" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                    Sprints & Calendar
                                </TabsTrigger>
                                <TabsTrigger value="calendar" className="gap-2">
                                    <CalendarIcon className="w-4 h-4" />
                                    Calendar
                                </TabsTrigger>
                                <TabsTrigger value="activities" className="gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    Activities
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="sprints" className="mt-6 border border-white/10 rounded-xl overflow-hidden bg-white/5 h-[600px]">
                                <SprintCalendar
                                    sprints={program.sprints || []}
                                    onEditSprint={(sprint) => {
                                        setEditingSprint(sprint);
                                        setIsCreateSprintOpen(true);
                                    }}
                                    onDeleteSuccess={fetchProgram}
                                />
                            </TabsContent>

                            <TabsContent value="classrooms" className="mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Placeholder Classrooms */}
                                    {['Class Brews Java', 'Angular Avengers', 'React Rebels', 'Spring Boot Squad'].map((cls, i) => (
                                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all cursor-pointer group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${i % 2 === 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                                                    }`}>
                                                    <Users className="w-5 h-5" />
                                                </div>
                                                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>
                                            </div>

                                            <h3 className="font-semibold text-lg text-white group-hover:text-primary transition-colors">{cls}</h3>
                                            <p className="text-sm text-slate-400 mt-1">24 Students • {program.title}</p>

                                            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
                                                <span>Updated 2 days ago</span>
                                                <Button variant="link" className="h-auto p-0 text-primary">View Details</Button>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="bg-white/5 border border-white/10 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-slate-400 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all cursor-pointer min-h-[180px]">
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                            <Plus className="w-6 h-6" />
                                        </div>
                                        <span className="font-medium">Add Classroom</span>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="activities" className="mt-6">
                                <ProgramActivitiesTab programId={program.id} />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {program && (
                    <CreateSprintDialog
                        isOpen={isCreateSprintOpen}
                        onClose={() => setIsCreateSprintOpen(false)}
                        onSuccess={fetchProgram}
                        programId={program.id}
                        initialData={editingSprint}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
}
