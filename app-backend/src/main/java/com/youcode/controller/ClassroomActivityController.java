package com.youcode.controller;

import com.youcode.dto.ClassroomActivityDTO;
import com.youcode.service.ClassroomActivityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classroom-activities")
@RequiredArgsConstructor
@Tag(name = "Classroom Activity Management", description = "APIs for managing classroom activities and assignments")
public class ClassroomActivityController {

    private final ClassroomActivityService activityService;

    @GetMapping
    @Operation(summary = "Get all activities", description = "Get list of all activities")
    public ResponseEntity<List<ClassroomActivityDTO>> getAllActivities() {
        return ResponseEntity.ok(activityService.getAllActivities());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get activity by ID", description = "Get activity details by ID")
    public ResponseEntity<ClassroomActivityDTO> getActivityById(@PathVariable Long id) {
        return activityService.getActivityById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/classroom/{classroomId}")
    @Operation(summary = "Get activities by classroom", description = "Get all activities for a classroom")
    public ResponseEntity<List<ClassroomActivityDTO>> getActivitiesByClassroom(@PathVariable Long classroomId) {
        return ResponseEntity.ok(activityService.getActivitiesByClassroom(classroomId));
    }

    @GetMapping("/action-plans")
    @Operation(summary = "Get action plans with filters", description = "Get list of action plans with filters")
    public ResponseEntity<org.springframework.data.domain.Page<ClassroomActivityDTO>> getActionPlans(
            @org.springdoc.core.annotations.ParameterObject org.springframework.data.domain.Pageable pageable,
            @org.springdoc.core.annotations.ParameterObject com.youcode.dto.ActivityFilterDTO filters) {
        return ResponseEntity.ok(activityService.getActionPlans(pageable, filters));
    }

    @GetMapping("/program/{programId}")
    @Operation(summary = "Get activities by program", description = "Get activities for a program with pagination")
    public ResponseEntity<org.springframework.data.domain.Page<ClassroomActivityDTO>> getActivitiesByProgram(
            @PathVariable Long programId,
            @org.springdoc.core.annotations.ParameterObject org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(activityService.getActivitiesByProgram(programId, pageable));
    }

    @GetMapping("/types")
    @Operation(summary = "Get activity types", description = "Get all activity types")
    public ResponseEntity<List<com.youcode.entity.ClassroomActivityType>> getActivityTypes() {
        return ResponseEntity.ok(activityService.getAllActivityTypes());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    @Operation(summary = "Create activity", description = "Create a new activity (Admin/Trainer only)")
    public ResponseEntity<ClassroomActivityDTO> createActivity(@RequestBody ClassroomActivityDTO activityDTO) {
        ClassroomActivityDTO created = activityService.createActivity(activityDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    @Operation(summary = "Update activity", description = "Update activity details (Admin/Trainer only)")
    public ResponseEntity<ClassroomActivityDTO> updateActivity(
            @PathVariable Long id,
            @RequestBody ClassroomActivityDTO activityDTO) {
        try {
            ClassroomActivityDTO updated = activityService.updateActivity(id, activityDTO);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    @Operation(summary = "Delete activity", description = "Delete activity by ID (Admin/Trainer only)")
    public ResponseEntity<Void> deleteActivity(@PathVariable Long id) {
        try {
            activityService.deleteActivity(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
