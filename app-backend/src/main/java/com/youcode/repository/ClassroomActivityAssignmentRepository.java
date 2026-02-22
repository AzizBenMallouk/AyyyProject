package com.youcode.repository;

import com.youcode.entity.ClassroomActivityAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClassroomActivityAssignmentRepository extends JpaRepository<ClassroomActivityAssignment, Long> {
    List<ClassroomActivityAssignment> findByClassroomActivityId(Long classroomActivityId);

    Optional<ClassroomActivityAssignment> findByClassroomActivityIdAndLearnerId(Long classroomActivityId,
            Long learnerId);
}
