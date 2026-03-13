package com.youcode.controller;

import com.youcode.dto.UserDTO;
import com.youcode.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/  ")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users", description = "Get paginated list of all users (Admin only)")
    public ResponseEntity<Page<UserDTO>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<UserDTO> updateUserStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Object> payload) {
        String status = (String) payload.get("status");
        String dateStr = (String) payload.get("date");
        String description = (String) payload.get("description");

        java.time.LocalDate date = dateStr != null ? java.time.LocalDate.parse(dateStr) : java.time.LocalDate.now();

        return ResponseEntity.ok(userService.updateUserStatus(id, status, date, description));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create user", description = "Create a new user (Admin only)")
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.createUser(userDTO));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Get user details by ID")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/username/{username}")
    @Operation(summary = "Get user by username", description = "Get user details by username")
    public ResponseEntity<UserDTO> getUserByUsername(@PathVariable String username) {
        return userService.getUserByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    @Operation(summary = "Search users", description = "Search users by name or email")
    public ResponseEntity<List<UserDTO>> searchUsers(@RequestParam String query) {
        return ResponseEntity.ok(userService.searchUsers(query));
    }

    @GetMapping("/role/{roleName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    @Operation(summary = "Get users by role", description = "Get all users with specific role")
    public ResponseEntity<List<UserDTO>> getUsersByRole(@PathVariable String roleName) {
        return ResponseEntity.ok(userService.getUsersByRole(roleName));
    }

    @GetMapping("/learners/filter")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'STAFF')")
    @Operation(summary = "Filter learners", description = "Get filtered list of learners")
    public ResponseEntity<Page<UserDTO>> getFilteredLearners(
            @RequestParam(required = false) Long gradeId,
            @RequestParam(required = false) Long promotionId,
            @RequestParam(required = false) Long campusId,
            @RequestParam(required = false) Long classroomId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String query,
            Pageable pageable) {
        return ResponseEntity
                .ok(userService.getFilteredLearners(gradeId, promotionId, campusId, classroomId, status, query,
                        pageable));

    }

    @GetMapping("/filter")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Filter users", description = "Get filtered list of users (Admin only)")
    public ResponseEntity<Page<UserDTO>> getFilteredUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Long gradeId,
            @RequestParam(required = false) Long promotionId,
            @RequestParam(required = false) Long campusId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String query,
            Pageable pageable) {
        return ResponseEntity
                .ok(userService.getFilteredUsers(role, gradeId, promotionId, campusId, status, query, pageable));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user", description = "Update user details")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long id,
            @RequestBody UserDTO userDTO) {
        try {
            UserDTO updated = userService.updateUser(id, userDTO);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user", description = "Delete user by ID (Admin only)")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get user statistics", description = "Get user count statistics by role")
    public ResponseEntity<Map<String, Object>> getUserStats() {
        return ResponseEntity.ok(Map.of(
                "total", userService.getTotalUserCount(),
                "admins", userService.getUserCountByRole("ADMIN"),
                "staff", userService.getUserCountByRole("STAFF"),
                "learners", userService.getUserCountByRole("LEARNER")));
    }
}
