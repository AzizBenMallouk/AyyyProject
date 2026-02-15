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
} from "lucide-react";
import { Button } from "@/components/ui/button";

const sidebarItems = [
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
        title: "My Classrooms",
        href: "/staff/classrooms",
        icon: Users,
        role: "staff",
    },
    {
        title: "Courses",
        href: "#",
        icon: BookOpen,
        role: "all",
    },
];

export function Sidebar() {
    const pathname = usePathname();

    const { user } = useAuth();

    const filteredItems = sidebarItems.filter((item) => {
        if (item.role === "all") return true;

        if (item.role === "admin") {
            return user?.roles.includes("ADMIN");
        }

        if (item.role === "staff") {
            return user?.roles.includes("ADMIN") || user?.roles.includes("TRAINER");
        }

        if (item.role === "student") {
            // Show student dashboard to learners, or also to staff if they want to see it (optional, but let's stick to separation for now)
            // Or maybe staff should see everything? For now, clean separation.
            return user?.roles.includes("LEARNER");
        }

        return false;
    });

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-background/50 backdrop-blur-xl">
            <div className="flex h-16 items-center px-6 border-b border-white/10">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                    <Code2 className="w-6 h-6" />
                    <span>YouCode</span>
                </Link>
            </div>

            <div className="flex flex-col h-[calc(100vh-64px)] justify-between py-6 px-4">
                <nav className="space-y-2">
                    {filteredItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                pathname === item.href
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                            )}
                        >
                            {pathname === item.href && (
                                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50" />
                            )}
                            <item.icon className="w-5 h-5 relative z-10" />
                            <span className="relative z-10">{item.title}</span>
                        </Link>
                    ))}
                </nav>

                <div className="space-y-4">
                    <div className="mx-4 p-4 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10">
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
            </div>
        </aside>
    );
}
