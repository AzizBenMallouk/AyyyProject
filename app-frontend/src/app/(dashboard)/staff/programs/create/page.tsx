"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProgram, Sprint } from "@/lib/program-api";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash2, Save, ChevronLeft, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function CreateProgramPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Program State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [speciality, setSpeciality] = useState("");

    // Sprints State
    const [sprints, setSprints] = useState<Partial<Sprint>[]>([]);

    const addSprint = () => {
        setSprints([
            ...sprints,
            {
                title: `Sprint ${sprints.length + 1}`,
                objective: "",
                description: "", // Markdown placeholder
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
            }
        ]);
    };

    const updateSprint = (index: number, field: keyof Sprint, value: string) => {
        const newSprints = [...sprints];
        newSprints[index] = { ...newSprints[index], [field]: value };
        setSprints(newSprints);
    };

    const removeSprint = (index: number) => {
        const newSprints = sprints.filter((_, i) => i !== index);
        setSprints(newSprints);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await createProgram({
                title,
                description,
                speciality,
                sprints: sprints as Sprint[] // Type assertion, backend will handle ID assignment
            });
            router.push('/staff/programs');
        } catch (error) {
            console.error("Failed to create program", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
            <div className="flex flex-col bg-[#0a0a0f] min-h-screen text-slate-200">
                {/* Header */}
                <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-white/5 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push('/staff/programs')}
                            className="hover:bg-white/10"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-xl font-bold text-white tracking-tight">Create New Program</h1>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !title}
                        className="bg-primary hover:bg-primary/90 text-white min-w-[100px]"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Create Program
                            </>
                        )}
                    </Button>
                </div>

                <div className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8">
                    {/* Program Details */}
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle>Program Details</CardTitle>
                            <CardDescription>Define the core information for the program.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Program Title</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Full Stack Java"
                                    className="bg-black/20 border-white/10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="speciality">Speciality</Label>
                                <Input
                                    id="speciality"
                                    value={speciality}
                                    onChange={(e) => setSpeciality(e.target.value)}
                                    placeholder="e.g. Software Development"
                                    className="bg-black/20 border-white/10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Markdown)</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the program..."
                                    className="min-h-[100px] bg-black/20 border-white/10 font-mono text-sm"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Separator className="bg-white/10" />

                    {/* Sprints Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">Sprints</h2>
                                <p className="text-slate-400 text-sm">Define the sprints for this program.</p>
                            </div>
                            <Button onClick={addSprint} variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Sprint
                            </Button>
                        </div>

                        {sprints.length === 0 ? (
                            <div className="text-center p-12 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                                <p className="text-slate-500">No sprints added yet. Click "Add Sprint" to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {sprints.map((sprint, index) => (
                                    <Card key={index} className="bg-white/5 border-white/10 relative group">
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeSprint(index)}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <CardHeader className="pb-2">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                                    Sprint {index + 1}
                                                </Badge>
                                                <Input
                                                    value={sprint.title}
                                                    onChange={(e) => updateSprint(index, 'title', e.target.value)}
                                                    className="max-w-xs bg-transparent border-transparent hover:border-white/10 focus:bg-black/20 font-semibold text-lg h-auto p-1"
                                                    placeholder="Sprint Title"
                                                />
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4 pt-2">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase text-slate-500">Start Date</Label>
                                                    <div className="relative">
                                                        <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                                        <Input
                                                            type="date"
                                                            value={sprint.startDate}
                                                            onChange={(e) => updateSprint(index, 'startDate', e.target.value)}
                                                            className="pl-9 bg-black/20 border-white/10"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase text-slate-500">End Date</Label>
                                                    <div className="relative">
                                                        <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                                        <Input
                                                            type="date"
                                                            value={sprint.endDate}
                                                            onChange={(e) => updateSprint(index, 'endDate', e.target.value)}
                                                            className="pl-9 bg-black/20 border-white/10"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Objective</Label>
                                                <Input
                                                    value={sprint.objective || ''}
                                                    onChange={(e) => updateSprint(index, 'objective', e.target.value)}
                                                    placeholder="Main goal of this sprint"
                                                    className="bg-black/20 border-white/10"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Technologies / Skills</Label>
                                                <Input
                                                    value={sprint.technologies || ''}
                                                    onChange={(e) => updateSprint(index, 'technologies', e.target.value)}
                                                    placeholder="e.g. Java, Spring Boot, MySQL"
                                                    className="bg-black/20 border-white/10"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Description (Markdown)</Label>
                                                <Textarea
                                                    value={sprint.description || ''}
                                                    onChange={(e) => updateSprint(index, 'description', e.target.value)}
                                                    placeholder="Detailed description..."
                                                    className="min-h-[100px] bg-black/20 border-white/10 font-mono text-xs"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
