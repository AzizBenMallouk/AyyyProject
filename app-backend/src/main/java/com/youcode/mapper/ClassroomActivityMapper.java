package com.youcode.mapper;

import com.youcode.dto.ClassroomActivityDTO;
import com.youcode.entity.ClassroomActivity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ClassroomActivityMapper {

    @Mapping(target = "classroomId", source = "classroom.id")
    @Mapping(target = "classroomName", source = "classroom.name")
    @Mapping(target = "sprintId", source = "sprint.id")
    @Mapping(target = "parentActivityId", source = "parentActivity.id")
    @Mapping(target = "type", source = "activityType.name")
    @Mapping(target = "typeId", source = "activityType.id")
    @Mapping(target = "dueDate", source = "deadline")
    @Mapping(target = "targetIds", ignore = true)
    ClassroomActivityDTO toDto(ClassroomActivity classroomActivity);

    @Mapping(target = "classroom", ignore = true)
    @Mapping(target = "sprint", ignore = true)
    @Mapping(target = "parentActivity", ignore = true)
    @Mapping(target = "activityType", ignore = true)
    @Mapping(target = "deadline", source = "dueDate")
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "activityDatetime", ignore = true)
    ClassroomActivity toEntity(ClassroomActivityDTO classroomActivityDTO);
}
