"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Classroom } from "@/types/classroom";
import { Campus, Promotion, Grade } from "@/types/admin";
import { User } from "@/types/user";
import { createClassroom, enrollLearner } from "@/lib/classroom-api";
import { getAllCampuses, getAllPromotions, getAllGrades } from "@/lib/admin-api";
import { getUsersByRole } from "@/lib/user-api";
import StudentDataTable from "@/components/classrooms/StudentDataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Loader2,
    ArrowLeft,
    Save,
    Image as ImageIcon,
    Check,
    Users,
    ArrowRight,
    Upload,
    Search
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Link from "next/link";

export default function NewClassroomPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    // Options
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [trainerSearch, setTrainerSearch] = useState("");
    const [selectedLearnerIds, setSelectedLearnerIds] = useState<number[]>([]);

    const [formData, setFormData] = useState<Partial<Classroom>>({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        profileImage: "",
        trainerId: undefined,
        campusId: undefined,
        promotionId: undefined,
        gradeId: undefined,
        bootcamp: false,
        speciality: "",
    });

    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [c, p, g, t] = await Promise.all([
                    getAllCampuses(),
                    getAllPromotions(),
                    getAllGrades(),
                    getUsersByRole("TRAINER")
                ]);
                setCampuses(c);
                setPromotions(p);
                setGrades(g);
                setTeachers(t);

                const initialData: Partial<Classroom> = {};
                if (c.length > 0) initialData.campusId = c[0].id;
                if (p.length > 0) {
                    const lastPromo = p[p.length - 1];
                    initialData.promotionId = lastPromo.id;
                }
                if (g.length > 0) initialData.gradeId = g[0].id;
                if (t.length > 0) initialData.trainerId = t[0].id;

                setFormData(prev => ({ ...prev, ...initialData }));
            } catch (error) {
                console.error("Failed to fetch options", error);
            }
        };
        fetchOptions();
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("category", "classrooms");

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';
            const response = await fetch(`${apiUrl}/files/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: uploadData,
            });

            if (!response.ok) throw new Error("Upload failed");
            const data = await response.json();
            // Construct view URL correctly
            const imageUrl = `${apiUrl}/files/view/classrooms/${data.filename}`;
            setFormData(prev => ({ ...prev, profileImage: imageUrl }));
        } catch (error) {
            console.error("Image upload failed", error);
            alert("Failed to upload image");
        } finally {
            setUploadingImage(false);
        }
    };

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = "Name is required";
        if (!formData.campusId) newErrors.campusId = "Campus is required";
        if (!formData.promotionId) newErrors.promotionId = "Promotion is required";
        if (!formData.gradeId) newErrors.gradeId = "Grade is required";
        if (!formData.trainerId) newErrors.trainerId = "Trainer is required";
        if (!formData.speciality) newErrors.speciality = "Speciality is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (!validateStep1()) return;

        // Inheritance logic for dates
        let finalStartDate = formData.startDate;
        let finalEndDate = formData.endDate;

        if (!finalStartDate || !finalEndDate) {
            const selectedPromotion = promotions.find(p => p.id === formData.promotionId);
            if (selectedPromotion) {
                if (!finalStartDate) finalStartDate = `${selectedPromotion.startYear}-09-01`;
                if (!finalEndDate) finalEndDate = `${selectedPromotion.endYear}-06-30`;
            }
        }

        setFormData(prev => ({
            ...prev,
            startDate: finalStartDate,
            endDate: finalEndDate
        }));

        setStep(2);
    };

    const handleCreate = async () => {
        if (selectedLearnerIds.length === 0) {
            if (!confirm("Are you sure you want to create this classroom without any learners?")) {
                return;
            }
        }

        setLoading(true);
        try {
            // Include studentIds in the creation payload
            const payload = {
                ...formData,
                studentIds: selectedLearnerIds
            };

            await createClassroom(payload);

            // Enrollment is now handled by the backend during creation

            router.push("/staff/classrooms");
        } catch (error: any) {
            console.error("Failed to create classroom", error);
            alert(`Failed to create classroom: ${error.message || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };



    return (
        <ProtectedRoute allowedRoles={['STAFF', 'TRAINER', 'ADMIN']}>
            <div className="p-8 max-w-full mx-auto space-y-8 min-h-screen text-slate-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/staff/classrooms">
                            <Button variant="ghost" size="icon" className="h-10 w-10 bg-white/5 border border-white/10 hover:bg-white/10">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                                {step === 1 ? "Create Classroom" : "Assign Learners"}
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                {step === 1 ? "Step 1: Basic Information" : "Step 2: Enrollment"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`h-2 w-12 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-white/10'}`} />
                        <div className={`h-2 w-12 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-white/10'}`} />
                    </div>
                </div>

                {step === 1 ? (
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
                                        placeholder="e.g. Full Stack Bootcamp #1"
                                        required
                                    />
                                    {errors.name && <p className="text-red-400 text-[10px] mt-1">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Classroom Image</label>
                                    <div className="flex gap-4 items-center">
                                        <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                            {formData.profileImage ? (
                                                <img src={formData.profileImage} alt="Preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="relative flex-1">
                                            <input
                                                type="file"
                                                id="image-upload"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                accept="image/*"
                                                disabled={uploadingImage}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full bg-white/5 border-white/10"
                                                disabled={uploadingImage}
                                                onClick={() => document.getElementById('image-upload')?.click()}
                                            >
                                                {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                                {formData.profileImage ? "Change Image" : "Upload Image"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full min-h-[100px] p-4 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-white transition-all"
                                    placeholder="Enter classroom description and goals..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    {errors.campusId && <p className="text-red-400 text-[10px] mt-1">{errors.campusId}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Lead Teacher / Trainer</label>
                                    <div className="space-y-2 relative">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search trainer..."
                                                    value={trainerSearch}
                                                    onChange={(e) => setTrainerSearch(e.target.value)}
                                                    className="bg-white/5 border-white/10 text-white text-xs h-9 pl-8"
                                                />
                                            </div>
                                            {formData.trainerId && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setFormData({ ...formData, trainerId: undefined });
                                                        setTrainerSearch("");
                                                    }}
                                                    className="h-9 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                                >
                                                    Clear
                                                </Button>
                                            )}
                                        </div>

                                        {trainerSearch && !formData.trainerId && (
                                            <div className="absolute z-50 w-full mt-1 bg-[#0a0a0f] border border-white/10 rounded-lg shadow-2xl max-h-[200px] overflow-y-auto custom-scrollbar overflow-x-hidden">
                                                {teachers
                                                    .filter(t => `${t.firstName} ${t.lastName} ${t.username}`.toLowerCase().includes(trainerSearch.toLowerCase()))
                                                    .map(t => (
                                                        <button
                                                            key={t.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData({ ...formData, trainerId: t.id });
                                                                setTrainerSearch(`${t.firstName} ${t.lastName}`);
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm hover:bg-primary/20 hover:text-primary transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                                                        >
                                                            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                                                                {t.firstName?.[0]}{t.lastName?.[0]}
                                                            </div>
                                                            <span>{t.firstName} {t.lastName}</span>
                                                        </button>
                                                    ))
                                                }
                                                {teachers.filter(t => `${t.firstName} ${t.lastName} ${t.username}`.toLowerCase().includes(trainerSearch.toLowerCase())).length === 0 && (
                                                    <div className="p-4 text-center text-xs text-muted-foreground">
                                                        No trainers found
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {!trainerSearch && !formData.trainerId && (
                                            <p className="text-[10px] text-muted-foreground italic">Type to search and select a trainer</p>
                                        )}

                                        {formData.trainerId && (
                                            <div className="flex items-center gap-3 p-2 bg-primary/10 border border-primary/20 rounded-lg">
                                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                                    {teachers.find(t => t.id === formData.trainerId)?.firstName?.[0]}
                                                    {teachers.find(t => t.id === formData.trainerId)?.lastName?.[0]}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-white">
                                                        {teachers.find(t => t.id === formData.trainerId)?.firstName} {teachers.find(t => t.id === formData.trainerId)?.lastName}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground uppercase">Selected Trainer</div>
                                                </div>
                                                <Check className="h-4 w-4 text-primary" />
                                            </div>
                                        )}
                                    </div>
                                    {errors.trainerId && <p className="text-red-400 text-[10px] mt-1">{errors.trainerId}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    {errors.promotionId && <p className="text-red-400 text-[10px] mt-1">{errors.promotionId}</p>}
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
                                    {errors.gradeId && <p className="text-red-400 text-[10px] mt-1">{errors.gradeId}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Speciality</label>
                                    <select
                                        value={formData.speciality}
                                        onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
                                        className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        required
                                    >
                                        {["PHP/Laravel", "AI", "JAVA/Spring", "MERN", "Data"].map(s => (
                                            <option key={s} value={s} className="bg-[#0a0a0f]">{s}</option>
                                        ))}
                                    </select>
                                    {errors.speciality && <p className="text-red-400 text-[10px] mt-1">{errors.speciality}</p>}
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg h-[42px] mt-auto">
                                    <div className="space-y-0.5">
                                        <label className="text-sm font-medium text-white">Bootcamp Mode</label>
                                        <p className="text-xs text-muted-foreground">Is this an intensive bootcamp?</p>
                                    </div>
                                    <Switch
                                        checked={formData.bootcamp}
                                        onCheckedChange={(checked) => setFormData({ ...formData, bootcamp: checked })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Start Date (Optional - inherits from Promotion)</label>
                                    <Input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">End Date (Optional - inherits from Promotion)</label>
                                    <Input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5 flex justify-end gap-3">
                                <Link href="/staff/classrooms">
                                    <Button type="button" variant="ghost">Cancel</Button>
                                </Link>
                                <Button type="button" onClick={handleNext} className="px-8 shadow-lg shadow-primary/20">
                                    Next: Assign Learners <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden">
                        <CardContent className="p-8 space-y-6">
                            <StudentDataTable
                                selectedIds={selectedLearnerIds}
                                onToggle={(id) => setSelectedLearnerIds(prev =>
                                    prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                                )}
                                onSelectAll={(ids) => setSelectedLearnerIds(ids)}
                                campuses={campuses}
                                promotions={promotions}
                                grades={grades}
                                defaultCampusId={user?.campusId}
                                defaultStatus="ACTIVE"
                            />

                            <div className="pt-8 border-t border-white/5 flex justify-between">
                                <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                </Button>
                                <div className="flex gap-3">
                                    <Button type="button" onClick={handleCreate} disabled={loading} className="px-8 shadow-lg shadow-primary/20">
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                        Finish & Create Classroom
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </ProtectedRoute>
    );
}
