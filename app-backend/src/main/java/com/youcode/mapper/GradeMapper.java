package com.youcode.mapper;

import com.youcode.dto.GradeDTO;
import com.youcode.entity.Grade;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface GradeMapper {
    GradeDTO toDto(Grade grade);

    Grade toEntity(GradeDTO gradeDTO);
}
