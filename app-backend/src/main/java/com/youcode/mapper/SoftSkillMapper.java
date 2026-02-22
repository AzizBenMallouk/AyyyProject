package com.youcode.mapper;

import com.youcode.dto.SoftSkillDTO;
import com.youcode.entity.SoftSkill;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SoftSkillMapper {
    SoftSkillDTO toDto(SoftSkill softSkill);

    @Mapping(target = "evaluations", ignore = true)
    SoftSkill toEntity(SoftSkillDTO softSkillDTO);
}
