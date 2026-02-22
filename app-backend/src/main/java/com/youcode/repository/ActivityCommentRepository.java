package com.youcode.repository;

import com.youcode.entity.ActivityComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ActivityCommentRepository extends JpaRepository<ActivityComment, Long> {
    List<ActivityComment> findByAssignmentIdOrderByCreatedAtAsc(Long assignmentId);
}
