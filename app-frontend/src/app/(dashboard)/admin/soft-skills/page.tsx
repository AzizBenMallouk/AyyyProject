"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { getAllSoftSkills, createSoftSkill, deleteSoftSkill, SoftSkill } from "@/lib/soft-skills-api";
import { useToast } from "@/components/ui/use-toast";

export default function SoftSkillsPage() {
    const [softSkills, setSoftSkills] = useState<SoftSkill[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: "",
        description: ""
    });

    const fetchSoftSkills = async () => {
        try {
            const data = await getAllSoftSkills();
            setSoftSkills(data);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to fetch soft skills",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSoftSkills();
    }, []);

    const handleSubmit = async () => {
        if (!formData.name) return;
        setIsSubmitting(true);
        try {
            await createSoftSkill(formData);
            toast({
                title: "Success",
                description: "Soft skill created successfully",
            });
            setIsCreateOpen(false);
            setFormData({ name: "", description: "" });
            fetchSoftSkills();
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to create soft skill",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this soft skill?")) return;
        try {
            await deleteSoftSkill(id);
            toast({
                title: "Success",
                description: "Soft skill deleted",
            });
            setSoftSkills(softSkills.filter(s => s.id !== id));
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to delete soft skill",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="p-8 space-y-8 min-h-screen text-slate-200 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 flex items-center gap-3">
                        <BrainCircuit className="w-8 h-8 text-primary" />
                        Soft Skills Management
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Define and manage soft skills for student evaluations
                    </p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Soft Skill
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0a0a0f] border-white/10 text-white">
                        <DialogHeader>
                            <DialogTitle>Add New Soft Skill</DialogTitle>
                            <DialogDescription>
                                Create a new soft skill to be used in interview evaluations.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Name</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Communication"
                                    className="bg-white/5 border-white/10 focus:ring-primary/50 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Description</label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the skill criteria..."
                                    className="bg-white/5 border-white/10 focus:ring-primary/50 text-white min-h-[100px]"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Create
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {softSkills.map((skill) => (
                        <Card key={skill.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all group">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <CardTitle className="text-xl font-bold text-white">{skill.name}</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                    onClick={() => handleDelete(skill.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    {skill.description || "No description provided."}
                                </p>
                            </CardContent>
                        </Card>
                    ))}

                    {softSkills.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground bg-white/5 rounded-xl border border-white/10 border-dashed">
                            <BrainCircuit className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium">No soft skills defined yet</p>
                            <p className="text-sm opacity-70">Get started by adding your first soft skill</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
