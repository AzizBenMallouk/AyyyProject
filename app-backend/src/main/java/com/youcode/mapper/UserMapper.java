package com.youcode.mapper;

import com.youcode.dto.UserDTO;
import com.youcode.entity.Role;
import com.youcode.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "password", ignore = true)
    @Mapping(target = "roleNames", source = "roles", qualifiedByName = "mapRoleNames")
    @Mapping(target = "roleIds", source = "roles", qualifiedByName = "mapRoleIds")
    @Mapping(target = "statusName", source = "status.name")
    @Mapping(target = "statusId", source = "status.id")
    @Mapping(target = "campusName", source = "campus.name")
    @Mapping(target = "campusId", source = "campus.id")
    @Mapping(target = "promotionName", source = "promotion.name")
    @Mapping(target = "promotionId", source = "promotion.id")
    @Mapping(target = "gradeName", source = "currentClassroom.grade.name")
    @Mapping(target = "gradeId", source = "currentClassroom.grade.id")
    @Mapping(target = "currentClassroomName", source = "currentClassroom.name")
    @Mapping(target = "currentClassroomId", source = "currentClassroom.id")
    UserDTO toDto(User user);

    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "campus", ignore = true)
    @Mapping(target = "promotion", ignore = true)
    @Mapping(target = "currentClassroom", ignore = true)
    @Mapping(target = "emailVerifiedAt", ignore = true)
    @Mapping(target = "rememberToken", ignore = true)
    @Mapping(target = "originalCity", ignore = true)
    @Mapping(target = "birthCity", ignore = true)
    @Mapping(target = "enrolls", ignore = true)
    @Mapping(target = "absences", ignore = true)
    @Mapping(target = "linkBrands", ignore = true)
    @Mapping(target = "points", ignore = true)
    @Mapping(target = "marketOrders", ignore = true)
    @Mapping(target = "permissions", ignore = true)
    @Mapping(target = "statusHistory", ignore = true)
    User toEntity(UserDTO userDTO);

    @Named("mapRoleNames")
    default List<String> mapRoleNames(Set<Role> roles) {
        if (roles == null)
            return null;
        return roles.stream().map(Role::getName).collect(Collectors.toList());
    }

    @Named("mapRoleIds")
    default List<Long> mapRoleIds(Set<Role> roles) {
        if (roles == null)
            return null;
        return roles.stream().map(Role::getId).collect(Collectors.toList());
    }
}
