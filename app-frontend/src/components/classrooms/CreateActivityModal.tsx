"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock, Loader2, Plus, Users, Repeat, Link as LinkIcon, FileText, Check, ChevronsUpDown, X, Layout } from "lucide-react";
import { Activity, ActivityType, Enroll } from "@/types/classroom";
import { createActivity, getActivityTypes, getActivitiesByClassroom } from "@/lib/classroom-activity-api";
import { getEnrolledLearners, getAllClassrooms, getClassroomById } from "@/lib/classroom-api";
import { getSquadsByClassroom } from "@/lib/squad-api";
import { getSprintsByProgram, Sprint } from "@/lib/program-api";
import dynamic from "next/dynamic";
import { OutputData } from "@editorjs/editorjs";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

// Dynamically import Editor to avoid SSR issues
const Editor = dynamic(() => import("@/components/ui/editor"), { ssr: false });

interface CreateActivityModalProps {
    classroomId: number;
    activityTypes: ActivityType[];
    onSuccess: () => void;
    children?: React.ReactNode;
}

interface Resource {
    label: string;
    url: string;
}

export default function CreateActivityModal({ classroomId, activityTypes, onSuccess, children }: CreateActivityModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Core Fields
    const [title, setTitle] = useState("");
    const [typeId, setTypeId] = useState<string>("");
    const [editorData, setEditorData] = useState<OutputData>();

    // Sprints & Linking
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [selectedSprintId, setSelectedSprintId] = useState<string>("");
    const [briefActivities, setBriefActivities] = useState<Activity[]>([]);
    const [parentActivityId, setParentActivityId] = useState<string>("");

    // Scheduling
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [durationHours, setDurationHours] = useState<number>(0);
    const [durationMinutes, setDurationMinutes] = useState<number>(0);
    const [scheduleMode, setScheduleMode] = useState<"duration" | "end_date">("end_date");

    // Assignment Logic
    const [assignmentType, setAssignmentType] = useState("INDIVIDUAL");
    const [targets, setTargets] = useState<string[]>([]);
    const [targetOptions, setTargetOptions] = useState<{ label: string, value: string }[]>([]);
    const [fetchingTargets, setFetchingTargets] = useState(false);

    // Recurrence
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrencePattern, setRecurrencePattern] = useState("WEEKLY");
    const [recurrenceEndDate, setRecurrenceEndDate] = useState("");

    // Resources
    const [resources, setResources] = useState<Resource[]>([]);
    const [newResLabel, setNewResLabel] = useState("");
    const [newResUrl, setNewResUrl] = useState("");

    // Initial Data Fetch
    useEffect(() => {
        if (open) {
            fetchInitialData();
            fetchTargets();
        }
    }, [open, classroomId]);

    // Re-fetch targets if assignment type changes while open
    useEffect(() => {
        if (open) {
            fetchTargets();
        }
    }, [assignmentType]);

    const fetchInitialData = async () => {
        try {
            // Fetch Classroom to get Program ID
            const classroom = await getClassroomById(classroomId);
            if (classroom.programId) {
                const programSprints = await getSprintsByProgram(classroom.programId);
                setSprints(programSprints);

                // Set default sprint (Current)
                const now = new Date();
                const currentSprint = programSprints.find(s => {
                    const start = new Date(s.startDate);
                    const end = new Date(s.endDate);
                    return now >= start && now <= end;
                });
                if (currentSprint) {
                    setSelectedSprintId(currentSprint.id.toString());
                }
            } else {
                console.warn("Classroom has no programId linked");
            }

            // Fetch activities for Brief selection
            const activities = await getActivitiesByClassroom(classroomId);
            const briefs = activities.filter(a => a.type === "BRIEF");
            setBriefActivities(briefs);

        } catch (error) {
            console.error("Failed to fetch initial data", error);
        }
    };

    const fetchTargets = async () => {
        setFetchingTargets(true);
        setTargets([]); // Reset selection when type changes to avoid type mismatches
        try {
            if (assignmentType === "INDIVIDUAL" || assignmentType === "PAIR") {
                const learners = await getEnrolledLearners(classroomId);
                setTargetOptions(learners.map(l => ({ label: l.learnerName, value: l.learnerId.toString() })));
            } else if (assignmentType === "SQUAD") {
                const squads = await getSquadsByClassroom(classroomId);
                setTargetOptions(squads.map(s => ({ label: s.name, value: s.id.toString() })));
            } else if (assignmentType === "MANY_CLASSROOMS") {
                const response = await getAllClassrooms({ size: 100 });
                setTargetOptions(response.content.map(c => ({ label: c.name, value: c.id.toString() })));
            } else {
                setTargetOptions([]);
            }

        } catch (error) {
            console.error("Failed to fetch targets", error);
        } finally {
            setFetchingTargets(false);
        }
    };

    // Update estimated end date when duration changes
    useEffect(() => {
        const totalMinutes = (durationHours * 60) + durationMinutes;

        if (startDate && totalMinutes > 0 && scheduleMode === "duration") {
            const start = new Date(startDate);
            const end = new Date(start.getTime() + totalMinutes * 60000);
            // Format to datetime-local string: YYYY-MM-DDTHH:mm
            const endString = new Date(end.getTime() - (end.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
            setEndDate(endString);
        }
    }, [startDate, durationHours, durationMinutes, scheduleMode]);

    const handleAddResource = () => {
        if (newResLabel && newResUrl) {
            setResources([...resources, { label: newResLabel, url: newResUrl }]);
            setNewResLabel("");
            setNewResUrl("");
        }
    };

    const handleRemoveResource = (index: number) => {
        setResources(resources.filter((_, i) => i !== index));
    };

    const toggleTarget = (value: string) => {
        if (targets.includes(value)) {
            setTargets(targets.filter(t => t !== value));
        } else {
            setTargets([...targets, value]);
        }
    };

    const handleSubmit = async () => {
        if (!title || !typeId || !startDate) return;

        setLoading(true);
        try {
            const description = editorData ? JSON.stringify(editorData) : "";
            const resourcesJson = JSON.stringify(resources);

            const targetIds = targets.map(t => parseInt(t));
            const finalRecurrencePattern = isRecurring
                ? `${recurrencePattern}${recurrenceEndDate ? `|UNTIL=${recurrenceEndDate}` : ''}`
                : undefined;

            const selectedType = activityTypes.find(t => t.id.toString() === typeId);
            const totalDuration = (durationHours * 60) + durationMinutes;

            const activityData: any = {
                title,
                typeId: parseInt(typeId),
                dueDate: endDate || undefined,
                startDate: startDate,
                assignmentType,
                duration: totalDuration > 0 ? totalDuration : undefined,
                isRecurring,
                recurrencePattern: finalRecurrencePattern,
                resources: resourcesJson,
                description,
                classroomId,
                targetIds: targetIds.length > 0 ? targetIds : undefined,
                sprintId: selectedSprintId ? parseInt(selectedSprintId) : undefined,
                parentActivityId: (selectedType?.name === "DEBRIEFING" && parentActivityId) ? parseInt(parentActivityId) : undefined
            };

            await createActivity(activityData);
            setOpen(false);
            resetForm();
            onSuccess();
        } catch (error) {
            console.error("Failed to create activity", error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle("");
        setTypeId("");
        setAssignmentType("INDIVIDUAL");
        setStartDate("");
        setEndDate("");
        setDurationHours(0);
        setDurationMinutes(0);
        setIsRecurring(false);
        setRecurrencePattern("WEEKLY");
        setRecurrenceEndDate("");
        setResources([]);
        setTargets([]);
        setEditorData(undefined);
        setSelectedSprintId("");
        setParentActivityId("");
    };

    const assignmentTypes = [
        { value: "INDIVIDUAL", label: "Individual Students", icon: Users },
        { value: "PAIR", label: "Pair / Binom", icon: Users },
        { value: "SQUAD", label: "Squad / Team", icon: Users },
        { value: "CLASSROOM", label: "Whole Classroom", icon: Users },
        { value: "MANY_CLASSROOMS", label: "Multiple Classrooms", icon: Users },
    ];

    const filteredActivityTypes = activityTypes.filter(t => t.name !== "ACTION_PLAN" && t.name !== "Plan d'action");
    const selectedTypeName = activityTypes.find(t => t.id.toString() === typeId)?.name;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Activity
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] w-[1400px] max-h-[95vh] overflow-y-auto bg-slate-950 border-white/10 text-slate-200 p-0 gap-0 shadow-2xl flex flex-col">
                <div className="p-6 border-b border-white/10 sticky top-0 bg-slate-950 z-20 flex justify-between items-center backdrop-blur-sm bg-slate-950/95">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="w-6 h-6 text-primary" />
                        Create New Activity
                    </DialogTitle>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                            <X className="w-4 h-4" />
                        </Button>
                    </DialogTrigger>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 h-full flex-1 overflow-hidden">
                    {/* Main Content (Left, 8 Cols) */}
                    <div className="lg:col-span-8 p-6 space-y-6 overflow-y-auto h-full">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="uppercase text-xs font-bold text-muted-foreground tracking-wider ml-1">Title</Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter activity title..."
                                    className="bg-white/5 border-white/10 text-xl font-medium h-14 px-4 rounded-xl focus-visible:ring-primary/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="uppercase text-xs font-bold text-muted-foreground tracking-wider ml-1">Description & Guidelines</Label>
                                <div className="min-h-[500px] border border-white/10 rounded-xl overflow-hidden bg-black/20 p-6 shadow-inner">
                                    <Editor
                                        holder="editorjs-container"
                                        onChange={setEditorData}
                                        data={editorData}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Settings (Right, 4 Cols) */}
                    <div className="lg:col-span-4 bg-white/[0.02] border-l border-white/10 flex flex-col h-full overflow-hidden">

                        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
                            {/* Classification Group */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Layout className="w-4 h-4 text-primary" />
                                    <h3 className="uppercase text-xs font-bold text-primary tracking-wider">Classification & Context</h3>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Activity Type</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {filteredActivityTypes.map(type => (
                                            <div
                                                key={type.id}
                                                onClick={() => setTypeId(type.id.toString())}
                                                className={`cursor-pointer border rounded-lg p-3 text-center text-xs transition-all duration-200 ${typeId === type.id.toString()
                                                    ? 'bg-primary/20 border-primary text-primary font-bold shadow-[0_0_15px_rgba(var(--primary),0.3)] scale-[1.02]'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-muted-foreground hover:border-white/20'
                                                    }`}
                                            >
                                                {type.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <Label className="text-xs text-muted-foreground">Sprint Context</Label>
                                    <Select value={selectedSprintId} onValueChange={setSelectedSprintId}>
                                        <SelectTrigger className="bg-white/5 border-white/10 h-10">
                                            <SelectValue placeholder={sprints.length > 0 ? "Select Sprint" : "No sprints found"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sprints.map(s => (
                                                <SelectItem key={s.id} value={s.id.toString()}>
                                                    {s.title}
                                                </SelectItem>
                                            ))}
                                            {sprints.length === 0 && <div className="p-2 text-xs text-muted-foreground">No sprints associated with this program</div>}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Conditional: Debriefing -> Brief Link */}
                                {selectedTypeName === "DEBRIEFING" && (
                                    <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2">
                                        <Label className="text-xs text-muted-foreground text-orange-400">Related Brief</Label>
                                        <Select value={parentActivityId} onValueChange={setParentActivityId}>
                                            <SelectTrigger className="bg-orange-500/10 border-orange-500/20 text-orange-200 h-10">
                                                <SelectValue placeholder="Select the Brief to debrief" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {briefActivities.map(a => (
                                                    <SelectItem key={a.id} value={a.id.toString()}>
                                                        {a.title}
                                                    </SelectItem>
                                                ))}
                                                {briefActivities.length === 0 && <div className="p-2 text-xs text-muted-foreground">No briefs found</div>}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>

                            {/* Assignment Group */}
                            <div className="space-y-4 pt-6 border-t border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="w-4 h-4 text-primary" />
                                    <h3 className="uppercase text-xs font-bold text-primary tracking-wider">Assignment</h3>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Assign To</Label>
                                    <Select value={assignmentType} onValueChange={setAssignmentType}>
                                        <SelectTrigger className="bg-white/5 border-white/10 h-10">
                                            <SelectValue placeholder="Select assignment type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {assignmentTypes.map(t => (
                                                <SelectItem key={t.value} value={t.value}>
                                                    <div className="flex items-center gap-2">
                                                        {t.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {(assignmentType !== "CLASSROOM") && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <Label className="text-xs text-muted-foreground">
                                            Select Targets ({targets.length})
                                        </Label>

                                        {/* REPLACED POPOVER WITH SCROLLABLE LIST to avoid bugs */}
                                        <div className="border border-white/10 rounded-lg bg-black/20 max-h-[150px] overflow-y-auto">
                                            {targetOptions.length > 0 ? (
                                                <div className="p-2 space-y-1">
                                                    {targetOptions.map(option => (
                                                        <div
                                                            key={option.value}
                                                            className="flex items-center space-x-2 p-2 rounded hover:bg-white/5 cursor-pointer"
                                                            onClick={() => toggleTarget(option.value)}
                                                        >
                                                            <Checkbox
                                                                id={`target-${option.value}`}
                                                                checked={targets.includes(option.value)}
                                                                onCheckedChange={() => toggleTarget(option.value)} // Handled by div click too, but safer
                                                            />
                                                            <label
                                                                htmlFor={`target-${option.value}`}
                                                                className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                                            >
                                                                {option.label}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-4 text-center text-xs text-muted-foreground italic">
                                                    {fetchingTargets ? "Loading..." : "No targets available"}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Scheduling Group */}
                            <div className="space-y-4 pt-6 border-t border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <h3 className="uppercase text-xs font-bold text-primary tracking-wider">Schedule</h3>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Start Date <span className="text-red-400">*</span></Label>
                                    <Input
                                        type="datetime-local"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="bg-white/5 border-white/10 h-10 text-xs"
                                    />
                                </div>

                                <Tabs value={scheduleMode} onValueChange={(v) => setScheduleMode(v as any)} className="w-full">
                                    <TabsList className="w-full grid grid-cols-2 bg-white/5 border border-white/10 p-1 h-9">
                                        <TabsTrigger value="end_date" className="text-xs h-7">Set End Date</TabsTrigger>
                                        <TabsTrigger value="duration" className="text-xs h-7">Set Duration</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="end_date" className="mt-2 space-y-2">
                                        <Label className="text-xs text-muted-foreground">End Date / Deadline</Label>
                                        <Input
                                            type="datetime-local"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="bg-white/5 border-white/10 h-10 text-xs"
                                        />
                                    </TabsContent>
                                    <TabsContent value="duration" className="mt-2 space-y-2">
                                        <Label className="text-xs text-muted-foreground">Duration</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={durationHours}
                                                    onChange={(e) => setDurationHours(parseInt(e.target.value) || 0)}
                                                    className="bg-white/5 border-white/10 h-10 pl-2 pr-8 text-xs"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">Hr</span>
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="59"
                                                    value={durationMinutes}
                                                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                                                    className="bg-white/5 border-white/10 h-10 pl-2 pr-8 text-xs"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">Min</span>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-2">
                                        <Repeat className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-xs font-bold text-muted-foreground uppercase">Recurrence</span>
                                    </div>
                                    <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
                                </div>

                                {isRecurring && (
                                    <div className="space-y-3 p-3 bg-white/5 rounded-lg border border-white/10 animate-in fade-in slide-in-from-top-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-muted-foreground">Pattern</Label>
                                                <Select value={recurrencePattern} onValueChange={setRecurrencePattern}>
                                                    <SelectTrigger className="bg-black/20 border-white/10 h-8 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="DAILY">Daily</SelectItem>
                                                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                                                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-muted-foreground">Until</Label>
                                                <Input
                                                    type="date"
                                                    value={recurrenceEndDate}
                                                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                                                    className="bg-black/20 border-white/10 h-8 text-xs"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Resources Group */}
                            <div className="space-y-4 pt-6 border-t border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <LinkIcon className="w-4 h-4 text-primary" />
                                    <h3 className="uppercase text-xs font-bold text-primary tracking-wider">Resources</h3>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-3">
                                    <div className="space-y-2">
                                        <Input
                                            placeholder="Label (e.g. GitHub Repo)"
                                            value={newResLabel}
                                            onChange={(e) => setNewResLabel(e.target.value)}
                                            className="bg-black/20 border-white/10 text-xs h-8"
                                        />
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="URL (https://...)"
                                                value={newResUrl}
                                                onChange={(e) => setNewResUrl(e.target.value)}
                                                className="bg-black/20 border-white/10 text-xs h-8 flex-1"
                                            />
                                            <Button onClick={handleAddResource} size="sm" variant="secondary" className="h-8 w-8 p-0">
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-1 max-h-[150px] overflow-y-auto pr-1">
                                        {resources.map((res, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/5 group hover:border-white/20 transition-colors">
                                                <a href={res.url} target="_blank" rel="noreferrer" className="flex flex-col flex-1 min-w-0 mr-2">
                                                    <span className="text-xs font-medium text-blue-400 truncate hover:underline">{res.label}</span>
                                                    <span className="text-[10px] text-muted-foreground truncate opacity-70">{res.url}</span>
                                                </a>
                                                <Button
                                                    onClick={() => handleRemoveResource(idx)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                        {resources.length === 0 && (
                                            <div className="text-center text-[10px] text-muted-foreground py-2 italic border border-dashed border-white/10 rounded">
                                                No resources added
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Bottom Button */}
                        <div className="p-6 bg-slate-950 border-t border-white/10 mt-auto sticky bottom-0 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
                            <Button
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 text-lg shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                                onClick={handleSubmit}
                                disabled={loading || !title || !typeId || !startDate}
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                                Create Activity
                            </Button>
                        </div>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
