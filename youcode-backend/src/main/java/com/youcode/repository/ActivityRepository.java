package com.youcode.repository;

import com.youcode.entity.ClassroomActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<ClassroomActivity, Long> {
    List<ClassroomActivity> findByClassroomId(Long classroomId);

    List<ClassroomActivity> findByClassroomIdOrderByDeadlineAsc(Long classroomId);

    List<ClassroomActivity> findByActiveTrue();
}
