"use client";

import { Program } from "@/lib/program-api";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ProgramListProps {
    programs: Program[];
    selectedProgramId: number | null;
    onSelectProgram: (id: number) => void;
    onCreateProgram: () => void;
}

export default function ProgramList({ programs, selectedProgramId, onSelectProgram, onCreateProgram }: ProgramListProps) {
    return (
        <div className="w-full md:w-64 flex-shrink-0 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col h-[calc(100vh-100px)] rounded-l-xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="font-semibold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    Programs
                </h2>
                <Button variant="ghost" size="icon" onClick={onCreateProgram} className="hover:bg-white/10">
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                    {programs.map((program) => (
                        <Link
                            key={program.id}
                            href={`/staff/programs/${program.id}`}
                            className={`block p-3 rounded-lg cursor-pointer transition-all border ${selectedProgramId === program.id
                                ? "bg-primary/20 border-primary/50 text-white"
                                : "bg-white/5 border-transparent hover:bg-white/10 text-muted-foreground hover:text-white"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-sm truncate">{program.title}</span>
                                <ChevronRight className="w-3 h-3 opacity-50" />
                            </div>
                            <div className="text-xs opacity-70 mt-1 truncate">
                                {program.speciality}
                            </div>
                        </Link>
                    ))}
                    {programs.length === 0 && (
                        <div className="text-center p-4 text-muted-foreground text-xs">
                            No programs found.
                            <br />
                            Create one to get started.
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
