"use client";

import { useState } from "react";
import { Sprint } from "@/lib/program-api";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameDay,
    isWithinInterval,
    addMonths,
    subMonths,
    parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteSprint } from "@/lib/program-api";
import SprintModal from "./SprintModal";

interface SprintCalendarProps {
    sprints: Sprint[];
    onEditSprint: (sprint: Sprint) => void;
    onDeleteSuccess: () => void;
}

const SPRINT_COLORS = [
    "#3b82f6", // Blue
    "#8b5cf6", // Purple
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#ec4899", // Pink
    "#06b6d4", // Cyan
    "#84cc16", // Lime
];

export default function SprintCalendar({ sprints, onEditSprint, onDeleteSuccess }: SprintCalendarProps) {
    const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // View State
    const [viewMode, setViewMode] = useState<'year' | 'month'>('year');
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date(2023, 7, 1)); // Default Aug 2023

    // Use a fixed year (leap year) to support Feb 29 if needed, or just current year.
    // However, 2024 is a leap year, good for generic calendar.
    const genericYear = 2024;

    // Start from August. To ensure Feb is a leap year (2024), we start from Aug 2023.
    const startYear = 2023;
    const startMonth = 7; // August
    const months = Array.from({ length: 12 }, (_, i) => new Date(startYear, startMonth + i, 1));

    const handleDelete = async (sprintId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this sprint?")) {
            try {
                await deleteSprint(sprintId);
                onDeleteSuccess();
            } catch (error) {
                console.error("Failed to delete sprint", error);
                alert("Failed to delete sprint");
            }
        }
    };

    const handleSprintClick = (sprint: Sprint) => {
        setSelectedSprint(sprint);
        setIsModalOpen(true);
    };

    const getSprintColor = (index: number) => {
        return SPRINT_COLORS[index % SPRINT_COLORS.length];
    };

    const isDayInSprint = (day: Date, sprint: Sprint) => {
        const s = parseISO(sprint.startDate);
        const e = parseISO(sprint.endDate);

        const dTime = new Date(genericYear, day.getMonth(), day.getDate()).getTime();

        let sTime = new Date(genericYear, s.getMonth(), s.getDate()).getTime();
        let eTime = new Date(genericYear, e.getMonth(), e.getDate()).getTime();

        if (sTime > eTime) { // Sprint wraps year
            return dTime >= sTime || dTime <= eTime;
        }
        return dTime >= sTime && dTime <= eTime;
    };

    // Helper for Month View Detail
    const renderMonthDetail = () => {
        const startDate = startOfWeek(startOfMonth(selectedMonth));
        const endDate = endOfWeek(endOfMonth(selectedMonth));
        const days = eachDayOfInterval({ start: startDate, end: endDate });

        return (
            <div className="grid grid-cols-7 gap-px bg-white/10 border border-white/10 rounded-lg overflow-hidden">
                {/* Weekday Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="bg-white/5 p-4 text-center text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {day}
                    </div>
                ))}

                {/* Days */}
                {days.map((day, dayIdx) => {
                    const isCurrentMonth = day.getMonth() === selectedMonth.getMonth();
                    const activeSprints = sprints.filter(sprint => isDayInSprint(day, sprint));

                    return (
                        <div key={day.toISOString()} className={`min-h-[120px] p-2 relative group transition-colors ${!isCurrentMonth ? 'bg-black/20 text-muted-foreground/30' : 'bg-black/40 hover:bg-white/5'}`}>
                            <div className={`text-right text-sm mb-2 font-medium ${isSameDay(day, new Date()) ? 'text-primary' : (isCurrentMonth ? 'text-muted-foreground' : 'text-muted-foreground/30')}`}>
                                {format(day, "d")}
                            </div>

                            <div className="space-y-1">
                                {activeSprints.map((sprint, idx) => {
                                    const sprintColor = getSprintColor(sprint.id);
                                    return (
                                        <div
                                            key={sprint.id}
                                            onClick={() => handleSprintClick(sprint)}
                                            className={`text-[10px] p-1.5 rounded truncate flex items-center justify-between group/sprint cursor-pointer hover:brightness-110 transition-all shadow-sm`}
                                            style={{
                                                backgroundColor: `${sprintColor}33`,
                                                borderColor: `${sprintColor}80`,
                                                color: 'white',
                                                borderWidth: '1px'
                                            }}
                                            title={`${sprint.title}`}
                                        >
                                            <span className="truncate flex-1 font-medium">{sprint.title}</span>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-4 w-4 opacity-0 group-hover/sprint:opacity-100 hover:bg-white/20 -mr-1 text-white"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreVertical className="w-3 h-3" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-[#0a0a0f] border-white/10 text-white z-50">
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEditSprint(sprint);
                                                        }}
                                                        className="cursor-pointer hover:bg-white/10"
                                                    >
                                                        <Edit className="w-3 h-3 mr-2" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={(e) => handleDelete(sprint.id, e)}
                                                        className="cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                                    >
                                                        <Trash2 className="w-3 h-3 mr-2" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Navigation handlers
    const handleNextMonth = () => {
        setSelectedMonth(prev => addMonths(prev, 1));
    };

    const handlePrevMonth = () => {
        setSelectedMonth(prev => subMonths(prev, 1));
    };

    return (
        <div className="flex-1 p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    {viewMode === 'month' ? (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewMode('year')}
                                className="bg-white/5 border-white/10 text-slate-300 hover:text-white mr-4"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" /> Year View
                            </Button>

                            <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 hover:bg-white/10">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>

                            <h2 className="text-xl font-bold text-white min-w-[140px] text-center">
                                {format(selectedMonth, "MMMM")}
                            </h2>

                            <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 hover:bg-white/10">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <h2 className="text-xl font-bold text-white">
                            Program Schedule (Aug - Jul)
                        </h2>
                    )}
                </div>
            </div>

            {viewMode === 'year' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {months.map((month) => {
                        const monthStart = startOfWeek(startOfMonth(month));
                        const monthEnd = endOfWeek(endOfMonth(month));
                        const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

                        return (
                            <div
                                key={month.toISOString()}
                                className="bg-white/5 border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-colors group"
                                onClick={() => {
                                    setSelectedMonth(month);
                                    setViewMode('month');
                                }}
                            >
                                <div className="flex justify-between items-center mb-3 pl-1">
                                    <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors">{format(month, "MMMM")}</h3>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center pointer-events-none">
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                        <div key={i} className="text-[10px] text-slate-500 font-medium">{d}</div>
                                    ))}
                                    {monthDays.map(day => {
                                        const isCurrentMonth = day.getMonth() === month.getMonth();

                                        const activeSprints = sprints.filter(sprint => isDayInSprint(day, sprint));
                                        const hasSprints = activeSprints.length > 0;
                                        const sprintColor = hasSprints ? getSprintColor(activeSprints[0].id) : null;

                                        return (
                                            <div
                                                key={day.toISOString()}
                                                className={`
                                                    aspect-square flex items-center justify-center text-[10px] rounded-sm relative
                                                    ${!isCurrentMonth ? 'opacity-20' : 'text-slate-300'}
                                                    ${isSameDay(day, new Date()) ? 'ring-1 ring-primary text-primary font-bold' : ''}
                                                `}
                                            >
                                                <span className="z-10 relative">{format(day, 'd')}</span>
                                                {hasSprints && (
                                                    <div
                                                        className="absolute inset-0 rounded-sm opacity-30"
                                                        style={{ backgroundColor: sprintColor || undefined }}
                                                    />
                                                )}
                                                {activeSprints.length > 1 && (
                                                    <div className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-white rounded-full shadow-sm" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                renderMonthDetail()
            )}

            <SprintModal
                sprint={selectedSprint}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                color={selectedSprint ? getSprintColor(selectedSprint.id) : "#ffffff"}
            />
        </div>
    );
}
