package com.youcode.repository;

import com.youcode.entity.ClassroomActivityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClassroomActivityTypeRepository extends JpaRepository<ClassroomActivityType, Long> {
    Optional<ClassroomActivityType> findByName(String name);
}
