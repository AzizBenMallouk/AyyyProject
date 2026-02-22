package com.youcode.service;

import com.youcode.dto.ActivityCommentDTO;
import com.youcode.entity.ActivityComment;
import com.youcode.entity.ClassroomActivityAssignment;
import com.youcode.entity.User;
import com.youcode.mapper.ActivityCommentMapper;
import com.youcode.repository.ActivityCommentRepository;
import com.youcode.repository.ClassroomActivityAssignmentRepository;
import com.youcode.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityCommentService {

    private final ActivityCommentRepository commentRepository;
    private final ClassroomActivityAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final ActivityCommentMapper commentMapper;

    @Transactional
    public ActivityCommentDTO addComment(ActivityCommentDTO dto) {
        ClassroomActivityAssignment assignment = assignmentRepository.findById(dto.getAssignmentId())
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        ActivityComment comment = commentMapper.toEntity(dto);
        comment.setAssignment(assignment);
        comment.setUser(user);

        ActivityComment saved = commentRepository.save(comment);
        return convertToDTO(saved);
    }

    public List<ActivityCommentDTO> getCommentsByAssignment(Long assignmentId) {
        return commentRepository.findByAssignmentIdOrderByCreatedAtAsc(assignmentId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ActivityCommentDTO convertToDTO(ActivityComment comment) {
        return commentMapper.toDto(comment);
    }
}
