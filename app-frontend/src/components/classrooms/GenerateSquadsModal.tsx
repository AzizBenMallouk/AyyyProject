"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Wand2 } from "lucide-react";
import { generateSquads } from "@/lib/squad-api";

interface GenerateSquadsModalProps {
    classroomId: number;
    sprintId?: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function GenerateSquadsModal({ classroomId, sprintId, isOpen, onClose, onSuccess }: GenerateSquadsModalProps) {
    const [count, setCount] = useState(4);
    const [maximizeNewConnections, setMaximizeNewConnections] = useState(true);
    const [distributeGender, setDistributeGender] = useState(true);
    const [rotateScrumMaster, setRotateScrumMaster] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!sprintId) return;
        setIsGenerating(true);
        try {
            await generateSquads(classroomId, sprintId, {
                count,
                maximizeNewConnections,
                distributeGender,
                rotateScrumMaster
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to generate squads", error);
            // In a real app, show toast error here
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-[#1a1b26] border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-purple-400" />
                        Generate Squads
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Automatically create squads based on your preferences.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="count">Number of Squads</Label>
                            <Input
                                id="count"
                                type="number"
                                min={1}
                                max={20}
                                value={count}
                                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                                className="w-20 bg-black/20 border-white/10 text-white text-right"
                            />
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="connections"
                                    checked={maximizeNewConnections}
                                    onCheckedChange={(checked) => setMaximizeNewConnections(checked as boolean)}
                                />
                                <Label htmlFor="connections" className="cursor-pointer">Maximize new connections</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="gender"
                                    checked={distributeGender}
                                    onCheckedChange={(checked) => setDistributeGender(checked as boolean)}
                                />
                                <Label htmlFor="gender" className="cursor-pointer">Distribute gender evenly</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="sm-rotation"
                                    checked={rotateScrumMaster}
                                    onCheckedChange={(checked) => setRotateScrumMaster(checked as boolean)}
                                />
                                <Label htmlFor="sm-rotation" className="cursor-pointer">Rotate Scrum Masters</Label>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} className="hover:bg-white/5">Cancel</Button>
                    <Button onClick={handleGenerate} disabled={isGenerating || !sprintId} className="bg-purple-600 hover:bg-purple-700 text-white">
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Wand2 className="mr-2 h-4 w-4" />
                                Generate
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
