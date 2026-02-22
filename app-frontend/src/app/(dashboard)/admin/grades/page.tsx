"use client";

import { useEffect, useState } from "react";
import { Grade } from "@/types/admin";
import { getAllGrades, createGrade } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Search,
    Plus,
    Loader2,
    Award,
    X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function GradeManagementPage() {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState<Partial<Grade>>({
        name: "",
        description: "",
    });

    const fetchGrades = async () => {
        setLoading(true);
        try {
            const data = await getAllGrades();
            setGrades(data);
        } catch (error) {
            console.error("Failed to fetch grades", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGrades();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await createGrade(formData);
            setIsModalOpen(false);
            fetchGrades();
        } catch (error) {
            alert("Failed to save grade");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredGrades = grades.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="p-8 space-y-8 min-h-screen text-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            Grade Management
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage academic levels and grades
                        </p>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Grade
                    </Button>
                </div>

                <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
                    <CardHeader>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search grades..."
                                className="pl-10 bg-white/5 border-white/10 focus:ring-primary/50 text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border border-white/10 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white/5 text-muted-foreground uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Name</th>
                                        <th className="px-6 py-4 font-medium">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={2} className="px-6 py-8 text-center text-muted-foreground">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                            </td>
                                        </tr>
                                    ) : filteredGrades.length === 0 ? (
                                        <tr>
                                            <td colSpan={2} className="px-6 py-8 text-center text-muted-foreground">
                                                No grades found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredGrades.map((grade) => (
                                            <motion.tr
                                                key={grade.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="hover:bg-white/5 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                                                            <Award className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <span className="font-medium text-white">{grade.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {grade.description}
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                                onClick={() => setIsModalOpen(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                            >
                                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                    <h2 className="text-lg font-semibold text-white">Add New Grade</h2>
                                    <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase">Grade name</label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="bg-white/5 border-white/10 text-white"
                                            placeholder="e.g. Senior"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase">Description</label>
                                        <Input
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                </div>

                                <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button onClick={handleSave} disabled={isSaving}>
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        Create Grade
                                    </Button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </ProtectedRoute>
    );
}
