"use client";

import { motion } from "framer-motion";
import { Users, BookOpen, Activity, TrendingUp, MoreHorizontal, UserPlus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

// Mock Data
const stats = [
    {
        title: "Total Students",
        value: "2,850",
        change: "+180 this month",
        icon: Users,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
    },
    {
        title: "Active Courses",
        value: "24",
        change: "4 new this week",
        icon: BookOpen,
        color: "text-violet-500",
        bg: "bg-violet-500/10",
        border: "border-violet-500/20",
    },
    {
        title: "Engagement Rate",
        value: "84%",
        change: "+2.4% vs last week",
        icon: Activity,
        color: "text-pink-500",
        bg: "bg-pink-500/10",
        border: "border-pink-500/20",
    },
    {
        title: "Revenue",
        value: "$42.5k",
        change: "+12% vs last month",
        icon: TrendingUp,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
    },
];

const recentActivity = [
    {
        user: "Sarah Connor",
        action: "completed",
        target: "React Advanced Patterns",
        time: "2 mins ago",
        avatar: "SC",
    },
    {
        user: "John Wick",
        action: "enrolled in",
        target: "Python for Data Science",
        time: "15 mins ago",
        avatar: "JW",
    },
    {
        user: "Elena Fisher",
        action: "submitted",
        target: "UI Design Challenge",
        time: "1 hour ago",
        avatar: "EF",
    },
    {
        user: "Nathan Drake",
        action: "commented on",
        target: "Lecture 4: State Management",
        time: "3 hours ago",
        avatar: "ND",
    },
];

export default function StaffDashboard() {
    return (
        <div className="space-y-8">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className={`${stat.bg} ${stat.border}`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className={`text-sm font-medium ${stat.color}`}>
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{stat.value}</div>
                                <p className={`text-xs ${stat.color} opacity-80`}>{stat.change}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Area (Placeholder) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-white/10 bg-white/5 backdrop-blur-sm h-full">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-white">Student Activity Overview</CardTitle>
                            <CardDescription>Daily active users over past 30 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full flex items-end justify-between gap-2 pt-4">
                                {/* Simulated Bar Chart */}
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="w-full bg-gradient-to-t from-primary/50 to-secondary/50 rounded-t-sm hover:from-primary hover:to-secondary transition-colors"
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.random() * 60 + 20}%` }}
                                        transition={{ duration: 0.5, delay: i * 0.05 }}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Quick Actions & Recent Activity */}
                <div className="space-y-8">
                    {/* Quick Actions */}
                    <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-md font-semibold text-white">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button className="w-full justify-start gap-2 bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20">
                                <UserPlus className="h-4 w-4" />
                                Enroll New Student
                            </Button>
                            <Button className="w-full justify-start gap-2 bg-secondary/20 text-secondary hover:bg-secondary/30 border border-secondary/20">
                                <FileText className="h-4 w-4" />
                                Create Assignment
                            </Button>
                            <Button className="w-full justify-start gap-2 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white border border-white/10">
                                <Users className="h-4 w-4" />
                                Manage Groups
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-md font-semibold text-white">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {recentActivity.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                                                {item.avatar}
                                            </div>
                                            <div className="grid gap-1">
                                                <p className="text-xs font-medium text-white">
                                                    <span className="text-primary">{item.user}</span> {item.action}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                                    {item.target}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                                            {item.time}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
