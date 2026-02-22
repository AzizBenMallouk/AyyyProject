package com.youcode.mapper;

import com.youcode.dto.ActivityCommentDTO;
import com.youcode.entity.ActivityComment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ActivityCommentMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.name")
    @Mapping(target = "assignmentId", source = "assignment.id")
    @Mapping(target = "userImage", ignore = true)
    ActivityCommentDTO toDto(ActivityComment activityComment);

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "assignment", ignore = true)
    ActivityComment toEntity(ActivityCommentDTO activityCommentDTO);
}
