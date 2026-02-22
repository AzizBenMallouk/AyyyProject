"use client";

import { useState } from "react";
import { Activity, ActivityType } from "@/types/classroom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    AlertCircle,
    Plus,
    Search,
    Filter,
    Calendar as CalendarIcon,
    List,
    ChevronLeft,
    ChevronRight,
    Clock,
    Table as TableIcon,
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
    Award
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import CreateActivityModal from "./CreateActivityModal";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    addWeeks,
    subWeeks,
    addDays,
    subDays,
    isToday,
    parseISO
} from 'date-fns';

import ActivityDetailsModal from "./ActivityDetailsModal";

interface ClassroomActivitiesProps {
    classroomId: number;
    activities: Activity[];
    activityTypes: ActivityType[];
    onAddActivity: () => void;
}

type ViewMode = "calendar" | "table";
type CalendarView = "month" | "week" | "day";

export default function ClassroomActivities({ classroomId, activities, activityTypes, onAddActivity }: ClassroomActivitiesProps) {
    // Search & Filter
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("ALL");

    // View State
    const [viewMode, setViewMode] = useState<ViewMode>("calendar");
    const [calendarView, setCalendarView] = useState<CalendarView>("day");
    const [currentDate, setCurrentDate] = useState(new Date());

    // Table Pagination
    const [page, setPage] = useState(0);
    const pageSize = 10;

    // Filter Logic
    const filteredActivities = activities.filter(activity => {
        const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (activity.description && activity.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = typeFilter === "ALL" || activity.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const getActivityColor = (typeName: string) => {
        const type = activityTypes.find(t => t.name === typeName);
        return type?.color || '#64748b';
    };

    // Modal State
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const handleActivityClick = (activity: Activity) => {
        setSelectedActivity(activity);
        setDetailsOpen(true);
    };

    const handleEdit = (activity: Activity) => {
        console.log("Edit activity", activity);
        // TODO: Implement edit logic
    };

    const handleDelete = (activityId: number) => {
        console.log("Delete activity", activityId);
        // TODO: Implement delete logic
    };

    const handleEvaluate = (activityId: number) => {
        console.log("Evaluate activity", activityId);
        // TODO: Implement evaluation logic
    };

    // --- Action Handlers ---
    const handleAction = (e: React.MouseEvent, action: string, activity: Activity) => {
        e.stopPropagation();
        switch (action) {
            case 'show':
                setSelectedActivity(activity);
                setDetailsOpen(true);
                break;
            case 'edit':
                handleEdit(activity);
                break;
            case 'delete':
                handleDelete(activity.id);
                break;
            case 'evaluate':
                handleEvaluate(activity.id);
                break;
        }
    };

    const renderActionButtons = (activity: Activity, variant: 'table' | 'calendar' = 'table') => {
        if (variant === 'table') {
            return (
                <div className="flex items-center gap-1 justify-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10"
                        onClick={(e) => handleAction(e, 'show', activity)}
                        title="Show Details"
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={(e) => handleAction(e, 'edit', activity)}
                        title="Edit Activity"
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                        onClick={(e) => handleAction(e, 'delete', activity)}
                        title="Delete Activity"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-yellow-400 hover:bg-yellow-500/10"
                        onClick={(e) => handleAction(e, 'evaluate', activity)}
                        title="Evaluate"
                    >
                        <Award className="w-4 h-4" />
                    </Button>
                </div>
            );
        }

        // Calendar dropdown
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 p-0 hover:bg-white/10 rounded-full" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="w-3 h-3" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 bg-[#1a1a1f] border-white/10 text-slate-200">
                    <DropdownMenuItem onClick={(e) => handleAction(e, 'show', activity)} className="gap-2 cursor-pointer hover:bg-white/5 focus:bg-white/5">
                        <Eye className="w-4 h-4" /> Show
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleAction(e, 'edit', activity)} className="gap-2 cursor-pointer hover:bg-white/5 focus:bg-white/5">
                        <Pencil className="w-4 h-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleAction(e, 'evaluate', activity)} className="gap-2 cursor-pointer hover:bg-white/5 focus:bg-white/5">
                        <Award className="w-4 h-4" /> Evaluate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleAction(e, 'delete', activity)} className="gap-2 cursor-pointer text-red-400 hover:bg-red-500/10 focus:bg-red-500/10">
                        <Trash2 className="w-4 h-4" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    // --- Calendar Logic ---
    const next = () => {
        if (calendarView === 'month') setCurrentDate(addMonths(currentDate, 1));
        else if (calendarView === 'week') setCurrentDate(addWeeks(currentDate, 1));
        else setCurrentDate(addDays(currentDate, 1));
    };

    const prev = () => {
        if (calendarView === 'month') setCurrentDate(subMonths(currentDate, 1));
        else if (calendarView === 'week') setCurrentDate(subWeeks(currentDate, 1));
        else setCurrentDate(subDays(currentDate, 1));
    };

    const today = () => setCurrentDate(new Date());

    const getDays = () => {
        if (calendarView === 'month') {
            const start = startOfWeek(startOfMonth(currentDate));
            const end = endOfWeek(endOfMonth(currentDate));
            return eachDayOfInterval({ start, end });
        } else if (calendarView === 'week') {
            const start = startOfWeek(currentDate);
            const end = endOfWeek(currentDate);
            return eachDayOfInterval({ start, end });
        }
        return [currentDate];
    };

    const getActivitiesForDay = (date: Date) => {
        return filteredActivities.filter(a => {
            const d = a.startDate ? parseISO(a.startDate) : (a.dueDate ? parseISO(a.dueDate) : null);
            return d && isSameDay(d, date);
        });
    };

    const renderMonthCell = (day: Date) => {
        const dayActivities = getActivitiesForDay(day);
        const isCurrentMonth = isSameMonth(day, currentDate);

        return (
            <div
                key={day.toISOString()}
                className={`
                    min-h-[100px] border border-white/5 p-2 relative transition-colors group cursor-pointer
                    ${!isCurrentMonth ? 'bg-black/20 opacity-50' : 'bg-black/40'}
                    ${isToday(day) ? 'bg-primary/5 border-primary/30' : ''}
                    hover:bg-white/5
                `}
                onClick={() => {
                    setCurrentDate(day);
                    setCalendarView('day');
                }}
            >
                <span className={`
                    text-xs font-mono mb-1 block
                    ${isToday(day) ? 'text-primary font-bold' : 'text-muted-foreground'}
                `}>
                    {format(day, 'd')}
                </span>
                <div className="space-y-1">
                    {dayActivities.slice(0, 3).map(act => (
                        <div
                            key={act.id}
                            className="group/item flex items-center justify-between gap-1.5 text-[10px] bg-white/5 rounded px-1 py-0.5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer relative pr-6"
                            onClick={(e) => { e.stopPropagation(); handleActivityClick(act); }}
                        >
                            <div className="flex items-center gap-1.5 overflow-hidden">
                                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: getActivityColor(act.type) }} />
                                <span className="truncate text-slate-300">{act.title}</span>
                            </div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                {renderActionButtons(act, 'calendar')}
                            </div>
                        </div>
                    ))}
                    {dayActivities.length > 3 && (
                        <div className="text-[10px] text-muted-foreground pl-1">
                            +{dayActivities.length - 3} more
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderWeekColumn = (day: Date) => {
        const dayActivities = getActivitiesForDay(day);
        const isTodayDay = isToday(day);

        return (
            <div key={day.toISOString()} className="flex-1 min-w-[140px] border-r border-white/10 last:border-r-0 flex flex-col">
                <div className={`
                    p-3 text-center border-b border-white/10
                    ${isTodayDay ? 'bg-primary/10' : ''}
                `}>
                    <div className="text-xs text-muted-foreground uppercase">{format(day, 'EEE')}</div>
                    <div className={`text-xl font-bold ${isTodayDay ? 'text-primary' : 'text-white'}`}>
                        {format(day, 'd')}
                    </div>
                </div>
                <div className="flex-1 p-2 space-y-2 bg-black/20 min-h-[300px]">
                    {dayActivities.map(act => (
                        <div
                            key={act.id}
                            className="group/item bg-white/5 border border-white/10 rounded-md p-2 text-xs hover:bg-white/10 transition-colors cursor-pointer relative"
                            onClick={() => handleActivityClick(act)}
                        >
                            <div className="absolute right-1 top-1 opacity-0 group-hover/item:opacity-100 transition-opacity z-10">
                                {renderActionButtons(act, 'calendar')}
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getActivityColor(act.type) }} />
                                <span className="font-semibold text-slate-200 line-clamp-1">{act.title}</span>
                            </div>
                            <div className="text-muted-foreground pl-4 flex items-center gap-1 text-[10px]">
                                {format(parseISO(act.startDate || act.dueDate || new Date().toISOString()), 'HH:mm')} - {act.type}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderDayView = () => {
        const dayActivities = getActivitiesForDay(currentDate);

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10">
                    <div>
                        <h3 className="text-xl font-bold text-white">{format(currentDate, 'EEEE, MMMM do, yyyy')}</h3>
                        <p className="text-sm text-muted-foreground">Daily Activity Schedule</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white">{dayActivities.length}</div>
                        <div className="text-xs text-muted-foreground uppercase">Activities</div>
                    </div>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
                    {dayActivities.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            No activities scheduled for this day.
                        </div>
                    ) : (
                        <div className="divide-y divide-white/10">
                            {dayActivities.map(act => (
                                <div
                                    key={act.id}
                                    className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group cursor-pointer relative"
                                    onClick={() => handleActivityClick(act)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-12 h-12 rounded-lg flex flex-col items-center justify-center bg-white/5 font-bold border border-white/10 text-xs gap-0.5"
                                            style={{ borderColor: getActivityColor(act.type) + '40', color: getActivityColor(act.type) }}
                                        >
                                            <span className="opacity-70">{format(parseISO(act.startDate || act.dueDate || new Date().toISOString()), 'MMM')}</span>
                                            <span className="text-sm">{format(parseISO(act.startDate || act.dueDate || new Date().toISOString()), 'd')}</span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white text-lg">{act.title}</div>
                                            <div className="text-sm text-muted-foreground line-clamp-1 max-w-md">{act.description || 'No description'}</div>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="text-xs flex items-center gap-1.5 text-slate-400">
                                                    <Clock className="w-3 h-3" />
                                                    {format(parseISO(act.startDate || act.dueDate || new Date().toISOString()), 'HH:mm')} ({act.duration} mins)
                                                </div>
                                                {act.maxPoints && (
                                                    <div className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                                                        {act.maxPoints} pts
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span
                                            className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
                                            style={{
                                                borderColor: getActivityColor(act.type) + '40',
                                                backgroundColor: getActivityColor(act.type) + '10',
                                                color: getActivityColor(act.type)
                                            }}
                                        >
                                            {act.type}
                                        </span>
                                        <div onClick={(e) => e.stopPropagation()}>
                                            {renderActionButtons(act, 'calendar')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // --- Table Logic ---
    const totalPages = Math.ceil(filteredActivities.length / pageSize);
    const paginatedActivities = filteredActivities.slice(page * pageSize, (page + 1) * pageSize);

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-end xl:items-center bg-black/40 p-4 rounded-xl border border-white/10 backdrop-blur-xl">
                <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search activities..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                            className="pl-9 bg-white/5 border-white/10 w-full md:w-[300px]"
                        />
                    </div>
                    <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0); }}>
                        <SelectTrigger className="w-full md:w-[200px] bg-white/5 border-white/10">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-muted-foreground" />
                                <SelectValue placeholder="Filter by Type" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            {activityTypes.map(type => (
                                <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-end">
                    {/* View Toggle */}
                    <div className="bg-white/5 p-1 rounded-lg border border-white/10 flex gap-1">
                        <button
                            onClick={() => setViewMode("calendar")}
                            className={`p-2 rounded-md transition-all ${viewMode === "calendar" ? "bg-primary text-white shadow" : "text-muted-foreground hover:text-white"
                                }`}
                        >
                            <CalendarIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("table")}
                            className={`p-2 rounded-md transition-all ${viewMode === "table" ? "bg-primary text-white shadow" : "text-muted-foreground hover:text-white"
                                }`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    <CreateActivityModal
                        classroomId={classroomId}
                        activityTypes={activityTypes}
                        onSuccess={onAddActivity}
                    >
                        <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                            <Plus className="w-4 h-4 mr-2" />
                            New Activity
                        </Button>
                    </CreateActivityModal>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === "calendar" ? (
                <Card className="bg-black/40 border-white/10 backdrop-blur-xl w-full">
                    <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={prev} className="h-8 w-8 bg-white/5 border-white/10">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={next} className="h-8 w-8 bg-white/5 border-white/10">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" onClick={today} className="h-8 text-xs">Today</Button>
                            </div>
                            <h2 className="text-xl font-bold text-white tabular-nums">
                                {format(currentDate, 'MMMM yyyy')}
                            </h2>
                        </div>

                        <Tabs value={calendarView} onValueChange={(v) => setCalendarView(v as CalendarView)} className="w-[180px]">
                            <TabsList className="grid w-full grid-cols-3 bg-white/5 h-9">
                                <TabsTrigger value="day" className="text-xs">Day</TabsTrigger>
                                <TabsTrigger value="week" className="text-xs">Week</TabsTrigger>
                                <TabsTrigger value="month" className="text-xs">Month</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </CardHeader>
                    <CardContent className="p-0">
                        {calendarView === 'month' && (
                            <div className="w-full">
                                <div className="grid grid-cols-7 border-b border-white/10 bg-white/5">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="p-2 text-center text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                                            {day}
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 auto-rows-fr">
                                    {getDays().map(day => renderMonthCell(day))}
                                </div>
                            </div>
                        )}

                        {calendarView === 'week' && (
                            <div className="w-full overflow-x-auto">
                                <div className="flex min-w-[800px]">
                                    {getDays().map(day => renderWeekColumn(day))}
                                </div>
                            </div>
                        )}

                        {calendarView === 'day' && (
                            <div className="p-6">
                                {renderDayView()}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                /* Table View */
                <div className="space-y-4">
                    <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#0a0a0f] border-b border-white/10">
                                    <tr>
                                        <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Activity</th>
                                        <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                                        <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date & Time</th>
                                        <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Detailed Info</th>
                                        <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {paginatedActivities.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center text-muted-foreground">
                                                No activities found matching your filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedActivities.map(act => (
                                            <tr
                                                key={act.id}
                                                className="group hover:bg-white/5 transition-colors cursor-pointer"
                                                onClick={() => handleActivityClick(act)}
                                            >
                                                <td className="p-4">
                                                    <div className="font-semibold text-white">{act.title}</div>
                                                    <div className="text-xs text-muted-foreground line-clamp-1">{act.description}</div>
                                                </td>
                                                <td className="p-4">
                                                    <span
                                                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
                                                        style={{
                                                            borderColor: getActivityColor(act.type) + '40',
                                                            backgroundColor: getActivityColor(act.type) + '10',
                                                            color: getActivityColor(act.type)
                                                        }}
                                                    >
                                                        {act.type}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-slate-300">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="flex items-center gap-1.5">
                                                            <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                                            {format(parseISO(act.startDate || act.dueDate || new Date().toISOString()), 'MMM d, yyyy')}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {format(parseISO(act.startDate || act.dueDate || new Date().toISOString()), 'HH:mm')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm">
                                                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                                        <div>Duration: {act.duration}m</div>
                                                        <div>Assign: {act.assignmentType}</div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    {renderActionButtons(act, 'table')}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div>Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, filteredActivities.length)} of {filteredActivities.length} entries</div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="h-8 px-3 bg-white/5 border-white/10"
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1}
                                    className="h-8 px-3 bg-white/5 border-white/10"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <ActivityDetailsModal
                activity={selectedActivity}
                activityTypes={activityTypes}
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onEvaluate={handleEvaluate}
            />
        </div>
    );
}
