"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Sprint } from "@/lib/program-api";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Users, FileText, Activity } from "lucide-react";
import { format, parseISO } from "date-fns";

interface SprintModalProps {
    sprint: Sprint | null;
    isOpen: boolean;
    onClose: () => void;
    color: string;
}

export default function SprintModal({ sprint, isOpen, onClose, color }: SprintModalProps) {
    if (!sprint) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl bg-[#0a0a0f] border-white/10 text-white p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-4 h-4 rounded-full shadow-[0_0_15px]"
                                style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}` }}
                            />
                            <DialogTitle className="text-2xl font-bold tracking-tight">
                                {sprint.title}
                            </DialogTitle>
                        </div>
                        <Badge variant="outline" className="text-xs bg-white/5 border-white/10 text-slate-400">
                            {format(parseISO(sprint.startDate), "MMM d, yyyy")} - {format(parseISO(sprint.endDate), "MMM d, yyyy")}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="px-6 pb-6 space-y-6">
                    {/* Objective */}
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <h4 className="text-sm font-semibold text-primary mb-1 uppercase tracking-wider">Objective</h4>
                        <p className="text-slate-300 leading-relaxed">{sprint.objective}</p>
                    </div>

                    {sprint.description && (
                        <p className="text-sm text-slate-400">{sprint.description}</p>
                    )}

                    <Separator className="bg-white/10" />

                    {sprint.technologies && (
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">Technologies & Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {sprint.technologies.split(',').map((tech, i) => (
                                    <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                        {tech.trim()}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <Separator className="bg-white/10" />

                    {/* Grid Layout for Related Items */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Classrooms */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
                                <Users className="w-4 h-4" />
                                <h3>Classrooms</h3>
                            </div>
                            <ScrollArea className="h-[200px] pr-4">
                                <div className="space-y-2">
                                    {/* Mock Data */}
                                    {['Class Brews Java', 'Angular Avengers', 'React Rebels'].map((cls, i) => (
                                        <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-slate-200 group-hover:text-white">{cls}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span>24 Students</span>
                                                <span className="w-1 h-1 bg-slate-600 rounded-full" />
                                                <span>Active</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Briefs */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-purple-400">
                                <FileText className="w-4 h-4" />
                                <h3>Briefs</h3>
                            </div>
                            <ScrollArea className="h-[200px] pr-4">
                                <div className="space-y-2">
                                    {/* Mock Data */}
                                    {['Portfolio Setup', 'Java OOP Basics', 'Database Design'].map((brief, i) => (
                                        <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                            <span className="text-sm font-medium text-slate-200">{brief}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge className="text-[10px] h-4 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30">
                                                    Required
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Activities */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-green-400">
                                <Activity className="w-4 h-4" />
                                <h3>Activities</h3>
                            </div>
                            <ScrollArea className="h-[200px] pr-4">
                                <div className="space-y-2">
                                    {/* Mock Data */}
                                    {['Morning Standup', 'Live Coding Session', 'Git Workshop'].map((activity, i) => (
                                        <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                            <span className="text-sm font-medium text-slate-200">{activity}</span>
                                            <div className="text-xs text-slate-500 mt-1">
                                                Today, 10:00 AM
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
