package com.youcode.repository;

import com.youcode.entity.Enroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollRepository extends JpaRepository<Enroll, Long> {
    List<Enroll> findByClassroomId(Long classroomId);

    List<Enroll> findByLearnerId(Long learnerId);

    Optional<Enroll> findByClassroomIdAndLearnerId(Long classroomId, Long learnerId);

    int countByClassroomId(Long classroomId);
}
