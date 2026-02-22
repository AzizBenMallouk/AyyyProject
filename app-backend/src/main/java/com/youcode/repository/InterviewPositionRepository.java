package com.youcode.repository;

import com.youcode.entity.InterviewPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InterviewPositionRepository extends JpaRepository<InterviewPosition, Long> {
}
