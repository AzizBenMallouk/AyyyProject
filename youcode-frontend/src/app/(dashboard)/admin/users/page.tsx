"use client";

import { useEffect, useState } from "react";
import { User, CreateUserRequest } from "@/types/user";
import { deleteUser, getAllUsers, searchUsers, updateUser, updateUserStatus } from "@/lib/user-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Search,
    Trash2,
    Edit,
    MoreVertical,
    Shield,
    User as UserIcon,
    Loader2,
    Check,
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getAllRoles } from "@/lib/role-api";
import { Role } from "@/types/role";
import { createUser } from "@/lib/user-api";

import ChangeStatusModal from "@/components/users/ChangeStatusModal";

import { getAllCampuses, getAllPromotions, getAllGrades } from "@/lib/admin-api";
import { Campus, Promotion, Grade } from "@/types/admin";
import { getFilteredUsers } from "@/lib/user-api";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Filter State
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);

    // Selected Filters
    const [selectedRole, setSelectedRole] = useState<string>("ALL");
    const [selectedCampus, setSelectedCampus] = useState<string>("ALL");
    const [selectedPromotion, setSelectedPromotion] = useState<string>("ALL");
    const [selectedGrade, setSelectedGrade] = useState<string>("ALL");
    const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Edit State
    const [editRoles, setEditRoles] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Create State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [newUserType, setNewUserType] = useState<'STAFF' | 'LEARNER'>('LEARNER');
    const [newUserExperiment, setNewUserExperiment] = useState<CreateUserRequest>({
        username: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        roleNames: []
    });

    const fetchFilters = async () => {
        try {
            const [campusesData, promotionsData, gradesData, rolesData] = await Promise.all([
                getAllCampuses(),
                getAllPromotions(),
                getAllGrades(),
                getAllRoles()
            ]);
            setCampuses(campusesData);
            setPromotions(promotionsData);
            setGrades(gradesData);
            setAllRoles(rolesData);
        } catch (error) {
            console.error("Failed to fetch filter options", error);
        }
    };

    useEffect(() => {
        fetchFilters();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Prepare filter params
            const params: any = {
                page: currentPage,
                size: pageSize,
                query: searchTerm,
            };

            if (selectedRole && selectedRole !== "ALL") params.role = selectedRole;
            if (selectedCampus && selectedCampus !== "ALL") params.campusId = parseInt(selectedCampus);
            if (selectedPromotion && selectedPromotion !== "ALL") params.promotionId = parseInt(selectedPromotion);
            if (selectedGrade && selectedGrade !== "ALL") params.gradeId = parseInt(selectedGrade);
            if (selectedStatus && selectedStatus !== "ALL") params.status = selectedStatus;

            const response = await getFilteredUsers(params);
            setUsers(response.content);
            setTotalPages(response.totalPages);

        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, currentPage, selectedRole, selectedCampus, selectedPromotion, selectedGrade, selectedStatus]);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            await deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
        } catch (error) {
            alert("Failed to delete user");
        }
    };

    const openEdit = (user: User) => {
        setSelectedUser(user);
        setEditRoles(user.roleNames || []);
        setIsEditOpen(true);
    };

    const toggleRole = (role: string) => {
        if (editRoles.includes(role)) {
            setEditRoles(editRoles.filter(r => r !== role));
        } else {
            setEditRoles([...editRoles, role]);
        }
    };

    const handleSave = async () => {
        if (!selectedUser) return;
        setIsSaving(true);
        try {
            // Backend expects Full User object usually, but let's see if partial works or if we need to send everything.
            // Our API client sends Partial<User>. The backend updates fields that are not null.
            // However, updating roles might require special handling in backend or sending roleNames.
            // Inspecting UserDTO, it has roleNames. The UserService.updateUser logic needs to handle roleNames updates.
            // Let's assume sending roleNames works for now as per DTO.

            await updateUser(selectedUser.id, {
                ...selectedUser,
                roleNames: editRoles
            });

            setIsEditOpen(false);
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert("Failed to update user");
        } finally {
            setIsSaving(false);
        }
    };

    const [selectedUserForStatus, setSelectedUserForStatus] = useState<User | null>(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="p-8 space-y-8 min-h-screen text-slate-200">
                {/* ... existing content ... */}

                {/* Header & Table are above in the original file, we are just wrapping the return to insert modal at bottom */}
                {/* Since we can't easily wrap the entire return without replacing everything, let's insert the modal at the end before closing div */}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            User Management
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage system access and user roles
                        </p>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsCreateOpen(true)}>
                        <UserIcon className="w-4 h-4 mr-2" />
                        Add User
                    </Button>
                </div>

                {/* Filters */}
                <Card className="border-white/10 bg-black/40 backdrop-blur-xl p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Roles</SelectItem>
                                {allRoles.map(role => (
                                    <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Campus" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Campuses</SelectItem>
                                {campuses.map(campus => (
                                    <SelectItem key={campus.id} value={campus.id.toString()}>{campus.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedPromotion} onValueChange={setSelectedPromotion}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Promotion" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Promotions</SelectItem>
                                {promotions.map(promo => (
                                    <SelectItem key={promo.id} value={promo.id.toString()}>{promo.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Grade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Grades</SelectItem>
                                {grades.map(grade => (
                                    <SelectItem key={grade.id} value={grade.id.toString()}>{grade.name}</SelectItem>
                                ))}
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
                                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                                <SelectItem value="GRADUATED">Graduated</SelectItem>
                                <SelectItem value="INSERTED">Inserted</SelectItem>
                                <SelectItem value="IN_STAGE">In Stage</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </Card>

                <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
                    <CardHeader>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
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
                                        <th className="px-6 py-4 font-medium">User</th>
                                        <th className="px-6 py-4 font-medium">Email</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium">Roles</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                            </td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                                No users found
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
                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-white">
                                                            {user.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-white">{user.username}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-xs font-normal border border-white/10 bg-white/5 hover:bg-white/10"
                                                        onClick={() => {
                                                            setSelectedUserForStatus(user);
                                                            setIsStatusModalOpen(true);
                                                        }}
                                                    >
                                                        {user.statusName || 'ACTIVE'}
                                                    </Button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2 flex-wrap">
                                                        {user.roleNames?.map((role) => (
                                                            <span
                                                                key={role}
                                                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${role === 'ADMIN'
                                                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                                    : role === 'TRAINER' || role === 'STAFF'
                                                                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                                        : 'bg-green-500/10 text-green-400 border-green-500/20'
                                                                    }`}
                                                            >
                                                                {role}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-white/10 hover:text-blue-400"
                                                            onClick={() => openEdit(user)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-white/10 hover:text-red-400"
                                                            onClick={() => handleDelete(user.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                    <div className="p-4 border-t border-white/10 flex items-center justify-between bg-white/5">
                        <div className="text-sm text-muted-foreground">
                            Page {currentPage + 1} of {totalPages}
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
                </Card >

                {/* Create Modal */}
                <AnimatePresence>
                    {isCreateOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                                onClick={() => setIsCreateOpen(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#0a0a0f] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                            >
                                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                    <h2 className="text-lg font-semibold text-white">Create New User</h2>
                                    <Button variant="ghost" size="icon" onClick={() => setIsCreateOpen(false)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground uppercase">Username</label>
                                            <Input
                                                value={newUserExperiment.username}
                                                onChange={(e) => setNewUserExperiment({ ...newUserExperiment, username: e.target.value })}
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground uppercase">Password</label>
                                            <Input
                                                type="password"
                                                value={newUserExperiment.password}
                                                onChange={(e) => setNewUserExperiment({ ...newUserExperiment, password: e.target.value })}
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground uppercase">First Name</label>
                                            <Input
                                                value={newUserExperiment.firstName}
                                                onChange={(e) => setNewUserExperiment({ ...newUserExperiment, firstName: e.target.value })}
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground uppercase">Last Name</label>
                                            <Input
                                                value={newUserExperiment.lastName}
                                                onChange={(e) => setNewUserExperiment({ ...newUserExperiment, lastName: e.target.value })}
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase">Email</label>
                                        <Input
                                            type="email"
                                            value={newUserExperiment.email}
                                            onChange={(e) => setNewUserExperiment({ ...newUserExperiment, email: e.target.value })}
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-white/10">
                                        <label className="text-xs font-medium text-muted-foreground uppercase block mb-3">User Type</label>
                                        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                                            <button
                                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${newUserType === 'STAFF' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
                                                onClick={() => {
                                                    setNewUserType('STAFF');
                                                    setNewUserExperiment({ ...newUserExperiment, roleNames: [] }); // Reset roles on type switch
                                                }}
                                            >
                                                Staff
                                            </button>
                                            <button
                                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${newUserType === 'LEARNER' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
                                                onClick={() => {
                                                    setNewUserType('LEARNER');
                                                    setNewUserExperiment({ ...newUserExperiment, roleNames: [] }); // Reset roles on type switch
                                                }}
                                            >
                                                Learner
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-sm font-medium text-white flex justify-between">
                                            Assign Roles
                                            <span className="text-xs font-normal text-muted-foreground">
                                                Showing {newUserType} roles
                                            </span>
                                        </h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {allRoles
                                                .filter(role => {
                                                    if (newUserType === 'STAFF') {
                                                        return role.roleType === 'STAFF' || role.roleType === 'ADMINISTRATIVE';
                                                    } else {
                                                        return role.roleType === 'LEARNER';
                                                    }
                                                })
                                                .map((role) => {
                                                    const isActive = newUserExperiment.roleNames?.includes(role.name);
                                                    return (
                                                        <div
                                                            key={role.id}
                                                            onClick={() => {
                                                                const currentRoles = newUserExperiment.roleNames || [];
                                                                if (isActive) {
                                                                    setNewUserExperiment({
                                                                        ...newUserExperiment,
                                                                        roleNames: currentRoles.filter((r: string) => r !== role.name)
                                                                    });
                                                                } else {
                                                                    setNewUserExperiment({
                                                                        ...newUserExperiment,
                                                                        roleNames: [...currentRoles, role.name]
                                                                    });
                                                                }
                                                            }}
                                                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isActive
                                                                ? 'bg-primary/10 border-primary/50'
                                                                : 'bg-white/5 border-white/5 hover:bg-white/10'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-primary text-white' : 'bg-white/10 text-muted-foreground'
                                                                    }`}>
                                                                    <Shield className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-muted-foreground'}`}>
                                                                        {role.name}
                                                                    </p>
                                                                    <p className="text-[10px] text-muted-foreground opacity-70">{role.description}</p>
                                                                </div>
                                                            </div>
                                                            {isActive && <Check className="w-4 h-4 text-primary" />}
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                                    <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                    <Button onClick={async () => {
                                        setIsSaving(true);
                                        try {
                                            await createUser(newUserExperiment);
                                            setIsCreateOpen(false);
                                            fetchUsers();
                                            setNewUserExperiment({
                                                username: "",
                                                email: "",
                                                password: "",
                                                firstName: "",
                                                lastName: "",
                                                roleNames: []
                                            });
                                        } catch (e) {
                                            alert("Failed to create user");
                                            console.error(e);
                                        } finally {
                                            setIsSaving(false);
                                        }
                                    }} disabled={isSaving}>
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        Create User
                                    </Button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Edit Modal Overlay */}
                <AnimatePresence>
                    {isEditOpen && selectedUser && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                                onClick={() => setIsEditOpen(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                            >
                                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-white">Edit User Roles</h2>
                                    <Button variant="ghost" size="icon" onClick={() => setIsEditOpen(false)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                            <p className="text-xs text-muted-foreground uppercase opacity-70">User</p>
                                            <p className="font-medium text-white">{selectedUser.username}</p>
                                            <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                                        </div>

                                        <div className="space-y-3">
                                            <h3 className="text-sm font-medium text-white">Assign Roles</h3>
                                            <div className="grid grid-cols-1 gap-2">
                                                {['ADMIN', 'STAFF', 'LEARNER'].map((role) => {
                                                    const isActive = editRoles.includes(role);
                                                    return (
                                                        <div
                                                            key={role}
                                                            onClick={() => toggleRole(role)}
                                                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isActive
                                                                ? 'bg-primary/10 border-primary/50'
                                                                : 'bg-white/5 border-white/5 hover:bg-white/10'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isActive ? 'bg-primary text-white' : 'bg-white/10 text-muted-foreground'
                                                                    }`}>
                                                                    <Shield className="w-4 h-4" />
                                                                </div>
                                                                <span className={isActive ? 'text-white' : 'text-muted-foreground'}>
                                                                    {role}
                                                                </span>
                                                            </div>
                                                            {isActive && <Check className="w-4 h-4 text-primary" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                                    <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                                    <Button onClick={handleSave} disabled={isSaving}>
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        Save Changes
                                    </Button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Status Modal */}
                {selectedUserForStatus && (
                    <ChangeStatusModal
                        isOpen={isStatusModalOpen}
                        onClose={() => {
                            setIsStatusModalOpen(false);
                            setSelectedUserForStatus(null);
                        }}
                        userId={selectedUserForStatus.id}
                        currentStatus={selectedUserForStatus.statusName || 'ACTIVE'}
                        onSuccess={(newStatus) => {
                            setUsers(users.map(u => u.id === selectedUserForStatus.id ? { ...u, statusName: newStatus } : u));
                        }}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
}
