package com.youcode.repository;

import com.youcode.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByActivityTypeId(Long typeId);

    List<Activity> findByDifficultyLevel(String difficultyLevel);
}
