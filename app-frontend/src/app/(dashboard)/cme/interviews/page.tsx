"use client";

import { useState, useEffect } from "react";
import { Plus, Briefcase, Calendar, Search, Loader2, User, Clock, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Filter } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllPositions, createPosition, InterviewPosition, getAllInterviews, StudentInterview } from "@/lib/interview-api";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { EvaluationModal } from "@/components/interviews/EvaluationModal";
import { cn } from "@/lib/utils";

export default function InterviewsPage() {
    const [positions, setPositions] = useState<InterviewPosition[]>([]);
    const [interviews, setInterviews] = useState<StudentInterview[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Evaluation Modal State
    const [selectedInterview, setSelectedInterview] = useState<StudentInterview | null>(null);
    const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);

    const { toast } = useToast();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        title: "",
        description: ""
    });

    // Filtering & Pagination State
    const [searchTerm, setSearchTerm] = useState("");
    const [positionFilter, setPositionFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // Derived State
    const filteredInterviews = interviews.filter(interview => {
        const matchesSearch = interview.studentName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPosition = positionFilter === "ALL" || String(interview.positionId) === positionFilter;
        return matchesSearch && matchesPosition;
    });

    const totalPages = Math.ceil(filteredInterviews.length / ITEMS_PER_PAGE);
    const paginatedInterviews = filteredInterviews.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const fetchData = async () => {
        setLoading(true);
        try {
            const [posData, intData] = await Promise.all([
                getAllPositions(),
                getAllInterviews()
            ]);
            setPositions(posData);
            setInterviews(intData);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to fetch data",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreatePosition = async () => {
        if (!formData.title) return;
        setIsSubmitting(true);
        try {
            await createPosition(formData);
            toast({
                title: "Success",
                description: "Interview position created",
            });
            setIsCreateOpen(false);
            setFormData({ title: "", description: "" });
            fetchData();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create position",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEvaluation = (interview: StudentInterview) => {
        setSelectedInterview(interview);
        setIsEvaluationOpen(true);
    };

    return (
        <div className="p-8 space-y-8 min-h-screen text-slate-200 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 flex items-center gap-3">
                        <Briefcase className="w-8 h-8 text-primary" />
                        Interview Management
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage interview positions and conduct student evaluations
                    </p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="w-4 h-4 mr-2" />
                            New Position
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0a0a0f] border-white/10 text-white">
                        <DialogHeader>
                            <DialogTitle>Create Interview Position</DialogTitle>
                            <DialogDescription>
                                Define a new role or position for upcoming interviews.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Position Title</label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Junior Frontend Developer"
                                    className="bg-white/5 border-white/10 focus:ring-primary/50 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Description</label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Role requirements and details..."
                                    className="bg-white/5 border-white/10 focus:ring-primary/50 text-white min-h-[100px]"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreatePosition} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Create Position
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="positions" className="space-y-6">
                <TabsList className="bg-white/5 border border-white/10 p-1 rounded-full backdrop-blur-md">
                    <TabsTrigger value="positions" className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                        Positions
                    </TabsTrigger>
                    <TabsTrigger value="interviews" className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                        Scheduled Interviews
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="positions" className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {positions.map((pos) => (
                                <Card key={pos.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                                            {pos.title}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3" />
                                            Created {new Date(pos.createdAt).toLocaleDateString()}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-400 line-clamp-3">
                                            {pos.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                            {positions.length === 0 && (
                                <div className="col-span-full text-center py-12 text-muted-foreground bg-white/5 rounded-xl border border-white/10 border-dashed">
                                    <p>No interview positions created yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="interviews" className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Filters and Search */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by student name..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1); // Reset to first page
                                        }}
                                        className="pl-10 bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                                <div className="w-full md:w-[250px]">
                                    <Select value={positionFilter} onValueChange={(val) => {
                                        setPositionFilter(val);
                                        setCurrentPage(1);
                                    }}>
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                            <SelectValue placeholder="All Positions" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All Positions</SelectItem>
                                            {positions.map((pos) => (
                                                <SelectItem key={pos.id} value={String(pos.id)}>{pos.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Interview List */}
                            <div className="space-y-4">
                                {paginatedInterviews.length === 0 ? (
                                    <Card className="bg-white/5 border-white/10 p-12 text-center text-muted-foreground">
                                        <p>No scheduled interviews found matching your filters.</p>
                                    </Card>
                                ) : (
                                    paginatedInterviews.map((interview) => (
                                        <Card key={interview.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                                            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-bold text-white text-lg">
                                                        {interview.studentName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg text-white">{interview.studentName}</h3>
                                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                                            <Briefcase className="w-3 h-3" />
                                                            {interview.positionTitle}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col md:flex-row items-center gap-6">
                                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                                        <Calendar className="w-4 h-4 text-primary" />
                                                        {new Date(interview.interviewDate).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                                        <Clock className="w-4 h-4 text-primary" />
                                                        {new Date(interview.interviewDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className={cn(
                                                        "px-3 py-1 rounded-full text-xs font-bold",
                                                        interview.status === 'COMPLETED' ? "bg-green-500/20 text-green-400" :
                                                            interview.status === 'SCHEDULED' ? "bg-blue-500/20 text-blue-400" :
                                                                "bg-white/10 text-gray-400"
                                                    )}>
                                                        {interview.status}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    {interview.status !== 'COMPLETED' && (
                                                        <Button variant="outline" size="sm" onClick={() => openEvaluation(interview)} className="border-primary text-primary hover:bg-primary hover:text-white">
                                                            Evaluate
                                                        </Button>
                                                    )}
                                                    {interview.status === 'COMPLETED' && (
                                                        <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300 hover:bg-green-500/10 cursor-default">
                                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                                            Evaluated
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 mt-8">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="border-white/10 text-white hover:bg-white/10"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <span className="text-sm text-gray-400">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="border-white/10 text-white hover:bg-white/10"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {selectedInterview && (
                <EvaluationModal
                    isOpen={isEvaluationOpen}
                    onClose={() => setIsEvaluationOpen(false)}
                    interview={selectedInterview}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
}
