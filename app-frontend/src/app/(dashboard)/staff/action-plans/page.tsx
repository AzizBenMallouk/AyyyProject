"use client";

import { useState, useEffect } from "react";
import { getActionPlans, ActivityFilterDTO } from "@/lib/classroom-activity-api";
import { Activity, Classroom } from "@/types/classroom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Filter, Calendar, MapPin, GraduationCap, Users, Layers, BookOpen, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { getAllClassrooms } from "@/lib/classroom-api";
import { getCampuses, Campus } from "@/lib/campus-api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export default function ActionPlansPage() {
    const [actionPlans, setActionPlans] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    // Filter Options State
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [isClassroomOpen, setIsClassroomOpen] = useState(false);
    const [classroomSearch, setClassroomSearch] = useState("");

    // Filters State
    const [filters, setFilters] = useState<ActivityFilterDTO>({
        type: "ACTION_PLAN"
    });

    useEffect(() => {
        fetchOptions();
    }, []);

    // Debounce classroom search to avoid too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchClassrooms(classroomSearch);
        }, 300);
        return () => clearTimeout(timer);
    }, [classroomSearch]);

    useEffect(() => {
        fetchData();
    }, [page, size, filters]);

    const fetchOptions = async () => {
        try {
            const campusesData = await getCampuses();
            setCampuses(campusesData);
        } catch (error) {
            console.error("Failed to fetch filter options", error);
        }
    };

    const fetchClassrooms = async (search: string) => {
        try {
            // Fetch active classrooms, page 0, size 50?
            const data = await getAllClassrooms({
                active: true,
                search: search,
                page: 0,
                size: 50
            });
            setClassrooms(data.content);
        } catch (error) {
            console.error("Failed to fetch classrooms", error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getActionPlans(page, size, filters);
            setActionPlans(response.content);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error("Failed to fetch action plans", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: keyof ActivityFilterDTO, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(0); // Reset to first page on filter change
    };

    return (
        <div className="p-8 space-y-8 min-h-screen bg-slate-950 text-slate-200">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Action Plans Management</h1>
                    <p className="text-muted-foreground mt-1">Global view of all classroom action plans</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filters Sidebar */}
                <Card className="bg-white/5 border-white/10 lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Filter className="w-5 h-5" /> Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        {/* Classroom Filter - Combobox */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Classroom</label>
                            <Popover open={isClassroomOpen} onOpenChange={setIsClassroomOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={isClassroomOpen}
                                        className="w-full justify-between bg-black/20 border-white/10 text-muted-foreground hover:text-white"
                                    >
                                        {filters.classroomId
                                            ? classrooms.find((c) => c.id === filters.classroomId)?.name || `Classroom #${filters.classroomId}`
                                            : "Select classroom..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0 bg-slate-900 border-white/10">
                                    <Command shouldFilter={false}>
                                        {/* Disable local filtering because we do server-side filtering */}
                                        <CommandInput
                                            placeholder="Search classroom..."
                                            value={classroomSearch}
                                            onValueChange={setClassroomSearch}
                                        />
                                        <CommandEmpty>No classroom found.</CommandEmpty>
                                        <CommandGroup>
                                            {classrooms.map((classroom) => (
                                                <CommandItem
                                                    key={classroom.id}
                                                    value={classroom.name}
                                                    onSelect={() => {
                                                        handleFilterChange("classroomId", classroom.id);
                                                        setIsClassroomOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            filters.classroomId === classroom.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {classroom.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Campus Filter - Select */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Campus</label>
                            <Select
                                value={filters.campusId?.toString() || "ALL"}
                                onValueChange={(val) => handleFilterChange('campusId', val === "ALL" ? undefined : parseInt(val))}
                            >
                                <SelectTrigger className="w-full bg-black/20 border-white/10">
                                    <SelectValue placeholder="Select Campus" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                                    <SelectItem value="ALL">All Campuses</SelectItem>
                                    {campuses.map((campus) => (
                                        <SelectItem key={campus.id} value={campus.id.toString()}>
                                            {campus.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">From Date</label>
                            <Input
                                type="date"
                                className="bg-black/20 border-white/10"
                                onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">To Date</label>
                            <Input
                                type="date"
                                className="bg-black/20 border-white/10"
                                onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
                            />
                        </div>

                        <Button
                            variant="outline"
                            className="w-full border-white/10 hover:bg-white/5"
                            onClick={() => {
                                setFilters({ type: "ACTION_PLAN" });
                                setPage(0);
                                setClassroomSearch("");
                                // Reset inputs technically requires controlled components for dates too
                            }}
                        >
                            Reset Filters
                        </Button>
                    </CardContent>
                </Card>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : actionPlans.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-muted-foreground">No action plans found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {actionPlans.map((plan) => (
                                <Card key={plan.id} className="bg-white/5 border-white/10 hover:border-primary/30 transition-colors">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mb-2">
                                                    Action Plan
                                                </Badge>
                                                <h3 className="text-xl font-semibold text-white">{plan.title}</h3>
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                    {plan.description}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="secondary" className="bg-white/5 text-muted-foreground">
                                                    {plan.classroomName || `Classroom #${plan.classroomId}`}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground border-t border-white/5 pt-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-blue-400" />
                                                <span>Due: {plan.dueDate ? format(new Date(plan.dueDate), 'MMM dd, yyyy') : 'No Date'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-purple-400" />
                                                <span>{plan.assignmentType}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Layers className="w-4 h-4 text-green-400" />
                                                <span>Sprint {plan.sprintId}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-orange-400" />
                                                <span>{plan.duration} mins</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 0}
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                            >
                                Previous
                            </Button>
                            <span className="flex items-center px-4 text-sm text-muted-foreground">
                                Page {page + 1} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
