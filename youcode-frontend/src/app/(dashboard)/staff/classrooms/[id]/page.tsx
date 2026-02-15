"use client";

import { useEffect, useState, use } from "react";
import { Classroom, Absence, AbsenceType, Activity, ActivityType } from "@/types/classroom";
import { Campus, Promotion, Grade } from "@/types/admin";
import { getClassroomById } from "@/lib/classroom-api";
import { getAllCampuses, getAllPromotions, getAllGrades } from "@/lib/admin-api";
import { getAbsenceTypes, getAbsencesByClassroom, createAbsence } from "@/lib/absence-api";
import { getActivityTypes, getActivitiesByClassroom, createActivity } from "@/lib/activity-api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentDataTable from "@/components/classrooms/StudentDataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Calendar, Users, MapPin, GraduationCap, Edit, User as UserIcon, Shield, Plus, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AbsenceCalendar from "@/components/classrooms/AbsenceCalendar";

export default function ClassroomDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [loading, setLoading] = useState(true);

    // For StudentDataTable
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);

    // Absences & Activities
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);

    // New Activity Form
    const [newActivity, setNewActivity] = useState<Partial<Activity>>({
        title: "",
        description: "",
        maxPoints: 100,
        typeId: undefined,
        dueDate: "",
    });
    const [isCreatingActivity, setIsCreatingActivity] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const cid = parseInt(id);
                const [c, p, g, data, abs, absTypes, acts, actTypes] = await Promise.all([
                    getAllCampuses(),
                    getAllPromotions(),
                    getAllGrades(),
                    getClassroomById(cid),
                    getAbsencesByClassroom(cid),
                    getAbsenceTypes(),
                    getActivitiesByClassroom(cid),
                    getActivityTypes()
                ]);
                setCampuses(c);
                setPromotions(p);
                setGrades(g);
                setClassroom(data);
                setAbsences(abs);
                setAbsenceTypes(absTypes);
                setActivities(acts);
                setActivityTypes(actTypes);
            } catch (error) {
                console.error("Failed to fetch classroom data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleCreateActivity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!classroom) return;
        setIsCreatingActivity(true);
        try {
            const created = await createActivity({ ...newActivity, classroomId: classroom.id });
            setActivities([...activities, created]);
            setNewActivity({ title: "", description: "", maxPoints: 100, typeId: undefined, dueDate: "" });
            // Close dialog logic would go here if controlled
        } catch (error) {
            alert("Failed to create activity");
        } finally {
            setIsCreatingActivity(false);
        }
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

    // Helper to get activity type color
    const getActivityColor = (typeName: string) => {
        const type = activityTypes.find(t => t.name === typeName);
        return type?.color || '#64748b';
    };

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
                    <Link href={`/staff/classrooms/${id}/edit`}>
                        <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Classroom
                        </Button>
                    </Link>
                </div>

                <Tabs defaultValue="resume" className="space-y-6">
                    <TabsList className="bg-white/5 border border-white/10 p-1">
                        <TabsTrigger value="resume" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Resume</TabsTrigger>
                        <TabsTrigger value="students" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Enrolled Students</TabsTrigger>
                        <TabsTrigger value="absence" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Absence</TabsTrigger>
                        <TabsTrigger value="squads" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Squads</TabsTrigger>
                        <TabsTrigger value="activities" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Activities</TabsTrigger>
                    </TabsList>

                    {/* RESUME TAB */}
                    <TabsContent value="resume" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* General Info Card */}
                            <Card className="bg-black/40 border-white/10 backdrop-blur-xl md:col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Users className="w-5 h-5 text-primary" />
                                        General Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs uppercase text-muted-foreground font-semibold">Speciality</label>
                                            <p className="text-white">{classroom.speciality || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs uppercase text-muted-foreground font-semibold">Bootcamp</label>
                                            <p className="text-white">{classroom.bootcamp ? 'Yes' : 'No'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs uppercase text-muted-foreground font-semibold">Start Date</label>
                                            <p className="text-white flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                                {classroom.startDate}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs uppercase text-muted-foreground font-semibold">End Date</label>
                                            <p className="text-white flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                                {classroom.endDate}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-white/10">
                                        <label className="text-xs uppercase text-muted-foreground font-semibold">Description</label>
                                        <p className="text-sm text-slate-300 mt-1">{classroom.description || 'No description provided.'}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Staff & Key Roles Card */}
                            <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-primary" />
                                        Key Roles
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Trainer */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                                            <UserIcon className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <label className="text-xs uppercase text-muted-foreground font-semibold block">Trainer</label>
                                            <span className="text-white font-medium">{classroom.trainerName || 'Unassigned'}</span>
                                        </div>
                                    </div>

                                    {/* CME */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                                            <UserIcon className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <label className="text-xs uppercase text-muted-foreground font-semibold block">CME Staff</label>
                                            <span className="text-white font-medium">{classroom.cmeName || 'Unassigned'}</span>
                                        </div>
                                    </div>

                                    {/* Delegate */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                                            <UserIcon className="w-5 h-5 text-yellow-400" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs uppercase text-muted-foreground font-semibold block">Class Delegate</label>
                                            <div className="flex items-center justify-between">
                                                <span className="text-white font-medium">{classroom.delegateName || 'Unassigned'}</span>
                                                <Button size="sm" variant="ghost" className="h-6 text-xs text-primary hover:text-primary/80 px-2">
                                                    Set/Edit
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Stats Card - Student of the Month Placeholder */}
                            <Card className="bg-black/40 border-white/10 backdrop-blur-xl md:col-span-3">
                                <CardHeader>
                                    <CardTitle className="text-lg">Highlights</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center relative group overflow-hidden">
                                        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                                        <h3 className="text-sm uppercase text-muted-foreground mb-2 relative z-10">Student of the Month</h3>
                                        <div className="text-2xl font-bold text-yellow-400 animate-pulse relative z-10">Coming Soon</div>
                                    </div>

                                    <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center relative group overflow-hidden">
                                        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                                        <h3 className="text-sm uppercase text-muted-foreground mb-2 relative z-10">Current Activity</h3>
                                        {activities.length > 0 ? (
                                            <>
                                                <div className="text-xl font-semibold text-primary truncate relative z-10">{activities[activities.length - 1].title}</div>
                                                <div className="text-xs text-muted-foreground mt-1 relative z-10">Due: {activities[activities.length - 1].dueDate}</div>
                                            </>
                                        ) : (
                                            <div className="text-xl font-semibold text-muted-foreground relative z-10">No active activity</div>
                                        )}
                                    </div>

                                    <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center">
                                        <h3 className="text-sm uppercase text-muted-foreground mb-2">Total Students</h3>
                                        <div className="text-3xl font-bold text-white">{classroom.enrolledCount}</div>
                                    </div>
                                </CardContent>
                            </Card>
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
                                <Button size="sm" className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Mark Absence
                                </Button>
                            </div>
                            <AbsenceCalendar
                                absences={absences}
                                absenceTypes={absenceTypes}
                                onAddAbsence={() => {
                                    // Todo: Open modal
                                    console.log("Open add absence modal");
                                }}
                            />
                        </div>
                    </TabsContent>

                    {/* ACTIVITIES TAB */}
                    <TabsContent value="activities" className="animate-in fade-in slide-in-from-bottom-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-6">
                                {activities.map(activity => (
                                    <Card key={activity.id} className="bg-black/40 border-white/10 backdrop-blur-xl relative overflow-hidden group">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/50" style={{ backgroundColor: getActivityColor(activity.type) }} />
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span
                                                            className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border"
                                                            style={{
                                                                color: getActivityColor(activity.type),
                                                                borderColor: getActivityColor(activity.type) + '40',
                                                                backgroundColor: getActivityColor(activity.type) + '10'
                                                            }}
                                                        >
                                                            {activity.type}
                                                        </span>
                                                        {activity.dueDate && (
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                Due {activity.dueDate}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-xl font-bold text-white mb-2">{activity.title}</h3>
                                                    <p className="text-sm text-slate-300">{activity.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-primary">{activity.maxPoints}</div>
                                                    <div className="text-xs text-muted-foreground uppercase">Points</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {activities.length === 0 && (
                                    <div className="text-center p-12 bg-white/5 rounded-xl border border-white/10 border-dashed">
                                        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No activities found</p>
                                        <p className="text-xs text-slate-500 mt-1">Review the list or create a new activity.</p>
                                    </div>
                                )}
                            </div>

                            {/* Create Activity Form */}
                            <Card className="bg-black/40 border-white/10 backdrop-blur-xl h-fit sticky top-6">
                                <CardHeader>
                                    <CardTitle className="text-lg">Add Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreateActivity} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase font-bold text-muted-foreground">Title</label>
                                            <Input
                                                value={newActivity.title}
                                                onChange={e => setNewActivity({ ...newActivity, title: e.target.value })}
                                                className="bg-white/5 border-white/10"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase font-bold text-muted-foreground">Type</label>
                                            <div className="flex flex-wrap gap-2">
                                                {activityTypes.map(type => (
                                                    <button
                                                        key={type.id}
                                                        type="button"
                                                        onClick={() => setNewActivity({ ...newActivity, typeId: type.id })}
                                                        className={`px-3 py-1 rounded text-xs transition-all border ${newActivity.typeId === type.id
                                                            ? 'bg-primary/20 border-primary text-primary'
                                                            : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                                                            }`}
                                                    >
                                                        {type.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase font-bold text-muted-foreground">Description</label>
                                            <textarea
                                                value={newActivity.description}
                                                onChange={e => setNewActivity({ ...newActivity, description: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs uppercase font-bold text-muted-foreground">Points</label>
                                                <Input
                                                    type="number"
                                                    value={newActivity.maxPoints}
                                                    onChange={e => setNewActivity({ ...newActivity, maxPoints: parseInt(e.target.value) })}
                                                    className="bg-white/5 border-white/10"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs uppercase font-bold text-muted-foreground">Due Date</label>
                                                <Input
                                                    type="date"
                                                    value={newActivity.dueDate}
                                                    onChange={e => setNewActivity({ ...newActivity, dueDate: e.target.value })}
                                                    className="bg-white/5 border-white/10"
                                                />
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full" disabled={isCreatingActivity}>
                                            {isCreatingActivity ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                            Create Activity
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </ProtectedRoute >
    );
}
