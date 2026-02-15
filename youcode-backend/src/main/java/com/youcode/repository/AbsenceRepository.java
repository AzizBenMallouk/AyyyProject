package com.youcode.repository;

import com.youcode.entity.Absence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AbsenceRepository extends JpaRepository<Absence, Long> {
    List<Absence> findByClassroomId(Long classroomId);

    List<Absence> findByLearnerId(Long learnerId);

    List<Absence> findByClassroomIdAndLearnerId(Long classroomId, Long learnerId);
}
