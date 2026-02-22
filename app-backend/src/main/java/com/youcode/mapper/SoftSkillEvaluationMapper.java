package com.youcode.mapper;

import com.youcode.dto.SoftSkillEvaluationDTO;
import com.youcode.entity.SoftSkillEvaluation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SoftSkillEvaluationMapper {

    @Mapping(target = "interviewId", source = "interview.id")
    @Mapping(target = "softSkillId", source = "softSkill.id")
    @Mapping(target = "softSkillName", source = "softSkill.name")
    SoftSkillEvaluationDTO toDto(SoftSkillEvaluation evaluation);

    @Mapping(target = "interview", ignore = true)
    @Mapping(target = "softSkill", ignore = true)
    SoftSkillEvaluation toEntity(SoftSkillEvaluationDTO softSkillEvaluationDTO);
}
