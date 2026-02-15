"use client";

import { motion } from "framer-motion";
import { Play, Clock, Award, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

// Mock Data
const courses = [
    {
        id: 1,
        title: "Fullstack JavaScript Bootcamp",
        progress: 75,
        nextLesson: "Advanced React Patterns",
        image: "bg-gradient-to-br from-violet-500 to-purple-500",
    },
    {
        id: 2,
        title: "UI/UX Design Masterclass",
        progress: 30,
        nextLesson: "Color Theory & Typography",
        image: "bg-gradient-to-br from-pink-500 to-rose-500",
    },
    {
        id: 3,
        title: "Python for Data Science",
        progress: 10,
        nextLesson: "Pandas & NumPy Basics",
        image: "bg-gradient-to-br from-blue-500 to-cyan-500",
    },
];

const deadlines = [
    {
        id: 1,
        task: "Submit React Project",
        date: "Today, 11:59 PM",
        course: "Fullstack JS",
        priority: "high",
    },
    {
        id: 2,
        task: "Complete UI Quiz",
        date: "Tomorrow, 10:00 AM",
        course: "UI/UX Design",
        priority: "medium",
    },
];

export default function StudentDashboard() {
    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        Welcome back, Alex! 👋
                    </h1>
                    <p className="text-muted-foreground">
                        You've completed <strong>12 lessons</strong> this week. Keep it up!
                    </p>
                </div>
                <Button className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/10">
                    <Award className="mr-2 h-4 w-4 text-yellow-500" />
                    View Certificate
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-violet-200">
                            Total XP
                        </CardTitle>
                        <Star className="h-4 w-4 text-violet-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">12,450</div>
                        <p className="text-xs text-violet-300/60">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-pink-200">
                            Courses in Progress
                        </CardTitle>
                        <Play className="h-4 w-4 text-pink-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">3</div>
                        <p className="text-xs text-pink-300/60">2 completing soon</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-200">
                            Learning Hours
                        </CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">45.2</div>
                        <p className="text-xs text-blue-300/60">+4.5h this week</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Continue Learning */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">Continue Learning</h2>
                        <Button variant="link" className="text-sm text-primary">
                            View All
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {courses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 transition-colors"
                            >
                                <div className="flex gap-4">
                                    <div className={`h-24 w-24 rounded-lg flex-shrink-0 ${course.image}`} />
                                    <div className="flex flex-col justify-between flex-1">
                                        <div>
                                            <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                                                {course.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Next: {course.nextLesson}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>{course.progress}% Complete</span>
                                                <span>12/16 Modules</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-black/20 overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
                                                    style={{ width: `${course.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Button size="icon" className="rounded-full h-10 w-10 bg-white/10 hover:bg-white/20">
                                            <Play className="h-4 w-4 fill-current" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Deadlines */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white">Upcoming Deadlines</h2>
                    <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                        <CardContent className="p-0">
                            <div className="divide-y divide-white/10">
                                {deadlines.map((deadline) => (
                                    <div key={deadline.id} className="p-4 hover:bg-white/5 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-medium text-sm text-white">{deadline.task}</h4>
                                            {deadline.priority === "high" && (
                                                <span className="bg-red-500/20 text-red-300 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                                                    High
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-2">{deadline.course}</p>
                                        <div className="flex items-center text-xs text-primary/80">
                                            <Clock className="mr-1 h-3 w-3" />
                                            {deadline.date}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 border-t border-white/10">
                            <Button variant="ghost" size="sm" className="w-full text-xs">
                                View Calendar
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
