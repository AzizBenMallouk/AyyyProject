package com.youcode.mapper;

import com.youcode.dto.InterviewPositionDTO;
import com.youcode.entity.InterviewPosition;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InterviewPositionMapper {
    InterviewPositionDTO toDto(InterviewPosition position);

    @Mapping(target = "interviews", ignore = true)
    InterviewPosition toEntity(InterviewPositionDTO dto);
}
