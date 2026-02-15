package com.youcode.controller;

import com.youcode.dto.ActivityDTO;
import com.youcode.service.ActivityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
@Tag(name = "Activity Management", description = "APIs for managing activities and assignments")
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping
    @Operation(summary = "Get all activities", description = "Get list of all activities")
    public ResponseEntity<List<ActivityDTO>> getAllActivities() {
        return ResponseEntity.ok(activityService.getAllActivities());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get activity by ID", description = "Get activity details by ID")
    public ResponseEntity<ActivityDTO> getActivityById(@PathVariable Long id) {
        return activityService.getActivityById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/classroom/{classroomId}")
    @Operation(summary = "Get activities by classroom", description = "Get all activities for a classroom")
    public ResponseEntity<List<ActivityDTO>> getActivitiesByClassroom(@PathVariable Long classroomId) {
        return ResponseEntity.ok(activityService.getActivitiesByClassroom(classroomId));
    }

    @GetMapping("/types")
    @Operation(summary = "Get activity types", description = "Get all activity types")
    public ResponseEntity<List<com.youcode.entity.ClassroomActivityType>> getActivityTypes() {
        return ResponseEntity.ok(activityService.getAllActivityTypes());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    @Operation(summary = "Create activity", description = "Create a new activity (Admin/Trainer only)")
    public ResponseEntity<ActivityDTO> createActivity(@RequestBody ActivityDTO activityDTO) {
        ActivityDTO created = activityService.createActivity(activityDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    @Operation(summary = "Update activity", description = "Update activity details (Admin/Trainer only)")
    public ResponseEntity<ActivityDTO> updateActivity(
            @PathVariable Long id,
            @RequestBody ActivityDTO activityDTO) {
        try {
            ActivityDTO updated = activityService.updateActivity(id, activityDTO);
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
