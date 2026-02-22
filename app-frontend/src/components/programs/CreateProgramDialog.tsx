"use client";

import { useState } from "react";
import { createProgram } from "@/lib/program-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";

interface CreateProgramDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateProgramDialog({ isOpen, onClose, onSuccess }: CreateProgramDialogProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        speciality: ""
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await createProgram(formData);
            setFormData({ title: "", description: "", speciality: "" });
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to create program", error);
            alert("Failed to create program");
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
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-primary" />
                                Create Program
                            </h2>
                            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="p-6">
                            <form id="create-program-form" onSubmit={handleSave} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-300">Title *</label>
                                    <Input
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white"
                                        placeholder="e.g. Full Stack Java/Angular"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-300">Speciality *</label>
                                    <Input
                                        required
                                        value={formData.speciality}
                                        onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white"
                                        placeholder="e.g. Java/Angular"
                                    />
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
                            <Button type="submit" form="create-program-form" disabled={isSaving} className="shadow-lg shadow-primary/20">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Create Program
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
