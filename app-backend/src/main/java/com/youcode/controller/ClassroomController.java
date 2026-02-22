package com.youcode.controller;

import com.youcode.dto.ClassroomDTO;
import com.youcode.dto.EnrollDTO;
import com.youcode.service.ClassroomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classrooms")
@RequiredArgsConstructor
@Tag(name = "Classroom Management", description = "APIs for managing classrooms and enrollments")
public class ClassroomController {

    private final ClassroomService classroomService;

    @GetMapping
    @Operation(summary = "Get all classrooms", description = "Get list of all classrooms with optional filters")
    public ResponseEntity<org.springframework.data.domain.Page<ClassroomDTO>> getAllClassrooms(
            @RequestParam(required = false) Long campusId,
            @RequestParam(required = false) Long promotionId,
            @RequestParam(required = false) Long gradeId,
            @RequestParam(required = false) String speciality,
            @RequestParam(required = false) Long trainerId,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String search,
            org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(
                classroomService.getFilteredClassrooms(campusId, promotionId, gradeId, speciality, trainerId, active,
                        search,
                        pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get classroom by ID", description = "Get classroom details by ID")
    public ResponseEntity<ClassroomDTO> getClassroomById(@PathVariable Long id) {
        return classroomService.getClassroomById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'STAFF')")
    @Operation(summary = "Create classroom", description = "Create a new classroom (Admin/Trainer/Staff only)")
    public ResponseEntity<ClassroomDTO> createClassroom(@RequestBody ClassroomDTO classroomDTO) {
        ClassroomDTO created = classroomService.createClassroom(classroomDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'STAFF')")
    @Operation(summary = "Update classroom", description = "Update classroom details (Admin/Trainer/Staff only)")
    public ResponseEntity<ClassroomDTO> updateClassroom(
            @PathVariable Long id,
            @RequestBody ClassroomDTO classroomDTO) {
        try {
            ClassroomDTO updated = classroomService.updateClassroom(id, classroomDTO);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'STAFF')")
    @Operation(summary = "Delete classroom", description = "Delete classroom by ID (Admin/Trainer/Staff only)")
    public ResponseEntity<Void> deleteClassroom(@PathVariable Long id) {
        try {
            classroomService.deleteClassroom(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/enroll")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'STAFF')")
    @Operation(summary = "Enroll learner", description = "Enroll a learner in classroom (Admin/Trainer/Staff only)")
    public ResponseEntity<?> enrollLearner(
            @PathVariable Long id,
            @RequestBody Map<String, Long> request) {
        try {
            Long learnerId = request.get("learnerId");
            EnrollDTO enroll = classroomService.enrollLearner(id, learnerId);
            return ResponseEntity.status(HttpStatus.CREATED).body(enroll);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{classroomId}/enroll/{learnerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'STAFF')")
    @Operation(summary = "Remove learner", description = "Remove learner from classroom (Admin/Trainer/Staff only)")
    public ResponseEntity<Void> removeLearner(
            @PathVariable Long classroomId,
            @PathVariable Long learnerId) {
        try {
            classroomService.removeLearner(classroomId, learnerId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/learners")
    @Operation(summary = "Get enrolled learners", description = "Get all learners enrolled in classroom")
    public ResponseEntity<List<EnrollDTO>> getEnrolledLearners(@PathVariable Long id) {
        return ResponseEntity.ok(classroomService.getEnrolledLearners(id));
    }

    @GetMapping("/trainer/{trainerId}")
    @Operation(summary = "Get classrooms by trainer", description = "Get all classrooms assigned to a trainer (staff member)")
    public ResponseEntity<List<ClassroomDTO>> getClassroomsByTrainer(@PathVariable Long trainerId) {
        return ResponseEntity.ok(classroomService.getClassroomsByTrainer(trainerId));
    }
}
