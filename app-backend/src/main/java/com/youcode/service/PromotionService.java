package com.youcode.service;

import com.youcode.dto.PromotionDTO;
import com.youcode.entity.Promotion;
import com.youcode.mapper.PromotionMapper;
import com.youcode.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final PromotionMapper promotionMapper;

    public PromotionDTO getPromotionById(Long id) {
        return promotionRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Promotion not found"));
    }

    public List<PromotionDTO> getAllPromotions() {
        return promotionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PromotionDTO createPromotion(PromotionDTO promotionDTO) {
        Promotion promotion = promotionMapper.toEntity(promotionDTO);
        return convertToDTO(promotionRepository.save(promotion));
    }

    public PromotionDTO updatePromotion(Long id, PromotionDTO promotionDTO) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found"));
        promotion.setName(promotionDTO.getName());
        return convertToDTO(promotionRepository.save(promotion));
    }

    public void deletePromotion(Long id) {
        promotionRepository.deleteById(id);
    }

    private PromotionDTO convertToDTO(Promotion promotion) {
        return promotionMapper.toDto(promotion);
    }
}
