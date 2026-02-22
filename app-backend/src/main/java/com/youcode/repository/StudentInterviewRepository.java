package com.youcode.repository;

import com.youcode.entity.StudentInterview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentInterviewRepository extends JpaRepository<StudentInterview, Long> {
    List<StudentInterview> findByStudentId(Long studentId);

    List<StudentInterview> findByPositionId(Long positionId);
}
