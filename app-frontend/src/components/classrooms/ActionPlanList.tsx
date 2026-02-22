import { Activity } from "@/types/classroom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Plus, Search } from "lucide-react";
import { useState } from "react";

interface ActionPlanListProps {
    actionPlans: Activity[];
    onSelectPlan: (plan: Activity) => void;
    onCreateNew: () => void;
}

export default function ActionPlanList({ actionPlans, onSelectPlan, onCreateNew }: ActionPlanListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const filteredPlans = actionPlans.filter(plan => {
        const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase());
        // const matchesStatus = statusFilter === "ALL" || plan.status === statusFilter; // Activity doesn't have status field in interface yet, maybe deadline?
        return matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-black/40 p-4 rounded-lg border border-white/10 backdrop-blur-xl">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search action plans..."
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={onCreateNew} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4 mr-2" />
                        New Plan
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlans.map((plan) => (
                    <Card
                        key={plan.id}
                        className="bg-black/40 border-white/10 backdrop-blur-xl hover:border-primary/50 transition-all cursor-pointer group"
                        onClick={() => onSelectPlan(plan)}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">
                                    {plan.title}
                                </CardTitle>
                                {plan.isRecurring && (
                                    <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-0.5 rounded border border-blue-500/20">
                                        Recurring
                                    </span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                                {plan.description}
                            </p>

                            <div className="flex flex-col gap-2 text-xs text-muted-foreground/80">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-primary/70" />
                                    <span>Due: {plan.dueDate ? new Date(plan.dueDate).toLocaleDateString() : 'No deadline'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-primary/70" />
                                    <span>Duration: {plan.duration} mins</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">
                                    Max Points: <span className="text-white font-medium">{plan.maxPoints}</span>
                                </span>
                                <Button size="sm" variant="ghost" className="h-7 text-xs hover:text-primary hover:bg-primary/10">
                                    View Details
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredPlans.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 opacity-20" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1">No action plans found</h3>
                    <p className="text-sm">Try adjusting your filters or create a new one.</p>
                </div>
            )}
        </div>
    );
}
