import { Bell, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/10 bg-background/50 backdrop-blur-xl px-6">
            <div className="flex items-center gap-4 w-1/3">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="pl-9 h-9 bg-white/5 border-white/10 focus:bg-white/10"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <ThemeToggle />
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-white">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive animate-pulse" />
                </Button>
                <Link href="/profile" className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-secondary p-[1px] block hover:scale-105 transition-transform">
                    <div className="h-full w-full rounded-full bg-background flex items-center justify-center text-xs font-bold">
                        JD
                    </div>
                </Link>
            </div>
        </header>
    );
}
