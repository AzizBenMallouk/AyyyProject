"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Enroll, AbsenceType } from "@/types/classroom";
import { createAbsence } from "@/lib/absence-api";
import { Badge } from "@/components/ui/badge";

interface MarkAbsenceDialogProps {
    children: React.ReactNode;
    enrolledLearners: Enroll[];
    absenceTypes: AbsenceType[];
    onSuccess: () => void;
}

export default function MarkAbsenceDialog({ children, enrolledLearners, absenceTypes, onSuccess }: MarkAbsenceDialogProps) {
    const [open, setOpen] = useState(false);
    const [openCombobox, setOpenCombobox] = useState(false);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [absenceData, setAbsenceData] = useState({
        date: new Date().toISOString().split('T')[0],
        absenceTypeId: "",
        reason: ""
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedStudentIds.length === 0 || !absenceData.absenceTypeId) return;

        setLoading(true);
        try {
            await Promise.all(selectedStudentIds.map(studentId =>
                createAbsence({
                    date: absenceData.date,
                    reason: absenceData.reason,
                    absenceTypeId: parseInt(absenceData.absenceTypeId),
                    learnerId: studentId // Using studentId (which is user ID in this context, assumed from Enroll)
                })
            ));
            onSuccess();
            setOpen(false);
            // Reset form
            setSelectedStudentIds([]);
            setAbsenceData({ ...absenceData, reason: "" });
        } catch (error) {
            console.error("Failed to mark absence", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStudent = (id: number) => {
        setSelectedStudentIds(prev =>
            prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-[#1a1b26] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Mark Absence</DialogTitle>
                    <DialogDescription>
                        Record user absences. Select one or more students.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Students</Label>
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCombobox}
                                    className="w-full justify-between bg-black/20 border-white/10 text-slate-300 hover:text-white"
                                >
                                    {selectedStudentIds.length > 0
                                        ? `${selectedStudentIds.length} selected`
                                        : "Select students..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0 bg-[#1a1b26] border-white/10">
                                <Command className="bg-transparent">
                                    <CommandInput placeholder="Search student..." className="text-white" />
                                    <CommandList>
                                        <CommandEmpty>No student found.</CommandEmpty>
                                        <CommandGroup>
                                            {enrolledLearners.map((learner) => (
                                                <CommandItem
                                                    key={learner.learnerId} // Using learnerId which is User ID
                                                    value={learner.learnerName}
                                                    onSelect={() => toggleStudent(learner.learnerId)}
                                                    className="text-slate-300 aria-selected:bg-white/10 aria-selected:text-white"
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedStudentIds.includes(learner.learnerId) ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {learner.learnerName}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {selectedStudentIds.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {selectedStudentIds.map(id => {
                                    const learner = enrolledLearners.find(l => l.learnerId === id);
                                    return (
                                        <Badge key={id} variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
                                            {learner?.learnerName}
                                            <button
                                                type="button"
                                                onClick={() => toggleStudent(id)}
                                                className="ml-1 hover:text-red-400"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                value={absenceData.date}
                                onChange={(e) => setAbsenceData({ ...absenceData, date: e.target.value })}
                                className="bg-black/20 border-white/10 text-white"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={absenceData.absenceTypeId}
                                onValueChange={(val) => setAbsenceData({ ...absenceData, absenceTypeId: val })}
                            >
                                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1b26] border-white/10 text-white">
                                    {absenceTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id.toString()}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Reason (Optional)</Label>
                        <Textarea
                            value={absenceData.reason}
                            onChange={(e) => setAbsenceData({ ...absenceData, reason: e.target.value })}
                            className="bg-black/20 border-white/10 text-white min-h-[80px]"
                            placeholder="Enter reason..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit Report"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
