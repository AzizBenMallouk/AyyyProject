package com.youcode.controller;

import com.youcode.dto.SprintDTO;
import com.youcode.service.SprintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sprints")
@RequiredArgsConstructor
public class SprintController {

    private final SprintService sprintService;

    @PostMapping
    public ResponseEntity<SprintDTO> createSprint(@RequestBody SprintDTO dto) {
        return ResponseEntity.ok(sprintService.createSprint(dto));
    }

    @GetMapping("/program/{programId}")
    public ResponseEntity<List<SprintDTO>> getSprintsByProgram(@PathVariable Long programId) {
        return ResponseEntity.ok(sprintService.getSprintsByProgram(programId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SprintDTO> updateSprint(@PathVariable Long id, @RequestBody SprintDTO dto) {
        return ResponseEntity.ok(sprintService.updateSprint(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSprint(@PathVariable Long id) {
        sprintService.deleteSprint(id);
        return ResponseEntity.ok().build();
    }
}
