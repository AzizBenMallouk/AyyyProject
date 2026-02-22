package com.youcode.service;

import com.youcode.dto.CampusDTO;
import com.youcode.entity.Campus;
import com.youcode.mapper.CampusMapper;
import com.youcode.repository.CampusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CampusService {

    private final CampusRepository campusRepository;
    private final CampusMapper campusMapper;

    public CampusDTO getCampusById(Long id) {
        return campusRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Campus not found"));
    }

    public List<CampusDTO> getAllCampuses() {
        return campusRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CampusDTO createCampus(CampusDTO campusDTO) {
        Campus campus = campusMapper.toEntity(campusDTO);
        return convertToDTO(campusRepository.save(campus));
    }

    public CampusDTO updateCampus(Long id, CampusDTO campusDTO) {
        Campus campus = campusRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campus not found"));
        campus.setName(campusDTO.getName());
        return convertToDTO(campusRepository.save(campus));
    }

    public void deleteCampus(Long id) {
        campusRepository.deleteById(id);
    }

    private CampusDTO convertToDTO(Campus campus) {
        return campusMapper.toDto(campus);
    }
}
