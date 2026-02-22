"use client";

import { useState, useEffect } from "react";
import { BookCategory, getAllCategories, createCategory, deleteCategory } from "@/lib/library-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, Trash2, Tag } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function CategoriesPage() {
    const { toast } = useToast();
    const [categories, setCategories] = useState<BookCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState("");

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await getAllCategories();
            setCategories(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newCategoryName.trim()) return;
        try {
            await createCategory(newCategoryName);
            setNewCategoryName("");
            fetchCategories();
            toast({ title: "Success", description: "Category created" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to create category", variant: "destructive" });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this category?")) return;
        try {
            await deleteCategory(id);
            fetchCategories();
            toast({ title: "Success", description: "Category deleted" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete category", variant: "destructive" });
        }
    };

    return (
        <div className="p-8 space-y-8 min-h-screen bg-slate-950 text-slate-200">
            <div>
                <h1 className="text-3xl font-bold text-white">Book Categories</h1>
                <p className="text-muted-foreground mt-1">Manage library classification</p>
            </div>

            <div className="flex gap-4 items-end max-w-md">
                <div className="w-full space-y-2">
                    <label className="text-sm font-medium">New Category Name</label>
                    <Input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g. Science Fiction"
                        className="bg-black/20 border-white/10"
                    />
                </div>
                <Button onClick={handleCreate} className="mb-0.5">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categories.map(category => (
                        <Card key={category.id} className="bg-white/5 border-white/10 flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <Tag className="w-4 h-4 text-primary" />
                                <span className="font-medium text-white">{category.name}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(category.id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
