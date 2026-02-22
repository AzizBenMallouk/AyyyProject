package com.youcode.controller;

import com.youcode.dto.SquadDTO;
import com.youcode.service.SquadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/squads")
@RequiredArgsConstructor
public class SquadController {

    private final SquadService squadService;

    @PostMapping
    public ResponseEntity<SquadDTO> createSquad(@RequestBody SquadDTO squadDTO) {
        return ResponseEntity.ok(squadService.createSquad(squadDTO));
    }

    @GetMapping("/classroom/{classroomId}")
    public ResponseEntity<List<SquadDTO>> getSquadsByClassroom(
            @PathVariable Long classroomId,
            @RequestParam(required = false) Long sprintId) {
        return ResponseEntity.ok(squadService.getSquadsByClassroom(classroomId, sprintId));
    }

    @PostMapping("/generate")
    public ResponseEntity<List<SquadDTO>> generateSquads(
            @RequestParam Long classroomId,
            @RequestParam Long sprintId,
            @RequestParam(defaultValue = "4") int count,
            @RequestParam(defaultValue = "true") boolean maximizeNewConnections,
            @RequestParam(defaultValue = "true") boolean distributeGender,
            @RequestParam(defaultValue = "true") boolean rotateScrumMaster) {
        return ResponseEntity.ok(squadService.generateSquads(classroomId, sprintId, count, maximizeNewConnections,
                distributeGender, rotateScrumMaster));
    }

    @PostMapping("/{squadId}/assign/{learnerId}")
    public ResponseEntity<Void> assignLearnerToSquad(@PathVariable Long squadId, @PathVariable Long learnerId) {
        squadService.assignLearnerToSquad(squadId, learnerId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/classroom/{classroomId}/learner/{learnerId}")
    public ResponseEntity<Void> removeLearnerFromSquad(@PathVariable Long classroomId, @PathVariable Long learnerId) {
        squadService.removeLearnerFromSquad(learnerId, classroomId);
        return ResponseEntity.ok().build();
    }
}
