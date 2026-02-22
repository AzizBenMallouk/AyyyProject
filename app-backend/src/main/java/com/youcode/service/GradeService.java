package com.youcode.service;

import com.youcode.dto.GradeDTO;
import com.youcode.entity.Grade;
import com.youcode.mapper.GradeMapper;
import com.youcode.repository.GradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class GradeService {

    private final GradeRepository gradeRepository;
    private final GradeMapper gradeMapper;

    public GradeDTO getGradeById(Long id) {
        return gradeRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Grade not found"));
    }

    public List<GradeDTO> getAllGrades() {
        return gradeRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public GradeDTO createGrade(GradeDTO gradeDTO) {
        Grade grade = gradeMapper.toEntity(gradeDTO);
        return convertToDTO(gradeRepository.save(grade));
    }

    public GradeDTO updateGrade(Long id, GradeDTO gradeDTO) {
        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grade not found"));
        grade.setName(gradeDTO.getName());
        return convertToDTO(gradeRepository.save(grade));
    }

    public void deleteGrade(Long id) {
        gradeRepository.deleteById(id);
    }

    private GradeDTO convertToDTO(Grade grade) {
        return gradeMapper.toDto(grade);
    }
}
