package com.youcode.service;

import com.youcode.dto.GradeDTO;
import com.youcode.entity.Grade;
import com.youcode.repository.GradeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class GradeService {

    private final GradeRepository gradeRepository;

    public List<GradeDTO> getAllGrades() {
        return gradeRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public GradeDTO getGradeById(Long id) {
        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grade not found with id: " + id));
        return convertToDTO(grade);
    }

    public GradeDTO createGrade(GradeDTO gradeDTO) {
        Grade grade = new Grade();
        grade.setName(gradeDTO.getName());
        grade.setDescription(gradeDTO.getDescription());

        Grade saved = gradeRepository.save(grade);
        log.info("Created grade: {}", saved.getName());
        return convertToDTO(saved);
    }

    public GradeDTO updateGrade(Long id, GradeDTO gradeDTO) {
        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grade not found with id: " + id));

        if (gradeDTO.getName() != null)
            grade.setName(gradeDTO.getName());
        if (gradeDTO.getDescription() != null)
            grade.setDescription(gradeDTO.getDescription());

        Grade saved = gradeRepository.save(grade);
        log.info("Updated grade: {}", saved.getName());
        return convertToDTO(saved);
    }

    public void deleteGrade(Long id) {
        gradeRepository.deleteById(id);
        log.info("Deleted grade with id: {}", id);
    }

    private GradeDTO convertToDTO(Grade grade) {
        return GradeDTO.builder()
                .id(grade.getId())
                .name(grade.getName())
                .description(grade.getDescription())
                .build();
    }
}
