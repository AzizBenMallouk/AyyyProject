"use client";

import { useState, useEffect } from "react";
import { Book, getBooks, createBook, getAllCategories, BookCategory, createReservation, deleteBook } from "@/lib/library-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, BookOpen, Plus, Trash2, CalendarCheck, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export default function BooksPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<BookCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Create Book State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newBook, setNewBook] = useState<Partial<Book>>({
        title: "",
        author: "",
        totalCopies: 1,
        availableCopies: 1,
        synopsis: "",
        coverImage: ""
    });
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

    useEffect(() => {
        fetchData();
        fetchCategories();
    }, [page]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getBooks(page, 20);
            setBooks(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await getAllCategories();
            setCategories(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateBook = async () => {
        if (!newBook.title || !newBook.author || !selectedCategoryId) {
            toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
            return;
        }
        try {
            await createBook(newBook, parseInt(selectedCategoryId));
            toast({ title: "Success", description: "Book added successfully" });
            setIsCreateOpen(false);
            fetchData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to add book", variant: "destructive" });
        }
    };

    const handleDeleteBook = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteBook(id);
            toast({ title: "Success", description: "Book deleted" });
            fetchData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete book", variant: "destructive" });
        }
    }

    const handleReserve = async (bookId: number) => {
        if (!user) return;
        try {
            await createReservation(bookId, user.id);
            toast({ title: "Success", description: "Reservation request sent" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to reserve book", variant: "destructive" });
        }
    };

    const isAdminOrStaff = user?.roles.includes("ADMIN") || user?.roles.includes("TRAINER");

    return (
        <div className="p-8 space-y-8 min-h-screen bg-slate-950 text-slate-200">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Library Books</h1>
                    <p className="text-muted-foreground mt-1">Browse and manage library collection</p>
                </div>
                {isAdminOrStaff && (
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90 text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Book
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-white/10 text-white">
                            <DialogHeader>
                                <DialogTitle>Add New Book</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Title</label>
                                    <Input
                                        value={newBook.title}
                                        onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                                        className="bg-black/20 border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Author</label>
                                    <Input
                                        value={newBook.author}
                                        onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                                        className="bg-black/20 border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                                        <SelectTrigger className="bg-black/20 border-white/10">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                                            {categories.map(c => (
                                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Total Copies</label>
                                        <Input
                                            type="number"
                                            value={newBook.totalCopies}
                                            onChange={(e) => setNewBook({ ...newBook, totalCopies: parseInt(e.target.value), availableCopies: parseInt(e.target.value) })}
                                            className="bg-black/20 border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Available Copies</label>
                                        <Input
                                            type="number"
                                            value={newBook.availableCopies}
                                            onChange={(e) => setNewBook({ ...newBook, availableCopies: parseInt(e.target.value) })}
                                            className="bg-black/20 border-white/10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Synopsis</label>
                                    <Input
                                        value={newBook.synopsis}
                                        onChange={(e) => setNewBook({ ...newBook, synopsis: e.target.value })}
                                        className="bg-black/20 border-white/10"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateBook}>Save Book</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {books.map(book => (
                        <Card key={book.id} className="bg-white/5 border-white/10 hover:border-primary/30 transition-all flex flex-col justify-between">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mb-2">
                                        {book.category?.name || "General"}
                                    </Badge>
                                    {isAdminOrStaff && (
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteBook(book.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                                <CardTitle className="text-lg line-clamp-1">{book.title}</CardTitle>
                                <CardDescription className="line-clamp-1">by {book.author}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                    {book.synopsis || "No synopsis available."}
                                </p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-white/5 pt-3">
                                    <span>Available: {book.availableCopies} / {book.totalCopies}</span>
                                    <span>{book.isbn}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={book.availableCopies > 0 ? "default" : "secondary"}
                                    disabled={book.availableCopies <= 0}
                                    onClick={() => handleReserve(book.id)}
                                >
                                    {book.availableCopies > 0 ? (
                                        <>
                                            <CalendarCheck className="w-4 h-4 mr-2" />
                                            Reserve
                                        </>
                                    ) : "Out of Stock"}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
