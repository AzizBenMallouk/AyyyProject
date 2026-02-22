import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, ActivityType, Enroll } from "@/types/classroom";
import ActionPlanList from "./ActionPlanList";
import ActionPlanCalendar from "./ActionPlanCalendar";
import StudentActionPlanView from "./StudentActionPlanView";
import CreateActivityModal from "./CreateActivityModal";
import { List, Calendar, Users, LayoutDashboard } from "lucide-react";
import { getActionPlansByClassroom } from "@/lib/action-plan-api";

interface ActionPlansTabProps {
    classroomId: number;
    enrolledLearners: Enroll[];
    activityTypes: ActivityType[];
    onUpdate: () => void;
}

export default function ActionPlansTab({ classroomId, enrolledLearners, activityTypes, onUpdate }: ActionPlansTabProps) {
    const [view, setView] = useState("list");
    const [actionPlans, setActionPlans] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const data = await getActionPlansByClassroom(classroomId);
            setActionPlans(data);
        } catch (error) {
            console.error("Failed to fetch action plans", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, [classroomId]);

    const handleCreateSuccess = () => {
        fetchPlans();
        onUpdate();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <Tabs value={view} onValueChange={setView} className="w-full md:w-auto">
                    <TabsList className="bg-white/5 border border-white/10 p-1">
                        <TabsTrigger value="list" className="gap-2">
                            <List className="w-4 h-4" />
                            List
                        </TabsTrigger>
                        <TabsTrigger value="students" className="gap-2">
                            <Users className="w-4 h-4" />
                            Students
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="gap-2">
                            <Calendar className="w-4 h-4" />
                            Calendar
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex gap-2">
                    <CreateActivityModal
                        classroomId={classroomId}
                        activityTypes={activityTypes}
                        onSuccess={handleCreateSuccess}
                    >
                        {/* We pass nothing here, so it uses default button in modal, or we can customize trigger */}
                    </CreateActivityModal>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <>
                    {view === "list" && (
                        <ActionPlanList
                            actionPlans={actionPlans}
                            onSelectPlan={(plan) => console.log("Selected", plan)} // In real app, open detail modal
                            onCreateNew={() => { }} // Handled by CreateActivityModal above, maybe link button?
                        />
                    )}

                    {view === "students" && (
                        <StudentActionPlanView
                            students={enrolledLearners}
                            actionPlans={actionPlans}
                        />
                    )}

                    {view === "calendar" && (
                        <ActionPlanCalendar actionPlans={actionPlans} />
                    )}
                </>
            )}
        </div>
    );
}
