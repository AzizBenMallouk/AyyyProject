package com.youcode.mapper;

import com.youcode.dto.PromotionDTO;
import com.youcode.entity.Promotion;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PromotionMapper {
    PromotionDTO toDto(Promotion promotion);

    Promotion toEntity(PromotionDTO promotionDTO);
}
