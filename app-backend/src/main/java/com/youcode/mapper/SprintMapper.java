package com.youcode.mapper;

import com.youcode.dto.SprintDTO;
import com.youcode.entity.Sprint;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SprintMapper {

    @Mapping(target = "programId", source = "program.id")
    SprintDTO toDto(Sprint sprint);

    @Mapping(target = "program", ignore = true)
    Sprint toEntity(SprintDTO sprintDTO);
}
