"use client";

import { useState, useEffect } from "react";
import { Reservation, getAllReservations, updateReservationStatus, getMyReservations } from "@/lib/library-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ReservationsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");

    const isAdminOrStaff = user?.roles.includes("ADMIN") || user?.roles.includes("TRAINER");

    useEffect(() => {
        if (user) {
            fetchReservations();
        }
    }, [user, activeTab]);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            let data = [];
            if (activeTab === "my") {
                data = await getMyReservations(user!.id);
            } else if (isAdminOrStaff) {
                data = await getAllReservations();
            } else {
                // Student trying to view all? Shouldn't happen if UI hidden, but fallback to my
                data = await getMyReservations(user!.id);
            }
            setReservations(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await updateReservationStatus(id, status);
            toast({ title: "Success", description: `Reservation ${status.toLowerCase()}` });
            fetchReservations();
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
            case "APPROVED": return "bg-green-500/10 text-green-500 border-green-500/20";
            case "REJECTED": return "bg-red-500/10 text-red-500 border-red-500/20";
            case "RETURNED": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            default: return "bg-gray-500/10 text-gray-500";
        }
    };

    return (
        <div className="p-8 space-y-8 min-h-screen bg-slate-950 text-slate-200">
            <div>
                <h1 className="text-3xl font-bold text-white">Reservations</h1>
                <p className="text-muted-foreground mt-1">Manage book reservations</p>
            </div>

            {isAdminOrStaff && (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-white/5 border border-white/10">
                        <TabsTrigger value="all">All Reservations</TabsTrigger>
                        <TabsTrigger value="my">My Reservations</TabsTrigger>
                    </TabsList>
                </Tabs>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-4">
                    {reservations.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-white/5 rounded-xl border border-white/10">
                            No reservations found.
                        </div>
                    ) : (
                        reservations.map(res => (
                            <Card key={res.id} className="bg-white/5 border-white/10">
                                <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-white text-lg">{res.book.title}</span>
                                            <Badge variant="outline" className={getStatusColor(res.status)}>
                                                {res.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Reserved by <span className="text-white">{res.user.username}</span> on {format(new Date(res.requestDate), "PPP")}
                                        </p>
                                        {res.returnDate && (
                                            <p className="text-xs text-blue-400">Returned on {format(new Date(res.returnDate), "PPP")}</p>
                                        )}
                                    </div>

                                    {/* Action Buttons for Admin/Staff */}
                                    {isAdminOrStaff && activeTab === "all" && res.status !== "RETURNED" && res.status !== "REJECTED" && (
                                        <div className="flex gap-2">
                                            {res.status === "PENDING" && (
                                                <>
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(res.id, "APPROVED")}>
                                                        <CheckCircle className="w-4 h-4 mr-2" /> Approve
                                                    </Button>
                                                    <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(res.id, "REJECTED")}>
                                                        <XCircle className="w-4 h-4 mr-2" /> Reject
                                                    </Button>
                                                </>
                                            )}
                                            {res.status === "APPROVED" && (
                                                <Button size="sm" variant="secondary" onClick={() => handleStatusUpdate(res.id, "RETURNED")}>
                                                    <RotateCcw className="w-4 h-4 mr-2" /> Mark Returned
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
