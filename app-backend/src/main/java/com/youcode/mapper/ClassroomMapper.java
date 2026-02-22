package com.youcode.mapper;

import com.youcode.dto.ClassroomDTO;
import com.youcode.entity.Classroom;
import com.youcode.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface ClassroomMapper {

    @Mapping(target = "programId", source = "program.id")
    @Mapping(target = "programTitle", source = "program.title")
    @Mapping(target = "gradeId", source = "grade.id")
    @Mapping(target = "gradeName", source = "grade.name")
    @Mapping(target = "trainerId", source = "trainer.id")
    @Mapping(target = "trainerName", source = "trainer", qualifiedByName = "mapUserName")
    @Mapping(target = "campusId", source = "campus.id")
    @Mapping(target = "campusName", source = "campus.name")
    @Mapping(target = "promotionId", source = "promotion.id")
    @Mapping(target = "promotionName", source = "promotion.name")
    @Mapping(target = "cmeId", source = "cme.id")
    @Mapping(target = "cmeName", source = "cme", qualifiedByName = "mapUserName")
    @Mapping(target = "delegateId", source = "delegate.id")
    @Mapping(target = "delegateName", source = "delegate", qualifiedByName = "mapUserName")
    @Mapping(target = "enrolledCount", ignore = true)
    @Mapping(target = "activitiesCount", expression = "java(classroom.getActivities() != null ? classroom.getActivities().size() : 0)")
    @Mapping(target = "studentIds", ignore = true)
    @Mapping(target = "currentSprint", ignore = true)
    ClassroomDTO toDto(Classroom classroom);

    @Mapping(target = "grade", ignore = true)
    @Mapping(target = "trainer", ignore = true)
    @Mapping(target = "campus", ignore = true)
    @Mapping(target = "promotion", ignore = true)
    @Mapping(target = "cme", ignore = true)
    @Mapping(target = "delegate", ignore = true)
    @Mapping(target = "program", ignore = true)
    @Mapping(target = "enrolls", ignore = true)
    @Mapping(target = "activities", ignore = true)
    @Mapping(target = "active", ignore = true) // Ignore active in entity from DTO for now as DTO doesn't have it
    Classroom toEntity(ClassroomDTO classroomDTO);

    @Named("mapUserName")
    default String mapUserName(User user) {
        if (user == null)
            return null;
        return user.getFirstName() + " " + user.getLastName();
    }
}
