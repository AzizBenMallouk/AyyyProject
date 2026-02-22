package com.youcode.mapper;

import com.youcode.dto.SquadDTO;
import com.youcode.entity.Squad;
import com.youcode.entity.User; // Added import for User
import org.mapstruct.Mapper;
import org.mapstruct.Mapping; // Added import for Mapping

@Mapper(componentModel = "spring")
public interface SquadMapper {

    @Mapping(target = "classroomId", source = "classroom.id")
    @Mapping(target = "sprintId", source = "sprint.id")
    @Mapping(target = "scrumMasterId", source = "scrumMaster.id")
    @Mapping(target = "scrumMasterName", source = "scrumMaster.name")
    @Mapping(target = "memberIds", source = "members", qualifiedByName = "mapMembersToIds")
    SquadDTO toDto(Squad squad);

    @Mapping(target = "classroom", ignore = true)
    @Mapping(target = "sprint", ignore = true)
    @Mapping(target = "members", ignore = true)
    @Mapping(target = "scrumMaster", ignore = true)
    Squad toEntity(SquadDTO squadDTO);

    @org.mapstruct.Named("mapMembersToIds")
    default java.util.List<Long> mapMembersToIds(java.util.Set<User> members) {
        if (members == null)
            return null;
        return members.stream().map(User::getId).collect(java.util.stream.Collectors.toList());
    }
}
