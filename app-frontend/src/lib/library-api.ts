import { Classroom } from '@/types/classroom';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export interface BookCategory {
    id: number;
    name: string;
}

export interface Book {
    id: number;
    title: string;
    author: string;
    isbn?: string;
    synopsis?: string;
    coverImage?: string;
    categoryId?: number;
    category?: BookCategory;
    totalCopies: number;
    availableCopies: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Reservation {
    id: number;
    book: Book;
    user: {
        id: number;
        username: string; // or name/email
    };
    requestDate: string;
    returnDate?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}


// --- Categories ---

export const getAllCategories = async (): Promise<BookCategory[]> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/library/categories`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
};

export const createCategory = async (name: string): Promise<BookCategory> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/library/categories`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
};

export const deleteCategory = async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/library/categories/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete category');
};

// --- Books ---

export const getBooks = async (page = 0, size = 10): Promise<PageResponse<Book>> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/library/books?page=${page}&size=${size}`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch books');
    return response.json();
};

export const createBook = async (book: Partial<Book>, categoryId: number): Promise<Book> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/library/books?categoryId=${categoryId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(book),
    });
    if (!response.ok) throw new Error('Failed to create book');
    return response.json();
};

export const updateBook = async (id: number, book: Partial<Book>, categoryId: number): Promise<Book> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/library/books/${id}?categoryId=${categoryId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(book),
    });
    if (!response.ok) throw new Error('Failed to update book');
    return response.json();
};

export const deleteBook = async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/library/books/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete book');
};

// --- Reservations ---

export const createReservation = async (bookId: number, userId: number): Promise<Reservation> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/library/reservations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ bookId, userId }),
    });
    if (!response.ok) throw new Error('Failed to reserve book');
    return response.json();
};

export const getAllReservations = async (): Promise<Reservation[]> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/library/reservations`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch reservations');
    return response.json();
};

export const getMyReservations = async (userId: number): Promise<Reservation[]> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/library/reservations/my?userId=${userId}`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch my reservations');
    return response.json();
};

export const updateReservationStatus = async (id: number, status: string): Promise<Reservation> => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/library/reservations/${id}/status?status=${status}`, {
        method: 'PUT',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to update reservation status');
    return response.json();
};
