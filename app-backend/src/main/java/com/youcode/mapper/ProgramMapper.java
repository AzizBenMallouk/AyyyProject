package com.youcode.mapper;

import com.youcode.dto.ProgramDTO;
import com.youcode.entity.Program;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { SprintMapper.class })
public interface ProgramMapper {

    @Mapping(target = "history", ignore = true) // History is usually handled in service
    ProgramDTO toDto(Program program);

    @Mapping(target = "parentId", ignore = true)
    Program toEntity(ProgramDTO programDTO);
}
