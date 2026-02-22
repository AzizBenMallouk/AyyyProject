package com.youcode.controller;

import com.youcode.dto.AbsenceDTO;
import com.youcode.entity.AbsenceType;
import com.youcode.service.AbsenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/absences")
@RequiredArgsConstructor
@Tag(name = "Absence Management", description = "APIs for managing student absences")
public class AbsenceController {

    private final AbsenceService absenceService;

    @GetMapping("/types")
    @Operation(summary = "Get absence types", description = "Get all absence types")
    public ResponseEntity<List<AbsenceType>> getAbsenceTypes() {
        return ResponseEntity.ok(absenceService.getAllAbsenceTypes());
    }

    @GetMapping("/classroom/{classroomId}")
    @Operation(summary = "Get absences by classroom", description = "Get all absences for a specific classroom")
    public ResponseEntity<List<AbsenceDTO>> getAbsencesByClassroom(@PathVariable Long classroomId) {
        return ResponseEntity.ok(absenceService.getAbsencesByClassroom(classroomId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'CME')")
    @Operation(summary = "Create absence", description = "Record a new absence (Admin/Trainer/CME)")
    public ResponseEntity<AbsenceDTO> createAbsence(@RequestBody AbsenceDTO absenceDTO) {
        AbsenceDTO created = absenceService.createAbsence(absenceDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
