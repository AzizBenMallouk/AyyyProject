package com.youcode.service;

import com.youcode.dto.CampusDTO;
import com.youcode.entity.Campus;
import com.youcode.entity.City;
import com.youcode.repository.CampusRepository;
import com.youcode.repository.CityRepository;
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
public class CampusService {

    private final CampusRepository campusRepository;
    private final CityRepository cityRepository;

    public List<CampusDTO> getAllCampuses() {
        return campusRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CampusDTO getCampusById(Long id) {
        Campus campus = campusRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campus not found with id: " + id));
        return convertToDTO(campus);
    }

    public CampusDTO createCampus(CampusDTO campusDTO) {
        Campus campus = new Campus();
        campus.setName(campusDTO.getName());
        campus.setAddress(campusDTO.getAddress());

        if (campusDTO.getCityId() != null) {
            City city = cityRepository.findById(campusDTO.getCityId())
                    .orElseThrow(() -> new RuntimeException("City not found with id: " + campusDTO.getCityId()));
            campus.setCity(city);
        }

        Campus saved = campusRepository.save(campus);
        log.info("Created campus: {}", saved.getName());
        return convertToDTO(saved);
    }

    public CampusDTO updateCampus(Long id, CampusDTO campusDTO) {
        Campus campus = campusRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campus not found with id: " + id));

        if (campusDTO.getName() != null)
            campus.setName(campusDTO.getName());
        if (campusDTO.getAddress() != null)
            campus.setAddress(campusDTO.getAddress());

        if (campusDTO.getCityId() != null) {
            City city = cityRepository.findById(campusDTO.getCityId())
                    .orElseThrow(() -> new RuntimeException("City not found with id: " + campusDTO.getCityId()));
            campus.setCity(city);
        }

        Campus saved = campusRepository.save(campus);
        log.info("Updated campus: {}", saved.getName());
        return convertToDTO(saved);
    }

    public void deleteCampus(Long id) {
        campusRepository.deleteById(id);
        log.info("Deleted campus with id: {}", id);
    }

    private CampusDTO convertToDTO(Campus campus) {
        return CampusDTO.builder()
                .id(campus.getId())
                .name(campus.getName())
                .address(campus.getAddress())
                .cityId(campus.getCity() != null ? campus.getCity().getId() : null)
                .cityName(campus.getCity() != null ? campus.getCity().getName() : null)
                .build();
    }
}
