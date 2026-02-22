"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/user";
import { Campus, Promotion, Grade } from "@/types/admin";
import { getFilteredLearners } from "@/lib/user-api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Search,
    Filter,
    X,
    Check,
    Users,
    Loader2,
    Mail,
    Phone,
    CreditCard,
    MapPin,
    GraduationCap
} from "lucide-react";

interface StudentDataTableProps {
    selectedIds: number[];
    onToggle: (id: number) => void;
    onSelectAll: (ids: number[]) => void;
    campuses: Campus[];
    promotions: Promotion[];
    grades: Grade[];
    defaultCampusId?: number;
    defaultStatus?: string;
    classroomId?: number;
}

export default function StudentDataTable({
    selectedIds,
    onToggle,
    onSelectAll,
    campuses,
    promotions,
    grades,
    defaultCampusId,
    defaultStatus,
    classroomId
}: StudentDataTableProps) {
    const [learners, setLearners] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;

    const [filters, setFilters] = useState({
        query: ""
    });



    const fetchLearners = async () => {
        setLoading(true);
        try {
            const data = await getFilteredLearners({
                classroomId: classroomId,
                query: filters.query,
                page,
                size: pageSize
            });
            setLearners(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error) {
            console.error("Failed to fetch learners", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLearners();
        }, 300);
        return () => clearTimeout(timer);
    }, [filters, page]);

    // Reset page to 0 when query changes
    useEffect(() => {
        setPage(0);
    }, [filters.query]);

    const handleSelectAll = () => {
        const allIds = learners.map(l => l.id);
        const allSelected = allIds.every(id => selectedIds.includes(id));

        if (allSelected) {
            // Deselect only those that are in the current list
            const newSelected = selectedIds.filter(id => !allIds.includes(id));
            onSelectAll(newSelected);
        } else {
            // Select all from current list + keep others
            const newSelected = Array.from(new Set([...selectedIds, ...allIds]));
            onSelectAll(newSelected);
        }
    };

    const isSelected = (id: number) => selectedIds.includes(id);

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email, phone, CIN..."
                        value={filters.query}
                        onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                        className="pl-9 bg-white/5 border-white/10"
                    />
                    {filters.query && (
                        <button
                            onClick={() => setFilters({ ...filters, query: "" })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleSelectAll}
                        className="bg-white/5 border-white/10"
                    >
                        {learners.length > 0 && learners.every(l => selectedIds.includes(l.id)) ? "Deselect Page" : "Select Page"}
                    </Button>
                </div>
            </div>



            <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-[#0a0a0f] z-10 border-b border-white/10">
                            <tr>
                                <th className="p-4 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-white/20 bg-white/5 accent-primary cursor-pointer"
                                        checked={learners.length > 0 && learners.every(l => selectedIds.includes(l.id))}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Learner</th>
                                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Contact & Identity</th>
                                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Academic Context</th>
                                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Status</th>
                                <th className="p-4 w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                            <p className="text-muted-foreground animate-pulse">Filtering learners...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : learners.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-50">
                                            <Users className="h-12 w-12 text-muted-foreground" />
                                            <p className="text-lg font-medium">No learners found</p>
                                            <p className="text-sm">Try adjusting your filters or search query</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                learners.map((learner) => (
                                    <tr
                                        key={learner.id}
                                        onClick={(e) => {
                                            if ((e.target as HTMLElement).tagName !== 'INPUT') {
                                                window.location.href = `/student/${learner.id}`;
                                            }
                                        }}
                                        className={`group cursor-pointer transition-all hover:bg-white/5 ${isSelected(learner.id) ? 'bg-primary/10' : ''}`}
                                    >
                                        <td className="p-4 text-center">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-white/20 bg-white/5 accent-primary cursor-pointer"
                                                checked={isSelected(learner.id)}
                                                onChange={() => onToggle(learner.id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-white/10 font-bold text-primary shadow-inner">
                                                    {learner.firstName?.[0]}{learner.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white group-hover:text-primary transition-colors">
                                                        {learner.firstName} {learner.lastName}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Mail className="h-3 w-3" /> {learner.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell">
                                            <div className="space-y-1">
                                                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                    <Phone className="h-3 w-3" /> {learner.phone || 'N/A'}
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                    <CreditCard className="h-3 w-3" /> {learner.cin || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden lg:table-cell">
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                                <div className="text-sm text-slate-300 flex items-center gap-2">
                                                    <Users className="h-3.5 w-3.5 text-primary/70" />
                                                    <span className="truncate max-w-[120px]">{learner.currentClassroomName || 'No Class'}</span>
                                                </div>
                                                <div className="text-sm text-slate-300 flex items-center gap-2">
                                                    <GraduationCap className="h-3.5 w-3.5 text-primary/70" />
                                                    <span className="truncate max-w-[120px]">{learner.promotionName || 'N/A'}</span>
                                                </div>
                                                <div className="text-sm text-slate-300 flex items-center gap-2">
                                                    <GraduationCap className="h-3.5 w-3.5 text-primary/70" />
                                                    <span className="truncate max-w-[120px]">{learner.gradeName || 'N/A'}</span>
                                                </div>
                                                <div className="text-sm text-slate-300 flex items-center gap-2">
                                                    <MapPin className="h-3.5 w-3.5 text-primary/70" />
                                                    <span className="truncate max-w-[120px]">{learner.campusName || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${learner.statusName === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                learner.statusName === 'INACTIVE' ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30' :
                                                    learner.statusName === 'SUSPENDED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                        'bg-primary/20 text-primary border border-primary/30'
                                                }`}>
                                                {learner.statusName || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className={`h-6 w-6 rounded-full flex items-center justify-center transition-all ${isSelected(learner.id) ? 'bg-primary text-white scale-100' : 'bg-white/5 text-transparent scale-0'}`}>
                                                <Check className="h-4 w-4" />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {!loading && (
                <div className="flex justify-between items-center text-xs text-muted-foreground px-2">
                    <div className="flex items-center gap-4">
                        <span>Showing {learners.length} results (Total {totalElements})</span>
                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="h-7 px-2 bg-white/5 border-white/10"
                                >
                                    Prev
                                </Button>
                                <span className="text-white">
                                    {page + 1} / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1}
                                    className="h-7 px-2 bg-white/5 border-white/10"
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                    <div>{selectedIds.length} learners selected total</div>
                </div>
            )}
        </div>
    );
}
