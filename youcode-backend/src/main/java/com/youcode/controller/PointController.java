package com.youcode.controller;

import com.youcode.dto.PointDTO;
import com.youcode.service.PointService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/points")
@RequiredArgsConstructor
@Tag(name = "Points Management", description = "APIs for managing points and leaderboard")
public class PointController {

    private final PointService pointService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    @Operation(summary = "Get all points", description = "Get all point records (Admin/Trainer only)")
    public ResponseEntity<List<PointDTO>> getAllPoints() {
        return ResponseEntity.ok(pointService.getAllPoints());
    }

    @GetMapping("/learner/{learnerId}")
    @Operation(summary = "Get points by learner", description = "Get all points for a learner")
    public ResponseEntity<List<PointDTO>> getPointsByLearner(@PathVariable Long learnerId) {
        return ResponseEntity.ok(pointService.getPointsByLearner(learnerId));
    }

    @GetMapping("/learner/{learnerId}/total")
    @Operation(summary = "Get total points", description = "Get total points for a learner")
    public ResponseEntity<Map<String, Integer>> getTotalPoints(@PathVariable Long learnerId) {
        Integer total = pointService.getTotalPoints(learnerId);
        return ResponseEntity.ok(Map.of("totalPoints", total));
    }

    @GetMapping("/leaderboard")
    @Operation(summary = "Get leaderboard", description = "Get top 10 scorers")
    public ResponseEntity<List<PointDTO>> getLeaderboard() {
        return ResponseEntity.ok(pointService.getLeaderboard());
    }
}
