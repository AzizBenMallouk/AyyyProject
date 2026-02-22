import { useState, useEffect } from "react";
import { Activity, ActivityComment, Enroll } from "@/types/classroom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, User as UserIcon, MessageSquare, Briefcase, FileText, ChevronRight } from "lucide-react";
import { getCommentsByAssignment, addComment } from "@/lib/action-plan-api";
import { Separator } from "@/components/ui/separator";

interface StudentActionPlanViewProps {
    students: Enroll[];
    actionPlans: Activity[];
}

export default function StudentActionPlanView({ students, actionPlans }: StudentActionPlanViewProps) {
    const [selectedStudent, setSelectedStudent] = useState<Enroll | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<Activity | null>(null);
    const [comments, setComments] = useState<ActivityComment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);

    // Filter plans for the selected student (simplification: assume all plans for now, 
    // real logic would check assignment targetIds if available locally or fetch from backend)
    // For this UI demo, we show all "Action Plan" type activities as potentially assignable.
    // In a real scenario, we'd filter by checking if this student is assigned.
    const studentPlans = actionPlans;

    useEffect(() => {
        if (students.length > 0 && !selectedStudent) {
            setSelectedStudent(students[0]);
        }
    }, [students]);

    useEffect(() => {
        if (selectedStudent && studentPlans.length > 0 && !selectedPlan) {
            setSelectedPlan(studentPlans[0]);
        }
    }, [selectedStudent, studentPlans]);

    useEffect(() => {
        if (selectedStudent && selectedPlan) {
            fetchComments();
        }
    }, [selectedStudent, selectedPlan]);

    const fetchComments = async () => {
        if (!selectedPlan || !selectedStudent) return;
        setLoadingComments(true);
        try {
            // Mock assignment ID fetching - in real app, fetch assignment ID via API given student+activity
            // For now, we'll try to fetch comments. If 404, empty list.
            // CAUTION: backend needs assignment ID. We need a way to get it.
            // Assuming we have a way or we just mock for UI now.
            // Since we didn't implement getAssignmentId endpoint, we might fail here.
            // Implementing a workaround: We need to know the assignment ID.

            // Temporary Workaround: fetch comments using a 'fake' assignment ID if we can't get real one?
            // No, that won't work. The backend expects real ID.
            // We should have implemented an endpoint to get assignment by user+activity.
            // For now, let's assume one exists or we just show empty state with a warning.

            // Ideal: const assignment = await getAssignment(selectedPlan.id, selectedStudent.learnerId);
            // const data = await getCommentsByAssignment(assignment.id);
            // setComments(data);
            setComments([]); // Placeholder until backend support

        } catch (error) {
            console.error("Failed to fetch comments", error);
            setComments([]);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newComment.trim() || !selectedStudent || !selectedPlan) return;

        // Similar issue: need assignment ID. 
        // Logic:
        // const comment = await addComment({
        //     assignmentId: 999, // NEED REAL ID
        //     userId: 1, // Current user ID (Staff)
        //     content: newComment
        // });
        // setComments([...comments, comment]);

        // UI Simulation
        const fakeComment: ActivityComment = {
            id: Date.now(),
            assignmentId: 0,
            userId: 999, // Staff
            userName: "You (Staff)",
            content: newComment,
            createdAt: new Date().toISOString()
        };
        setComments([...comments, fakeComment]);
        setNewComment("");
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-250px)] min-h-[600px]">
            {/* Left Col: Students List (30%) */}
            <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-4">
                <Card className="flex-1 bg-black/40 border-white/10 backdrop-blur-xl flex flex-col overflow-hidden">
                    <CardHeader className="py-4 border-b border-white/10">
                        <CardTitle className="text-sm uppercase font-bold text-muted-foreground">Students</CardTitle>
                    </CardHeader>
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-1">
                            {students.map(student => (
                                <div
                                    key={student.id}
                                    onClick={() => setSelectedStudent(student)}
                                    className={`
                                        flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
                                        ${selectedStudent?.id === student.id ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5 border border-transparent'}
                                    `}
                                >
                                    <Avatar className="w-8 h-8 border border-white/10">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${student.learnerName}`} />
                                        <AvatarFallback><UserIcon className="w-4 h-4" /></AvatarFallback>
                                    </Avatar>
                                    <div className="overflow-hidden">
                                        <p className={`text-sm font-medium truncate ${selectedStudent?.id === student.id ? 'text-primary' : 'text-slate-200'}`}>
                                            {student.learnerName}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground truncate">{student.learnerEmail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </Card>
            </div>

            {/* Right Col: Action Plan & Chat (70%) */}
            <div className="md:col-span-8 lg:col-span-9 flex flex-col gap-4">
                {selectedStudent ? (
                    <Card className="flex-1 bg-black/40 border-white/10 backdrop-blur-xl flex flex-col overflow-hidden">
                        <div className="flex h-full">
                            {/* Inner Left: Plans List */}
                            <div className="w-1/3 border-r border-white/10 flex flex-col bg-black/20">
                                <div className="p-4 border-b border-white/10">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-primary" />
                                        Action Plans
                                    </h3>
                                </div>
                                <ScrollArea className="flex-1">
                                    <div className="p-2 space-y-2">
                                        {studentPlans.map(plan => (
                                            <div
                                                key={plan.id}
                                                onClick={() => setSelectedPlan(plan)}
                                                className={`
                                                    p-3 rounded border text-left transition-all cursor-pointer
                                                    ${selectedPlan?.id === plan.id
                                                        ? 'bg-white/10 border-white/20'
                                                        : 'bg-transparent border-transparent hover:bg-white/5 text-muted-foreground'}
                                                `}
                                            >
                                                <div className="text-sm font-medium line-clamp-1">{plan.title}</div>
                                                <div className="flex justify-between items-center mt-2 text-[10px] opacity-70">
                                                    <span>{plan.dueDate ? new Date(plan.dueDate).toLocaleDateString() : 'No Deadline'}</span>
                                                    <ChevronRight className="w-3 h-3" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>

                            {/* Inner Right: Chat & Details */}
                            <div className="w-2/3 flex flex-col">
                                {selectedPlan ? (
                                    <>
                                        <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-start">
                                            <div>
                                                <h2 className="font-bold text-lg text-white">{selectedPlan.title}</h2>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                                                        {selectedPlan.type}
                                                    </span>
                                                    <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-slate-300">
                                                        Max Points: {selectedPlan.maxPoints}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" className="h-8">View Details</Button>
                                        </div>

                                        {/* Chat Area */}
                                        <div className="flex-1 flex flex-col overflow-hidden bg-black/10">
                                            <ScrollArea className="flex-1 p-4">
                                                <div className="space-y-4">
                                                    <div className="flex gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                                            <Briefcase className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <div className="bg-white/10 rounded-lg rounded-tl-none p-3 max-w-[80%] text-sm text-slate-200">
                                                            <p className="font-bold text-xs text-primary mb-1">System</p>
                                                            <p>{selectedPlan.description}</p>
                                                        </div>
                                                    </div>

                                                    {comments.map(comment => (
                                                        <div key={comment.id} className={`flex gap-3 ${comment.userId === 999 ? 'flex-row-reverse' : ''}`}>
                                                            <Avatar className="w-8 h-8 border border-white/10 shrink-0">
                                                                <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className={`
                                                                rounded-lg p-3 max-w-[80%] text-sm
                                                                ${comment.userId === 999 ? 'bg-primary/20 text-white rounded-tr-none' : 'bg-white/10 text-slate-200 rounded-tl-none'}
                                                            `}>
                                                                <div className="flex justify-between items-center gap-4 mb-1">
                                                                    <p className="font-bold text-xs opacity-70">{comment.userName}</p>
                                                                    <span className="text-[10px] opacity-50">{new Date(comment.createdAt).toLocaleTimeString()}</span>
                                                                </div>
                                                                <p>{comment.content}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>

                                            <div className="p-4 border-t border-white/10 bg-black/20">
                                                <form
                                                    onSubmit={(e) => {
                                                        e.preventDefault();
                                                        handleSendMessage();
                                                    }}
                                                    className="flex gap-2"
                                                >
                                                    <Input
                                                        value={newComment}
                                                        onChange={(e) => setNewComment(e.target.value)}
                                                        placeholder="Type your feedback..."
                                                        className="bg-black/40 border-white/10"
                                                    />
                                                    <Button type="submit" size="icon" className="shrink-0">
                                                        <Send className="w-4 h-4" />
                                                    </Button>
                                                </form>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                                        <FileText className="w-12 h-12 mb-4 opacity-20" />
                                        <h3 className="text-lg font-bold text-white">No Action Plan Selected</h3>
                                        <p>Select an action plan from the list to view details and chat.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center border border-dashed border-white/10 rounded-xl bg-black/20">
                        <UserIcon className="w-16 h-16 mb-4 opacity-20" />
                        <h3 className="text-xl font-bold text-white">No Student Selected</h3>
                        <p>Select a student from the list to view their action plans.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
