package com.youcode.mapper;

import com.youcode.dto.EnrollDTO;
import com.youcode.entity.Enroll;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EnrollMapper {

    @Mapping(target = "learnerId", source = "learner.id")
    @Mapping(target = "learnerName", source = "learner.name")
    @Mapping(target = "learnerEmail", source = "learner.email")
    @Mapping(target = "classroomId", source = "classroom.id")
    @Mapping(target = "classroomName", source = "classroom.name")
    @Mapping(target = "squadId", source = "squad.id")
    @Mapping(target = "squadName", source = "squad.name")
    @Mapping(target = "enrolledAt", source = "enrollDate")
    EnrollDTO toDto(Enroll enroll);

    @Mapping(target = "learner", ignore = true)
    @Mapping(target = "classroom", ignore = true)
    @Mapping(target = "squad", ignore = true)
    @Mapping(target = "enrollDate", source = "enrolledAt")
    @Mapping(target = "endDate", ignore = true)
    Enroll toEntity(EnrollDTO enrollDTO);
}
