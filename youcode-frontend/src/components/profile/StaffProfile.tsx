"use client";

import { motion } from "framer-motion";
import { Users, GraduationCap, Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function StaffProfile() {
    return (
        <div className="space-y-6 mt-4">

            {/* Current Active Classroom */}
            <h2 className="text-xl font-bold text-white">Current Classroom</h2>
            <Card className="bg-gradient-to-r from-violet-900/40 to-indigo-900/40 border-violet-500/30 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-32 bg-violet-500/10 blur-3xl rounded-full" />
                <CardContent className="p-8 relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="space-y-4">
                        <div>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30 mb-2 inline-block">
                                Active Cohort
                            </span>
                            <h3 className="text-3xl font-bold text-white mt-2">Fullstack JavaScript Bootcamp</h3>
                            <p className="text-violet-200">Cohort 2024 • Q1 Session</p>
                        </div>

                        <div className="flex gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-white/10">
                                    <Users className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-white">28</div>
                                    <div className="text-xs text-gray-400">Students</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-white/10">
                                    <Calendar className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-white">12</div>
                                    <div className="text-xs text-gray-400">Weeks Left</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button className="bg-white text-violet-900 hover:bg-gray-100 font-semibold shadow-lg shadow-white/10">
                            Manage Class
                        </Button>
                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm">
                            View Reports
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Classroom History */}
            <h2 className="text-xl font-bold text-white pt-4">Previous Classrooms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { name: "Python for Data Science", year: "2023 Q4", students: 32, rating: 4.8 },
                    { name: "UI/UX Design Fundamentals", year: "2023 Q3", students: 25, rating: 4.9 },
                    { name: "Intro to web Development", year: "2023 Q1", students: 40, rating: 4.7 },
                ].map((cls, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors group cursor-pointer h-full">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <Badge>{cls.year}</Badge>
                                    <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                                        ★ {cls.rating}
                                    </div>
                                </div>
                                <CardTitle className="text-white mt-2 group-hover:text-blue-400 transition-colors">
                                    {cls.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-end">
                                    <div className="text-sm text-gray-400 flex items-center gap-2">
                                        <Users className="h-4 w-4" /> {cls.students} Graduates
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-gray-300 border border-white/10">
            {children}
        </span>
    );
}
