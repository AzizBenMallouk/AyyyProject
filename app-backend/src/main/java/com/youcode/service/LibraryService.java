package com.youcode.service;

import com.youcode.entity.*;
import com.youcode.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LibraryService {

    private final BookRepository bookRepository;
    private final BookCategoryRepository categoryRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    // --- Categories ---

    public List<BookCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    public BookCategory createCategory(String name) {
        return categoryRepository.save(BookCategory.builder().name(name).build());
    }

    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    // --- Books ---

    public Page<Book> getBooks(Pageable pageable) {
        return bookRepository.findAll(pageable);
    }

    public Book createBook(Book book, Long categoryId) {
        BookCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        book.setCategory(category);
        return bookRepository.save(book);
    }

    public Book updateBook(Long id, Book bookDetails, Long categoryId) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        book.setTitle(bookDetails.getTitle());
        book.setAuthor(bookDetails.getAuthor());
        book.setIsbn(bookDetails.getIsbn());
        book.setSynopsis(bookDetails.getSynopsis());
        book.setCoverImage(bookDetails.getCoverImage());
        book.setTotalCopies(bookDetails.getTotalCopies());
        book.setAvailableCopies(bookDetails.getAvailableCopies()); // Maybe calculate diff? simplified for now.

        if (categoryId != null) {
            BookCategory category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            book.setCategory(category);
        }

        return bookRepository.save(book);
    }

    public void deleteBook(Long id) {
        bookRepository.deleteById(id);
    }

    // --- Reservations ---

    public Reservation createReservation(Long bookId, Long userId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("Book is not available");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Reservation reservation = Reservation.builder()
                .book(book)
                .user(user)
                .requestDate(LocalDateTime.now())
                .status(Reservation.ReservationStatus.PENDING)
                .build();

        // Decrement copies? Only on approval usually. But to reserve "slot", maybe now?
        // Let's decrement on Approval for simplicity OR decrement on PENDING if we want
        // to hold it.
        // Rule: PENDING means requested. APPROVED means came to pick it up or it is set
        // aside.
        // Let's decrement on APPROVED.

        return reservationRepository.save(reservation);
    }

    public Reservation updateReservationStatus(Long id, Reservation.ReservationStatus status) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (reservation.getStatus() == status)
            return reservation;

        // Transitions
        if (status == Reservation.ReservationStatus.APPROVED
                && reservation.getStatus() == Reservation.ReservationStatus.PENDING) {
            // Check availability
            Book book = reservation.getBook();
            if (book.getAvailableCopies() <= 0) {
                throw new RuntimeException("Book is no longer available");
            }
            book.setAvailableCopies(book.getAvailableCopies() - 1);
            bookRepository.save(book);
        } else if (status == Reservation.ReservationStatus.RETURNED
                && reservation.getStatus() == Reservation.ReservationStatus.APPROVED) {
            Book book = reservation.getBook();
            book.setAvailableCopies(book.getAvailableCopies() + 1);
            bookRepository.save(book);
            reservation.setReturnDate(LocalDateTime.now());
        }

        reservation.setStatus(status);
        return reservationRepository.save(reservation);
    }

    public List<Reservation> getReservations() {
        return reservationRepository.findAll();
    }

    public List<Reservation> getUserReservations(Long userId) {
        return reservationRepository.findByUserId(userId);
    }
}
