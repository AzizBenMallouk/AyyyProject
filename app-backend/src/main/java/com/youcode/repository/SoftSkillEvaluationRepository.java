package com.youcode.repository;

import com.youcode.entity.SoftSkillEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SoftSkillEvaluationRepository extends JpaRepository<SoftSkillEvaluation, Long> {
    List<SoftSkillEvaluation> findByInterviewId(Long interviewId);
}
