"use client";

import { useEffect, useState } from "react";
import { User } from "@/types/user";
import { getFilteredUsers, deleteUser } from "@/lib/user-api";
import { getAllCampuses, getAllPromotions, getAllGrades } from "@/lib/admin-api";
import { Campus, Promotion, Grade } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    Plus,
    Loader2,
    MoreVertical,
    Trash2,
    Edit,
    User as UserIcon,
    Shield,
    MapPin,
    GraduationCap
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { motion, AnimatePresence } from "framer-motion";
import CreateStudentDialog from "@/components/students/CreateStudentDialog";
import EditStudentDialog from "@/components/students/EditStudentDialog";

export default function StudentManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Filters
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);

    const [selectedCampus, setSelectedCampus] = useState<string>("ALL");
    const [selectedPromotion, setSelectedPromotion] = useState<string>("ALL");
    const [selectedGrade, setSelectedGrade] = useState<string>("ALL");
    const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Dialogs
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params: any = {
                page: currentPage,
                size: pageSize,
                query: searchTerm,
                role: "LEARNER" // Force learner role
            };

            if (selectedCampus && selectedCampus !== "ALL") params.campusId = parseInt(selectedCampus);
            if (selectedPromotion && selectedPromotion !== "ALL") params.promotionId = parseInt(selectedPromotion);
            if (selectedGrade && selectedGrade !== "ALL") params.gradeId = parseInt(selectedGrade);
            if (selectedStatus && selectedStatus !== "ALL") params.status = selectedStatus;

            const response = await getFilteredUsers(params);
            setUsers(response.content);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error("Failed to fetch students", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [c, p, g] = await Promise.all([
                    getAllCampuses(),
                    getAllPromotions(),
                    getAllGrades()
                ]);
                setCampuses(c);
                setPromotions(p);
                setGrades(g);
            } catch (error) {
                console.error("Failed to fetch filters", error);
            }
        };
        fetchFilters();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, currentPage, selectedCampus, selectedPromotion, selectedGrade, selectedStatus]);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this student?")) return;
        try {
            await deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
        } catch (error) {
            console.error("Failed to delete user", error);
            alert("Failed to delete student");
        }
    };

    return (
        <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
            <div className="p-8 space-y-8 min-h-screen text-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            Student Management
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage student accounts and academic details
                        </p>
                    </div>
                    <Button
                        className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                        onClick={() => setIsCreateOpen(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Student
                    </Button>
                </div>

                {/* Filters */}
                <Card className="border-white/10 bg-black/40 backdrop-blur-xl p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search students..."
                                className="pl-10 bg-white/5 border-white/10 text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Campus" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Campuses</SelectItem>
                                {campuses.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={selectedPromotion} onValueChange={setSelectedPromotion}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Promotion" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Promotions</SelectItem>
                                {promotions.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Grade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Grades</SelectItem>
                                {grades.map(g => <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                                <SelectItem value="BANNED">Banned</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </Card>

                {/* Table */}
                <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white/5 text-muted-foreground uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Student</th>
                                        <th className="px-6 py-4 font-medium">Info</th>
                                        <th className="px-6 py-4 font-medium">Academic</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                            </td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                                No students found
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <motion.tr
                                                key={user.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="hover:bg-white/5 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                                                            {user.profileImage ? (
                                                                <img src={user.profileImage} alt={user.username} className="w-full h-full object-cover" />
                                                            ) : (
                                                                user.firstName ? user.firstName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-white">
                                                                {user.firstName} {user.lastName}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">@{user.username}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-xs text-slate-300">
                                                            <span className="text-muted-foreground w-4">📧</span>
                                                            {user.email}
                                                        </div>
                                                        {user.phone && (
                                                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                                                <span className="text-muted-foreground w-4">📱</span>
                                                                {user.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        {user.campusName && (
                                                            <div className="flex items-center gap-2 text-xs">
                                                                <MapPin className="w-3 h-3 text-primary" />
                                                                {user.campusName}
                                                            </div>
                                                        )}
                                                        {user.promotionName && (
                                                            <div className="flex items-center gap-2 text-xs">
                                                                <GraduationCap className="w-3 h-3 text-primary" />
                                                                {user.promotionName}
                                                            </div>
                                                        )}
                                                        {user.currentClassroomName && (
                                                            <div className="text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10 w-fit">
                                                                {user.currentClassroomName}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${user.statusName === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                            user.statusName === 'BANNED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                                'bg-white/5 text-muted-foreground border-white/10'
                                                        }`}>
                                                        {user.statusName || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                                                                <MoreVertical className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-[#0a0a0f] border-white/10 text-white">
                                                            <DropdownMenuItem
                                                                className="hover:bg-white/10 cursor-pointer"
                                                                onClick={() => {
                                                                    setSelectedUser(user);
                                                                    setIsEditOpen(true);
                                                                }}
                                                            >
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                Edit Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="hover:bg-red-500/20 text-red-400 cursor-pointer"
                                                                onClick={() => handleDelete(user.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Delete Student
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>

                    {/* Pagination */}
                    <div className="p-4 border-t border-white/10 flex items-center justify-between bg-white/5">
                        <div className="text-sm text-muted-foreground">
                            Page {currentPage + 1} of {totalPages || 1}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                disabled={currentPage === 0 || loading}
                                className="border-white/10 hover:bg-white/10 hover:text-white"
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                disabled={currentPage >= totalPages - 1 || loading}
                                className="border-white/10 hover:bg-white/10 hover:text-white"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Dialogs */}
                <CreateStudentDialog
                    isOpen={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    onSuccess={fetchData}
                    campuses={campuses}
                    promotions={promotions}
                    grades={grades}
                />

                {selectedUser && (
                    <EditStudentDialog
                        isOpen={isEditOpen}
                        onClose={() => {
                            setIsEditOpen(false);
                            setSelectedUser(null);
                        }}
                        onSuccess={fetchData}
                        user={selectedUser}
                        campuses={campuses}
                        promotions={promotions}
                        grades={grades}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
}
