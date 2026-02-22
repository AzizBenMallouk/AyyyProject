package com.youcode.controller;

import com.youcode.dto.InterviewPositionDTO;
import com.youcode.dto.SoftSkillEvaluationDTO;
import com.youcode.dto.StudentInterviewDTO;
import com.youcode.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    // --- Positions ---

    @GetMapping("/positions")
    public ResponseEntity<List<InterviewPositionDTO>> getAllPositions() {
        return ResponseEntity.ok(interviewService.getAllPositions());
    }

    @PostMapping("/positions")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAINER')")
    public ResponseEntity<InterviewPositionDTO> createPosition(@RequestBody InterviewPositionDTO dto) {
        return ResponseEntity.ok(interviewService.createPosition(dto));
    }

    @DeleteMapping("/positions/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAINER')")
    public ResponseEntity<Void> deletePosition(@PathVariable Long id) {
        interviewService.deletePosition(id);
        return ResponseEntity.noContent().build();
    }

    // --- Interviews ---

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<StudentInterviewDTO>> getStudentInterviews(@PathVariable Long studentId) {
        return ResponseEntity.ok(interviewService.getInterviewsByStudent(studentId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<StudentInterviewDTO>> getAllInterviews() {
        return ResponseEntity.ok(interviewService.getAllInterviews());
    }

    @PostMapping("/schedule")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAINER')")
    public ResponseEntity<StudentInterviewDTO> scheduleInterview(
            @RequestParam Long studentId,
            @RequestParam Long positionId,
            @RequestParam String date) { // Expect ISO string
        LocalDateTime interviewDate = LocalDateTime.parse(date);
        return ResponseEntity.ok(interviewService.createInterview(studentId, positionId, interviewDate));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAINER')")
    public ResponseEntity<StudentInterviewDTO> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(interviewService.updateInterviewStatus(id, status));
    }

    // --- Evaluations ---

    @PostMapping("/{id}/evaluate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAINER')")
    public ResponseEntity<Void> addEvaluation(@PathVariable Long id, @RequestBody SoftSkillEvaluationDTO dto) {
        interviewService.addEvaluation(id, dto);
        return ResponseEntity.ok().build();
    }
}
