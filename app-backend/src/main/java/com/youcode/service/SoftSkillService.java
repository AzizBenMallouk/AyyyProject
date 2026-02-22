package com.youcode.service;

import com.youcode.dto.SoftSkillDTO;
import com.youcode.entity.SoftSkill;
import com.youcode.mapper.SoftSkillMapper;
import com.youcode.repository.SoftSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SoftSkillService {

    private final SoftSkillRepository softSkillRepository;
    private final SoftSkillMapper softSkillMapper;

    public List<SoftSkillDTO> getAllSoftSkills() {
        return softSkillRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SoftSkillDTO createSoftSkill(SoftSkillDTO softSkillDTO) {
        if (softSkillRepository.findByName(softSkillDTO.getName()).isPresent()) {
            throw new RuntimeException("Soft skill already exists: " + softSkillDTO.getName());
        }

        SoftSkill softSkill = softSkillMapper.toEntity(softSkillDTO);
        return convertToDTO(softSkillRepository.save(softSkill));
    }

    public SoftSkillDTO updateSoftSkill(Long id, SoftSkillDTO softSkillDTO) {
        SoftSkill softSkill = softSkillRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Soft skill not found with id: " + id));

        softSkill.setName(softSkillDTO.getName());
        softSkill.setDescription(softSkillDTO.getDescription());

        return convertToDTO(softSkillRepository.save(softSkill));
    }

    public void deleteSoftSkill(Long id) {
        softSkillRepository.deleteById(id);
    }

    private SoftSkillDTO convertToDTO(SoftSkill softSkill) {
        return softSkillMapper.toDto(softSkill);
    }
}
