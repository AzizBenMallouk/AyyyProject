"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Code2,
    BookOpen,
    MapPin,
    Calendar,
    Award,
    GraduationCap,
    BrainCircuit,
    Briefcase,
    FileText,
    ChevronDown,
    Activity,
    Library
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

const sidebarGroups = [
    {
        title: "Dashboards",
        role: "all",
        items: [
            {
                title: "Student Dashboard",
                href: "/student",
                icon: LayoutDashboard,
                role: "student",
            },
            {
                title: "Staff Dashboard",
                href: "/staff",
                icon: LayoutDashboard,
                role: "staff",
            },
        ]
    },
    {
        title: "Administration",
        role: "admin",
        items: [
            {
                title: "User Management",
                href: "/admin/users",
                icon: Users,
                role: "admin",
            },
            {
                title: "Role Management",
                href: "/admin/roles",
                icon: Settings,
                role: "admin",
            },
            {
                title: "Campuses",
                href: "/admin/campuses",
                icon: MapPin,
                role: "admin",
            },
            {
                title: "Promotions",
                href: "/admin/promotions",
                icon: Calendar,
                role: "admin",
            },
            {
                title: "Grades",
                href: "/admin/grades",
                icon: Award,
                role: "admin",
            },
            {
                title: "Soft Skills",
                href: "/admin/soft-skills",
                icon: BrainCircuit,
                role: "admin",
            },
        ]
    },
    {
        title: "Academic",
        role: "staff",
        items: [
            {
                title: "My Classrooms",
                href: "/staff/classrooms",
                icon: Users,
                role: "staff",
            },
            {
                title: "Students",
                href: "/staff/students",
                icon: GraduationCap,
                role: "staff",
            },
            {
                title: "Programs",
                href: "/staff/programs",
                icon: BookOpen,
                role: "staff",
            },
        ]
    },
    {
        title: "Library",
        role: "all",
        icon: Library,
        items: [
            {
                title: "Books",
                href: "/library/books",
                icon: BookOpen,
                role: "all",
            },
            {
                title: "Reservations",
                href: "/library/reservations",
                icon: Calendar,
                role: "all",
            },
            {
                title: "Categories",
                href: "/library/categories",
                icon: FileText,
                role: "admin",
            },
        ]
    },
    {
        title: "Activities",
        role: "staff",
        icon: Activity,
        items: [
            {
                title: "Interviews",
                href: "/cme/interviews",
                icon: Briefcase,
                role: "staff",
            },
            {
                title: "Activities",
                href: "/admin/activities",
                icon: FileText,
                role: "staff",
            },
            {
                title: "Action Plans",
                href: "/staff/action-plans",
                icon: FileText,
                role: "staff",
            },
        ]
    }
];

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();

    // State to track open groups. Default open: Dashboards and any group containing active link.
    // For simplicity, let's keep all open or just open based on active link.
    // Let's implement independent open state for each group.

    // Helper to check if user has access to a role
    const hasAccess = (role: string) => {
        if (role === "all") return true;
        if (role === "admin") return user?.roles.includes("ADMIN");
        if (role === "staff") return user?.roles.includes("ADMIN") || user?.roles.includes("TRAINER");
        if (role === "student") return user?.roles.includes("LEARNER");
        return false;
    };

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-background/50 backdrop-blur-xl flex flex-col">
            <div className="flex h-16 items-center px-6 border-b border-white/10 shrink-0">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                    <Code2 className="w-6 h-6" />
                    <span>YouCode</span>
                </Link>
            </div>

            <ScrollArea className="flex-1 py-6 px-4">
                <nav className="space-y-4">
                    {sidebarGroups.map((group, index) => {
                        if (!hasAccess(group.role)) return null;

                        const filteredItems = group.items.filter(item => hasAccess(item.role));
                        if (filteredItems.length === 0) return null;

                        // Check if this group is active
                        const isActiveGroup = filteredItems.some(item => pathname === item.href);

                        return (
                            <Collapsible key={index} defaultOpen={isActiveGroup || group.title === "Dashboards"} className="group/collapsible">
                                <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-2 text-sm font-semibold text-muted-foreground hover:text-white transition-colors">
                                    <span className="flex items-center gap-2">
                                        {group.icon && <group.icon className="w-4 h-4" />}
                                        {group.title}
                                    </span>
                                    <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="pt-1 pb-2 space-y-1">
                                    {filteredItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden ml-2",
                                                pathname === item.href
                                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            {pathname === item.href && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50" />
                                            )}
                                            <item.icon className="w-4 h-4 relative z-10" />
                                            <span className="relative z-10">{item.title}</span>
                                        </Link>
                                    ))}
                                </CollapsibleContent>
                            </Collapsible>
                        );
                    })}
                </nav>
            </ScrollArea>

            <div className="p-4 border-t border-white/10 shrink-0 space-y-4 bg-background/50 backdrop-blur-xl">
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10">
                    <h4 className="text-sm font-semibold text-white mb-1">Pro Plan</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                        Upgrade for more features
                    </p>
                    <Button size="sm" variant="secondary" className="w-full text-xs">
                        Upgrade
                    </Button>
                </div>

                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    asChild
                >
                    <Link href="/login">
                        <LogOut className="w-5 h-5" />
                        <span>Log out</span>
                    </Link>
                </Button>
            </div>
        </aside>
    );
}
