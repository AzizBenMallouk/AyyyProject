package com.youcode.controller;

import com.youcode.dto.ActivityCommentDTO;
import com.youcode.service.ActivityCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class ActivityCommentController {

    private final ActivityCommentService commentService;

    @PostMapping
    public ResponseEntity<ActivityCommentDTO> addComment(@RequestBody ActivityCommentDTO dto) {
        return ResponseEntity.ok(commentService.addComment(dto));
    }

    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<List<ActivityCommentDTO>> getCommentsByAssignment(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(commentService.getCommentsByAssignment(assignmentId));
    }
}
