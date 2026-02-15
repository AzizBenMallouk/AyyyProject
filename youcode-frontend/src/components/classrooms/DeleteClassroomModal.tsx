"use client";

import { useState, useEffect } from "react";
import { Classroom } from "@/types/classroom";
import { Activity, getActivitiesByClassroom } from "@/lib/activity-api";
import { getEnrolledLearners, deleteClassroom } from "@/lib/classroom-api";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Users, BookOpen, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DeleteClassroomModalProps {
    classroom: Classroom | null;
    onClose: () => void;
    onDeleted: (id: number) => void;
}

export default function DeleteClassroomModal({ classroom, onClose, onDeleted }: DeleteClassroomModalProps) {
    const [loading, setLoading] = useState(false);
    const [fetchingDetails, setFetchingDetails] = useState(false);
    const [details, setDetails] = useState<{ learners: number; activities: number } | null>(null);

    useEffect(() => {
        if (classroom) {
            const fetchDetails = async () => {
                setFetchingDetails(true);
                try {
                    const [learners, activities] = await Promise.all([
                        getEnrolledLearners(classroom.id),
                        getActivitiesByClassroom(classroom.id)
                    ]);
                    setDetails({
                        learners: learners.length,
                        activities: activities.length
                    });
                } catch (error) {
                    console.error("Failed to fetch classroom details for deletion", error);
                } finally {
                    setFetchingDetails(false);
                }
            };
            fetchDetails();
        } else {
            setDetails(null);
        }
    }, [classroom]);

    const handleDelete = async () => {
        if (!classroom) return;
        setLoading(true);
        try {
            await deleteClassroom(classroom.id);
            onDeleted(classroom.id);
            onClose();
        } catch (error) {
            alert("Failed to delete classroom");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {classroom && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-white"
                    >
                        <div className="p-6">
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/5 transition-colors"
                            >
                                <X className="h-4 w-4 text-muted-foreground" />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 mb-6">
                                    <AlertTriangle className="h-8 w-8 text-red-500" />
                                </div>
                                <h2 className="text-2xl font-bold">Delete Classroom?</h2>
                                <p className="text-muted-foreground mt-3 leading-relaxed">
                                    This action cannot be undone. All data associated with <span className="text-white font-semibold">"{classroom?.name}"</span> will be permanently removed.
                                </p>
                            </div>

                            <div className="mt-8 space-y-4">
                                <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Impact Summary</div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                <Users className="h-4 w-4" />
                                            </div>
                                            <span className="text-sm">Enrolled Learners</span>
                                        </div>
                                        <span className="text-lg font-bold text-white">
                                            {fetchingDetails ? <Loader2 className="h-4 w-4 animate-spin" /> : details?.learners ?? 0}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                <BookOpen className="h-4 w-4" />
                                            </div>
                                            <span className="text-sm">Activities & Assignments</span>
                                        </div>
                                        <span className="text-lg font-bold text-white">
                                            {fetchingDetails ? <Loader2 className="h-4 w-4 animate-spin" /> : details?.activities ?? 0}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-[12px] text-red-400/80 leading-relaxed">
                                    <span className="font-bold text-red-400 mr-2">CRITICAL:</span>
                                    Deleting this classroom will also remove all student progress tracking, submitted assignments, and event history.
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="flex-1 h-12 bg-white/5 hover:bg-white/10 border-white/5"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleDelete}
                                    disabled={loading || fetchingDetails}
                                    className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/20 transition-all active:scale-95"
                                >
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Delete Classroom"}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
