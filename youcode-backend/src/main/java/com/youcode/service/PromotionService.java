package com.youcode.service;

import com.youcode.dto.PromotionDTO;
import com.youcode.entity.Promotion;
import com.youcode.repository.PromotionRepository;
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
public class PromotionService {

    private final PromotionRepository promotionRepository;

    public List<PromotionDTO> getAllPromotions() {
        return promotionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PromotionDTO getPromotionById(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found with id: " + id));
        return convertToDTO(promotion);
    }

    public PromotionDTO createPromotion(PromotionDTO promotionDTO) {
        Promotion promotion = new Promotion();
        promotion.setName(promotionDTO.getName());
        promotion.setDescription(promotionDTO.getDescription());
        promotion.setStartYear(promotionDTO.getStartYear());
        promotion.setEndYear(promotionDTO.getEndYear());

        Promotion saved = promotionRepository.save(promotion);
        log.info("Created promotion: {}", saved.getName());
        return convertToDTO(saved);
    }

    public PromotionDTO updatePromotion(Long id, PromotionDTO promotionDTO) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found with id: " + id));

        if (promotionDTO.getName() != null)
            promotion.setName(promotionDTO.getName());
        if (promotionDTO.getDescription() != null)
            promotion.setDescription(promotionDTO.getDescription());
        if (promotionDTO.getStartYear() != null)
            promotion.setStartYear(promotionDTO.getStartYear());
        if (promotionDTO.getEndYear() != null)
            promotion.setEndYear(promotionDTO.getEndYear());

        Promotion saved = promotionRepository.save(promotion);
        log.info("Updated promotion: {}", saved.getName());
        return convertToDTO(saved);
    }

    public void deletePromotion(Long id) {
        promotionRepository.deleteById(id);
        log.info("Deleted promotion with id: {}", id);
    }

    private PromotionDTO convertToDTO(Promotion promotion) {
        return PromotionDTO.builder()
                .id(promotion.getId())
                .name(promotion.getName())
                .description(promotion.getDescription())
                .startYear(promotion.getStartYear())
                .endYear(promotion.getEndYear())
                .build();
    }
}
