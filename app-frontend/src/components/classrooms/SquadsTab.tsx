"use client";

import { useState, useEffect } from "react";
import { Squad } from "@/types/squad";
import { Enroll } from "@/types/classroom";
import { createSquad, getSquadsByClassroom, assignLearnerToSquad, removeLearnerFromSquad } from "@/lib/squad-api";
import { getProgramById, Sprint } from "@/lib/program-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Users, UserPlus, X, Loader2, Trash2, Calendar, Wand2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GenerateSquadsModal from "./GenerateSquadsModal";

interface SquadsTabProps {
    classroomId: number;
    programId?: number;
    enrolledLearners: Enroll[];
    onUpdate: () => void; // Callback to refresh data
}

export default function SquadsTab({ classroomId, programId, enrolledLearners, onUpdate }: SquadsTabProps) {
    const [squads, setSquads] = useState<Squad[]>([]);
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [selectedSprintId, setSelectedSprintId] = useState<string>("all");
    const [loading, setLoading] = useState(true);
    const [newSquadName, setNewSquadName] = useState("");
    const [newSquadDescription, setNewSquadDescription] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [isAssigning, setIsAssigning] = useState<number | null>(null); // learnerId being assigned
    const [showGenerateModal, setShowGenerateModal] = useState(false);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                if (programId) {
                    const program = await getProgramById(programId);
                    setSprints(program.sprints || []);
                    // Auto-select current or first sprint
                    if (program.sprints && program.sprints.length > 0) {
                        setSelectedSprintId(program.sprints[0].id.toString());
                    }
                }
                await fetchSquads();
            } catch (error) {
                console.error("Error initializing squads tab", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [classroomId, programId]);

    useEffect(() => {
        fetchSquads();
    }, [selectedSprintId]);

    const fetchSquads = async () => {
        try {
            const sprintId = selectedSprintId === "all" ? undefined : parseInt(selectedSprintId);
            const data = await getSquadsByClassroom(classroomId, sprintId);
            setSquads(data);
        } catch (error) {
            console.error("Failed to fetch squads", error);
        }
    };

    const handleCreateSquad = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await createSquad({
                name: newSquadName,
                description: newSquadDescription,
                classroomId,
                sprintId: selectedSprintId !== "all" ? parseInt(selectedSprintId) : undefined
            });
            setNewSquadName("");
            setNewSquadDescription("");
            fetchSquads();
        } catch (error) {
            console.error("Failed to create squad", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleAssign = async (squadId: number, learnerId: number) => {
        setIsAssigning(learnerId);
        try {
            await assignLearnerToSquad(squadId, learnerId);
            fetchSquads(); // Refresh squads to update member lists
            // We don't necessarily need onUpdate() for parent if we calculate unassigned locally from squads
        } catch (error) {
            console.error("Failed to assign learner", error);
        } finally {
            setIsAssigning(null);
        }
    };

    const handleRemoveFromSquad = async (learnerId: number) => {
        if (!confirm("Remove student from squad?")) return;
        try {
            await removeLearnerFromSquad(classroomId, learnerId);
            fetchSquads();
        } catch (error) {
            console.error("Failed to remove learner", error);
        }
    };

    // Calculate Unassigned Learners based on current squads
    const assignedLearnerIds = new Set(squads.flatMap(s => s.memberIds || []));

    // Check if Enroll has 'learner' property based on previous file content which showed 'learner.name' access
    // In step 1374, it accessed `learner.learnerName` and `learner.learnerId` which suggests Enroll structure might differ from `types/classroom.ts` or I misread.
    // Let's verify Enroll structure usage in previous file content (step 1374):
    // Line 167: {learner.learnerName}
    // Line 170: handleRemoveFromSquad(learner.learnerId)
    // Actually, looking at `types/classroom.ts` (step 1322), Enroll has `learner` which is `User`.
    // But in `SquadsTab.tsx` (step 1374), it seemed to use flat properties `learnerName` and `learnerId`. 
    // Wait, step 1374 content shows `enrolledLearners` being mapped.
    // Line 167: `learner.learnerName`.
    // This implies `enrolledLearners` is NOT `Enroll[]` strictly from entity, but maybe a DTO or the interface is different in frontend.
    // Let's check `lib/classroom-api.ts` `getEnrolledLearners` return type.
    // Or I check `types/classroom.ts` again. I viewed lines 90-99 in step 1361.
    // If I use `learner.learnerName`, the type must have it.
    // The previous `SquadsTab.tsx` was working. It used `learner.learnerName`.
    // My new code uses `enroll.learner.name`. I should probably stick to what was there or what matches the type.
    // Let's check `types/classroom.ts` line 1-30 in step 1392: `Enroll` is imported but not shown fully.

    // I will use `any` cast or try to be safe. But wait, `unassignedLearners` mapping in my new code:
    // `enroll.learner.name`.
    // The previous code: `learner.learnerName`.
    // This suggests `enrolledLearners` might be a specific projected type.

    // Re-reading `SquadsTab.tsx` from step 1374:
    // `interface SquadsTabProps { ... enrolledLearners: Enroll[]; ... }`
    // And in step 1374: `unassignedLearners.map(learner => ... learner.learnerName ...)`
    // This confirms `Enroll` interface must have `learnerName` and `learnerId`.

    // Checking `types/classroom.ts` (Viewed in step 1391? No, 1392 showed Classroom)
    // I should probably check `types/classroom.ts` for Enroll.

    // To be safe, I will assume the `Enroll` type matches the usage in the OLD working file, which is `learnerName` and `learnerId`.
    // BUT, backend `Enroll` entity has `learner` (User).
    // Frontend `Enroll` interface might be:
    // export interface Enroll { id: number; learnerId: number; learnerName: string; ... }

    // I will write the file assuming `learnerName` and `learnerId` to match the previous working state.

    const unassignedLearners = enrolledLearners.filter(l => !assignedLearnerIds.has(l.learnerId));

    // Helper to get learners for a specific squad
    const getSquadMembers = (squadId: number) => {
        const squad = squads.find(s => s.id === squadId);
        if (!squad || !squad.memberIds) return [];
        return enrolledLearners.filter(l => squad.memberIds!.includes(l.learnerId));
    };

    // Determine current sprint title
    const currentSprintTitle = sprints.find(s => s.id.toString() === selectedSprintId)?.title || "All Sprints";

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold text-white">Squads</h3>
                    {sprints.length > 0 && (
                        <Select value={selectedSprintId} onValueChange={setSelectedSprintId}>
                            <SelectTrigger className="w-[200px] bg-black/20 border-white/10 text-white">
                                <SelectValue placeholder="Select Sprint" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1b26] border-white/10 text-white">
                                <SelectItem value="all">All Sprints</SelectItem>
                                {sprints.map(s => (
                                    <SelectItem key={s.id} value={s.id.toString()}>{s.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <div className="flex gap-2">
                    {selectedSprintId !== "all" && (
                        <Button
                            variant="outline"
                            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
                            onClick={() => setShowGenerateModal(true)}
                        >
                            <Wand2 className="w-4 h-4 mr-2" />
                            Generate Squads
                        </Button>
                    )}

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Squad
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#1a1b26] border-white/10 text-white">
                            <DialogHeader>
                                <DialogTitle>Create New Squad</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateSquad} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Squad Name</label>
                                    <Input
                                        value={newSquadName}
                                        onChange={e => setNewSquadName(e.target.value)}
                                        className="bg-black/20 border-white/10 text-white"
                                        required
                                        placeholder={`Squad X - ${currentSprintTitle}`}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Description</label>
                                    <Input
                                        value={newSquadDescription}
                                        onChange={e => setNewSquadDescription(e.target.value)}
                                        className="bg-black/20 border-white/10 text-white"
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-primary" disabled={isCreating}>
                                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Squad"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Squads List */}
                <div className="md:col-span-2 grid grid-cols-1 gap-6">
                    {squads.map(squad => {
                        const members = getSquadMembers(squad.id);
                        return (
                            <Card key={squad.id} className="bg-black/40 border-white/10 backdrop-blur-xl">
                                <CardHeader className="pb-2 border-b border-white/5 flex flex-row items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                            <Users className="w-5 h-5 text-primary" />
                                            {squad.name}
                                        </CardTitle>
                                        {squad.scrumMasterName && (
                                            <div className="text-xs text-purple-400 flex items-center gap-1">
                                                <Badge variant="secondary" className="bg-purple-500/10 text-purple-300 border-none text-[10px] px-1 h-5">SM</Badge>
                                                {squad.scrumMasterName}
                                            </div>
                                        )}
                                    </div>
                                    <Badge variant="outline" className="border-white/10 text-muted-foreground">
                                        {members.length} members
                                    </Badge>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <p className="text-sm text-slate-400 mb-4">{squad.description || "No description"}</p>

                                    <div className="space-y-2">
                                        {members.length === 0 ? (
                                            <div className="text-sm text-muted-foreground italic p-2 border border-dashed border-white/10 rounded">
                                                No members assigned
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {members.map(enroll => (
                                                    <div key={enroll.id} className="flex items-center justify-between p-2 bg-white/5 rounded-md border border-white/5 group">
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="w-6 h-6">
                                                                <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                                                                    {enroll.learnerName.charAt(0)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-sm text-slate-200 truncate max-w-[120px]">{enroll.learnerName}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveFromSquad(enroll.learnerId)}
                                                            className="text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                    {squads.length === 0 && (
                        <div className="text-center p-8 text-muted-foreground border border-dashed border-white/10 rounded-xl">
                            No squads created for this sprint yet.
                        </div>
                    )}
                </div>

                {/* Unassigned List */}
                <div className="bg-black/40 border border-white/10 rounded-xl p-4 h-fit sticky top-6">
                    <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-yellow-400" />
                        Unassigned Students
                        <Badge variant="secondary" className="ml-auto bg-white/10 text-slate-200">{unassignedLearners.length}</Badge>
                    </h4>

                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                        {unassignedLearners.map(enroll => (
                            <div key={enroll.id} className="p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-white">{enroll.learnerName}</span>
                                </div>
                                {squads.length > 0 ? (
                                    <select
                                        className="w-full bg-[#0a0a0f] text-xs text-slate-300 p-1.5 rounded border border-white/10 focus:outline-none focus:border-primary"
                                        onChange={(e) => {
                                            if (e.target.value) handleAssign(parseInt(e.target.value), enroll.learnerId);
                                        }}
                                        value=""
                                    >
                                        <option value="">Assign to Squad...</option>
                                        {squads.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="text-xs text-muted-foreground italic">Create a squad to assign</div>
                                )}
                            </div>
                        ))}
                        {unassignedLearners.length === 0 && (
                            <div className="text-sm text-green-400 text-center py-4">
                                All students assigned! 🎉
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <GenerateSquadsModal
                classroomId={classroomId}
                sprintId={selectedSprintId !== "all" ? parseInt(selectedSprintId) : undefined}
                isOpen={showGenerateModal}
                onClose={() => setShowGenerateModal(false)}
                onSuccess={fetchSquads}
            />
        </div>
    );
}
