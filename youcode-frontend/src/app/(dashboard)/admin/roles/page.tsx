"use client";

import { useEffect, useState } from "react";
import { Role } from "@/types/role";
import {
    createRole,
    deleteRole,
    getAllRoles,
    updateRole,
    getAllPermissions
} from "@/lib/role-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Search,
    Trash2,
    Edit,
    Shield,
    Loader2,
    Plus,
    X,
    Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function RoleManagementPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState<Partial<Role>>({
        name: "",
        description: "",
        roleType: "LEARNER",
        permissions: [] as string[]
    });
    const [isSaving, setIsSaving] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rolesData, permissionsData] = await Promise.all([
                getAllRoles(),
                getAllPermissions()
            ]);
            setRoles(rolesData);
            setPermissions(permissionsData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openCreateModal = () => {
        setEditingRole(null);
        setFormData({ name: "", description: "", permissions: [] });
        setIsModalOpen(true);
    };

    const openEditModal = (role: Role) => {
        setEditingRole(role);
        setFormData({
            name: role.name,
            description: role.description,
            permissions: role.permissions || []
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this role?")) return;
        try {
            await deleteRole(id);
            setRoles(roles.filter(r => r.id !== id));
        } catch (error) {
            alert("Failed to delete role");
        }
    };

    const togglePermission = (perm: string) => {
        if (formData.permissions.includes(perm)) {
            setFormData({
                ...formData,
                permissions: formData.permissions.filter(p => p !== perm)
            });
        } else {
            setFormData({
                ...formData,
                permissions: [...formData.permissions, perm]
            });
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (editingRole) {
                await updateRole(editingRole.id, formData);
            } else {
                await createRole(formData);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error(error);
            alert("Failed to save role");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="p-8 space-y-8 min-h-screen text-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            Role Management
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Define roles and assign system permissions
                        </p>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90" onClick={openCreateModal}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Role
                    </Button>
                </div>

                <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
                    <CardHeader>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search roles..."
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
                                        <th className="px-6 py-4 font-medium">Role Name</th>
                                        <th className="px-6 py-4 font-medium">Type</th>
                                        <th className="px-6 py-4 font-medium">Description</th>
                                        <th className="px-6 py-4 font-medium">Permissions</th>
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
                                    ) : filteredRoles.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                                No roles found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRoles.map((role) => (
                                            <motion.tr
                                                key={role.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="hover:bg-white/5 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                            <Shield className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-bold text-white uppercase tracking-wide">{role.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${role.roleType === 'ADMINISTRATIVE'
                                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                        : role.roleType === 'STAFF'
                                                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                            : 'bg-green-500/10 text-green-400 border-green-500/20'
                                                        }`}>
                                                        {role.roleType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {role.description}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-1 flex-wrap">
                                                        {role.permissions?.slice(0, 3).map((perm) => (
                                                            <span key={perm} className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-slate-300 border border-white/10">
                                                                {perm}
                                                            </span>
                                                        ))}
                                                        {role.permissions?.length > 3 && (
                                                            <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-muted-foreground">
                                                                +{role.permissions.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-white/10 hover:text-blue-400"
                                                            onClick={() => openEditModal(role)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-white/10 hover:text-red-400"
                                                            onClick={() => handleDelete(role.id)}
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
                </Card>

                {/* Create/Edit Modal */}
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
                                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#0a0a0f] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden" // Increased max-width
                            >
                                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                    <h2 className="text-lg font-semibold text-white">
                                        {editingRole ? "Edit Role" : "Create New Role"}
                                    </h2>
                                    <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground uppercase">Role Name</label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g. MODERATOR"
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground uppercase">Role Type</label>
                                            <select
                                                value={formData.roleType}
                                                onChange={(e) => setFormData({ ...formData, roleType: e.target.value as any })}
                                                className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                <option value="ADMINISTRATIVE">ADMINISTRATIVE</option>
                                                <option value="STAFF">STAFF</option>
                                                <option value="LEARNER">LEARNER</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground uppercase">Description</label>
                                            <Input
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Role description"
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>

                                        <div className="space-y-3 pt-2">
                                            <h3 className="text-sm font-medium text-white flex justify-between items-center">
                                                Permissions
                                                <span className="text-xs font-normal text-muted-foreground">{formData.permissions.length} selected</span>
                                            </h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                {permissions.length === 0 ? (
                                                    <p className="col-span-2 text-sm text-muted-foreground italic">No permissions available in system.</p>
                                                ) : (
                                                    permissions.map((perm) => {
                                                        const isActive = formData.permissions.includes(perm);
                                                        return (
                                                            <div
                                                                key={perm}
                                                                onClick={() => togglePermission(perm)}
                                                                className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all ${isActive
                                                                    ? 'bg-primary/10 border-primary/50'
                                                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                                                    }`}
                                                            >
                                                                <span className={`text-xs font-medium truncate ${isActive ? 'text-white' : 'text-muted-foreground'}`}>
                                                                    {perm}
                                                                </span>
                                                                {isActive && <Check className="w-3 h-3 text-primary flex-shrink-0" />}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button onClick={handleSave} disabled={isSaving}>
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        {editingRole ? "Update Role" : "Create Role"}
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
