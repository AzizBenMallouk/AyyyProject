"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Activity, ActivityType } from "@/types/classroom";
import { format, parseISO } from "date-fns";
import dynamic from "next/dynamic";
import {
    Calendar,
    Clock,
    Link as LinkIcon,
    Pencil,
    Trash2,
    Award,
    FileText,
    CheckCircle2
} from "lucide-react";
import { OutputData } from "@editorjs/editorjs";
import { Badge } from "@/components/ui/badge";

// Dynamically import Editor to avoid SSR issues
const Editor = dynamic(() => import("@/components/ui/editor"), { ssr: false });

interface ActivityDetailsModalProps {
    activity: Activity | null;
    activityTypes: ActivityType[];
    open: boolean;
    onClose: () => void;
    onEdit: (activity: Activity) => void;
    onDelete: (activityId: number) => void;
    onEvaluate: (activityId: number) => void;
}

export default function ActivityDetailsModal({
    activity,
    activityTypes,
    open,
    onClose,
    onEdit,
    onDelete,
    onEvaluate
}: ActivityDetailsModalProps) {
    if (!activity) return null;

    const type = activityTypes.find(t => t.name === activity.type);
    const typeColor = type?.color || '#64748b';

    let editorData: OutputData | undefined;
    try {
        if (activity.description && activity.description.startsWith('{')) {
            editorData = JSON.parse(activity.description);
        }
    } catch (e) {
        console.error("Failed to parse activity description", e);
    }

    const startDate = activity.startDate ? parseISO(activity.startDate) : null;
    const dueDate = activity.dueDate ? parseISO(activity.dueDate) : null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl bg-[#0F0F13] border-white/10 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border"
                            style={{
                                borderColor: typeColor + '40',
                                backgroundColor: typeColor + '10',
                                color: typeColor
                            }}
                        >
                            {activity.type}
                        </div>
                        {activity.maxPoints && (
                            <Badge variant="outline" className="border-white/10 text-muted-foreground">
                                {activity.maxPoints} Points
                            </Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto bg-white/5 px-2 py-1 rounded border border-white/10">
                            {activity.assignmentType}
                        </span>
                    </div>
                    <DialogTitle className="text-2xl font-bold">{activity.title}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                    <div className="md:col-span-2 space-y-6">
                        {/* Description Section */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Description
                            </h4>
                            <div className="bg-black/20 rounded-lg border border-white/5 p-1">
                                {editorData ? (
                                    <Editor
                                        holder={`activity-details-editor-${activity.id}`}
                                        data={editorData}
                                        readOnly={true}
                                        onChange={() => { }}
                                    />
                                ) : (
                                    <div className="p-4 text-sm text-slate-300">
                                        {activity.description || "No description provided."}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Resources Section */}
                        {activity.resources && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4" /> Resources
                                </h4>
                                <div className="space-y-2">
                                    {(() => {
                                        try {
                                            const resources = JSON.parse(activity.resources);
                                            return Array.isArray(resources) && resources.map((res: any, idx: number) => (
                                                <a
                                                    key={idx}
                                                    href={res.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                                                >
                                                    <div className="p-2 bg-blue-500/10 rounded-md text-blue-400">
                                                        <LinkIcon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-blue-400 group-hover:underline truncate">{res.label}</div>
                                                        <div className="text-xs text-muted-foreground truncate">{res.url}</div>
                                                    </div>
                                                </a>
                                            ));
                                        } catch {
                                            return <div className="text-sm text-muted-foreground">No valid resources found.</div>;
                                        }
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Meta Info Card */}
                        <div className="bg-white/5 rounded-xl border border-white/10 p-5 space-y-4">
                            <h4 className="font-semibold text-white mb-2">Details</h4>

                            <div className="space-y-3">
                                {startDate && (
                                    <div className="flex flex-col gap-1">
                                        <div className="text-xs text-muted-foreground">Start Date</div>
                                        <div className="flex items-center gap-2 text-sm text-slate-200">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            {format(startDate, "MMM d, yyyy 'at' HH:mm")}
                                        </div>
                                    </div>
                                )}

                                {dueDate && (
                                    <div className="flex flex-col gap-1">
                                        <div className="text-xs text-muted-foreground">Due Date</div>
                                        <div className="flex items-center gap-2 text-sm text-slate-200">
                                            <Calendar className="w-4 h-4 text-red-400" />
                                            {format(dueDate, "MMM d, yyyy 'at' HH:mm")}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col gap-1">
                                    <div className="text-xs text-muted-foreground">Duration</div>
                                    <div className="flex items-center gap-2 text-sm text-slate-200">
                                        <Clock className="w-4 h-4 text-orange-400" />
                                        {Math.floor(activity.duration / 60)}h {activity.duration % 60}m
                                    </div>
                                </div>

                                {activity.recurrencePattern && activity.isRecurring && (
                                    <div className="flex flex-col gap-1">
                                        <div className="text-xs text-muted-foreground">Recurrence</div>
                                        <div className="flex items-center gap-2 text-sm text-slate-200">
                                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                                            {activity.recurrencePattern}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 border-t border-white/10 pt-4 mt-4">
                    <div className="flex w-full justify-between items-center">
                        <Button
                            variant="destructive"
                            onClick={() => onDelete(activity.id)}
                            className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => onEdit(activity)}
                                className="border-white/10 hover:bg-white/5"
                            >
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                            <Button
                                onClick={() => onEvaluate(activity.id)}
                                className="bg-primary hover:bg-primary/90 text-white"
                            >
                                <Award className="w-4 h-4 mr-2" />
                                Evaluation
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
