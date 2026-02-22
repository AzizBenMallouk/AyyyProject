package com.youcode.repository;

import com.youcode.entity.SoftSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SoftSkillRepository extends JpaRepository<SoftSkill, Long> {
    Optional<SoftSkill> findByName(String name);
}
