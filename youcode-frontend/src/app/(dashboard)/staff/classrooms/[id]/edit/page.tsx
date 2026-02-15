"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Classroom } from "@/types/classroom";
import { Campus, Promotion, Grade } from "@/types/admin";
import { getClassroomById, updateClassroom } from "@/lib/classroom-api";
import { getAllCampuses, getAllPromotions, getAllGrades } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Loader2,
    ArrowLeft,
    Save,
    Image as ImageIcon,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Link from "next/link";

export default function EditClassroomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Options
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);

    const [formData, setFormData] = useState<Partial<Classroom>>({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        profileImage: "",
        campusId: undefined,
        promotionId: undefined,
        gradeId: undefined,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [c, p, g, classroom] = await Promise.all([
                    getAllCampuses(),
                    getAllPromotions(),
                    getAllGrades(),
                    getClassroomById(parseInt(id))
                ]);
                setCampuses(c);
                setPromotions(p);
                setGrades(g);

                setFormData({
                    name: classroom.name,
                    description: classroom.description,
                    startDate: classroom.startDate,
                    endDate: classroom.endDate,
                    profileImage: classroom.profileImage || "",
                    campusId: classroom.campusId,
                    promotionId: classroom.promotionId,
                    gradeId: classroom.gradeId,
                });
            } catch (error) {
                console.error("Failed to fetch data", error);
                alert("Failed to load classroom details");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateClassroom(parseInt(id), formData);
            router.push("/staff/classrooms");
        } catch (error) {
            alert("Failed to update classroom");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-24">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['STAFF', 'TRAINER', 'ADMIN']}>
            <div className="p-8 max-w-4xl mx-auto space-y-8 min-h-screen text-slate-200">
                <div className="flex items-center gap-4">
                    <Link href="/staff/classrooms">
                        <Button variant="ghost" size="icon" className="h-10 w-10 bg-white/5 border border-white/10 hover:bg-white/10">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            Edit Classroom
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Update classroom settings and metadata
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSave}>
                    <Card className="border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden">
                        <CardHeader className="border-b border-white/5 bg-white/5">
                            <CardTitle className="text-lg">Classroom Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Classroom Name</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Photo URL</label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={formData.profileImage}
                                            onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                                            className="pl-10 bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full min-h-[100px] p-4 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-white transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Campus</label>
                                    <select
                                        value={formData.campusId}
                                        onChange={(e) => setFormData({ ...formData, campusId: parseInt(e.target.value) })}
                                        className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        required
                                    >
                                        <option value="" disabled className="bg-[#0a0a0f]">Select Campus</option>
                                        {campuses.map(c => <option key={c.id} value={c.id} className="bg-[#0a0a0f]">{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Promotion</label>
                                    <select
                                        value={formData.promotionId}
                                        onChange={(e) => setFormData({ ...formData, promotionId: parseInt(e.target.value) })}
                                        className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        required
                                    >
                                        <option value="" disabled className="bg-[#0a0a0f]">Select Promotion</option>
                                        {promotions.map(p => <option key={p.id} value={p.id} className="bg-[#0a0a0f]">{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Grade Level</label>
                                    <select
                                        value={formData.gradeId}
                                        onChange={(e) => setFormData({ ...formData, gradeId: parseInt(e.target.value) })}
                                        className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        required
                                    >
                                        <option value="" disabled className="bg-[#0a0a0f]">Select Grade</option>
                                        {grades.map(g => <option key={g.id} value={g.id} className="bg-[#0a0a0f]">{g.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Start Date</label>
                                    <Input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">End Date</label>
                                    <Input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5 flex justify-end gap-3">
                                <Link href="/staff/classrooms">
                                    <Button type="button" variant="ghost">Cancel</Button>
                                </Link>
                                <Button type="submit" disabled={isSaving} className="px-8 shadow-lg shadow-primary/20">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </ProtectedRoute>
    );
}
