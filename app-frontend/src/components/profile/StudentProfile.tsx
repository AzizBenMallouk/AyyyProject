"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { BookOpen, Trophy, Clock, Target, Calendar, AlertCircle, CheckCircle2, ArrowLeft, BrainCircuit, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getUser } from "@/lib/user-api";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";

interface StudentProfileProps {
    studentId: number;
}

import { StudentInterview } from "@/lib/interview-api";

export function StudentProfile({ studentId }: StudentProfileProps) {
    const [student, setStudent] = useState<User | null>(null);
    const [interviews, setInterviews] = useState<StudentInterview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const [userData, interviewData] = await Promise.all([
                    getUser(studentId),
                    import("@/lib/interview-api").then(mod => mod.getStudentInterviews(studentId))
                ]);
                setStudent(userData);
                setInterviews(interviewData);
            } catch (error) {
                console.error("Failed to fetch student profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [studentId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
                <p>Student not found</p>
                <Button variant="link" onClick={() => window.history.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="mt-8 animate-in fade-in duration-500">
            {/* Back Button and Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.history.back()}
                    className="rounded-full hover:bg-white/10"
                >
                    <ArrowLeft className="w-5 h-5 text-white" />
                </Button>

                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white ring-4 ring-black/20">
                    {student.firstName?.[0]}{student.lastName?.[0]}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">{student.firstName} {student.lastName}</h1>
                    <div className="flex items-center gap-2 text-gray-400">
                        <span className="bg-white/10 px-2 py-0.5 rounded text-xs font-medium text-gray-300 border border-white/5">
                            {student.roleNames?.[0] || 'STUDENT'}
                        </span>
                        <span>•</span>
                        <span>{student.email}</span>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="classroom" className="space-y-6">
                <div className="flex ">
                    <TabsList className="bg-white/5 border border-white/10 p-1 rounded-full backdrop-blur-md">
                        <TabsTrigger value="classroom" className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                            Classroom
                        </TabsTrigger>
                        <TabsTrigger value="assignments" className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                            Assignments
                        </TabsTrigger>
                        <TabsTrigger value="absence" className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                            Absence
                        </TabsTrigger>
                        <TabsTrigger value="soft-skills" className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                            Soft Skills
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Classroom Tab */}
                <TabsContent value="classroom" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-gradient-to-br from-violet-900/20 to-blue-900/20 border-white/10 backdrop-blur-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-32 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-blue-400" />
                                    Current Classroom
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 relative z-10">
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                    <h3 className="text-2xl font-bold text-white mb-1">{student.currentClassroomName || "Not Enrolled"}</h3>
                                    <p className="text-blue-300">
                                        {student.campusName ? `${student.campusName} Campus` : 'No Campus'}
                                        {student.promotionName ? ` • ${student.promotionName}` : ''}
                                    </p>

                                    {student.currentClassroomId && (
                                        <div className="mt-6 flex flex-wrap gap-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-300 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                Active Session
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-300 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                                                <Clock className="w-4 h-4 text-violet-400" />
                                                Full Time
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Instructor</h4>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/10">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white">SC</div>
                                        <div>
                                            <div className="font-medium text-white">Sarah Connor</div>
                                            <div className="text-xs text-gray-400">Lead Instructor</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                    Gamification Stats
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Level 12 Progress</span>
                                        <span className="text-white font-mono">12,450 / 15,000 XP</span>
                                    </div>
                                    <Progress value={83} className="h-3" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                                        <div className="text-3xl font-bold text-white mb-1">45</div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider">Day Streak</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                                        <div className="text-3xl font-bold text-white mb-1">12</div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider">Badges</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Assignments Tab */}
                <TabsContent value="assignments" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Target className="h-5 w-5 text-rose-500" />
                                Assignments & Projects
                            </CardTitle>
                            <CardDescription>Track pending and completed tasks</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { title: "React Component Library", status: "Completed", grade: "A", date: "2 days ago", type: "Project" },
                                    { title: "API Integration Test", status: "Pending", grade: "-", date: "Due tomorrow", type: "Quiz" },
                                    { title: "Database Schema Design", status: "Graded", grade: "B+", date: "1 week ago", type: "Assignment" },
                                    { title: "Advanced CSS Layouts", status: "Completed", grade: "A-", date: "2 weeks ago", type: "Project" },
                                ].map((assignment, i) => (
                                    <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className={cn(
                                                "p-2 rounded-lg",
                                                assignment.status === 'Pending' ? "bg-yellow-500/10 text-yellow-500" : "bg-green-500/10 text-green-500"
                                            )}>
                                                {assignment.status === 'Pending' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-white text-lg">{assignment.title}</h4>
                                                <div className="flex gap-3 text-xs text-gray-400 mt-1">
                                                    <span className="bg-white/10 px-2 py-0.5 rounded text-gray-300">{assignment.type}</span>
                                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {assignment.date}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 md:text-right pl-11 md:pl-0">
                                            <div className="flex flex-col items-end min-w-[80px]">
                                                <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Grade</span>
                                                <span className="text-xl font-bold text-white">{assignment.grade}</span>
                                            </div>
                                            <div className={cn(
                                                "px-3 py-1 rounded-full text-xs font-bold",
                                                assignment.status === 'Pending' ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"
                                            )}>
                                                {assignment.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Absence Tab */}
                <TabsContent value="absence" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-1 bg-white/5 border-white/10 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-pink-500" />
                                    Attendance Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center py-8">
                                <div className="relative h-48 w-48 flex items-center justify-center">
                                    <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 100 100">
                                        <circle className="stroke-white/5 fill-none" cx="50" cy="50" r="45" strokeWidth="8" />
                                        <motion.circle
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 0.92 }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className="stroke-green-500 fill-none"
                                            cx="50" cy="50" r="45" strokeWidth="8"
                                            strokeDasharray="283"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-5xl font-bold text-white">92%</span>
                                        <span className="text-sm text-gray-400 mt-1">Attendance Rate</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-8 mt-8 w-full">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">3</div>
                                        <div className="text-xs text-red-400 font-medium">Absences</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">42</div>
                                        <div className="text-xs text-green-400 font-medium">Present Days</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2 bg-white/5 border-white/10 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-white">Absence History</CardTitle>
                                <CardDescription>Detailed log of absences</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { date: "Feb 10, 2026", type: "Unexcused", reason: "No reason provided", status: "Pending" },
                                        { date: "Jan 24, 2026", type: "Excused", reason: "Medical Appointment", status: "Approved" },
                                        { date: "Jan 12, 2026", type: "Late", reason: "Transport Issue", status: "Approved" },
                                    ].map((record, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "h-10 w-10 rounded-full flex items-center justify-center font-bold",
                                                    record.type === 'Unexcused' ? "bg-red-500/20 text-red-500" :
                                                        record.type === 'Excused' ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"
                                                )}>
                                                    {record.type[0]}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{record.date}</div>
                                                    <div className="text-sm text-gray-400">{record.reason}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={cn(
                                                    "text-xs font-bold px-2 py-1 rounded-full inline-block mb-1",
                                                    record.type === 'Unexcused' ? "bg-red-500/10 text-red-400" : "bg-white/10 text-gray-300"
                                                )}>
                                                    {record.type}
                                                </div>
                                                <div className="text-xs text-gray-500">{record.status}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Soft Skills Tab */}
                <TabsContent value="soft-skills" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <BrainCircuit className="h-5 w-5 text-purple-400" />
                                    Soft Skills & Interview History
                                </CardTitle>
                                <CardDescription>Evaluations from position interviews</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {interviews.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <p>No interview history found for this student.</p>
                                        <p className="text-sm mt-2">Interviews will appear here once scheduled by CME.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {interviews.map((interview) => (
                                            <div key={interview.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-white">{interview.positionTitle}</h3>
                                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(interview.interviewDate).toLocaleDateString()}
                                                            <span className={cn(
                                                                "ml-2 px-2 py-0.5 rounded-full text-xs font-bold",
                                                                interview.status === 'COMPLETED' ? "bg-green-500/20 text-green-400" :
                                                                    interview.status === 'SCHEDULED' ? "bg-blue-500/20 text-blue-400" :
                                                                        "bg-white/10 text-gray-400"
                                                            )}>
                                                                {interview.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {interview.status === 'COMPLETED' && interview.evaluations.length > 0 ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {interview.evaluations.map((evalItem) => (
                                                            <div key={evalItem.id} className="p-3 rounded-lg bg-black/20 border border-white/5">
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <span className="text-sm font-medium text-gray-300">{evalItem.softSkillName}</span>
                                                                    <span className="text-xs font-bold text-primary">{evalItem.score}/5</span>
                                                                </div>
                                                                <Progress value={(evalItem.score / 5) * 100} className="h-1.5" />
                                                                {evalItem.comment && (
                                                                    <p className="text-xs text-gray-500 mt-2 italic">"{evalItem.comment}"</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500 italic">No evaluations recorded yet.</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
