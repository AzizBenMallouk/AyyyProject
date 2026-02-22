package com.youcode.repository;

import com.youcode.entity.Squad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SquadRepository extends JpaRepository<Squad, Long> {
    List<Squad> findByClassroomId(Long classroomId);

    List<Squad> findByClassroomIdAndSprintId(Long classroomId, Long sprintId);

    List<Squad> findByClassroomIdAndSprintIdIsNull(Long classroomId);
}
