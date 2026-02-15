"use client";

import { useEffect, useState } from "react";
import { Classroom } from "@/types/classroom";
import { getAllClassrooms } from "@/lib/classroom-api";
import { getAllCampuses, getAllPromotions, getAllGrades } from "@/lib/admin-api";
import { getUsersByRole } from "@/lib/user-api";
import { Campus, Promotion, Grade } from "@/types/admin";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Plus,
    Loader2,
    Users,
    Calendar,
    Edit,
    Trash2,
    Search,
    MapPin,
    GraduationCap,
    Filter
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import DeleteClassroomModal from "@/components/classrooms/DeleteClassroomModal";

export default function StaffClassroomListPage() {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState(true);
    const [classroomToDelete, setClassroomToDelete] = useState<Classroom | null>(null);
    const { user } = useAuth();

    // Pagination state
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 9; // 3x3 grid

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [campusId, setCampusId] = useState<number | undefined>(undefined);
    const [promotionId, setPromotionId] = useState<number | undefined>(undefined);
    const [gradeId, setGradeId] = useState<number | undefined>(undefined);
    const [speciality, setSpeciality] = useState<string>("");
    const [trainerId, setTrainerId] = useState<number | undefined>(undefined);
    const [active, setActive] = useState<boolean | undefined>(undefined); // undefined means all, true active, false inactive

    // Options for dropdowns
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [trainers, setTrainers] = useState<User[]>([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [c, p, g, t] = await Promise.all([
                    getAllCampuses(),
                    getAllPromotions(),
                    getAllGrades(),
                    getUsersByRole('TRAINER')
                ]);
                setCampuses(c);
                setPromotions(p);
                setGrades(g);
                setTrainers(t);
            } catch (error) {
                console.error("Failed to fetch options", error);
            }
        };
        fetchOptions();
    }, []);

    const fetchClassrooms = async () => {
        setLoading(true);
        try {
            const data = await getAllClassrooms({
                campusId,
                promotionId,
                gradeId,
                speciality,
                trainerId,
                active,
                page,
                size: pageSize
            });
            setClassrooms(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error) {
            console.error("Failed to fetch classrooms", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClassrooms();
    }, [user?.id, campusId, promotionId, gradeId, speciality, trainerId, active, page]);

    // Reset page to 0 when filters change
    useEffect(() => {
        setPage(0);
    }, [campusId, promotionId, gradeId, speciality, trainerId, active]);

    const handleDeleted = (id: number) => {
        setClassrooms(classrooms.filter(c => c.id !== id));
    };

    // Client-side search only filters the current page, ideally should be backend search
    // But for now keeping it simple or maybe we should move search to backend?
    // The current backend implementation does not have 'search' parameter for name.
    // Let's filter client side for now, but note that it only searches current page.
    const filteredClassrooms = classrooms.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ProtectedRoute allowedRoles={['STAFF', 'TRAINER', 'ADMIN']}>
            <div className="p-8 space-y-8 min-h-screen text-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            Classrooms
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage groups, student enrollments, and assignments
                        </p>
                    </div>
                    <Link href="/staff/classrooms/new">
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="w-4 h-4 mr-2" />
                            New Classroom
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 bg-black/40 p-4 rounded-xl border border-white/5 backdrop-blur-xl">
                    <div className="relative col-span-2 lg:col-span-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                            placeholder="Search..."
                            className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white bg-[#0a0a0f]"
                        value={campusId || ""}
                        onChange={(e) => setCampusId(e.target.value ? parseInt(e.target.value) : undefined)}
                    >
                        <option value="">All Campuses</option>
                        {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select
                        className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white bg-[#0a0a0f]"
                        value={promotionId || ""}
                        onChange={(e) => setPromotionId(e.target.value ? parseInt(e.target.value) : undefined)}
                    >
                        <option value="">All Promotions</option>
                        {promotions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select
                        className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white bg-[#0a0a0f]"
                        value={gradeId || ""}
                        onChange={(e) => setGradeId(e.target.value ? parseInt(e.target.value) : undefined)}
                    >
                        <option value="">All Grades</option>
                        {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <select
                        className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white bg-[#0a0a0f]"
                        value={speciality}
                        onChange={(e) => setSpeciality(e.target.value)}
                    >
                        <option value="">All Specialities</option>
                        {["PHP/Laravel", "AI", "JAVA/Spring", "MERN", "Data"].map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <select
                        className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white bg-[#0a0a0f]"
                        value={trainerId || ""}
                        onChange={(e) => setTrainerId(e.target.value ? parseInt(e.target.value) : undefined)}
                    >
                        <option value="">All Trainers</option>
                        {trainers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                    </select>
                    <select
                        className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white bg-[#0a0a0f]"
                        value={active === undefined ? "" : active.toString()}
                        onChange={(e) => {
                            const val = e.target.value;
                            setActive(val === "" ? undefined : val === "true");
                        }}
                    >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filteredClassrooms.length === 0 ? (
                    <Card className="border-white/10 bg-black/40 backdrop-blur-xl p-12 text-center">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                            <Users className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-white">No classrooms found</h3>
                        <p className="text-muted-foreground">You don't have any classrooms assigned yet.</p>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredClassrooms.map((classroom) => (
                                <motion.div
                                    key={classroom.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -5 }}
                                    className="group"
                                >
                                    <Card className="h-full border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden group-hover:border-primary/50 transition-all relative">
                                        <Link href={`/staff/classrooms/${classroom.id}`} className="absolute inset-0 z-10">
                                            <span className="sr-only">View Classroom</span>
                                        </Link>
                                        <div className="h-32 bg-gradient-to-br from-primary/20 via-black/40 to-secondary/20 relative">
                                            {classroom.profileImage && (
                                                <img
                                                    src={classroom.profileImage}
                                                    alt={classroom.name}
                                                    className="w-full h-full object-cover opacity-60"
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-black/40" />
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <span className="px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 text-[10px] uppercase font-bold tracking-wider">
                                                            {classroom.gradeName || "General"}
                                                        </span>
                                                        <h3 className="text-xl font-bold text-white mt-1 group-hover:text-primary transition-colors line-clamp-1">
                                                            {classroom.name}
                                                        </h3>
                                                        <div className="flex gap-2 mt-2">
                                                            {classroom.speciality && (
                                                                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] uppercase font-bold tracking-wider">
                                                                    {classroom.speciality}
                                                                </span>
                                                            )}
                                                            {classroom.bootcamp && (
                                                                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[10px] uppercase font-bold tracking-wider">
                                                                    Bootcamp
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="flex items-center gap-1 text-xs text-muted-foreground bg-black/60 px-2 py-1 rounded-full backdrop-blur-md">
                                                        <Users className="w-3 h-3 text-primary" />
                                                        {classroom.enrolledCount} Learner(s)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <CardContent className="p-4 space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <MapPin className="w-4 h-4 text-primary" />
                                                    <span>{classroom.campusName || "N/A"}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="w-4 h-4 text-primary" />
                                                    <span>{classroom.startDate} - {classroom.endDate}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <GraduationCap className="w-4 h-4 text-primary" />
                                                    <span>{classroom.promotionName || "N/A"}</span>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-white/5 flex gap-2 relative z-20">
                                                <Link href={`/staff/classrooms/${classroom.id}/edit`} className="flex-1">
                                                    <Button variant="ghost" className="w-full bg-white/5 border border-white/10 hover:bg-primary/20 hover:text-primary hover:border-primary/30 transition-all">
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all text-muted-foreground"
                                                    onClick={() => setClassroomToDelete(classroom)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="bg-white/5 border-white/10"
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {page + 1} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1}
                                    className="bg-white/5 border-white/10"
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}

                <DeleteClassroomModal
                    classroom={classroomToDelete}
                    onClose={() => setClassroomToDelete(null)}
                    onDeleted={handleDeleted}
                />
            </div>
        </ProtectedRoute>
    );
}
