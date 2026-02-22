package com.youcode.repository;

import com.youcode.entity.ClassroomActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface ClassroomActivityRepository
        extends JpaRepository<ClassroomActivity, Long>, JpaSpecificationExecutor<ClassroomActivity> {
    List<ClassroomActivity> findByClassroomId(Long classroomId);

    List<ClassroomActivity> findByClassroomIdOrderByDeadlineAsc(Long classroomId);

    List<ClassroomActivity> findByActiveTrue();

    org.springframework.data.domain.Page<ClassroomActivity> findByClassroomProgramId(Long programId,
            org.springframework.data.domain.Pageable pageable);
}
