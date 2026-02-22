"use client";

import { useEffect, useState, use } from "react";
import { Classroom, Absence, AbsenceType, Activity, ActivityType, Enroll } from "@/types/classroom";
import { Campus, Promotion, Grade } from "@/types/admin";
import { getClassroomById, getEnrolledLearners } from "@/lib/classroom-api";
import { getAllCampuses, getAllPromotions, getAllGrades } from "@/lib/admin-api";
import { getAbsenceTypes, getAbsencesByClassroom } from "@/lib/absence-api";
import { getActivityTypes, getActivitiesByClassroom } from "@/lib/classroom-activity-api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentDataTable from "@/components/classrooms/StudentDataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Users, MapPin, GraduationCap, Edit, User as UserIcon, Shield, Plus, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AbsenceCalendar from "@/components/classrooms/AbsenceCalendar";
import SquadsTab from "@/components/classrooms/SquadsTab";
import MarkAbsenceDialog from "@/components/classrooms/MarkAbsenceDialog";
import ClassroomActivities from "@/components/classrooms/ClassroomActivities";
import ActionPlansTab from "@/components/classrooms/ActionPlansTab";

export default function ClassroomDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [loading, setLoading] = useState(true);

    // For StudentDataTable (Props still required by component interface)
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);

    // Absences & Activities
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
    const [enrolledLearners, setEnrolledLearners] = useState<Enroll[]>([]);

    // Calculate Stats
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysAbsencesCount = absences.filter(a => a.date === todayStr).length;
    const activeStudentsCount = enrolledLearners.filter(l => l.active).length;
    const totalStudentsCount = enrolledLearners.length;

    const fetchData = async () => {
        try {
            const cid = parseInt(id);
            const [c, p, g, data, abs, absTypes, acts, actTypes, learners] = await Promise.all([
                getAllCampuses(),
                getAllPromotions(),
                getAllGrades(),
                getClassroomById(cid),
                getAbsencesByClassroom(cid),
                getAbsenceTypes(),
                getActivitiesByClassroom(cid),
                getActivityTypes(),
                getEnrolledLearners(cid)
            ]);
            setCampuses(c);
            setPromotions(p);
            setGrades(g);
            setClassroom(data);
            setAbsences(abs);
            setAbsenceTypes(absTypes);
            setActivities(acts);
            setActivityTypes(actTypes);
            setEnrolledLearners(learners);
        } catch (error) {
            console.error("Failed to fetch classroom data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const getActivityColor = (typeName: string) => {
        const type = activityTypes.find(t => t.name === typeName);
        return type?.color || '#64748b';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!classroom) {
        return <div className="p-8 text-center text-muted-foreground">Classroom not found</div>;
    }

    return (
        <ProtectedRoute allowedRoles={['STAFF', 'TRAINER', 'ADMIN', 'CME']}>
            <div className="p-8 space-y-8 min-h-screen text-slate-200">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{classroom.name}</h1>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-primary" />
                                {classroom.campusName}
                            </span>
                            <span className="flex items-center gap-1">
                                <GraduationCap className="w-4 h-4 text-primary" />
                                {classroom.promotionName}
                            </span>
                            <span className="flex items-center gap-1">
                                <Shield className="w-4 h-4 text-primary" />
                                {classroom.gradeName}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/staff/classrooms/${id}/edit`}>
                            <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Classroom
                            </Button>
                        </Link>
                        <Button variant="outline" className="bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10 hidden md:flex">
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule
                        </Button>
                        <MarkAbsenceDialog
                            enrolledLearners={enrolledLearners}
                            absenceTypes={absenceTypes}
                            onSuccess={fetchData}
                        >
                            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
                                <Plus className="w-4 h-4 mr-2" />
                                Mark Absence
                            </Button>
                        </MarkAbsenceDialog>
                    </div>
                </div>

                <Tabs defaultValue="resume" className="space-y-6">
                    <TabsList className="bg-white/5 border border-white/10 p-1">
                        <TabsTrigger value="resume" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Resume</TabsTrigger>
                        <TabsTrigger value="students" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Enrolled Students</TabsTrigger>
                        <TabsTrigger value="absence" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Absence</TabsTrigger>
                        <TabsTrigger value="squads" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Squads</TabsTrigger>
                        <TabsTrigger value="activities" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Activities</TabsTrigger>
                        <TabsTrigger value="action-plans" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Plan d'Action</TabsTrigger>
                    </TabsList>

                    <TabsContent value="resume" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            {/* LEFT COLUMN (30%) */}
                            <div className="md:col-span-4 space-y-6">
                                {/* Info Card */}
                                <Card className="bg-black/40 border-white/10 backdrop-blur-xl overflow-hidden">
                                    <div className="h-32 bg-gradient-to-br from-primary/20 via-black/40 to-secondary/20 relative">
                                        {classroom.profileImage && (
                                            <img
                                                src={classroom.profileImage}
                                                alt={classroom.name}
                                                className="w-full h-full object-cover opacity-60"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-black/40" />
                                        <div className="absolute bottom-4 left-4">
                                            <h2 className="text-xl font-bold text-white shadow-sm">{classroom.name}</h2>
                                        </div>
                                    </div>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-sm">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                <span className="text-slate-200">{classroom.campusName}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <GraduationCap className="w-4 h-4 text-primary" />
                                                <span className="text-slate-200">{classroom.promotionName}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">

                                                {classroom.bootcamp && (
                                                    <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-semibold">
                                                        Bootcamp
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-white/10">
                                            <h3 className="text-xs uppercase font-bold text-muted-foreground mb-3">Staff</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                                                        <UserIcon className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-muted-foreground">Trainer</div>
                                                        <div className="text-sm font-medium text-white">{classroom.trainerName || 'Unassigned'}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                                                        <UserIcon className="w-4 h-4 text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-muted-foreground">CME</div>
                                                        <div className="text-sm font-medium text-white">{classroom.cmeName || 'Unassigned'}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                                                        <UserIcon className="w-4 h-4 text-yellow-400" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-muted-foreground">Class Delegate</div>
                                                        <div className="text-sm font-medium text-white">{classroom.delegateName || 'Unassigned'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* RIGHT COLUMN (70%) */}
                            <div className="md:col-span-8 space-y-6">

                                {/* Quick Stats Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground uppercase">Active/Total Students</p>
                                                <h4 className="text-2xl font-bold text-white">{activeStudentsCount}/{totalStudentsCount}</h4>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                                <Users className="w-5 h-5 text-blue-400" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground uppercase">Today's Absences</p>
                                                <h4 className="text-2xl font-bold text-white">{todaysAbsencesCount}</h4>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                                <AlertCircle className="w-5 h-5 text-red-400" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Student of the Month */}
                                    <Card className="bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20 backdrop-blur-xl relative overflow-hidden group">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2 text-yellow-400">
                                                <span className="text-2xl">🏆</span>
                                                Student of the Month
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center text-2xl">
                                                    ?
                                                </div>
                                                <div>
                                                    <div className="text-xl font-bold text-white mb-1">Coming Soon</div>
                                                    <div className="text-xs text-yellow-500/80 uppercase tracking-widest">Top Performer</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Current Sprint */}
                                    <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20 backdrop-blur-xl relative overflow-hidden group">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2 text-purple-400">
                                                <span className="text-2xl">🚀</span>
                                                Current Sprint
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {classroom.currentSprint ? (
                                                <div className="space-y-4">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white mb-1">{classroom.currentSprint.title}</h3>
                                                        <p className="text-xs text-muted-foreground line-clamp-2">{classroom.currentSprint.objective}</p>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <Calendar className="w-3 h-3 text-purple-400" />
                                                            <span>{classroom.currentSprint.startDate} - {classroom.currentSprint.endDate}</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {classroom.currentSprint.technologies ? (
                                                                classroom.currentSprint.technologies.split(',').map((tech, i) => (
                                                                    <span key={i} className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] border border-purple-500/30">
                                                                        {tech.trim()}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-[10px] text-muted-foreground/50">No stack defined</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-muted-foreground text-sm flex flex-col items-center gap-2">
                                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                                        <Clock className="w-4 h-4 opacity-50" />
                                                    </div>
                                                    No active sprint right now.
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Current Activity */}
                                    <Card className="bg-black/40 border-white/10 col-span-2 backdrop-blur-xl">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <span className="text-2xl">⚡</span>
                                                Current Activity
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {activities.length > 0 ? (
                                                <div>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-lg font-bold text-white line-clamp-1">{activities[activities.length - 1].title}</h3>
                                                        <span
                                                            className="text-[10px] px-2 py-0.5 rounded border"
                                                            style={{
                                                                color: getActivityColor(activities[activities.length - 1].type),
                                                                borderColor: getActivityColor(activities[activities.length - 1].type) + '40',
                                                                backgroundColor: getActivityColor(activities[activities.length - 1].type) + '10'
                                                            }}
                                                        >
                                                            {activities[activities.length - 1].type}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                                                        <Clock className="w-3 h-3" />
                                                        Due: {activities[activities.length - 1].dueDate}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-muted-foreground text-sm">
                                                    No active activity.
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* STUDENTS TAB */}
                    <TabsContent value="students" className="animate-in fade-in slide-in-from-bottom-2">
                        <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
                            <CardContent className="p-6">
                                <StudentDataTable
                                    selectedIds={[]}
                                    onToggle={() => { }}
                                    onSelectAll={() => { }}
                                    campuses={campuses}
                                    promotions={promotions}
                                    grades={grades}
                                    classroomId={classroom.id}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ABSENCE TAB */}
                    <TabsContent value="absence" className="animate-in fade-in slide-in-from-bottom-2">
                        <div className="space-y-6">
                            <div className="flex justify-end">
                                <MarkAbsenceDialog
                                    enrolledLearners={enrolledLearners}
                                    absenceTypes={absenceTypes}
                                    onSuccess={fetchData}
                                >
                                    <Button size="sm" className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Mark Absence
                                    </Button>
                                </MarkAbsenceDialog>
                            </div>
                            <AbsenceCalendar
                                absences={absences}
                                absenceTypes={absenceTypes}
                                onAddAbsence={() => { }} // Linked to button above instead
                            />
                        </div>
                    </TabsContent>

                    {/* SQUADS TAB */}
                    <TabsContent value="squads" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <SquadsTab
                            classroomId={classroom.id}
                            programId={classroom.programId}
                            enrolledLearners={enrolledLearners}
                            onUpdate={fetchData}
                        />
                    </TabsContent>

                    {/* ACTIVITIES TAB */}
                    <TabsContent value="activities" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <ClassroomActivities
                            classroomId={classroom.id}
                            activities={activities}
                            activityTypes={activityTypes}
                            onAddActivity={fetchData}
                        />
                    </TabsContent>

                    <TabsContent value="action-plans" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <ActionPlansTab
                            classroomId={classroom.id}
                            enrolledLearners={enrolledLearners}
                            activityTypes={activityTypes}
                            onUpdate={fetchData}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </ProtectedRoute>
    );
}
