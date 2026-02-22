"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/user";
import { updateUser } from "@/lib/user-api";
import { Campus, Promotion, Grade } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X, Edit, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
// import { useToast } from "@/components/ui/use-toast";

interface EditStudentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: User;
    campuses: Campus[];
    promotions: Promotion[];
    grades: Grade[];
}

export default function EditStudentDialog({ isOpen, onClose, onSuccess, user, campuses, promotions, grades }: EditStudentDialogProps) {
    const [isSaving, setIsSaving] = useState(false);
    // const { toast } = useToast();

    const [formData, setFormData] = useState<Partial<User>>({});

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                address: user.address,
                birthDate: user.birthDate,
                cin: user.cin,
                gender: user.gender,
                campusId: user.campusId,
                promotionId: user.promotionId,
                gradeId: user.gradeId
            });
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateUser(user.id, { ...user, ...formData });
            // toast({ title: "Success", description: "Student updated successfully" });
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to update student", error);
            // toast({ title: "Error", description: "Failed to update student", variant: "destructive" });
            alert("Failed to update student");
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
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#0a0a0f] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Edit className="w-5 h-5 text-primary" />
                                Edit Student: {user.username}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <form id="edit-student-form" onSubmit={handleSave} className="space-y-6">
                                {/* Personal Info */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-b border-white/10 pb-2">Personal Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-300">Email *</label>
                                            <Input
                                                required
                                                type="email"
                                                value={formData.email || ''}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-300">First Name *</label>
                                            <Input
                                                required
                                                value={formData.firstName || ''}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-300">Last Name *</label>
                                            <Input
                                                required
                                                value={formData.lastName || ''}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-300">Gender</label>
                                            <Select
                                                value={formData.gender || user.gender}
                                                onValueChange={(val) => setFormData({ ...formData, gender: val })}
                                            >
                                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                    <SelectValue placeholder="Select Gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MALE">Male</SelectItem>
                                                    <SelectItem value="FEMALE">Female</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-300">Birth Date</label>
                                            <Input
                                                type="date"
                                                value={formData.birthDate || ''}
                                                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-300">CIN</label>
                                            <Input
                                                value={formData.cin || ''}
                                                onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-300">Phone</label>
                                            <Input
                                                value={formData.phone || ''}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-300">Address</label>
                                            <Input
                                                value={formData.address || ''}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Academic Info */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-b border-white/10 pb-2">Academic Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-300">Campus</label>
                                            <Select
                                                value={formData.campusId?.toString() || user.campusId?.toString()}
                                                onValueChange={(val) => setFormData({ ...formData, campusId: parseInt(val) })}
                                            >
                                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                    <SelectValue placeholder="Select Campus" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {campuses.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-300">Promotion</label>
                                            <Select
                                                value={formData.promotionId?.toString() || user.promotionId?.toString()}
                                                onValueChange={(val) => setFormData({ ...formData, promotionId: parseInt(val) })}
                                            >
                                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                    <SelectValue placeholder="Select Promotion" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {promotions.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-300">Grade</label>
                                            <Select
                                                value={formData.gradeId?.toString() || user.gradeId?.toString()}
                                                onValueChange={(val) => setFormData({ ...formData, gradeId: parseInt(val) })}
                                            >
                                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                    <SelectValue placeholder="Select Grade" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {grades.map(g => <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                            <Button variant="ghost" onClick={onClose} disabled={isSaving}>Cancel</Button>
                            <Button type="submit" form="edit-student-form" disabled={isSaving} className="shadow-lg shadow-primary/20">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Changes
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
