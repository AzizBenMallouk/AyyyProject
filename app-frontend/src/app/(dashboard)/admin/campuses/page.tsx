"use client";

import { useEffect, useState } from "react";
import { Campus } from "@/types/admin";
import { getAllCampuses, deleteCampus, createCampus, updateCampus } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Search,
    Trash2,
    Edit,
    Plus,
    Loader2,
    MapPin,
    X,
    Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function CampusManagementPage() {
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState<Partial<Campus>>({
        name: "",
        address: "",
    });

    const fetchCampuses = async () => {
        setLoading(true);
        try {
            const data = await getAllCampuses();
            setCampuses(data);
        } catch (error) {
            console.error("Failed to fetch campuses", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampuses();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this campus?")) return;
        try {
            await deleteCampus(id);
            setCampuses(campuses.filter(c => c.id !== id));
        } catch (error) {
            alert("Failed to delete campus");
        }
    };

    const openModal = (campus: Campus | null = null) => {
        setSelectedCampus(campus);
        if (campus) {
            setFormData({
                name: campus.name,
                address: campus.address,
            });
        } else {
            setFormData({
                name: "",
                address: "",
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (selectedCampus) {
                await updateCampus(selectedCampus.id, formData);
            } else {
                await createCampus(formData);
            }
            setIsModalOpen(false);
            fetchCampuses();
        } catch (error) {
            alert("Failed to save campus");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredCampuses = campuses.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="p-8 space-y-8 min-h-screen text-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            Campus Management
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage physical locations and centers
                        </p>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90" onClick={() => openModal()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Campus
                    </Button>
                </div>

                <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
                    <CardHeader>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search campuses..."
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
                                        <th className="px-6 py-4 font-medium">Campus Name</th>
                                        <th className="px-6 py-4 font-medium">Address</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                            </td>
                                        </tr>
                                    ) : filteredCampuses.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                                                No campuses found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCampuses.map((campus) => (
                                            <motion.tr
                                                key={campus.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="hover:bg-white/5 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                                                            <MapPin className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <span className="font-medium text-white">{campus.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {campus.address}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-white/10 hover:text-blue-400"
                                                            onClick={() => openModal(campus)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-white/10 hover:text-red-400"
                                                            onClick={() => handleDelete(campus.id)}
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
                                    <h2 className="text-lg font-semibold text-white">
                                        {selectedCampus ? "Edit Campus" : "Add New Campus"}
                                    </h2>
                                    <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase">Campus Name</label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="bg-white/5 border-white/10 text-white"
                                            placeholder="e.g. YouCode Safi"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase">Address</label>
                                        <Input
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="bg-white/5 border-white/10 text-white"
                                            placeholder="Enter full address"
                                        />
                                    </div>
                                </div>

                                <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button onClick={handleSave} disabled={isSaving}>
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        {selectedCampus ? "Save Changes" : "Create Campus"}
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
