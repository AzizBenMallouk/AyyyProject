"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from "framer-motion";
import { Code2, Loader2, Lock, User } from "lucide-react";
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api';


export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await login({ username, password });
        } catch (err: any) {
            setError(err.message || 'Invalid credentials. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-6 relative z-10"
            >
                {/* Logo & Header */}
                <div className="text-center mb-8 space-y-2">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary mb-4 shadow-lg shadow-primary/25"
                    >
                        <Code2 className="h-6 w-6 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Welcome back
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        API URL: {API_URL}
                    </p>
                    <p className="text-muted-foreground text-sm">
                        Enter your credentials to access your workspace
                    </p>
                </div>

                {/* Login Card */}
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-xs font-medium uppercase tracking-wider text-muted-foreground ml-1">
                                Username
                            </Label>
                            <div className="relative group">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="pl-10 bg-black/20 border-white/10 focus:border-primary/50 focus:ring-primary/20 text-white placeholder:text-muted-foreground/50 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Password
                                </Label>
                                <Link
                                    href="#"
                                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 bg-black/20 border-white/10 focus:border-primary/50 focus:ring-primary/20 text-white placeholder:text-muted-foreground/50 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2"
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium shadow-lg shadow-primary/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                            disabled={isSubmitting || isLoading}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-xs text-muted-foreground">
                    Don't have an account?{" "}
                    <Link href="#" className="text-primary hover:underline underline-offset-4">
                        Contact Administration
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
