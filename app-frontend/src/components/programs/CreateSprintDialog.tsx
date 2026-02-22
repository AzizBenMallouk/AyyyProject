"use client";

import { useState, useEffect } from "react";
import { createSprint, updateSprint } from "@/lib/program-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X, Plus, Calendar as CalendarIcon, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";

interface CreateSprintDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    programId: number;
    initialData?: any; // Sprint to edit
}

export default function CreateSprintDialog({ isOpen, onClose, onSuccess, programId, initialData }: CreateSprintDialogProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        objective: "",
        description: "",
        startDate: "",
        endDate: "",
        programId: programId
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                objective: initialData.objective,
                description: initialData.description,
                startDate: initialData.startDate,
                endDate: initialData.endDate,
                programId: programId
            });
        } else {
            // Reset form when opening for create
            setFormData({
                title: "",
                objective: "",
                description: "",
                startDate: "",
                endDate: "",
                programId: programId
            });
        }
    }, [initialData, programId, isOpen]);


    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (initialData) {
                await updateSprint(initialData.id, formData);
            } else {
                await createSprint(formData);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to save sprint", error);
            alert("Failed to save sprint");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#0a0a0f] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                {initialData ? <Save className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                                {initialData ? "Edit Sprint" : "Create Sprint"}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="p-6">
                            <form id="create-sprint-form" onSubmit={handleSave} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-300">Title *</label>
                                    <Input
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white"
                                        placeholder="e.g. Sprint 1: Fundamentals"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-300">Objective *</label>
                                    <Input
                                        required
                                        value={formData.objective}
                                        onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white"
                                        placeholder="e.g. Master OOP basics"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-300">Start Date *</label>
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                type="date"
                                                required
                                                value={formData.startDate}
                                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                className="pl-10 bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-300">End Date *</label>
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                type="date"
                                                required
                                                value={formData.endDate}
                                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                                className="pl-10 bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-300">Description</label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white"
                                        rows={4}
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                            <Button variant="ghost" onClick={onClose} disabled={isSaving}>Cancel</Button>
                            <Button type="submit" form="create-sprint-form" disabled={isSaving} className="shadow-lg shadow-primary/20">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {initialData ? "Save Changes" : "Create Sprint"}
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
