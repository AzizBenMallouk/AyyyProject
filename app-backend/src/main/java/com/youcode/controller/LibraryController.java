package com.youcode.controller;

import com.youcode.entity.Book;
import com.youcode.entity.BookCategory;
import com.youcode.entity.Reservation;
import com.youcode.service.LibraryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/library")
@RequiredArgsConstructor
public class LibraryController {

    private final LibraryService libraryService;

    // --- Categories ---

    @GetMapping("/categories")
    public ResponseEntity<List<BookCategory>> getAllCategories() {
        return ResponseEntity.ok(libraryService.getAllCategories());
    }

    @PostMapping("/categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<BookCategory> createCategory(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(libraryService.createCategory(request.get("name")));
    }

    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        libraryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    // --- Books ---

    @GetMapping("/books")
    public ResponseEntity<Page<Book>> getBooks(Pageable pageable) {
        return ResponseEntity.ok(libraryService.getBooks(pageable));
    }

    @PostMapping("/books")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Book> createBook(@RequestBody Book book, @RequestParam Long categoryId) {
        return ResponseEntity.ok(libraryService.createBook(book, categoryId));
    }

    @PutMapping("/books/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book book,
            @RequestParam Long categoryId) {
        return ResponseEntity.ok(libraryService.updateBook(id, book, categoryId));
    }

    @DeleteMapping("/books/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        libraryService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }

    // --- Reservations ---

    @PostMapping("/reservations")
    public ResponseEntity<Reservation> createReservation(@RequestBody Map<String, Long> request) {
        return ResponseEntity.ok(libraryService.createReservation(request.get("bookId"), request.get("userId")));
    }

    @GetMapping("/reservations")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<Reservation>> getAllReservations() {
        return ResponseEntity.ok(libraryService.getReservations());
    }

    @GetMapping("/reservations/my")
    public ResponseEntity<List<Reservation>> getMyReservations(@RequestParam Long userId) {
        // In real app, get userId from SecurityContext
        return ResponseEntity.ok(libraryService.getUserReservations(userId));
    }

    @PutMapping("/reservations/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Reservation> updateReservationStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity
                .ok(libraryService.updateReservationStatus(id, Reservation.ReservationStatus.valueOf(status)));
    }
}
