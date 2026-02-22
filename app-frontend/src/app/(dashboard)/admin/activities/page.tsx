"use client";

import { useState, useEffect } from "react";
import { getActivities, createActivity, updateActivity, deleteActivity, GlobalActivity, ActivityType } from "@/lib/activity-api";
import { getActivityTypes } from "@/lib/classroom-activity-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Search, Filter, Edit, Trash2, FileText, Clock, AlertTriangle } from "lucide-react";

export default function ActivitiesPage() {
    const [activities, setActivities] = useState<GlobalActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
    const { toast } = useToast();

    // Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<GlobalActivity | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<GlobalActivity>>({
        title: "",
        description: "",
        typeId: undefined,
        durationMinutes: 60,
        difficultyLevel: "MEDIUM",
        assignmentType: "INDIVIDUAL",
        resources: "[]"
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [acts, types] = await Promise.all([
                getActivities(),
                getActivityTypes()
            ]);
            setActivities(acts);
            setActivityTypes(types);
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast({
                title: "Error",
                description: "Failed to load activities",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            await createActivity(formData);
            toast({ title: "Success", description: "Activity created successfully" });
            setIsCreateOpen(false);
            fetchData();
            resetForm();
        } catch (error) {
            toast({ title: "Error", description: "Failed to create activity", variant: "destructive" });
        }
    };

    const handleUpdate = async () => {
        if (!selectedActivity) return;
        try {
            await updateActivity(selectedActivity.id, formData);
            toast({ title: "Success", description: "Activity updated successfully" });
            setIsEditOpen(false);
            fetchData();
            resetForm();
        } catch (error) {
            toast({ title: "Error", description: "Failed to update activity", variant: "destructive" });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this activity?")) return;
        try {
            await deleteActivity(id);
            toast({ title: "Success", description: "Activity deleted successfully" });
            fetchData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete activity", variant: "destructive" });
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            typeId: undefined,
            durationMinutes: 60,
            difficultyLevel: "MEDIUM",
            assignmentType: "INDIVIDUAL",
            resources: "[]"
        });
        setSelectedActivity(null);
    };

    const openEditModal = (activity: GlobalActivity) => {
        setSelectedActivity(activity);
        setFormData({
            title: activity.title,
            description: activity.description,
            typeId: activity.typeId,
            durationMinutes: activity.durationMinutes,
            difficultyLevel: activity.difficultyLevel,
            assignmentType: activity.assignmentType,
            resources: activity.resources
        });
        setIsEditOpen(true);
    };

    const filteredActivities = activities.filter(act => {
        const matchesSearch = act.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === "ALL" || act.type === typeFilter;
        return matchesSearch && matchesType;
    });

    return (
        <div className="p-8 space-y-8 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                        Activity Library
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage global activity templates</p>
                </div>
                <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4 mr-2" />
                    New Activity
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-black/20 border-white/10 text-sm"
                    />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px] bg-black/20 border-white/10">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <SelectValue placeholder="Filter Type" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Types</SelectItem>
                        {activityTypes.map(t => (
                            <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredActivities.map(activity => (
                        <Card key={activity.id} className="bg-white/5 border-white/10 hover:border-primary/50 transition-all group overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-transparent opacity-50" />
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mb-2">
                                        {activity.type}
                                    </Badge>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-white"
                                            onClick={() => openEditModal(activity)}
                                        >
                                            <Edit className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-destructive hover:text-red-400 hover:bg-red-500/10"
                                            onClick={() => handleDelete(activity.id)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                                <CardTitle className="text-lg font-semibold line-clamp-1">{activity.title}</CardTitle>
                                <CardDescription className="line-clamp-2 text-xs mt-1 h-8">
                                    {activity.description || "No description provided."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-3 border-t border-white/5">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{activity.durationMinutes}m</span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded capitalize ${activity.difficultyLevel === 'EASY' ? 'text-green-400 bg-green-500/10' :
                                            activity.difficultyLevel === 'MEDIUM' ? 'text-yellow-400 bg-yellow-500/10' :
                                                'text-red-400 bg-red-500/10'
                                        }`}>
                                        {activity.difficultyLevel?.toLowerCase()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {filteredActivities.length === 0 && (
                        <div className="col-span-full text-center py-20 text-muted-foreground bg-white/5 rounded-xl border border-white/10 border-dashed">
                            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No activities found matching your criteria</p>
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modals (Shared Structure) */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="bg-slate-950 border-white/10 text-slate-200 sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Create New Activity</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label>Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="bg-white/5 border-white/10 min-h-[100px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    value={formData.typeId?.toString()}
                                    onValueChange={(val) => setFormData({ ...formData, typeId: parseInt(val) })}
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10">
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {activityTypes.map(t => (
                                            <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Duration (Min)</Label>
                                <Input
                                    type="number"
                                    value={formData.durationMinutes}
                                    onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Difficulty</Label>
                                <Select
                                    value={formData.difficultyLevel}
                                    onValueChange={(val) => setFormData({ ...formData, difficultyLevel: val })}
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EASY">Easy</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HARD">Hard</SelectItem>
                                        <SelectItem value="EXPERT">Expert</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Assignment Type</Label>
                                <Select
                                    value={formData.assignmentType}
                                    onValueChange={(val) => setFormData({ ...formData, assignmentType: val })}
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                                        <SelectItem value="PAIR">Pair</SelectItem>
                                        <SelectItem value="GROUP">Group</SelectItem>
                                        <SelectItem value="SQUAD">Squad</SelectItem>
                                        <SelectItem value="CLASSROOM">Classroom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate}>Create Activity</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-slate-950 border-white/10 text-slate-200 sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Activity</DialogTitle>
                    </DialogHeader>
                    {/* Reuse form logic here (duplicated for simplicity, ideally componentize) */}
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label>Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="bg-white/5 border-white/10 min-h-[100px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    value={formData.typeId?.toString()}
                                    onValueChange={(val) => setFormData({ ...formData, typeId: parseInt(val) })}
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10">
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {activityTypes.map(t => (
                                            <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Duration (Min)</Label>
                                <Input
                                    type="number"
                                    value={formData.durationMinutes}
                                    onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Difficulty</Label>
                                <Select
                                    value={formData.difficultyLevel}
                                    onValueChange={(val) => setFormData({ ...formData, difficultyLevel: val })}
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EASY">Easy</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HARD">Hard</SelectItem>
                                        <SelectItem value="EXPERT">Expert</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Assignment Type</Label>
                                <Select
                                    value={formData.assignmentType}
                                    onValueChange={(val) => setFormData({ ...formData, assignmentType: val })}
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                                        <SelectItem value="PAIR">Pair</SelectItem>
                                        <SelectItem value="GROUP">Group</SelectItem>
                                        <SelectItem value="SQUAD">Squad</SelectItem>
                                        <SelectItem value="CLASSROOM">Classroom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdate}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
