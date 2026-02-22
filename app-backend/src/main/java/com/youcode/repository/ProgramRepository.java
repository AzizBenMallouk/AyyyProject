package com.youcode.repository;

import com.youcode.entity.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgramRepository extends JpaRepository<Program, Long> {
    List<Program> findBySpeciality(String speciality);

    java.util.Optional<Program> findByTitle(String title);
}
