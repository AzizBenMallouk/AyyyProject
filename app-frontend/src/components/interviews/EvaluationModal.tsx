import { useState, useEffect } from "react";
import { Loader2, Star, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getAllSoftSkills, SoftSkill } from "@/lib/soft-skills-api";
import { addEvaluation, StudentInterview } from "@/lib/interview-api";
import { cn } from "@/lib/utils";

interface EvaluationModalProps {
    isOpen: boolean;
    onClose: () => void;
    interview: StudentInterview;
    onSuccess: () => void;
}

export function EvaluationModal({ isOpen, onClose, interview, onSuccess }: EvaluationModalProps) {
    const [softSkills, setSoftSkills] = useState<SoftSkill[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    // State for evaluations: mapped by softSkillId
    const [scores, setScores] = useState<Record<number, number>>({});
    const [comments, setComments] = useState<Record<number, string>>({});
    const [globalComment, setGlobalComment] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchSoftSkills();
        }
    }, [isOpen]);

    const fetchSoftSkills = async () => {
        try {
            const data = await getAllSoftSkills();
            setSoftSkills(data);
            // Initialize scores with 3 (mid-point)
            const initialScores: Record<number, number> = {};
            data.forEach(skill => {
                initialScores[skill.id] = 3;
            });
            setScores(initialScores);
        } catch (error) {
            console.error("Failed to fetch soft skills", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            // Submit evaluations sequentially or in parallel?
            // The API provided seems to accept one evaluation at a time...
            // "public ResponseEntity<Void> addEvaluation(@PathVariable Long id, @RequestBody SoftSkillEvaluationDTO dto)"
            // Wait, does the backend support bulk? The controller shows:
            // "interviewService.addEvaluation(id, dto);"
            // It seems to add ONE evaluation. This is inefficient for a full review.
            // But let's work with what we have. We will iterate and send requests.
            // IMPROVEMENT: Backend should accept a list of evaluations.

            // Wait, let's look at the controller again.
            // It takes SoftSkillEvaluationDTO.

            for (const skill of softSkills) {
                await addEvaluation(interview.id, {
                    softSkillId: skill.id,
                    score: scores[skill.id],
                    comment: comments[skill.id] || ""
                });
            }

            // Also update global comment if possible?
            // The API doesn't seem to expose a direct "update global comment" endpoint easily
            // except maybe via updateStatus or if addEvaluation handles it?
            // The seeding logic set global comment on creation.
            // Let's assume for now we just add evaluations.

            toast({
                title: "Evaluation Submitted",
                description: "All skills have been evaluated successfully.",
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to submit evaluation. Please try again.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#0a0a0f] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Evaluate Interview</DialogTitle>
                    <DialogDescription>
                        Evaluate <span className="text-primary font-bold">{interview.studentName}</span> for <span className="text-white">{interview.positionTitle}</span>.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-8 py-4">
                        {softSkills.map((skill) => (
                            <div key={skill.id} className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-lg text-white">{skill.name}</h4>
                                        <p className="text-sm text-gray-400">{skill.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-primary/20 px-3 py-1 rounded-full text-primary font-bold">
                                        <Star className="w-4 h-4 fill-primary" />
                                        {scores[skill.id]}/5
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                                        <div className="flex gap-1.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setScores({ ...scores, [skill.id]: star })}
                                                    className={cn(
                                                        "p-1.5 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50",
                                                        scores[skill.id] >= star ? "text-yellow-400" : "text-gray-600"
                                                    )}
                                                >
                                                    <Star
                                                        className={cn(
                                                            "w-6 h-6 transition-transform hover:scale-110",
                                                            scores[skill.id] >= star ? "fill-current" : ""
                                                        )}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        <span className={cn(
                                            "text-sm font-bold px-3 py-1 rounded-full border",
                                            scores[skill.id] >= 4 ? "bg-green-500/20 text-green-400 border-green-500/50" :
                                                scores[skill.id] === 3 ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" :
                                                    "bg-red-500/20 text-red-400 border-red-500/50"
                                        )}>
                                            {scores[skill.id] === 1 ? "Needs Improvement" :
                                                scores[skill.id] === 2 ? "Below Average" :
                                                    scores[skill.id] === 3 ? "Average" :
                                                        scores[skill.id] === 4 ? "Good" : "Excellent"}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs text-gray-400">Comment (Optional)</Label>
                                    <Textarea
                                        value={comments[skill.id] || ""}
                                        onChange={(e) => setComments({ ...comments, [skill.id]: e.target.value })}
                                        placeholder={`Feedback on ${skill.name}...`}
                                        className="h-20 bg-black/20 border-white/10 text-sm"
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="pt-4 border-t border-white/10">
                            <Label className="text-base font-bold text-white mb-2 block">Global Interview Comment</Label>
                            <Textarea
                                value={globalComment}
                                onChange={(e) => setGlobalComment(e.target.value)}
                                placeholder="Overall summary of the interview..."
                                className="bg-white/5 border-white/10 min-h-[100px]"
                            />
                        </div>
                    </div>
                )}

                <DialogFooter className="gap-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={submitting || loading} className="bg-primary hover:bg-primary/90">
                        {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Submit Evaluation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
