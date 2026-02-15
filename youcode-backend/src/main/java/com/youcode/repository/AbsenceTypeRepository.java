package com.youcode.repository;

import com.youcode.entity.AbsenceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AbsenceTypeRepository extends JpaRepository<AbsenceType, Long> {
    Optional<AbsenceType> findByName(String name);
}
